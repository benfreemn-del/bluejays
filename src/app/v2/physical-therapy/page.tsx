"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useInView, AnimatePresence } from "framer-motion";
import { Heartbeat, PersonSimpleRun, FirstAidKit, Barbell, Brain, HandHeart, Star, ShieldCheck, Clock, Phone, MapPin, ArrowRight, CheckCircle, CaretDown, List, X, Users, Quotes, Certificate } from "@phosphor-icons/react";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: spring } };

const BLUE = "#0369a1";
const GREEN = "#16a34a";
const BG = "#0a0f1a";

function FloatingParticles() {
  const ps = Array.from({ length: 20 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 8, dur: 6 + Math.random() * 6, size: 2 + Math.random() * 3, op: 0.12 + Math.random() * 0.25, isGreen: Math.random() > 0.5 }));
  return <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">{ps.map((p) => <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isGreen ? GREEN : BLUE, willChange: "transform, opacity" }} animate={{ y: ["-10vh", "110vh"], opacity: [0, p.op, p.op, 0] }} transition={{ y: { duration: p.dur, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.dur, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }} />)}</div>;
}

function WavePattern({ opacity = 0.03 }: { opacity?: number }) {
  return <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
    <path d="M0 300 Q250 200 500 300 T1000 300" stroke={BLUE} strokeWidth="1.5" fill="none" />
    <path d="M0 350 Q250 250 500 350 T1000 350" stroke={GREEN} strokeWidth="1" fill="none" />
    <path d="M0 400 Q250 300 500 400 T1000 400" stroke={BLUE} strokeWidth="0.5" fill="none" />
  </svg>;
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>; }
function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) { const ref = useRef(null); const isInView = useInView(ref, { once: true, margin: "-80px" }); return <motion.section ref={ref} id={id} className={className} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>{children}</motion.section>; }
function WordReveal({ text, className = "" }: { text: string; className?: string }) { const ref = useRef(null); const isInView = useInView(ref, { once: true, margin: "-50px" }); return <motion.span ref={ref} className={`inline-flex flex-wrap gap-x-3 ${className}`} variants={stagger} initial="hidden" animate={isInView ? "show" : "hidden"}>{text.split(" ").map((w, i) => <motion.span key={i} variants={fadeUp} className="inline-block">{w}</motion.span>)}</motion.span>; }

function MagneticButton({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null); const x = useMotionValue(0); const y = useMotionValue(0); const sx = useSpring(x, springFast); const sy = useSpring(y, springFast);
  const isTD = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const mm = useCallback((e: React.MouseEvent) => { if (!ref.current || isTD) return; const r = ref.current.getBoundingClientRect(); x.set((e.clientX - (r.left + r.width / 2)) * 0.25); y.set((e.clientY - (r.top + r.height / 2)) * 0.25); }, [x, y, isTD]);
  const ml = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return <motion.button ref={ref} style={{ x: sx, y: sy, willChange: "transform", ...style }} onMouseMove={mm} onMouseLeave={ml} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}><motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${BLUE}, transparent, ${GREEN}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} /><div className="relative rounded-2xl bg-[#0a0f1a] z-10">{children}</div></div>;
}

const services = [
  { name: "Sports Rehabilitation", desc: "Get back in the game with specialized sports injury recovery programs tailored to athletes of all levels.", icon: PersonSimpleRun },
  { name: "Post-Surgery Recovery", desc: "Evidence-based post-operative rehabilitation to restore strength, mobility, and function after surgery.", icon: FirstAidKit },
  { name: "Pain Management", desc: "Comprehensive pain relief programs using manual therapy, dry needling, and therapeutic exercise.", icon: Heartbeat },
  { name: "Pediatric Therapy", desc: "Gentle, play-based physical therapy for children with developmental, neurological, or orthopedic conditions.", icon: HandHeart },
  { name: "Geriatric Rehab", desc: "Specialized programs for seniors focusing on balance, fall prevention, strength, and maintaining independence.", icon: Users },
  { name: "Manual Therapy", desc: "Hands-on techniques including joint mobilization, soft tissue work, and myofascial release for pain relief.", icon: Brain },
];

