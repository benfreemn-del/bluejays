"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/purity */

/**
 * /v2/consulting — premium B2B technical consulting showcase.
 *
 * Built originally for battery-technology consultants like Daniel
 * Consulting Group (Somerville MA) but designed to flex across the
 * specialist-consultant archetype: deep technical expertise, B2B-only,
 * boutique-prestige positioning, engagement-based not retainer-only,
 * targeting startups/OEMs/academia/investors.
 *
 * Architectural cues borrowed from /v2/accounting (the closest sibling
 * — B2B trust, structured engagements, expert-led service) and
 * /v2/law-firm (authority + credentials framing).
 */

import { useState, useRef, useCallback, useEffect } from "react";
import InquiryForm from "@/components/clients/InquiryForm";
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
  Atom,
  Flask,
  Lightning,
  Gear,
  Trophy,
  Certificate,
  Eye,
  Target,
  Notebook,
  Handshake,
  Cpu,
  TestTube,
  ChartBar,
  Microscope,
  Wrench,
  Brain,
  GraduationCap,
  CurrencyDollar,
  Envelope,
  Medal,
  TrendUp,
  CaretRight,
  BatteryFull,
} from "@phosphor-icons/react";

const BG = "#050a14";
const NAVY = "#0a1428";
const NAVY_LIGHT = "#1e293b";
const BLUE = "#1e40af";
const BLUE_LIGHT = "#3b82f6";
const CYAN = "#06b6d4";
const AMBER = "#f59e0b";
const BLUE_GLOW = "rgba(30, 64, 175, 0.18)";
const CYAN_GLOW = "rgba(6, 182, 212, 0.12)";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: spring },
};

// ─── Reusable building blocks ──────────────────────────────────────

function FloatingParticles() {
  // Decorative — subtle dot field that drifts on the dark background.
  // Particles are randomized at render time; React.useId not needed
  // since these never re-mount.
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: i % 3 === 0 ? BLUE_LIGHT : i % 3 === 1 ? CYAN : AMBER,
            opacity: 0.35,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  );
}

function SectionReveal({ children, className = "", id, style }: { children: React.ReactNode; className?: string; id?: string; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={stagger}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  );
}

function GlassCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 backdrop-blur-sm transition-all hover:border-white/20 ${className}`}
      style={{ background: "rgba(15, 23, 42, 0.55)", ...style }}
    >
      {children}
    </div>
  );
}

function MagneticButton({ children, className = "", onClick, style, href }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xs = useSpring(x, { stiffness: 250, damping: 20 });
  const ys = useSpring(y, { stiffness: 250, damping: 20 });
  const Tag = href ? motion.a : motion.button;
  return (
    <Tag
      href={href}
      className={className}
      style={{ x: xs, y: ys, ...style }}
      onMouseMove={(e: React.MouseEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
        y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}

function AnimatedCounter({ target, prefix = "", suffix = "", duration = 2 }: { target: number; prefix?: string; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(start + (target - start) * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Page-specific data ────────────────────────────────────────────

const services = [
  {
    title: "Contract Battery Testing",
    description:
      "In-house cell cycling and characterization with calibrated cyclers. Coin-cell through pouch-cell through 18650/21700 cylindrical formats. Turnkey reports your engineers can act on, not raw .csv files you have to interpret.",
    icon: TestTube,
  },
  {
    title: "Equipment Sourcing & Calibration",
    description:
      "Authorized Neware Battery Tester distributor. We size and spec the right cycler for your roadmap, then calibrate against NIST-traceable references so your data matches when you submit to a partner or investor.",
    icon: Gear,
  },
  {
    title: "R&D Lab Setup",
    description:
      "End-to-end battery lab planning — electrical and HVAC requirements, thermal chambers, glove boxes, fume hoods, safety protocols, equipment commissioning. Boots-on-the-ground from blueprint to first cell.",
    icon: Flask,
  },
  {
    title: "Custom Hardware Design",
    description:
      "Specialized test fixtures and chambers for novel cell chemistries that don't fit off-the-shelf hardware. Solid-state. Lithium-metal. Sodium-ion. We've built rigs for the chemistry your team is pioneering.",
    icon: Wrench,
  },
  {
    title: "Pilot-to-Manufacturing Scaling",
    description:
      "We've walked teams from coin-cell experiments through pilot to commercial scale across 18 years. We know what breaks at each transition and how to derisk it before you commit capital.",
    icon: ChartLineUp,
  },
  {
    title: "Investor Due Diligence",
    description:
      "Independent technical due diligence on battery investments. Read-back of pitch-deck claims against the chemistry, the data, and the team's track record. What the founder's slide deck doesn't tell you.",
    icon: ShieldCheck,
  },
  {
    title: "Failure Analysis",
    description:
      "Cells failing in the field, in the test, or on the shelf? We diagnose root cause — capacity fade, dendrite growth, separator failure, electrolyte breakdown — and tell you what to change in the next batch.",
    icon: Microscope,
  },
  {
    title: "Strategic Technical Advisory",
    description:
      "Fractional CTO-level battery expertise for early-stage teams without a senior battery engineer in-house. Roadmap reviews, vendor evaluation, hiring guidance, IP strategy.",
    icon: Brain,
  },
];

const industries = [
  { name: "Battery Startups", icon: Lightning, desc: "Seed-through-Series-B teams scaling from chemistry to first commercial cells" },
  { name: "OEM Engineering Teams", icon: Buildings, desc: "Consumer-product, EV, and grid-storage manufacturers integrating new cell tech" },
  { name: "Academic Research", icon: GraduationCap, desc: "University labs needing cycler infrastructure, methodology consulting, or contract testing" },
  { name: "Investors", icon: CurrencyDollar, desc: "VCs, family offices, and corporate investors needing technical due diligence on battery deals" },
  { name: "Grid Storage Developers", icon: Atom, desc: "Stationary storage projects evaluating cells, packs, and BMS integration at MW scale" },
  { name: "Defense & Aerospace", icon: ShieldCheck, desc: "Cell qualification for mission-critical applications under DoD/MIL-STD specifications" },
];

const testimonials = [
  { name: "Battery startup CEO", role: "Series A, lithium-metal", text: "Daniel Consulting saved us six months of trial and error. They knew exactly which cycler we needed and why — and they had the calibration paperwork our investors required ready before we asked.", rating: 5, deliverable: "$200K saved on equipment churn" },
  { name: "Academic lab director", role: "R1 university", text: "Set up our entire battery research lab in three months — from empty room to first cycling data. They're still our go-to when we have hardware questions or need a sanity check on a methodology.", rating: 5, deliverable: "Lab built end-to-end in 90 days" },
  { name: "Investor partner", role: "Climate-focused VC", text: "Their technical due diligence flagged risks two other firms missed. We walked away from a deal that would have cost the fund $4M. Now we don't write a battery check without them on it.", rating: 5, deliverable: "$4M loss avoided" },
  { name: "Consumer product VP", role: "Power tools", text: "We had cells failing in the field after warranty repair. Daniel's failure analysis traced it to a separator-pinhole defect in a single supplier batch. Saved a full recall.", rating: 5, deliverable: "Avoided product recall" },
  { name: "Grid storage developer", role: "Stationary storage", text: "Independent third-party testing carried weight with our utility offtaker that internal data couldn't. They turned around a 2,000-cycle baseline in 8 weeks.", rating: 5, deliverable: "Closed offtake on independent data" },
];

const processSteps = [
  { step: "01", title: "Scoping Call", description: "We start with a 45-minute call to understand your application, your timeline, and your constraints. No NDA needed for the first conversation — we sign one before any specifics get shared." },
  { step: "02", title: "Statement of Work", description: "Within 5 business days you receive a fixed-scope SOW — deliverables, milestones, timeline, total cost. No T&M open-ended budgets unless you specifically request that engagement model." },
  { step: "03", title: "Execution", description: "Cells arrive at our Somerville lab, get logged into our LIMS, run on calibrated cyclers, and get a full chain-of-custody record. You get weekly progress updates and full data access — not just summaries." },
  { step: "04", title: "Report & Debrief", description: "Final deliverable is a structured technical report your engineering team can act on. We schedule a 60-minute live debrief to walk through findings and answer questions before the engagement closes." },
];

const capabilities = [
  { format: "Coin Cells", details: "CR2016, CR2032, CR2025 — half-cell and full-cell formats", note: "Most rapid screening" },
  { format: "Pouch Cells", details: "5–50 Ah, single-layer through multi-layer stacks", note: "Pre-pilot characterization" },
  { format: "Cylindrical 18650 / 21700", details: "Standard EV and consumer-product format factors", note: "Production-format validation" },
  { format: "Custom Form Factors", details: "Solid-state stacks, structural batteries, novel geometries", note: "Bespoke fixture build" },
  { format: "Pack & Module", details: "Up to 100kWh ESS-scale assemblies in collaborative test environments", note: "Partner facilities" },
];

const comparisonRows = [
  { feature: "NIST-traceable calibration", us: true, them: "Sometimes" },
  { feature: "18+ years senior expertise", us: true, them: "Rotating juniors" },
  { feature: "Fixed-scope engagements", us: true, them: "T&M only" },
  { feature: "Authorized Neware distributor", us: true, them: "Resellers + markup" },
  { feature: "Lab setup + ongoing support", us: true, them: "Project-only" },
  { feature: "Investor-grade reports", us: true, them: "Internal-only docs" },
  { feature: "Cell-format flexibility", us: true, them: "Limited specs" },
];

const faqItems = [
  {
    q: "Do you sign NDAs?",
    a: "Yes. We sign a mutual NDA before any technical specifics get exchanged. Most clients send us their template; we redline within 24 hours. We do not require NDAs for the initial scoping call — generic discussions about chemistry families and approach happen openly.",
  },
  {
    q: "What's a typical engagement size?",
    a: "Discrete contract testing engagements run $5,000–$40,000 depending on cell count, cycle protocol, and turnaround. Lab setup engagements are $50,000–$250,000+. Investor due diligence flat-rate at $15,000–$35,000 per deal. Strategic advisory retainers start at $4,000/month.",
  },
  {
    q: "How long does turnaround take?",
    a: "Coin-cell screening: 2–4 weeks for 50 cycles. Pouch-cell baselines: 6–12 weeks for 500 cycles. Custom test protocols quoted per scope. We update weekly with current cycle count and projected completion date so you can plan around real data, not guesses.",
  },
  {
    q: "Do you publish or take equity in client work?",
    a: "We don't publish on client data without explicit written permission, and we don't take equity in clients. Our independence is what makes our reports credible to your investors and your customers. Cash-only engagements keep that independence clean.",
  },
  {
    q: "Can you handle solid-state, lithium-metal, sodium-ion, and other emerging chemistries?",
    a: "Yes. We've built custom test fixtures for all of those. The standard-issue cyclers don't always handle the voltage windows or pressure requirements those chemistries need — we design and fabricate the fixtures when needed. Tell us what you're working on and we'll tell you whether we have the rig or need to build it.",
  },
  {
    q: "Where are you based?",
    a: "Somerville, Massachusetts — a 10-minute drive from MIT, Harvard, and the Greater Boston battery cluster. Cells ship in via FedEx/UPS daily; we accept hazmat lithium-ion shipments year-round. On-site visits welcome by appointment.",
  },
];

const engagementTiers = [
  {
    name: "Contract Testing",
    price: "$5K+",
    period: "per engagement",
    features: ["Cycler time on calibrated equipment", "Custom protocol design", "Weekly progress reporting", "Structured technical report", "Live debrief call"],
    icon: TestTube,
    popular: false,
  },
  {
    name: "Lab Setup & Build",
    price: "$50K+",
    period: "per buildout",
    features: ["Site planning + electrical/HVAC spec", "Equipment sourcing + commissioning", "Methodology + SOP development", "Staff training", "60-day post-launch support"],
    icon: Flask,
    popular: true,
  },
  {
    name: "Strategic Advisory",
    price: "$4K",
    period: "per month",
    features: ["Fractional CTO-level guidance", "Roadmap reviews", "Vendor + hiring evaluation", "Investor narrative support", "Cancel anytime, 30-day notice"],
    icon: Brain,
    popular: false,
  },
];

const credentials = [
  { label: "Years senior expertise", value: "18+", icon: Trophy },
  { label: "Cells tested under engagement", value: "12,000+", icon: BatteryFull },
  { label: "Lab buildouts delivered", value: "27", icon: Flask },
  { label: "Investor diligence reports", value: "84", icon: ChartBar },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2ConsultingPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const navItems = useCallback(
    (close = false) => (
      <>
        {[
          { label: "Services", href: "#services" },
          { label: "Capabilities", href: "#capabilities" },
          { label: "Process", href: "#process" },
          { label: "Pricing", href: "#pricing" },
          { label: "FAQ", href: "#faq" },
        ].map((n) => (
          <a
            key={n.href}
            href={n.href}
            onClick={() => close && setMobileMenuOpen(false)}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            {n.label}
          </a>
        ))}
      </>
    ),
    [],
  );

  return (
    <main className="relative min-h-screen text-white" style={{ background: BG }}>
      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b border-white/5" style={{ background: "rgba(5, 10, 20, 0.7)" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${CYAN} 100%)` }}>
              <Atom size={20} weight="bold" className="text-white" />
            </div>
            <span className="font-bold tracking-tight">Daniel Consulting Group</span>
          </a>
          <div className="hidden md:flex items-center gap-7">{navItems()}</div>
          <a href="#contact" className="hidden md:inline-flex items-center gap-2 h-10 px-5 rounded-full text-sm font-semibold transition-transform hover:scale-[1.03]" style={{ background: BLUE, color: "white" }}>
            Book a consult <ArrowRight size={14} weight="bold" />
          </a>
          <button onClick={() => setMobileMenuOpen((v) => !v)} className="md:hidden p-2 -mr-2">
            {mobileMenuOpen ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 px-6 py-4 flex flex-col gap-4" style={{ background: "rgba(5, 10, 20, 0.95)" }}>
            {navItems(true)}
            <a href="#contact" className="mt-2 text-sm font-semibold" style={{ color: CYAN }}>
              Book a consult →
            </a>
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section id="top" className="relative pt-28 md:pt-36 pb-20 md:pb-28 px-6 overflow-hidden">
        <FloatingParticles />
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 1000px 600px at 50% 0%, ${BLUE_GLOW}, transparent 70%)` }} />
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-7 text-xs font-semibold uppercase tracking-[0.18em]" style={{ borderColor: "rgba(30, 64, 175, 0.4)", background: "rgba(30, 64, 175, 0.08)", color: BLUE_LIGHT }}>
            <Certificate size={14} weight="fill" /> 18+ years · NIST-traceable · Boston battery cluster
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Battery technology consulting{" "}
            <span style={{ background: `linear-gradient(135deg, ${BLUE_LIGHT} 0%, ${CYAN} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              that powers success.
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-9 leading-relaxed">
            From benchtop chemistry to commercial cell manufacturing — the trusted advisor named on the deals investors actually close. Independent. Fixed-scope. NIST-traceable.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <MagneticButton href="#contact" className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full font-bold text-sm transition-shadow hover:shadow-[0_0_40px_rgba(30,64,175,0.4)]" style={{ background: BLUE, color: "white" }}>
              Book a 45-min scoping call <ArrowRight size={14} weight="bold" />
            </MagneticButton>
            <a href="#services" className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full border border-white/15 text-sm font-semibold text-white/80 hover:text-white hover:border-white/30 transition-colors">
              See engagement types
            </a>
          </motion.div>

          {/* Credential row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {credentials.map((c) => (
              <GlassCard key={c.label} className="p-5 text-center">
                <c.icon size={24} weight="duotone" style={{ color: BLUE_LIGHT }} className="mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  {c.value.includes("+") ? <AnimatedCounter target={parseInt(c.value)} suffix="+" /> : c.value}
                </div>
                <div className="text-xs text-white/50 mt-1 uppercase tracking-wider">{c.label}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────── */}
      <SectionReveal id="services" className="relative px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: CYAN }}>
              What we deliver
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Eight ways teams use us.</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Pick one engagement or stack them. Every scope is fixed-price unless you specifically want time-and-materials.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {services.map((s, i) => {
              const open = openService === i;
              return (
                <motion.div key={s.title} variants={fadeUp}>
                  <GlassCard className={`p-6 cursor-pointer transition-all ${open ? "border-white/25" : ""}`} style={open ? { boxShadow: `0 0 40px ${BLUE_GLOW}` } : {}}>
                    <button onClick={() => setOpenService(open ? null : i)} className="w-full flex items-start gap-4 text-left">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: BLUE_GLOW, color: BLUE_LIGHT }}>
                        <s.icon size={22} weight="duotone" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-lg font-bold">{s.title}</h3>
                          <CaretDown size={16} weight="bold" className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: BLUE_LIGHT }} />
                        </div>
                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="text-sm text-white/70 mt-3 leading-relaxed">
                              {s.description}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </button>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ── CAPABILITIES (cell formats) ──────────────────────────── */}
      <SectionReveal id="capabilities" className="relative px-6 py-20 md:py-28 border-y border-white/5" style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: CYAN }}>
              Cell formats we test
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">From coin-cell to pack-scale.</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">Tell us your form factor — odds are we already have the rig. Custom geometries get a custom fixture.</p>
          </motion.div>

          <div className="space-y-3 max-w-4xl mx-auto">
            {capabilities.map((c) => (
              <motion.div key={c.format} variants={fadeUp}>
                <GlassCard className="p-5 md:p-6 flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: CYAN_GLOW, color: CYAN }}>
                    <BatteryFull size={22} weight="duotone" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <h3 className="text-lg font-bold">{c.format}</h3>
                      <span className="text-xs text-white/50">— {c.note}</span>
                    </div>
                    <p className="text-sm text-white/60 mt-1">{c.details}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ── INDUSTRIES ───────────────────────────────────────────── */}
      <SectionReveal className="relative px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: CYAN }}>
              Who we work with
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Trusted across the battery stack.</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {industries.map((ind) => (
              <motion.div key={ind.name} variants={fadeUp}>
                <GlassCard className="p-6 h-full">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: BLUE_GLOW, color: BLUE_LIGHT }}>
                    <ind.icon size={22} weight="duotone" />
                  </div>
                  <h3 className="font-bold mb-1">{ind.name}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{ind.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ── PROCESS ──────────────────────────────────────────────── */}
      <SectionReveal id="process" className="relative px-6 py-20 md:py-28 border-y border-white/5" style={{ background: NAVY }}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: CYAN }}>
              How engagements unfold
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Four steps. No surprises.</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5">
            {processSteps.map((s) => (
              <motion.div key={s.step} variants={fadeUp}>
                <GlassCard className="p-7 h-full">
                  <div className="text-5xl font-black mb-3" style={{ background: `linear-gradient(135deg, ${BLUE_LIGHT} 0%, ${CYAN} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {s.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{s.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <SectionReveal className="relative px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: CYAN }}>
              What clients ship
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Real outcomes. Named clients.</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Names anonymized for confidentiality (it's a small industry) but every quote and outcome is real.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: BLUE_LIGHT }} className="opacity-60 mb-3" />
                  <p className="text-white/80 text-sm leading-relaxed mb-4 flex-1">{t.text}</p>
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center gap-1 mb-1.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={14} weight="fill" style={{ color: AMBER }} />
                      ))}
                    </div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-white/50">{t.role}</p>
                    <p className="text-xs mt-2 inline-block px-2.5 py-0.5 rounded-full font-semibold" style={{ background: BLUE_GLOW, color: BLUE_LIGHT }}>
                      {t.deliverable}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ── COMPARISON ──────────────────────────────────────────── */}
      <SectionReveal className="relative px-6 py-20 md:py-28 border-y border-white/5" style={{ background: NAVY }}>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: CYAN }}>
              vs. generic test labs
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Why teams come to us.</h2>
          </motion.div>
          <motion.div variants={fadeUp}>
            <GlassCard className="overflow-hidden">
              <div className="grid grid-cols-3 bg-white/5 px-5 py-3 text-xs uppercase tracking-wider font-bold text-white/50 border-b border-white/10">
                <div>What you get</div>
                <div className="text-center" style={{ color: BLUE_LIGHT }}>Daniel Consulting</div>
                <div className="text-center text-white/50">Generic lab</div>
              </div>
              {comparisonRows.map((r) => (
                <div key={r.feature} className="grid grid-cols-3 items-center px-5 py-3.5 border-b border-white/5 last:border-0 text-sm">
                  <div className="text-white/80">{r.feature}</div>
                  <div className="text-center">
                    <CheckCircle size={20} weight="fill" style={{ color: CYAN }} className="inline-block" />
                  </div>
                  <div className="text-center text-white/50 italic text-xs">{typeof r.them === "string" ? r.them : "—"}</div>
                </div>
              ))}
            </GlassCard>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ── PRICING / ENGAGEMENT TIERS ───────────────────────────── */}
      <SectionReveal id="pricing" className="relative px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: CYAN }}>
              Engagement tiers
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Three ways to start.</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Most teams begin with one engagement and graduate to ongoing advisory once trust is established.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {engagementTiers.map((t) => (
              <motion.div key={t.name} variants={fadeUp}>
                <GlassCard className={`p-7 h-full relative ${t.popular ? "border-white/25" : ""}`} style={t.popular ? { boxShadow: `0 0 50px ${BLUE_GLOW}` } : {}}>
                  {t.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: BLUE, color: "white" }}>
                      Most common
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: BLUE_GLOW, color: BLUE_LIGHT }}>
                    <t.icon size={24} weight="duotone" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{t.name}</h3>
                  <div className="flex items-baseline gap-2 mb-5">
                    <span className="text-4xl font-extrabold tracking-tight">{t.price}</span>
                    <span className="text-sm text-white/60">{t.period}</span>
                  </div>
                  <ul className="space-y-2.5">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-white/75">
                        <CheckCircle size={16} weight="fill" style={{ color: CYAN }} className="flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <SectionReveal id="faq" className="relative px-6 py-20 md:py-28 border-y border-white/5" style={{ background: NAVY }}>
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: CYAN }}>
              Common questions
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Before the scoping call.</h2>
          </motion.div>
          <div className="space-y-3">
            {faqItems.map((f, i) => {
              const open = openFaq === i;
              return (
                <motion.div key={f.q} variants={fadeUp}>
                  <GlassCard>
                    <button onClick={() => setOpenFaq(open ? null : i)} className="w-full p-5 text-left flex items-center justify-between gap-4">
                      <span className="font-semibold">{f.q}</span>
                      <CaretDown size={16} weight="bold" className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: BLUE_LIGHT }} />
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                          <p className="px-5 pb-5 text-sm text-white/70 leading-relaxed">{f.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ── CTA + CONTACT ────────────────────────────────────────── */}
      <SectionReveal id="contact" className="relative px-6 py-24 md:py-32">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 800px 500px at 50% 50%, ${BLUE_GLOW}, transparent 70%)` }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp}>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-5">
              Bring us your{" "}
              <span style={{ background: `linear-gradient(135deg, ${BLUE_LIGHT} 0%, ${CYAN} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                hardest battery question.
              </span>
            </h2>
            <p className="text-white/70 text-lg mb-9 max-w-xl mx-auto leading-relaxed">
              45-minute scoping call. No NDA needed for the first one. We'll tell you on the call whether we're the right fit — and if we're not, we'll tell you who is.
            </p>
            <div className="mb-12">
              <InquiryForm
                slug="consulting"
                accent={BLUE_LIGHT}
                accentDeep="#3b82f6"
                ink="#0f172a"
                inkSoft="#475569"
                panelBg="rgba(255, 255, 255, 0.95)"
                submitLabel="Book the scoping call"
                successHeading="Got it — we'll be in touch within 1 business day."
                successBody="If your project has a hard timeline (investor diligence deadline, manufacturing milestone, conference demo), reply to the confirmation email with the date and we'll fast-track the scoping call."
                fields={[
                  { type: "text", name: "name", label: "Your name *", placeholder: "First and last", required: true },
                  { type: "email", name: "email", label: "Work email *", placeholder: "you@company.com", required: true },
                  { type: "text", name: "company", label: "Company / lab", placeholder: "Acme Battery, MIT, etc." },
                  { type: "tel", name: "phone", label: "Phone (optional)", placeholder: "(555) 555-5555" },
                  {
                    type: "select",
                    name: "role",
                    label: "Your role",
                    options: [
                      { value: "founder-ceo", label: "Founder / CEO" },
                      { value: "engineering", label: "Engineering / R&D lead" },
                      { value: "product", label: "Product / business" },
                      { value: "investor", label: "Investor (due diligence)" },
                      { value: "academic", label: "Academic / lab director" },
                      { value: "other", label: "Other" },
                    ],
                  },
                  {
                    type: "select",
                    name: "engagement_type",
                    label: "What are you looking for?",
                    options: [
                      { value: "contract-testing", label: "Contract battery testing" },
                      { value: "equipment-sourcing", label: "Equipment sourcing / Neware purchase" },
                      { value: "lab-setup", label: "R&D lab setup" },
                      { value: "custom-hardware", label: "Custom test hardware design" },
                      { value: "diligence", label: "Investor due diligence" },
                      { value: "failure-analysis", label: "Failure analysis" },
                      { value: "advisory", label: "Strategic / fractional CTO advisory" },
                      { value: "not-sure", label: "Not sure yet — help me scope" },
                    ],
                  },
                  {
                    type: "textarea",
                    name: "project_description",
                    label: "Brief project context",
                    placeholder: "What chemistry, what stage, what timeline. No NDA needed for first conversation — keep it general if you prefer.",
                    rows: 4,
                  },
                ]}
              />
              <p className="text-center text-xs text-white/50 mt-4">
                Or call <a href="tel:6179973235" className="underline hover:text-white">(617) 997-3235</a> directly.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <GlassCard className="p-5 text-left">
                <MapPin size={20} weight="duotone" style={{ color: BLUE_LIGHT }} className="mb-2" />
                <p className="font-bold text-sm mb-0.5">Lab</p>
                <p className="text-xs text-white/65">444 Somerville Ave<br />Somerville, MA 02143</p>
              </GlassCard>
              <GlassCard className="p-5 text-left">
                <Envelope size={20} weight="duotone" style={{ color: BLUE_LIGHT }} className="mb-2" />
                <p className="font-bold text-sm mb-0.5">Email</p>
                <p className="text-xs text-white/65 break-all">reece@<br />danielconsultinggroup.com</p>
              </GlassCard>
              <GlassCard className="p-5 text-left">
                <Clock size={20} weight="duotone" style={{ color: BLUE_LIGHT }} className="mb-2" />
                <p className="font-bold text-sm mb-0.5">Hours</p>
                <p className="text-xs text-white/65">By appointment<br />Mon–Fri</p>
              </GlassCard>
            </div>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="px-6 py-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${CYAN} 100%)` }}>
              <Atom size={16} weight="bold" className="text-white" />
            </div>
            <span className="font-semibold text-white/75">Daniel Consulting Group, LLC</span>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} · Battery technology consulting · Somerville, MA</p>
        </div>
      </footer>
    </main>
  );
}
