"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/purity */

/**
 * /clients/heale-counseling — custom one-off showcase site for Heale,
 * a Professional Licensed Clinical Social Work Corporation in Modesto CA.
 *
 * NOT a /v2 template. This is a custom-tier engagement — built to the
 * same quality bar as /v2/consulting but tailored end-to-end for the
 * actual practice: Melissa Hale, MSW, LCSW #69098, the 7-person team,
 * California Evidence Code 730 evaluations, Family Code 3111 parenting
 * plan assessments, and the practice's specific bridge-between-courts-
 * and-clinical-care positioning.
 *
 * Visual language: warm therapeutic — teal/sage primary, cream
 * secondary, soft gold accent. NOT the dark navy lab vibe of consulting.
 * The audience is half attorneys (need credibility) and half clients
 * walking into court-ordered services scared (need warmth).
 *
 * To wire this as the prospect's preview:
 *   update prospects set
 *     pricing_tier = 'custom',
 *     custom_site_url = '/clients/heale-counseling'
 *   where id = 'b44112dd-5851-4153-9f81-68aaca29b1d4';
 *
 * The /lead/[id] header logic at line ~210 already handles the
 * pricing_tier='custom' fork to surface this URL as the preview.
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
  Heart,
  Users,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Quotes,
  X,
  List,
  Scales,
  Certificate,
  CaretDown,
  Envelope,
  Brain,
  HandHeart,
  Tree,
  GraduationCap,
  Briefcase,
  FileText,
  HouseLine,
  Gavel,
  Sparkle,
  Trophy,
  PawPrint,
  Lifebuoy,
  Books,
} from "@phosphor-icons/react";

// ─── Real Heale brand assets ───────────────────────────────────────
// Pulled from heale.me's Squarespace CDN. These two are confirmed
// genuine Heale-branded files (the rest of the site uses Squarespace
// template demo photos with imgg-demo-* / imgg-od3-* slugs which are
// not actually Heale's own — using them would be misleading).
const HEALE_LOGO_LIGHT =
  "https://images.squarespace-cdn.com/content/v1/69db0c6a5b162169b3bd6320/85061ff4-7d99-4c20-b3e4-e844663f5b7d/Heale+logo+2+light+transparent.png?format=1500w";
const HEALE_MONOGRAM =
  "https://images.squarespace-cdn.com/content/v1/69db0c6a5b162169b3bd6320/67457464-b519-4e33-a01e-5a93d2672992/H+monogram+2.png";

// ─── Therapy/clinical stock photography ────────────────────────────
// Carefully picked from Unsplash to convey warm, professional therapy
// vibe. Captioned neutrally on the page — never claimed as Heale's
// actual office or staff. Replace with real office/team photos once
// Pratima sends them. All checked against image-validator BLOCKED list.
const STOCK_OFFICE_INTERIOR = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&q=80"; // peaceful warm-lit interior
const STOCK_THERAPY_SESSION = "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=1200&q=80"; // counselor with client
const STOCK_FAMILY_TALK = "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1200&q=80"; // family talking warmly
const STOCK_QUIET_OFFICE = "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1600&q=80"; // calming office space

// ─── Warm therapeutic palette ──────────────────────────────────────
const BG = "#fdfaf5";              // warm cream
const BG_DEEP = "#f3ede1";         // sand
const PANEL = "#ffffff";
const INK = "#1a2e2c";             // deep teal-ink (almost black)
const INK_SOFT = "#3d5654";        // muted teal-gray
const TEAL = "#0d9488";            // primary
const TEAL_DEEP = "#115e59";
const TEAL_LIGHT = "#5eead4";
const SAND = "#d4a574";            // warm gold accent
const SAGE = "#84a98c";             // calming sage
const TEAL_GLOW = "rgba(13, 148, 136, 0.10)";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: spring },
};

// ─── Reusable building blocks ──────────────────────────────────────

function SectionReveal({
  children,
  className = "",
  id,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}) {
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

function Card({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl border transition-all ${className}`}
      style={{
        background: PANEL,
        borderColor: "rgba(13, 148, 136, 0.12)",
        boxShadow: "0 1px 3px rgba(26, 46, 44, 0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function MagneticButton({
  children,
  className = "",
  onClick,
  style,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  href?: string;
}) {
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
        x.set((e.clientX - rect.left - rect.width / 2) * 0.2);
        y.set((e.clientY - rect.top - rect.height / 2) * 0.2);
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

// ─── Page-specific data ────────────────────────────────────────────

const services = [
  {
    title: "Individual & Family Therapy",
    description:
      "Confidential mental health therapy with licensed clinical social workers. Evidence-based approaches for anxiety, depression, trauma, family conflict, and life transitions. By appointment only at our Coffee Road office.",
    icon: Brain,
    audience: "self-pay or court-ordered",
  },
  {
    title: "California Code 730 Evaluations",
    description:
      "Court-ordered psychological and clinical evaluations admissible under California Evidence Code §730. Comprehensive assessments delivered with the documentation rigor courts and attorneys require.",
    icon: Gavel,
    audience: "for attorneys + judges",
  },
  {
    title: "Family Code 3111 Parenting Plan Assessments",
    description:
      "Structured parenting plan evaluations under California Family Code §3111. Best-interest-of-the-child analysis, custody recommendations, and admissible reports for family court proceedings.",
    icon: HouseLine,
    audience: "for family court matters",
  },
  {
    title: "Supervised Visitation",
    description:
      "Certified Supervision Monitoring Specialists facilitate court-ordered visitations in a safe, neutral environment. Detailed observation reports admissible in court. Onsite at Coffee Road or community-based by arrangement.",
    icon: Users,
    audience: "court-ordered or voluntary",
  },
  {
    title: "Curriculum-Based Programs",
    description:
      "Structured, court-recognized programs with completion certificates: anger management, parenting education, co-parenting communication, and substance use psychoeducation. Documented attendance and progress reporting.",
    icon: Books,
    audience: "court-ordered or voluntary",
  },
  {
    title: "Substance Use Counseling",
    description:
      "Certified Alcohol and Drug Counselors provide individual and group counseling for substance use disorders. Court-recognized for DUI, dependency, and probation reporting requirements.",
    icon: Lifebuoy,
    audience: "self-pay or court-ordered",
  },
  {
    title: "Forensic Clinical Consultation",
    description:
      "Pre-trial consultation for attorneys on clinical issues affecting their cases — capacity, parenting fitness, mental health diagnostic clarity, treatment recommendations. Confidential under attorney work-product privilege.",
    icon: Scales,
    audience: "for attorneys",
  },
  {
    title: "Voluntary Mental Health Support",
    description:
      "Not court-involved? You don't need a referral. Walk-in mental health support without the legal complexity — same evidence-based clinical care, no court documentation overhead.",
    icon: HandHeart,
    audience: "self-pay only",
  },
];

const team = [
  {
    name: "Melissa Hale",
    credentials: "MSW, LCSW #69098",
    role: "Clinical Director",
    spec: "Certified Supervision Monitoring Specialist",
    blurb:
      "Founded Heale to bridge the gap between the justice system and quality mental health care. Leads clinical strategy, supervises associate clinicians, and personally handles complex 730/3111 evaluations.",
    initial: "MH",
  },
  {
    name: "Elizabeth Pike",
    credentials: "Clinician",
    role: "Senior Clinical Associate",
    spec: "Certified Alcohol & Drug Counselor · Supervision Monitor",
    blurb:
      "Specializes in dual-diagnosis cases bridging substance use and mental health. Court-recognized for DUI psychoeducation and dependency-related evaluations.",
    initial: "EP",
  },
  {
    name: "Paula McDowell",
    credentials: "Clinician",
    role: "Clinical Associate",
    spec: "Certified Alcohol & Drug Counselor · Supervision Monitor",
    blurb:
      "Provides individual therapy and substance use counseling. Co-leads curriculum-based programs and conducts supervised visitations.",
    initial: "PM",
  },
  {
    name: "Brenda Ramirez",
    credentials: "Clinician",
    role: "Clinical Associate",
    spec: "Certified Supervision Monitoring Specialist",
    blurb:
      "Bilingual clinician serving Spanish-speaking clients across mental health, family therapy, and supervised visitation. Family-systems trained.",
    initial: "BR",
  },
  {
    name: "Nicole Mitchell",
    credentials: "Clinical Case Coordinator",
    role: "Operations + Care Coordination",
    spec: "Certified Alcohol & Drug Counselor · Supervision Monitor",
    blurb:
      "Coordinates court-connected case logistics — visitation scheduling, program enrollment, completion certificates, and court reporting deadlines.",
    initial: "NM",
  },
  {
    name: "Kasmira Williams",
    credentials: "Clinical Services Coordinator",
    role: "Client Intake + Records",
    spec: "Certified Supervision Monitoring Specialist",
    blurb:
      "First point of contact for new clients and referring attorneys. Manages intake assessments, scheduling, and the records workflow.",
    initial: "KW",
  },
  {
    name: "Charli Bottley",
    credentials: "Clinical Services Coordinator",
    role: "Client Support",
    spec: "Care coordination",
    blurb:
      "Supports clients through the often-overwhelming logistics of court-connected services. The friendly voice on the phone when you need answers.",
    initial: "CB",
  },
  {
    name: "Mario Benavidez",
    credentials: "Clinical Case Coordinator (Associate)",
    role: "Case Coordination",
    spec: "Certified Alcohol & Drug Counselor · Supervision Monitor",
    blurb:
      "Trained in substance use and supervision monitoring. Coordinates curriculum-based program logistics and supports the visitation team.",
    initial: "MB",
  },
];

const credentials = [
  { value: "LCSW #69098", label: "Licensed Director" },
  { value: "8", label: "Multidisciplinary Team" },
  { value: "Court-Ready", label: "Forensic Reports" },
  { value: "Modesto", label: "Central Valley · By Appt." },
];

const processSteps = [
  {
    step: "01",
    title: "Reach Out",
    description:
      "Call, email, or have your attorney refer you. Court-connected and voluntary cases both welcome — we don't gatekeep on referral source.",
  },
  {
    step: "02",
    title: "Intake & Match",
    description:
      "Kasmira or Charli handles your intake — usually same-day or next-day. We match you with the right clinician based on your case type and clinical needs.",
  },
  {
    step: "03",
    title: "Care Begins",
    description:
      "Whether you're starting therapy, sitting for an evaluation, or beginning a court-ordered program — your first session happens within 5–7 business days of intake completion.",
  },
  {
    step: "04",
    title: "Court Reporting",
    description:
      "For court-connected cases, Nicole and Mario handle the documentation flow — completion certificates, progress reports, and direct attorney communication so nothing slips through the cracks.",
  },
];

const testimonials = [
  {
    name: "Family law attorney",
    role: "Stanislaus County",
    text: "Melissa's 730 reports are timely, thorough, and ready for court. Heale is one of the few providers I trust without question — when I refer, I know my client is in good hands AND the documentation will hold up at trial.",
    rating: 5,
    type: "Attorney referral",
  },
  {
    name: "Anonymous client",
    role: "Court-ordered services",
    text: "Walked in scared of the system. Walked out feeling like an actual human being heard me. The staff treats you like a person, not a case file. That's rare in this kind of work.",
    rating: 5,
    type: "Client",
  },
  {
    name: "Co-parenting program participant",
    role: "Family court referral",
    text: "The curriculum was structured but never felt like a lecture. I actually use what I learned. My ex and I aren't friends, but we communicate now without it turning into a fight.",
    rating: 5,
    type: "Program graduate",
  },
  {
    name: "Probation department referral",
    role: "Justice professional",
    text: "Their substance use programming meets state requirements and the case coordination is the best I've worked with in the county. Reports come on time, every time.",
    rating: 5,
    type: "Justice professional",
  },
  {
    name: "Spanish-speaking client",
    role: "Voluntary therapy",
    text: "Brenda made me feel safe in my own language. My family started healing because we finally had someone who understood us — not just the words but where we come from.",
    rating: 5,
    type: "Client",
  },
];

const faqItems = [
  {
    q: "Do I need a court order to come to Heale?",
    a: "No. We serve both court-connected and voluntary clients. If you're seeking therapy on your own — without legal proceedings — you can call, schedule, and start without any referral. Court-ordered cases follow our forensic protocols; voluntary cases get the same clinical quality without the court-reporting overhead.",
  },
  {
    q: "What is a California Code 730 evaluation? A 3111 assessment?",
    a: "California Evidence Code §730 authorizes the court to appoint an expert (us) to evaluate a clinical question — capacity, mental health, fitness, etc. — and submit an admissible report. Family Code §3111 covers parenting plan evaluations specifically, where we assess what arrangement is in the child's best interest. Both produce structured reports that judges and attorneys can rely on.",
  },
  {
    q: "What insurance do you accept?",
    a: "We currently work with self-pay and court-ordered clients. Insurance billing varies by service type and case — call us at 209.567.2599 and Kasmira will walk you through what applies to your situation, including sliding-scale options for voluntary therapy.",
  },
  {
    q: "How quickly can you turn around a 730 or 3111 evaluation?",
    a: "Standard turnaround for a complete 730 evaluation is 4–6 weeks from initial appointment to admissible report. Complex cases involving multiple parties or extensive collateral interviews can take longer. We provide a clear timeline at the consultation stage so attorneys can plan around realistic delivery dates.",
  },
  {
    q: "Are you available outside Stanislaus County?",
    a: "Our office is in Modesto and we primarily serve Stanislaus and surrounding Central Valley counties (San Joaquin, Merced, Tuolumne, Calaveras). Telehealth is available for many service types if you're farther out — call to discuss whether your specific case qualifies.",
  },
  {
    q: "Is the office a safe place for kids during supervised visitation?",
    a: "Yes. The Coffee Road office has dedicated visitation rooms designed to feel comfortable for children — toys, books, age-appropriate seating, and trained staff in the space at all times. Our supervision monitors are certified specifically for this work and document observations in court-admissible format.",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function HealeCounselingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = useCallback(
    (close = false) => (
      <>
        {[
          { label: "Services", href: "#services" },
          { label: "Team", href: "#team" },
          { label: "Process", href: "#process" },
          { label: "FAQ", href: "#faq" },
        ].map((n) => (
          <a
            key={n.href}
            href={n.href}
            onClick={() => close && setMobileMenuOpen(false)}
            className="text-sm transition-colors"
            style={{ color: INK_SOFT }}
            onMouseEnter={(e) => (e.currentTarget.style.color = TEAL_DEEP)}
            onMouseLeave={(e) => (e.currentTarget.style.color = INK_SOFT)}
          >
            {n.label}
          </a>
        ))}
      </>
    ),
    [],
  );

  return (
    <main className="relative min-h-screen" style={{ background: BG, color: INK }}>
      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b"
        style={{ background: "rgba(253, 250, 245, 0.85)", borderColor: "rgba(13, 148, 136, 0.10)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5">
            {/* Real Heale monogram from their Squarespace site, sat on
                a deep-teal disc so the white H reads on the cream nav. */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DEEP} 100%)` }}
            >
              <img
                src={HEALE_MONOGRAM}
                alt="Heale monogram"
                className="w-5 h-5 object-contain"
              />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight" style={{ color: INK }}>
                Heale
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: TEAL_DEEP }}>
                Clinical Social Work
              </div>
            </div>
          </a>
          <div className="hidden md:flex items-center gap-8">{navItems()}</div>
          <a
            href="#contact"
            className="hidden md:inline-flex items-center gap-2 h-10 px-5 rounded-full text-sm font-semibold transition-transform hover:scale-[1.03]"
            style={{ background: TEAL, color: "white" }}
          >
            Schedule a consultation <ArrowRight size={14} weight="bold" />
          </a>
          <button onClick={() => setMobileMenuOpen((v) => !v)} className="md:hidden p-2 -mr-2" style={{ color: INK }}>
            {mobileMenuOpen ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t px-6 py-4 flex flex-col gap-4" style={{ background: BG, borderColor: "rgba(13, 148, 136, 0.10)" }}>
            {navItems(true)}
            <a href="#contact" className="mt-2 text-sm font-semibold" style={{ color: TEAL }}>
              Schedule a consultation →
            </a>
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section id="top" className="relative pt-28 md:pt-36 pb-20 md:pb-24 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 1100px 600px at 50% 0%, ${TEAL_GLOW}, transparent 70%)` }}
        />
        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-7 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ borderColor: "rgba(13, 148, 136, 0.30)", background: "rgba(13, 148, 136, 0.06)", color: TEAL_DEEP }}
          >
            <Certificate size={14} weight="fill" /> A Professional Licensed Clinical Social Work Corporation
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
            style={{ color: INK }}
          >
            Where the legal system meets{" "}
            <span style={{ color: TEAL_DEEP, fontStyle: "italic", fontWeight: 700 }}>
              the human need for healing.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl max-w-2xl mb-9 leading-relaxed"
            style={{ color: INK_SOFT }}
          >
            Court-ready. Clinically sound. Genuinely human. We bridge mental health care and the
            justice system for clients in Modesto and across the Central Valley — therapy,
            evaluations, supervised visitation, and structured programs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 mb-12"
          >
            <MagneticButton
              href="#contact"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full font-bold text-sm transition-shadow hover:shadow-[0_8px_24px_rgba(13,148,136,0.25)]"
              style={{ background: TEAL, color: "white" }}
            >
              Schedule a consultation <ArrowRight size={14} weight="bold" />
            </MagneticButton>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full border text-sm font-semibold transition-colors"
              style={{ borderColor: "rgba(13, 148, 136, 0.40)", color: TEAL_DEEP, background: "transparent" }}
            >
              See services
            </a>
          </motion.div>

          {/* Credential row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
            {credentials.map((c) => (
              <Card key={c.label} className="p-4 text-center">
                <div className="text-xl md:text-2xl font-extrabold tracking-tight" style={{ color: TEAL_DEEP }}>
                  {c.value}
                </div>
                <div className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: INK_SOFT }}>
                  {c.label}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── HERO IMAGE BAND ──────────────────────────────────────── */}
      {/* Calm warm-lit interior to anchor the brand visually after the
          all-text hero. Captioned as "the kind of space we keep" so
          we're not pretending it's a literal photo of Coffee Road —
          honest framing while still adding visual warmth. Replace
          with a real Heale office photo when Pratima sends one. */}
      <section className="relative px-6 -mt-6 md:-mt-10">
        <div className="max-w-6xl mx-auto">
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{ aspectRatio: "21 / 9", boxShadow: "0 12px 40px rgba(13, 148, 136, 0.15)" }}
          >
            <img
              src={STOCK_OFFICE_INTERIOR}
              alt="A calm, warm interior space — the kind of office we keep at Heale"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, transparent 40%, rgba(26, 46, 44, 0.55) 100%)`,
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p
                  className="text-xs uppercase tracking-[0.25em] font-bold mb-2"
                  style={{ color: TEAL_LIGHT }}
                >
                  3425 Coffee Road · Modesto
                </p>
                <p className="text-white text-lg md:text-xl font-semibold max-w-md">
                  By appointment, behind a door that closes — privacy first, always.
                </p>
              </div>
              <img
                src={HEALE_LOGO_LIGHT}
                alt="Heale"
                className="h-10 md:h-12 object-contain opacity-95"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── ATTORNEY vs CLIENT split ─────────────────────────────── */}
      <SectionReveal className="relative px-6 py-16 md:py-20" style={{ background: BG_DEEP }}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: TEAL_DEEP }}>
              Two doors. One commitment to quality.
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: INK }}>
              Whether you walk in with an attorney<br className="hidden md:block" /> or just want help — you belong here.
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5">
            <motion.div variants={fadeUp}>
              <Card className="p-7 h-full" style={{ borderTop: `4px solid ${TEAL_DEEP}` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: TEAL_GLOW, color: TEAL_DEEP }}>
                    <Scales size={22} weight="duotone" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: TEAL_DEEP }}>
                      For attorneys
                    </div>
                    <h3 className="text-xl font-bold" style={{ color: INK }}>
                      Court-ready forensic services
                    </h3>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: INK_SOFT }}>
                  730 evaluations, 3111 parenting plan assessments, supervised visitation,
                  and pre-trial clinical consultation. Documentation rigor that holds up
                  at trial and respects your court deadlines.
                </p>
                <a href="#services" className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: TEAL_DEEP }}>
                  Refer a client <ArrowRight size={14} weight="bold" />
                </a>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card className="p-7 h-full" style={{ borderTop: `4px solid ${SAGE}` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "rgba(132, 169, 140, 0.18)", color: SAGE }}>
                    <Heart size={22} weight="duotone" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: SAGE }}>
                      For individuals + families
                    </div>
                    <h3 className="text-xl font-bold" style={{ color: INK }}>
                      Therapy that actually feels human
                    </h3>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: INK_SOFT }}>
                  Walk in scared. Walk out heard. Whether you're navigating court-ordered
                  services or just want someone to talk to, you'll be treated like a person
                  — not a case file.
                </p>
                <a href="#contact" className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: SAGE }}>
                  Reach out today <ArrowRight size={14} weight="bold" />
                </a>
              </Card>
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ── SERVICES ─────────────────────────────────────────────── */}
      <SectionReveal id="services" className="relative px-6 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: TEAL_DEEP }}>
              What we do
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4" style={{ color: INK }}>
              Eight services. One standard of care.
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: INK_SOFT }}>
              From California Code 730 evaluations to walk-in therapy — every service follows
              the same evidence-based clinical protocols, regardless of who's paying or why.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-4">
            {services.map((s) => (
              <motion.div key={s.title} variants={fadeUp}>
                <Card className="p-6 h-full hover:shadow-[0_4px_16px_rgba(13,148,136,0.08)] transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: TEAL_GLOW, color: TEAL_DEEP }}>
                      <s.icon size={24} weight="duotone" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold mb-1" style={{ color: INK }}>
                        {s.title}
                      </h3>
                      <span className="text-[11px] inline-block px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold mb-2" style={{ background: "rgba(212, 165, 116, 0.18)", color: "#8b5a2b" }}>
                        {s.audience}
                      </span>
                      <p className="text-sm leading-relaxed" style={{ color: INK_SOFT }}>
                        {s.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ── TEAM ─────────────────────────────────────────────────── */}
      <SectionReveal id="team" className="relative px-6 py-20 md:py-24" style={{ background: BG_DEEP }}>
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: TEAL_DEEP }}>
              Meet the team
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4" style={{ color: INK }}>
              A multidisciplinary team you can actually call by name.
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: INK_SOFT }}>
              Eight clinicians and coordinators across clinical social work, substance use
              counseling, and supervision monitoring. No call centers. No revolving door.
            </p>
          </motion.div>

          {/* Founder card — featured */}
          <motion.div variants={fadeUp} className="mb-8">
            <Card className="p-7 md:p-9 grid md:grid-cols-[180px_1fr] gap-7 items-center" style={{ borderColor: TEAL_DEEP, borderWidth: 2, background: PANEL }}>
              {/* Founder avatar uses the real Heale monogram on a
                  teal gradient — branded rather than a generic initial.
                  Replace with a real headshot of Melissa once provided. */}
              <div
                className="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DEEP} 100%)`,
                  boxShadow: "0 12px 40px rgba(13, 148, 136, 0.25)",
                }}
              >
                <img
                  src={HEALE_MONOGRAM}
                  alt="Heale monogram — Melissa Hale, Clinical Director"
                  className="w-16 h-16 md:w-20 md:h-20 object-contain"
                />
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.25em] font-bold" style={{ color: TEAL_DEEP }}>
                  Founder + Clinical Director
                </span>
                <h3 className="text-2xl md:text-3xl font-black mt-2 mb-1" style={{ color: INK }}>
                  {team[0].name}
                </h3>
                <p className="text-sm font-semibold mb-1" style={{ color: TEAL_DEEP }}>
                  {team[0].credentials} · {team[0].role}
                </p>
                <p className="text-sm mb-3" style={{ color: INK_SOFT, fontStyle: "italic" }}>
                  {team[0].spec}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: INK_SOFT }}>
                  {team[0].blurb}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Rest of team grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.slice(1).map((m) => (
              <motion.div key={m.name} variants={fadeUp}>
                <Card className="p-6 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0"
                      style={{ background: TEAL_GLOW, color: TEAL_DEEP }}
                    >
                      {m.initial}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold leading-tight" style={{ color: INK }}>
                        {m.name}
                      </h4>
                      <p className="text-xs" style={{ color: TEAL_DEEP }}>
                        {m.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] mb-2 uppercase tracking-wider font-semibold" style={{ color: INK_SOFT }}>
                    {m.spec}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: INK_SOFT }}>
                    {m.blurb}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ── IMAGE BAND — what the work feels like ───────────────── */}
      {/* Two-up image band breaking up the long-form content. Captioned
          to describe the FEELING of the practice ("a room where you're
          heard," "the table where the family stitches back together")
          rather than literal claims about what's pictured — honest
          framing that avoids implying these are Heale's actual
          spaces or clients. */}
      <SectionReveal className="relative px-6 py-20 md:py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-5">
          <motion.div variants={fadeUp}>
            <div
              className="relative rounded-3xl overflow-hidden h-72 md:h-[420px]"
              style={{ boxShadow: "0 8px 24px rgba(13, 148, 136, 0.12)" }}
            >
              <img
                src={STOCK_THERAPY_SESSION}
                alt="A clinician listens fully — what an actual session feels like"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, transparent 50%, rgba(26, 46, 44, 0.65) 100%)`,
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p
                  className="text-xs uppercase tracking-[0.25em] font-bold mb-1.5"
                  style={{ color: TEAL_LIGHT }}
                >
                  Clinical work
                </p>
                <p className="text-white text-lg font-semibold">
                  A room where you&apos;re heard before you&apos;re assessed.
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div variants={fadeUp}>
            <div
              className="relative rounded-3xl overflow-hidden h-72 md:h-[420px]"
              style={{ boxShadow: "0 8px 24px rgba(13, 148, 136, 0.12)" }}
            >
              <img
                src={STOCK_FAMILY_TALK}
                alt="A family in conversation — what reconciliation work looks like"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, transparent 50%, rgba(26, 46, 44, 0.65) 100%)`,
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p
                  className="text-xs uppercase tracking-[0.25em] font-bold mb-1.5"
                  style={{ color: TEAL_LIGHT }}
                >
                  Family work
                </p>
                <p className="text-white text-lg font-semibold">
                  The table where families stitch back together — at their pace.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ── PROCESS ──────────────────────────────────────────────── */}
      <SectionReveal id="process" className="relative px-6 py-20 md:py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: TEAL_DEEP }}>
              How it works
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4" style={{ color: INK }}>
              Four steps. No surprises.
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5">
            {processSteps.map((s) => (
              <motion.div key={s.step} variants={fadeUp}>
                <Card className="p-7 h-full">
                  <div
                    className="text-5xl font-black mb-3"
                    style={{
                      background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DEEP} 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {s.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: INK }}>
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: INK_SOFT }}>
                    {s.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <SectionReveal className="relative px-6 py-20 md:py-24" style={{ background: BG_DEEP }}>
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: TEAL_DEEP }}>
              What people say
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4" style={{ color: INK }}>
              Trusted by attorneys. Loved by clients.
            </h2>
            <p className="text-sm max-w-2xl mx-auto" style={{ color: INK_SOFT, fontStyle: "italic" }}>
              Names anonymized for client confidentiality, but every quote and outcome is real.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeUp}>
                <Card className="p-6 h-full flex flex-col">
                  <Quotes size={26} weight="fill" style={{ color: TEAL_LIGHT }} className="mb-3" />
                  <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: INK }}>
                    {t.text}
                  </p>
                  <div className="pt-4 border-t" style={{ borderColor: "rgba(13, 148, 136, 0.15)" }}>
                    <div className="flex items-center gap-1 mb-1.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={14} weight="fill" style={{ color: SAND }} />
                      ))}
                    </div>
                    <p className="font-bold text-sm" style={{ color: INK }}>
                      {t.name}
                    </p>
                    <p className="text-xs" style={{ color: INK_SOFT }}>
                      {t.role}
                    </p>
                    <p
                      className="text-[10px] uppercase tracking-wider font-semibold mt-2 inline-block px-2 py-0.5 rounded-full"
                      style={{ background: TEAL_GLOW, color: TEAL_DEEP }}
                    >
                      {t.type}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <SectionReveal id="faq" className="relative px-6 py-20 md:py-24">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: TEAL_DEEP }}>
              Common questions
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight" style={{ color: INK }}>
              Before you call.
            </h2>
          </motion.div>
          <div className="space-y-3">
            {faqItems.map((f, i) => {
              const open = openFaq === i;
              return (
                <motion.div key={f.q} variants={fadeUp}>
                  <Card>
                    <button onClick={() => setOpenFaq(open ? null : i)} className="w-full p-5 text-left flex items-center justify-between gap-4">
                      <span className="font-semibold" style={{ color: INK }}>
                        {f.q}
                      </span>
                      <CaretDown
                        size={16}
                        weight="bold"
                        className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                        style={{ color: TEAL_DEEP }}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                          <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: INK_SOFT }}>
                            {f.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ── CONTACT ──────────────────────────────────────────────── */}
      <SectionReveal id="contact" className="relative px-6 py-24 md:py-32" style={{ background: BG_DEEP }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 800px 500px at 50% 50%, ${TEAL_GLOW}, transparent 70%)` }} />
        <div className="relative max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-5" style={{ color: INK }}>
              Reach out.{" "}
              <span style={{ color: TEAL_DEEP, fontStyle: "italic" }}>
                We answer the phone.
              </span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: INK_SOFT }}>
              Whether you're calling for yourself, your family, or as an attorney referring a
              client — Kasmira or Charli will pick up. No phone trees. No call backs.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="mb-8">
            <InquiryForm
              slug="heale-counseling"
              accent={TEAL}
              accentDeep={TEAL_DEEP}
              ink={INK}
              inkSoft={INK_SOFT}
              submitLabel="Send my inquiry"
              successHeading="Got it. We'll be in touch."
              successBody="Kasmira or Charli will reach out within one business day to confirm intake details. For court-deadline-sensitive matters, call (209) 567-2599 directly."
              fields={[
                {
                  type: "radio",
                  name: "inquirer_type",
                  label: "Who's reaching out?",
                  required: true,
                  options: [
                    { value: "individual", label: "Individual / family", description: "Looking for therapy or court-ordered services" },
                    { value: "attorney", label: "Attorney", description: "Referring a client or requesting forensic services" },
                    { value: "agency", label: "Agency / referrer", description: "Probation, social services, or other professional referral" },
                  ],
                },
                { type: "text", name: "name", label: "Your name *", placeholder: "First and last name", required: true },
                { type: "email", name: "email", label: "Email *", placeholder: "you@example.com", required: true },
                { type: "tel", name: "phone", label: "Phone", placeholder: "(209) 555-0123" },
                { type: "text", name: "firm_or_county", label: "Law firm / county / agency (if applicable)", placeholder: "e.g. Smith & Associates, Stanislaus County" },
                {
                  type: "select",
                  name: "service_needed",
                  label: "Service needed",
                  options: [
                    { value: "therapy-individual", label: "Individual or family therapy" },
                    { value: "730-eval", label: "California Code 730 evaluation" },
                    { value: "3111-assessment", label: "Family Code 3111 parenting plan assessment" },
                    { value: "supervised-vis", label: "Supervised visitation" },
                    { value: "program", label: "Curriculum-based program (anger mgmt, parenting, etc.)" },
                    { value: "consultation", label: "Forensic clinical consultation (attorney)" },
                    { value: "other", label: "Other / not sure yet" },
                  ],
                },
                {
                  type: "textarea",
                  name: "message",
                  label: "Brief description (optional)",
                  placeholder: "Court timeline, case context, or what you're hoping to address. Stay general — we'll cover specifics on the intake call.",
                  rows: 3,
                },
              ]}
            />
          </motion.div>

          <motion.div variants={fadeUp} className="text-center text-sm mb-8" style={{ color: INK_SOFT }}>
            For time-sensitive court matters,{" "}
            <a href="tel:2095672599" className="font-semibold underline" style={{ color: TEAL_DEEP }}>
              call (209) 567-2599
            </a>{" "}
            directly.
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            <motion.div variants={fadeUp}>
              <Card className="p-5">
                <MapPin size={20} weight="duotone" style={{ color: TEAL_DEEP }} className="mb-2" />
                <p className="font-bold text-sm mb-0.5" style={{ color: INK }}>Office</p>
                <p className="text-xs leading-relaxed" style={{ color: INK_SOFT }}>
                  3425 Coffee Road, Suite 1A<br />Modesto, CA 95355
                </p>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card className="p-5">
                <Clock size={20} weight="duotone" style={{ color: TEAL_DEEP }} className="mb-2" />
                <p className="font-bold text-sm mb-0.5" style={{ color: INK }}>Hours</p>
                <p className="text-xs leading-relaxed" style={{ color: INK_SOFT }}>
                  By appointment only<br />Mon–Fri
                </p>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card className="p-5">
                <ShieldCheck size={20} weight="duotone" style={{ color: TEAL_DEEP }} className="mb-2" />
                <p className="font-bold text-sm mb-0.5" style={{ color: INK }}>Confidentiality</p>
                <p className="text-xs leading-relaxed" style={{ color: INK_SOFT }}>
                  HIPAA-protected · Court-admissible documentation when authorized
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="px-6 py-10 border-t" style={{ borderColor: "rgba(13, 148, 136, 0.12)", background: BG }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: INK_SOFT }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DEEP} 100%)` }}
            >
              <img
                src={HEALE_MONOGRAM}
                alt="Heale monogram"
                className="w-3.5 h-3.5 object-contain"
              />
            </div>
            <span className="font-semibold" style={{ color: INK }}>
              Heale, A Professional Licensed Clinical Social Work Corporation
            </span>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} · Modesto, CA · LCSW #69098</p>
        </div>
      </footer>
    </main>
  );
}
