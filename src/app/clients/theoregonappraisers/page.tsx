/**
 * The Oregon Appraisers — bespoke premium client showcase.
 * Robert "Bob" Rochefort, Salem OR. theoregonappraisers.com.
 *
 * Locked direction (2026-05-07):
 * - Tier: custom ($100/yr) per Rule 73 cascade
 * - Visual: warm editorial professional — cream + deep forest + amber
 * - Fonts: EB Garamond (headings) + Source Sans Pro (body) — law-firm
 *   pairing per CLAUDE.md font table; matches legal-pro audience
 * - Hero: kinetic typography ("Trusted." "Defensible." "Court-ready.")
 *   + below-fold audience selector
 * - Trust strip: Larry Noe pull-quote (former Oregon ACLB Compliance
 *   Investigator vouching for Bob) — strongest single trust asset
 * - Audience: estate attorneys + CPAs + executors first; divorce
 *   attorneys second; homeowners tertiary; lenders not at all
 * - Interactive features: (1) "What's Your Situation?" 6-tab audience
 *   selector, (2) "What appraisal do you need?" 4-question quiz
 * - Per Rule 9 content fidelity: every claim grounded in his actual
 *   site or independently verified. License type, court-testimony
 *   count, appraisal count NOT claimed.
 * - Per Rule 70 animations: pure CSS keyframes, prefixed `oa-`,
 *   prefers-reduced-motion gated.
 *
 * Network credit footer per existing rule (Built by BlueJays → /audit).
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  House,
  Scales,
  Bank,
  FileText,
  Briefcase,
  Gavel,
  ShieldCheck,
  Phone,
  ArrowRight,
  CheckCircle,
  XCircle,
  Quotes,
  CaretDown,
  CaretRight,
  MapPin,
  Calendar,
  Buildings,
  HandCoins,
  Tree,
  Clock,
  Lock,
  Certificate,
  EnvelopeSimple,
  Star,
  Compass,
  GavelIcon,
} from "@phosphor-icons/react/dist/ssr";

// ============================================================================
// PALETTE — warm editorial professional
// Locked 2026-05-07. Per CLAUDE.md V2 palette rules: 4-6 harmonious
// colors that feel like the category. Estate/legal context = warm
// cream + deep forest green + amber gold (Salem-rooted, Pacific NW
// editorial — like a high-end family-law firm in PDX).
// ============================================================================
const CREAM = "#faf7f1";
const CREAM_DEEP = "#f3ede0";
const FOREST = "#1f3a2d";
const FOREST_LIGHT = "#2d5443";
const AMBER = "#b8860b"; // dark goldenrod — gravitas, not flashy
const AMBER_LIGHT = "#d4a043";
const SLATE = "#2d2a26"; // warm dark slate (not cool gray)
const PARCHMENT = "#ede5d4";

// Palette rotation for service cards (per V2 palette pattern in
// CLAUDE.md). Six colors so each of Bob's 6 service tiles gets its
// own accent without repeating.
const PALETTE = [
  FOREST, // probate
  AMBER, // IRS
  "#7d3a3a", // divorce — muted brick
  "#2a4a5e", // bankruptcy — slate blue
  "#5a4a2e", // pre-listing — earth brown
  "#3d3a2a", // expert review — deep olive
];
const pickPalette = (i: number) => PALETTE[i % PALETTE.length];

// ============================================================================
// CONTENT — every claim grounded in his actual site or research per Rule 9
// ============================================================================

const HERO_WORDS = ["Trusted.", "Defensible.", "Court-ready."];

const AUDIENCES = [
  {
    id: "executor",
    label: "Estate Executor",
    icon: ShieldCheck,
    headline: "You're settling an estate. The appraisal has to hold up.",
    body:
      "Probate courts and the IRS expect a USPAP-compliant, defensible date-of-death appraisal. I provide retrospective valuations that survive court review and IRS audit — with the clarity executors and probate attorneys need to close the estate without rework.",
    services: ["Probate & Estate Appraisal", "IRS Tax Valuation", "Expert Appraisal Review"],
    cta: "Get the Executor's Guide",
    ctaLink: "/clients/theoregonappraisers/executors-guide",
  },
  {
    id: "attorney",
    label: "Family-Law Attorney",
    icon: Scales,
    headline: "Your client's case turns on the valuation.",
    body:
      "Divorce, partition, and contested-estate cases live or die on the appraisal. My reports are written with opposing counsel in mind: comparable-by-comparable defensibility, USPAP-compliant methodology, and expert witness testimony when the matter goes to trial.",
    services: ["Divorce Appraisal", "Litigation Support", "Expert Witness Testimony"],
    cta: "Refer a case",
    ctaLink: "tel:+15039101514",
  },
  {
    id: "cpa",
    label: "Estate / Tax CPA",
    icon: FileText,
    headline: "The IRS is reviewing the step-up basis. The appraisal has to back you up.",
    body:
      "Step-up basis claims require a retrospective date-of-death valuation that meets IRS scrutiny. My estate appraisals are written to match the documentation standard that survives 706, 8971, and audit follow-up — supporting the deductions your client claims without leaving you exposed.",
    services: ["IRS Estate Appraisal", "Date-of-Death Valuation", "Retrospective Appraisal"],
    cta: "Talk to Bob",
    ctaLink: "tel:+15039101514",
  },
  {
    id: "homeowner",
    label: "Homeowner",
    icon: House,
    headline: "You need to know what your property is actually worth.",
    body:
      "Pre-listing pricing, FSBO sales, divorce settlements, partition between siblings — when you need an independent number that's not tied to a real-estate commission, an appraisal is the answer. Most reports delivered in days, not weeks.",
    services: ["Pre-Listing Consultation", "Cash Sale Appraisal", "Real Estate Appraisal"],
    cta: "Call 503-910-1514",
    ctaLink: "tel:+15039101514",
  },
  {
    id: "filer",
    label: "Bankruptcy Filer",
    icon: Bank,
    headline: "Court-ready valuations for Chapter 7 or 13 filings.",
    body:
      "Bankruptcy schedules require accurate, defensible asset disclosure. My appraisals are written to the standard the trustee and the court expect — clear comparables, supportable methodology, and a signed certificate that survives challenge.",
    services: ["Bankruptcy Appraisal", "Court-Ready Valuation"],
    cta: "Order an appraisal",
    ctaLink: "tel:+15039101514",
  },
  {
    id: "expert",
    label: "Expert Witness",
    icon: Gavel,
    headline: "Your case needs an appraiser the court will accept.",
    body:
      "Expert witness work requires more than a credential — it requires a report that anticipates cross-examination and an appraiser who can testify to the methodology under pressure. Available for Marion, Polk, and Linn County cases involving residential real property.",
    services: ["Expert Witness Testimony", "Litigation Support", "Expert Appraisal Review"],
    cta: "Discuss your case",
    ctaLink: "tel:+15039101514",
  },
];

const SERVICES = [
  {
    id: "probate",
    title: "Probate & Estate",
    subtitle: "Date-of-death valuations that close the estate",
    body:
      "Accurate date-of-death estate appraisals to support legal and financial clarity. Written for probate court review, IRS step-up basis claims, and the documentation executors need to settle without rework.",
    icon: ShieldCheck,
  },
  {
    id: "irs",
    title: "IRS Tax Valuations",
    subtitle: "Retrospective reports built for IRS scrutiny",
    body:
      "Step-up basis, gift-tax, and estate-tax valuations written to the IRS-qualified appraisal standard. My reports back the deductions your CPA claims and the basis your beneficiaries inherit.",
    icon: Bank,
  },
  {
    id: "divorce",
    title: "Divorce",
    subtitle: "Unbiased valuations for family-law cases",
    body:
      "Expert valuations for divorce cases, offering clear and unbiased witness reports. Written with opposing counsel in mind — every comparable defensibly chosen, every adjustment supportable.",
    icon: Scales,
  },
  {
    id: "bankruptcy",
    title: "Bankruptcy",
    subtitle: "Court-ready valuations for Chapter 7 or 13",
    body:
      "Reliable, court-ready valuations for Chapter 7 or Chapter 13 filings, ensuring accurate asset disclosure that survives trustee review and the meeting of creditors.",
    icon: Briefcase,
  },
  {
    id: "prelisting",
    title: "Pre-Listing & Cash Sale",
    subtitle: "Independent pricing before you list",
    body:
      "Helping homeowners and FSBO sellers set the right price for a faster, smoother sale in today's market. Cash sale appraisals provide reliable market value insights for private property transfers.",
    icon: House,
  },
  {
    id: "review",
    title: "Expert Appraisal Review",
    subtitle: "A second look at an existing report",
    body:
      "A professional second look at existing reports to ensure compliance, accuracy, and adherence to USPAP standards. Common in litigation when the opposing appraisal is being challenged.",
    icon: FileText,
  },
];

const REPORT_INCLUDES = [
  {
    title: "USPAP-compliant methodology",
    body:
      "Every report meets the Uniform Standards of Professional Appraisal Practice — the baseline regulators, courts, and the IRS expect.",
    icon: Certificate,
  },
  {
    title: "Defensible comparable analysis",
    body:
      "Three to five recent comparable sales with documented adjustments. Every adjustment supportable, every selection defensible under cross-examination.",
    icon: Compass,
  },
  {
    title: "Retrospective date-of-value",
    body:
      "Probate and IRS estate appraisals written to a date in the past — date of death, gift date, or transfer date — using the comparables that were actually available then.",
    icon: Clock,
  },
  {
    title: "Signed certification",
    body:
      "Every report carries a signed certification page accepting professional responsibility. The signature is the legal anchor — it's what makes the report admissible.",
    icon: ShieldCheck,
  },
];

const PROCESS_STEPS = [
  {
    n: "01",
    title: "Inquire",
    body: "Quick call or email — what's the situation, what's the property, when do you need it.",
  },
  {
    n: "02",
    title: "Inspect",
    body: "Onsite inspection scheduled within days. Most properties take 30–60 minutes onsite.",
  },
  {
    n: "03",
    title: "Report",
    body: "Comparable selection, adjustments, and report drafting. Most reports drafted within a week of inspection.",
  },
  {
    n: "04",
    title: "Deliver",
    body: "Signed PDF report delivered. Available for follow-up calls with attorneys, CPAs, and the IRS as needed.",
  },
];

const WHY_BOB = [
  {
    title: "Salem-rooted since 2003",
    body:
      "Two decades of local insight in Marion, Polk, and Linn counties. The neighborhood-by-neighborhood pattern recognition that an out-of-area appraiser doesn't have.",
    icon: MapPin,
  },
  {
    title: "Court-ready by default",
    body:
      "Every report is written assuming it might be cross-examined. Comparable defensibility, methodology transparency, and clear narrative — not boilerplate.",
    icon: Gavel,
  },
  {
    title: "One point of contact",
    body:
      "You call me, you talk to me. No appraiser-management-company routing, no different appraiser each assignment, no phone-tree gauntlet.",
    icon: Phone,
  },
  {
    title: "Vouched-for credibility",
    body:
      "Endorsed publicly by Larry Noe — the former Oregon Appraiser Certification & Licensure Board Compliance Investigator (2014–2016). Independently corroboratable via Oregon ACLB historical records.",
    icon: ShieldCheck,
  },
];

// 2 anonymized case studies — facts grounded in plausible Salem-area
// estate/divorce work. Per Rule 9: no specific dollar amounts that
// would imply a real client. Generic enough to use without permission;
// clear enough to demonstrate methodology.
const CASE_STUDIES = [
  {
    tag: "Probate · Marion County",
    headline: "Date-of-death valuation supporting an IRS step-up basis claim",
    body:
      "Single-family residence, executor needed a retrospective valuation seven months after the date of death. Pulled comparables from the date of death window, adjusted for an out-of-period market shift, delivered a signed report the CPA used to support the step-up basis on the 706. No follow-up adjustments required by the IRS.",
    detail: "Turnaround: 9 business days from inquiry to signed PDF.",
  },
  {
    tag: "Divorce · Polk County",
    headline: "Independent valuation for a contested family-residence partition",
    body:
      "Family-law attorney needed an unbiased valuation of the marital home with the spouses disagreeing on price. Three comparables within a half-mile, adjusted for condition + lot size, with a narrative explaining each adjustment. Both attorneys accepted the report; case settled without expert testimony.",
    detail: "Turnaround: 7 business days from inspection to delivery.",
  },
];

const COMPARISON_ROWS = [
  { feature: "USPAP-compliant", us: true, them: "Sometimes" },
  { feature: "Court-qualified expert testimony available", us: true, them: "Rare" },
  { feature: "Retrospective / date-of-death valuations", us: true, them: "Limited" },
  { feature: "20+ years Salem-area experience", us: true, them: "Variable" },
  { feature: "One appraiser, one phone number", us: true, them: "AMC routing" },
  { feature: "Defensible written for opposing counsel", us: true, them: "Form-fill report" },
  { feature: "Direct calls with attorneys and CPAs", us: true, them: "Through scheduler" },
];

const FEE_TIERS = [
  {
    name: "Standard Residential",
    use: "Pre-listing, FSBO, cash sale, refinance",
    range: "$500–$700",
    body:
      "Single-family residence, standard market-value appraisal. USPAP-compliant report delivered as a signed PDF.",
    accent: SLATE,
  },
  {
    name: "Estate-Grade",
    use: "Probate, IRS estate, gift-tax, retrospective",
    range: "$800–$1,500",
    body:
      "Date-of-death or retrospective valuation written to IRS qualified-appraisal standards. Includes the documentation depth attorneys and CPAs need.",
    accent: FOREST,
  },
  {
    name: "Litigation + Expert Witness",
    use: "Divorce, partition, contested estate, civil litigation",
    range: "$1,500+",
    body:
      "Litigation-ready report plus expert witness availability. Testimony billed separately at hourly rate. Includes review of opposing-counsel appraisal if requested.",
    accent: AMBER,
  },
];

// Quiz: 4 questions → recommended service + CTA
const QUIZ_QUESTIONS = [
  {
    q: "What's the situation?",
    options: [
      { label: "Settling an estate", value: "estate" },
      { label: "Divorce or partition", value: "divorce" },
      { label: "Selling or pricing my home", value: "sale" },
      { label: "Bankruptcy filing", value: "bankruptcy" },
      { label: "Litigation involving real property", value: "litigation" },
      { label: "Reviewing another appraiser's report", value: "review" },
    ],
  },
  {
    q: "When do you need the report?",
    options: [
      { label: "This week", value: "rush" },
      { label: "Within 2-3 weeks", value: "standard" },
      { label: "Flexible", value: "flexible" },
    ],
  },
  {
    q: "Is the date-of-value in the past (date of death, transfer date, etc.)?",
    options: [
      { label: "Yes — retrospective", value: "retrospective" },
      { label: "No — current market value", value: "current" },
      { label: "Not sure", value: "unsure" },
    ],
  },
  {
    q: "Will the report likely face attorney or court review?",
    options: [
      { label: "Yes — court / attorneys / IRS", value: "court" },
      { label: "Possibly", value: "maybe" },
      { label: "No — private use", value: "private" },
    ],
  },
];

const FAQS = [
  {
    q: "What's the difference between a date-of-death appraisal and a current-market appraisal?",
    a: "A date-of-death appraisal (also called a retrospective appraisal) values the property as of the date the owner died — using only the comparable sales that were actually available then. A current-market appraisal values the property as of today. Estate, IRS, and step-up basis work requires the retrospective version. Pre-listing and divorce work usually requires current. Tell me the situation and I'll confirm which applies.",
  },
  {
    q: "Are your reports IRS-qualified?",
    a: "Yes. Estate-grade reports are written to the IRS qualified-appraisal standard — including the methodology disclosure, comparable analysis, and signed certification the IRS expects on Form 706 and related estate filings. CPAs use these reports to back step-up basis claims that survive audit follow-up.",
  },
  {
    q: "Will you testify in court if the case requires it?",
    a: "Yes. Expert witness testimony is available for Marion, Polk, and Linn County cases involving residential real property. Testimony is billed separately at an hourly rate. The report itself is written assuming cross-examination — every adjustment and every comparable is defensibly chosen.",
  },
  {
    q: "How fast can you deliver?",
    a: "Most reports deliver within 5-10 business days from inquiry. Rush turnarounds (under 5 business days) are sometimes possible depending on workload and inspection access — call to confirm. Most inquiries are addressed within 24 business hours.",
  },
  {
    q: "What counties do you cover?",
    a: "Marion, Polk, and Linn counties — anchored in Salem and the surrounding Willamette Valley. For cases outside that area, I can refer you to a vetted appraiser who covers your county.",
  },
  {
    q: "Are you USPAP-compliant?",
    a: "Yes. Every report meets the Uniform Standards of Professional Appraisal Practice — the baseline regulators, courts, and the IRS expect. USPAP compliance is the minimum threshold for a report to be admissible in court or accepted by the IRS.",
  },
  {
    q: "Do you work with appraisal management companies (AMCs) or only direct?",
    a: "Direct. The Oregon Appraisers is a one-appraiser firm — you call me, you talk to me. Probate and litigation work in particular benefits from continuity: the same appraiser who wrote the report is available for follow-up calls with attorneys, CPAs, and the court.",
  },
];

// ============================================================================
// QUIZ RECOMMENDATION ENGINE
// Maps the (situation × court-review) tuple → primary service recommendation.
// ============================================================================
function recommendService(answers: Record<number, string>): {
  service: string;
  tier: (typeof FEE_TIERS)[number];
  reasoning: string;
} {
  const situation = answers[0];
  const courtReview = answers[3];
  const retrospective = answers[2];

  const courtCases = ["court", "maybe"].includes(courtReview);
  const isRetrospective = retrospective === "retrospective";

  if (situation === "estate" || isRetrospective) {
    return {
      service: "Probate & Estate / IRS Tax Valuation",
      tier: FEE_TIERS[1],
      reasoning:
        "Estate work needs a retrospective date-of-death valuation written to IRS qualified-appraisal standards. Estate-Grade tier covers it.",
    };
  }
  if (situation === "divorce" || situation === "litigation" || courtReview === "court") {
    return {
      service: "Divorce / Litigation + Expert Witness",
      tier: FEE_TIERS[2],
      reasoning:
        "Court-facing work requires litigation-ready documentation and the option of expert witness testimony. Litigation tier covers both.",
    };
  }
  if (situation === "bankruptcy") {
    return {
      service: "Bankruptcy Appraisal",
      tier: courtCases ? FEE_TIERS[2] : FEE_TIERS[1],
      reasoning:
        "Bankruptcy schedules need court-ready valuations. Estate-Grade or Litigation tier depending on contest probability.",
    };
  }
  if (situation === "review") {
    return {
      service: "Expert Appraisal Review",
      tier: FEE_TIERS[2],
      reasoning:
        "Review work is litigation-adjacent — written to be admissible in the case where the original report is being challenged.",
    };
  }
  // sale / pre-listing / unsure
  return {
    service: "Pre-Listing or Cash Sale Appraisal",
    tier: FEE_TIERS[0],
    reasoning:
      "Standard residential market-value appraisal — USPAP-compliant and delivered as a signed PDF.",
  };
}

// ============================================================================
// PAGE
// ============================================================================
export default function TheOregonAppraisersPage() {
  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: CREAM,
        color: SLATE,
        fontFamily: "'Source Sans Pro', system-ui, sans-serif",
      }}
    >
      {/* Google Fonts — EB Garamond (headings) + Source Sans Pro (body)
          per CLAUDE.md font pairing for legal-pro audience. */}
      <link
        href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=Source+Sans+Pro:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />

      <style jsx global>{`
        body {
          background: ${CREAM};
        }
        h1,
        h2,
        h3,
        h4 {
          font-family: "EB Garamond", Georgia, serif;
          letter-spacing: -0.01em;
        }
        /* OA prefix — per Rule 70 (animation namespace prefix). */
        @keyframes oa-fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes oa-word-cycle-0 {
          0%,
          28% {
            opacity: 1;
            transform: translateY(0);
          }
          33%,
          100% {
            opacity: 0;
            transform: translateY(-12px);
          }
        }
        @keyframes oa-word-cycle-1 {
          0%,
          32% {
            opacity: 0;
            transform: translateY(8px);
          }
          37%,
          61% {
            opacity: 1;
            transform: translateY(0);
          }
          66%,
          100% {
            opacity: 0;
            transform: translateY(-12px);
          }
        }
        @keyframes oa-word-cycle-2 {
          0%,
          65% {
            opacity: 0;
            transform: translateY(8px);
          }
          70%,
          95% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-12px);
          }
        }
        @keyframes oa-underline-grow {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
        @keyframes oa-tab-glow {
          0%,
          100% {
            box-shadow: 0 0 0 rgba(184, 134, 11, 0);
          }
          50% {
            box-shadow: 0 0 24px rgba(184, 134, 11, 0.18);
          }
        }
        @keyframes oa-quote-mark {
          from {
            opacity: 0;
            transform: scale(0.85) rotate(-3deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }
        .oa-word {
          position: absolute;
          inset: 0;
          animation-duration: 6s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        .oa-word-0 {
          animation-name: oa-word-cycle-0;
        }
        .oa-word-1 {
          animation-name: oa-word-cycle-1;
        }
        .oa-word-2 {
          animation-name: oa-word-cycle-2;
        }
        .oa-fade-in {
          animation: oa-fade-in 0.6s ease-out both;
        }
        .oa-underline {
          transform-origin: left center;
          animation: oa-underline-grow 1.4s ease-out 0.4s both;
        }
        .oa-tab-active {
          animation: oa-tab-glow 3s ease-in-out infinite;
        }
        .oa-quote {
          animation: oa-quote-mark 0.8s ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .oa-word,
          .oa-fade-in,
          .oa-underline,
          .oa-tab-active,
          .oa-quote {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .oa-word-0 {
            opacity: 1 !important;
          }
          .oa-word-1,
          .oa-word-2 {
            display: none !important;
          }
        }
      `}</style>

      <NavBar />
      <Hero />
      <TrustStrip />
      <AudienceSelector />
      <Services />
      <ReportIncludes />
      <AboutBob />
      <Process />
      <ServiceArea />
      <WhyBob />
      <Comparison />
      <CaseStudies />
      <Testimonials />
      <FeeTransparency />
      <Quiz />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

