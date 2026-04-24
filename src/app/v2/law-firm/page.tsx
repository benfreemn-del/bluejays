"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Scales,
  Gavel,
  ShieldCheck,
  Briefcase,
  Handshake,
  Phone,
  EnvelopeSimple,
  MapPin,
  ArrowRight,
  Star,
  CaretDown,
  Trophy,
  Users,
  Clock,
  Certificate,
  X,
  List,
  Quotes,
  Play,
  CheckCircle,
  XCircle,
  Translate,
  Siren,
  House,
  Heartbeat,
  Cube,
} from "@phosphor-icons/react";

/* ─── colors ─── */
const EMERALD = "#059669";
const EMERALD_LIGHT = "#10b981";
const GOLD = "#ca8a04";
const NAVY = "#0f172a";
const NAVY_LIGHT = "#1e293b";

/* ─── spring configs ─── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

/* ─── stagger ─── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: spring },
};

/* ─── case results ticker data ─── */
const TICKER_ITEMS = [
  "$4.2M Auto Accident",
  "$1.8M Medical Malpractice",
  "$890K Workplace Injury",
  "Charges Dismissed — DUI",
  "$2.1M Truck Collision",
  "$340K Insurance Dispute",
  "Not Guilty — Assault",
  "$1.5M Slip & Fall",
  "$620K Wrongful Termination",
  "Case Dismissed — Drug Charges",
];

/* ─── practice areas with accordion details ─── */
const PRACTICE_AREAS = [
  {
    icon: ShieldCheck,
    title: "Personal Injury",
    desc: "Aggressive representation for accident victims across Washington.",
    details: "We handle auto accidents, truck collisions, motorcycle crashes, slip and falls, dog bites, and premises liability. Our team works with medical experts, accident reconstructionists, and economists to build maximum-value cases.",
    cases: ["Auto & Truck Accidents", "Slip & Fall", "Medical Malpractice", "Workplace Injuries", "Product Liability"],
  },
  {
    icon: Gavel,
    title: "Criminal Defense",
    desc: "Former prosecutors who know how the other side thinks.",
    details: "From misdemeanors to serious felonies, our criminal defense team leverages prosecutorial experience to dismantle the state's case. We handle DUI/DWI, drug offenses, assault, theft, white collar crimes, and federal charges.",
    cases: ["DUI / DWI", "Drug Offenses", "Assault & Domestic Violence", "Theft & Fraud", "Federal Charges"],
  },
  {
    icon: Handshake,
    title: "Family Law",
    desc: "Protecting what matters most — your family.",
    details: "We guide clients through divorce, child custody, child support modifications, adoption, prenuptial agreements, and domestic violence protection orders with compassion and strategic precision.",
    cases: ["Divorce & Separation", "Child Custody", "Child Support", "Adoption", "Protection Orders"],
  },
  {
    icon: Translate,
    title: "Immigration",
    desc: "Multilingual team helping families build their American dream.",
    details: "Elena Vasquez and our immigration team handle family-based visas, employment visas, DACA renewals, naturalization, asylum claims, and deportation defense. Fluent in English and Spanish.",
    cases: ["Family-Based Visas", "Employment Visas", "DACA & Dreamers", "Naturalization", "Deportation Defense"],
  },
  {
    icon: Briefcase,
    title: "Employment Law",
    desc: "Fighting for workers' rights and fair treatment.",
    details: "We represent employees in wrongful termination, workplace discrimination, sexual harassment, wage theft, whistleblower retaliation, and FMLA violations. No one should fear losing their livelihood for standing up.",
    cases: ["Wrongful Termination", "Workplace Discrimination", "Sexual Harassment", "Wage & Hour Claims", "Whistleblower Protection"],
  },
  {
    icon: Certificate,
    title: "Estate Planning",
    desc: "Secure your legacy and protect your family's future.",
    details: "Our estate planning attorneys draft wills, revocable and irrevocable trusts, powers of attorney, healthcare directives, and handle probate administration. We make complex planning accessible.",
    cases: ["Wills & Trusts", "Power of Attorney", "Probate Administration", "Asset Protection", "Healthcare Directives"],
  },
];

