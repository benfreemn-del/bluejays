"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase page uses plain img tags intentionally. */

import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useInView, AnimatePresence } from "framer-motion";
import {
  Heartbeat, PersonSimpleRun, FirstAidKit, Barbell, Brain, HandHeart,
  Star, ShieldCheck, Clock, Phone, MapPin, ArrowRight, CheckCircle,
  CaretDown, List, X, Users, Quotes, Certificate, Envelope,
  Drop, Bone, Target, Bandaids, Stethoscope, CalendarCheck,
  Timer, Trophy, SealCheck, Scales, Crosshair, NavigationArrow, House
} from "@phosphor-icons/react";

/* ─── DESIGN TOKENS ─── */
const BLUE = "#1e40af";
const ORANGE = "#ea580c";
const BG = "#faf9f6";
const DARK_TEXT = "#1e293b";
const MUTED = "#64748b";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: spring } };

/* ─── UTILITY COMPONENTS ─── */
function SectionReveal({ children, className = "", id, style }: { children: React.ReactNode; className?: string; id?: string; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section ref={ref} id={id} className={className} style={style} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>
      {children}
    </motion.section>
  );
}

function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.span ref={ref} className={`inline-flex flex-wrap gap-x-3 ${className}`} variants={stagger} initial="hidden" animate={isInView ? "show" : "hidden"}>
      {text.split(" ").map((w, i) => <motion.span key={i} variants={fadeUp} className="inline-block">{w}</motion.span>)}
    </motion.span>
  );
}

