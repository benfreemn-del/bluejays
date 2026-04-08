"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useInView, AnimatePresence } from "framer-motion";
import { BookOpen, GraduationCap, MathOperations, Atom, Translate, Code, Brain, Star, ShieldCheck, Clock, Phone, MapPin, ArrowRight, CheckCircle, CaretDown, List, X, Users, Quotes, ChalkboardTeacher } from "@phosphor-icons/react";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: spring } };

const BLUE = "#1e40af";
const GREEN = "#22c55e";
const BG = "#0a0f1a";

function FloatingParticles() {
  const ps = Array.from({ length: 20 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 8, dur: 6 + Math.random() * 6, size: 2 + Math.random() * 3, op: 0.12 + Math.random() * 0.25, isGreen: Math.random() > 0.5 }));
  return <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">{ps.map((p) => <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isGreen ? GREEN : BLUE, willChange: "transform, opacity" }} animate={{ y: ["-10vh", "110vh"], opacity: [0, p.op, p.op, 0] }} transition={{ y: { duration: p.dur, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.dur, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }} />)}</div>;
}

function NotebookPattern({ opacity = 0.03 }: { opacity?: number }) {
  return <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}><defs><pattern id="notebookGrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke={BLUE} strokeWidth="0.3" /><circle cx="5" cy="20" r="1.5" fill={GREEN} opacity="0.3" /></pattern></defs><rect width="100%" height="100%" fill="url(#notebookGrid)" /></svg>;
}

function GlassCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) { return <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`} style={style}>{children}</div>; }
function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) { const ref = useRef(null); const isInView = useInView(ref, { once: true, margin: "-80px" }); return <motion.section ref={ref} id={id} className={className} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>{children}</motion.section>; }
function WordReveal({ text, className = "" }: { text: string; className?: string }) { const ref = useRef(null); const isInView = useInView(ref, { once: true, margin: "-50px" }); return <motion.span ref={ref} className={`inline-flex flex-wrap gap-x-3 ${className}`} variants={stagger} initial="hidden" animate={isInView ? "show" : "hidden"}>{text.split(" ").map((w, i) => <motion.span key={i} variants={fadeUp} className="inline-block">{w}</motion.span>)}</motion.span>; }

function MagneticButton({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null); const x = useMotionValue(0); const y = useMotionValue(0); const sx = useSpring(x, springFast); const sy = useSpring(y, springFast);
  const isTD = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const mm = useCallback((e: React.MouseEvent) => { if (!ref.current || isTD) return; const r = ref.current.getBoundingClientRect(); x.set((e.clientX - (r.left + r.width / 2)) * 0.25); y.set((e.clientY - (r.top + r.height / 2)) * 0.25); }, [x, y, isTD]);
  const ml = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return <motion.button ref={ref} style={{ x: sx, y: sy, willChange: "transform", ...style }} onMouseMove={mm} onMouseLeave={ml} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}><motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${BLUE}, transparent, ${GREEN}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} /><div className="relative rounded-2xl bg-[#0a0f1a] z-10">{children}</div></div>; }

const services = [
  { name: "Mathematics", desc: "From basic arithmetic to calculus and statistics — we make math click. All levels, all ages.", icon: MathOperations },
  { name: "Science", desc: "Biology, chemistry, physics, and AP sciences taught through hands-on experiments and real-world applications.", icon: Atom },
  { name: "SAT/ACT Prep", desc: "Proven test prep strategies that boost scores by an average of 200+ points. Practice tests and personalized study plans.", icon: GraduationCap },
  { name: "Languages", desc: "Spanish, French, Mandarin, and ESL tutoring with native-level speakers. Conversational and academic tracks.", icon: Translate },
  { name: "Coding & CS", desc: "Python, JavaScript, AP Computer Science, and robotics for K-12 students entering the digital age.", icon: Code },
  { name: "Special Needs", desc: "Specialized tutoring for students with ADHD, dyslexia, and learning differences. Patience-first approach.", icon: Brain },
];

const stats = [{ value: "3,000+", label: "Students Tutored" }, { value: "95%", label: "Grade Improvement" }, { value: "200+", label: "Avg SAT Boost" }, { value: "4.9★", label: "Parent Rating" }];

const approach = [
  { step: "01", title: "Assessment", desc: "We evaluate learning style, strengths, and gaps with a comprehensive diagnostic." },
  { step: "02", title: "Custom Plan", desc: "Your child gets a personalized learning plan aligned with school curriculum and goals." },
  { step: "03", title: "1-on-1 Tutoring", desc: "Expert tutors deliver engaging, interactive sessions tailored to your child's pace." },
  { step: "04", title: "Progress Tracking", desc: "Regular reports, parent conferences, and measurable academic improvement." },
];

const testimonials = [
  { name: "Jennifer P.", text: "My daughter went from a C- to an A in algebra in just two months. The tutors here genuinely care about each student's success.", rating: 5 },
  { name: "David & Kim L.", text: "SAT prep was a game-changer. Our son's score jumped 280 points and he got into his top-choice school. Worth every penny.", rating: 5 },
  { name: "Maria G.", text: "As a parent of a child with ADHD, finding the right support was crucial. They understand learning differences and my son actually enjoys his sessions.", rating: 5 },
];

const faqs = [
  { q: "What ages and grades do you tutor?", a: "We tutor students from kindergarten through 12th grade, plus college-level support for select subjects. Our tutors are matched based on age and subject expertise." },
  { q: "How are tutors selected?", a: "All tutors hold bachelor's degrees or higher in their subject area, pass background checks, and complete our training program. Many are certified teachers." },
  { q: "What's the session format?", a: "Sessions are 60 minutes, available in-person or online. We recommend 1-2 sessions per week for optimal progress, with homework support between sessions." },
  { q: "Do you offer group rates?", a: "Yes! We offer small group sessions (2-4 students) at discounted rates. Family discounts are also available for siblings." },
];

const pricing = [
  { name: "Single Session", price: "$65/hr", desc: "Perfect for homework help or one-time needs" },
  { name: "Monthly Package", price: "$220/mo", desc: "4 sessions per month — most popular" },
  { name: "Intensive Prep", price: "$450", desc: "8-week SAT/ACT program with practice tests" },
];

export default function V2TutoringShowcase() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingParticles />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50"><div className="mx-auto max-w-7xl px-4 md:px-6 py-4"><GlassCard className="flex items-center justify-between px-4 md:px-6 py-3"><div className="flex items-center gap-2"><BookOpen size={24} weight="fill" style={{ color: BLUE }} /><span className="text-lg font-bold tracking-tight text-white">Bright Minds Tutoring</span></div><div className="hidden md:flex items-center gap-8 text-sm text-slate-400"><a href="#subjects" className="hover:text-white transition-colors">Subjects</a><a href="#approach" className="hover:text-white transition-colors">Approach</a><a href="#about" className="hover:text-white transition-colors">About</a><a href="#contact" className="hover:text-white transition-colors">Contact</a></div><div className="flex items-center gap-3"><MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: BLUE }}>Free Assessment</MagneticButton><button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button></div></GlassCard>
        <AnimatePresence>{mobileMenuOpen && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden mt-2 overflow-hidden"><GlassCard className="flex flex-col gap-1 px-4 py-4">{["Subjects", "Approach", "About", "Contact"].map((l) => <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{l}</a>)}</GlassCard></motion.div>}</AnimatePresence>
      </div></nav>

      {/* HERO */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #0c1528 0%, ${BG} 50%, #0d1220 100%)` }} />
        <NotebookPattern opacity={0.05} />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${BLUE}0a` }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${GREEN}08` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div><p className="text-sm uppercase tracking-widest mb-4" style={{ color: GREEN }}>Expert Tutoring Services</p><h1 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}><WordReveal text="Every Student Can Succeed" /></h1></div>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">Personalized 1-on-1 tutoring in math, science, SAT prep, coding, and more. We build confidence and academic skills that last.</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: BLUE }}>Free Assessment <ArrowRight size={18} weight="bold" /></MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer"><Phone size={18} weight="duotone" /> (425) 555-0312</MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400"><span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: BLUE }} /> Redmond, WA</span><span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: BLUE }} /> In-Person &amp; Online</span></div>
          </div>
          <div className="hidden md:block relative"><div className="relative rounded-2xl overflow-hidden border border-white/10"><img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&q=80" alt="Tutoring session" className="w-full h-[500px] object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-transparent" /><div className="absolute bottom-6 left-6"><div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${BLUE}4d` }}><GraduationCap size={18} weight="fill" style={{ color: GREEN }} /><span className="text-sm font-semibold text-white">95% Grade Improvement</span></div></div></div></div>
        </div>
      </section>

      {/* STATS */}
      <SectionReveal className="relative z-10 py-16 overflow-hidden border-y" >
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #0c1220 0%, ${BG} 100%)` }} />
        <NotebookPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10"><div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => { const icons = [BookOpen, CheckCircle, GraduationCap, Star]; const Icon = icons[i]; return <div key={stat.label} className="text-center"><div className="flex items-center justify-center gap-2 mb-2"><Icon size={22} weight="fill" style={{ color: BLUE }} /><span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span></div><span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span></div>; })}
        </div></div>
      </SectionReveal>

      {/* SUBJECTS */}
      <SectionReveal id="subjects" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <NotebookPattern />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16"><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>Subjects</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">What We Teach</h2><div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${BLUE}, transparent)` }} /></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => { const Icon = svc.icon; return (
              <div key={svc.name} className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${BLUE}15, transparent 70%)` }} />
                <div className="relative z-10"><div className="flex items-start justify-between mb-5"><div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: `${BLUE}26`, borderColor: `${BLUE}33` }}><Icon size={24} weight="duotone" style={{ color: BLUE }} /></div><span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span></div><h3 className="text-lg font-bold text-white mb-2">{svc.name}</h3><p className="text-sm text-slate-400 leading-relaxed">{svc.desc}</p></div>
              </div>
            ); })}
          </div>
        </div>
      </SectionReveal>

      {/* ABOUT */}
      <SectionReveal id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1220 50%, ${BG} 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10"><div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative"><div className="rounded-2xl overflow-hidden border border-white/10"><img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80" alt="Tutoring center" className="w-full h-[400px] object-cover" /></div><div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6"><div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${BLUE}e6`, borderColor: `${BLUE}80` }}>3,000+ Students Tutored</div></div></div>
          <div><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>About Us</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Building Confidence, One Student at a Time</h2><p className="text-slate-400 leading-relaxed mb-8">Bright Minds Tutoring believes every student has the potential to excel. Our team of certified educators uses proven teaching methods, patience, and genuine enthusiasm to transform struggling students into confident learners.</p>
            <div className="grid grid-cols-2 gap-4">{[{ icon: GraduationCap, label: "Certified Tutors" }, { icon: CheckCircle, label: "Proven Methods" }, { icon: Star, label: "5-Star Rated" }, { icon: Users, label: "All Ages K-12" }].map((b) => <GlassCard key={b.label} className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${BLUE}26` }}><b.icon size={20} weight="duotone" style={{ color: BLUE }} /></div><span className="text-sm font-semibold text-white">{b.label}</span></GlassCard>)}</div>
          </div>
        </div></div>
      </SectionReveal>

      {/* APPROACH */}
      <SectionReveal id="approach" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <NotebookPattern opacity={0.025} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16"><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>Our Approach</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">How We Help Students Succeed</h2><div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${BLUE}, transparent)` }} /></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {approach.map((step, i) => (
              <div key={step.step} className="relative">
                {i < approach.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${BLUE}33, ${BLUE}11)` }} />}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${BLUE}22, ${BLUE}0a)`, color: BLUE, border: `1px solid ${BLUE}33` }}>{step.step}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* TESTIMONIALS */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1220 50%, ${BG} 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16"><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>Testimonials</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Parent &amp; Student Reviews</h2><div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${BLUE}, transparent)` }} /></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{testimonials.map((t, i) => <GlassCard key={i} className="p-6 h-full flex flex-col"><Quotes size={28} weight="fill" style={{ color: BLUE }} className="mb-4 opacity-40" /><div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: GREEN }} />)}</div><p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p><div className="pt-4 border-t border-white/5"><span className="text-sm font-semibold text-white">{t.name}</span></div></GlassCard>)}</div>
        </div>
      </SectionReveal>

      {/* FAQ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <NotebookPattern opacity={0.02} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16"><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>FAQ</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Common Questions</h2><div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${BLUE}, transparent)` }} /></div>
          <div className="space-y-3">{faqs.map((faq, i) => <GlassCard key={i} className="overflow-hidden"><button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer"><span className="text-lg font-semibold text-white pr-4">{faq.q}</span><motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400 shrink-0" /></motion.div></button><AnimatePresence initial={false}>{openFaq === i && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden"><p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{faq.a}</p></motion.div>}</AnimatePresence></GlassCard>)}</div>
        </div>
      </SectionReveal>

      {/* PRICING */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1220 50%, ${BG} 100%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16"><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: GREEN, borderColor: `${GREEN}33`, background: `${GREEN}0d` }}>Pricing</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Simple, Transparent Pricing</h2><div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${GREEN}, transparent)` }} /></div>
          <div className="grid md:grid-cols-3 gap-6">{pricing.map((p, i) => <GlassCard key={p.name} className={`p-6 text-center ${i === 1 ? "ring-2" : ""}`} style={i === 1 ? { ["--tw-ring-color" as string]: BLUE } : undefined}><h3 className="text-lg font-bold text-white mb-2">{p.name}</h3><p className="text-3xl font-black mb-2" style={{ color: GREEN }}>{p.price}</p><p className="text-sm text-slate-400">{p.desc}</p>{i === 1 && <span className="inline-block mt-3 text-xs font-bold uppercase px-3 py-1 rounded-full" style={{ background: `${BLUE}26`, color: BLUE }}>Most Popular</span>}</GlassCard>)}</div>
        </div>
      </SectionReveal>

      {/* CTA */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE}cc)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <GraduationCap size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Start with a Free Assessment</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Find out exactly where your child stands and get a personalized learning plan — completely free, no obligation.</p>
          <a href="tel:+14255550312" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors"><Phone size={20} weight="fill" /> (425) 555-0312</a>
        </div>
      </section>

      {/* CONTACT */}
      <SectionReveal id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1220 50%, ${BG} 100%)` }} />
        <NotebookPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10"><div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>Contact Us</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Get Started Today</h2><p className="text-slate-400 leading-relaxed mb-8">Schedule a free assessment and discover how Bright Minds can help your child excel.</p>
            <div className="space-y-5">
              {[{ icon: MapPin, title: "Location", text: "890 Learning Lane, Redmond, WA 98052" }, { icon: Phone, title: "Phone", text: "(425) 555-0312" }, { icon: Clock, title: "Hours", text: "Mon-Fri 3PM-8PM, Sat 9AM-4PM" }, { icon: ChalkboardTeacher, title: "Online", text: "Virtual sessions available nationwide" }].map((item) => <div key={item.title} className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${BLUE}26` }}><item.icon size={20} weight="duotone" style={{ color: BLUE }} /></div><div><p className="text-sm font-semibold text-white">{item.title}</p><p className="text-sm text-slate-400">{item.text}</p></div></div>)}
            </div>
          </div>
          <GlassCard className="p-8"><h3 className="text-xl font-semibold text-white mb-6">Request Free Assessment</h3><form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block text-sm text-slate-400 mb-1.5">Parent Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Your name" /></div><div><label className="block text-sm text-slate-400 mb-1.5">Student Grade</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="e.g., 8th grade" /></div></div>
            <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
            <div><label className="block text-sm text-slate-400 mb-1.5">Subject Needed</label><select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none text-sm"><option value="" className="bg-neutral-900">Select subject</option>{services.map((s) => <option key={s.name} value={s.name.toLowerCase()} className="bg-neutral-900">{s.name}</option>)}</select></div>
            <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: BLUE }}>Get Free Assessment <ArrowRight size={18} weight="bold" /></MagneticButton>
          </form></GlassCard>
        </div></div>
      </SectionReveal>

      {/* GUARANTEE */}
      <SectionReveal className="relative z-10 py-16 overflow-hidden"><div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 100%)` }} /><div className="max-w-4xl mx-auto px-6 relative z-10 text-center"><ShimmerBorder><div className="p-8 md:p-12"><ShieldCheck size={48} weight="fill" style={{ color: BLUE }} className="mx-auto mb-4" /><h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Grade Improvement Guarantee</h2><p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">If your child doesn&apos;t improve by at least one letter grade within the first 12 sessions, the 13th session is free.</p><div className="flex flex-wrap justify-center gap-4 mt-8">{["Certified Tutors", "Free Assessment", "Grade Guarantee", "Flexible Scheduling"].map((item) => <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}><CheckCircle size={16} weight="fill" /> {item}</span>)}</div></div></ShimmerBorder></div></SectionReveal>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-10 overflow-hidden"><div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #060a12 100%)` }} /><div className="mx-auto max-w-6xl px-6 relative z-10"><div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"><div><div className="flex items-center gap-2 mb-3"><BookOpen size={22} weight="fill" style={{ color: BLUE }} /><span className="text-lg font-bold text-white">Bright Minds Tutoring</span></div><p className="text-sm text-slate-500 leading-relaxed">Personalized tutoring for academic success. Math, science, SAT prep, and more.</p></div><div><h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4><div className="space-y-2">{["Subjects", "Approach", "About", "Contact"].map((l) => <a key={l} href={`#${l.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{l}</a>)}</div></div><div><h4 className="text-sm font-semibold text-white mb-3">Contact</h4><div className="space-y-2 text-sm text-slate-500"><p>(425) 555-0312</p><p>890 Learning Lane, Redmond, WA 98052</p></div></div></div><div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4"><div className="flex items-center gap-2 text-sm text-slate-500"><BookOpen size={14} weight="fill" style={{ color: BLUE }} /><span>Bright Minds Tutoring &copy; {new Date().getFullYear()}</span></div><div className="flex items-center gap-2 text-xs text-slate-600"><svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg><span>Website created by Bluejay Business Solutions</span></div></div></div></footer>
    </main>
  );
}