/* ─── case results showcase ─── */
const CASE_RESULTS = [
  { amount: "$4.2M", type: "Auto Accident", location: "Bellevue, WA", desc: "Multi-vehicle collision on I-405. Client suffered spinal injuries requiring two surgeries." },
  { amount: "$1.8M", type: "Medical Malpractice", location: "Seattle, WA", desc: "Misdiagnosed stroke led to permanent disability. Hospital settled before trial." },
  { amount: "$890K", type: "Workplace Injury", location: "Tacoma, WA", desc: "Construction site fall due to safety violations. Full compensation plus lost wages." },
  { amount: "Dismissed", type: "Felony DUI", location: "King County, WA", desc: "Breathalyzer calibration challenged. All charges dismissed at preliminary hearing." },
];

/* ─── attorneys ─── */
const ATTORNEYS = [
  {
    name: "James Callahan, Esq.",
    role: "Managing Partner",
    specialty: "Personal Injury & Criminal Defense",
    years: "22 Years Experience",
    bio: "Former King County prosecutor turned fierce plaintiff's advocate. James has recovered over $35M for injured clients and secured dismissals in over 200 criminal cases. Avvo 10.0 Superb rating.",
    credentials: ["Avvo 10.0 Superb", "Former KC Prosecutor", "Super Lawyers 2019-2025", "WSBA Member"],
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80",
  },
  {
    name: "Elena Vasquez, Esq.",
    role: "Partner",
    specialty: "Immigration & Family Law",
    years: "14 Years Experience",
    bio: "Elena has guided over 500 families through the immigration system. Fluent in Spanish, she brings cultural sensitivity and legal precision to every case. Recognized by the AILA for outstanding advocacy.",
    credentials: ["500+ Visa Cases", "Fluent Spanish", "AILA Member", "Family Law Specialist"],
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80",
  },
  {
    name: "David Okafor, Esq.",
    role: "Partner",
    specialty: "Criminal Defense",
    years: "16 Years Experience",
    bio: "A former public defender with over 150 jury trials, David is a courtroom veteran who thrives under pressure. He has secured not-guilty verdicts in high-profile felony cases across Washington State.",
    credentials: ["150+ Jury Trials", "Former Public Defender", "National Trial Lawyers Top 100", "Fluent Yoruba"],
    img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
  },
];

/* ─── testimonials ─── */
const TESTIMONIALS = [
  { text: "James got me $340K when the insurance company offered $45K. He refused to back down and took it all the way to mediation. Changed my life.", name: "Roberto M.", type: "Personal Injury Client" },
  { text: "Elena saved my family. My mother's green card was approved after 3 years of waiting and two other attorneys failing us. We are forever grateful.", name: "Maria L.", type: "Immigration Client" },
  { text: "David walked into that courtroom and dismantled the prosecution's case piece by piece. Not guilty on all counts. The man is a genius.", name: "Kevin T.", type: "Criminal Defense Client" },
  { text: "After my accident, I couldn't work for 8 months. Pacific Law Group fought for every dollar and got me a settlement that covered everything and then some.", name: "Sandra K.", type: "Personal Injury Client" },
  { text: "They took my case when two other firms turned me away. $1.2M settlement. I tell everyone — call Pacific Law Group first.", name: "Anthony W.", type: "Personal Injury Client" },
];

/* ─── comparison rows ─── */
const COMPARISON_ROWS = [
  { feature: "Free Initial Consultation", us: true, them: "Varies" },
  { feature: "No Fee Unless We Win (PI)", us: true, them: "Often hourly" },
  { feature: "Former Prosecutor on Staff", us: true, them: "Rarely" },
  { feature: "24/7 Attorney Availability", us: true, them: "Business hours" },
  { feature: "Multilingual Team", us: true, them: "Limited" },
  { feature: "Dedicated Case Manager", us: true, them: "Rotational staff" },
  { feature: "Courtroom Trial Experience", us: true, them: "Settle-focused" },
];

/* ─── awards ─── */
const AWARDS = ["Avvo 10.0 Superb", "Super Lawyers", "WSBA Member", "KCBA", "National Trial Lawyers Top 100", "BBB A+ Rated"];