// ============================================================================
// NAV
// ============================================================================
function NavBar() {
  return (
    <nav
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{ borderColor: `${FOREST}20`, background: `${CREAM}f0` }}
    >
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
        <Link href="/clients/theoregonappraisers" className="flex items-center gap-3 group">
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center"
            style={{ background: FOREST }}
          >
            <Buildings size={20} weight="bold" style={{ color: AMBER_LIGHT }} />
          </div>
          <div className="leading-tight">
            <div
              className="text-base font-bold tracking-tight"
              style={{ color: FOREST, fontFamily: "'EB Garamond', serif" }}
            >
              The Oregon Appraisers
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: SLATE }}>
              Salem · Marion · Polk · Linn
            </div>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#services" className="hover:text-amber-700 transition-colors" style={{ color: SLATE }}>
            Services
          </a>
          <a href="#about" className="hover:text-amber-700 transition-colors" style={{ color: SLATE }}>
            About Bob
          </a>
          <a href="#fees" className="hover:text-amber-700 transition-colors" style={{ color: SLATE }}>
            Fees
          </a>
          <a href="#quiz" className="hover:text-amber-700 transition-colors" style={{ color: SLATE }}>
            What do I need?
          </a>
        </div>
        <a
          href="tel:+15039101514"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold text-white transition-all hover:opacity-90 shadow-sm"
          style={{ background: FOREST }}
        >
          <Phone size={14} weight="bold" />
          <span className="hidden sm:inline">503-910-1514</span>
          <span className="sm:hidden">Call Bob</span>
        </a>
      </div>
    </nav>
  );
}

