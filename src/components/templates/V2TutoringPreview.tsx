"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { BookOpen, GraduationCap, MathOperations, Atom, Translate, Code, Brain, Star, ShieldCheck, Clock, Phone, MapPin, ArrowRight, CheckCircle, CaretDown, List, X, Users, ChalkboardTeacher } from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const DEFAULT_BLUE = "#1e40af";
const GREEN = "#22c55e";
const BG = "#0a0f1a";

function getAccent(c?: string) { const a = c || DEFAULT_BLUE; return { ACCENT: a, ACCENT_GLOW: `${a}26` }; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, any> = { math: MathOperations, algebra: MathOperations, calcul: MathOperations, science: Atom, biology: Atom, chem: Atom, physic: Atom, sat: GraduationCap, act: GraduationCap, test: GraduationCap, prep: GraduationCap, language: Translate, spanish: Translate, french: Translate, esl: Translate, cod: Code, program: Code, computer: Code, special: Brain, adhd: Brain, dyslexia: Brain, read: BookOpen, writ: BookOpen, english: BookOpen };
function getServiceIcon(n: string) { const l = n.toLowerCase(); for (const [k, I] of Object.entries(ICON_MAP)) { if (l.includes(k)) return I; } return BookOpen; }

const STOCK_HERO_POOL = ["https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&q=80"];
const STOCK_ABOUT_POOL = ["https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80"];

function FloatingSparks({ accent }: { accent: string }) {
  const ps = Array.from({ length: 18 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 8, dur: 5 + Math.random() * 7, size: 2 + Math.random() * 3, op: 0.12 + Math.random() * 0.3, isGreen: Math.random() > 0.5 }));
  return <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">{ps.map((p) => <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isGreen ? GREEN : accent, willChange: "transform, opacity" }} animate={{ y: ["-10vh", "110vh"], opacity: [0, p.op, p.op, 0] }} transition={{ y: { duration: p.dur, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.dur, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }} />)}</div>;
}

function NotebookPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const pid = `notebookV2Prev-${accent.replace("#", "")}`;
  return <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}><defs><pattern id={pid} width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke={accent} strokeWidth="0.3" /><circle cx="5" cy="20" r="1.5" fill={GREEN} opacity="0.3" /></pattern></defs><rect width="100%" height="100%" fill={`url(#${pid})`} /></svg>;
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


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ ANIMATED SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function V2TutoringPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);
  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];

  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);

  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);

  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);

  const approach = [
    { step: "01", title: "Assessment", desc: "Comprehensive diagnostic to identify strengths and gaps." },
    { step: "02", title: "Custom Plan", desc: "Personalized learning plan aligned with goals and curriculum." },
    { step: "03", title: "1-on-1 Tutoring", desc: "Expert tutors deliver engaging, interactive sessions." },
    { step: "04", title: "Progress Tracking", desc: "Regular reports and measurable improvement." },
  ];

  const faqs = [
    { q: `What subjects does ${data.businessName} cover?`, a: `We offer tutoring in ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Contact us for a free assessment.` },
    { q: "How are tutors selected?", a: `All ${data.businessName} tutors hold degrees in their subject area and complete our rigorous training program.` },
    { q: "What's the session format?", a: "Sessions are typically 60 minutes, available in-person or online. We recommend 1-2 sessions per week." },
    { q: "Do you offer group rates?", a: "Yes! We offer small group sessions and family discounts for siblings. Contact us for pricing." },
  ];

  const fallbackTestimonials = [{ name: "Melissa H.", text: "My son's math grade went from a C to an A in just two months. The tutors here are exceptional.", rating: 5 }, { name: "Brandon K.", text: "SAT prep here boosted my score by 200 points. The strategies they teach really work.", rating: 5 }, { name: "Irene S.", text: "Patient, encouraging, and effective. My daughter actually enjoys studying now.", rating: 5 }];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ fontFamily: "Open Sans, system-ui, sans-serif", background: BG, color: "#f1f5f9" }}>
      <FloatingSparks accent={ACCENT} />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50"><div className="mx-auto max-w-7xl px-4 md:px-6 py-4"><GlassCard className="flex items-center justify-between px-4 md:px-6 py-3"><div className="flex items-center gap-2"><BookOpen size={24} weight="fill" style={{ color: ACCENT }} /><span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span></div><div className="hidden md:flex items-center gap-8 text-sm text-slate-400"><a href="#subjects" className="hover:text-white transition-colors">Subjects</a><a href="#about" className="hover:text-white transition-colors">About</a><a href="#approach" className="hover:text-white transition-colors">Approach</a><a href="#contact" className="hover:text-white transition-colors">Contact</a></div><div className="flex items-center gap-3"><MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Free Assessment</MagneticButton><button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button></div></GlassCard>
        <AnimatePresence>{mobileMenuOpen && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden mt-2 overflow-hidden"><GlassCard className="flex flex-col gap-1 px-4 py-4">{["Subjects", "About", "Approach", "Contact"].map((l) => <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{l}</a>)}</GlassCard></motion.div>}</AnimatePresence>
      </div></nav>

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
        <NotebookPattern opacity={0.04} accent={ACCENT} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: GREEN }}>
                Expert Tutoring
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
                "Certified Tutors",
                `${data.googleRating || "5.0"}-Star Rated`,
                "Free Assessment",
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
                Free Assessment <ArrowRight size={18} weight="bold" />
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
                {data.hours || "In-Person & Online"}
              </span>
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
                  <GraduationCap size={18} weight="fill" style={{ color: GREEN }} />
                  <span className="text-sm font-semibold text-white">Proven Results</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #0c1220 0%, ${BG} 100%)` }} />
        <NotebookPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10"><div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {data.stats.map((stat, i) => { const icons = [BookOpen, CheckCircle, GraduationCap, Star]; const Icon = icons[i % icons.length]; return <div key={stat.label} className="text-center"><div className="flex items-center justify-center gap-2 mb-2"><Icon size={22} weight="fill" style={{ color: ACCENT }} /><span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span></div><span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span></div>; })}
        </div></div>
      </section>

      {/* SUBJECTS */}
      <section id="subjects" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <NotebookPattern accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Subjects" title="What We Teach" subtitle={`${data.businessName} offers expert tutoring across all subjects and grade levels.`} accent={ACCENT} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{data.services.map((svc, i) => { const Icon = getServiceIcon(svc.name); return <div key={svc.name} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]"><div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} /><div className="relative z-10"><div className="flex items-start justify-between mb-5"><div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}><Icon size={24} weight="duotone" style={{ color: ACCENT }} /></div><span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span></div><h3 className="text-lg font-bold text-white mb-2">{svc.name}</h3><p className="text-sm text-slate-400 leading-relaxed">{svc.description || ""}</p>{svc.price && <p className="text-sm font-semibold mt-3" style={{ color: ACCENT }}>{svc.price}</p>}</div></div>; })}</div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1220 50%, ${BG} 100%)` }}
        />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/15">
                <img
                  src={aboutImage}
                  alt={data.businessName}
                  className="w-full h-[400px] object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div
                  className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg"
                  style={{
                    background: `${ACCENT}e6`,
                    borderColor: `${ACCENT}80`,
                  }}
                >
                  {data.stats[0]
                    ? `${data.stats[0].value} ${data.stats[0].label}`
                    : "Proven Results"}
                </div>
              </div>
            </div>
            <div>
              <span
                className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
                style={{
                  color: ACCENT,
                  borderColor: `${ACCENT}33`,
                  background: `${ACCENT}0d`,
                }}
              >
                About Us
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">
                Building Confidence Through Learning
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: GraduationCap, label: "Certified Tutors" },
                  { icon: CheckCircle, label: "Proven Methods" },
                  { icon: Star, label: "5-Star Rated" },
                  { icon: Users, label: "All Ages K-12" },
                ].map((b) => (
                  <GlassCard key={b.label} className="p-4 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: ACCENT_GLOW }}
                    >
                      <b.icon size={20} weight="duotone" style={{ color: ACCENT }} />
                    </div>
                    <span className="text-sm font-semibold text-white">{b.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APPROACH */}
      <section id="approach" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <NotebookPattern opacity={0.025} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Our Approach" title="How We Help Students Succeed" accent={ACCENT} /></AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">{approach.map((step, i) => <div key={step.step} className="relative">{i < approach.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)` }} />}<GlassCard className="p-6 text-center relative"><div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, color: ACCENT, border: `1px solid ${ACCENT}33` }}>{step.step}</div><h3 className="text-lg font-bold text-white mb-2">{step.title}</h3><p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p></GlassCard></div>)}</div>
        </div>
      </section>

      {/* GRADE LEVELS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1220 50%, ${BG} 100%)` }} />
        <NotebookPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader
              badge="Grade Levels"
              title="We Tutor All Ages"
              subtitle="From elementary foundations to college-level coursework."
              accent={ACCENT}
            />
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { level: "K-5", label: "Elementary", desc: "Build strong foundations in reading, writing, and math." },
              { level: "6-8", label: "Middle School", desc: "Bridge the gap with pre-algebra, science, and study skills." },
              { level: "9-12", label: "High School", desc: "AP courses, SAT/ACT prep, and college readiness." },
              { level: "18+", label: "College & Adult", desc: "University coursework support and professional development." },
            ].map((item) => (
              <GlassCard key={item.level} className="p-6 text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-black"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`,
                    color: ACCENT,
                    border: `1px solid ${ACCENT}33`,
                  }}
                >
                  {item.level}
                </div>
                <h3 className="text-base font-bold text-white mb-1">{item.label}</h3>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Results" title="Real Score Improvements" accent={ACCENT} />
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { student: "Emma T.", subject: "SAT Math", before: "580", after: "720", improvement: "+140 pts" },
              { student: "Marcus J.", subject: "Algebra II", before: "C-", after: "A", improvement: "2 letter grades" },
              { student: "Sophia R.", subject: "ACT Composite", before: "24", after: "31", improvement: "+7 pts" },
            ].map((story) => (
              <GlassCard key={story.student} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-white">{story.student}</span>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ color: GREEN, background: `${GREEN}1a`, border: `1px solid ${GREEN}33` }}
                  >
                    {story.improvement}
                  </span>
                </div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">{story.subject}</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 text-center p-3 rounded-xl bg-white/[0.07] border border-white/8">
                    <p className="text-xs text-slate-500 mb-1">Before</p>
                    <p className="text-lg font-bold text-slate-400">{story.before}</p>
                  </div>
                  <ArrowRight size={20} style={{ color: ACCENT }} />
                  <div className="flex-1 text-center p-3 rounded-xl" style={{ background: `${ACCENT}0d`, border: `1px solid ${ACCENT}33` }}>
                    <p className="text-xs mb-1" style={{ color: ACCENT }}>After</p>
                    <p className="text-lg font-bold text-white">{story.after}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1220 50%, ${BG} 100%)` }} />
        <NotebookPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader
              badge="Pricing"
              title="Tutoring Investment"
              subtitle="Flexible plans to fit every family's needs."
              accent={ACCENT}
            />
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Single Session", price: "$65", desc: "One 60-minute session, any subject" },
              { name: "Monthly Plan", price: "$225", desc: "4 sessions per month, priority scheduling", popular: true },
              { name: "Test Prep Package", price: "$499", desc: "8 sessions + practice tests + strategies" },
            ].map((tier, i) => (
              <GlassCard
                key={tier.name}
                className={`p-8 text-center ${tier.popular ? "ring-2 ring-offset-2 ring-offset-[#0a0f1a]" : ""}`}
              >
                {tier.popular && (
                  <span
                    className="inline-block text-xs font-bold uppercase tracking-wider mb-4 px-3 py-1 rounded-full text-white"
                    style={{ background: ACCENT }}
                  >
                    Best Value
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
                  Get Started
                </MagneticButton>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Compare" title={`${data.businessName} vs. The Alternatives`} accent={ACCENT} />
          </AnimatedSection>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="text-left p-4 text-slate-400 font-medium">Feature</th>
                    <th className="text-center p-4 font-bold text-white">{data.businessName}</th>
                    <th className="text-center p-4 text-slate-400 font-medium">Online Apps</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "1-on-1 Personalized Instruction", them: "AI/Automated" },
                    { feature: "Certified Subject Experts", them: "Varies" },
                    { feature: "Customized Learning Plan", them: "Generic" },
                    { feature: "Progress Reports to Parents", them: "Rarely" },
                    { feature: "In-Person or Online Options", them: "Online Only" },
                    { feature: "Test Prep Strategies", them: "Limited" },
                    { feature: "Schedule Flexibility", them: "Fixed" },
                  ].map((row, i) => (
                    <tr key={row.feature} className={i < 6 ? "border-b border-white/8" : ""}>
                      <td className="p-4 text-slate-300">{row.feature}</td>
                      <td className="p-4 text-center">
                        <CheckCircle size={20} weight="fill" style={{ color: "#22c55e" }} className="mx-auto" />
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
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1220 50%, ${BG} 100%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="See How It Works" title="A Peek Inside Our Sessions" accent={ACCENT} />
          </AnimatedSection>
          <div className="relative rounded-2xl overflow-hidden border border-white/15 group cursor-pointer">
            <img src={heroImage} alt="Watch tutoring sessions" className="w-full h-[400px] object-cover" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center group-hover:bg-black/50 transition-colors">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}cc` }}>
                <GraduationCap size={40} weight="fill" className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUIZ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <NotebookPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Quick Check" title="What Does Your Student Need?" accent={ACCENT} />
          </AnimatedSection>
          <div className="grid gap-4">
            {[
              { label: "Falling behind in class", color: "#ef4444", urgency: "Urgent", rec: "Targeted catch-up sessions to close knowledge gaps before they widen." },
              { label: "Preparing for SAT/ACT", color: "#f59e0b", urgency: "Test Prep", rec: "Our test prep package includes strategies, practice tests, and score improvement tracking." },
              { label: "Wants to get ahead", color: "#22c55e", urgency: "Enrichment", rec: "Advanced coursework and challenge problems to keep motivated students engaged." },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setOpenFaq(opt.label === "Falling behind in class" ? 99 : opt.label === "Preparing for SAT/ACT" ? 98 : 97)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${openFaq === (opt.label === "Falling behind in class" ? 99 : opt.label === "Preparing for SAT/ACT" ? 98 : 97) ? "border-white/30 bg-white/[0.06]" : "border-white/15 bg-white/[0.07] hover:bg-white/[0.07]"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">{opt.label}</span>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ color: opt.color, background: `${opt.color}1a`, border: `1px solid ${opt.color}33` }}
                  >
                    {opt.urgency}
                  </span>
                </div>
                {openFaq === (opt.label === "Falling behind in class" ? 99 : opt.label === "Preparing for SAT/ACT" ? 98 : 97) && (
                  <p className="text-sm text-slate-400 mt-3">{opt.rec}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* GOOGLE REVIEWS + TESTIMONIALS */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1220 50%, ${BG} 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Testimonials" title="Parent & Student Reviews" accent={ACCENT} />
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
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Location" title="Where We Tutor" accent={ACCENT} />
          </AnimatedSection>
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg mb-3">
                <MapPin size={24} weight="duotone" style={{ color: ACCENT }} />
                <MapLink address={data.address} className="text-white font-semibold" />
              </div>
              <p className="text-slate-400 text-sm mb-4">In-Person & Online Sessions Available</p>
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: "#22c55e" }}
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm font-semibold" style={{ color: "#22c55e" }}>
                  Accepting New Students
                </span>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* CERTIFICATIONS BADGES */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-4">
            {["Certified Tutors", "Background Checked", "All Subjects K-12", "SAT/ACT Prep", "Online Available", "Flexible Schedule"].map((cert) => (
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

      {/* FAQ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <NotebookPattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} /></AnimatedSection>
          <div className="space-y-3">{faqs.map((f, i) => <AccordionItem key={i} question={f.q} answer={f.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}</div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 overflow-hidden"><div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)` }} /><div className="max-w-4xl mx-auto px-6 relative z-10 text-center"><GraduationCap size={48} weight="fill" className="mx-auto mb-6 text-white/70" /><h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Start with a Free Assessment</h2><p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Discover your child&apos;s strengths and get a personalized learning plan.</p><PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors"><Phone size={20} weight="fill" /> {data.phone}</PhoneLink></div></section>

      {/* CONTACT */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1220 50%, ${BG} 100%)` }}
        />
        <NotebookPattern opacity={0.02} accent={ACCENT} />
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
                Get Started Today
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Contact {data.businessName} to schedule a free assessment.
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
              <h3 className="text-xl font-semibold text-white mb-6">
                Request Free Assessment
              </h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Parent Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Student Grade</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm"
                      placeholder="e.g., 8th grade"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm"
                    placeholder="(206) 287-2304"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Subject</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select subject</option>
                    {data.services.map((s) => (
                      <option key={s.name} value={s.name.toLowerCase()} className="bg-neutral-900">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Goals</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none text-sm resize-none"
                    placeholder="What are your student's goals?"
                  />
                </div>
                <MagneticButton
                  className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: ACCENT } as React.CSSProperties}
                >
                  Get Free Assessment <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="relative z-10 py-16 overflow-hidden"><div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 100%)` }} /><div className="max-w-4xl mx-auto px-6 relative z-10 text-center"><ShimmerBorder accent={ACCENT}><div className="p-8 md:p-12"><ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" /><h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Grade Improvement Guarantee</h2><p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">{data.businessName} guarantees measurable academic improvement through personalized, expert tutoring.</p><div className="flex flex-wrap justify-center gap-4 mt-8">{["Certified Tutors", "Free Assessment", "Grade Guarantee", "Flexible Scheduling"].map((item) => <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}><CheckCircle size={16} weight="fill" /> {item}</span>)}</div></div></ShimmerBorder></div></section>

      {/* CURRICULUM DETAIL */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <BookOpen size={40} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Curriculum & Subjects</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Our tutors follow proven curricula aligned with state standards and school district requirements.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { subject: "Mathematics", icon: MathOperations, topics: "Algebra, Geometry, Calculus, Statistics, Pre-Calc" },
              { subject: "Science", icon: Atom, topics: "Biology, Chemistry, Physics, Environmental Science" },
              { subject: "English & Writing", icon: BookOpen, topics: "Essay Writing, Grammar, Literature, SAT Prep" },
              { subject: "Foreign Languages", icon: Translate, topics: "Spanish, French, Mandarin, ESL/ELL Support" },
              { subject: "Computer Science", icon: Code, topics: "Python, Java, AP CS, Web Development" },
              { subject: "Test Preparation", icon: GraduationCap, topics: "SAT, ACT, GRE, GMAT, AP Exams" },
            ].map((s) => (
              <div key={s.subject} className="rounded-2xl border border-white/15 p-6" style={{ background: "rgba(255,255,255,0.06)" }}>
                <s.icon size={28} weight="duotone" style={{ color: ACCENT }} className="mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">{s.subject}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.topics}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARENT RESOURCES */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #0c1220 0%, ${BG} 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <Users size={40} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Parent Resources</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">We keep parents informed and involved every step of the way.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: "Progress Reports", desc: "Receive detailed session summaries after every tutoring session with specific feedback on strengths and areas for improvement." },
              { title: "Parent-Tutor Conferences", desc: "Schedule regular check-ins with your child's tutor to discuss goals, progress, and strategies for continued growth." },
              { title: "Homework Support Guides", desc: "Access our curated library of study guides, practice worksheets, and test prep materials tailored to your child's grade level." },
              { title: "College Planning Resources", desc: "For high schoolers, get guidance on college applications, scholarship essays, and standardized test timelines." },
            ].map((r) => (
              <div key={r.title} className="rounded-2xl border border-white/15 p-6" style={{ background: "rgba(255,255,255,0.06)" }}>
                <CheckCircle size={24} weight="fill" style={{ color: ACCENT }} className="mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">{r.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STUDY TIPS */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <Brain size={40} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Study Tips from Our Tutors</h2>
            <div className="w-16 h-1 mx-auto mt-3 rounded-full" style={{ background: ACCENT }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { tip: "Active Recall", desc: "Test yourself instead of re-reading notes. Practice retrieval builds stronger memory pathways." },
              { tip: "Spaced Repetition", desc: "Review material at increasing intervals. Short daily sessions beat marathon cramming every time." },
              { tip: "Teach Someone Else", desc: "Explaining a concept to someone else is the best way to identify gaps in your understanding." },
              { tip: "Eliminate Distractions", desc: "Put your phone in another room. Even having it face-down on the desk reduces focus by 20%." },
            ].map((t) => (
              <div key={t.tip} className="rounded-2xl border border-white/15 p-5 text-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                <h3 className="text-sm font-bold text-white mb-2">{t.tip}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MID-PAGE CTA */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}15 0%, ${BG} 50%, ${ACCENT}08 100%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <GraduationCap size={44} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to See Grades Improve?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-lg leading-relaxed">
            Start with a free academic assessment. Our team at {data.businessName} will identify your child&apos;s strengths and create a personalized learning plan.
          </p>
          <a href={`tel:${data.phone}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg transition-transform hover:scale-105" style={{ background: ACCENT }}>
            <Phone size={20} weight="fill" /> Schedule Free Assessment
          </a>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Why Families Choose <span style={{ color: ACCENT }}>{data.businessName}</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: "Expert Tutors", desc: "All tutors hold advanced degrees and pass rigorous screening before joining our team" },
              { title: "Personalized Plans", desc: "Every student gets a custom learning plan based on diagnostic assessment results" },
              { title: "Flexible Scheduling", desc: "In-person or online sessions available 7 days a week to fit your family's schedule" },
              { title: "Proven Results", desc: "Students average 1.5 letter grade improvement within the first 3 months of tutoring" },
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

      {/* CERTIFICATIONS */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #0c1220 0%, ${BG} 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-8">
            <ShieldCheck size={36} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Our Qualifications</h2>
            <p className="text-slate-400 mt-2 max-w-lg mx-auto">
              Every tutor at {data.businessName} is vetted, credentialed, and committed to student success.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              "State Certified",
              "Background Checked",
              "Subject Matter Experts",
              "SAT/ACT Specialists",
              "Free Assessment",
              "Satisfaction Guaranteed",
            ].map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-2 px-5 py-3 rounded-full border border-white/15"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <ShieldCheck size={18} weight="fill" style={{ color: ACCENT }} />
                <span className="text-sm font-medium text-white">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${BG} 0%, #060a12 100%)` }}
        />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={22} weight="fill" style={{ color: ACCENT }} />
                <span className="text-lg font-bold text-white">{data.businessName}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {data.about.length > 120
                  ? data.about.slice(0, 120).trim() + "..."
                  : data.about}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2">
                {["Subjects", "About", "Approach", "Contact"].map((l) => (
                  <a
                    key={l}
                    href={`#${l.toLowerCase()}`}
                    className="block text-sm text-slate-500 hover:text-white transition-colors"
                  >
                    {l}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p>
                  <PhoneLink phone={data.phone} />
                </p>
                <p>
                  <MapLink address={data.address} />
                </p>
                {data.socialLinks &&
                  Object.entries(data.socialLinks).map(([p, url]) => (
                    <a
                      key={p}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:text-white transition-colors capitalize"
                    >
                      {p}
                    </a>
                  ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <BookOpen size={14} weight="fill" style={{ color: ACCENT }} />
              <span>
                {data.businessName} &copy; {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <BluejayLogo className="w-4 h-4" />
              <span>
                Built by{" "}
                <a
                  href="https://bluejayportfolio.com/audit"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "underline" }}
                >
                  BlueJays
                </a>{" "}
                — get your free site audit
              </span>
            </div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