/* ═══ COMPONENTS ═══ */

/* ─── animated scale of justice (hero watermark) ─── */
function ScaleOfJusticeWatermark() {
  const tilt = useMotionValue(0);
  const smoothTilt = useSpring(tilt, { stiffness: 30, damping: 10 });

  useEffect(() => {
    let dir = 1;
    const interval = setInterval(() => {
      tilt.set(dir * 6);
      dir *= -1;
    }, 3500);
    return () => clearInterval(interval);
  }, [tilt]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <svg viewBox="0 0 300 300" className="w-[500px] h-[500px] md:w-[700px] md:h-[700px] opacity-[0.04]" fill="none">
        {/* Outer glow rings */}
        <motion.circle cx="150" cy="150" r="140" stroke={EMERALD_LIGHT} strokeWidth="0.5"
          animate={{ r: [138, 142, 138] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />

        {/* Ornate base pedestal */}
        <path d="M110 268 L120 258 L180 258 L190 268 Z" fill={EMERALD_LIGHT} stroke={EMERALD_LIGHT} strokeWidth="2" />
        <rect x="125" y="256" width="50" height="4" rx="2" fill={EMERALD_LIGHT} />

        {/* Pillar */}
        <rect x="145" y="100" width="10" height="156" rx="5" fill={EMERALD_LIGHT} stroke={EMERALD_LIGHT} strokeWidth="1.5" />

        {/* Beam with tilt */}
        <motion.g style={{ rotate: smoothTilt, transformOrigin: "150px 100px" }}>
          <rect x="45" y="95" width="210" height="10" rx="5" fill={EMERALD_LIGHT} stroke={EMERALD_LIGHT} strokeWidth="1.5" />

          {/* Left chain links */}
          <circle cx="70" cy="115" r="4" stroke={EMERALD_LIGHT} strokeWidth="1.2" fill="none" />
          <circle cx="70" cy="125" r="4" stroke={EMERALD_LIGHT} strokeWidth="1.2" fill="none" />
          <circle cx="70" cy="135" r="4" stroke={EMERALD_LIGHT} strokeWidth="1.2" fill="none" />
          {/* Left pan */}
          <line x1="70" y1="105" x2="42" y2="155" stroke={EMERALD_LIGHT} strokeWidth="1.5" />
          <line x1="70" y1="105" x2="98" y2="155" stroke={EMERALD_LIGHT} strokeWidth="1.5" />
          <path d="M32 155 Q70 180 108 155" stroke={EMERALD_LIGHT} strokeWidth="2.5" fill={EMERALD_LIGHT} fillOpacity={0.3} />

          {/* Right chain links */}
          <circle cx="230" cy="115" r="4" stroke={EMERALD_LIGHT} strokeWidth="1.2" fill="none" />
          <circle cx="230" cy="125" r="4" stroke={EMERALD_LIGHT} strokeWidth="1.2" fill="none" />
          <circle cx="230" cy="135" r="4" stroke={EMERALD_LIGHT} strokeWidth="1.2" fill="none" />
          {/* Right pan */}
          <line x1="230" y1="105" x2="202" y2="155" stroke={EMERALD_LIGHT} strokeWidth="1.5" />
          <line x1="230" y1="105" x2="258" y2="155" stroke={EMERALD_LIGHT} strokeWidth="2" />
          <path d="M192 155 Q230 180 268 155" stroke={EMERALD_LIGHT} strokeWidth="2.5" fill={EMERALD_LIGHT} fillOpacity={0.3} />
        </motion.g>

        {/* Top ornament */}
        <circle cx="150" cy="88" r="16" fill={EMERALD_LIGHT} stroke={EMERALD_LIGHT} strokeWidth="2.5" />
        <motion.circle cx="150" cy="88" r="4" fill={EMERALD_LIGHT}
          animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity }} />
        <motion.circle cx="150" cy="88" r="22" fill={EMERALD_LIGHT}
          animate={{ r: [20, 28, 20], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
      </svg>
    </div>
  );
}

/* ─── counter ─── */
function Counter({ end, label, suffix = "", prefix = "" }: { end: number; label: string; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.max(1, Math.floor(end / 60));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); } else { setCount(start); }
    }, 25);
    return () => clearInterval(timer);
  }, [inView, end]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-5xl tracking-tighter leading-none font-bold text-white">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="mt-2 text-xs md:text-sm uppercase tracking-widest text-slate-400">{label}</div>
    </div>
  );
}