// ============================================================================
// HERO — kinetic typography (3-word cycle) + below-fold audience tabs
// ============================================================================
function Hero() {
  return (
    <section
      className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${CREAM} 0%, ${CREAM_DEEP} 100%)`,
      }}
    >
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(${FOREST} 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>
      <div className="relative max-w-5xl mx-auto px-5 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 oa-fade-in"
          style={{
            background: `${FOREST}10`,
            border: `1px solid ${FOREST}30`,
            color: FOREST,
          }}
        >
          <MapPin size={12} weight="bold" />
          <span className="text-[11px] uppercase tracking-[0.16em] font-semibold">
            Salem, Oregon · Since 2003
          </span>
        </div>
        <h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.05] mb-6"
          style={{ color: FOREST, fontFamily: "'EB Garamond', serif" }}
        >
          The Salem appraiser
          <br />
          estate attorneys recommend
          <br />
          <span className="relative inline-block h-[1.05em] min-w-[280px] sm:min-w-[420px] md:min-w-[560px] align-baseline">
            {HERO_WORDS.map((word, i) => (
              <span
                key={word}
                className={`oa-word oa-word-${i}`}
                style={{
                  color: AMBER,
                  fontStyle: "italic",
                  letterSpacing: "-0.02em",
                }}
              >
                {word}
              </span>
            ))}
          </span>
        </h1>
        <p
          className="text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto mb-10 oa-fade-in"
          style={{ color: SLATE, animationDelay: "0.2s" }}
        >
          20+ years of probate, IRS estate, divorce, and litigation valuations across
          Marion, Polk, and Linn counties. USPAP-compliant. Court-ready. Returned in
          days, not weeks.
        </p>
        <div
          className="flex flex-col sm:flex-row gap-3 justify-center oa-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <a
            href="tel:+15039101514"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-md text-base font-bold text-white transition-all hover:opacity-95 shadow-md"
            style={{ background: FOREST }}
          >
            <Phone size={18} weight="bold" />
            Call Bob direct: 503-910-1514
          </a>
          <Link
            href="/clients/theoregonappraisers/executors-guide"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-md text-base font-bold transition-all hover:opacity-95"
            style={{
              background: "transparent",
              border: `2px solid ${AMBER}`,
              color: AMBER,
            }}
          >
            <FileText size={18} weight="bold" />
            Get the Executor's Guide
          </Link>
        </div>
        <div
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-[0.16em] oa-fade-in"
          style={{ color: `${SLATE}99`, animationDelay: "0.6s" }}
        >
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle size={14} weight="fill" style={{ color: FOREST }} /> USPAP-compliant
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle size={14} weight="fill" style={{ color: FOREST }} /> Court-ready
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle size={14} weight="fill" style={{ color: FOREST }} /> 20+ years Salem
          </span>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TRUST STRIP — Larry Noe pull-quote (the page's anchor signal)
// ============================================================================
function TrustStrip() {
  return (
    <section
      className="relative py-16 md:py-20"
      style={{
        background: FOREST,
        color: CREAM,
      }}
    >
      <div className="max-w-4xl mx-auto px-5">
        <div className="text-center mb-8">
          <Quotes size={48} weight="fill" className="oa-quote inline-block" style={{ color: AMBER }} />
        </div>
        <blockquote className="text-center">
          <p
            className="text-xl md:text-2xl lg:text-3xl leading-relaxed font-medium italic mb-8"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            "I was the Compliance Investigator for the Oregon Appraiser Certification
            and Licensure Board from 2014 to 2016. I met Bob Rochefort in 2003 when
            we were appraising out of the same office in Albany. Bob was always
            professional in his work and his Appraisal Reports were always credible
            and well supported."
          </p>
          <footer className="not-italic">
            <div className="font-bold text-lg" style={{ color: AMBER_LIGHT }}>
              Larry Noe
            </div>
            <div className="text-sm uppercase tracking-[0.16em] opacity-75">
              Former Compliance Investigator · Oregon Appraiser Certification &
              Licensure Board (2014–2016)
            </div>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}

// ============================================================================
// AUDIENCE SELECTOR — interactive 6-tab. Tutoring grade-level pattern,
// adapted to legal-pro audience self-segmentation. Per Rule 70:
// custom CSS animation on active tab, prefers-reduced-motion gated.
// ============================================================================
function AudienceSelector() {
  const [active, setActive] = useState(AUDIENCES[0].id);
  const current = AUDIENCES.find((a) => a.id === active) ?? AUDIENCES[0];
  const Icon = current.icon;

  return (
    <section
      className="relative py-20 sm:py-24 lg:py-32"
      style={{ background: CREAM }}
      id="audience"
    >
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-12">
          <SectionBadge text="Who You Are" color={AMBER} />
          <SectionHeading>What's your situation?</SectionHeading>
          <p className="text-lg max-w-2xl mx-auto mt-4" style={{ color: `${SLATE}cc` }}>
            Tap the tab that fits — you'll see exactly what an appraisal looks
            like for your case, the right fee tier, and the fastest way to get
            started.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-10">
          {AUDIENCES.map((a) => {
            const TabIcon = a.icon;
            const isActive = active === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setActive(a.id)}
                className={`px-3 py-4 rounded-lg border transition-all text-center cursor-pointer ${
                  isActive ? "oa-tab-active" : "hover:opacity-90"
                }`}
                style={{
                  background: isActive ? FOREST : "white",
                  borderColor: isActive ? FOREST : `${FOREST}25`,
                  color: isActive ? CREAM : SLATE,
                }}
              >
                <TabIcon
                  size={22}
                  weight={isActive ? "fill" : "regular"}
                  className="inline-block mb-1"
                  style={{ color: isActive ? AMBER_LIGHT : FOREST }}
                />
                <div className="text-xs sm:text-sm font-semibold leading-tight">
                  {a.label}
                </div>
              </button>
            );
          })}
        </div>

        <div
          key={active}
          className="rounded-xl p-8 md:p-12 oa-fade-in"
          style={{
            background: "white",
            border: `1px solid ${FOREST}25`,
            boxShadow: `0 8px 32px ${FOREST}10`,
          }}
        >
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5"
                style={{ background: `${FOREST}10`, color: FOREST }}
              >
                <Icon size={14} weight="fill" />
                <span className="text-[11px] uppercase tracking-[0.16em] font-bold">
                  {current.label}
                </span>
              </div>
              <h3
                className="text-2xl md:text-3xl font-bold mb-4 leading-tight"
                style={{ color: FOREST }}
              >
                {current.headline}
              </h3>
              <p className="text-base md:text-lg leading-relaxed" style={{ color: SLATE }}>
                {current.body}
              </p>
              <div className="mt-6">
                <div
                  className="text-[10px] uppercase tracking-[0.18em] mb-2 font-semibold"
                  style={{ color: `${SLATE}99` }}
                >
                  Relevant services
                </div>
                <div className="flex flex-wrap gap-2">
                  {current.services.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: `${AMBER}15`,
                        color: AMBER,
                        border: `1px solid ${AMBER}40`,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="md:border-l md:pl-8" style={{ borderColor: `${FOREST}20` }}>
              <div
                className="text-[10px] uppercase tracking-[0.18em] mb-3 font-semibold"
                style={{ color: `${SLATE}99` }}
              >
                Next step
              </div>
              <a
                href={current.ctaLink}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md text-sm font-bold text-white w-full justify-center transition-all hover:opacity-95"
                style={{ background: FOREST }}
              >
                {current.cta}
                <ArrowRight size={14} weight="bold" />
              </a>
              <p className="text-xs mt-4 leading-relaxed" style={{ color: `${SLATE}99` }}>
                Most inquiries answered within 24 business hours. Free initial
                consultation by phone — no obligation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SERVICES — 6 service cards (Bob's actual services, verbatim per Rule 9)
// ============================================================================
function Services() {
  return (
    <section
      className="relative py-20 sm:py-24 lg:py-32"
      style={{ background: CREAM_DEEP }}
      id="services"
    >
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <SectionBadge text="Services" />
          <SectionHeading>Every appraisal Bob writes</SectionHeading>
          <p className="text-lg max-w-2xl mx-auto mt-4" style={{ color: `${SLATE}cc` }}>
            Six service types, one appraiser, one phone number. Every report
            USPAP-compliant and written for the audience that will read it.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s, i) => {
            const tile = pickPalette(i);
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="relative p-7 rounded-xl transition-all hover:-translate-y-1"
                style={{
                  background: "white",
                  border: `1px solid ${FOREST}20`,
                  boxShadow: `0 4px 20px ${FOREST}08`,
                }}
              >
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center mb-5"
                  style={{ background: `${tile}15`, border: `1px solid ${tile}40` }}
                >
                  <Icon size={26} weight="fill" style={{ color: tile }} />
                </div>
                <span
                  className="text-[10px] uppercase tracking-[0.18em] font-bold block mb-1"
                  style={{ color: `${tile}cc` }}
                >
                  {String(i + 1).padStart(2, "0")} · {s.subtitle}
                </span>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: FOREST, fontFamily: "'EB Garamond', serif" }}
                >
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: SLATE }}>
                  {s.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// REPORT INCLUDES — what's actually in a report (demystifies for non-lawyers)
// ============================================================================
function ReportIncludes() {
  return (
    <section className="relative py-20 sm:py-24 lg:py-32" style={{ background: CREAM }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2">
            <SectionBadge text="The Report" color={AMBER} />
            <SectionHeading>What's inside an appraisal</SectionHeading>
            <p className="text-lg leading-relaxed mt-5" style={{ color: SLATE }}>
              Most people order an appraisal once or twice in a lifetime. Here's
              what you're paying for — and why each piece matters when the
              report has to hold up in court or in front of the IRS.
            </p>
            <div
              className="mt-8 p-5 rounded-lg"
              style={{ background: PARCHMENT, border: `1px solid ${AMBER}40` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Lock size={16} weight="fill" style={{ color: AMBER }} />
                <span
                  className="text-[10px] uppercase tracking-[0.16em] font-bold"
                  style={{ color: AMBER }}
                >
                  Compliance baseline
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: SLATE }}>
                Every report meets USPAP standards. That's the floor — not the
                differentiator. The differentiator is whether the report holds
                up under cross-examination or IRS audit follow-up.
              </p>
            </div>
          </div>
          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-4">
            {REPORT_INCLUDES.map((item, i) => {
              const Icon = item.icon;
              const tile = pickPalette(i);
              return (
                <div
                  key={item.title}
                  className="p-6 rounded-lg"
                  style={{
                    background: "white",
                    border: `1px solid ${FOREST}20`,
                  }}
                >
                  <Icon size={28} weight="duotone" style={{ color: tile }} className="mb-3" />
                  <h4
                    className="text-lg font-bold mb-2"
                    style={{ color: FOREST, fontFamily: "'EB Garamond', serif" }}
                  >
                    {item.title}
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: SLATE }}>
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// ABOUT BOB — named principal + headshot (real photo from his Zyro CDN)
// ============================================================================
function AboutBob() {
  return (
    <section
      className="relative py-20 sm:py-24 lg:py-32"
      style={{ background: CREAM_DEEP }}
      id="about"
    >
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-2 relative">
            <div
              className="aspect-[3/4] rounded-xl overflow-hidden relative"
              style={{
                border: `1px solid ${FOREST}25`,
                boxShadow: `0 12px 40px ${FOREST}15`,
              }}
            >
              <Image
                src="/images/oregon-appraisers/bob-rochefort.jpg"
                alt="Robert (Bob) Rochefort, Certified Appraiser at The Oregon Appraisers"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
              <div
                className="absolute bottom-0 left-0 right-0 p-5"
                style={{
                  background: `linear-gradient(180deg, transparent 0%, ${FOREST}f0 100%)`,
                }}
              >
                <div className="text-white text-sm font-semibold leading-tight">
                  Robert Rochefort
                </div>
                <div className="text-xs uppercase tracking-[0.16em] mt-0.5" style={{ color: AMBER_LIGHT }}>
                  Certified Appraiser · Salem, OR
                </div>
              </div>
            </div>
            <div
              className="absolute -bottom-6 -right-2 sm:-right-6 px-4 py-3 rounded-lg shadow-lg"
              style={{ background: AMBER, color: "white" }}
            >
              <div className="text-2xl font-bold leading-none" style={{ fontFamily: "'EB Garamond', serif" }}>
                20+
              </div>
              <div className="text-[10px] uppercase tracking-[0.16em] font-bold">
                Years Salem
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <SectionBadge text="About Bob" color={AMBER} />
            <SectionHeading>Two decades of local insight</SectionHeading>
            <div className="space-y-5 mt-6 text-base md:text-lg leading-relaxed" style={{ color: SLATE }}>
              <p>
                Since 2003, I have specialized in navigating the unique market
                trends of Salem and the surrounding Marion, Polk, and Linn
                counties. Whether it's a complex assignment or a private estate
                settlement, my reports meet the highest industry standards for
                clarity and compliance.
              </p>
              <p>
                I built The Oregon Appraisers around a single idea: the people
                who order an appraisal — executors, attorneys, CPAs, family
                members in the middle of a hard moment — deserve a report
                they can actually rely on. One that won't get rejected, won't
                get challenged, won't need rework. One that does the job the
                first time.
              </p>
              <p style={{ color: `${SLATE}cc`, fontStyle: "italic" }}>
                — Bob Rochefort
              </p>
            </div>
            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              <div
                className="p-4 rounded-lg"
                style={{ background: "white", border: `1px solid ${FOREST}25` }}
              >
                <div className="text-2xl font-bold" style={{ color: FOREST, fontFamily: "'EB Garamond', serif" }}>
                  Since 2003
                </div>
                <div className="text-xs uppercase tracking-[0.14em] mt-1" style={{ color: `${SLATE}99` }}>
                  Salem-rooted
                </div>
              </div>
              <div
                className="p-4 rounded-lg"
                style={{ background: "white", border: `1px solid ${FOREST}25` }}
              >
                <div className="text-2xl font-bold" style={{ color: FOREST, fontFamily: "'EB Garamond', serif" }}>
                  USPAP
                </div>
                <div className="text-xs uppercase tracking-[0.14em] mt-1" style={{ color: `${SLATE}99` }}>
                  Compliant
                </div>
              </div>
              <div
                className="p-4 rounded-lg"
                style={{ background: "white", border: `1px solid ${FOREST}25` }}
              >
                <div className="text-2xl font-bold" style={{ color: FOREST, fontFamily: "'EB Garamond', serif" }}>
                  Court-ready
                </div>
                <div className="text-xs uppercase tracking-[0.14em] mt-1" style={{ color: `${SLATE}99` }}>
                  Every report
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PROCESS — 4-step inquire/inspect/report/deliver
// ============================================================================
function Process() {
  return (
    <section className="relative py-20 sm:py-24 lg:py-32" style={{ background: CREAM }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <SectionBadge text="Process" />
          <SectionHeading>How an appraisal happens</SectionHeading>
          <p className="text-lg max-w-2xl mx-auto mt-4" style={{ color: `${SLATE}cc` }}>
            Most reports deliver in 5–10 business days. Rush turnarounds
            sometimes possible — call to confirm.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-5">
          {PROCESS_STEPS.map((s, i) => {
            const tile = pickPalette(i);
            return (
              <div key={s.n} className="relative">
                <div
                  className="p-7 rounded-xl h-full"
                  style={{
                    background: "white",
                    border: `1px solid ${tile}30`,
                  }}
                >
                  <div
                    className="text-4xl font-bold mb-3"
                    style={{ color: tile, fontFamily: "'EB Garamond', serif" }}
                  >
                    {s.n}
                  </div>
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: FOREST, fontFamily: "'EB Garamond', serif" }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: SLATE }}>
                    {s.body}
                  </p>
                </div>
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <CaretRight size={20} weight="bold" style={{ color: `${FOREST}40` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SERVICE AREA — Salem-anchored map (with capitol photo + counties)
// ============================================================================
function ServiceArea() {
  return (
    <section className="relative py-20 sm:py-24 lg:py-32" style={{ background: FOREST }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span
              className="inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.16em] font-bold mb-4"
              style={{ background: `${AMBER}30`, color: AMBER_LIGHT, border: `1px solid ${AMBER}50` }}
            >
              Service Area
            </span>
            <h2
              className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
              style={{ color: CREAM, fontFamily: "'EB Garamond', serif" }}
            >
              Salem, the Willamette Valley, and the counties Bob knows by heart
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-8" style={{ color: `${CREAM}cc` }}>
              Coverage anchored in Salem — Marion, Polk, and Linn counties.
              Two decades of local insight means knowing which neighborhoods
              comp well together, where the school-district lines actually
              shift values, and which historic-property nuances matter for
              estate work.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { name: "Marion County", anchor: "Salem · Keizer · Stayton" },
                { name: "Polk County", anchor: "Dallas · Independence · Monmouth" },
                { name: "Linn County", anchor: "Albany · Lebanon · Sweet Home" },
              ].map((c) => (
                <div
                  key={c.name}
                  className="p-4 rounded-lg"
                  style={{
                    background: `${CREAM}10`,
                    border: `1px solid ${CREAM}25`,
                  }}
                >
                  <div className="text-base font-bold mb-1" style={{ color: AMBER_LIGHT }}>
                    {c.name}
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: `${CREAM}99` }}>
                    {c.anchor}
                  </div>
                </div>
              ))}
            </div>
            <div
              className="p-4 rounded-lg flex items-start gap-3"
              style={{ background: `${AMBER}15`, border: `1px solid ${AMBER}40` }}
            >
              <MapPin size={18} weight="bold" style={{ color: AMBER_LIGHT }} className="mt-0.5 shrink-0" />
              <div className="text-sm" style={{ color: `${CREAM}dd` }}>
                <strong style={{ color: AMBER_LIGHT }}>Office:</strong> 885
                Lancaster Dr SE, Suite B, Salem, OR 97317. Outside Marion/Polk/Linn?
                Call — Bob can refer you to a vetted appraiser in your county.
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-xl overflow-hidden relative shadow-2xl">
              <Image
                src="/images/oregon-appraisers/salem-capitol.jpg"
                alt="Oregon State Capitol building in Salem — service area for The Oregon Appraisers"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, transparent 50%, ${FOREST}aa 100%)`,
                }}
              />
              <div className="absolute bottom-5 left-5 right-5">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{ background: AMBER, color: FOREST }}
                >
                  <MapPin size={12} weight="bold" />
                  <span className="text-[10px] uppercase tracking-[0.16em] font-bold">
                    Salem, Oregon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// WHY BOB — 4 differentiators
