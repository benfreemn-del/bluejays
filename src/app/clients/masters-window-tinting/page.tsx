"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase. */

/**
 * /clients/masters-window-tinting — Masters Window Tinting (West Babylon, NY)
 *
 * Custom premium showcase for a Long Island tint + auto detail shop.
 * Real services from their existing site, real testimonials, real
 * certifications. Dark luxury automotive aesthetic — pure black bg,
 * cobalt+electric blue accents, chrome silver details.
 *
 * Pattern reference: hector-landscaping/page.tsx (structure) and
 * itc-quick-attach/page.tsx (industrial premium feel). Custom tier
 * means quality bar > V2 template.
 */

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
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Shield,
  ShieldCheck,
  Sparkle,
  Car,
  House,
  Buildings,
  Lightning,
  Crown,
  Quotes,
  CaretDown,
  Medal,
  SealCheck,
  Certificate,
  Drop,
  Sun,
  Eye,
  Wrench,
  PaintRoller,
  SpeakerHigh,
  Lightbulb,
  Boat,
  Calendar,
  Play,
  Envelope,
  InstagramLogo,
  FacebookLogo,
} from "@phosphor-icons/react";

import StickyNav from "./sticky-nav";
import MastersContactForm from "./contact-form";
import BluejayLogo from "@/components/BluejayLogo";

/* ───────────────────────── BUSINESS DATA ───────────────────────── */
const BUSINESS = {
  name: "Masters Window Tinting",
  tagline: "Never wax your car again.",
  // established: set to a year (e.g. 2003) once Ben confirms the real
  // founding year. Until then, leave null so we don't show a fake stat.
  established: null as number | null,
  phoneDisplay: "(631) 226-4300",
  phoneHref: "tel:+16312264300",
  email: "info@masterswindowtinting.com",
  address: {
    street: "863 Route 109",
    city: "West Babylon",
    state: "NY",
    zip: "11704",
    full: "863 Route 109, West Babylon, NY 11704",
  },
  mapsUrl:
    "https://maps.google.com/?q=863+Route+109+West+Babylon+NY+11704",
  hours: {
    weekday: "Mon-Sat · 9 AM to 5 PM",
    sunday: "Sun · 10 AM to 2 PM",
  },
  social: {
    instagram: "https://www.instagram.com/Ceramic_pro_long_island",
    facebook: "https://www.facebook.com/profile.php?id=100063773733742",
  },
  prospectId: "bc3fd049-0a8d-48c7-8f7b-cc6cd142d646",
} as const;

const LOGO =
  "/api/image-proxy?url=" +
  encodeURIComponent(
    "https://iown.website/bx/_files/96images/common_logo/mwt_logo.png",
  );

const PHOTOS = {
  hero: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=2400&q=85",
  heroAlt:
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=2400&q=85",
  ppf: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1600&q=85",
  ceramic:
    "https://images.unsplash.com/photo-1542362567-b07e54358753?w=1600&q=85",
  interior:
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1600&q=85",
  detail:
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=85",
  shopFloor:
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1600&q=85",
  blackCar:
    "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=1600&q=85",
  tesla:
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1600&q=85",
  audi: "https://images.unsplash.com/photo-1607603750909-408e193868c7?w=1600&q=85",
  wheel:
    "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=1600&q=85",
  luxury:
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1600&q=85",
  coating:
    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1600&q=85",
} as const;

/* ───────────────────────── COLORS ───────────────────────── */
// Color system tuned to Master's actual brand: their corporate blue is
// closer to a warm cobalt, not icy electric. Pure black gets a subtle
// blue tint so the site reads "Long Island family pro shop, premium-
// upgraded" instead of "luxury obsidian." Brand reference: their
// existing site at masterswindowtinting.com (blue + black + white).
const BG = "#0b0e14";
const BG_ALT = "#111111";
const BG_PANEL = "#161616";
const COBALT = "#0066cc";    // their actual corporate brand blue
const ELECTRIC = "#1e88ff";  // bright accent, warmer than #0ea5e9
const CHROME = "#cbd5e1";
const CHROME_DIM = "#94a3b8";
const INK = "#f8fafc";
const INK_SOFT = "rgba(255, 255, 255, 0.78)";
const INK_DIM = "rgba(255, 255, 255, 0.55)";

const FONT_HEAD = "'Barlow Condensed', sans-serif";
const FONT_BODY = "'Barlow', sans-serif";

const spring = { type: "spring" as const, stiffness: 100, damping: 22 };
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: spring },
};

/* ───────────────────────── REUSABLE COMPONENTS ───────────────────────── */