/* ─── magnetic button ─── */
function MagneticButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, springFast);
  const sy = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  const handleMouse = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el || isTouchDevice) return;
      const rect = el.getBoundingClientRect();
      x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
      y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
    },
    [x, y, isTouchDevice]
  );

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={`relative overflow-hidden group ${className}`}
    >
      {children}
      <motion.div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}

/* ─── glass card wrapper ─── */
function GlassCard({ children, className = "", hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      transition={spring}
      className={`rounded-2xl border border-white/[0.13] bg-white/[0.08] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ─── section header ─── */
function SectionHeader({ label, title, accent }: { label: string; title: string; accent: string }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="mb-12 md:mb-16"
    >
      <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest" style={{ color: EMERALD }}>
        {label}
      </motion.p>
      <motion.h2 variants={fadeUp} className="mt-3 text-3xl md:text-5xl lg:text-6xl tracking-tighter leading-none font-bold">
        {title} <span style={{ color: EMERALD }}>{accent}</span>
      </motion.h2>
    </motion.div>
  );
}

/* ─── infinite ticker ─── */
function InfiniteTicker({ items, speed = 30, goldText = false }: { items: string[]; speed?: number; goldText?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0f172a] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0f172a] to-transparent z-10" />
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <span key={i} className={`text-lg md:text-xl font-bold tracking-tight ${goldText ? "text-yellow-500" : "text-emerald-400/70"}`}>
            {item}
            <span className="mx-6 text-slate-700">|</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ═══════ MAIN PAGE ═══════ */
export default function V2LawFirmPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroParallax = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);

  /* auto-rotate testimonials */
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const NAV_LINKS = [
    { label: "Practice Areas", href: "#practice-areas" },
    { label: "Results", href: "#results" },
    { label: "Attorneys", href: "#attorneys" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#0f172a] text-slate-100 overflow-x-hidden">

      {/* ══════ NAV ══════ */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={spring}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0f172a]/80 border-b border-white/8"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <Scales size={28} weight="duotone" className="text-emerald-400" />
            <span className="text-xl font-bold tracking-tight">Pacific Law Group</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="hover:text-white transition-colors">{link.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a href="tel:2065550312" className="hidden sm:flex items-center gap-2 text-sm text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
              <Phone size={16} weight="bold" /> (206) 555-0312
            </a>
            <MagneticButton className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg">
              <span className="relative z-10">Free Case Review</span>
            </MagneticButton>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-white/8"
            >
              <div className="flex flex-col gap-1 px-4 py-4 bg-[#0f172a]/95 backdrop-blur-xl">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <a href="tel:2065550312" className="block px-4 py-3 rounded-lg text-sm text-emerald-400 font-medium">
                  <Phone size={16} weight="bold" className="inline mr-2" /> (206) 555-0312
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ══════ 1. HERO — FULL-WIDTH DARK BILLBOARD ══════ */}
      <section ref={heroRef} className="relative min-h-[100dvh] z-10 flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#0c1220] to-[#0f172a]" />
        {/* Subtle radial glow behind text */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(5,150,105,0.06) 0%, transparent 70%)" }} />

        {/* Scale of Justice SVG watermark */}
        <ScaleOfJusticeWatermark />

        <motion.div
          style={{ y: heroParallax }}
          className="relative z-10 text-center w-full max-w-5xl mx-auto px-4 md:px-6 py-32 overflow-hidden"
        >
          {/* Bold typography entrance */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2 md:space-y-4">
            <motion.div variants={fadeUp}>
              <span className="block text-4xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tighter leading-[0.9] font-black text-white" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
                Fierce Advocacy.
              </span>
            </motion.div>
            <motion.div variants={fadeUp}>
              <span className="block text-4xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tighter leading-[0.9] font-black" style={{ color: EMERALD, textShadow: `0 4px 20px ${EMERALD}40` }}>
                Proven Results.
              </span>
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.5 }}
            className="mt-8 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            22 years of relentless advocacy. Former prosecutors. Over $47 million recovered for clients across Washington State.
          </motion.p>

          {/* Case results ticker in hero */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 py-4 border-y border-white/8"
          >
            <InfiniteTicker items={TICKER_ITEMS} speed={35} goldText />
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 1 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticButton className="px-10 py-5 bg-emerald-600 text-white font-bold rounded-xl text-lg">
              <span className="relative z-10 flex items-center gap-2">
                Free Case Review <ArrowRight weight="bold" size={20} />
              </span>
            </MagneticButton>
            <a href="tel:2065550312">
              <MagneticButton className="px-10 py-5 border-2 border-slate-600 text-white rounded-xl hover:border-emerald-500/50 transition-colors text-lg">
                <span className="relative z-10 flex items-center gap-2">
                  <Phone weight="bold" size={20} /> (206) 555-0312
                </span>
              </MagneticButton>
            </a>
          </motion.div>
        </motion.div>

        {/* bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f172a] to-transparent z-20" />
      </section>

      {/* ══════ 2. TRUST BAR ══════ */}
      <section className="relative z-10 py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
            {[
              { value: "22", label: "Years Experience", suffix: "+" },
              { value: "500", label: "Cases Won", suffix: "+" },
              { value: "47", label: "Million Recovered", prefix: "$", suffix: "M+" },
              { value: "Former", label: "Prosecutor", isText: true },
              { value: "10.0", label: "Avvo Rating", isText: true },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.05 }}
                className="text-center"
              >
                {item.isText ? (
                  <div className="text-3xl md:text-4xl tracking-tighter leading-none font-bold text-white">{item.value}</div>
                ) : (
                  <Counter end={parseInt(item.value)} label="" prefix={item.prefix || ""} suffix={item.suffix || ""} />
                )}
                <div className="mt-1 text-xs uppercase tracking-widest text-slate-500">{item.label}</div>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        </div>
      </section>

      {/* ══════ 3. CASE RESULTS SHOWCASE ══════ */}
      <section id="results" className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeader label="Case Results" title="Record of" accent="Victories" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CASE_RESULTS.map((result, i) => (
              <motion.div
                key={result.type}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.08 }}
              >
                <GlassCard className="p-8 h-full relative overflow-hidden">
                  {/* Gold accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${GOLD}, ${EMERALD})` }} />
                  <div className="text-3xl md:text-4xl font-black tracking-tighter" style={{ color: result.amount === "Dismissed" ? EMERALD : GOLD }}>
                    {result.amount}
                  </div>
                  <div className="mt-2 text-white font-bold text-lg">{result.type}</div>
                  <div className="mt-1 text-xs text-emerald-400/70 uppercase tracking-wider">{result.location}</div>
                  <p className="mt-4 text-sm text-slate-400 leading-relaxed">{result.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 4. PRACTICE AREAS WITH DEEP ACCORDIONS ══════ */}
      <section id="practice-areas" className="relative z-10 py-16 md:py-24">
        {/* subtle bg pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
          <SectionHeader label="Practice Areas" title="How We" accent="Fight for You" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRACTICE_AREAS.map((area, i) => {
              const isOpen = openAccordion === i;
              return (
                <motion.div
                  key={area.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...spring, delay: i * 0.06 }}
                >
                  <GlassCard className="p-8 h-full hover:border-emerald-500/20 transition-colors" hover={false}>
                    <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5">
                      <area.icon size={28} weight="duotone" className="text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{area.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{area.desc}</p>

                    {/* Accordion toggle */}
                    <button
                      onClick={() => setOpenAccordion(isOpen ? null : i)}
                      className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
                    >
                      {isOpen ? "Show Less" : "Learn More"}
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}>
                        <CaretDown size={16} weight="bold" />
                      </motion.div>
                    </button>

                    {/* Accordion content */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 mt-4 border-t border-white/8">
                            <p className="text-sm text-slate-300 leading-relaxed mb-4">{area.details}</p>
                            <div className="space-y-2 mb-5">
                              {area.cases.map((c) => (
                                <div key={c} className="flex items-center gap-2 text-sm text-slate-400">
                                  <CheckCircle size={14} weight="fill" className="text-emerald-400 flex-shrink-0" />
                                  {c}
                                </div>
                              ))}
                            </div>
                            <MagneticButton className="w-full px-4 py-3 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-sm font-semibold rounded-lg">
                              <span className="relative z-10">Free Case Review</span>
                            </MagneticButton>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════ 5. WHY PACIFIC LAW GROUP ══════ */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeader label="Why Choose Us" title="The Pacific Law" accent="Advantage" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: "No Fee Unless We Win", desc: "Personal injury cases are 100% contingency. You pay nothing unless we recover money for you." },
              { icon: Clock, title: "24/7 Availability", desc: "Legal emergencies don't wait for business hours. Our attorneys are available around the clock." },
              { icon: Gavel, title: "Former Prosecutor", desc: "James Callahan spent years as a King County prosecutor. He knows exactly how the other side builds a case." },
              { icon: Translate, title: "Multilingual Team", desc: "We serve our diverse community in English, Spanish, and Yoruba. Everyone deserves access to justice." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.08 }}
              >
                <GlassCard className="p-8 h-full text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
                    <item.icon size={32} weight="duotone" className="text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 6. ATTORNEY PROFILES ══════ */}
      <section id="attorneys" className="relative z-10 py-16 md:py-24">
        {/* emerald glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
          <SectionHeader label="Our Attorneys" title="Meet the" accent="Team" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ATTORNEYS.map((attorney, i) => (
              <motion.div
                key={attorney.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.1 }}
                style={{ marginTop: i === 1 ? "2rem" : "0" }}
              >
                <GlassCard className="overflow-hidden">
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={attorney.img}
                      alt={attorney.name}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/80 text-white backdrop-blur-sm">
                        {attorney.years}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold">{attorney.name}</h3>
                    <p className="text-emerald-400 text-sm font-medium">{attorney.role} — {attorney.specialty}</p>
                    <p className="mt-3 text-sm text-slate-400 leading-relaxed">{attorney.bio}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {attorney.credentials.map((cred) => (
                        <span key={cred} className="px-2 py-1 text-xs rounded-md bg-white/5 border border-white/15 text-slate-300">
                          {cred}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 7. CASE RESULTS TICKER — FULL WIDTH ══════ */}
      <section className="relative z-10 py-10 md:py-14 overflow-hidden border-y border-white/8">
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, rgba(202,138,4,0.03), transparent)" }} />
        <InfiniteTicker
          items={["$4.2M", "$1.8M", "$890K", "Dismissed", "$2.1M", "$340K", "Not Guilty", "$1.5M", "$620K", "Dismissed"]}
          speed={25}
          goldText
        />
      </section>

      {/* ══════ 8. TESTIMONIALS — DARK EDITORIAL ══════ */}
      <section id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <SectionHeader label="Client Stories" title="Words From" accent="Our Clients" />

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <GlassCard className="p-10 md:p-14">
                  <Quotes size={48} weight="fill" className="text-emerald-500/20 mb-6" />
                  <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light">
                    &ldquo;{TESTIMONIALS[activeTestimonial].text}&rdquo;
                  </p>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} size={18} weight="fill" className="text-yellow-500" />
                      ))}
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div>
                      <span className="font-semibold text-white">{TESTIMONIALS[activeTestimonial].name}</span>
                      <span className="ml-2 text-sm text-slate-500">{TESTIMONIALS[activeTestimonial].type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <CheckCircle size={14} weight="fill" className="text-emerald-400" />
                    <span className="text-xs text-slate-500">Verified Client</span>
                  </div>
                </GlassCard>
              </motion.div>
            </AnimatePresence>

            {/* Navigation dots */}
            <div className="flex items-center justify-center gap-3 mt-8">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === activeTestimonial ? "bg-emerald-400 w-8" : "bg-slate-600 hover:bg-slate-500"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 9. FREE CASE REVIEW QUIZ ══════ */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <SectionHeader label="Get Started" title="What Best Describes" accent="Your Situation?" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Heartbeat, title: "Injured in an Accident", response: "You may be entitled to compensation. Let us fight for you.", color: EMERALD },
              { icon: Siren, title: "Facing Criminal Charges", response: "Time is critical. Call now for immediate defense strategy.", color: "#ef4444" },
              { icon: House, title: "Family / Immigration Matter", response: "We speak your language. Compassionate, experienced counsel.", color: GOLD },
              { icon: Cube, title: "Other Legal Issue", response: "Let's talk. Free consultation, no obligation, 100% confidential.", color: "#8b5cf6" },
            ].map((option, i) => {
              const isSelected = quizSelected === i;
              return (
                <motion.button
                  key={option.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...spring, delay: i * 0.06 }}
                  onClick={() => setQuizSelected(isSelected ? null : i)}
                  className="text-left w-full"
                >
                  <GlassCard
                    hover={false}
                    className={`p-6 transition-all duration-300 cursor-pointer ${isSelected ? "border-emerald-500/40 bg-emerald-500/[0.06]" : "hover:border-white/15"}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${option.color}15` }}>
                        <option.icon size={24} weight="duotone" style={{ color: option.color }} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{option.title}</h4>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                            >
                              <p className="mt-2 text-sm text-emerald-400">{option.response}</p>
                              <div className="mt-3 flex items-center gap-2 text-sm font-medium" style={{ color: option.color }}>
                                Call Now: (206) 555-0312 <ArrowRight size={14} weight="bold" />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </GlassCard>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════ 10. COMPETITOR COMPARISON ══════ */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <SectionHeader label="Compare" title="Pacific Law Group vs" accent="Large Corporate Firms" />

          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="text-left p-4 md:p-5 text-slate-400 font-medium">Feature</th>
                    <th className="p-4 md:p-5 text-center font-bold text-emerald-400">Pacific Law Group</th>
                    <th className="p-4 md:p-5 text-center font-medium text-slate-500">Large Firms</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.feature} className={`border-b border-white/8 ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
                      <td className="p-4 md:p-5 text-slate-300">{row.feature}</td>
                      <td className="p-4 md:p-5 text-center">
                        <CheckCircle size={22} weight="fill" className="text-emerald-400 mx-auto" />
                      </td>
                      <td className="p-4 md:p-5 text-center text-slate-500 text-xs">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ══════ 11. VIDEO PLACEHOLDER ══════ */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={spring}
          >
            <GlassCard className="relative overflow-hidden aspect-video cursor-pointer group">
              <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80"
                alt="Pacific Law Group office"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#0f172a]/60 group-hover:bg-[#0f172a]/50 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-600/20"
                >
                  <Play size={36} weight="fill" className="text-white ml-1" />
                </motion.div>
                <p className="mt-4 text-lg font-bold text-white">Hear From Our Clients</p>
                <p className="text-sm text-slate-400">Watch real stories of justice served</p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* ══════ 12. AWARDS & CREDENTIALS ══════ */}
      <section className="relative z-10 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">Awards & Credentials</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {AWARDS.map((award, i) => (
              <motion.div
                key={award}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.05 }}
              >
                <div className="flex items-center gap-2 px-5 py-3 rounded-full border border-white/15 bg-white/[0.08] text-sm text-slate-300">
                  <Trophy size={16} weight="fill" style={{ color: GOLD }} />
                  {award}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 13. CONTACT SECTION ══════ */}
      <section id="contact" className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
            {/* left */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={spring}
            >
              <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: EMERALD }}>Get In Touch</p>
              <h2 className="mt-3 text-3xl md:text-5xl tracking-tighter leading-none font-bold">
                Your Fight <span style={{ color: EMERALD }}>Starts Here</span>
              </h2>
              <p className="mt-6 text-slate-400 max-w-md leading-relaxed">
                Schedule your free case review today. We will examine the facts, explain your legal options, and build a winning strategy.
              </p>
              <div className="mt-8 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] inline-flex items-center gap-3">
                <ShieldCheck size={20} weight="fill" className="text-emerald-400" />
                <span className="text-sm text-slate-300">Confidential. No obligation. Available 24/7.</span>
              </div>
              <div className="mt-10 space-y-5">
                {[
                  { icon: Phone, text: "(206) 555-0312", href: "tel:2065550312" },
                  { icon: EnvelopeSimple, text: "consult@pacificlawgroup.com", href: "mailto:consult@pacificlawgroup.com" },
                  { icon: MapPin, text: "701 5th Avenue, Suite 3200, Seattle, WA 98104", href: "https://maps.google.com/?q=701+5th+Avenue+Suite+3200+Seattle+WA+98104" },
                ].map((item) => (
                  <a key={item.text} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex items-center gap-4 text-slate-300 hover:text-white transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                      <item.icon size={22} weight="duotone" className="text-emerald-400" />
                    </div>
                    <span className="text-sm md:text-base">{item.text}</span>
                  </a>
                ))}
              </div>
            </motion.div>

            {/* right — form */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={spring}
            >
              <GlassCard className="p-8 md:p-10">
                <div className="space-y-5">
                  {[
                    { label: "Full Name", type: "text", placeholder: "James Smith" },
                    { label: "Email", type: "email", placeholder: "james@example.com" },
                    { label: "Phone", type: "tel", placeholder: "(206) 555-0000" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-sm font-medium text-slate-300 mb-2">{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Case Type</label>
                    <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-slate-300 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all appearance-none">
                      <option value="">Select case type...</option>
                      <option value="pi">Personal Injury</option>
                      <option value="criminal">Criminal Defense</option>
                      <option value="family">Family Law</option>
                      <option value="immigration">Immigration</option>
                      <option value="employment">Employment Law</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Briefly Describe Your Situation</label>
                    <textarea
                      rows={4}
                      placeholder="Tell us what happened..."
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all resize-none"
                    />
                  </div>
                  <MagneticButton className="w-full px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Request Free Case Review <ArrowRight weight="bold" size={18} />
                    </span>
                  </MagneticButton>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════ 14. EMERGENCY BANNER ══════ */}
      <section className="relative z-10 py-6 md:py-8" style={{ background: `linear-gradient(90deg, #7f1d1d, ${NAVY_LIGHT}, #7f1d1d)` }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <a href="tel:2065550312" className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
            {/* Pulsing indicator */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-red-300 font-bold text-sm uppercase tracking-wider">Arrested?</span>
            </div>
            <span className="text-white font-black text-xl md:text-2xl tracking-tight">
              Call Now — (206) 555-0312
            </span>
            <span className="text-red-300/70 text-sm font-medium">Available 24/7</span>
          </a>
        </div>
      </section>

      {/* ══════ 15. FOOTER ══════ */}
      <footer className="relative z-10 py-16 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
            {/* Logo & info */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Scales size={28} weight="duotone" className="text-emerald-400" />
                <span className="text-xl font-bold tracking-tight">Pacific Law Group</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Fierce Advocacy. Proven Results. Serving clients across Washington State for over 22 years.
              </p>
              <p className="mt-4 text-xs text-slate-600">Licensed in Washington State</p>
            </div>

            {/* Practice Areas */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Practice Areas</h4>
              <ul className="space-y-2">
                {PRACTICE_AREAS.map((area) => (
                  <li key={area.title}>
                    <a href="#practice-areas" className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">{area.title}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {["Case Results", "Our Attorneys", "Testimonials", "Free Case Review", "Contact Us"].map((link) => (
                  <li key={link}>
                    <a href="#contact" className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Contact</h4>
              <div className="space-y-3 text-sm text-slate-500">
                <a href="tel:2065550312" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                  <Phone size={14} weight="bold" /> (206) 555-0312
                </a>
                <a href="mailto:consult@pacificlawgroup.com" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                  <EnvelopeSimple size={14} weight="bold" /> consult@pacificlawgroup.com
                </a>
                <a href="https://maps.google.com/?q=701+5th+Avenue+Suite+3200+Seattle+WA+98104" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-emerald-400 transition-colors">
                  <MapPin size={14} weight="bold" className="mt-0.5 flex-shrink-0" />
                  <span>701 5th Avenue, Suite 3200<br />Seattle, WA 98104</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} Pacific Law Group. All rights reserved.
            </p>
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by{" "}
              <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400 transition-colors">
                bluejayportfolio.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
