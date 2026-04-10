"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Star,
  ShieldCheck,
  ChartLineUp,
  Calculator,
  CurrencyDollar,
  Briefcase,
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Quotes,
  X,
  List,
  CalendarCheck,
  Buildings,
  Users,
  Scales,
  FileText,
  Receipt,
  Handshake,
  TrendUp,
  Bank,
  Wallet,
  Medal,
} from "@phosphor-icons/react";

/* ───────────────────────── SPRING CONFIG ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: spring },
};

/* ───────────────────────── COLORS ───────────────────────── */
const BG = "#0a0f1a";
const NAVY = "#1e3a5f";
const GOLD = "#c9a227";
const GOLD_LIGHT = "#e0be4a";
const GOLD_GLOW = "rgba(201, 162, 39, 0.12)";
const NAVY_GLOW = "rgba(30, 58, 95, 0.15)";

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 6,
    size: 1.5 + Math.random() * 2.5,
    opacity: 0.1 + Math.random() * 0.2,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: GOLD_LIGHT, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── UTILITY COMPONENTS ───────────────────────── */
function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return <motion.section ref={ref} id={id} className={className} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>{children}</motion.section>;
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
}

function MagneticButton({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => { if (!ref.current || isTouchDevice) return; const rect = ref.current.getBoundingClientRect(); x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25); y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25); }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const words = text.split(" ");
  return (
    <motion.span ref={ref} className={`inline-flex flex-wrap gap-x-3 ${className}`} variants={stagger} initial="hidden" animate={isInView ? "show" : "hidden"}>
      {words.map((word, i) => (<motion.span key={i} variants={fadeUp} className="inline-block">{word}</motion.span>))}
    </motion.span>
  );
}

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${GOLD}, transparent, ${NAVY}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── HERO CHART SVG ───────────────────────── */
function ChartHeroIcon() {
  return (
    <motion.div className="relative flex items-center justify-center" style={{ perspective: 800, willChange: "transform" }}>
      <motion.div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${GOLD_GLOW} 0%, transparent 70%)`, filter: "blur(30px)" }} animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      <svg viewBox="0 0 140 120" className="relative z-10 w-52 h-44 md:w-72 md:h-60" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Bar chart */}
        <motion.rect x="15" y="80" width="16" height="30" rx="3" stroke={GOLD} strokeWidth="2" fill="none" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1, delay: 0.3, ease: "easeOut" }} style={{ transformOrigin: "15px 110px" }} />
        <motion.rect x="40" y="55" width="16" height="55" rx="3" stroke={GOLD} strokeWidth="2" fill="none" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1, delay: 0.5, ease: "easeOut" }} style={{ transformOrigin: "40px 110px" }} />
        <motion.rect x="65" y="40" width="16" height="70" rx="3" stroke={GOLD} strokeWidth="2" fill="none" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1, delay: 0.7, ease: "easeOut" }} style={{ transformOrigin: "65px 110px" }} />
        <motion.rect x="90" y="25" width="16" height="85" rx="3" stroke={GOLD_LIGHT} strokeWidth="2" fill="none" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1, delay: 0.9, ease: "easeOut" }} style={{ transformOrigin: "90px 110px" }} />
        <motion.rect x="115" y="10" width="16" height="100" rx="3" stroke={GOLD_LIGHT} strokeWidth="2.5" fill="none" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1, delay: 1.1, ease: "easeOut" }} style={{ transformOrigin: "115px 110px" }} />
        {/* Trend line */}
        <motion.path d="M23 78 L48 53 L73 38 L98 23 L123 8" stroke={GOLD_LIGHT} strokeWidth="2" strokeLinecap="round" fill="none" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.6 }} transition={{ duration: 2, delay: 1.3 }} />
        {/* Sparkle */}
        <motion.circle cx="123" cy="8" r="4" fill={GOLD_LIGHT} animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }} transition={{ duration: 2, repeat: Infinity }} />
      </svg>
    </motion.div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Tax Preparation", description: "Personal and business tax preparation, planning, and filing. We maximize your deductions and ensure full compliance with federal, state, and local tax codes.", icon: FileText },
  { title: "Bookkeeping", description: "Accurate, up-to-date books with monthly reconciliation, categorization, and financial reporting. We integrate with QuickBooks, Xero, and FreshBooks.", icon: Receipt },
  { title: "Payroll Services", description: "Full-service payroll including tax withholdings, direct deposits, quarterly filings, W-2s, and 1099s. Eliminate payroll headaches and stay compliant.", icon: Wallet },
  { title: "Business Consulting", description: "Strategic guidance for startups and growing businesses. Entity selection, cash flow optimization, growth planning, and exit strategies tailored to your goals.", icon: Briefcase },
  { title: "Audit & Assurance", description: "Independent audits, reviews, and compilations for businesses needing assurance services. We provide clarity and confidence in your financial statements.", icon: Scales },
  { title: "Financial Planning", description: "Comprehensive wealth management, retirement planning, investment advisory, and estate planning. Build a roadmap to your financial goals.", icon: ChartLineUp },
];

const stats = [
  { value: "$47M+", label: "Taxes Saved for Clients" },
  { value: "1,200+", label: "Clients Served" },
  { value: "99.8%", label: "Filing Accuracy" },
  { value: "18+", label: "Years of Excellence" },
];

const testimonials = [
  { name: "Michael R.", text: "They saved our company over $120K in taxes last year through strategic planning I never knew was possible. Their expertise in business tax law is unmatched.", rating: 5 },
  { name: "Sandra K.", text: "After years of doing my own taxes, I finally hired professionals. They found deductions I had missed for years and the peace of mind is worth every penny.", rating: 5 },
  { name: "Tom & Lisa B.", text: "The financial planning team helped us create a retirement roadmap. For the first time, we feel confident about our financial future. Truly caring advisors.", rating: 5 },
];

const processSteps = [
  { step: "01", title: "Discovery Call", description: "We learn about your financial situation, goals, and challenges. No jargon, just a clear conversation about where you are and where you want to be." },
  { step: "02", title: "Analysis", description: "Our team reviews your financial documents, identifies opportunities, and develops a customized strategy tailored to your specific needs." },
  { step: "03", title: "Implementation", description: "We execute the plan with precision, whether that is tax filing, setting up payroll, or restructuring your books for maximum efficiency." },
  { step: "04", title: "Ongoing Support", description: "Year-round advisory support, quarterly reviews, and proactive tax planning. We are your financial partner, not just a seasonal service." },
];

const industries = [
  { name: "Healthcare", icon: Medal },
  { name: "Real Estate", icon: Buildings },
  { name: "Technology", icon: ChartLineUp },
  { name: "Retail & E-Commerce", icon: CurrencyDollar },
  { name: "Construction", icon: Buildings },
  { name: "Professional Services", icon: Briefcase },
  { name: "Restaurants & Hospitality", icon: Handshake },
  { name: "Non-Profit", icon: Users },
];

const faqItems = [
  { q: "How much does a CPA firm cost?", a: "Our fees vary based on the complexity of your needs. Individual tax returns start at $350, business returns from $750. We always provide a clear quote before beginning any work." },
  { q: "Can you help with back taxes or IRS issues?", a: "Absolutely. We specialize in IRS representation, tax resolution, and filing back taxes. We negotiate on your behalf and work to minimize penalties and interest." },
  { q: "Do I need a CPA or can I use TurboTax?", a: "DIY software works for simple situations, but a CPA can identify deductions you might miss, provide strategic tax planning, and represent you in an audit. Most clients save more than our fees." },
  { q: "How do you keep my financial data secure?", a: "We use bank-level encryption, secure client portals, multi-factor authentication, and strict access controls. All team members are background-checked and bound by confidentiality agreements." },
  { q: "Do you work with businesses in other states?", a: "Yes. We serve clients nationwide with expertise in multi-state tax compliance. Our secure digital workflow makes remote collaboration seamless." },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2AccountingPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingParticles />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Bank size={24} weight="duotone" style={{ color: GOLD }} />
              <span className="text-lg font-bold tracking-tight text-white">Pinnacle Financial Group</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#process" className="hover:text-white transition-colors">Process</a>
              <a href="#industries" className="hover:text-white transition-colors">Industries</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white" style={{ background: NAVY }}>Free Consultation</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Services", href: "#services" }, { label: "Process", href: "#process" }, { label: "Industries", href: "#industries" }, { label: "Reviews", href: "#testimonials" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 30%, ${NAVY_GLOW} 0%, transparent 70%)` }} />
        <div className="mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          <div className="space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: GOLD }}>Certified Public Accountants</motion.p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Precision. Trust. Financial Growth." />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-400 max-w-md leading-relaxed">
              Strategic tax planning, meticulous bookkeeping, and trusted advisory services. We help individuals and businesses build wealth and minimize tax burden.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: NAVY }}>
                Schedule Consultation <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 321-9876
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><ShieldCheck size={16} weight="duotone" style={{ color: GOLD }} />Licensed CPAs</span>
              <span className="flex items-center gap-2"><TrendUp size={16} weight="duotone" style={{ color: GOLD }} />$47M+ Saved for Clients</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <ChartHeroIcon />
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {stats.map((s, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: GOLD }}>{s.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── SERVICES ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Our Services</p>
              <h2 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6"><WordReveal text="Comprehensive Financial Services" /></h2>
              <p className="text-slate-400 leading-relaxed max-w-md">From annual tax returns to year-round strategic advisory, every engagement is handled with precision, discretion, and a commitment to your financial success.</p>
            </div>
            <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {services.map((svc, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="overflow-hidden">
                    <button onClick={() => setOpenService(openService === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD_GLOW }}><svc.icon size={20} weight="duotone" style={{ color: GOLD }} /></div>
                        <span className="text-lg font-semibold text-white">{svc.title}</span>
                      </div>
                      <motion.div animate={{ rotate: openService === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400" /></motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {openService === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                          <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed pl-[4.5rem]">{svc.description}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── ABOUT ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 50% at 80% 50%, ${NAVY_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
            <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80" alt="Professional accounting team reviewing financial documents" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>About Our Firm</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6"><WordReveal text="18 Years of Financial Excellence" /></h2>
            <p className="text-slate-400 leading-relaxed mb-4">Pinnacle Financial Group was founded on the belief that every individual and business deserves access to sophisticated financial strategies, not just the wealthy.</p>
            <p className="text-slate-400 leading-relaxed mb-6">Our team of licensed CPAs, enrolled agents, and financial advisors brings deep industry expertise and a personal touch to every engagement. We take the time to understand your goals and build strategies that compound over time.</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm"><Calculator size={18} weight="duotone" style={{ color: GOLD }} /><span className="text-slate-300">Licensed CPAs</span></div>
              <div className="flex items-center gap-2 text-sm"><Users size={18} weight="duotone" style={{ color: GOLD }} /><span className="text-slate-300">12 Team Members</span></div>
              <div className="flex items-center gap-2 text-sm"><ShieldCheck size={18} weight="duotone" style={{ color: GOLD }} /><span className="text-slate-300">IRS Enrolled Agents</span></div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── PROCESS ─── */}
      <SectionReveal id="process" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Our Approach</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="How We Work With You" /></h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {processSteps.map((step, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-5xl font-black opacity-5 text-white">{step.step}</div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>Step {step.step}</p>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Client Testimonials</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Trusted by Businesses" /></h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: GOLD }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: GOLD }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── INDUSTRIES SERVED ─── */}
      <SectionReveal id="industries" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${GOLD_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Specializations</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Industries We Serve" /></h2>
          </div>
          <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {industries.map((ind, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-5 text-center h-full">
                  <ind.icon size={28} weight="duotone" style={{ color: GOLD }} className="mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white">{ind.name}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Common Questions</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Frequently Asked Questions" /></h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {faqItems.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
                    <span className="text-base font-semibold text-white pr-4">{faq.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400" /></motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                        <p className="px-5 pb-5 text-slate-400 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── CONTACT ─── */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6"><WordReveal text="Let Us Grow Your Wealth" /></h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">Schedule your complimentary consultation today. We will review your current financial situation and show you exactly how we can help you save more, earn more, and worry less.</p>
              <div className="flex flex-wrap gap-4">
                <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: NAVY }}>
                  <CalendarCheck size={20} weight="duotone" /> Book Consultation
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                  <Phone size={18} weight="duotone" /> Call Us
                </MagneticButton>
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4"><MapPin size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-white">Office</p><p className="text-sm text-slate-400">200 Financial Plaza, Suite 1500<br />Chicago, IL 60601</p></div></div>
                <div className="flex items-start gap-4"><Phone size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-white">Phone</p><p className="text-sm text-slate-400">(555) 321-9876</p></div></div>
                <div className="flex items-start gap-4"><Clock size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400">Monday - Friday: 8:30 AM - 5:30 PM<br />Saturday: By Appointment<br />Tax Season: Extended Hours</p></div></div>
                <div className="flex items-start gap-4"><Handshake size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-white">Consultation</p><p className="text-sm text-slate-400">First consultation is always free.<br />No obligation, no pressure.</p></div></div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── CTA BANNER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Tax Season Special</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">New Client Offer</h2>
                <p className="text-slate-400 text-lg mb-2">Free tax review and strategy session for new business clients</p>
                <p className="text-5xl md:text-6xl font-bold tracking-tighter mb-6" style={{ color: GOLD }}>$0</p>
                <p className="text-slate-500 text-sm mb-8">Normally a $500 value — limited availability</p>
                <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: NAVY }}>
                  <CalendarCheck size={20} weight="duotone" /> Claim Your Free Review
                </MagneticButton>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Bank size={16} weight="duotone" style={{ color: GOLD }} />
            <span>Pinnacle Financial Group &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>
    </main>
  );
}