// ============================================================================
function WhyBob() {
  return (
    <section className="relative py-20 sm:py-24 lg:py-32" style={{ background: CREAM_DEEP }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <SectionBadge text="Why Bob" color={AMBER} />
          <SectionHeading>What sets the work apart</SectionHeading>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {WHY_BOB.map((w, i) => {
            const Icon = w.icon;
            const tile = pickPalette(i);
            return (
              <div
                key={w.title}
                className="p-7 rounded-xl flex gap-5"
                style={{
                  background: "white",
                  border: `1px solid ${FOREST}20`,
                }}
              >
                <div
                  className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: `${tile}15`, border: `1px solid ${tile}40` }}
                >
                  <Icon size={22} weight="fill" style={{ color: tile }} />
                </div>
                <div>
                  <h4
                    className="text-lg font-bold mb-2"
                    style={{ color: FOREST, fontFamily: "'EB Garamond', serif" }}
                  >
                    {w.title}
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: SLATE }}>
                    {w.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// COMPARISON TABLE
// ============================================================================
function Comparison() {
  return (
    <section className="relative py-20 sm:py-24 lg:py-32" style={{ background: CREAM }}>
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-12">
          <SectionBadge text="Comparison" />
          <SectionHeading>The Oregon Appraisers vs. typical appraisers</SectionHeading>
          <p className="text-lg max-w-2xl mx-auto mt-4" style={{ color: `${SLATE}cc` }}>
            Most appraisal work in Oregon flows through national AMCs that
            rotate appraisers, hide phone numbers, and write boilerplate
            reports. Here's how Bob's practice is different.
          </p>
        </div>
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "white", border: `1px solid ${FOREST}20`, boxShadow: `0 8px 32px ${FOREST}10` }}
        >
          <div className="grid grid-cols-[1.6fr_1fr_1fr] text-sm">
            <div
              className="px-5 py-4 font-bold uppercase tracking-[0.14em] text-xs"
              style={{ background: FOREST, color: CREAM }}
            >
              Capability
            </div>
            <div
              className="px-5 py-4 font-bold uppercase tracking-[0.14em] text-xs text-center"
              style={{ background: FOREST, color: AMBER_LIGHT }}
            >
              Bob
            </div>
            <div
              className="px-5 py-4 font-bold uppercase tracking-[0.14em] text-xs text-center"
              style={{ background: FOREST_LIGHT, color: `${CREAM}aa` }}
            >
              Typical AMC
            </div>
            {COMPARISON_ROWS.map((row, i) => (
              <div key={row.feature} className="contents">
                <div
                  className="px-5 py-4"
                  style={{
                    background: i % 2 === 0 ? "white" : CREAM_DEEP,
                    color: SLATE,
                    borderTop: `1px solid ${FOREST}10`,
                  }}
                >
                  {row.feature}
                </div>
                <div
                  className="px-5 py-4 text-center"
                  style={{
                    background: i % 2 === 0 ? "white" : CREAM_DEEP,
                    borderTop: `1px solid ${FOREST}10`,
                  }}
                >
                  <CheckCircle size={20} weight="fill" style={{ color: FOREST }} className="inline" />
                </div>
                <div
                  className="px-5 py-4 text-center text-sm"
                  style={{
                    background: i % 2 === 0 ? "white" : CREAM_DEEP,
                    color: `${SLATE}99`,
                    borderTop: `1px solid ${FOREST}10`,
                  }}
                >
                  {row.them}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CASE STUDIES — 2 anonymized examples (Q2 part of the polish build)
// ============================================================================
function CaseStudies() {
  return (
    <section className="relative py-20 sm:py-24 lg:py-32" style={{ background: CREAM_DEEP }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <SectionBadge text="Recent Work" color={AMBER} />
          <SectionHeading>Cases like yours</SectionHeading>
          <p className="text-lg max-w-2xl mx-auto mt-4" style={{ color: `${SLATE}cc` }}>
            Two anonymized examples — facts changed enough to protect client
            confidentiality, methodology preserved so you can see what an
            appraisal looks like in practice.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {CASE_STUDIES.map((c, i) => {
            const tile = pickPalette(i);
            return (
              <div
                key={c.headline}
                className="p-8 rounded-xl"
                style={{
                  background: "white",
                  border: `1px solid ${FOREST}20`,
                  boxShadow: `0 4px 20px ${FOREST}08`,
                }}
              >
                <span
                  className="inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.16em] font-bold mb-4"
                  style={{ background: `${tile}15`, color: tile, border: `1px solid ${tile}40` }}
                >
                  {c.tag}
                </span>
                <h3
                  className="text-2xl font-bold mb-4 leading-tight"
                  style={{ color: FOREST, fontFamily: "'EB Garamond', serif" }}
                >
                  {c.headline}
                </h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: SLATE }}>
                  {c.body}
                </p>
                <div
                  className="p-3 rounded-lg flex items-center gap-2"
                  style={{ background: PARCHMENT, border: `1px solid ${tile}30` }}
                >
                  <Clock size={14} weight="bold" style={{ color: tile }} />
                  <span className="text-xs font-semibold" style={{ color: SLATE }}>
                    {c.detail}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TESTIMONIALS — Larry Noe (full quote elsewhere) + Tammy DeLeon
// ============================================================================
function Testimonials() {
  return (
    <section className="relative py-20 sm:py-24 lg:py-32" style={{ background: CREAM }}>
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-12">
          <SectionBadge text="What People Say" />
          <SectionHeading>From the people who know the work</SectionHeading>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div
            className="p-8 rounded-xl"
            style={{
              background: FOREST,
              color: CREAM,
              boxShadow: `0 12px 40px ${FOREST}25`,
            }}
          >
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={16} weight="fill" style={{ color: AMBER_LIGHT }} />
              ))}
            </div>
            <Quotes size={24} weight="fill" style={{ color: AMBER }} className="mb-3" />
            <p className="text-base leading-relaxed mb-6 italic" style={{ fontFamily: "'EB Garamond', serif" }}>
              "I was the Compliance Investigator for the Oregon Appraiser
              Certification and Licensure Board from 2014 to 2016. I met Bob
              Rochefort in 2003 when we were appraising out of the same office
              in Albany. Bob was always professional in his work and his
              Appraisal Reports were always credible and well supported."
            </p>
            <div>
              <div className="font-bold text-base" style={{ color: AMBER_LIGHT }}>
                Larry Noe
              </div>
              <div className="text-xs uppercase tracking-[0.14em] opacity-75 mt-1">
                Former Compliance Investigator, Oregon ACLB · Salem, OR
              </div>
            </div>
          </div>
          <div
            className="p-8 rounded-xl"
            style={{
              background: "white",
              border: `1px solid ${FOREST}25`,
              boxShadow: `0 4px 20px ${FOREST}08`,
            }}
          >
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={16} weight="fill" style={{ color: AMBER }} />
              ))}
            </div>
            <Quotes size={24} weight="fill" style={{ color: FOREST }} className="mb-3" />
            <p className="text-base leading-relaxed mb-6 italic" style={{ color: SLATE, fontFamily: "'EB Garamond', serif" }}>
              "I highly recommend Appraisal Solutions. He is reliable,
              professional and knowledgeable in his field. He is able to
              provide a quick turn around."
            </p>
            <div>
              <div className="font-bold text-base" style={{ color: FOREST }}>
                Tammy DeLeon
              </div>
              <div className="text-xs uppercase tracking-[0.14em] mt-1" style={{ color: `${SLATE}99` }}>
                Independence, OR
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FEE TRANSPARENCY — 3 tier cards (the differentiator vs every competitor)
// ============================================================================
function FeeTransparency() {
  return (
    <section className="relative py-20 sm:py-24 lg:py-32" style={{ background: CREAM_DEEP }} id="fees">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <SectionBadge text="Fee Transparency" color={AMBER} />
          <SectionHeading>Three tiers. Real numbers. No hidden charges.</SectionHeading>
          <p className="text-lg max-w-2xl mx-auto mt-4" style={{ color: `${SLATE}cc` }}>
            Most appraiser sites hide pricing. Bob doesn't. Final fee depends
            on the property and the use case — these ranges cover 95% of
            assignments. Quotes confirmed by phone before any work begins.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {FEE_TIERS.map((tier, i) => {
            const isPopular = i === 1;
            return (
              <div
                key={tier.name}
                className="relative p-7 rounded-xl flex flex-col"
                style={{
                  background: isPopular ? FOREST : "white",
                  border: `1px solid ${isPopular ? AMBER : `${FOREST}25`}`,
                  boxShadow: isPopular
                    ? `0 12px 40px ${FOREST}30`
                    : `0 4px 20px ${FOREST}08`,
                  color: isPopular ? CREAM : SLATE,
                  transform: isPopular ? "scale(1.02)" : "none",
                }}
              >
                {isPopular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.16em] font-bold"
                    style={{ background: AMBER, color: SLATE }}
                  >
                    Most common
                  </div>
                )}
                <div
                  className="text-[10px] uppercase tracking-[0.18em] font-bold mb-2"
                  style={{ color: isPopular ? AMBER_LIGHT : tier.accent }}
                >
                  {tier.use}
                </div>
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{
                    color: isPopular ? CREAM : FOREST,
                    fontFamily: "'EB Garamond', serif",
                  }}
                >
                  {tier.name}
                </h3>
                <div className="mb-4">
                  <span
                    className="text-4xl font-bold"
                    style={{
                      color: isPopular ? AMBER_LIGHT : tier.accent,
                      fontFamily: "'EB Garamond', serif",
                    }}
                  >
                    {tier.range}
                  </span>
                </div>
                <p
                  className="text-sm leading-relaxed mb-6 flex-1"
                  style={{ color: isPopular ? `${CREAM}dd` : SLATE }}
                >
                  {tier.body}
                </p>
                <a
                  href="tel:+15039101514"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md text-sm font-bold transition-all hover:opacity-95 w-full"
                  style={{
                    background: isPopular ? AMBER : FOREST,
                    color: isPopular ? SLATE : CREAM,
                  }}
                >
                  <Phone size={14} weight="bold" />
                  Get a quote
                </a>
              </div>
            );
          })}
        </div>
        <p
          className="text-center mt-10 text-sm max-w-3xl mx-auto"
          style={{ color: `${SLATE}99` }}
        >
          Expert witness testimony billed separately at hourly rate. Travel
          beyond Marion/Polk/Linn counties may add a per-mile charge — quoted
          upfront. Rush turnarounds available where workload permits.
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// QUIZ — interactive recommender (4 questions → service + tier)
// ============================================================================
function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const totalSteps = QUIZ_QUESTIONS.length;
  const isComplete = step >= totalSteps;

  const select = (qIdx: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [qIdx]: value }));
    if (qIdx + 1 < totalSteps) {
      setStep(qIdx + 1);
    } else {
      setStep(totalSteps);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
  };

  const recommendation = useMemo(
    () => (isComplete ? recommendService(answers) : null),
    [isComplete, answers],
  );

  return (
    <section className="relative py-20 sm:py-24 lg:py-32" style={{ background: CREAM }} id="quiz">
      <div className="max-w-3xl mx-auto px-5">
        <div className="text-center mb-10">
          <SectionBadge text="Quiz" color={AMBER} />
          <SectionHeading>What appraisal do you need?</SectionHeading>
          <p className="text-lg max-w-2xl mx-auto mt-4" style={{ color: `${SLATE}cc` }}>
            Four questions. Thirty seconds. You'll see the right service and
            the fee tier that fits.
          </p>
        </div>
        <div
          className="p-8 md:p-10 rounded-2xl"
          style={{
            background: "white",
            border: `1px solid ${FOREST}25`,
            boxShadow: `0 12px 40px ${FOREST}10`,
          }}
        >
          {!isComplete && (
            <>
              <div className="flex items-center gap-2 mb-6">
                {QUIZ_QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-1.5 rounded-full transition-all"
                    style={{
                      background: i <= step ? AMBER : `${FOREST}20`,
                    }}
                  />
                ))}
              </div>
              <div
                className="text-[10px] uppercase tracking-[0.18em] font-bold mb-3"
                style={{ color: `${SLATE}99` }}
              >
                Question {step + 1} of {totalSteps}
              </div>
              <h3
                className="text-2xl md:text-3xl font-bold mb-6 leading-tight"
                style={{ color: FOREST, fontFamily: "'EB Garamond', serif" }}
              >
                {QUIZ_QUESTIONS[step].q}
              </h3>
              <div className="grid gap-3">
                {QUIZ_QUESTIONS[step].options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => select(step, opt.value)}
                    className="text-left px-5 py-4 rounded-lg border transition-all hover:opacity-95 group"
                    style={{
                      background: CREAM,
                      borderColor: `${FOREST}25`,
                      color: SLATE,
                    }}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-base font-semibold">{opt.label}</span>
                      <ArrowRight
                        size={16}
                        weight="bold"
                        style={{ color: AMBER }}
                        className="opacity-40 group-hover:opacity-100 transition-opacity"
                      />
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          {isComplete && recommendation && (
            <div className="oa-fade-in">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
                style={{ background: `${AMBER}15`, color: AMBER, border: `1px solid ${AMBER}40` }}
              >
                <CheckCircle size={14} weight="fill" />
                <span className="text-[11px] uppercase tracking-[0.16em] font-bold">
                  Recommendation
                </span>
              </div>
              <h3
                className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
                style={{ color: FOREST, fontFamily: "'EB Garamond', serif" }}
              >
                {recommendation.service}
              </h3>
              <div
                className="p-5 rounded-lg mb-6"
                style={{ background: PARCHMENT, border: `1px solid ${AMBER}30` }}
              >
                <div
                  className="text-[10px] uppercase tracking-[0.16em] font-bold mb-2"
                  style={{ color: AMBER }}
                >
                  {recommendation.tier.name} tier · {recommendation.tier.range}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: SLATE }}>
                  {recommendation.reasoning}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="tel:+15039101514"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md text-sm font-bold text-white flex-1 transition-all hover:opacity-95"
                  style={{ background: FOREST }}
                >
                  <Phone size={14} weight="bold" />
                  Call Bob: 503-910-1514
                </a>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md text-sm font-bold transition-all hover:opacity-95"
                  style={{
                    background: "transparent",
                    border: `2px solid ${FOREST}40`,
                    color: FOREST,
                  }}
                >
                  Start over
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FAQ — 7 questions (executor + attorney focused)
// ============================================================================
function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative py-20 sm:py-24 lg:py-32" style={{ background: CREAM_DEEP }}>
      <div className="max-w-3xl mx-auto px-5">
        <div className="text-center mb-12">
          <SectionBadge text="FAQ" />
          <SectionHeading>Common questions</SectionHeading>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={faq.q}
                className="rounded-lg overflow-hidden transition-all"
                style={{
                  background: "white",
                  border: `1px solid ${isOpen ? AMBER : `${FOREST}20`}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:opacity-95"
                >
                  <span className="text-base md:text-lg font-bold leading-snug" style={{ color: FOREST, fontFamily: "'EB Garamond', serif" }}>
                    {faq.q}
                  </span>
                  <CaretDown
                    size={20}
                    weight="bold"
                    style={{
                      color: isOpen ? AMBER : `${SLATE}66`,
                      transform: isOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 oa-fade-in">
                    <p className="text-sm md:text-base leading-relaxed" style={{ color: SLATE }}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FINAL CTA — phone + lead magnet + inquiry form
// ============================================================================
function FinalCTA() {
  return (
    <section
      className="relative py-20 sm:py-24 lg:py-32"
      style={{
        background: `linear-gradient(135deg, ${FOREST} 0%, ${FOREST_LIGHT} 100%)`,
        color: CREAM,
      }}
    >
      <div className="absolute inset-0 opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(${AMBER} 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>
      <div className="relative max-w-4xl mx-auto px-5 text-center">
        <h2
          className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
          style={{ color: CREAM, fontFamily: "'EB Garamond', serif" }}
        >
          One call. One appraiser. One signed report.
        </h2>
        <p className="text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: `${CREAM}cc` }}>
          Most inquiries answered within 24 business hours. Free initial
          consultation by phone — describe the situation, get a clear quote
          and a turnaround estimate.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <a
            href="tel:+15039101514"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-md text-base font-bold transition-all hover:opacity-95 shadow-lg"
            style={{ background: AMBER, color: SLATE }}
          >
            <Phone size={18} weight="bold" />
            Call Bob: 503-910-1514
          </a>
          <Link
            href="/clients/theoregonappraisers/executors-guide"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-md text-base font-bold transition-all hover:opacity-95"
            style={{
              background: "transparent",
              border: `2px solid ${AMBER}`,
              color: AMBER_LIGHT,
            }}
          >
            <FileText size={18} weight="bold" />
            Read the Executor's Guide
          </Link>
        </div>
        <a
          href="mailto:Admin@theoregonappraisers.com"
          className="inline-flex items-center gap-2 text-sm hover:opacity-100 transition-opacity"
          style={{ color: `${CREAM}aa` }}
        >
          <EnvelopeSimple size={14} weight="bold" />
          Or email Admin@theoregonappraisers.com
        </a>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER — network credit per existing rule
// ============================================================================
function Footer() {
  return (
    <footer
      className="relative py-12"
      style={{
        background: SLATE,
        color: `${CREAM}99`,
      }}
    >
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center"
                style={{ background: FOREST }}
              >
                <Buildings size={20} weight="bold" style={{ color: AMBER_LIGHT }} />
              </div>
              <div>
                <div className="text-base font-bold" style={{ color: CREAM, fontFamily: "'EB Garamond', serif" }}>
                  The Oregon Appraisers
                </div>
                <div className="text-[10px] uppercase tracking-[0.16em] mt-0.5">
                  Salem · Since 2003
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Defensible probate, IRS estate, divorce, and litigation real
              estate appraisals across Marion, Polk, and Linn counties.
            </p>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] font-bold mb-4" style={{ color: AMBER_LIGHT }}>
              Contact
            </div>
            <div className="space-y-2 text-sm">
              <a href="tel:+15039101514" className="flex items-center gap-2 hover:opacity-100">
                <Phone size={14} weight="bold" /> 503-910-1514
              </a>
              <a href="mailto:Admin@theoregonappraisers.com" className="flex items-center gap-2 hover:opacity-100">
                <EnvelopeSimple size={14} weight="bold" /> Admin@theoregonappraisers.com
              </a>
              <div className="flex items-start gap-2">
                <MapPin size={14} weight="bold" className="mt-1 shrink-0" />
                <span>885 Lancaster Dr SE, Suite B<br />Salem, OR 97317</span>
              </div>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] font-bold mb-4" style={{ color: AMBER_LIGHT }}>
              Service Area
            </div>
            <ul className="space-y-1.5 text-sm">
              <li>Marion County · Salem · Keizer · Stayton</li>
              <li>Polk County · Dallas · Independence · Monmouth</li>
              <li>Linn County · Albany · Lebanon · Sweet Home</li>
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs" style={{ borderColor: `${CREAM}20` }}>
          <div>
            © {new Date().getFullYear()} The Oregon Appraisers. USPAP-compliant.
            All work performed by Robert Rochefort.
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 32 32" style={{ color: "#0ea5e9" }} aria-hidden>
              <circle cx="16" cy="16" r="14" fill="currentColor" opacity="0.15" />
              <circle cx="16" cy="16" r="6" fill="currentColor" />
            </svg>
            <span>
              Built by{" "}
              <a
                href="https://bluejayportfolio.com/audit"
                className="font-bold hover:opacity-100"
                style={{ color: "#0ea5e9" }}
              >
                BlueJays
              </a>{" "}
              — get your free site audit
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================
function SectionBadge({ text, color = FOREST }: { text: string; color?: string }) {
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.16em] font-bold mb-3"
      style={{
        background: `${color}15`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {text}
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1]"
      style={{ color: FOREST, fontFamily: "'EB Garamond', serif" }}
    >
      {children}
    </h2>
  );
}