function MagneticButton({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, springFast);
  const sy = useSpring(y, springFast);
  const isTD = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const mm = useCallback((e: React.MouseEvent) => { if (!ref.current || isTD) return; const r = ref.current.getBoundingClientRect(); x.set((e.clientX - (r.left + r.width / 2)) * 0.25); y.set((e.clientY - (r.top + r.height / 2)) * 0.25); }, [x, y, isTD]);
  const ml = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return (
    <motion.button ref={ref} style={{ x: sx, y: sy, willChange: "transform", ...style }} onMouseMove={mm} onMouseLeave={ml} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${BLUE}, transparent, ${ORANGE}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-[#faf9f6] z-10">{children}</div>
    </div>
  );
}

function Card({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`} style={style}>{children}</div>;
}

/* ─── DATA ─── */
const services = [
  { name: "Manual Therapy", desc: "Hands-on joint mobilization and soft tissue techniques to restore mobility and relieve pain at the source.", icon: HandHeart },
  { name: "Exercise Prescription", desc: "Custom therapeutic exercise programs designed to rebuild strength, endurance, and functional movement.", icon: Barbell },
  { name: "Dry Needling", desc: "Precision trigger-point dry needling to release deep muscle tension and accelerate healing.", icon: Target },
  { name: "Aquatic Therapy", desc: "Gentle water-based rehabilitation for joint-friendly recovery that reduces pain while building strength.", icon: Drop },
  { name: "Sports Rehab", desc: "Get back in the game with sport-specific rehabilitation protocols tailored to competitive and recreational athletes.", icon: PersonSimpleRun },
  { name: "Post-Surgery Recovery", desc: "Evidence-based post-operative rehabilitation to restore strength, range of motion, and function after surgery.", icon: FirstAidKit },
];

const conditions = [
  { name: "Back Pain", icon: Bone },
  { name: "Sports Injuries", icon: PersonSimpleRun },
  { name: "Post-Surgery", icon: FirstAidKit },
  { name: "Neck Pain", icon: Stethoscope },
  { name: "Joint Replacement", icon: Bandaids },
  { name: "Balance & Falls", icon: Scales },
];

const stats = [
  { value: "14+", label: "Years Experience" },
  { value: "5,000+", label: "Patients Treated" },
  { value: "98%", label: "Success Rate" },
  { value: "4.9", label: "Google Rating" },
];

const timelineSteps = [
  { week: "Week 1-2", title: "Assessment & Foundation", desc: "Comprehensive evaluation, pain management, and gentle mobility work to establish your baseline.", color: BLUE },
  { week: "Week 3-6", title: "Rebuild & Strengthen", desc: "Progressive strengthening, manual therapy, and targeted exercises to restore function and stability.", color: ORANGE },
  { week: "Week 7-12", title: "Return to Activity", desc: "Sport-specific training, functional movement drills, and a maintenance plan for lasting results.", color: BLUE },
];

const testimonials = [
  { name: "Marcus T.", result: "Back to running in 8 weeks", text: "After my ACL reconstruction I was terrified of a long recovery. Dr. Reyes had me running pain-free in just eight weeks. Her approach is unlike anything I have experienced.", rating: 5 },
  { name: "Linda K.", result: "Pain-free after 3 years of chronic back pain", text: "I tried everything for my lower back pain. Summit PT was my last hope and it changed my life. The manual therapy and dry needling combination worked when nothing else did.", rating: 5 },
  { name: "David R.", result: "Full shoulder mobility restored", text: "After rotator cuff surgery I could barely lift my arm. The aquatic therapy program got me back to full range of motion ahead of schedule. Outstanding care.", rating: 5 },
  { name: "Sarah M.", result: "Back on the tennis court in 10 weeks", text: "As a competitive tennis player my knee injury felt career-ending. Dr. Reyes understood my urgency and got me tournament-ready faster than I thought possible.", rating: 5 },
];

const bodyMapAreas = [
  { label: "Back", icon: Bone, color: BLUE },
  { label: "Neck", icon: Stethoscope, color: ORANGE },
  { label: "Shoulder", icon: Barbell, color: BLUE },
  { label: "Knee", icon: PersonSimpleRun, color: ORANGE },
  { label: "Hip", icon: HandHeart, color: BLUE },
  { label: "Ankle", icon: Bandaids, color: ORANGE },
];

const faqs = [
  { q: "Do I need a referral from my doctor?", a: "Washington state allows Direct Access, meaning you can see a physical therapist without a referral. Some insurance plans may require one for coverage. We will help you navigate this during your first call." },
  { q: "How long does each session last?", a: "Initial evaluations are 60 minutes of dedicated one-on-one time with Dr. Reyes. Follow-up sessions are typically 45 to 60 minutes." },
  { q: "What should I wear to my appointment?", a: "Comfortable, loose-fitting clothing that allows easy movement. Athletic wear is ideal. We will need access to the area being treated." },
  { q: "How many sessions will I need?", a: "Most patients see significant improvement within 6 to 12 sessions. We create a personalized plan during your evaluation and adjust as you progress." },
  { q: "Do you accept my insurance?", a: "We accept most major insurance plans including Blue Cross Blue Shield, Aetna, UnitedHealthcare, Cigna, Medicare, Premera, and Regence. Call us to verify your specific plan." },
];

const insuranceList = ["Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Cigna", "Medicare", "Premera", "Regence", "Workers' Comp"];

const comparisonRows = [
  { feature: "One-on-One with a DPT", us: true, them: "Sometimes" },
  { feature: "Board-Certified Specialist", us: true, them: "Rarely" },
  { feature: "Same-Day Appointments", us: true, them: "No" },
  { feature: "Custom Treatment Plans", us: true, them: "Sometimes" },
  { feature: "Direct Access (No Referral)", us: true, them: "Varies" },
  { feature: "Aquatic Therapy Available", us: true, them: "No" },
  { feature: "Insurance Billed Directly", us: true, them: "Sometimes" },
];

/* ─── MAIN COMPONENT ─── */
export default function V2PhysicalTherapyShowcase() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: DARK_TEXT }}>

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heartbeat size={26} weight="fill" style={{ color: BLUE }} />
            <span className="text-lg font-bold tracking-tight" style={{ color: DARK_TEXT }}>Summit PT &amp; Rehab</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: MUTED }}>
            {["Services", "About", "Recovery", "Testimonials", "Contact"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-slate-900 transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <MagneticButton className="px-5 py-2.5 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: BLUE }}>
              Schedule Evaluation
            </MagneticButton>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: DARK_TEXT }}>
              {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden overflow-hidden border-t border-slate-100 bg-white">
              <div className="flex flex-col gap-1 px-4 py-4">
                {["Services", "About", "Recovery", "Testimonials", "Contact"].map((l) => (
                  <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm hover:bg-slate-50 transition-colors" style={{ color: MUTED }}>{l}</a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══ HERO — #16 KINETIC TYPOGRAPHY ═══ */}
      <section className="relative min-h-[100dvh] flex items-center justify-center pt-20 z-10 overflow-hidden">
        {/* dark-to-light gradient background */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #0f172a 0%, ${BLUE} 35%, #3b82f6 60%, #93c5fd 80%, ${BG} 100%)` }} />
        {/* subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* "MOVE" — huge outlined text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.2 }}
          >
            <h1
              className="text-[6rem] sm:text-[9rem] md:text-[12rem] lg:text-[15rem] font-black leading-[0.85] tracking-tighter select-none"
              style={{
                WebkitTextStroke: "2px rgba(255,255,255,0.9)",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 80px rgba(255,255,255,0.15)",
              }}
            >
              MOVE
            </h1>
          </motion.div>

          {/* "BETTER" — solid bold slides in */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 70, damping: 16, delay: 0.6 }}
          >
            <h2 className="text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] font-black leading-[0.85] tracking-tighter text-white select-none">
              BETTER
            </h2>
          </motion.div>

          {/* subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-white/70 mt-6 font-medium tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            Live Better.
          </motion.p>

          {/* CTA */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
          >
            <MagneticButton className="px-8 py-4 rounded-full text-base font-bold text-white flex items-center gap-2 cursor-pointer shadow-lg" style={{ background: ORANGE }}>
              Schedule Your Evaluation <ArrowRight size={18} weight="bold" />
            </MagneticButton>
            <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border-2 border-white/30 flex items-center gap-2 cursor-pointer backdrop-blur-sm">
              <Phone size={18} weight="duotone" /> (206) 555-0293
            </MagneticButton>
          </motion.div>

          {/* trust badges */}
          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
          >
            {["Board-Certified DPT", "14 Years Experience", "Direct Access"].map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white/90 bg-white/10 backdrop-blur-sm border border-white/20">
                <CheckCircle size={14} weight="fill" /> {badge}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ TRUST STATS BAR ═══ */}
      <SectionReveal className="relative z-10 py-12 bg-white border-y border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const icons = [Trophy, Timer, CheckCircle, Star];
              const Icon = icons[i];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Icon size={22} weight="fill" style={{ color: i % 2 === 0 ? BLUE : ORANGE }} />
                    <span className="text-3xl md:text-4xl font-extrabold" style={{ color: DARK_TEXT }}>{stat.value}</span>
                  </div>
                  <span className="text-sm font-medium tracking-wide uppercase" style={{ color: MUTED }}>{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ═══ NEW PATIENT SPECIAL ═══ */}
      <SectionReveal className="relative z-10 py-12" style={{ background: `linear-gradient(135deg, ${ORANGE}08, ${ORANGE}04)` }}>
        <div className="max-w-5xl mx-auto px-6">
          <Card className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 border-2" style={{ borderColor: `${ORANGE}30` }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${ORANGE}15` }}>
              <Star size={32} weight="fill" style={{ color: ORANGE }} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-extrabold mb-1" style={{ color: DARK_TEXT }}>New Patient Special: $175 Comprehensive Evaluation</h3>
              <p style={{ color: MUTED }}>Includes a 60-minute assessment with Dr. Reyes, personalized treatment plan, and your first hands-on therapy session. No referral needed.</p>
            </div>
            <MagneticButton className="px-6 py-3 rounded-full text-sm font-bold text-white cursor-pointer shrink-0 inline-flex items-center gap-2" style={{ background: ORANGE }}>
              Book Now <ArrowRight size={16} weight="bold" />
            </MagneticButton>
          </Card>
        </div>
      </SectionReveal>

      {/* ═══ SERVICES ═══ */}
      <SectionReveal id="services" className="relative z-10 py-24 md:py-32" style={{ background: BG }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>Treatment Approach</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: DARK_TEXT }}>How We Help You Heal</h2>
            <div className="h-1 w-16 mx-auto mt-4 rounded-full" style={{ background: `linear-gradient(to right, ${BLUE}, ${ORANGE})` }} />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <Card key={svc.name} className="group relative p-7 hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${BLUE}08, transparent 70%)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: i % 2 === 0 ? `${BLUE}12` : `${ORANGE}12` }}>
                        <Icon size={24} weight="duotone" style={{ color: i % 2 === 0 ? BLUE : ORANGE }} />
                      </div>
                      <span className="text-xs font-mono" style={{ color: `${MUTED}80` }}>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: DARK_TEXT }}>{svc.name}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{svc.desc}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ═══ CONDITIONS TREATED ═══ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>Conditions Treated</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: DARK_TEXT }}>We Treat What Holds You Back</h2>
            <div className="h-1 w-16 mx-auto mt-4 rounded-full" style={{ background: `linear-gradient(to right, ${BLUE}, ${ORANGE})` }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {conditions.map((c) => {
              const Icon = c.icon;
              return (
                <Card key={c.name} className="p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${BLUE}10` }}>
                    <Icon size={22} weight="duotone" style={{ color: BLUE }} />
                  </div>
                  <span className="text-base font-semibold" style={{ color: DARK_TEXT }}>{c.name}</span>
                </Card>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ═══ WHY CHOOSE PHYSICAL THERAPY ═══ */}
      <SectionReveal className="relative z-10 py-24 md:py-32" style={{ background: BG }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>Why PT</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: DARK_TEXT }}>Why Physical Therapy First?</h2>
            <div className="h-1 w-16 mx-auto mt-4 rounded-full" style={{ background: `linear-gradient(to right, ${BLUE}, ${ORANGE})` }} />
            <p className="mt-4 max-w-2xl mx-auto" style={{ color: MUTED }}>Research shows physical therapy is the most effective first-line treatment for most musculoskeletal pain. Before surgery, before injections, before long-term medication, try PT.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Crosshair,
                title: "Treat the Root Cause",
                desc: "Pain medication masks symptoms. Physical therapy identifies the underlying cause of your pain and corrects it through targeted treatment, so you get lasting relief instead of temporary fixes.",
                stat: "85%",
                statLabel: "of chronic pain patients improve with PT",
              },
              {
                icon: ShieldCheck,
                title: "Avoid Surgery",
                desc: "Many orthopedic conditions previously treated with surgery respond equally well to physical therapy. A comprehensive PT program can save you time, money, and a lengthy surgical recovery.",
                stat: "70%",
                statLabel: "of orthopedic surgeries are potentially avoidable",
              },
              {
                icon: Trophy,
                title: "Return to Your Life",
                desc: "Our goal is not just pain relief. We restore the functional movement you need to work, play, exercise, and live without limitation. You define what recovery looks like and we get you there.",
                stat: "94%",
                statLabel: "of our patients return to full activity",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="p-7 text-center hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: i % 2 === 0 ? `${BLUE}10` : `${ORANGE}10` }}>
                    <Icon size={28} weight="duotone" style={{ color: i % 2 === 0 ? BLUE : ORANGE }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: DARK_TEXT }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: MUTED }}>{item.desc}</p>
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-3xl font-black" style={{ color: BLUE }}>{item.stat}</span>
                    <p className="text-xs mt-1" style={{ color: MUTED }}>{item.statLabel}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ═══ ABOUT — PROVIDER SPOTLIGHT ═══ */}
      <SectionReveal id="about" className="relative z-10 py-24 md:py-32" style={{ background: BG }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                <img src="https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=700&q=80" alt="Dr. Sofia Reyes, DPT" className="w-full h-[480px] object-cover object-top" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl shadow-lg border border-white text-white font-bold text-sm" style={{ background: BLUE }}>
                  <Certificate size={16} weight="fill" className="inline mr-1.5" /> Board-Certified OCS
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>Meet Your Provider</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2" style={{ color: DARK_TEXT }}>Dr. Sofia Reyes, DPT</h2>
              <p className="text-lg font-medium mb-6" style={{ color: ORANGE }}>Doctor of Physical Therapy &bull; Orthopedic Clinical Specialist</p>
              <p className="leading-relaxed mb-6" style={{ color: MUTED }}>
                With 14 years of clinical experience and board certification in orthopedic physical therapy, Dr. Reyes founded Summit PT &amp; Rehab in Seattle to deliver the kind of care she believes every patient deserves: one-on-one, evidence-based, and deeply personalized.
              </p>
              <p className="leading-relaxed mb-8" style={{ color: MUTED }}>
                Her approach combines hands-on manual therapy with progressive exercise prescription to get you moving better and living better. Whether you are recovering from surgery, managing chronic pain, or rehabbing a sports injury, Dr. Reyes is with you every step of the way.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Certificate, label: "Board Certified OCS" },
                  { icon: SealCheck, label: "14 Years Experience" },
                  { icon: Users, label: "One-on-One Care" },
                  { icon: ShieldCheck, label: "In-Network Provider" },
                ].map((b) => (
                  <Card key={b.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${BLUE}10` }}>
                      <b.icon size={20} weight="duotone" style={{ color: BLUE }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: DARK_TEXT }}>{b.label}</span>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══ YOUR FIRST VISIT ═══ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>First Visit</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: DARK_TEXT }}>What to Expect</h2>
            <div className="h-1 w-16 mx-auto mt-4 rounded-full" style={{ background: `linear-gradient(to right, ${BLUE}, ${ORANGE})` }} />
            <p className="mt-4 max-w-xl mx-auto" style={{ color: MUTED }}>Your first visit is all about understanding your unique situation. Here is how your 60-minute evaluation works.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                icon: Stethoscope,
                title: "Health History",
                desc: "Dr. Reyes reviews your medical history, prior treatments, imaging results, and current medications to understand the full picture.",
              },
              {
                step: "02",
                icon: Crosshair,
                title: "Physical Exam",
                desc: "A thorough hands-on assessment of your posture, strength, range of motion, joint mobility, and movement patterns.",
              },
              {
                step: "03",
                icon: Target,
                title: "Diagnosis & Plan",
                desc: "Dr. Reyes explains exactly what is causing your pain, how long recovery will take, and what your personalized treatment plan looks like.",
              },
              {
                step: "04",
                icon: HandHeart,
                title: "First Treatment",
                desc: "You will receive your first hands-on therapy session immediately. Most patients leave feeling better than when they walked in.",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 relative" style={{ background: i % 2 === 0 ? `${BLUE}10` : `${ORANGE}10` }}>
                    <Icon size={30} weight="duotone" style={{ color: i % 2 === 0 ? BLUE : ORANGE }} />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 flex items-center justify-center text-xs font-black" style={{ borderColor: i % 2 === 0 ? BLUE : ORANGE, color: i % 2 === 0 ? BLUE : ORANGE }}>{item.step}</span>
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: DARK_TEXT }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ═══ RECOVERY TIMELINE ═══ */}
      <SectionReveal id="recovery" className="relative z-10 py-24 md:py-32" style={{ background: BG }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>Your Journey</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: DARK_TEXT }}>Your Recovery Timeline</h2>
            <div className="h-1 w-16 mx-auto mt-4 rounded-full" style={{ background: `linear-gradient(to right, ${BLUE}, ${ORANGE})` }} />
            <p className="mt-4 max-w-xl mx-auto" style={{ color: MUTED }}>Every patient is different, but here is a typical path from pain to peak performance.</p>
          </div>
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 hidden md:block" style={{ background: `linear-gradient(to bottom, ${BLUE}, ${ORANGE}, ${BLUE})` }} />
            <div className="space-y-12">
              {timelineSteps.map((step, i) => (
                <div key={step.week} className={`relative flex flex-col md:flex-row items-start gap-6 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                  <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-4 z-10" style={{ borderColor: step.color }}>
                    <span className="text-xs font-bold" style={{ color: step.color }}>{i + 1}</span>
                  </div>
                  <div className={`md:w-1/2 ${i % 2 === 1 ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                    <Card className="p-6">
                      <span className="inline-block text-xs font-bold uppercase tracking-widest mb-2 px-3 py-1 rounded-full" style={{ color: step.color, background: `${step.color}10` }}>{step.week}</span>
                      <h3 className="text-xl font-bold mb-2" style={{ color: DARK_TEXT }}>{step.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{step.desc}</p>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══ "WHAT HURTS?" BODY MAP QUIZ ═══ */}
      <SectionReveal className="relative z-10 py-24 md:py-32" style={{ background: BG }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>Interactive</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: DARK_TEXT }}>What Hurts?</h2>
            <p className="mt-3" style={{ color: MUTED }}>Select the area that is giving you trouble and we will recommend a starting point.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {bodyMapAreas.map((area) => {
              const Icon = area.icon;
              const isActive = selectedBodyPart === area.label;
              return (
                <button
                  key={area.label}
                  onClick={() => setSelectedBodyPart(isActive ? null : area.label)}
                  className="p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer"
                  style={{
                    borderColor: isActive ? area.color : "#e2e8f0",
                    background: isActive ? `${area.color}08` : "white",
                    boxShadow: isActive ? `0 0 0 3px ${area.color}20` : "none",
                  }}
                >
                  <Icon size={28} weight={isActive ? "fill" : "duotone"} style={{ color: area.color }} className="mb-2" />
                  <span className="text-base font-bold block" style={{ color: DARK_TEXT }}>{area.label}</span>
                </button>
              );
            })}
          </div>
          <AnimatePresence mode="wait">
            {selectedBodyPart && (
              <motion.div
                key={selectedBodyPart}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={spring}
              >
                <Card className="p-6 text-center">
                  <p className="text-lg font-semibold mb-2" style={{ color: DARK_TEXT }}>
                    {selectedBodyPart} pain is one of the most common conditions we treat.
                  </p>
                  <p className="mb-4" style={{ color: MUTED }}>
                    Dr. Reyes specializes in {selectedBodyPart.toLowerCase()} rehabilitation using manual therapy and targeted exercise. Most patients see significant improvement within 4 to 8 visits.
                  </p>
                  <MagneticButton className="px-6 py-3 rounded-full text-sm font-bold text-white cursor-pointer inline-flex items-center gap-2" style={{ background: ORANGE }}>
                    Book {selectedBodyPart} Evaluation <ArrowRight size={16} weight="bold" />
                  </MagneticButton>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionReveal>

      {/* ═══ GOOGLE REVIEWS HEADER + TESTIMONIALS ═══ */}
      <SectionReveal id="testimonials" className="relative z-10 py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {/* Google reviews header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={22} weight="fill" style={{ color: "#f59e0b" }} />
                ))}
              </div>
              <span className="text-lg font-bold" style={{ color: DARK_TEXT }}>4.9</span>
              <span style={{ color: MUTED }}>&bull; 230+ Google Reviews</span>
            </div>
          </div>
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>Success Stories</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: DARK_TEXT }}>Real Patients, Real Results</h2>
            <div className="h-1 w-16 mx-auto mt-4 rounded-full" style={{ background: `linear-gradient(to right, ${BLUE}, ${ORANGE})` }} />
          </div>
          {/* Stacked result cards (unique testimonial layout #16) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="p-6 flex flex-col h-full hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: i % 2 === 0 ? BLUE : ORANGE }}>{t.result}</span>
                  <div className="flex gap-0.5 ml-auto">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={14} weight="fill" style={{ color: "#f59e0b" }} />
                    ))}
                  </div>
                </div>
                <Quotes size={24} weight="fill" style={{ color: `${BLUE}30` }} className="mb-2" />
                <p className="leading-relaxed flex-1 text-sm mb-4" style={{ color: MUTED }}>&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                  <SealCheck size={16} weight="fill" style={{ color: BLUE }} />
                  <span className="text-sm font-semibold" style={{ color: DARK_TEXT }}>{t.name}</span>
                  <span className="text-xs" style={{ color: MUTED }}>Verified Patient</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═══ PRICING ═══ */}
      <SectionReveal className="relative z-10 py-24 md:py-32" style={{ background: BG }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>Investment</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: DARK_TEXT }}>Transparent Pricing</h2>
            <div className="h-1 w-16 mx-auto mt-4 rounded-full" style={{ background: `linear-gradient(to right, ${BLUE}, ${ORANGE})` }} />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Initial Evaluation", price: "$175", desc: "60-minute comprehensive assessment with Dr. Reyes, personalized treatment plan, and first session of hands-on care.", badge: "Start Here", popular: false },
              { title: "Follow-Up Visit", price: "$125", desc: "45-60 minutes of one-on-one therapy including manual techniques, exercise progression, and home program updates.", badge: "Most Common", popular: true },
              { title: "Insurance Billed", price: "$0*", desc: "We accept most major insurance and bill directly. Your out-of-pocket cost depends on your plan. Call to verify.", badge: "Preferred", popular: false },
            ].map((pkg) => (
              <Card key={pkg.title} className={`p-7 relative overflow-hidden ${pkg.popular ? "ring-2" : ""}`} style={pkg.popular ? ({ ["--tw-ring-color" as unknown as string]: BLUE } as React.CSSProperties) : {}}>
                {pkg.popular && <div className="absolute top-0 right-0 px-4 py-1 text-xs font-bold text-white rounded-bl-xl" style={{ background: BLUE }}>Most Common</div>}
                <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full" style={{ color: ORANGE, background: `${ORANGE}10` }}>{pkg.badge}</span>
                <h3 className="text-xl font-bold mb-1" style={{ color: DARK_TEXT }}>{pkg.title}</h3>
                <p className="text-4xl font-black mb-4" style={{ color: BLUE }}>{pkg.price}</p>
                <p className="text-sm leading-relaxed mb-6" style={{ color: MUTED }}>{pkg.desc}</p>
                <MagneticButton className="w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: pkg.popular ? BLUE : ORANGE }}>
                  Schedule Now
                </MagneticButton>
              </Card>
            ))}
          </div>
          <p className="text-center text-xs mt-6" style={{ color: MUTED }}>*Out-of-pocket cost varies by insurance plan. We handle all billing and paperwork.</p>
        </div>
      </SectionReveal>

      {/* ═══ COMPETITOR COMPARISON ═══ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>Why Us</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: DARK_TEXT }}>Summit PT vs. The Competition</h2>
            <div className="h-1 w-16 mx-auto mt-4 rounded-full" style={{ background: `linear-gradient(to right, ${BLUE}, ${ORANGE})` }} />
          </div>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: `${BLUE}08` }}>
                  <th className="text-left px-6 py-4 font-semibold" style={{ color: DARK_TEXT }}>Feature</th>
                  <th className="text-center px-4 py-4 font-bold" style={{ color: BLUE }}>Summit PT</th>
                  <th className="text-center px-4 py-4 font-semibold" style={{ color: MUTED }}>Others</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : ""} style={i % 2 !== 0 ? { background: `${BG}` } : {}}>
                    <td className="px-6 py-4 font-medium" style={{ color: DARK_TEXT }}>{row.feature}</td>
                    <td className="text-center px-4 py-4">
                      <CheckCircle size={22} weight="fill" style={{ color: "#16a34a" }} className="inline" />
                    </td>
                    <td className="text-center px-4 py-4" style={{ color: MUTED }}>{row.them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </SectionReveal>

      {/* ═══ TECHNOLOGY & EQUIPMENT ═══ */}
      <SectionReveal className="relative z-10 py-24 md:py-32" style={{ background: BG }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>Our Tools</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: DARK_TEXT }}>Modern Treatment Technology</h2>
            <div className="h-1 w-16 mx-auto mt-4 rounded-full" style={{ background: `linear-gradient(to right, ${BLUE}, ${ORANGE})` }} />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Target, name: "Dry Needling", desc: "Precision intramuscular stimulation for trigger points, deep muscle tension, and myofascial pain." },
              { icon: Drop, name: "Aquatic Therapy Pool", desc: "Heated therapy pool for low-impact rehabilitation, joint decompression, and pain-free movement training." },
              { icon: Barbell, name: "Functional Training", desc: "Full gym with cable machines, free weights, and balance equipment for progressive strengthening." },
              { icon: Brain, name: "Manual Therapy Suite", desc: "Private treatment rooms equipped for joint mobilization, soft tissue work, and craniosacral therapy." },
            ].map((tech, i) => {
              const Icon = tech.icon;
              return (
                <Card key={tech.name} className="p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: i % 2 === 0 ? `${BLUE}10` : `${ORANGE}10` }}>
                    <Icon size={24} weight="duotone" style={{ color: i % 2 === 0 ? BLUE : ORANGE }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: DARK_TEXT }}>{tech.name}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{tech.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ═══ INSURANCE CHECKER ═══ */}
      <SectionReveal className="relative z-10 py-24 md:py-32" style={{ background: BG }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>Insurance</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: DARK_TEXT }}>We Accept Most Insurance</h2>
            <div className="h-1 w-16 mx-auto mt-4 rounded-full" style={{ background: `linear-gradient(to right, ${BLUE}, ${ORANGE})` }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {insuranceList.map((ins) => (
              <Card key={ins} className="p-4 text-center hover:shadow-md transition-shadow">
                <ShieldCheck size={20} weight="duotone" style={{ color: BLUE }} className="mx-auto mb-2" />
                <span className="text-sm font-medium" style={{ color: DARK_TEXT }}>{ins}</span>
              </Card>
            ))}
          </div>
          <Card className="p-6 text-center" style={{ background: `${BLUE}06`, borderColor: `${BLUE}20` }}>
            <p className="text-lg font-semibold mb-2" style={{ color: DARK_TEXT }}>Don&apos;t see your plan?</p>
            <p className="mb-4" style={{ color: MUTED }}>We work with most major providers and can verify your coverage over the phone. Call us and we will sort it out for you.</p>
            <MagneticButton className="px-6 py-3 rounded-full text-sm font-bold text-white cursor-pointer inline-flex items-center gap-2" style={{ background: BLUE }}>
              <Phone size={16} weight="fill" /> Call to Verify: (206) 555-0293
            </MagneticButton>
          </Card>
        </div>
      </SectionReveal>

      {/* ═══ PATIENT COMFORT / ANXIETY ═══ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>Your Comfort</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: DARK_TEXT }}>We Know Recovery Can Be Scary</h2>
            <div className="h-1 w-16 mx-auto mt-4 rounded-full" style={{ background: `linear-gradient(to right, ${BLUE}, ${ORANGE})` }} />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: HandHeart, title: "Gentle Approach", desc: "We never push beyond your comfort zone. Every technique is explained before we begin." },
              { icon: Users, title: "One-on-One Always", desc: "No aides, no group sessions. Dr. Reyes works with you directly for the entire visit." },
              { icon: Brain, title: "Patient Education", desc: "We teach you why, not just what. Understanding your body empowers lasting recovery." },
              { icon: CalendarCheck, title: "Flexible Scheduling", desc: "Early morning and evening appointments available to fit your life and work schedule." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="p-6 text-center hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: i % 2 === 0 ? `${BLUE}10` : `${ORANGE}10` }}>
                    <Icon size={28} weight="duotone" style={{ color: i % 2 === 0 ? BLUE : ORANGE }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: DARK_TEXT }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{item.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ═══ VIDEO TESTIMONIAL PLACEHOLDER ═══ */}
      <SectionReveal className="relative z-10 py-24 md:py-32" style={{ background: BG }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
            <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1000&q=80" alt="Summit PT clinic interior" className="w-full h-[400px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center mx-auto mb-4 shadow-xl cursor-pointer hover:bg-white transition-colors">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 ml-1" fill={BLUE}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-white text-xl font-bold">Take a Virtual Tour</p>
                <p className="text-white/70 text-sm mt-1">See our clinic and meet the team</p>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══ FACILITY GALLERY ═══ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>Our Space</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: DARK_TEXT }}>A Clinic Built for Recovery</h2>
            <div className="h-1 w-16 mx-auto mt-4 rounded-full" style={{ background: `linear-gradient(to right, ${BLUE}, ${ORANGE})` }} />
            <p className="mt-4 max-w-xl mx-auto" style={{ color: MUTED }}>Our Sand Point clinic features state-of-the-art equipment, private assessment rooms, and a dedicated recovery suite.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Assessment Room", img: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=400&q=80" },
              { label: "Exercise Area", img: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=80" },
              { label: "Recovery Room", img: "https://images.unsplash.com/photo-1551601651-bc60f254d532?w=400&q=80" },
              { label: "Reception", img: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=80" },
            ].map((room) => (
              <div key={room.label} className="relative rounded-xl overflow-hidden group">
                <img src={room.img} alt={room.label} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <span className="text-white text-sm font-semibold">{room.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═══ ENHANCED SERVICE AREA ═══ */}
      <SectionReveal className="relative z-10 py-24 md:py-32" style={{ background: BG }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>Location</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: DARK_TEXT }}>Serving the Seattle Area</h2>
            <div className="h-1 w-16 mx-auto mt-4 rounded-full" style={{ background: `linear-gradient(to right, ${BLUE}, ${ORANGE})` }} />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <NavigationArrow size={32} weight="duotone" style={{ color: BLUE }} className="mx-auto mb-3" />
              <h3 className="text-lg font-bold mb-1" style={{ color: DARK_TEXT }}>Coverage Area</h3>
              <p className="text-sm" style={{ color: MUTED }}>We serve patients from across the Greater Seattle area including Sand Point, Laurelhurst, University District, Ravenna, View Ridge, Wedgwood, and Magnuson Park neighborhoods.</p>
            </Card>
            <Card className="p-6 text-center">
              <Timer size={32} weight="duotone" style={{ color: ORANGE }} className="mx-auto mb-3" />
              <h3 className="text-lg font-bold mb-1" style={{ color: DARK_TEXT }}>Availability</h3>
              <p className="text-sm" style={{ color: MUTED }}>Monday through Friday 7AM to 7PM and Saturday 8AM to 1PM. Same-day appointments often available for acute injuries. Call to check today&apos;s availability.</p>
            </Card>
            <Card className="p-6 text-center">
              <House size={32} weight="duotone" style={{ color: BLUE }} className="mx-auto mb-3" />
              <h3 className="text-lg font-bold mb-1" style={{ color: DARK_TEXT }}>Easy Access</h3>
              <p className="text-sm" style={{ color: MUTED }}>Located on Sand Point Way NE with free parking available. Ground-floor clinic with barrier-free access. Steps from the Burke-Gilman Trail for post-session walks.</p>
            </Card>
          </div>
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2">
              <motion.div
                className="w-3 h-3 rounded-full"
                style={{ background: "#16a34a" }}
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-sm font-semibold" style={{ color: "#16a34a" }}>Accepting New Patients</span>
              <span className="text-sm" style={{ color: MUTED }}>&mdash; Same-week availability</span>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══ CERTIFICATIONS / PARTNERS BADGE ROW ═══ */}
      <SectionReveal className="relative z-10 py-16 bg-white border-y border-slate-200/60">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-8">
            <h3 className="text-lg font-bold" style={{ color: DARK_TEXT }}>Credentials &amp; Affiliations</h3>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {["APTA Member", "Board-Certified OCS", "Dry Needling Certified", "WA State Licensed", "Direct Access Provider", "ABPTS Certified"].map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium border" style={{ color: BLUE, borderColor: `${BLUE}25`, background: `${BLUE}06` }}>
                <Certificate size={14} weight="fill" /> {badge}
              </span>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═══ EMERGENCY / URGENCY ═══ */}
      <SectionReveal className="relative z-10 py-16" style={{ background: `${ORANGE}08` }}>
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-4 h-4 rounded-full"
              style={{ background: ORANGE }}
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <div>
              <p className="text-lg font-bold" style={{ color: DARK_TEXT }}>Same-Day Appointments Available</p>
              <p className="text-sm" style={{ color: MUTED }}>Acute injury? Don&apos;t wait. We prioritize urgent evaluations.</p>
            </div>
          </div>
          <MagneticButton className="px-6 py-3 rounded-full text-sm font-bold text-white cursor-pointer shrink-0 inline-flex items-center gap-2" style={{ background: ORANGE }}>
            <Phone size={16} weight="fill" /> Call Now: (206) 555-0293
          </MagneticButton>
        </div>
      </SectionReveal>

      {/* ═══ FAQ ═══ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: BLUE, borderColor: `${BLUE}33`, background: `${BLUE}0d` }}>FAQ</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: DARK_TEXT }}>Common Questions</h2>
            <div className="h-1 w-16 mx-auto mt-4 rounded-full" style={{ background: `linear-gradient(to right, ${BLUE}, ${ORANGE})` }} />
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Card key={i} className="overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
                  <span className="text-lg font-semibold pr-4" style={{ color: DARK_TEXT }}>{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}>
                    <CaretDown size={20} style={{ color: MUTED }} className="shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                      <p className="px-5 pb-5 md:px-6 md:pb-6 leading-relaxed" style={{ color: MUTED }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═══ CTA BANNER ═══ */}
      <section className="relative z-10 py-20 overflow-hidden" style={{ background: `linear-gradient(135deg, ${BLUE}, #2563eb, ${BLUE})` }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1.5' fill='%23fff'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Heartbeat size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Start Moving Better Today</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">No referral needed. Schedule your evaluation with Dr. Reyes and take the first step toward living without pain.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:+12065550293" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white font-bold text-lg hover:bg-white/90 transition-colors" style={{ color: BLUE }}>
              <Phone size={20} weight="fill" /> (206) 555-0293
            </a>
            <a href="mailto:recover@summitptrehab.com" className="inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 border-white/40 text-white font-semibold text-base hover:bg-white/10 transition-colors">
              <Envelope size={20} weight="duotone" /> Email Us
            </a>
          </div>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <SectionReveal id="contact" className="relative z-10 py-24 md:py-32" style={{ background: BG }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6" style={{ color: DARK_TEXT }}>Schedule Your Evaluation</h2>
              <p className="leading-relaxed mb-8" style={{ color: MUTED }}>Take the first step toward recovery. Contact us to schedule your initial evaluation with Dr. Reyes.</p>
              <div className="space-y-5">
                {[
                  { icon: MapPin, title: "Address", text: "5423 Sand Point Way NE, Seattle, WA 98105", href: "https://maps.google.com/?q=5423+Sand+Point+Way+NE+Seattle+WA+98105" },
                  { icon: Phone, title: "Phone", text: "(206) 555-0293", href: "tel:+12065550293" },
                  { icon: Envelope, title: "Email", text: "recover@summitptrehab.com", href: "mailto:recover@summitptrehab.com" },
                  { icon: Clock, title: "Hours", text: "Mon-Fri 7AM-7PM, Sat 8AM-1PM", href: undefined },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${BLUE}10` }}>
                      <item.icon size={20} weight="duotone" style={{ color: BLUE }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: DARK_TEXT }}>{item.title}</p>
                      {item.href ? (
                        <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: MUTED }}>{item.text}</a>
                      ) : (
                        <p className="text-sm" style={{ color: MUTED }}>{item.text}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-6" style={{ color: DARK_TEXT }}>Request an Appointment</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: MUTED }}>First Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 text-sm" style={{ color: DARK_TEXT, focusRingColor: BLUE } as React.CSSProperties} placeholder="Jane" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: MUTED }}>Last Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 text-sm" style={{ color: DARK_TEXT } as React.CSSProperties} placeholder="Smith" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: MUTED }}>Phone</label>
                  <input type="tel" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 text-sm" style={{ color: DARK_TEXT } as React.CSSProperties} placeholder="(206) 555-1234" />
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: MUTED }}>What Hurts?</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 text-sm" style={{ color: DARK_TEXT } as React.CSSProperties}>
                    <option value="">Select area of concern</option>
                    {bodyMapAreas.map((a) => <option key={a.label} value={a.label.toLowerCase()}>{a.label}</option>)}
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: MUTED }}>Tell Us More</label>
                  <textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 text-sm resize-none" style={{ color: DARK_TEXT } as React.CSSProperties} placeholder="Briefly describe your condition or injury..." />
                </div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-bold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: BLUE }}>
                  Request Appointment <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </Card>
          </div>
        </div>
      </SectionReveal>

      {/* ═══ PATIENT PROMISE / GUARANTEE ═══ */}
      <SectionReveal className="relative z-10 py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ShimmerBorder>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: BLUE }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold mb-4" style={{ color: DARK_TEXT }}>Our Patient Promise</h2>
              <p className="leading-relaxed max-w-2xl mx-auto text-lg" style={{ color: MUTED }}>
                One-on-one care with a Doctor of Physical Therapy at every visit. No aides, no group sessions, no shortcuts. Just you, Dr. Reyes, and a plan to get you back to the life you love.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                {["Board Certified", "Direct Access", "One-on-One Care", "Insurance Accepted"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: BLUE, borderColor: `${BLUE}25`, background: `${BLUE}06` }}>
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-slate-200 py-10" style={{ background: "white" }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heartbeat size={22} weight="fill" style={{ color: BLUE }} />
                <span className="text-lg font-bold" style={{ color: DARK_TEXT }}>Summit PT &amp; Rehab</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: MUTED }}>Evidence-based physical therapy in Seattle. Move Better. Live Better.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: DARK_TEXT }}>Quick Links</h4>
              <div className="space-y-2">
                {["Services", "About", "Recovery", "Testimonials", "Contact"].map((l) => (
                  <a key={l} href={`#${l.toLowerCase()}`} className="block text-sm hover:underline transition-colors" style={{ color: MUTED }}>{l}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: DARK_TEXT }}>Contact</h4>
              <div className="space-y-2 text-sm" style={{ color: MUTED }}>
                <p><a href="tel:+12065550293" className="hover:underline">(206) 555-0293</a></p>
                <p><a href="mailto:recover@summitptrehab.com" className="hover:underline">recover@summitptrehab.com</a></p>
                <p><a href="https://maps.google.com/?q=5423+Sand+Point+Way+NE+Seattle+WA+98105" target="_blank" rel="noopener noreferrer" className="hover:underline">5423 Sand Point Way NE, Seattle, WA 98105</a></p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm" style={{ color: MUTED }}>
              <Heartbeat size={14} weight="fill" style={{ color: BLUE }} />
              <span>Summit PT &amp; Rehab &copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: "#94a3b8" }}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
              <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Built by <a href="https://bluejayportfolio.com/audit" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>BlueJays</a>{" "}— get your free site audit</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