const stats = [{ value: "10,000+", label: "Patients Treated" }, { value: "20+", label: "Years Experience" }, { value: "98%", label: "Patient Satisfaction" }, { value: "4.9★", label: "Patient Rating" }];

const conditions = ["Back & Neck Pain", "ACL/MCL Injuries", "Rotator Cuff Tears", "Joint Replacement", "Sciatica", "Arthritis", "Sports Injuries", "Chronic Pain", "Balance Disorders", "Stroke Recovery", "Plantar Fasciitis", "Carpal Tunnel"];

const testimonials = [
  { name: "Chris A.", text: "After my knee replacement, I was terrified of recovery. The team here made it seamless — I'm back to hiking just 3 months later.", rating: 5 },
  { name: "Maria S.", text: "Finally found relief from my chronic back pain after years of suffering. Their manual therapy approach is unlike anything I've experienced.", rating: 5 },
  { name: "Jake D.", text: "As a collegiate athlete, getting back to competition was everything. They understood the urgency and got me game-ready ahead of schedule.", rating: 5 },
];

const faqs = [
  { q: "Do I need a referral from my doctor?", a: "In most states, you can see a physical therapist without a referral through Direct Access. However, some insurance plans may require one. We can help you navigate this." },
  { q: "How long does each session last?", a: "Initial evaluations are 60 minutes. Follow-up sessions are typically 45-60 minutes of one-on-one care with your therapist." },
  { q: "What should I wear to my appointment?", a: "Wear comfortable, loose-fitting clothing that allows easy movement. Athletic wear is ideal. We'll need access to the area being treated." },
  { q: "How many sessions will I need?", a: "Treatment plans vary based on your condition. Most patients see significant improvement in 6-12 sessions. We'll create a personalized plan during your evaluation." },
];

const insuranceList = ["Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Cigna", "Medicare", "Humana", "Kaiser Permanente", "Workers' Comp"];

