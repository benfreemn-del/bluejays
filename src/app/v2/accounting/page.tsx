"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useRef, useCallback, useEffect } from "react";
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
  Envelope,
  House,
  Storefront,
  Stethoscope,
  Desktop,
  CookingPot,
  UserCircle,
  Target,
  Notebook,
  Warning,
  CaretRight,
  Lightning,
  Trophy,
  Gear,
  Eye,
  CreditCard,
  Timer,
  Certificate,
  Gavel,
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
const BG = "#0f172a";
const NAVY = "#1e3a5f";
const GOLD = "#ca8a04";
const GOLD_LIGHT = "#eab308";
const EMERALD = "#059669";
const EMERALD_LIGHT = "#10b981";
const GOLD_GLOW = "rgba(202, 138, 4, 0.12)";
const EMERALD_GLOW = "rgba(5, 150, 105, 0.10)";
const NAVY_GLOW = "rgba(30, 58, 95, 0.18)";

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 8 + Math.random() * 6,
    size: 1.5 + Math.random() * 2.5,
    opacity: 0.08 + Math.random() * 0.15,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: GOLD_LIGHT, willChange: "transform, opacity" }}
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
  return (
    <motion.section ref={ref} id={id} className={className} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>
      {children}
    </motion.section>
  );
}