function SectionHeader({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-3xl ${alignClass} mb-14 sm:mb-16`}>
      {eyebrow && (
        <div
          className="inline-flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase font-semibold mb-5"
          style={{ color: ELECTRIC, fontFamily: FONT_HEAD }}
        >
          <span className="inline-block w-8 h-px" style={{ background: ELECTRIC }} />
          {eyebrow}
          <span className="inline-block w-8 h-px" style={{ background: ELECTRIC }} />
        </div>
      )}
      <h2
        className="text-[36px] sm:text-[48px] lg:text-[60px] font-extrabold tracking-tight uppercase leading-[0.95] text-white"
        style={{ fontFamily: FONT_HEAD }}
      >
        {title}{" "}
        {highlight && (
          <span
            style={{
              background: `linear-gradient(135deg, ${COBALT} 0%, ${ELECTRIC} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {highlight}
          </span>
        )}
      </h2>
      {subtitle && (
        <p
          className={`mt-5 text-[16px] sm:text-[18px] leading-relaxed ${align === "center" ? "max-w-2xl mx-auto" : ""}`}
          style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function GlassCard({
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
      className={`border ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        borderColor: "rgba(203, 213, 225, 0.15)",
        backdropFilter: "blur(12px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

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
  const inView = useInView(ref, { once: true, margin: "-60px" });
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

function MagneticAnchor({
  children,
  className = "",
  style,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  href: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 25 });
  const sy = useSpring(y, { stiffness: 200, damping: 25 });

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - (rect.left + rect.width / 2)) * 0.18);
      y.set((e.clientY - (rect.top + rect.height / 2)) * 0.18);
    },
    [x, y],
  );

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy, ...style }}
      className={className}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.a>
  );
}

/* ───────────────────────── DATA — SERVICES ───────────────────────── */
const services = [
  { num: "01", group: "Auto", title: "Automotive Window Tinting", desc: "Heat rejection, UV block, and a clean factory look from sedans to SUVs and trucks. Lifetime warranty on film and workmanship.", icon: Car },
  { num: "02", group: "Auto", title: "Liquid Paint Protection Film", desc: "Liquid PPF, no seams, no bubbles. A clear armor layer that bonds to your factory paint and keeps stone chips, swirls, and bug acid off the finish.", icon: Shield },
  { num: "03", group: "Auto", title: "Ceramic Pro Coating", desc: "Bronze, Silver, and Gold packages. Hydrophobic, scratch-resistant, gloss-deepening. Once cured, water beads and contaminants slide off.", icon: Sparkle },
  { num: "04", group: "Auto", title: "Car Detailing", desc: "Hand wash, clay bar, paint correction, and interior steam clean. We prep the surface before any film or coating goes on, the right way.", icon: Drop },
  { num: "05", group: "Auto", title: "Plasti Dip", desc: "Wheels, emblems, accents, full or partial vehicle. Removable, factory-clean finish in any color you can name.", icon: PaintRoller },
  { num: "06", group: "Home & Office", title: "Residential Window Tinting", desc: "Cool the south-facing rooms, kill UV fade on hardwood and furniture, and add privacy without curtains. Authorized Ultra Vision dealer.", icon: House },
  { num: "07", group: "Home & Office", title: "Commercial Window Tinting", desc: "Storefronts, offices, and conference rooms. Lower cooling costs, control glare on screens, and add a professional finish to glass walls.", icon: Buildings },
  { num: "08", group: "Performance & Audio", title: "Remote Starters", desc: "Warm cabin in winter, cool seats in summer. Range options for big driveways and parking decks. Installed clean, no janky aftermarket wiring.", icon: Lightning },
  { num: "09", group: "Performance & Audio", title: "Car Audio Systems", desc: "Head units, speakers, amplifiers, subs. Built around how you actually listen, no preset packages we have to talk you out of.", icon: SpeakerHigh },
  { num: "10", group: "Performance & Audio", title: "Electronics Installation", desc: "Backup cameras, dash cams, radar detectors, parking sensors, alarm systems. Tucked behind panels, never zip-tied to the dash.", icon: Wrench },
  { num: "11", group: "Performance & Audio", title: "LED Headlight Strips", desc: "DRL strips, sequential turns, halo rings. Bright enough to read after sundown without blinding the next lane over.", icon: Lightbulb },
  { num: "12", group: "Performance & Audio", title: "Custom Vinyl Lettering", desc: "Shop names, contractor trucks, fleet branding. Cut, weeded, and applied in-house with squeegees that have seen a thousand jobs.", icon: PaintRoller },
  { num: "13", group: "Performance & Audio", title: "Boat Detailing", desc: "Hull buff, gelcoat polish, deck cleaning, vinyl conditioning. We work on cars all week, boats are a Sunday morning at the marina.", icon: Boat },
];

const ceramicTiers = [
  { tier: "Bronze", icon: Shield, accent: "#b45309", description: "Entry-level Ceramic Pro protection, perfect for daily drivers that need a lasting hydrophobic finish without the multi-year warranty.", features: ["Single layer Ceramic Pro 9H", "Hydrophobic water beading", "Hand wash and full decon prep", "Light swirl removal", "Two year warranty on coating"], badge: "Daily Driver" },
  { tier: "Silver", icon: Medal, accent: CHROME, description: "The popular package, multiple layers, deeper gloss, longer warranty. Perfect for someone who keeps a car for five plus years.", features: ["Two layers Ceramic Pro 9H", "One layer Ceramic Pro Light", "Wheels and calipers coated", "Full paint correction included", "Five year warranty on coating"], popular: true, badge: "Most Popular" },
  { tier: "Gold", icon: Crown, accent: "#ca8a04", description: "The flagship. Lifetime warranty package, full vehicle protection inside and out. For collectors and anyone who wants the best the system offers.", features: ["Four layers Ceramic Pro 9H", "One layer Ceramic Pro Light", "Wheels, calipers, glass coated", "Plastic and trim coating", "Lifetime warranty on coating"], badge: "Lifetime" },
];

const tintCompare = [
  { type: "Auto", icon: Car, accent: ELECTRIC, heat: "Up to 65%", uv: "99%", warranty: "Lifetime", install: "1-2 hrs", note: "Lifetime warranty on film and workmanship. Authorized Ultra Vision dealer." },
  { type: "Residential", icon: House, accent: COBALT, heat: "Up to 78%", uv: "99%", warranty: "15-year", install: "2-4 hrs", note: "Cuts cooling costs and stops UV fade on hardwood and furniture." },
  { type: "Commercial", icon: Buildings, accent: "#0369a1", heat: "Up to 78%", uv: "99%", warranty: "10-year", install: "Half day", note: "Glare control for screens, security film options, energy savings on cooling." },
];

const trustBadges = [
  { title: "Certified Ceramic Pro", desc: "Authorized installer. Only certified shops can apply Ceramic Pro coatings.", icon: SealCheck },
  { title: "Ultra Vision Authorized", desc: "Authorized dealer of Ultra Vision premium window film, with lifetime film warranty.", icon: Certificate },
  { title: "Lifetime Warranty", desc: "Lifetime warranty on automotive film and on our workmanship. We stand behind the install.", icon: ShieldCheck },
  { title: "In-House Installers Only", desc: "Every install handled by our staff. No subcontractors, no rotating crews from a tint chain.", icon: Medal },
];

const processSteps = [
  { step: "01", title: "Free Quote", desc: "Call, text, or fill the form. We give you a real number for your real vehicle, same day during shop hours.", icon: Phone },
  { step: "02", title: "Schedule", desc: "Pick a slot that works. Most installs go in within the same week, sooner if we have an opening.", icon: Calendar },
  { step: "03", title: "Install", desc: "Bring it in. Most auto tint takes one to two hours. Ceramic coatings need a day. Liquid PPF, two days.", icon: Wrench },
  { step: "04", title: "Lifetime Warranty", desc: "Drive home. If anything ever bubbles, peels, or fades on automotive film, bring it back. We fix it.", icon: ShieldCheck },
];

const reviews = [
  { name: "Nadia Mierau", text: "Great Job on my car Ceramic Pro coating. Love it. Love it. Love it.", service: "Ceramic Pro Coating" },
  { name: "Kayla Anderson", text: "Got my tail lights tinted. Guys were laid back but got the job done quickly.", service: "Tail Light Tint" },
  { name: "Sheila Sanders", text: "The outcome was beautiful. The staff was very accommodating, friendly and knowledgeable.", service: "Window Tinting" },
];

const comparisonRows = [
  { feature: "Lifetime film and workmanship warranty", us: "Yes", them: "30-90 days" },
  { feature: "Certified Ceramic Pro installer", us: "Yes", them: "Rarely" },
  { feature: "Authorized Ultra Vision dealer", us: "Yes", them: "Generic film" },
  { feature: "In-house installers, no contractors", us: "Yes", them: "Rotating crews" },
  { feature: "Liquid PPF, no seams, no bubbles", us: "Yes", them: "Sheet film only" },
  { feature: "Same-day quotes during shop hours", us: "Yes", them: "Days to a week" },
  { feature: "Open seven days a week", us: "Yes", them: "Mon-Fri only" },
];

const serviceAreaTowns = [
  "West Babylon", "Babylon", "Lindenhurst", "Wyandanch", "Deer Park",
  "North Babylon", "Bay Shore", "Brentwood", "Amityville", "Massapequa",
  "Farmingdale", "Copiague", "East Massapequa", "Seaford", "Wantagh",
  "Bellmore", "Merrick", "Levittown", "Hicksville", "Plainview",
  "Garden City", "Mineola", "Hempstead", "Freeport", "Long Beach",
  "Jamaica", "Queens Village", "Floral Park", "Valley Stream", "Oceanside",
];

const faqs = [
  { q: "What is the legal tint limit in New York?", a: "New York allows 70% VLT minimum on front side windows and the windshield (top six inches only). Rear side and rear windows have no VLT limit on passenger vehicles. SUVs and vans get more flexibility on the back. We tell you exactly what is legal for your vehicle before any film goes on." },
  { q: "How long does window tint actually last?", a: "Quality Ultra Vision film lasts the lifetime of the vehicle when installed correctly. Cheap film bubbles, fades purple, and peels in two to three years. Our automotive tint carries a lifetime warranty on film and workmanship. If it ever fails, we redo it." },
  { q: "Can you tint old or curved windows on my house?", a: "Yes. Residential film works on most window glass. Single pane, double pane, low-E, even most curved or specialty glass. We do a free home walkthrough before quoting so we know exactly what we are dealing with." },
  { q: "Will Ceramic Pro really last forever?", a: "The Gold package carries a lifetime warranty when you stay on the maintenance schedule (typically a yearly inspection). Bronze and Silver carry shorter warranties, two and five years. The coating itself is permanent, the warranty length depends on the package." },
  { q: "How long does a typical install take?", a: "Auto window tint is one to two hours for most cars. Liquid PPF is one to two full days because the surface has to flash off and cure. Ceramic Pro Bronze is a same-day job. Silver and Gold need an overnight cure. We tell you a realistic time when you book." },
  { q: "Will the tint scratch my windows or rear defroster?", a: "Never. We use plastic squeegees, soap solution, and a heat gun. No metal tools touch your glass or defroster lines. Every install gets a final inspection before you drive off." },
  { q: "Do you offer commercial fleet pricing?", a: "Yes. Fleet, dealer, and contractor pricing is available. Call us with the vehicle count and what you need (tint, vinyl wraps, lettering, etc.) and we will put a number together same day." },
  { q: "Where are you located and what areas do you serve?", a: "We are at 863 Route 109 in West Babylon, NY. We serve all of Long Island, Suffolk County, Nassau County, and the Queens-adjacent neighborhoods. Most customers drive to us. Commercial and residential film calls we go to." },
];

const quizOptions = [
  { label: "Auto", icon: Car, accent: ELECTRIC, description: "Window tint, ceramic coating, liquid PPF, audio, electronics.", recommendation: "Start with a Ceramic Pro Silver and tint quote." },
  { label: "Home", icon: House, accent: COBALT, description: "Heat rejection, UV protection, privacy and glare control.", recommendation: "Ultra Vision residential film, free in-home walkthrough." },
  { label: "Office", icon: Buildings, accent: "#0369a1", description: "Storefront tint, glare control, energy savings on cooling.", recommendation: "Commercial site visit and free written quote." },
  { label: "Boat", icon: Boat, accent: "#0c4a6e", description: "Detail, gelcoat polish, deck cleaning, hull restoration.", recommendation: "Full boat detail package with optional ceramic seal." },
];

const galleryPhotos = [
  PHOTOS.blackCar,
  PHOTOS.tesla,
  PHOTOS.audi,
  PHOTOS.luxury,
  PHOTOS.coating,
  PHOTOS.wheel,
];

const serviceNames = services.map((s) => s.title);

const yearsInBusiness = BUSINESS.established
  ? new Date().getFullYear() - BUSINESS.established
  : null;

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function MastersWindowTintingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [quizPick, setQuizPick] = useState<number | null>(null);

  return (
    <main
      id="top"
      className="relative min-h-[100dvh] overflow-x-hidden"
      style={{
        background: BG,
        color: INK,
        fontFamily: FONT_BODY,
      }}
    >
      <style>{`
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: ${BG}; }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to top, ${COBALT}, ${ELECTRIC}, ${CHROME});
          border-radius: 8px;
          border: 2px solid ${BG};
        }
        * { scrollbar-width: thin; scrollbar-color: ${ELECTRIC} ${BG}; }
      `}</style>

      <StickyNav
        businessName={BUSINESS.name}
        logoSrc={LOGO}
        phoneDisplay={BUSINESS.phoneDisplay}
        phoneHref={BUSINESS.phoneHref}
      />

      {/* ═════════════════ 1. HERO ═════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Hero bg image */}
        <div className="absolute inset-0 z-0">
          <img
            src={PHOTOS.hero}
            alt="Black luxury car with tinted windows in Long Island"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* dark overlay for legibility */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.78) 60%, rgba(10,10,10,0.96) 100%)",
            }}
          />
          {/* subtle blue glow accent on the right */}
          <div
            className="absolute -right-40 top-1/4 w-[600px] h-[600px] rounded-full hidden md:block"
            style={{
              background: `radial-gradient(closest-side, ${COBALT}33, transparent 70%)`,
              filter: "blur(80px)",
            }}
          />
        </div>

        {/* Same-day quote pulsing badge — top right */}
        <div className="absolute top-24 sm:top-28 right-5 sm:right-10 z-10 hidden sm:flex">
          <div
            className="flex items-center gap-2 px-4 py-2 border"
            style={{
              background: "rgba(14, 165, 233, 0.12)",
              borderColor: ELECTRIC,
              fontFamily: FONT_HEAD,
            }}
          >
            <motion.span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: ELECTRIC }}
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            <span
              className="text-[11px] tracking-[0.2em] uppercase font-bold text-white"
            >
              Same-Day Quotes Available
            </span>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 sm:py-32 w-full">
          <div className="max-w-4xl">
            {/* eyebrow */}
            <div
              className="inline-flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase font-semibold mb-6"
              style={{ color: ELECTRIC, fontFamily: FONT_HEAD }}
            >
              <span className="inline-block w-8 h-px" style={{ background: ELECTRIC }} />
              West Babylon, NY · Long Island{BUSINESS.established ? ` · Since ${BUSINESS.established}` : ""}
            </div>

            <h1
              className="text-[52px] sm:text-[80px] lg:text-[112px] font-extrabold uppercase leading-[0.88] text-white mb-7"
              style={{ fontFamily: FONT_HEAD, letterSpacing: "-0.01em" }}
            >
              Never Wax<br />
              Your Car{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${ELECTRIC} 0%, ${COBALT} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Again.
              </span>
            </h1>

            <p
              className="text-[17px] sm:text-[20px] leading-relaxed max-w-2xl mb-9"
              style={{ color: INK_SOFT, textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
            >
              Family-run on Route 109 since day one. Real installers, no
              subcontractors. Certified Ceramic Pro, authorized Ultra Vision,
              lifetime warranty. We pick up the phone.
            </p>

            {/* dual CTA */}
            <div className="flex flex-col sm:flex-row gap-4 mb-9">
              <MagneticAnchor
                href={BUSINESS.phoneHref}
                className="inline-flex items-center justify-center gap-3 px-8 py-5 text-[14px] font-bold tracking-[0.18em] uppercase transition-all"
                style={{
                  background: `linear-gradient(135deg, ${COBALT} 0%, ${ELECTRIC} 100%)`,
                  color: "white",
                  fontFamily: FONT_HEAD,
                  boxShadow: `0 8px 32px ${COBALT}66`,
                }}
              >
                <Phone size={18} weight="fill" />
                Call {BUSINESS.phoneDisplay}
              </MagneticAnchor>
              <MagneticAnchor
                href="#contact"
                className="inline-flex items-center justify-center gap-3 px-8 py-5 text-[14px] font-bold tracking-[0.18em] uppercase border-2 transition-all"
                style={{
                  borderColor: CHROME,
                  color: "white",
                  fontFamily: FONT_HEAD,
                }}
              >
                Get a Quote
                <ArrowRight size={18} weight="bold" />
              </MagneticAnchor>
            </div>

            {/* trust strip */}
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3 pt-6 border-t" style={{ borderColor: "rgba(203, 213, 225, 0.18)" }}>
              {[
                { Icon: ShieldCheck, label: "Lifetime Warranty" },
                { Icon: SealCheck, label: "Certified Ceramic Pro" },
                { Icon: Calendar, label: "7 Days a Week" },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={18} weight="fill" style={{ color: ELECTRIC }} />
                  <span
                    className="text-[11px] tracking-[0.18em] uppercase font-bold text-white"
                    style={{ fontFamily: FONT_HEAD }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:block">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[10px] tracking-[0.3em] uppercase font-semibold"
            style={{ color: CHROME_DIM, fontFamily: FONT_HEAD }}
          >
            Scroll ↓
          </motion.div>
        </div>
      </section>

      {/* ═════════════════ 2. SERVICE GRID ═════════════════ */}
      <SectionReveal id="services" className="relative py-24 sm:py-32" style={{ background: BG_ALT }}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="auto-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auto-grid)" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="What We Do"
            title="Thirteen Services."
            highlight="One Shop."
            subtitle="Every install handled in-house at 863 Route 109. No subcontractors, no rotating crews. Auto, home, office, performance and audio, all under one roof."
          />
          {(["Auto", "Home & Office", "Performance & Audio"] as const).map((groupName) => (
            <div key={groupName} className="mb-14 last:mb-0">
              <div className="flex items-center gap-3 mb-7">
                <span
                  className="inline-block w-10 h-px"
                  style={{ background: ELECTRIC }}
                />
                <h3
                  className="text-[14px] tracking-[0.28em] uppercase font-bold"
                  style={{ color: ELECTRIC, fontFamily: FONT_HEAD }}
                >
                  {groupName}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {services
                  .filter((s) => s.group === groupName)
                  .map((s) => (
                    <motion.div
                      key={s.num}
                      variants={fadeUp}
                      whileHover={{ y: -4 }}
                      className="group relative p-7 border transition-all"
                      style={{
                        background: BG_PANEL,
                        borderColor: "rgba(203, 213, 225, 0.15)",
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                        style={{
                          background: `linear-gradient(135deg, ${COBALT}1a 0%, transparent 60%)`,
                        }}
                      />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-5">
                          <div
                            className="w-12 h-12 flex items-center justify-center"
                            style={{
                              background: `${ELECTRIC}1a`,
                              border: `1px solid ${ELECTRIC}55`,
                            }}
                          >
                            <s.icon size={22} weight="duotone" style={{ color: ELECTRIC }} />
                          </div>
                          <span
                            className="text-[11px] tracking-[0.22em] uppercase font-bold"
                            style={{ color: CHROME_DIM, fontFamily: FONT_HEAD }}
                          >
                            {s.num}
                          </span>
                        </div>
                        <h4
                          className="text-[20px] sm:text-[22px] font-bold uppercase tracking-tight mb-3 text-white"
                          style={{ fontFamily: FONT_HEAD }}
                        >
                          {s.title}
                        </h4>
                        <p className="text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
                          {s.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </SectionReveal>

      {/* ═════════════════ 3. CERAMIC PRO TIERS ═════════════════ */}
      <SectionReveal id="ceramic" className="relative py-24 sm:py-32" style={{ background: BG }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="Ceramic Pro Coatings"
            title="Bronze. Silver."
            highlight="Gold."
            subtitle="Three certified Ceramic Pro packages. Pick the warranty length that matches how long you plan to keep the car. Every layer is hand-applied by a certified installer."
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {ceramicTiers.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.tier}
                  className="relative p-8 border flex flex-col"
                  style={{
                    background: t.popular ? "rgba(14, 165, 233, 0.06)" : BG_PANEL,
                    borderColor: t.popular ? ELECTRIC : "rgba(203, 213, 225, 0.15)",
                  }}
                >
                  {t.popular && (
                    <div
                      className="absolute -top-3 left-8 px-3 py-1 text-[10px] tracking-[0.22em] uppercase font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${COBALT} 0%, ${ELECTRIC} 100%)`,
                        fontFamily: FONT_HEAD,
                      }}
                    >
                      {t.badge}
                    </div>
                  )}
                  {!t.popular && (
                    <div
                      className="absolute -top-3 left-8 px-3 py-1 text-[10px] tracking-[0.22em] uppercase font-bold"
                      style={{
                        background: BG_PANEL,
                        border: `1px solid ${t.accent}`,
                        color: t.accent,
                        fontFamily: FONT_HEAD,
                      }}
                    >
                      {t.badge}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-5 mt-2">
                    <div
                      className="w-12 h-12 flex items-center justify-center"
                      style={{
                        background: `${t.accent}22`,
                        border: `1px solid ${t.accent}66`,
                      }}
                    >
                      <Icon size={24} weight="duotone" style={{ color: t.accent }} />
                    </div>
                    <h3
                      className="text-[34px] font-extrabold uppercase tracking-tight text-white"
                      style={{ fontFamily: FONT_HEAD }}
                    >
                      {t.tier}
                    </h3>
                  </div>
                  <p className="text-[14px] leading-relaxed mb-6" style={{ color: INK_SOFT }}>
                    {t.description}
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-[14px]" style={{ color: INK_SOFT }}>
                        <CheckCircle
                          size={18}
                          weight="fill"
                          style={{ color: t.accent, marginTop: 2, flexShrink: 0 }}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={BUSINESS.phoneHref}
                    className="block text-center px-6 py-3.5 text-[12px] font-bold tracking-[0.2em] uppercase transition-all"
                    style={{
                      background: t.popular
                        ? `linear-gradient(135deg, ${COBALT} 0%, ${ELECTRIC} 100%)`
                        : "transparent",
                      border: t.popular ? "none" : `2px solid ${t.accent}`,
                      color: t.popular ? "white" : t.accent,
                      fontFamily: FONT_HEAD,
                    }}
                  >
                    Quote {t.tier}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ═════════════════ 4. LIQUID PPF ═════════════════ */}
      <SectionReveal className="relative py-24 sm:py-32" style={{ background: BG_ALT }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="aspect-[5/4] overflow-hidden">
                <img
                  src={PHOTOS.ppf}
                  alt="Liquid paint protection film on luxury car"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="absolute -bottom-6 -right-6 px-6 py-4 hidden md:block"
                style={{
                  background: `linear-gradient(135deg, ${COBALT} 0%, ${ELECTRIC} 100%)`,
                  fontFamily: FONT_HEAD,
                }}
              >
                <div className="text-[11px] tracking-[0.22em] uppercase font-bold text-white mb-1">
                  Long Island Exclusive
                </div>
                <div className="text-[20px] font-bold uppercase text-white">
                  Liquid PPF
                </div>
              </div>
            </div>
            <div>
              <div
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase font-semibold mb-5"
                style={{ color: ELECTRIC, fontFamily: FONT_HEAD }}
              >
                <span className="inline-block w-8 h-px" style={{ background: ELECTRIC }} />
                Liquid Paint Protection Film
              </div>
              <h2
                className="text-[40px] sm:text-[56px] font-extrabold uppercase leading-[0.95] tracking-tight text-white mb-6"
                style={{ fontFamily: FONT_HEAD }}
              >
                No Seams.<br />
                <span
                  style={{
                    background: `linear-gradient(135deg, ${COBALT} 0%, ${ELECTRIC} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  No Bubbles.
                </span>
              </h2>
              <p className="text-[16px] leading-relaxed mb-7" style={{ color: INK_SOFT }}>
                Sheet PPF leaves visible seams every time the panel curves.
                Liquid PPF goes on as a continuous, flexible coating that
                bonds to the factory paint. The result, a clear armor layer
                with no edge lines, no orange peel, and no bubbles, even on
                tight curves around mirrors and bumpers.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Self-healing, scratches close on warm days",
                  "Stops stone chips, swirl marks, and bug acid",
                  "Clear high-gloss finish, deepens factory paint",
                  "Wraps around tight curves with zero seams",
                  "Compatible with Ceramic Pro topcoat",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[15px]" style={{ color: INK_SOFT }}>
                    <CheckCircle size={18} weight="fill" style={{ color: ELECTRIC, marginTop: 2, flexShrink: 0 }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={BUSINESS.phoneHref}
                className="inline-flex items-center gap-2 px-7 py-4 text-[13px] font-bold tracking-[0.18em] uppercase"
                style={{
                  background: `linear-gradient(135deg, ${COBALT} 0%, ${ELECTRIC} 100%)`,
                  color: "white",
                  fontFamily: FONT_HEAD,
                }}
              >
                <Phone size={16} weight="fill" />
                Quote Liquid PPF
              </a>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═════════════════ 5. TINT COMPARISON TABLE ═════════════════ */}
      <SectionReveal id="tint" className="relative py-24 sm:py-32" style={{ background: BG }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="Window Tint"
            title="Auto. Home."
            highlight="Office."
            subtitle="Three different jobs, three different specifications. Heat rejection, UV block, warranty length, and install time are all different. Here is what each one delivers."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tintCompare.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.type}
                  className="p-7 border"
                  style={{
                    background: BG_PANEL,
                    borderColor: "rgba(203, 213, 225, 0.15)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-12 h-12 flex items-center justify-center"
                      style={{
                        background: `${t.accent}22`,
                        border: `1px solid ${t.accent}66`,
                      }}
                    >
                      <Icon size={24} weight="duotone" style={{ color: t.accent }} />
                    </div>
                    <h3
                      className="text-[26px] font-bold uppercase tracking-tight text-white"
                      style={{ fontFamily: FONT_HEAD }}
                    >
                      {t.type}
                    </h3>
                  </div>
                  <div className="space-y-3 mb-5">
                    {[
                      { label: "Heat rejection", value: t.heat },
                      { label: "UV block", value: t.uv },
                      { label: "Warranty", value: t.warranty },
                      { label: "Install time", value: t.install },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: "rgba(203, 213, 225, 0.1)" }}>
                        <span className="text-[11px] tracking-[0.18em] uppercase font-semibold" style={{ color: CHROME_DIM, fontFamily: FONT_HEAD }}>
                          {row.label}
                        </span>
                        <span
                          className="text-[16px] font-bold"
                          style={{ color: t.accent, fontFamily: FONT_HEAD }}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ color: INK_SOFT }}>
                    {t.note}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ═════════════════ 6. TRUST BADGES ═════════════════ */}
      <SectionReveal className="relative py-24 sm:py-32" style={{ background: BG_ALT }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="Why Masters"
            title="The Bar Other Shops"
            highlight="Try to Hit."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trustBadges.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="p-7 border text-center flex flex-col items-center"
                  style={{
                    background: BG_PANEL,
                    borderColor: "rgba(203, 213, 225, 0.15)",
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                    style={{
                      background: `linear-gradient(135deg, ${COBALT}33 0%, ${ELECTRIC}22 100%)`,
                      border: `1px solid ${ELECTRIC}66`,
                    }}
                  >
                    <Icon size={28} weight="duotone" style={{ color: ELECTRIC }} />
                  </div>
                  <h3
                    className="text-[18px] font-bold uppercase tracking-tight mb-3 text-white"
                    style={{ fontFamily: FONT_HEAD }}
                  >
                    {b.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: INK_SOFT }}>
                    {b.desc}
                  </p>
                </div>
              );
            })}
          </div>
          {/* Certifications row */}
          <div
            className="mt-12 flex flex-wrap items-center justify-center gap-3 pt-10 border-t"
            style={{ borderColor: "rgba(203, 213, 225, 0.12)" }}
          >
            {["Ceramic Pro Certified", "Ultra Vision Authorized", "BBB Reviewed", "NY Licensed", "Lifetime Warranty"].map((c) => (
              <div
                key={c}
                className="px-4 py-2 border"
                style={{
                  borderColor: "rgba(203, 213, 225, 0.25)",
                  background: "rgba(255, 255, 255, 0.03)",
                  fontFamily: FONT_HEAD,
                }}
              >
                <span className="text-[11px] tracking-[0.22em] uppercase font-bold text-white">
                  {c}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═════════════════ 7. SERVICE AREA ═════════════════ */}
      <SectionReveal className="relative py-24 sm:py-32" style={{ background: BG }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-2">
              <SectionHeader
                eyebrow="Service Area"
                title="Long"
                highlight="Island."
                align="left"
                subtitle="Drive to us at 863 Route 109 in West Babylon, or we come to you for residential and commercial film. Suffolk, Nassau, and Queens-adjacent neighborhoods covered seven days a week."
              />
              <div className="flex items-center gap-3 mb-6">
                <motion.span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ background: "#22c55e" }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
                <span className="text-[12px] tracking-[0.22em] uppercase font-bold text-white" style={{ fontFamily: FONT_HEAD }}>
                  Open Now · Same-Day Quotes
                </span>
              </div>
              <a
                href={BUSINESS.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[14px] font-semibold mb-3"
                style={{ color: ELECTRIC }}
              >
                <MapPin size={16} weight="fill" />
                {BUSINESS.address.full}
              </a>
              <a
                href={BUSINESS.phoneHref}
                className="block text-[14px] font-semibold text-white mb-3"
              >
                <Phone size={14} weight="fill" className="inline mr-2" style={{ color: ELECTRIC }} />
                {BUSINESS.phoneDisplay}
              </a>
            </div>
            <div className="lg:col-span-3">
              <h3
                className="text-[16px] tracking-[0.22em] uppercase font-bold mb-5"
                style={{ color: ELECTRIC, fontFamily: FONT_HEAD }}
              >
                Towns We Cover
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {serviceAreaTowns.map((town) => (
                  <div
                    key={town}
                    className="px-3 py-2 border text-[13px] font-medium"
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      borderColor: "rgba(203, 213, 225, 0.12)",
                      color: INK_SOFT,
                    }}
                  >
                    {town}
                  </div>
                ))}
              </div>
              <p className="mt-5 text-[12px]" style={{ color: INK_DIM }}>
                Don't see your town? Call us at {BUSINESS.phoneDisplay}. We cover most of Long Island and parts of Queens.
              </p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═════════════════ 8. PROCESS ═════════════════ */}
      <SectionReveal className="relative py-24 sm:py-32" style={{ background: BG_ALT }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="How It Works"
            title="Four Steps."
            highlight="Lifetime Backed."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {processSteps.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.step}
                  className="relative p-7 border"
                  style={{
                    background: BG_PANEL,
                    borderColor: "rgba(203, 213, 225, 0.15)",
                  }}
                >
                  <div
                    className="text-[64px] font-extrabold leading-none mb-4 opacity-25"
                    style={{ color: ELECTRIC, fontFamily: FONT_HEAD }}
                  >
                    {p.step}
                  </div>
                  <Icon size={28} weight="duotone" style={{ color: ELECTRIC }} className="mb-4" />
                  <h3
                    className="text-[20px] font-bold uppercase tracking-tight mb-3 text-white"
                    style={{ fontFamily: FONT_HEAD }}
                  >
                    {p.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
                    {p.desc}
                  </p>
                  {i < processSteps.length - 1 && (
                    <ArrowRight
                      size={20}
                      weight="bold"
                      className="absolute top-8 -right-3 hidden lg:block"
                      style={{ color: ELECTRIC }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ═════════════════ 9. VIDEO TESTIMONIAL PLACEHOLDER ═════════════════ */}
      <SectionReveal className="relative py-24 sm:py-32" style={{ background: BG }}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="Watch Our Process"
            title="Inside the"
            highlight="Shop."
            subtitle="A look at the install bay, our certified Ceramic Pro process, and what happens when your car is in our hands."
          />
          <a
            href={BUSINESS.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block aspect-video overflow-hidden group"
          >
            <img
              src={PHOTOS.detail}
              alt="Watch the Masters Window Tinting install bay"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, rgba(10,10,10,0.45) 0%, rgba(10,10,10,0.85) 100%)",
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                style={{
                  background: `linear-gradient(135deg, ${COBALT} 0%, ${ELECTRIC} 100%)`,
                  boxShadow: `0 0 40px ${ELECTRIC}aa`,
                }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Play size={36} weight="fill" style={{ color: "white", marginLeft: 4 }} />
              </motion.div>
              <div
                className="text-[14px] tracking-[0.28em] uppercase font-bold text-white"
                style={{ fontFamily: FONT_HEAD }}
              >
                Watch Our Work on Instagram
              </div>
            </div>
          </a>
        </div>
      </SectionReveal>

      {/* ═════════════════ 10. INTERACTIVE QUIZ ═════════════════ */}
      <SectionReveal className="relative py-24 sm:py-32" style={{ background: BG_ALT }}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="Quick Picker"
            title="What's Your"
            highlight="Tint Need?"
            subtitle="Pick what you have. We will recommend the right starting package and follow up with a same-day quote."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quizOptions.map((q, i) => {
              const Icon = q.icon;
              const active = quizPick === i;
              return (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => setQuizPick(i)}
                  className="p-6 border text-left transition-all"
                  style={{
                    background: active ? `${q.accent}1a` : BG_PANEL,
                    borderColor: active ? q.accent : "rgba(203, 213, 225, 0.15)",
                    transform: active ? "translateY(-4px)" : "translateY(0)",
                  }}
                >
                  <Icon size={32} weight="duotone" style={{ color: q.accent }} className="mb-4" />
                  <h3
                    className="text-[22px] font-bold uppercase tracking-tight mb-2 text-white"
                    style={{ fontFamily: FONT_HEAD }}
                  >
                    {q.label}
                  </h3>
                  <p className="text-[12px] leading-relaxed" style={{ color: INK_SOFT }}>
                    {q.description}
                  </p>
                </button>
              );
            })}
          </div>
          <AnimatePresence mode="wait">
            {quizPick !== null && (
              <motion.div
                key={quizPick}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-7 p-7 border"
                style={{
                  background: `linear-gradient(135deg, ${COBALT}1a 0%, ${ELECTRIC}0d 100%)`,
                  borderColor: ELECTRIC,
                }}
              >
                <div
                  className="text-[11px] tracking-[0.28em] uppercase font-bold mb-3"
                  style={{ color: ELECTRIC, fontFamily: FONT_HEAD }}
                >
                  Recommended Next Step
                </div>
                <p className="text-[18px] sm:text-[22px] font-semibold text-white leading-snug mb-4">
                  {quizOptions[quizPick].recommendation}
                </p>
                <a
                  href={BUSINESS.phoneHref}
                  className="inline-flex items-center gap-2 px-6 py-3 text-[12px] font-bold tracking-[0.2em] uppercase"
                  style={{
                    background: `linear-gradient(135deg, ${COBALT} 0%, ${ELECTRIC} 100%)`,
                    color: "white",
                    fontFamily: FONT_HEAD,
                  }}
                >
                  <Phone size={14} weight="fill" />
                  Call for Same-Day Quote
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionReveal>

      {/* ═════════════════ 11. TESTIMONIALS ═════════════════ */}
      <SectionReveal id="reviews" className="relative py-24 sm:py-32" style={{ background: BG }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Google Reviews header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-3 px-5 py-3 border mb-5" style={{ borderColor: "rgba(203, 213, 225, 0.2)" }}>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={18} weight="fill" style={{ color: "#fbbf24" }} />
                ))}
              </div>
              <span
                className="text-[12px] tracking-[0.22em] uppercase font-bold text-white"
                style={{ fontFamily: FONT_HEAD }}
              >
                5-Star Reviewed Across Google, Facebook and Yelp
              </span>
            </div>
            <h2
              className="text-[36px] sm:text-[48px] lg:text-[60px] font-extrabold uppercase tracking-tight leading-[0.95] text-white"
              style={{ fontFamily: FONT_HEAD }}
            >
              What Long Island{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${COBALT} 0%, ${ELECTRIC} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Drivers Say.
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <div
                key={r.name}
                className="relative p-7 border flex flex-col"
                style={{
                  background: BG_PANEL,
                  borderColor: "rgba(203, 213, 225, 0.15)",
                }}
              >
                <Quotes
                  size={32}
                  weight="fill"
                  style={{ color: ELECTRIC, opacity: 0.4 }}
                  className="mb-4"
                />
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={16} weight="fill" style={{ color: "#fbbf24" }} />
                  ))}
                </div>
                <p className="text-[15px] leading-relaxed mb-6 flex-1" style={{ color: INK_SOFT }}>
                  {r.text}
                </p>
                <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: "rgba(203, 213, 225, 0.12)" }}>
                  <div>
                    <div
                      className="text-[16px] font-bold text-white"
                      style={{ fontFamily: FONT_HEAD }}
                    >
                      {r.name}
                    </div>
                    <div className="text-[11px] tracking-[0.18em] uppercase mt-1" style={{ color: CHROME_DIM }}>
                      {r.service}
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-1 text-[10px] tracking-[0.22em] uppercase font-bold px-2 py-1"
                    style={{
                      background: "rgba(34, 197, 94, 0.12)",
                      color: "#4ade80",
                      fontFamily: FONT_HEAD,
                    }}
                  >
                    <CheckCircle size={11} weight="fill" />
                    Verified
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═════════════════ 12. COMPARISON TABLE ═════════════════ */}
      <SectionReveal className="relative py-24 sm:py-32" style={{ background: BG_ALT }}>
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="Side By Side"
            title="Masters vs."
            highlight="The Cheap Shop."
            subtitle="Some shops on Long Island do tint for less. Here is what the price difference actually buys you."
          />
          <GlassCard>
            <div className="overflow-hidden">
              <div
                className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-5 border-b font-bold tracking-[0.22em] uppercase text-[11px]"
                style={{
                  background: "rgba(14, 165, 233, 0.08)",
                  borderColor: "rgba(203, 213, 225, 0.18)",
                  color: ELECTRIC,
                  fontFamily: FONT_HEAD,
                }}
              >
                <span>Feature</span>
                <span className="text-center w-24">Masters</span>
                <span className="text-center w-32">Cheap Shop</span>
              </div>
              {comparisonRows.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-4 ${i < comparisonRows.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: "rgba(203, 213, 225, 0.1)" }}
                >
                  <span className="text-[14px] sm:text-[15px] text-white">{row.feature}</span>
                  <span className="text-center w-24 flex items-center justify-center">
                    <span
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide"
                      style={{ color: "#4ade80", fontFamily: FONT_HEAD }}
                    >
                      <CheckCircle size={16} weight="fill" />
                      {row.us}
                    </span>
                  </span>
                  <span className="text-center w-32 text-[12px] font-medium" style={{ color: CHROME_DIM, fontFamily: FONT_HEAD }}>
                    {row.them}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═════════════════ 13. GALLERY ═════════════════ */}
      <SectionReveal className="relative py-24 sm:py-32" style={{ background: BG }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="The Work"
            title="A Few"
            highlight="Recent Builds."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryPhotos.map((src, i) => (
              <div
                key={src}
                className={`relative overflow-hidden ${i === 0 ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-[4/3]" : "aspect-square"}`}
              >
                <img
                  src={src}
                  alt={`Masters Window Tinting recent project ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ═════════════════ 14. FAQ ═════════════════ */}
      <SectionReveal className="relative py-24 sm:py-32" style={{ background: BG_ALT }}>
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="Common Questions"
            title="Tinting"
            highlight="Answered."
          />
          <div className="space-y-3">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <button
                  key={f.q}
                  type="button"
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full text-left p-6 border transition-all"
                  style={{
                    background: open ? "rgba(14, 165, 233, 0.06)" : BG_PANEL,
                    borderColor: open ? ELECTRIC : "rgba(203, 213, 225, 0.15)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3
                      className="text-[16px] sm:text-[18px] font-bold uppercase tracking-tight flex-1 text-white"
                      style={{ fontFamily: FONT_HEAD }}
                    >
                      {f.q}
                    </h3>
                    <CaretDown
                      size={20}
                      weight="bold"
                      style={{
                        color: ELECTRIC,
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                  </div>
                  <AnimatePresence>
                    {open && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 text-[14px] sm:text-[15px] leading-relaxed overflow-hidden"
                        style={{ color: INK_SOFT }}
                      >
                        {f.a}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ═════════════════ 15. CONTACT + HOURS ═════════════════ */}
      <SectionReveal id="contact" className="relative py-24 sm:py-32" style={{ background: BG }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="Get In Touch"
            title="Same-Day"
            highlight="Quotes."
            subtitle="Call, text, or fill the form. We get back during shop hours, or first thing the next morning."
          />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* left side — contact + hours */}
            <div className="lg:col-span-2 space-y-7">
              <div>
                <div
                  className="text-[11px] tracking-[0.28em] uppercase font-bold mb-3"
                  style={{ color: ELECTRIC, fontFamily: FONT_HEAD }}
                >
                  Address
                </div>
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[18px] font-semibold text-white hover:opacity-80 inline-flex items-start gap-2 leading-snug"
                >
                  <MapPin size={20} weight="fill" style={{ color: ELECTRIC, marginTop: 3, flexShrink: 0 }} />
                  <span>
                    863 Route 109<br />
                    West Babylon, NY 11704
                  </span>
                </a>
              </div>
              <div>
                <div
                  className="text-[11px] tracking-[0.28em] uppercase font-bold mb-3"
                  style={{ color: ELECTRIC, fontFamily: FONT_HEAD }}
                >
                  Phone
                </div>
                <a
                  href={BUSINESS.phoneHref}
                  className="text-[28px] sm:text-[32px] font-bold text-white hover:opacity-80 inline-flex items-center gap-3"
                  style={{ fontFamily: FONT_HEAD }}
                >
                  <Phone size={24} weight="fill" style={{ color: ELECTRIC }} />
                  {BUSINESS.phoneDisplay}
                </a>
              </div>
              <div>
                <div
                  className="text-[11px] tracking-[0.28em] uppercase font-bold mb-3"
                  style={{ color: ELECTRIC, fontFamily: FONT_HEAD }}
                >
                  Email
                </div>
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="text-[16px] font-semibold text-white hover:opacity-80 inline-flex items-center gap-2"
                >
                  <Envelope size={18} weight="fill" style={{ color: ELECTRIC }} />
                  {BUSINESS.email}
                </a>
              </div>
              <div>
                <div
                  className="text-[11px] tracking-[0.28em] uppercase font-bold mb-3"
                  style={{ color: ELECTRIC, fontFamily: FONT_HEAD }}
                >
                  Hours
                </div>
                <div className="space-y-1.5 text-[15px]" style={{ color: INK_SOFT }}>
                  <div className="flex items-center gap-2">
                    <Clock size={15} weight="fill" style={{ color: CHROME_DIM }} />
                    <span>{BUSINESS.hours.weekday}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={15} weight="fill" style={{ color: CHROME_DIM }} />
                    <span>{BUSINESS.hours.sunday}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <a
                  href={BUSINESS.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 flex items-center justify-center border transition-all"
                  style={{
                    background: BG_PANEL,
                    borderColor: "rgba(203, 213, 225, 0.2)",
                  }}
                  aria-label="Instagram"
                >
                  <InstagramLogo size={20} weight="bold" style={{ color: ELECTRIC }} />
                </a>
                <a
                  href={BUSINESS.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 flex items-center justify-center border transition-all"
                  style={{
                    background: BG_PANEL,
                    borderColor: "rgba(203, 213, 225, 0.2)",
                  }}
                  aria-label="Facebook"
                >
                  <FacebookLogo size={20} weight="bold" style={{ color: ELECTRIC }} />
                </a>
              </div>
            </div>
            {/* right side — form */}
            <div className="lg:col-span-3">
              <MastersContactForm
                prospectId={BUSINESS.prospectId}
                services={serviceNames}
              />
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═════════════════ 16. CTA BANNER ═════════════════ */}
      <SectionReveal className="relative py-24 sm:py-32 overflow-hidden" style={{ background: BG_ALT }}>
        <div className="absolute inset-0 z-0">
          <img
            src={PHOTOS.heroAlt}
            alt="Tinted windshield close-up"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${COBALT}cc 0%, ${BG}f0 100%)`,
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 text-center">
          <h2
            className="text-[40px] sm:text-[60px] lg:text-[80px] font-extrabold uppercase leading-[0.92] tracking-tight text-white mb-7"
            style={{ fontFamily: FONT_HEAD }}
          >
            Book Your{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${ELECTRIC} 0%, ${CHROME} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Install.
            </span>
          </h2>
          <p className="text-[16px] sm:text-[18px] leading-relaxed max-w-2xl mx-auto mb-9" style={{ color: INK_SOFT }}>
            Same-day quotes during shop hours. Lifetime warranty on automotive
            film and workmanship. Open seven days a week at 863 Route 109.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={BUSINESS.phoneHref}
              className="inline-flex items-center justify-center gap-3 px-8 py-5 text-[14px] font-bold tracking-[0.18em] uppercase transition-all"
              style={{
                background: `linear-gradient(135deg, ${COBALT} 0%, ${ELECTRIC} 100%)`,
                color: "white",
                fontFamily: FONT_HEAD,
                boxShadow: `0 8px 32px ${COBALT}66`,
              }}
            >
              <Phone size={18} weight="fill" />
              Call {BUSINESS.phoneDisplay}
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-5 text-[14px] font-bold tracking-[0.18em] uppercase border-2 text-white transition-all"
              style={{
                borderColor: CHROME,
                fontFamily: FONT_HEAD,
              }}
            >
              Send a Quote Request
              <ArrowRight size={18} weight="bold" />
            </a>
          </div>
        </div>
      </SectionReveal>

      {/* ═════════════════ 17. FOOTER ═════════════════ */}
      <footer className="relative py-16 sm:py-20" style={{ background: "#050505", borderTop: `1px solid rgba(203, 213, 225, 0.1)` }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <img src={LOGO} alt={BUSINESS.name} className="h-12 w-auto object-contain mb-5" />
              <p className="text-[14px] leading-relaxed mb-6 max-w-md" style={{ color: INK_SOFT }}>
                Long Island's certified Ceramic Pro installer and authorized
                Ultra Vision dealer. Window tinting, ceramic coatings, liquid
                PPF, and full auto detail.{BUSINESS.established ? ` Family-run since ${BUSINESS.established}.` : ""}
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={BUSINESS.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 flex items-center justify-center border"
                  style={{ borderColor: "rgba(203, 213, 225, 0.2)" }}
                >
                  <InstagramLogo size={18} weight="bold" style={{ color: ELECTRIC }} />
                </a>
                <a
                  href={BUSINESS.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 flex items-center justify-center border"
                  style={{ borderColor: "rgba(203, 213, 225, 0.2)" }}
                >
                  <FacebookLogo size={18} weight="bold" style={{ color: ELECTRIC }} />
                </a>
              </div>
            </div>
            {/* Services */}
            <div>
              <h4
                className="text-[12px] tracking-[0.22em] uppercase font-bold mb-4"
                style={{ color: ELECTRIC, fontFamily: FONT_HEAD }}
              >
                Services
              </h4>
              <ul className="space-y-2 text-[13px]" style={{ color: INK_SOFT }}>
                {[
                  "Automotive Tinting",
                  "Ceramic Pro",
                  "Liquid PPF",
                  "Residential Tinting",
                  "Commercial Tinting",
                  "Auto Detailing",
                  "Boat Detailing",
                  "Car Audio",
                ].map((s) => (
                  <li key={s}>
                    <a href="#services" className="hover:text-white transition-colors">
                      {s}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Contact */}
            <div>
              <h4
                className="text-[12px] tracking-[0.22em] uppercase font-bold mb-4"
                style={{ color: ELECTRIC, fontFamily: FONT_HEAD }}
              >
                Contact
              </h4>
              <ul className="space-y-3 text-[13px]" style={{ color: INK_SOFT }}>
                <li>
                  <a
                    href={BUSINESS.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-start gap-2"
                  >
                    <MapPin size={14} weight="fill" style={{ color: ELECTRIC, marginTop: 3, flexShrink: 0 }} />
                    <span>
                      863 Route 109
                      <br />
                      West Babylon, NY 11704
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={BUSINESS.phoneHref}
                    className="hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Phone size={14} weight="fill" style={{ color: ELECTRIC }} />
                    {BUSINESS.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${BUSINESS.email}`}
                    className="hover:text-white transition-colors flex items-center gap-2 break-all"
                  >
                    <Envelope size={14} weight="fill" style={{ color: ELECTRIC, flexShrink: 0 }} />
                    <span className="break-all">{BUSINESS.email}</span>
                  </a>
                </li>
                <li className="pt-2 border-t" style={{ borderColor: "rgba(203, 213, 225, 0.1)" }}>
                  <div className="flex items-center gap-2 text-[12px]">
                    <Clock size={13} weight="fill" style={{ color: CHROME_DIM }} />
                    <span>Mon-Sat 9-5 · Sun 10-2</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          {/* Bottom strip */}
          <div
            className="pt-8 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ borderColor: "rgba(203, 213, 225, 0.1)" }}
          >
            <p className="text-[12px]" style={{ color: INK_DIM }}>
              © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
            </p>
            <a
              href="https://bluejayportfolio.com/audit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] hover:opacity-80 transition-opacity"
              style={{ color: CHROME_DIM }}
            >
              <BluejayLogo size={14} className="text-sky-500" />
              <span>
                Built by{" "}
                <span style={{ color: ELECTRIC }} className="font-semibold">
                  BlueJays
                </span>
                {" "}— get your free site audit
              </span>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