export default function V2PhysicalTherapyShowcase() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingParticles />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50"><div className="mx-auto max-w-7xl px-4 md:px-6 py-4"><GlassCard className="flex items-center justify-between px-4 md:px-6 py-3"><div className="flex items-center gap-2"><Heartbeat size={24} weight="fill" style={{ color: BLUE }} /><span className="text-lg font-bold tracking-tight text-white">Summit PT &amp; Rehab</span></div><div className="hidden md:flex items-center gap-8 text-sm text-slate-400"><a href="#services" className="hover:text-white transition-colors">Services</a><a href="#conditions" className="hover:text-white transition-colors">Conditions</a><a href="#about" className="hover:text-white transition-colors">About</a><a href="#contact" className="hover:text-white transition-colors">Contact</a></div><div className="flex items-center gap-3"><MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: BLUE }}>Book Appointment</MagneticButton><button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button></div></GlassCard>
        <AnimatePresence>{mobileMenuOpen && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden mt-2 overflow-hidden"><GlassCard className="flex flex-col gap-1 px-4 py-4">{["Services", "Conditions", "About", "Contact"].map((l) => <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{l}</a>)}</GlassCard></motion.div>}</AnimatePresence>
      </div></nav>

      {/* HERO */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #0a1520 0%, ${BG} 50%, #0d1220 100%)` }} />
        <WavePattern opacity={0.05} />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${BLUE}0a` }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${GREEN}08` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div><p className="text-sm uppercase tracking-widest mb-4" style={{ color: GREEN }}>Evidence-Based Physical Therapy</p><h1 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}><WordReveal text="Get Back to the Life You Love" /></h1></div>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">Expert physical therapy for injury recovery, pain relief, and performance optimization. Personalized care that gets real results.</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: BLUE }}>Schedule Evaluation <ArrowRight size={18} weight="bold" /></MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer"><Phone size={18} weight="duotone" /> (360) 555-0234</MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400"><span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: BLUE }} /> Olympia, WA</span><span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: BLUE }} /> Mon-Fri 7AM-7PM</span></div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80" alt="Physical therapist helping patient" className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${BLUE}4d` }}>
                  <Certificate size={18} weight="fill" style={{ color: BLUE }} />
                  <span className="text-sm font-semibold text-white">Board Certified</span>
                </div>
              </div>
            </div>
            {/* Remove old SVG — keeping this comment for reference */}
            <svg viewBox="0 0 0 0" className="hidden" fill="none">
              {/* Glow rings */}
              <motion.circle cx="160" cy="170" r="140" stroke={BLUE} strokeWidth="0.5" opacity={0.1} animate={{ r: [138, 142, 138] }} transition={{ duration: 4, repeat: Infinity }} />
              {/* Person silhouette — stretching/recovery pose */}
              {/* Head */}
              <motion.circle cx="160" cy="60" r="22" fill={`${BLUE}20`} stroke={BLUE} strokeWidth="2.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, ease: "backOut" }} />
              <circle cx="160" cy="58" r="10" fill={`${BLUE}10`} />
              {/* Torso */}
              <motion.path d="M160 82 L160 180" stroke={BLUE} strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.4 }} />
              {/* Arms — one reaching up (stretching) */}
              <motion.path d="M160 110 L120 80 L100 55" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.6 }} />
              <motion.path d="M160 110 L200 130 L230 115" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.8 }} />
              {/* Legs — lunge position */}
              <motion.path d="M160 180 L130 240 L110 300" stroke={BLUE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 1 }} />
              <motion.path d="M160 180 L200 240 L220 300" stroke={BLUE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 1.2 }} />
              {/* Joint circles — knees and elbows */}
              <motion.circle cx="120" cy="80" r="5" fill={`${GREEN}33`} stroke={GREEN} strokeWidth="1.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.4, ease: "backOut" }} />
              <motion.circle cx="200" cy="130" r="5" fill={`${BLUE}33`} stroke={BLUE} strokeWidth="1.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5, ease: "backOut" }} />
              <motion.circle cx="130" cy="240" r="5" fill={`${BLUE}33`} stroke={BLUE} strokeWidth="1.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.6, ease: "backOut" }} />
              <motion.circle cx="200" cy="240" r="5" fill={`${BLUE}33`} stroke={BLUE} strokeWidth="1.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.7, ease: "backOut" }} />
              {/* Healing energy arcs */}
              <motion.path d="M95 50 C85 40 85 30 95 25" stroke={GREEN} strokeWidth="2" strokeLinecap="round" fill="none" opacity={0.5} animate={{ opacity: [0.2, 0.7, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
              <motion.path d="M88 55 C75 42 75 28 88 20" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={0.3} animate={{ opacity: [0.1, 0.5, 0.1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
              {/* Motion lines on stretching arm */}
              <motion.path d="M235 110 L250 105" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" opacity={0.4} animate={{ opacity: [0.2, 0.6, 0.2], x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <motion.path d="M235 120 L248 118" stroke={BLUE} strokeWidth="1" strokeLinecap="round" opacity={0.3} animate={{ opacity: [0.1, 0.5, 0.1], x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
              {/* Heartbeat line */}
              <motion.path d="M60 170 L90 170 L100 155 L110 185 L120 145 L130 185 L140 170 L160 170" stroke={GREEN} strokeWidth="2" strokeLinecap="round" fill="none" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }} transition={{ duration: 3, repeat: Infinity, times: [0, 0.4, 0.6, 1] }} />
              {/* Sparkles */}
              <motion.circle cx="80" cy="100" r="3" fill={GREEN} animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }} transition={{ duration: 2.5, repeat: Infinity }} />
              <motion.circle cx="250" cy="80" r="2.5" fill={BLUE} animate={{ opacity: [0.1, 0.8, 0.1] }} transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
              <motion.circle cx="70" cy="250" r="2" fill={GREEN} animate={{ opacity: [0.15, 0.6, 0.15] }} transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
              {/* Board Certified badge */}
              <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }}>
                <rect x="110" y="315" width="100" height="30" rx="15" fill="rgba(0,0,0,0.5)" stroke={`${BLUE}4d`} strokeWidth="1" />
                <text x="160" y="334" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">Board Certified</text>
              </motion.g>
            </svg>
          </div>
        </div>
      </section>

      {/* STATS */}
      <SectionReveal className="relative z-10 py-16 overflow-hidden border-y" >
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #0c1220 0%, ${BG} 100%)` }} />
        <WavePattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10"><div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => { const icons = [Heartbeat, Clock, CheckCircle, Star]; const Icon = icons[i]; return <div key={stat.label} className="text-center"><div className="flex items-center justify-center gap-2 mb-2"><Icon size={22} weight="fill" style={{ color: BLUE }} /><span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span></div><span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span></div>; })}
        </div></div>
      </SectionReveal>

      {/* SERVICES */}
      <SectionReveal id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <WavePattern />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16"><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>Our Services</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Specialized Physical Therapy</h2><div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${BLUE}, transparent)` }} /></div>
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
          <div className="relative"><div className="rounded-2xl overflow-hidden border border-white/10"><img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80" alt="Physical therapy clinic" className="w-full h-[400px] object-cover" /></div><div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6"><div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${BLUE}e6`, borderColor: `${BLUE}80` }}>98% Patient Satisfaction</div></div></div>
          <div><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>About Us</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Your Recovery, Our Mission</h2><p className="text-slate-400 leading-relaxed mb-8">At Summit PT &amp; Rehab, every patient receives a personalized treatment plan from a Doctor of Physical Therapy. We combine cutting-edge techniques with compassionate care to help you move better, feel better, and live better.</p>
            <div className="grid grid-cols-2 gap-4">{[{ icon: Certificate, label: "Board Certified" }, { icon: CheckCircle, label: "One-on-One Care" }, { icon: Star, label: "5-Star Rated" }, { icon: ShieldCheck, label: "In-Network" }].map((b) => <GlassCard key={b.label} className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${BLUE}26` }}><b.icon size={20} weight="duotone" style={{ color: BLUE }} /></div><span className="text-sm font-semibold text-white">{b.label}</span></GlassCard>)}</div>
          </div>
        </div></div>
      </SectionReveal>

      {/* CONDITIONS TREATED */}
      <SectionReveal id="conditions" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <WavePattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16"><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: GREEN, borderColor: `${GREEN}33`, background: `${GREEN}0d` }}>Conditions</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Conditions We Treat</h2><div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${GREEN}, transparent)` }} /></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {conditions.map((c) => <GlassCard key={c} className="p-4 flex items-center gap-3"><CheckCircle size={18} weight="fill" style={{ color: GREEN }} /><span className="text-sm font-medium text-white">{c}</span></GlassCard>)}
          </div>
        </div>
      </SectionReveal>

      {/* TESTIMONIALS */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1220 50%, ${BG} 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16"><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>Testimonials</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Patient Success Stories</h2><div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${BLUE}, transparent)` }} /></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{testimonials.map((t, i) => <GlassCard key={i} className="p-6 h-full flex flex-col"><Quotes size={28} weight="fill" style={{ color: BLUE }} className="mb-4 opacity-40" /><div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: GREEN }} />)}</div><p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p><div className="pt-4 border-t border-white/5"><span className="text-sm font-semibold text-white">{t.name}</span></div></GlassCard>)}</div>
        </div>
      </SectionReveal>

      {/* FAQ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 50%, ${BG} 100%)` }} />
        <WavePattern opacity={0.02} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16"><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>FAQ</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Common Questions</h2><div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${BLUE}, transparent)` }} /></div>
          <div className="space-y-3">{faqs.map((faq, i) => <GlassCard key={i} className="overflow-hidden"><button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer"><span className="text-lg font-semibold text-white pr-4">{faq.q}</span><motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400 shrink-0" /></motion.div></button><AnimatePresence initial={false}>{openFaq === i && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden"><p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{faq.a}</p></motion.div>}</AnimatePresence></GlassCard>)}</div>
        </div>
      </SectionReveal>

      {/* INSURANCE */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1220 50%, ${BG} 100%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16"><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: GREEN, borderColor: `${GREEN}33`, background: `${GREEN}0d` }}>Insurance</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Insurance We Accept</h2><div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${GREEN}, transparent)` }} /></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{insuranceList.map((ins) => <GlassCard key={ins} className="p-4 text-center"><span className="text-sm font-medium text-white">{ins}</span></GlassCard>)}</div>
          <p className="text-center text-slate-400 text-sm mt-6">Don&apos;t see your insurance? Call us — we work with most major providers.</p>
        </div>
      </SectionReveal>

      {/* CTA */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE}cc, ${BLUE})` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Heartbeat size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Start Your Recovery Today</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">No referral needed in most cases. Schedule your evaluation and take the first step toward feeling like yourself again.</p>
          <a href="tel:+13605550234" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors"><Phone size={20} weight="fill" /> (360) 555-0234</a>
        </div>
      </section>

      {/* CONTACT */}
      <SectionReveal id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1220 50%, ${BG} 100%)` }} />
        <WavePattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10"><div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div><span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>Contact Us</span><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Schedule Your Evaluation</h2><p className="text-slate-400 leading-relaxed mb-8">Take the first step toward recovery. Contact us to schedule your initial evaluation.</p>
            <div className="space-y-5">
              {[{ icon: MapPin, title: "Address", text: "567 Recovery Way, Olympia, WA 98501" }, { icon: Phone, title: "Phone", text: "(360) 555-0234" }, { icon: Clock, title: "Hours", text: "Mon-Fri 7AM-7PM, Sat 8AM-1PM" }].map((item) => <div key={item.title} className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${BLUE}26` }}><item.icon size={20} weight="duotone" style={{ color: BLUE }} /></div><div><p className="text-sm font-semibold text-white">{item.title}</p><p className="text-sm text-slate-400">{item.text}</p></div></div>)}
            </div>
          </div>
          <GlassCard className="p-8"><h3 className="text-xl font-semibold text-white mb-6">Request an Appointment</h3><form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block text-sm text-slate-400 mb-1.5">First Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="John" /></div><div><label className="block text-sm text-slate-400 mb-1.5">Last Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Doe" /></div></div>
            <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
            <div><label className="block text-sm text-slate-400 mb-1.5">Condition/Concern</label><select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none text-sm"><option value="" className="bg-neutral-900">Select condition</option>{services.map((s) => <option key={s.name} value={s.name.toLowerCase()} className="bg-neutral-900">{s.name}</option>)}</select></div>
            <div><label className="block text-sm text-slate-400 mb-1.5">Brief Description</label><textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="Tell us about your condition..." /></div>
            <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: BLUE }}>Request Appointment <ArrowRight size={18} weight="bold" /></MagneticButton>
          </form></GlassCard>
        </div></div>
      </SectionReveal>

      {/* GUARANTEE */}
      <SectionReveal className="relative z-10 py-16 overflow-hidden"><div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1220 100%)` }} /><div className="max-w-4xl mx-auto px-6 relative z-10 text-center"><ShimmerBorder><div className="p-8 md:p-12"><ShieldCheck size={48} weight="fill" style={{ color: BLUE }} className="mx-auto mb-4" /><h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Patient Promise</h2><p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">One-on-one care with a Doctor of Physical Therapy at every visit. No aides, no group sessions — just you and your therapist.</p><div className="flex flex-wrap justify-center gap-4 mt-8">{["Board Certified", "Direct Access", "One-on-One Care", "Insurance Accepted"].map((item) => <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}><CheckCircle size={16} weight="fill" /> {item}</span>)}</div></div></ShimmerBorder></div></SectionReveal>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-10 overflow-hidden"><div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #060a12 100%)` }} /><div className="mx-auto max-w-6xl px-6 relative z-10"><div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"><div><div className="flex items-center gap-2 mb-3"><Heartbeat size={22} weight="fill" style={{ color: BLUE }} /><span className="text-lg font-bold text-white">Summit PT &amp; Rehab</span></div><p className="text-sm text-slate-500 leading-relaxed">Evidence-based physical therapy for injury recovery, pain relief, and performance.</p></div><div><h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4><div className="space-y-2">{["Services", "Conditions", "About", "Contact"].map((l) => <a key={l} href={`#${l.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{l}</a>)}</div></div><div><h4 className="text-sm font-semibold text-white mb-3">Contact</h4><div className="space-y-2 text-sm text-slate-500"><p>(360) 555-0234</p><p>567 Recovery Way, Olympia, WA 98501</p></div></div></div><div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4"><div className="flex items-center gap-2 text-sm text-slate-500"><Heartbeat size={14} weight="fill" style={{ color: BLUE }} /><span>Summit PT &amp; Rehab &copy; {new Date().getFullYear()}</span></div><div className="flex items-center gap-2 text-xs text-slate-600"><svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg><span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span></div></div></div></footer>
    </main>
  );
}