function GlassCard({ children, className = "", style, id, onClick, href }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; id?: string; onClick?: () => void; href?: string }) {
  if (href) {
    return (
      <a href={href} id={id} onClick={onClick} className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`} style={style}>
        {children}
      </a>
    );
  }
  return (
    <div id={id} onClick={onClick} className={`rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`} style={style}>
      {children}
    </div>
  );
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
  return (
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${GOLD}, transparent, ${EMERALD}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── ANIMATED COUNTER ───────────────────────── */
function AnimatedCounter({ target, prefix = "", suffix = "", duration = 2 }: { target: number; prefix?: string; suffix?: string; duration?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = target / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else { setValue(Math.floor(start)); }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);
  return <span ref={ref}>{prefix}{value.toLocaleString()}{suffix}</span>;
}

/* ───────────────────────── HERO DASHBOARD GLASS CARDS ───────────────────────── */
function DashboardHero() {
  const dashCards = [
    { label: "Tax Savings", value: 47200, prefix: "$", suffix: "", color: EMERALD },
    { label: "Returns Filed", value: 2800, prefix: "", suffix: "+", color: GOLD },
    { label: "Client Satisfaction", value: 99, prefix: "", suffix: "%", color: GOLD_LIGHT },
  ];
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Glow backdrop */}
      <div className="absolute inset-0 rounded-3xl" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${GOLD_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }} />
      <div className="relative flex flex-col gap-4">
        {dashCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 40, x: i % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ ...spring, delay: 0.4 + i * 0.2 }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
            >
              <GlassCard className="p-5 md:p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">{card.label}</p>
                  <p className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: card.color }}>
                    <AnimatedCounter target={card.value} prefix={card.prefix} suffix={card.suffix} duration={2.5} />
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                  {i === 0 && <TrendUp size={24} weight="duotone" style={{ color: card.color }} />}
                  {i === 1 && <FileText size={24} weight="duotone" style={{ color: card.color }} />}
                  {i === 2 && <Star size={24} weight="duotone" style={{ color: card.color }} />}
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        ))}
        {/* Mini chart decoration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...spring, delay: 1.2 }}
          className="absolute -top-6 -right-6 hidden lg:block"
        >
          <GlassCard className="p-3">
            <svg viewBox="0 0 80 40" className="w-20 h-10" fill="none">
              <motion.path
                d="M5 35 L15 28 L25 30 L35 18 L45 22 L55 12 L65 15 L75 5"
                stroke={EMERALD}
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 1.5 }}
              />
              <motion.circle cx="75" cy="5" r="3" fill={EMERALD} animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 2, repeat: Infinity }} />
            </svg>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Tax Preparation", description: "Personal and business tax preparation with maximum deduction strategies. Robert Chen personally reviews every return to ensure compliance and optimal savings across federal, state, and local codes.", icon: FileText },
  { title: "Bookkeeping", description: "Accurate monthly reconciliation, categorization, and financial reporting integrated with QuickBooks, Xero, or FreshBooks. Clean books mean fewer surprises at tax time.", icon: Receipt },
  { title: "Payroll Services", description: "Full-service payroll including tax withholdings, direct deposits, quarterly filings, W-2s, and 1099s. Eliminate payroll headaches and stay compliant year-round.", icon: Wallet },
  { title: "Business Advisory", description: "Strategic guidance for growing businesses. Entity selection, cash flow optimization, growth planning, and exit strategies tailored to your unique goals by a former Big 4 advisor.", icon: Briefcase },
  { title: "IRS Resolution", description: "Back taxes, audits, liens, levies, and payment plans. We negotiate directly with the IRS on your behalf to minimize penalties and get you back on track.", icon: Gavel },
  { title: "Estate Planning", description: "Wealth transfer strategies, trust structures, and tax-efficient succession planning. Protect what you have built and create a legacy for future generations.", icon: Scales },
  { title: "QuickBooks Setup", description: "Full QuickBooks implementation, chart of accounts configuration, integrations, and staff training. Get your financial systems running cleanly from day one.", icon: Gear },
  { title: "CFO Services", description: "Fractional CFO services for businesses that need strategic financial leadership without the full-time cost. Cash flow forecasting, budgeting, and KPI dashboards.", icon: ChartLineUp },
];

const industries = [
  { name: "Real Estate Investors", icon: House, desc: "1031 exchanges, depreciation, cost segregation studies, and rental income optimization" },
  { name: "Small Business", icon: Storefront, desc: "Entity structuring, quarterly estimates, payroll, and year-end tax strategies" },
  { name: "Healthcare", icon: Stethoscope, desc: "Practice management, HIPAA-compliant bookkeeping, and medical deductions" },
  { name: "Tech Startups", icon: Desktop, desc: "R&D tax credits, equity compensation planning, and burn rate analysis" },
  { name: "Restaurants", icon: CookingPot, desc: "Tip reporting, inventory accounting, multi-location consolidation, and FICA tip credits" },
  { name: "Freelancers", icon: UserCircle, desc: "Self-employment tax optimization, quarterly estimates, and home office deductions" },
];

const testimonials = [
  { name: "David Park", role: "Real Estate Investor", text: "Robert saved us $23,000 on first-year depreciation through a cost segregation study I didn't know existed. His real estate tax knowledge is unmatched in Seattle.", rating: 5, savings: "$23K saved" },
  { name: "Jennifer Liu", role: "Tech Startup CEO", text: "Switching from TurboTax to Evergreen was the best business decision we made. They found $41,000 in R&D credits we had been leaving on the table for three years.", rating: 5, savings: "$41K in credits" },
  { name: "Marcus & Elena Torres", role: "Restaurant Owners", text: "They restructured our two locations' books and saved us over $18,000 annually. The QuickBooks setup alone was worth the investment.", rating: 5, savings: "$18K annually" },
  { name: "Patricia Nguyen", role: "Freelance Consultant", text: "After an IRS audit notice, Robert handled everything. Not only did we owe nothing extra, but they actually found a $3,200 refund I was owed. Incredible peace of mind.", rating: 5, savings: "$3.2K refund" },
  { name: "Andrew Kowalski", role: "Healthcare Practice Owner", text: "Robert's team manages our entire financial operation. Payroll, bookkeeping, tax planning, everything. We can focus on patients instead of spreadsheets.", rating: 5, savings: "Full-service" },
];

const processSteps = [
  { step: "01", title: "Free Consultation", description: "We review your current financial situation, identify opportunities, and outline exactly how we can help. No jargon, no obligation." },
  { step: "02", title: "Document Collection", description: "Securely upload your documents through our encrypted client portal. We organize everything and flag anything missing before we begin." },
  { step: "03", title: "Expert Analysis", description: "Robert and the team analyze your finances, identify every legitimate deduction, and develop a customized strategy for maximum savings." },
  { step: "04", title: "Year-Round Support", description: "Tax planning is not seasonal. We provide quarterly reviews, proactive advisory, and are always a phone call away when questions arise." },
];

const taxDeadlines = [
  { date: "Jan 15", label: "Q4 Estimated Tax Payment", note: "Final quarterly payment for prior year" },
  { date: "Apr 15", label: "Individual & Q1 Payment", note: "Tax returns due + first quarterly estimate" },
  { date: "Jun 15", label: "Q2 Estimated Tax Payment", note: "Second quarterly estimated payment" },
  { date: "Sep 15", label: "Q3 Estimated Tax & Extensions", note: "Third quarterly + extended business returns" },
  { date: "Oct 15", label: "Extended Individual Returns", note: "Final deadline for extended personal returns" },
];

const comparisonRows = [
  { feature: "Personalized tax strategy", us: true, them: "No" },
  { feature: "IRS audit representation", us: true, them: "Extra cost" },
  { feature: "Year-round advisory", us: true, them: "Seasonal only" },
  { feature: "Real estate tax expertise", us: true, them: "Limited" },
  { feature: "Bookkeeping integration", us: true, them: "Separate" },
  { feature: "Human CPA review", us: true, them: "Algorithmic" },
  { feature: "Average client savings", us: true, them: "$0 - $200" },
];

const faqItems = [
  { q: "What makes Evergreen different from other CPA firms?", a: "Robert Chen brings 20 years of experience including Big 4 training. We specialize in small business and real estate investor tax strategy, not just filing. Our average client saves over $3,200 more than they did with DIY software." },
  { q: "Can you help with back taxes or IRS issues?", a: "Absolutely. We handle IRS representation, tax resolution, audit defense, and back tax filing. Robert negotiates directly with the IRS on your behalf to minimize penalties and get you back in good standing." },
  { q: "Do I really need a CPA if I use QuickBooks?", a: "QuickBooks tracks your numbers, but a CPA interprets them. We ensure your chart of accounts is correct, identify tax-saving opportunities the software misses, and provide the strategic oversight that turns bookkeeping into wealth building." },
  { q: "How do you keep my financial data secure?", a: "Bank-level 256-bit encryption, SOC 2 compliant client portal, multi-factor authentication, and strict access controls. All team members are background-checked and bound by confidentiality agreements." },
  { q: "What does a typical engagement cost?", a: "Individual returns start at $299, business returns from $599, and full-service bookkeeping packages begin at $499 per month. We always provide a clear, upfront quote before beginning any work. Most clients save multiples of our fee." },
];

const pricingTiers = [
  { name: "Individual Returns", price: "$299", period: "starting at", features: ["Federal + state filing", "Deduction optimization", "E-file with direct deposit", "Audit support included", "Prior year comparison"], icon: FileText, popular: false },
  { name: "Business Returns", price: "$599", period: "starting at", features: ["S-Corp, LLC, Partnership", "Quarterly estimate planning", "Depreciation schedules", "Multi-state filing", "Year-end tax strategy call"], icon: Briefcase, popular: true },
  { name: "Full-Service Bookkeeping", price: "$499", period: "per month", features: ["Monthly reconciliation", "Financial statements", "Payroll processing", "QuickBooks management", "Dedicated bookkeeper"], icon: Receipt, popular: false },
];

const quizOptions = [
  { label: "Personal Tax Filing", desc: "Annual return with maximum deductions", icon: FileText, rec: "Individual Returns package" },
  { label: "Business Tax Strategy", desc: "Entity optimization and quarterly planning", icon: Briefcase, rec: "Business Advisory + Tax Prep" },
  { label: "Bookkeeping & Payroll", desc: "Ongoing monthly financial management", icon: Receipt, rec: "Full-Service Bookkeeping package" },
  { label: "IRS Problem", desc: "Back taxes, audits, or notices", icon: Warning, rec: "IRS Resolution consultation" },
];

const taxBrackets = [
  { range: "$0 - $44,725", rate: "10-12%", savings: "$800 - $2,400" },
  { range: "$44,726 - $95,375", rate: "22%", savings: "$2,400 - $5,800" },
  { range: "$95,376 - $182,100", rate: "24%", savings: "$5,800 - $12,500" },
  { range: "$182,101 - $231,250", rate: "32%", savings: "$12,500 - $19,000" },
  { range: "$231,251+", rate: "35-37%", savings: "$19,000+" },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2AccountingPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [selectedBracket, setSelectedBracket] = useState(2);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  /* auto-rotate testimonials */
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingParticles />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Bank size={24} weight="duotone" style={{ color: GOLD }} />
              <span className="text-lg font-bold tracking-tight text-white">Evergreen Tax & Advisory</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#calculator" className="hover:text-white transition-colors">Savings</a>
              <a href="#industries" className="hover:text-white transition-colors">Industries</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white" style={{ background: GOLD }}>Free Consultation</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Services", href: "#services" }, { label: "Savings", href: "#calculator" }, { label: "Industries", href: "#industries" }, { label: "Pricing", href: "#pricing" }, { label: "Reviews", href: "#testimonials" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ═══════════════ SECTION 1: HERO — DASHBOARD/CALCULATOR ═══════════════ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 50% at 30% 40%, ${NAVY_GLOW} 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 70% 60%, ${GOLD_GLOW} 0%, transparent 60%)` }} />
        <div className="mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: GOLD }}>
                Robert Chen, CPA, PFS &mdash; 20 Years Experience
              </motion.p>
              <h1 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Your Numbers. Our Expertise." />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-400 max-w-md leading-relaxed">
              Former Big 4 CPA specializing in small business and real estate investor tax strategy. Seattle businesses trust Robert Chen to find every dollar they deserve.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: GOLD }}>
                Free Tax Consultation <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (206) 555-0347
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><ShieldCheck size={16} weight="duotone" style={{ color: GOLD }} />Licensed CPA</span>
              <span className="flex items-center gap-2"><Medal size={16} weight="duotone" style={{ color: GOLD }} />Former Big 4</span>
              <span className="flex items-center gap-2"><Star size={16} weight="duotone" style={{ color: GOLD }} />4.9 Rating</span>
            </motion.div>
          </div>
          {/* Dashboard glass cards */}
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:block">
            <DashboardHero />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ SECTION 2: TRUST BAR ═══════════════ */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {[
                { value: "$3.2M+", label: "Tax Savings Delivered" },
                { value: "2,800+", label: "Returns Filed" },
                { value: "20", label: "Years Experience" },
                { value: "99%", label: "Client Retention" },
              ].map((s, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: GOLD }}>{s.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══════════════ SECTION 3: SERVICES ACCORDION ═══════════════ */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Our Services</p>
              <h2 className="text-3xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Comprehensive Financial Services" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">From annual tax returns to year-round CFO services, every engagement is handled by Robert Chen and his team with precision, discretion, and a commitment to your financial success.</p>
            </div>
            <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {services.map((svc, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="overflow-hidden">
                    <button onClick={() => setOpenService(openService === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD_GLOW }}>
                          <svc.icon size={20} weight="duotone" style={{ color: GOLD }} />
                        </div>
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

      {/* ═══════════════ SECTION 4: TAX SAVINGS CALCULATOR ═══════════════ */}
      <SectionReveal id="calculator" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 50% at 20% 50%, ${EMERALD_GLOW} 0%, transparent 60%)` }} />
        <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: EMERALD }}>Tax Savings Calculator</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="How Much Could You Save?" />
            </h2>
          </div>
          <GlassCard className="p-6 md:p-10">
            <p className="text-sm text-slate-400 mb-6 text-center">Select your income bracket to see estimated annual savings with professional CPA tax strategy:</p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-8">
              {taxBrackets.map((bracket, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedBracket(i)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${selectedBracket === i ? "border-emerald-500/50 bg-emerald-500/10" : "border-white/15 hover:border-white/20"}`}
                >
                  <p className="text-xs text-slate-400 mb-1">{bracket.range}</p>
                  <p className="text-sm font-semibold" style={{ color: selectedBracket === i ? EMERALD : "#94a3b8" }}>{bracket.rate}</p>
                </button>
              ))}
            </div>
            <motion.div
              key={selectedBracket}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              className="text-center"
            >
              <p className="text-slate-400 text-sm mb-2">Estimated Annual Savings with Evergreen Tax & Advisory</p>
              <p className="text-5xl md:text-6xl font-bold tracking-tighter" style={{ color: EMERALD }}>{taxBrackets[selectedBracket].savings}</p>
              <p className="text-slate-500 text-sm mt-3">Based on average client results in this income bracket</p>
              <MagneticButton className="mt-6 px-8 py-3 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: EMERALD }}>
                Get Your Free Estimate <ArrowRight size={16} weight="bold" />
              </MagneticButton>
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══════════════ SECTION 5: ABOUT ROBERT CHEN ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 50% at 80% 50%, ${NAVY_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80" alt="Robert Chen CPA portrait" className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <GlassCard className="p-4 flex items-center gap-3">
                <Certificate size={24} weight="duotone" style={{ color: GOLD }} />
                <div>
                  <p className="text-sm font-semibold text-white">Robert Chen, CPA, PFS</p>
                  <p className="text-xs text-slate-400">Personal Financial Specialist</p>
                </div>
              </GlassCard>
            </div>
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Meet Your CPA</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
              <WordReveal text="20 Years. Former Big 4. Your Advantage." />
            </h2>
            <p className="text-slate-400 leading-relaxed mb-4">Robert Chen founded Evergreen Tax & Advisory in Seattle with a clear mission: bring Big 4 level financial strategy to small businesses and individual investors who deserve better than DIY software.</p>
            <p className="text-slate-400 leading-relaxed mb-6">With two decades of experience and a Personal Financial Specialist designation, Robert has helped over 2,800 clients navigate complex tax situations, from first-year real estate depreciation to multi-state business filings.</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm"><ShieldCheck size={18} weight="duotone" style={{ color: GOLD }} /><span className="text-slate-300">Licensed CPA</span></div>
              <div className="flex items-center gap-2 text-sm"><Medal size={18} weight="duotone" style={{ color: GOLD }} /><span className="text-slate-300">PFS Designation</span></div>
              <div className="flex items-center gap-2 text-sm"><Buildings size={18} weight="duotone" style={{ color: GOLD }} /><span className="text-slate-300">Former Big 4</span></div>
              <div className="flex items-center gap-2 text-sm"><Users size={18} weight="duotone" style={{ color: GOLD }} /><span className="text-slate-300">2,800+ Clients</span></div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ SECTION 6: INDUSTRY SPECIALTIES ═══════════════ */}
      <SectionReveal id="industries" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${GOLD_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Specializations</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Industries We Serve" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {industries.map((ind, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full group hover:border-yellow-600/30 transition-colors">
                  <ind.icon size={32} weight="duotone" style={{ color: GOLD }} className="mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">{ind.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{ind.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════ SECTION 7: WHAT TAX HELP DO YOU NEED? QUIZ ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Find Your Solution</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What Tax Help Do You Need?" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {quizOptions.map((opt, i) => (
              <motion.div key={i} variants={fadeUp}>
                <button
                  onClick={() => setQuizChoice(quizChoice === i ? null : i)}
                  className="w-full text-left cursor-pointer"
                >
                  <GlassCard className={`p-6 h-full transition-all ${quizChoice === i ? "border-yellow-600/40 bg-yellow-600/5" : "hover:border-white/20"}`}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: quizChoice === i ? `${GOLD}20` : GOLD_GLOW }}>
                        <opt.icon size={20} weight="duotone" style={{ color: GOLD }} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white mb-1">{opt.label}</h3>
                        <p className="text-sm text-slate-400">{opt.desc}</p>
                      </div>
                    </div>
                  </GlassCard>
                </button>
              </motion.div>
            ))}
          </motion.div>
          <AnimatePresence>
            {quizChoice !== null && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring} className="mt-8">
                <GlassCard className="p-6 text-center" style={{ borderColor: `${EMERALD}40` }}>
                  <CheckCircle size={32} weight="duotone" style={{ color: EMERALD }} className="mx-auto mb-3" />
                  <p className="text-white font-semibold mb-1">We recommend: {quizOptions[quizChoice].rec}</p>
                  <p className="text-sm text-slate-400 mb-4">Schedule a free consultation with Robert to discuss your specific situation.</p>
                  <MagneticButton className="px-8 py-3 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: GOLD }}>
                    <Phone size={16} weight="duotone" /> Call (206) 555-0347
                  </MagneticButton>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionReveal>

      {/* ═══════════════ SECTION 8: PROCESS ═══════════════ */}
      <SectionReveal id="process" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>How It Works</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Your Path to Financial Clarity" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {processSteps.map((step, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-5xl font-black opacity-5 text-white">{step.step}</div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>Step {step.step}</p>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                  {i < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <CaretRight size={20} style={{ color: GOLD }} className="opacity-40" />
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════ SECTION 9: CPA vs DIY COMPARISON ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 40% at 50% 50%, ${NAVY_GLOW} 0%, transparent 60%)` }} />
        <div className="relative z-10 mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>The Difference</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Evergreen vs. DIY Tax Software" />
            </h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="grid grid-cols-3 p-4 border-b border-white/8 text-center">
              <p className="text-sm font-semibold text-slate-400">Feature</p>
              <p className="text-sm font-semibold" style={{ color: EMERALD }}>Evergreen Tax</p>
              <p className="text-sm font-semibold text-slate-400">DIY Software</p>
            </div>
            {comparisonRows.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 p-4 items-center text-center ${i < comparisonRows.length - 1 ? "border-b border-white/8" : ""}`}>
                <p className="text-sm text-slate-300 text-left">{row.feature}</p>
                <div className="flex justify-center">
                  <CheckCircle size={20} weight="fill" style={{ color: EMERALD }} />
                </div>
                <p className="text-sm text-slate-500">{row.them}</p>
              </div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══════════════ SECTION 10: PRICING ═══════════════ */}
      <SectionReveal id="pricing" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Transparent Pricing</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Investment in Your Financial Future" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {pricingTiers.map((tier, i) => (
              <motion.div key={i} variants={fadeUp}>
                {tier.popular ? (
                  <ShimmerBorder>
                    <div className="p-6 md:p-8">
                      <div className="flex items-center justify-between mb-4">
                        <tier.icon size={28} weight="duotone" style={{ color: GOLD }} />
                        <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: `${GOLD}20`, color: GOLD }}>Most Popular</span>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-1">{tier.name}</h3>
                      <p className="text-sm text-slate-400 mb-4">{tier.period}</p>
                      <p className="text-4xl font-bold tracking-tight mb-6" style={{ color: GOLD }}>{tier.price}</p>
                      <ul className="space-y-3 mb-6">
                        {tier.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                            <CheckCircle size={16} weight="fill" style={{ color: EMERALD }} />{f}
                          </li>
                        ))}
                      </ul>
                      <MagneticButton className="w-full py-3 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: GOLD }}>Get Started</MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-6 md:p-8 h-full flex flex-col">
                    <tier.icon size={28} weight="duotone" style={{ color: GOLD }} className="mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-1">{tier.name}</h3>
                    <p className="text-sm text-slate-400 mb-4">{tier.period}</p>
                    <p className="text-4xl font-bold tracking-tight mb-6" style={{ color: GOLD }}>{tier.price}</p>
                    <ul className="space-y-3 mb-6 flex-1">
                      {tier.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                          <CheckCircle size={16} weight="fill" style={{ color: EMERALD }} />{f}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton className="w-full py-3 rounded-full text-sm font-semibold text-white border border-white/15 cursor-pointer">Get Started</MagneticButton>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </motion.div>
          <p className="text-center text-sm text-slate-500 mt-8">All pricing is transparent and provided upfront. No surprise fees, ever.</p>
        </div>
      </SectionReveal>

      {/* ═══════════════ SECTION 11: TAX CALENDAR ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 40% at 70% 50%, ${EMERALD_GLOW} 0%, transparent 60%)` }} />
        <div className="relative z-10 mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: EMERALD }}>Never Miss a Deadline</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Key Tax Deadlines" />
            </h2>
          </div>
          <motion.div className="space-y-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {taxDeadlines.map((dl, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-5 flex items-center gap-5">
                  <div className="w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ background: `${EMERALD}15`, border: `1px solid ${EMERALD}30` }}>
                    <CalendarCheck size={20} weight="duotone" style={{ color: EMERALD }} />
                    <p className="text-[10px] font-bold mt-0.5" style={{ color: EMERALD }}>{dl.date}</p>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{dl.label}</h3>
                    <p className="text-sm text-slate-400">{dl.note}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
          <p className="text-center text-sm text-slate-500 mt-8">Evergreen clients receive automated deadline reminders and proactive filing support.</p>
        </div>
      </SectionReveal>

      {/* ═══════════════ SECTION 12: GOOGLE REVIEWS HEADER + TESTIMONIALS ═══════════════ */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-6">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Client Success Stories</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">
              <WordReveal text="Real Savings. Real Results." />
            </h2>
            {/* Google reviews header */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} weight="fill" style={{ color: GOLD }} />
              ))}
            </div>
            <p className="text-sm text-slate-400">4.9 average from 180+ Google reviews</p>
          </div>

          {/* Auto-rotating testimonial carousel with savings badges */}
          <div className="mt-12 max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={spring}
              >
                <GlassCard className="p-8 md:p-10">
                  <div className="flex items-center justify-between mb-4">
                    <Quotes size={36} weight="fill" style={{ color: GOLD }} className="opacity-40" />
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: `${EMERALD}20`, color: EMERALD }}>
                      {testimonials[activeTestimonial].savings}
                    </span>
                  </div>
                  <p className="text-lg text-slate-300 leading-relaxed mb-6">{testimonials[activeTestimonial].text}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-white">{testimonials[activeTestimonial].name}</p>
                      <p className="text-sm text-slate-400">{testimonials[activeTestimonial].role}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, j) => (
                        <Star key={j} size={14} weight="fill" style={{ color: GOLD }} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle size={14} weight="fill" style={{ color: EMERALD }} />
                    <span className="text-xs text-slate-500">Verified Client</span>
                  </div>
                </GlassCard>
              </motion.div>
            </AnimatePresence>
            {/* Dot navigation */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className="w-2.5 h-2.5 rounded-full transition-all cursor-pointer"
                  style={{ background: activeTestimonial === i ? GOLD : "rgba(255,255,255,0.15)" }}
                />
              ))}
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ SECTION 13: WHY CHOOSE A CPA ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 50% at 30% 50%, ${GOLD_GLOW} 0%, transparent 60%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>The CPA Advantage</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Why Work With a Licensed CPA?" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              { icon: ShieldCheck, title: "Licensed & Regulated", desc: "CPAs are state-licensed professionals bound by ethical standards and continuing education requirements." },
              { icon: Gavel, title: "IRS Representation", desc: "Only CPAs, attorneys, and enrolled agents can represent you before the IRS. DIY software cannot." },
              { icon: Target, title: "Strategic Planning", desc: "Proactive year-round tax planning, not just reactive annual filing. We find savings before deadlines." },
              { icon: Eye, title: "Audit Protection", desc: "If the IRS comes knocking, Robert stands beside you. Audit defense is included with every engagement." },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full">
                  <item.icon size={28} weight="duotone" style={{ color: GOLD }} className="mb-4" />
                  <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════ SECTION 14: VIDEO PLACEHOLDER ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="relative rounded-2xl overflow-hidden aspect-video cursor-pointer group">
            <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1000&q=80" alt="Modern accounting office interior" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
              <motion.div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `${GOLD}dd` }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <svg viewBox="0 0 24 24" className="w-8 h-8 ml-1" fill="white"><path d="M8 5v14l11-7z" /></svg>
              </motion.div>
            </div>
            <div className="absolute bottom-4 left-4">
              <GlassCard className="px-4 py-2">
                <p className="text-sm font-semibold text-white">Meet Robert Chen, CPA</p>
                <p className="text-xs text-slate-400">2:30 &mdash; Learn about our approach</p>
              </GlassCard>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ SECTION 15: CERTIFICATIONS & PARTNERS ═══════════════ */}
      <SectionReveal className="relative z-10 py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <p className="text-center text-sm uppercase tracking-widest mb-6 text-slate-500">Certifications & Affiliations</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Licensed CPA — WA State", "Personal Financial Specialist", "QuickBooks ProAdvisor", "AICPA Member", "WSCPA Member", "IRS Enrolled Agent"].map((badge, i) => (
              <GlassCard key={i} className="px-4 py-2.5 flex items-center gap-2">
                <Certificate size={14} weight="duotone" style={{ color: GOLD }} />
                <span className="text-xs font-semibold text-slate-300">{badge}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ SECTION 16: CLIENT SUCCESS STORIES (SPECIFIC SAVINGS) ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 40% at 50% 50%, ${EMERALD_GLOW} 0%, transparent 60%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: EMERALD }}>Proven Results</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Client Success Stories" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              { title: "Real Estate Investor", savings: "$23,000", strategy: "Cost Segregation Study", desc: "First-year bonus depreciation on a newly acquired rental property. The study paid for itself 10x over." },
              { title: "Tech Startup", savings: "$41,000", strategy: "R&D Tax Credits", desc: "Three years of unclaimed research and development credits recovered through amended returns." },
              { title: "Restaurant Group", savings: "$18,000/yr", strategy: "Entity Restructuring", desc: "Reorganized two locations under an S-Corp structure, optimizing payroll tax and FICA tip credits." },
              { title: "Freelance Consultant", savings: "$8,400", strategy: "Home Office + QBI", desc: "Maximized the qualified business income deduction and home office write-off for a solo consultant." },
              { title: "Healthcare Practice", savings: "$34,000", strategy: "Retirement Plan Setup", desc: "Implemented a SEP-IRA strategy that reduced taxable income while building retirement savings." },
              { title: "E-Commerce Business", savings: "$12,800", strategy: "Multi-State Nexus", desc: "Resolved overpaid sales tax nexus obligations and recovered two years of excess payments." },
            ].map((story, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{story.title}</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: `${EMERALD}20`, color: EMERALD }}>{story.savings} saved</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{story.strategy}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{story.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════ SECTION 17: ENHANCED SERVICE AREA ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Service Area</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Serving Greater Seattle & Beyond" />
            </h2>
          </div>
          <GlassCard className="p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <MapPin size={32} weight="duotone" style={{ color: GOLD }} className="mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white mb-2">Downtown Seattle Office</h3>
                <p className="text-sm text-slate-400">1201 3rd Ave, Suite 1800<br />Seattle, WA 98101</p>
              </div>
              <div className="text-center">
                <Lightning size={32} weight="duotone" style={{ color: EMERALD }} className="mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white mb-2">Remote-Friendly</h3>
                <p className="text-sm text-slate-400">Secure client portal for document uploads. Serving clients nationwide with multi-state expertise.</p>
              </div>
              <div className="text-center">
                <Timer size={32} weight="duotone" style={{ color: GOLD }} className="mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white mb-2">Response Time</h3>
                <p className="text-sm text-slate-400">Same-day email responses. Calls returned within 4 hours during business hours.</p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/8">
              <p className="text-center text-sm text-slate-500 mb-4">Local clients across the Puget Sound region</p>
              <div className="flex flex-wrap justify-center gap-3">
                {["Seattle", "Bellevue", "Redmond", "Kirkland", "Tacoma", "Renton", "Bothell", "Issaquah", "Mercer Island", "Woodinville"].map((area) => (
                  <span key={area} className="px-3 py-1 rounded-full text-xs border border-white/15 text-slate-400">{area}</span>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══════════════ SECTION 18: WHAT SETS US APART ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 40% 40% at 80% 50%, ${NAVY_GLOW} 0%, transparent 60%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>The Evergreen Difference</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Not Just a Tax Preparer" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">Most CPA firms file your return and disappear until next year. At Evergreen, Robert Chen and his team work with you year-round to build a proactive financial strategy that compounds savings over time.</p>
              <div className="space-y-4">
                {[
                  { label: "Proactive quarterly tax planning calls", icon: CalendarCheck },
                  { label: "Direct access to Robert via phone and email", icon: Phone },
                  { label: "Year-round advisory, not just seasonal filing", icon: Clock },
                  { label: "Industry-specific deduction strategies", icon: Target },
                  { label: "Transparent pricing with no surprise invoices", icon: CreditCard },
                ].map((item, i) => (
                  <motion.div key={i} className="flex items-center gap-3" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ ...spring, delay: i * 0.1 }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: GOLD_GLOW }}>
                      <item.icon size={16} weight="duotone" style={{ color: GOLD }} />
                    </div>
                    <p className="text-sm text-slate-300">{item.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img src="https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80" alt="Financial strategy planning session" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ SECTION 19: FAQ ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Common Questions</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Frequently Asked Questions" />
            </h2>
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

      {/* ═══════════════ SECTION 20: EMERGENCY / URGENCY ═══════════════ */}
      <SectionReveal className="relative z-10 py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6" style={{ borderColor: `${EMERALD}30` }}>
            <motion.div
              className="w-4 h-4 rounded-full shrink-0"
              style={{ background: EMERALD }}
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-semibold text-white mb-1">Tax Season Availability</h3>
              <p className="text-sm text-slate-400">Accepting new clients now. Extended hours January through April. Same-week appointments available for urgent filings.</p>
            </div>
            <MagneticButton className="px-6 py-3 rounded-full text-sm font-semibold text-white shrink-0 cursor-pointer" style={{ background: EMERALD }}>
              <Timer size={16} weight="duotone" className="inline mr-2" />Book This Week
            </MagneticButton>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══════════════ SECTION 21: CONTACT ═══════════════ */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Start Saving Today" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">Schedule your complimentary consultation with Robert Chen. We will review your current tax situation, identify opportunities, and show you exactly how much you could save this year.</p>
              <div className="flex flex-wrap gap-4">
                <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: GOLD }}>
                  <CalendarCheck size={20} weight="duotone" /> Book Free Consultation
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                  <Phone size={18} weight="duotone" /> (206) 555-0347
                </MagneticButton>
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Evergreen Tax & Advisory</h3>
              <div className="space-y-5">
                <a href="https://maps.google.com/?q=1201+3rd+Ave+Suite+1800+Seattle+WA+98101" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 hover:opacity-80 transition-opacity">
                  <MapPin size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Office</p>
                    <p className="text-sm text-slate-400">1201 3rd Ave, Suite 1800<br />Seattle, WA 98101</p>
                  </div>
                </a>
                <a href="tel:2065550347" className="flex items-start gap-4 hover:opacity-80 transition-opacity">
                  <Phone size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <p className="text-sm text-slate-400">(206) 555-0347</p>
                  </div>
                </a>
                <a href="mailto:hello@evergreentaxadvisory.com" className="flex items-start gap-4 hover:opacity-80 transition-opacity">
                  <Envelope size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Email</p>
                    <p className="text-sm text-slate-400">hello@evergreentaxadvisory.com</p>
                  </div>
                </a>
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Hours</p>
                    <p className="text-sm text-slate-400">Monday - Friday: 8:30 AM - 5:30 PM<br />Saturday: By Appointment<br />Tax Season (Jan-Apr): Extended Hours</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ SECTION 22: CTA BANNER ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>New Client Special</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Free Tax Strategy Session</h2>
                <p className="text-slate-400 text-lg mb-2">Comprehensive review of your tax situation with Robert Chen, CPA</p>
                <p className="text-5xl md:text-6xl font-bold tracking-tighter mb-2" style={{ color: GOLD }}>$0</p>
                <p className="text-slate-500 text-sm mb-4">Normally a $500 value &mdash; limited availability</p>
                <p className="text-sm mb-8" style={{ color: EMERALD }}>Average new client discovers $3,200+ in missed savings</p>
                <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: GOLD }}>
                  <CalendarCheck size={20} weight="duotone" /> Claim Your Free Session
                </MagneticButton>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/8 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Bank size={16} weight="duotone" style={{ color: GOLD }} />
            <span>Evergreen Tax & Advisory &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Built by <a href="https://bluejayportfolio.com/audit" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>BlueJays</a>{" "}— get your free site audit</p>
        </div>
      </footer>
    </main>
  );
}
