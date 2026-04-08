"use client";

import { useState, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ShieldPlus,
  House,
  Car,
  Heart,
  Briefcase,
  FirstAidKit,
  Umbrella,
  Star,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CaretDown,
  Quotes,
  CalendarCheck,
  Users,
  CheckCircle,
  Handshake,
  FileText,
  Scales,
  X,
  List,
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
const BLUE = "#1d4ed8";
const BLUE_LIGHT = "#3b82f6";
const EMERALD = "#059669";
const EMERALD_LIGHT = "#10b981";
const BLUE_GLOW = "rgba(29, 78, 216, 0.15)";
const EMERALD_GLOW = "rgba(5, 150, 105, 0.12)";

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 6,
    size: 2 + Math.random() * 3,
    opacity: 0.1 + Math.random() * 0.2,
    color: i % 2 === 0 ? BLUE_LIGHT : EMERALD_LIGHT,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.color, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] },
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── SHARED COMPONENTS ───────────────────────── */
function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section ref={ref} id={id} className={className} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>
      {children}
    </motion.section>
  );
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
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  }, [x, y]);
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${BLUE}, transparent, ${EMERALD}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: "#0d1525" }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── SHIELD SVG ───────────────────────── */
function AnimatedShield() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing glow behind */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${BLUE_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 200 230" className="relative z-10 w-52 h-64 md:w-64 md:h-80" fill="none">
        {/* Outer glow rings */}
        <motion.circle cx="100" cy="105" r="98" stroke={BLUE} strokeWidth="0.5" opacity={0.12}
          animate={{ r: [96, 100, 96] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="100" cy="105" r="88" stroke={BLUE} strokeWidth="0.3" opacity={0.08}
          animate={{ r: [86, 90, 86] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />

        {/* Main shield — filled */}
        <motion.path
          d="M100 15 L170 50 C170 50 176 120 155 165 C140 195 100 215 100 215 C100 215 60 195 45 165 C24 120 30 50 30 50 Z"
          fill={`${BLUE}18`} stroke={BLUE} strokeWidth="2.5"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        {/* Shield inner highlight */}
        <path
          d="M100 35 L152 60 C152 60 156 115 140 150 C128 175 100 190 100 190 C100 190 72 175 60 150 C44 115 48 60 48 60 Z"
          fill={`${BLUE}0d`}
        />

        {/* Inner shield border */}
        <motion.path
          d="M100 40 L148 62 C148 62 152 112 138 145 C126 170 100 183 100 183 C100 183 74 170 62 145 C48 112 52 62 52 62 Z"
          stroke={BLUE_LIGHT} strokeWidth="1" fill="none" opacity={0.3}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 1.2 }}
        />

        {/* Checkmark inside shield */}
        <motion.path
          d="M75 110 L92 128 L128 82"
          stroke={EMERALD} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.5, ease: "easeInOut" }}
        />
        {/* Checkmark glow */}
        <motion.path
          d="M75 110 L92 128 L128 82"
          stroke={EMERALD_LIGHT} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.15}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 1.5, ease: "easeInOut" }}
        />

        {/* Umbrella symbol at top of shield */}
        <motion.path
          d="M88 55 C88 42, 112 42, 112 55"
          stroke={BLUE_LIGHT} strokeWidth="1.5" strokeLinecap="round" fill={`${BLUE}15`}
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1, delay: 2 }}
        />
        <motion.line x1="100" y1="55" x2="100" y2="68" stroke={BLUE_LIGHT} strokeWidth="1.2" strokeLinecap="round" opacity={0.5}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 2.3 }} />

        {/* Trust glow pulse at center */}
        <motion.circle cx="100" cy="108" r="20" fill={`${EMERALD}12`}
          animate={{ r: [18, 24, 18], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity }} />

        {/* Sparkle accents */}
        <motion.circle cx="175" cy="30" r="3" fill={BLUE_LIGHT}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="22" cy="50" r="2" fill={EMERALD_LIGHT}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        <motion.circle cx="180" cy="150" r="2.5" fill={BLUE_LIGHT}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
        <motion.circle cx="18" cy="170" r="2" fill={EMERALD_LIGHT}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }} />

        {/* Small shield badge */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
          <path d="M168 185 L178 190 C178 195, 175 200, 168 203 C161 200, 158 195, 158 190 Z"
            fill={`${BLUE}25`} stroke={BLUE_LIGHT} strokeWidth="0.8" />
        </motion.g>
      </svg>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const coverageTypes = [
  { title: "Homeowners Insurance", description: "Protect your home and belongings from fire, theft, natural disasters, and liability claims. Comprehensive coverage tailored to your property with competitive deductible options.", icon: House },
  { title: "Auto Insurance", description: "Full coverage for your vehicles including collision, comprehensive, liability, and uninsured motorist protection. Multi-vehicle discounts and safe driver rewards available.", icon: Car },
  { title: "Life Insurance", description: "Secure your family&apos;s financial future with term or whole life policies. From income replacement to estate planning, we find the right coverage at the right price.", icon: Heart },
  { title: "Business Insurance", description: "Comprehensive commercial coverage including general liability, workers comp, professional liability, and property insurance to protect your livelihood.", icon: Briefcase },
  { title: "Health Insurance", description: "Individual and family health plans with access to preferred provider networks, prescription coverage, and preventive care. We navigate the marketplace for you.", icon: FirstAidKit },
  { title: "Umbrella Insurance", description: "Extra liability protection beyond your standard policies. Shields your assets from major claims and lawsuits with coverage starting at $1M.", icon: Umbrella },
];

const stats = [
  { value: "50,000+", label: "Families Protected" },
  { value: "4.8", label: "Star Rating" },
  { value: "35+", label: "Years Trusted" },
  { value: "$2.5B", label: "Claims Paid" },
];

const whyChooseUs = [
  { icon: ShieldCheck, title: "Independent Agency", desc: "We compare 30+ carriers to find you the best coverage at the lowest price. Not tied to one company." },
  { icon: Handshake, title: "Personal Service", desc: "Your dedicated agent knows your name, your family, and your unique coverage needs. Not a 1-800 number." },
  { icon: Scales, title: "Expert Advocacy", desc: "When you file a claim, we fight for you. Our claims team advocates on your behalf to maximize your settlement." },
  { icon: Users, title: "Family Legacy", desc: "Family-owned since 1989. Three generations of trust, community involvement, and hands-on service." },
];

const claimsProcess = [
  { step: "01", title: "Report the Claim", description: "Call us or use our online portal 24/7. We gather initial details and assign a dedicated claims specialist to your case immediately.", icon: Phone },
  { step: "02", title: "Documentation", description: "We guide you through exactly what is needed. Photos, police reports, medical records, we handle the paperwork so you do not have to.", icon: FileText },
  { step: "03", title: "Advocate for You", description: "Our team communicates directly with the carrier, negotiates on your behalf, and ensures your claim is handled fairly and quickly.", icon: Handshake },
  { step: "04", title: "Resolution & Payment", description: "We follow through until your claim is paid. Average resolution time is 14 days, and we keep you updated every step of the way.", icon: CheckCircle },
];

const testimonials = [
  { name: "Robert & Lisa H.", text: "When our house flooded, they handled everything. Filed the claim, coordinated with contractors, and got us a settlement that covered all repairs. We never had to worry.", rating: 5 },
  { name: "Maria C.", text: "They saved us over $3,000 a year by shopping our auto and home policies across multiple carriers. Same great coverage, dramatically lower premiums. Should have switched years ago.", rating: 5 },
  { name: "James T.", text: "After my car accident, they fought the other driver's insurance for months until we got a fair settlement. Having a real person on my side made all the difference.", rating: 5 },
];

const faqs = [
  { q: "How do you find the best rates?", a: "As an independent agency, we have access to 30+ insurance carriers. We compare quotes across all of them to find the best coverage at the lowest price for your specific situation." },
  { q: "What happens if I need to file a claim?", a: "Call us first, always. We assign a dedicated claims specialist who handles everything from documentation to carrier negotiation. You focus on recovering, we handle the rest." },
  { q: "Can you bundle my policies for a discount?", a: "Absolutely. Bundling home, auto, and umbrella policies with the same carrier typically saves 15-25%. We automatically check bundle options when quoting." },
  { q: "How often should I review my coverage?", a: "We recommend an annual review, or whenever you have a life change such as buying a home, having a baby, starting a business, or reaching retirement." },
  { q: "Do you offer coverage for high-value items?", a: "Yes. Jewelry, art, collectibles, and other valuables can be scheduled on your policy with agreed-upon values for full replacement coverage." },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2InsurancePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingParticles />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Shield size={24} weight="duotone" style={{ color: BLUE }} />
              <span className="text-lg font-bold tracking-tight text-white">Guardian Insurance Group</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#coverage" className="hover:text-white transition-colors">Coverage</a>
              <a href="#why-us" className="hover:text-white transition-colors">Why Us</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
              <a href="#quote" className="hover:text-white transition-colors">Free Quote</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: BLUE }}>Get Quote</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Coverage", href: "#coverage" }, { label: "Why Us", href: "#why-us" }, { label: "Reviews", href: "#testimonials" }, { label: "Free Quote", href: "#quote" }].map((link) => (
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
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1560472355-536de3962603?w=1600&q=80" alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${BG}, transparent 30%, ${BG})` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          <div className="space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: EMERALD }}>Trusted Protection Since 1989</motion.p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Protect What Matters Most" />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-400 max-w-md leading-relaxed">
              Your home. Your family. Your future. We compare 30+ top-rated carriers to find you the best coverage at the lowest price, with a personal agent who knows your name.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: BLUE }}>
                Get Free Quote <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 456-7890
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: BLUE }} />789 Trust Ave, Suite 100</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: BLUE }} />Mon-Fri 8am-6pm</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <AnimatedShield />
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
                  <p className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: BLUE }}>{s.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── COVERAGE TYPES ─── */}
      <SectionReveal id="coverage" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: EMERALD }}>Coverage Options</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Comprehensive Protection" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {coverageTypes.map((cov, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: i % 2 === 0 ? BLUE_GLOW : EMERALD_GLOW }}>
                    <cov.icon size={24} weight="duotone" style={{ color: i % 2 === 0 ? BLUE : EMERALD }} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{cov.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{cov.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── ABOUT ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-8">
          <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=80" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: EMERALD }}>About Us</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
              <WordReveal text="Three Generations of Trust" />
            </h2>
            <p className="text-slate-400 leading-relaxed mb-4">
              Guardian Insurance Group was founded in 1989 with a simple mission: give every family the same level of protection and service that we provide our own. Three decades later, that mission has not changed.
            </p>
            <p className="text-slate-400 leading-relaxed">
              As an independent agency, we work for you, not the insurance companies. We compare rates from 30+ carriers to find the perfect balance of coverage and affordability, and we are here for you when you need us most.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden aspect-[4/3]">
            <img src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&q=80" alt="Family protected by insurance" className="w-full h-full object-cover" />
          </div>
        </div>
      </SectionReveal>

      {/* ─── WHY CHOOSE US ─── */}
      <SectionReveal id="why-us" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: EMERALD }}>The Guardian Difference</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Why Families Choose Us" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {whyChooseUs.map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: BLUE_GLOW }}>
                    <item.icon size={24} weight="duotone" style={{ color: BLUE }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
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
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: EMERALD }}>Client Stories</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Trusted by Families" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: BLUE }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: EMERALD }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── CLAIMS PROCESS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: EMERALD }}>Claims Made Simple</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Our Claims Process" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {claimsProcess.map((p, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-5xl font-black opacity-5 text-white">{p.step}</div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: BLUE_GLOW }}>
                    <p.icon size={24} weight="duotone" style={{ color: BLUE }} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{p.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{p.description}</p>
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
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: EMERALD }}>Common Questions</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Frequently Asked Questions" />
            </h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer">
                    <span className="text-lg font-semibold text-white pr-4">{faq.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400" /></motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                        <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── FREE QUOTE CTA ─── */}
      <SectionReveal id="quote" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: EMERALD }}>No Obligation</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Get Your Free Quote Today</h2>
                <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">Compare rates from 30+ carriers in minutes. No commitment, no pressure, just honest answers and the best price for your coverage needs.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: BLUE }}>
                    <CalendarCheck size={20} weight="duotone" /> Start My Quote
                  </MagneticButton>
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 inline-flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" /> Call an Agent
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── CONTACT ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Let Us Protect Your Family" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Stop overpaying for insurance. Let our independent agents find the best coverage at the best price. Your free consultation is just a phone call away.
              </p>
              <div className="flex flex-wrap gap-4">
                <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: BLUE }}>
                  <CalendarCheck size={20} weight="duotone" /> Schedule Call
                </MagneticButton>
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin size={20} weight="duotone" style={{ color: BLUE }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Location</p>
                    <p className="text-sm text-slate-400">789 Trust Avenue, Suite 100<br />Portland, OR 97201</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: BLUE }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <p className="text-sm text-slate-400">(555) 456-7890</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: BLUE }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Hours</p>
                    <p className="text-sm text-slate-400">Monday - Friday: 8:00 AM - 6:00 PM<br />Saturday: 9:00 AM - 1:00 PM<br />Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Shield size={16} weight="duotone" style={{ color: BLUE }} />
            <span>Guardian Insurance Group &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">Website created by Bluejay Business Solutions</p>
        </div>
      </footer>
    </main>
  );
}
