"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase. */

/**
 * /clients/peninsula-paving — Peninsula Paving & Excavating, Sequim WA
 *
 * Bespoke premium showcase for the Olympic Peninsula's 41-year-old
 * family paving + excavation crew (founded 1985 by Cyril & Ella Frick).
 * No-website prospect — this is the proof-of-quality piece + entry
 * point to the mock-backend tour at /clients/peninsula-paving/portal-demo.
 *
 * Aesthetic: dark asphalt + warm copper/orange accent (#ea580c).
 * Differentiated from Meyer Electric's yellow #facc15 (same town,
 * different client). Orange evokes fresh-laid asphalt + road work
 * cones + Sequim sunset.
 *
 * 100% CSS/SVG/Phosphor visuals — no external image URLs. Premium
 * look from rich gradients, SVG art (Olympic Mountains, asphalt
 * roller, road stripes, compass rose), and Phosphor iconography.
 * Self-contained, zero broken-image risk.
 *
 * Audited against Meyer Electric reference standard (CLAUDE.md):
 *   1. Hero shows outcome (paved driveway at sunset, NOT crew at work) ✓
 *   2. Benefit-driven short headline (3-part: end + duration + payoff) ✓
 *   3. 3 believability markers above-fold (41 yrs, Olympic Peninsula,
 *      family-owned) ✓
 *   4. Theme matched to industry (dark trade + copper accent) ✓
 */

import { motion, MotionConfig } from "framer-motion";
import {
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  Compass,
  Quotes,
  Truck,
  Wrench,
  Mountains,
  Hammer,
  Drop,
  ClipboardText,
  Path,
  HandWaving,
  Crosshair,
  Clock,
} from "@phosphor-icons/react";

import StickyNav from "./sticky-nav";
import PeninsulaPavingContactForm from "./contact-form";
import BluejayLogo from "@/components/BluejayLogo";

/* ───────────────────────── BUSINESS DATA ───────────────────────── */
// Live Supabase prospect record — Peninsula Paving & Excavating.
// Created 2026-05-17 · status: approved · pricing_tier: fullsystem.
// Short code: f1f9566c (so /p/f1f9566c resolves to this prospect).
const PROSPECT_ID = "9bd37991-33f5-4406-909a-79ec97d71d2b";

const BUSINESS = {
  name: "Peninsula Paving & Excavating",
  short: "Peninsula Paving",
  tagline: "Driveways Built to Outlast the Pacific Northwest.",
  established: 1985,
  yearsInBusiness: 41,
  phoneDisplay: "(360) 477-7015",
  phoneHref: "tel:+13604777015",
  address: {
    city: "Sequim",
    state: "WA",
    zip: "98382",
    full: "Sequim, WA 98382",
    mailing: "P.O. Box 667, Sequim, WA 98382",
  },
  mapsUrl: "https://maps.google.com/?q=Sequim+WA+98382",
  serviceArea: [
    "Sequim",
    "Port Angeles",
    "Port Townsend",
    "Carlsborg",
    "Diamond Point",
    "Blyn",
    "Dungeness",
    "Gardiner",
    "Joyce",
    "Quilcene",
    "Chimacum",
    "Forks",
  ],
  owners: ["Cyril Frick", "Ella Frick"],
} as const;

/* ───────────────────────── COLORS ───────────────────────── */
// FOUR-color palette built around the paving + Pacific Northwest
// story: copper (fresh asphalt at sunset), olive (PNW forest +
// rooted), sky (Strait of Juan de Fuca + Olympic sky), and warm
// cream (the light surfaces asphalt sits against — driveway gravel,
// concrete curbs, sea-spray sand). Adds chromatic variety to break
// the all-dark fatigue without losing the trade-dress weight.
const BG = "#0c0908";          // warm near-black (not pure #0a — brown undertone)
const BG_ALT = "#161210";      // warmer charcoal panel
const BG_PANEL = "#1e1814";    // distinctly warmer brown-black for cards (was #161412)
const BG_WARM = "#221a14";     // alt section bg — coffee-brown for variety
// Warm-cream light section background — used on the Route Map section
// so the page has at least one daylight breath. Reads like an NPS park
// map. Dark text on cream returns 12:1+ contrast, biggest readability
// win on the page.
const BG_CREAM = "#f5efe6";
const BG_CREAM_ALT = "#eee4d3";

const ACCENT = "#ea580c";        // orange-600 — primary copper (fresh-laid asphalt)
const ACCENT_HOT = "#fb923c";    // orange-400 — highlight
const ACCENT_DEEP = "#c2410c";   // orange-700 — depth
const ACCENT_DIM = "rgba(234, 88, 12, 0.22)";   // was 0.18 — slightly punchier
const ACCENT_DIM_2 = "rgba(234, 88, 12, 0.12)"; // was 0.10

const INK = "#f8fafc";
// Text opacity floors lifted for legibility on the dark+warm bg.
// Was 0.78 → 0.86 for body. Was 0.55 → 0.72 for captions. Bigger
// readability win than any palette change.
const INK_SOFT = "rgba(255, 255, 255, 0.86)";
const INK_DIM = "rgba(255, 255, 255, 0.72)";
// Ink tokens for the cream light section
const INK_DARK = "#1c1410";       // dark text on cream — coffee-black
const INK_DARK_SOFT = "rgba(28, 20, 16, 0.82)";
const INK_DARK_DIM = "rgba(28, 20, 16, 0.62)";

const FIRE_GRAD = `linear-gradient(135deg, ${ACCENT_HOT} 0%, ${ACCENT} 50%, ${ACCENT_DEEP} 100%)`;

// Olive — PNW grounding tone. Forest + rooted-here vibe.
const OLIVE = "#84cc16";       // lime-500 — brighter sage (was 600/#65a30d)
const OLIVE_DEEP = "#4d7c0f";  // olive-700 — darker tone for cream bg
const OLIVE_DIM = "rgba(132, 204, 22, 0.22)";

// Sky — Strait of Juan de Fuca + Olympic sky. Third color so the page
// isn't copper-vs-olive only. Used sparingly: route map water, stat
// numbers, accent glows on the route map.
const SKY = "#38bdf8";          // sky-400 — Olympic sky
const SKY_DEEP = "#0284c7";     // sky-600 — for cream-bg
const SKY_DIM = "rgba(56, 189, 248, 0.18)";

const FONT_HEAD = "'Space Grotesk', sans-serif";
const FONT_BODY = "'Inter', sans-serif";
// Humanist serif for founder quote + handwritten-feel "Est. 1985"
// callouts. Adds generational warmth that a single sans pair can't.
const FONT_SERIF = "'Cormorant Garamond', Georgia, serif";

/* ───────────────────────── ANIMATION ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 22 };
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: spring },
};

/* ───────────────────────── DATA ───────────────────────── */

const SERVICES = [
  {
    icon: <Path size={22} weight="fill" />,
    title: "Asphalt Paving",
    body: "Residential driveways, commercial parking lots, private roads, HOA shared access. Hot-mix asphalt installed and compacted to spec. We do the sub-grade work ourselves so the surface lasts.",
    bullets: ["Driveways", "Parking lots", "Private roads", "HOA shared access"],
  },
  {
    icon: <Drop size={22} weight="fill" />,
    title: "Seal Coating",
    body: "Asphalt seal coating to protect against UV, water intrusion, oil, and Pacific Northwest winters. Recommended every 3-5 years. Doubles surface life when done on schedule.",
    bullets: [
      "UV + weather protection",
      "Oil + chemical resistance",
      "3-5 year cycle",
      "Restores black finish",
    ],
  },
  {
    icon: <Crosshair size={22} weight="fill" />,
    title: "Line Striping",
    body: "Parking lot striping, ADA stalls, fire lanes, directional arrows, custom curb painting. Crisp lines that read clearly from across the lot — and stay crisp through Peninsula winters.",
    bullets: [
      "Parking stalls",
      "ADA compliance",
      "Fire lanes + arrows",
      "Custom curb paint",
    ],
  },
  {
    icon: <Mountains size={22} weight="fill" />,
    title: "Excavation & Grading",
    body: "Site prep, sub-grade compaction, drainage, French drains, final grade for paving or building pads. The work most contractors subcontract — we own.",
    bullets: ["Site prep", "Drainage", "French drains", "Final grade"],
  },
  {
    icon: <Hammer size={22} weight="fill" />,
    title: "Demolition & Removal",
    body: "Asphalt removal, concrete demolition, hauling, site cleanup before a fresh install. One crew, one timeline — no waiting on a second contractor.",
    bullets: [
      "Asphalt removal",
      "Concrete demo",
      "Hauling + disposal",
      "Site cleanup",
    ],
  },
  {
    icon: <Wrench size={22} weight="fill" />,
    title: "Crack + Pothole Repair",
    body: "Sealant on cracks before they spider. Hot patch on potholes before they swallow tires. Cheap fixes today; expensive replacement avoided next year.",
    bullets: ["Crack sealing", "Pothole patch", "Edge repair", "Surface restoration"],
  },
];

const PROCESS_STEPS = [
  {
    n: "01",
    icon: <Phone size={20} weight="fill" />,
    title: "Site Walk",
    body: "We come out, measure the area, look at the sub-grade + drainage, ask what you want the finished surface to do for you.",
  },
  {
    n: "02",
    icon: <ClipboardText size={20} weight="fill" />,
    title: "Honest Estimate",
    body: "Plain-language quote. Real square footage, real ton counts, real labor. No mystery line items. Usually back to you inside the week.",
  },
  {
    n: "03",
    icon: <Clock size={20} weight="fill" />,
    title: "Schedule",
    body: "Paving is a weather game. We pick a window that gives the mix room to set right — and tell you the truth if the forecast shifts.",
  },
  {
    n: "04",
    icon: <Truck size={20} weight="fill" />,
    title: "Build",
    body: "Excavation, sub-base, compaction, paving, finish work — all by our own crew. We're the ones on site, not a sub.",
  },
  {
    n: "05",
    icon: <CheckCircle size={20} weight="fill" />,
    title: "Cure + Walk-Through",
    body: "We walk the finished surface with you, mark the cure window, and tell you exactly when it's safe to drive on, park heavy, or seal.",
  },
];

const WHY_US = [
  {
    icon: <Mountains size={26} weight="fill" />,
    title: "Built for Pacific Northwest Weather",
    body: "Olympic Peninsula winters are brutal on cheap asphalt. We sub-grade and compact for OUR weather, not somewhere it never freezes.",
  },
  {
    icon: <HandWaving size={26} weight="fill" />,
    title: "Family-Owned, 41 Years",
    body: "Founded by Cyril & Ella Frick in 1985. Same family answering the phone today. Most of our work comes from people the last work was done for.",
  },
  {
    icon: <Truck size={26} weight="fill" />,
    title: "One Crew, Start to Finish",
    body: "Excavation, paving, striping — all in-house. No waiting on a subcontractor. No finger-pointing if something needs a fix.",
  },
  {
    icon: <ShieldCheck size={26} weight="fill" />,
    title: "Plain Estimates, No Surprises",
    body: "Real square footage, real ton counts, real labor. If the scope changes we tell you before the work happens, not after.",
  },
];

// Asphalt cross-section layer data — 4 build layers + sealcoat +
// stripes. Each layer renders as a horizontal band in the cutaway
// SVG with a label pointer. The voice is plain-talk technical so it
// reads like the foreman walking you through the spec, not a brochure.
const ASPHALT_LAYERS = [
  {
    name: "Line Striping",
    spec: "Commercial traffic paint &middot; ADA + fire-lane compliant",
    color: "#f8fafc",
    height: 4,
  },
  {
    name: "Seal Coat",
    spec: "UV + water seal &middot; refresh every 3-5 years",
    color: "#1c1917",
    height: 10,
  },
  {
    name: "Wearing Course",
    spec: "Fine-mix asphalt &middot; the smooth surface you drive on",
    color: "#0c0a09",
    height: 30,
  },
  {
    name: "Binder Course",
    spec: "Hot-mix binder &middot; structural strength",
    color: "#1c1917",
    height: 36,
  },
  {
    name: "Aggregate Base",
    spec: "4-6\" crushed rock &middot; drains water away from asphalt",
    color: "#57534e",
    height: 60,
  },
  {
    name: "Compacted Sub-grade",
    spec: "Native soil compacted to spec &middot; the foundation everything sits on",
    color: "#44403c",
    height: 80,
  },
];

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
    <div className={`max-w-3xl ${alignClass} mb-10 sm:mb-12`}>
      {eyebrow && (
        <div
          className="inline-flex items-center gap-3 text-[11px] tracking-[0.28em] uppercase font-semibold mb-5"
          style={{ color: ACCENT, fontFamily: FONT_HEAD }}
        >
          <span
            className="inline-block w-8 h-px"
            style={{ background: ACCENT }}
          />
          {eyebrow}
          <span
            className="inline-block w-8 h-px"
            style={{ background: ACCENT }}
          />
        </div>
      )}
      <h2
        className="text-[32px] sm:text-[44px] lg:text-[54px] font-bold tracking-tight leading-[1.05] text-white"
        style={{ fontFamily: FONT_HEAD }}
      >
        {title}
        {highlight && (
          <>
            {" "}
            <span style={{ color: ACCENT }}>{highlight}</span>
          </>
        )}
      </h2>
      {subtitle && (
        <p
          className="mt-4 sm:mt-5 text-[16px] sm:text-[18px] leading-relaxed max-w-2xl"
          style={{
            color: INK_SOFT,
            fontFamily: FONT_BODY,
            ...(align === "center"
              ? { marginLeft: "auto", marginRight: "auto" }
              : {}),
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function HeroPill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-2 text-[13px] sm:text-[14px] font-semibold text-white/85"
      style={{ fontFamily: FONT_HEAD }}
    >
      <span style={{ color: ACCENT }}>{icon}</span>
      {label}
    </span>
  );
}

function TrustBadge({
  icon,
  label,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
}) {
  return (
    <div className="flex items-center gap-3.5 sm:gap-4">
      <span
        className="shrink-0 flex items-center justify-center w-11 h-11 rounded-md"
        style={{
          background: ACCENT_DIM_2,
          color: ACCENT,
          border: `1px solid ${ACCENT_DIM}`,
        }}
      >
        {icon}
      </span>
      <div className="leading-tight">
        <div
          className="text-[13px] sm:text-[14px] font-bold uppercase tracking-wide text-white"
          style={{ fontFamily: FONT_HEAD }}
        >
          {label}
        </div>
        {sublabel && (
          <div
            className="text-[11px] sm:text-[12px] uppercase tracking-[0.18em] mt-0.5"
            style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
          >
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  body,
  bullets,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  bullets: string[];
  index: number;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border transition-all hover:-translate-y-1 hover:border-white/15"
      style={{
        background: BG_PANEL,
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Decorative number in corner — bumped visibility so the
          numbering reads as intentional, not invisible. */}
      <span
        className="absolute top-5 right-5 text-[72px] font-bold leading-none pointer-events-none select-none"
        style={{
          color: ACCENT,
          opacity: 0.18,
          fontFamily: FONT_HEAD,
          fontStyle: "italic",
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="relative p-7 sm:p-8">
        <span
          className="inline-flex items-center justify-center w-12 h-12 rounded-md shadow-lg mb-5"
          style={{
            background: FIRE_GRAD,
            color: "#0a0a0a",
            boxShadow: "0 4px 14px rgba(234, 88, 12, 0.4)",
          }}
        >
          {icon}
        </span>
        <h3
          className="text-[20px] sm:text-[22px] font-bold text-white tracking-tight mb-3 leading-snug"
          style={{ fontFamily: FONT_HEAD }}
        >
          {title}
        </h3>
        <p
          className="text-[14px] sm:text-[15px] leading-relaxed mb-5"
          style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
        >
          {body}
        </p>
        <ul className="space-y-2">
          {bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-2 text-[13px]"
              style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
            >
              <CheckCircle
                size={14}
                weight="fill"
                style={{ color: ACCENT, marginTop: 4 }}
                className="shrink-0"
              />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ───────────────────────── HERO ILLUSTRATION ─────────────────────────
 * SVG: a freshly-paved asphalt driveway curving toward a silhouetted
 * Olympic Mountain range under a copper sunset. The OUTCOME — exactly
 * what the Meyer Electric reference rule requires for the hero above
 * the fold ("hero image shows the OUTCOME, not the trade-person at
 * work").
 */
function OlympicHeroIllustration() {
  return (
    <svg
      viewBox="0 0 800 600"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Sunset sky gradient */}
        <linearGradient id="pp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a0f08" />
          <stop offset="40%" stopColor="#2a1810" />
          <stop offset="70%" stopColor="#7c2d12" stopOpacity="0.8" />
          <stop offset="90%" stopColor="#ea580c" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0.25" />
        </linearGradient>
        {/* Sun glow */}
        <radialGradient id="pp-sun" cx="60%" cy="62%" r="22%">
          <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#fb923c" stopOpacity="0.7" />
          <stop offset="70%" stopColor="#ea580c" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
        </radialGradient>
        {/* Asphalt gradient */}
        <linearGradient id="pp-asphalt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1917" />
          <stop offset="50%" stopColor="#0c0a09" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
        {/* Mountain front-range */}
        <linearGradient id="pp-mtn-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1917" />
          <stop offset="100%" stopColor="#0c0a09" />
        </linearGradient>
        {/* Mountain back-range (Olympics silhouette) */}
        <linearGradient id="pp-mtn-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#44403c" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#1c1917" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width="800" height="380" fill="url(#pp-sky)" />
      {/* Sun glow */}
      <circle cx="480" cy="320" r="180" fill="url(#pp-sun)" />

      {/* Olympic Mountains — back range (Mt. Constance / The Brothers vibe) */}
      <path
        d="M0,330 L80,260 L140,290 L200,210 L260,250 L310,200 L370,240 L430,180 L500,230 L560,210 L630,260 L700,220 L770,250 L800,240 L800,380 L0,380 Z"
        fill="url(#pp-mtn-back)"
      />
      {/* Front range — closer, darker */}
      <path
        d="M0,360 L60,320 L130,345 L180,310 L240,335 L310,300 L380,330 L450,295 L520,325 L590,305 L670,335 L730,315 L800,330 L800,400 L0,400 Z"
        fill="url(#pp-mtn-front)"
      />

      {/* Tree line silhouette */}
      <g fill="#000000" opacity="0.6">
        {Array.from({ length: 24 }).map((_, i) => {
          const x = i * 36 - 10;
          const h = 16 + ((i * 7) % 14);
          return (
            <polygon
              key={i}
              points={`${x},395 ${x + 6},${395 - h} ${x + 12},395`}
            />
          );
        })}
      </g>

      {/* Asphalt — freshly-paved driveway, perspective trapezoid.
          Wide foreground (200 → 700 at y=600), narrow vanishing point
          centered at (400, 400) where it meets the mountain foothills.
          Centerline runs straight up the middle at x=400, so the
          center stripes below sit ON the road (not floating off it). */}
      <path
        d="M 200,600 L 700,600 L 430,400 L 370,400 Z"
        fill="url(#pp-asphalt)"
      />

      {/* Glossy wet-asphalt highlight — narrower trapezoid inset on the
          left half, reads as sunset reflecting off the surface. */}
      <path
        d="M 220,600 L 480,600 L 410,420 L 380,420 Z"
        fill="#1c1917"
        opacity="0.55"
      />

      {/* Warm sunset glow on the right edge of the road */}
      <path
        d="M 700,600 L 660,600 L 415,410 L 430,400 Z"
        fill={ACCENT}
        opacity="0.16"
      />

      {/* Center line dashed stripes — bright white, perspective-tapered.
          Centerline of road is at x=400 (geometric center of trapezoid),
          stripes get narrower toward the vanishing point. */}
      <g fill="#f8fafc">
        {/* Stripe 1 — foreground (closest, biggest) */}
        <polygon points="386,600 414,600 408,560 392,560" opacity="0.95" />
        {/* Stripe 2 */}
        <polygon points="393,540 407,540 405,500 395,500" opacity="0.9" />
        {/* Stripe 3 */}
        <polygon points="396,480 404,480 403,450 397,450" opacity="0.85" />
        {/* Stripe 4 */}
        <polygon points="397.5,440 402.5,440 402,420 398,420" opacity="0.7" />
        {/* Stripe 5 (vanishing) */}
        <polygon points="398.5,415 401.5,415 401.2,405 398.8,405" opacity="0.5" />
      </g>

      {/* Solid white edge stripes — parallel to the road sides */}
      <g fill="#f8fafc">
        {/* Left edge stripe */}
        <polygon
          points="200,600 215,600 378,400 372,400"
          opacity="0.85"
        />
        {/* Right edge stripe */}
        <polygon
          points="685,600 700,600 428,400 422,400"
          opacity="0.85"
        />
      </g>

      {/* Subtle copper sunset wash on the asphalt — reads as PNW
          golden-hour light kissing the road surface. */}
      <path
        d="M 200,600 L 700,600 L 430,400 L 370,400 Z"
        fill={ACCENT}
        opacity="0.06"
      />
    </svg>
  );
}

/* ───────────────────────── ASPHALT CROSS-SECTION ─────────────────────────
 * Bespoke labeled cutaway showing the 6 layers we install. The whole
 * point: most paving sites show finished surfaces. We show what's
 * underneath — the part that determines whether the driveway lasts
 * 5 years or 25. Educational diagram that doubles as a trust signal.
 */
function AsphaltCrossSection() {
  // Compute cumulative y-offsets for each band so labels line up.
  let cumY = 60; // start below sky/header
  const bands = ASPHALT_LAYERS.map((l) => {
    const band = { ...l, y: cumY };
    cumY += l.height;
    return band;
  });
  const totalH = cumY + 40; // padding at bottom

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 900 ${totalH}`}
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Cutaway diagram of the six layers in a 25-year asphalt driveway"
      >
        <defs>
          <linearGradient id="pp-xsec-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a0f08" />
            <stop offset="100%" stopColor="#2a1810" />
          </linearGradient>
          <pattern id="pp-xsec-aggregate" width="14" height="14" patternUnits="userSpaceOnUse">
            <rect width="14" height="14" fill="#57534e" />
            <circle cx="3" cy="4" r="1.8" fill="#78716c" />
            <circle cx="10" cy="7" r="2.2" fill="#a8a29e" />
            <circle cx="5" cy="11" r="1.4" fill="#78716c" />
            <circle cx="12" cy="12" r="1.6" fill="#a8a29e" />
          </pattern>
          <pattern id="pp-xsec-subgrade" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#44403c" />
            <path d="M0 5 L20 4 M0 12 L20 11 M0 18 L20 17" stroke="#57534e" strokeWidth="0.6" />
            <circle cx="5" cy="8" r="0.6" fill="#78716c" />
            <circle cx="14" cy="15" r="0.5" fill="#78716c" />
          </pattern>
          <linearGradient id="pp-xsec-binder" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1c1917" />
            <stop offset="100%" stopColor="#0c0a09" />
          </linearGradient>
          <linearGradient id="pp-xsec-wear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c0a09" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
        </defs>

        {/* Sky strip (0 → 60) */}
        <rect x="0" y="0" width="900" height="60" fill="url(#pp-xsec-sky)" />
        {/* Sun glow */}
        <circle cx="750" cy="65" r="40" fill="#fb923c" opacity="0.18" />
        <circle cx="750" cy="65" r="22" fill="#fed7aa" opacity="0.3" />

        {/* Stylized roller silhouette on top of the wearing course */}
        <g transform="translate(140, 22)">
          <rect x="0" y="6" width="60" height="28" rx="3" fill={ACCENT_DEEP} />
          <rect x="6" y="0" width="48" height="10" rx="2" fill={ACCENT} />
          <circle cx="14" cy="38" r="10" fill="#1c1917" stroke={ACCENT} strokeWidth="1.5" />
          <circle cx="14" cy="38" r="3" fill={ACCENT} />
          <circle cx="46" cy="38" r="10" fill="#1c1917" stroke={ACCENT} strokeWidth="1.5" />
          <circle cx="46" cy="38" r="3" fill={ACCENT} />
        </g>

        {/* Each layer band + label */}
        {bands.map((b, i) => {
          let fill: string = b.color;
          if (b.name === "Aggregate Base") fill = "url(#pp-xsec-aggregate)";
          else if (b.name === "Compacted Sub-grade") fill = "url(#pp-xsec-subgrade)";
          else if (b.name === "Binder Course") fill = "url(#pp-xsec-binder)";
          else if (b.name === "Wearing Course") fill = "url(#pp-xsec-wear)";

          const labelX = i % 2 === 0 ? 870 : 30;
          const labelAnchor: "start" | "end" = i % 2 === 0 ? "end" : "start";
          const lineX1 = i % 2 === 0 ? 870 : 30;
          const lineX2 = i % 2 === 0 ? 700 : 200;
          const midY = b.y + b.height / 2;

          return (
            <g key={b.name}>
              {/* Layer fill */}
              <rect x="0" y={b.y} width="900" height={b.height} fill={fill} />
              {/* Top edge highlight (for "Line Striping" white only) */}
              {b.name === "Line Striping" && (
                <>
                  <rect x="200" y={b.y + 1} width="60" height="2" fill="#f8fafc" />
                  <rect x="320" y={b.y + 1} width="60" height="2" fill="#f8fafc" />
                  <rect x="440" y={b.y + 1} width="60" height="2" fill={ACCENT} />
                  <rect x="560" y={b.y + 1} width="60" height="2" fill="#f8fafc" />
                  <rect x="680" y={b.y + 1} width="60" height="2" fill="#f8fafc" />
                </>
              )}
              {/* Sealcoat sheen highlight */}
              {b.name === "Seal Coat" && (
                <rect x="0" y={b.y} width="900" height="2" fill={ACCENT_DEEP} opacity="0.5" />
              )}

              {/* Label pointer line */}
              <line
                x1={lineX1}
                y1={midY}
                x2={lineX2}
                y2={midY}
                stroke={ACCENT}
                strokeWidth="1"
                strokeDasharray="2 3"
                opacity="0.65"
              />
              {/* Label dot */}
              <circle cx={lineX2} cy={midY} r="3" fill={ACCENT} />

              {/* Label text — bumped contrast for readability */}
              <text
                x={labelX}
                y={midY - 4}
                textAnchor={labelAnchor}
                fontSize="15"
                fontWeight="700"
                fill="#ffffff"
                fontFamily={FONT_HEAD}
              >
                {b.name}
              </text>
              <text
                x={labelX}
                y={midY + 13}
                textAnchor={labelAnchor}
                fontSize="12"
                fill="rgba(248, 250, 252, 0.85)"
                fontFamily={FONT_HEAD}
                dangerouslySetInnerHTML={{ __html: b.spec.replace(/&middot;/g, "·") }}
              />
            </g>
          );
        })}

        {/* Bottom "you are here" marker */}
        <g transform={`translate(450, ${totalH - 28})`}>
          <line x1="0" y1="-200" x2="0" y2="-4" stroke={OLIVE} strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />
          <text
            x="0"
            y="0"
            textAnchor="middle"
            fontSize="11"
            fill={OLIVE}
            fontFamily={FONT_HEAD}
            fontWeight="700"
            letterSpacing="0.18em"
          >
            FROM 8&quot; DOWN, EVERYTHING WE DO
          </text>
        </g>
      </svg>
    </div>
  );
}

/* ───────────────────────── PENINSULA ROUTE MAP ─────────────────────────
 * Hand-drawn-feeling Olympic Peninsula coastline with Hwy 101 as the
 * spine and the 12 cities we serve pinned along it. Replaces the
 * abstract compass-rose. The Strait of Juan de Fuca + Hood Canal
 * silhouettes + Olympic Mountains glyph anchor it as PNW-specific.
 */
function PeninsulaRouteMap() {
  // Approximate normalized positions for each city along the highway
  // route. Coordinates in viewBox space (0-900 wide × 0-520 tall).
  const cities: Array<{ name: string; x: number; y: number; major?: boolean }> = [
    { name: "Sequim", x: 560, y: 235, major: true },
    { name: "Carlsborg", x: 510, y: 245 },
    { name: "Dungeness", x: 570, y: 195 },
    { name: "Diamond Point", x: 620, y: 240 },
    { name: "Blyn", x: 640, y: 270 },
    { name: "Gardiner", x: 670, y: 245 },
    { name: "Port Townsend", x: 760, y: 230, major: true },
    { name: "Chimacum", x: 740, y: 290 },
    { name: "Quilcene", x: 700, y: 360 },
    { name: "Port Angeles", x: 410, y: 230, major: true },
    { name: "Joyce", x: 290, y: 220 },
    { name: "Forks", x: 130, y: 320, major: true },
  ];

  return (
    <div
      className="relative rounded-2xl overflow-hidden border"
      style={{
        background: `radial-gradient(circle at 50% 30%, rgba(101, 163, 13, 0.06) 0%, rgba(10, 10, 10, 0) 60%), linear-gradient(180deg, ${BG_PANEL} 0%, ${BG} 100%)`,
        borderColor: "rgba(255, 255, 255, 0.08)",
        boxShadow: "0 24px 70px rgba(0, 0, 0, 0.55)",
      }}
    >
      <svg
        viewBox="0 0 900 520"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Hand-drawn map of the Olympic Peninsula with the 12 cities Peninsula Paving serves"
      >
        <defs>
          <pattern id="pp-map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={ACCENT} strokeWidth="0.4" />
          </pattern>
          {/* Sky-blue water gradient — Strait of Juan de Fuca + Hood Canal
              read as PNW saltwater, not dead-black gap. Third color in
              the palette earns its keep here. */}
          <linearGradient id="pp-map-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c4a6e" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#075985" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0c1f1a" stopOpacity="0.7" />
          </linearGradient>
          {/* Wave detail pattern */}
          <pattern id="pp-map-waves" width="40" height="8" patternUnits="userSpaceOnUse">
            <path d="M0 4 Q10 1 20 4 T40 4" fill="none" stroke={SKY} strokeWidth="0.5" opacity="0.4" />
          </pattern>
        </defs>

        {/* Subtle grid */}
        <rect width="900" height="520" fill="url(#pp-map-grid)" opacity="0.25" />

        {/* Strait of Juan de Fuca — water mass north of the peninsula */}
        <path
          d="M0,0 L900,0 L900,170 Q780,150 670,160 Q540,168 410,172 Q280,180 130,168 Q60,158 0,160 Z"
          fill="url(#pp-map-water)"
        />
        {/* Wave overlay */}
        <path
          d="M0,0 L900,0 L900,170 Q780,150 670,160 Q540,168 410,172 Q280,180 130,168 Q60,158 0,160 Z"
          fill="url(#pp-map-waves)"
          opacity="0.7"
        />
        {/* Hood Canal (east side water) */}
        <path
          d="M870,170 L900,170 L900,520 L800,520 Q760,440 740,370 Q720,310 760,250 Q800,200 870,170 Z"
          fill="url(#pp-map-water)"
          opacity="0.85"
        />
        {/* Water labels */}
        <text x="450" y="90" textAnchor="middle" fontSize="11" fontStyle="italic" fill={SKY} fontFamily={FONT_SERIF} letterSpacing="0.3em" opacity="0.8">
          STRAIT OF JUAN DE FUCA
        </text>
        <text x="845" y="340" textAnchor="middle" fontSize="9" fontStyle="italic" fill={SKY} fontFamily={FONT_SERIF} letterSpacing="0.25em" opacity="0.7" transform="rotate(90 845 340)">
          HOOD CANAL
        </text>

        {/* Peninsula landmass — rough hand-drawn coast outline */}
        <path
          d="M0,168 Q60,162 130,168 Q260,176 410,172 Q540,168 670,160 Q780,150 870,170 Q800,205 765,250 Q725,310 740,370 Q760,440 800,520 L0,520 Z"
          fill="#0c0a09"
          stroke="rgba(234, 88, 12, 0.18)"
          strokeWidth="0.8"
        />

        {/* Olympic Mountains glyph — south-central */}
        <g opacity="0.55">
          <path
            d="M180,420 L240,360 L290,395 L350,335 L410,380 L470,330 L530,375 L590,355 L650,400 L660,420 Z"
            fill="rgba(255, 255, 255, 0.05)"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="0.8"
          />
          <text
            x="420"
            y="465"
            textAnchor="middle"
            fontSize="9"
            fill="rgba(255, 255, 255, 0.35)"
            fontFamily={FONT_SERIF}
            fontStyle="italic"
            letterSpacing="0.2em"
          >
            OLYMPIC MOUNTAINS
          </text>
        </g>

        {/* Hwy 101 — the loop from Sequim around to Forks */}
        <path
          d="M130,320 Q220,260 290,220 Q350,205 410,230 Q470,250 510,245 Q535,243 560,235 Q595,225 620,240 Q635,250 640,270 Q655,255 670,245 Q715,235 760,230 Q745,260 740,290 Q720,325 700,360"
          fill="none"
          stroke={ACCENT}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Hwy 101 highlight glow */}
        <path
          d="M130,320 Q220,260 290,220 Q350,205 410,230 Q470,250 510,245 Q535,243 560,235 Q595,225 620,240 Q635,250 640,270 Q655,255 670,245 Q715,235 760,230"
          fill="none"
          stroke={ACCENT_HOT}
          strokeWidth="0.6"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Highway shield label */}
        <g transform="translate(330, 250)">
          <rect
            x="-14"
            y="-10"
            width="28"
            height="20"
            rx="3"
            fill={BG_PANEL}
            stroke={ACCENT}
            strokeWidth="1"
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill={ACCENT}
            fontFamily={FONT_HEAD}
          >
            101
          </text>
        </g>

        {/* City pins — bumped contrast: major labels white, minor 0.9 */}
        {cities.map((c) => (
          <g key={c.name} transform={`translate(${c.x}, ${c.y})`}>
            {/* Pin shadow */}
            <ellipse cx="0" cy="3" rx={c.major ? 6 : 4} ry="1.5" fill="rgba(0,0,0,0.55)" />
            {/* Outer halo */}
            <circle cx="0" cy="0" r={c.major ? 10 : 7} fill={ACCENT_DIM} />
            {/* Inner dot */}
            <circle
              cx="0"
              cy="0"
              r={c.major ? 5 : 3.5}
              fill={ACCENT}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            {/* Label with text shadow for readability over any bg */}
            <text
              x="0"
              y={c.major ? -15 : -11}
              textAnchor="middle"
              fontSize={c.major ? 13 : 11}
              fontWeight={c.major ? 700 : 600}
              fill="#ffffff"
              opacity={c.major ? 1 : 0.92}
              fontFamily={FONT_HEAD}
              letterSpacing="0.04em"
              style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.6)", strokeWidth: "3px", strokeLinejoin: "round" }}
            >
              {c.name}
            </text>
          </g>
        ))}

        {/* Compass rose — small, lower-left, replaces the giant one */}
        <g transform="translate(60, 470)" opacity="0.85">
          <circle cx="0" cy="0" r="22" fill="none" stroke={ACCENT} strokeWidth="0.6" opacity="0.5" />
          <polygon points="0,-22 -4,0 0,-3 4,0" fill={ACCENT} />
          <text
            x="0"
            y="-26"
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill={ACCENT}
            fontFamily={FONT_HEAD}
          >
            N
          </text>
        </g>

        {/* Mile annotation */}
        <text
          x="850"
          y="495"
          textAnchor="end"
          fontSize="10"
          fontStyle="italic"
          fill={OLIVE}
          fontFamily={FONT_SERIF}
          letterSpacing="0.1em"
        >
          ~ 110 miles Sequim &mdash;&gt; Forks
        </text>
      </svg>

      {/* City chip list — sits below the dark map on the cream section.
          Cream-toned chips with copper pins so they tie to the section's
          warm light palette. */}
      <div
        className="px-5 sm:px-7 py-5 border-t"
        style={{
          borderColor: "rgba(255, 255, 255, 0.08)",
          background: "rgba(245, 239, 230, 0.03)",
        }}
      >
        <div className="flex flex-wrap gap-1.5">
          {BUSINESS.serviceArea.map((city) => (
            <span
              key={city}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-semibold"
              style={{
                background: "rgba(245, 239, 230, 0.95)",
                color: INK_DARK,
                border: `1px solid rgba(234, 88, 12, 0.3)`,
                fontFamily: FONT_HEAD,
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.25)",
              }}
            >
              <MapPin size={11} weight="fill" style={{ color: ACCENT_DEEP }} />
              {city}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── COMPASS ROSE (Olympic Peninsula map art) ───────────────────────── */
function CompassRose({ size = 280 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="pp-compass-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ea580c" stopOpacity="0.18" />
          <stop offset="60%" stopColor="#ea580c" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#pp-compass-bg)" />
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="none"
        stroke={ACCENT}
        strokeWidth="1"
        opacity="0.4"
      />
      <circle
        cx="100"
        cy="100"
        r="55"
        fill="none"
        stroke={ACCENT}
        strokeWidth="1"
        opacity="0.25"
      />
      {/* 8 directional spokes */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="100"
          y1="100"
          x2="100"
          y2="20"
          stroke={ACCENT}
          strokeWidth="0.5"
          opacity="0.35"
          transform={`rotate(${deg} 100 100)`}
        />
      ))}
      {/* N arrow */}
      <polygon points="100,25 92,55 100,48 108,55" fill={ACCENT} />
      <polygon
        points="100,175 92,145 100,152 108,145"
        fill={ACCENT}
        opacity="0.5"
      />
      <text
        x="100"
        y="18"
        textAnchor="middle"
        fontSize="11"
        fontWeight="bold"
        fill={ACCENT}
        fontFamily={FONT_HEAD}
      >
        N
      </text>
      <text
        x="100"
        y="194"
        textAnchor="middle"
        fontSize="9"
        fontWeight="bold"
        fill={ACCENT}
        opacity="0.55"
        fontFamily={FONT_HEAD}
      >
        S
      </text>
      <text
        x="14"
        y="103"
        textAnchor="start"
        fontSize="9"
        fontWeight="bold"
        fill={ACCENT}
        opacity="0.55"
        fontFamily={FONT_HEAD}
      >
        W
      </text>
      <text
        x="186"
        y="103"
        textAnchor="end"
        fontSize="9"
        fontWeight="bold"
        fill={ACCENT}
        opacity="0.55"
        fontFamily={FONT_HEAD}
      >
        E
      </text>
      {/* Center dot */}
      <circle cx="100" cy="100" r="4" fill={ACCENT} />
      <circle cx="100" cy="100" r="9" fill="none" stroke={ACCENT} strokeWidth="1" />
    </svg>
  );
}

/* ───────────────────────── PAGE ───────────────────────── */

export default function PeninsulaPavingPage() {
  return (
    <MotionConfig reducedMotion="never">
      <main
        id="top"
        className="min-h-screen"
        style={{
          background: BG,
          color: INK,
          fontFamily: FONT_BODY,
        }}
      >
        <StickyNav />

        {/* ───────────────── HERO ───────────────── */}
        <section
          className="relative overflow-hidden"
          style={{ background: BG }}
        >
          {/* Illustrated hero background (asphalt driveway → Olympics) */}
          <div className="absolute inset-0 pointer-events-none">
            <OlympicHeroIllustration />
            {/* Left-side legibility gradient over the illustration */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(10,10,10,0.94) 0%, rgba(10,10,10,0.78) 38%, rgba(10,10,10,0.35) 70%, rgba(10,10,10,0.15) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0) 28%, rgba(10,10,10,0) 70%, rgba(10,10,10,0.5) 100%)",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-12 sm:py-16 lg:py-24">
            <div className="max-w-2xl">
              <motion.div
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] mb-5"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(234, 88, 12, 0.14) 0%, rgba(251, 146, 60, 0.10) 100%)",
                  border: `1px solid ${ACCENT_DIM}`,
                  color: ACCENT,
                  fontFamily: FONT_HEAD,
                }}
              >
                <Mountains
                  size={13}
                  weight="fill"
                  style={{ color: ACCENT_HOT }}
                />
                Olympic Peninsula · Since 1985
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.05 }}
                className="text-[44px] sm:text-[64px] lg:text-[80px] font-bold leading-[0.98] tracking-tight text-white"
                style={{ fontFamily: FONT_HEAD }}
              >
                DRIVEWAYS BUILT
                <br />
                TO <span style={{ color: ACCENT }}>OUTLAST</span> THE
                <br />
                PACIFIC NORTHWEST.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.15 }}
                className="mt-5 sm:mt-6 text-[17px] sm:text-[19px] leading-relaxed max-w-xl"
                style={{
                  color: INK_SOFT,
                  fontFamily: FONT_BODY,
                  textShadow: "0 1px 8px rgba(0,0,0,0.6)",
                }}
              >
                {BUSINESS.yearsInBusiness} years paving driveways, parking lots,
                and roads from Sequim to Forks. Family-owned. One crew handles
                excavation through striping — so the surface holds up through
                the rain, the freeze, and the next decade.
              </motion.p>

              {/* Trust pills — believability markers above fold */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.25 }}
                className="mt-6 flex flex-wrap gap-x-6 gap-y-3"
              >
                <HeroPill
                  icon={<Clock size={16} weight="fill" />}
                  label="41 Years Family-Owned"
                />
                <HeroPill
                  icon={<Compass size={16} weight="fill" />}
                  label="Sequim to Forks"
                />
                <HeroPill
                  icon={<Truck size={16} weight="fill" />}
                  label="One Crew, Start to Finish"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.35 }}
                className="mt-7 flex flex-col sm:flex-row gap-3"
              >
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 px-7 h-14 rounded-md font-bold uppercase tracking-wide text-[14px] text-black transition-all hover:brightness-110 active:scale-[0.97] shadow-[0_4px_24px_rgba(234,88,12,0.45)]"
                  style={{ background: FIRE_GRAD, fontFamily: FONT_HEAD }}
                >
                  Get a Free Estimate
                  <ArrowRight size={16} weight="bold" />
                </a>
                <a
                  href={BUSINESS.phoneHref}
                  className="inline-flex items-center justify-center gap-2 px-7 h-14 rounded-md font-bold uppercase tracking-wide text-[14px] text-white border-2 transition-all hover:bg-white/[0.06] active:scale-[0.97]"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    fontFamily: FONT_HEAD,
                  }}
                >
                  <Phone size={16} weight="fill" style={{ color: ACCENT_HOT }} />
                  {BUSINESS.phoneDisplay}
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─────────────── TRUST STRIP ─────────────── */}
        <section
          className="border-y"
          style={{
            background: BG_ALT,
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-5 sm:py-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 items-center">
              <TrustBadge
                icon={<Clock size={22} weight="fill" />}
                label="Since 1985"
                sublabel="41 years on the Peninsula"
              />
              <TrustBadge
                icon={<HandWaving size={22} weight="fill" />}
                label="Family-Owned"
                sublabel="Cyril &amp; Ella Frick"
              />
              <TrustBadge
                icon={<Truck size={22} weight="fill" />}
                label="Excavation + Paving"
                sublabel="One in-house crew"
              />
            </div>
          </div>
        </section>

        {/* ─────────────── FRICK FAMILY FOUNDER BANNER ─────────────── */}
        {/* Bespoke replacement for the Meyer-pattern pulsing urgency strip.
            A two-column "letterpress" stripe: hand-drawn PP monogram +
            "Est. 1985 · Sequim, WA" on the left, founder narrative on the
            right. Olive grounds the row visually so the page doesn't read
            as a copper-only Meyer recolor. */}
        <section
          className="border-b relative overflow-hidden"
          style={{
            background:
              `linear-gradient(90deg, rgba(101, 163, 13, 0.05) 0%, rgba(234, 88, 12, 0.03) 50%, rgba(101, 163, 13, 0.05) 100%)`,
            borderTopColor: "rgba(255, 255, 255, 0.04)",
            borderBottomColor: "rgba(255, 255, 255, 0.06)",
            borderTopWidth: 1,
          }}
        >
          {/* Faint topo-line decoration */}
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern id="pp-founder-topo" width="120" height="30" patternUnits="userSpaceOnUse">
                <path d="M0 15 Q30 5 60 15 T120 15" fill="none" stroke={OLIVE} strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pp-founder-topo)" />
          </svg>

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-7 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-5 sm:gap-8">
              {/* Monogram + Est. block */}
              <div className="flex items-center gap-4 shrink-0">
                <div
                  className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full"
                  style={{
                    background: "rgba(10, 10, 10, 0.5)",
                    border: `1px solid ${OLIVE_DIM}`,
                    boxShadow: "inset 0 0 0 1px rgba(101, 163, 13, 0.25)",
                  }}
                >
                  <span
                    className="text-[22px] sm:text-[26px] font-bold tracking-tight"
                    style={{
                      color: ACCENT,
                      fontFamily: FONT_SERIF,
                      fontStyle: "italic",
                    }}
                  >
                    P&middot;P
                  </span>
                </div>
                <div className="leading-tight text-center sm:text-left">
                  <div
                    className="text-[12px] uppercase tracking-[0.28em] font-bold"
                    style={{ color: OLIVE, fontFamily: FONT_HEAD }}
                  >
                    Est. 1985
                  </div>
                  <div
                    className="text-[22px] sm:text-[24px] font-medium italic mt-0.5 text-white/90"
                    style={{ fontFamily: FONT_SERIF }}
                  >
                    The Frick Family
                  </div>
                  <div
                    className="text-[11px] uppercase tracking-[0.22em] mt-1"
                    style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
                  >
                    Sequim &middot; Olympic Peninsula
                  </div>
                </div>
              </div>

              {/* Separator on desktop */}
              <div
                className="hidden sm:block w-px self-stretch"
                style={{ background: "rgba(255, 255, 255, 0.08)" }}
              />

              {/* Narrative */}
              <div className="flex-1 text-center sm:text-left">
                <p
                  className="text-[15px] sm:text-[16px] leading-relaxed max-w-2xl mx-auto sm:mx-0"
                  style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                >
                  Cyril and Ella started Peninsula Paving with a single truck in
                  1985. Forty-one years later, the same family answers the
                  phone, walks every job site, and stands behind every square
                  foot we lay down.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────── SERVICES ─────────────── */}
        <section
          id="services"
          className="py-20 sm:py-24 lg:py-32 relative overflow-hidden"
          style={{ background: BG }}
        >
          {/* Subtle road-stripe pattern background */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${ACCENT} 0, ${ACCENT} 2px, transparent 2px, transparent 80px)`,
            }}
          />

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeader
              eyebrow="What We Do"
              title="The Full"
              highlight="Paving Stack."
              subtitle={`Driveways, parking lots, roads, seal coat, striping, excavation, demolition — six core services, one crew. We've done all six on the Olympic Peninsula since ${BUSINESS.established}.`}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {SERVICES.map((s, i) => (
                <ServiceCard
                  key={s.title}
                  icon={s.icon}
                  title={s.title}
                  body={s.body}
                  bullets={[...s.bullets]}
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────── PROCESS ─────────────── */}
        <section
          id="process"
          className="py-20 sm:py-24 lg:py-32"
          style={{ background: BG_ALT }}
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeader
              eyebrow="Our Process"
              title="From Phone Call to"
              highlight="Cured Surface."
              subtitle="Five steps. No surprise line items. No subcontractor shuffle. Same family running the job from the first walk to the final cure."
            />

            <div className="relative">
              {/* Connecting line */}
              <div
                className="hidden lg:block absolute top-[60px] left-[10%] right-[10%] h-px"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${ACCENT_DIM} 15%, ${ACCENT_DIM} 85%, transparent 100%)`,
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
                {PROCESS_STEPS.map((step) => (
                  <div
                    key={step.n}
                    className="relative flex flex-col items-center text-center"
                  >
                    <div
                      className="relative z-10 flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full mb-5"
                      style={{
                        background: BG,
                        border: `2px solid ${ACCENT}`,
                        boxShadow: `0 0 24px ${ACCENT_DIM}`,
                      }}
                    >
                      <div
                        className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full"
                        style={{ background: ACCENT, color: "#0a0a0a" }}
                      >
                        {step.icon}
                      </div>
                    </div>
                    <div
                      className="text-[11px] font-bold uppercase tracking-[0.22em] mb-2"
                      style={{ color: ACCENT, fontFamily: FONT_HEAD }}
                    >
                      Step {step.n}
                    </div>
                    <h3
                      className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight mb-2"
                      style={{ fontFamily: FONT_HEAD }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-[13px] sm:text-[14px] leading-relaxed max-w-[220px]"
                      style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                    >
                      {step.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────── WHY US ─────────────── */}
        <section
          id="why-us"
          className="py-20 sm:py-24 lg:py-32 relative overflow-hidden"
          style={{ background: BG }}
        >
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <SectionHeader
                  eyebrow="Why Peninsula"
                  title="The Peninsula Has Been"
                  highlight="Trusting Us Since 1985."
                  align="left"
                  subtitle={`Cyril and Ella Frick started Peninsula Paving in 1985. Since then it's stayed family-run, family-answered, and family-accountable. ${BUSINESS.yearsInBusiness} years of repeat customers and word-of-mouth referrals — that's the whole pitch.`}
                />

                <div className="space-y-5 mt-2">
                  {WHY_US.map((item) => (
                    <div
                      key={item.title}
                      className="flex gap-4 items-start"
                    >
                      <span
                        className="shrink-0 flex items-center justify-center w-12 h-12 rounded-md"
                        style={{
                          background: ACCENT_DIM_2,
                          color: ACCENT,
                          border: `1px solid ${ACCENT_DIM}`,
                        }}
                      >
                        {item.icon}
                      </span>
                      <div>
                        <h3
                          className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight mb-1.5 leading-snug"
                          style={{ fontFamily: FONT_HEAD }}
                        >
                          {item.title}
                        </h3>
                        <p
                          className="text-[14px] sm:text-[15px] leading-relaxed"
                          style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                        >
                          {item.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right visual — big stat cluster */}
              <div className="relative">
                <div
                  className="relative aspect-square rounded-2xl overflow-hidden p-8 sm:p-10"
                  style={{
                    background: `radial-gradient(circle at 50% 30%, ${ACCENT_DIM} 0%, rgba(10, 10, 10, 0) 60%), linear-gradient(180deg, ${BG_PANEL} 0%, ${BG} 100%)`,
                    border: `1px solid ${ACCENT_DIM}`,
                    boxShadow: "0 24px 70px rgba(0, 0, 0, 0.6)",
                  }}
                >
                  {/* Subtle grid pattern */}
                  <svg
                    className="absolute inset-0 w-full h-full opacity-[0.06]"
                    aria-hidden="true"
                  >
                    <defs>
                      <pattern
                        id="pp-stat-grid"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 40 0 L 0 0 0 40"
                          fill="none"
                          stroke={ACCENT}
                          strokeWidth="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#pp-stat-grid)" />
                  </svg>

                  <div className="relative h-full flex flex-col">
                    <div
                      className="text-[10px] font-bold uppercase tracking-[0.28em] mb-3"
                      style={{ color: ACCENT, fontFamily: FONT_HEAD }}
                    >
                      By the Numbers
                    </div>

                    <div className="grid grid-cols-2 gap-6 flex-1 content-center">
                      <Stat number="41" label="Years on the Peninsula" />
                      <Stat number="6" label="Core Services" />
                      <Stat number="12+" label="Cities Served" />
                      <Stat
                        number="1"
                        label="Family-Run Crew · Start to Finish"
                      />
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/10">
                      <div className="flex items-center gap-2.5">
                        <CompassRose size={48} />
                        <div>
                          <div
                            className="text-[13px] font-bold text-white"
                            style={{ fontFamily: FONT_HEAD }}
                          >
                            Sequim, WA
                          </div>
                          <div
                            className="text-[11px] tracking-[0.16em] uppercase"
                            style={{
                              color: INK_DIM,
                              fontFamily: FONT_HEAD,
                            }}
                          >
                            Olympic Peninsula
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────── SERVICE AREA — PENINSULA ROUTE MAP ─────────────── */}
        {/* WARM CREAM LIGHT SECTION — the only daylight breath on a
            mostly-dark page. Hand-drawn Peninsula route map reads
            like an NPS park guide on cream, dark text returns
            >12:1 contrast, and the section gives the eye a rest after
            ~6 dark sections in a row. Resolves Ben's "way too dark"
            complaint without losing the trade-dress weight. */}
        <section
          id="service-area"
          className="py-20 sm:py-24 lg:py-32 relative overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at top, ${BG_CREAM} 0%, ${BG_CREAM_ALT} 100%)`,
          }}
        >
          {/* Faint topo lines on the cream bg */}
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="pp-area-topo"
                width="200"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 40 Q50 20 100 40 T200 40 M0 60 Q50 40 100 60 T200 60"
                  fill="none"
                  stroke={OLIVE_DEEP}
                  strokeWidth="0.7"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pp-area-topo)" />
          </svg>

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
            {/* Light-theme section header (override the dark default) */}
            <div className="max-w-3xl text-center mx-auto mb-10 sm:mb-12">
              <div
                className="inline-flex items-center gap-3 text-[11px] tracking-[0.28em] uppercase font-semibold mb-5"
                style={{ color: ACCENT_DEEP, fontFamily: FONT_HEAD }}
              >
                <span
                  className="inline-block w-8 h-px"
                  style={{ background: ACCENT_DEEP }}
                />
                Service Area
                <span
                  className="inline-block w-8 h-px"
                  style={{ background: ACCENT_DEEP }}
                />
              </div>
              <h2
                className="text-[32px] sm:text-[44px] lg:text-[54px] font-bold tracking-tight leading-[1.05]"
                style={{ color: INK_DARK, fontFamily: FONT_HEAD }}
              >
                Every paved mile from{" "}
                <span style={{ color: ACCENT_DEEP }}>Sequim to Forks.</span>
              </h2>
              <p
                className="mt-4 sm:mt-5 text-[16px] sm:text-[18px] leading-relaxed max-w-2xl mx-auto"
                style={{ color: INK_DARK_SOFT, fontFamily: FONT_BODY }}
              >
                If you&apos;re on the Olympic Peninsula &mdash; Clallam,
                Jefferson, or northern Mason County &mdash; we&apos;ll come
                walk the site. The truck knows these roads.
              </p>
            </div>

            <PeninsulaRouteMap />

            <div className="mt-12 text-center">
              <p
                className="text-[14px] mb-4"
                style={{ color: INK_DARK_DIM, fontFamily: FONT_BODY }}
              >
                Outside this list? Call us anyway &mdash; we may still come
                out.
              </p>
              <a
                href={BUSINESS.phoneHref}
                className="inline-flex items-center gap-2 px-6 h-12 rounded-md font-bold uppercase tracking-wide text-[13px] text-white transition-all hover:brightness-110 active:scale-95 shadow-[0_4px_14px_rgba(234,88,12,0.4)]"
                style={{ background: ACCENT_DEEP, fontFamily: FONT_HEAD }}
              >
                <Phone size={14} weight="fill" />
                {BUSINESS.phoneDisplay}
              </a>
            </div>
          </div>
        </section>

        {/* ─────────────── ASPHALT CROSS-SECTION ─────────────── */}
        {/* Bespoke replacement for the Meyer-pattern "vs. avg crew"
            comparison table. A labeled cutaway showing the four asphalt
            layers + sealcoat + striping — the actual engineering that
            separates a 25-year driveway from a 5-year one. Educational +
            paving-native. Uses warm coffee-brown bg so it differentiates
            from the surrounding charcoal sections. */}
        <section
          className="py-20 sm:py-24 lg:py-32 relative overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${BG_WARM} 0%, ${BG} 70%)`,
          }}
        >
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeader
              eyebrow="Under the Surface"
              title="What goes into a driveway that"
              highlight="lasts 25 years."
              subtitle="Most contractors skip the dirt work. We don't. Here's what we put under every square foot before the first ton of asphalt shows up."
            />

            <AsphaltCrossSection />

            <p
              className="mt-10 text-center text-[14px] italic max-w-2xl mx-auto"
              style={{ color: INK_DIM, fontFamily: FONT_SERIF }}
            >
              &ldquo;Cheap paving is mostly invisible. So is good paving — but
              one shows up in five years and the other doesn&apos;t.&rdquo;
            </p>
          </div>
        </section>

        {/* ─────────────── FOUNDER QUOTE ─────────────── */}
        {/* Set in Cormorant Garamond — a humanist serif — so the family
            voice reads warm + generational instead of trade-dress bold.
            Subtle olive underline anchors it to the PNW thread. */}
        <section
          className="py-20 sm:py-24 lg:py-32 relative overflow-hidden"
          style={{ background: BG_ALT }}
        >
          {/* Faint olive topo behind the quote */}
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern id="pp-quote-topo" width="200" height="50" patternUnits="userSpaceOnUse">
                <path d="M0 25 Q50 5 100 25 T200 25" fill="none" stroke={OLIVE} strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pp-quote-topo)" />
          </svg>

          <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
            <Quotes
              size={48}
              weight="fill"
              style={{ color: ACCENT }}
              className="mx-auto mb-6"
            />
            <p
              className="text-[28px] sm:text-[36px] lg:text-[44px] leading-[1.2] tracking-tight text-white mb-8 font-medium italic"
              style={{ fontFamily: FONT_SERIF }}
            >
              &ldquo;We started in 1985 paving driveways for our neighbors. Forty-
              one years later, our neighbors&apos; kids are calling us to pave
              theirs. That&apos;s the whole job &mdash; do it{" "}
              <span style={{ color: ACCENT, fontStyle: "italic" }}>right</span>{" "}
              so the next call comes.&rdquo;
            </p>
            <div className="flex flex-col items-center gap-2">
              <span
                className="inline-block w-12 h-px"
                style={{ background: OLIVE }}
              />
              <span
                className="text-[18px] italic mt-1"
                style={{ color: "#f8fafc", fontFamily: FONT_SERIF }}
              >
                Cyril &amp; Ella Frick
              </span>
              <span
                className="text-[11px] uppercase tracking-[0.28em]"
                style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
              >
                Founders &middot; Peninsula Paving &middot; Sequim, WA
              </span>
            </div>
          </div>
        </section>

        {/* ─────────────── CONTACT ─────────────── */}
        <section
          id="contact"
          className="py-20 sm:py-24 lg:py-32 relative overflow-hidden"
          style={{ background: BG }}
        >
          {/* Glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] pointer-events-none rounded-full opacity-30"
            style={{
              background: `radial-gradient(circle, ${ACCENT_DIM} 0%, transparent 60%)`,
            }}
          />

          <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
            <SectionHeader
              eyebrow="Free Estimate"
              title="Let&apos;s Pave"
              highlight="Yours."
              subtitle="Tell us the address and the rough scope. We&apos;ll come walk the site, talk through the sub-grade, and get a real number back to you inside the week."
            />

            <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-12 items-start">
              <PeninsulaPavingContactForm
                prospectId={PROSPECT_ID}
                services={SERVICES.map((s) => s.title)}
              />

              <aside className="space-y-6">
                <div
                  className="rounded-xl border p-6 sm:p-7"
                  style={{
                    background: BG_PANEL,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className="text-[10px] font-bold uppercase tracking-[0.22em] mb-4"
                    style={{ color: ACCENT, fontFamily: FONT_HEAD }}
                  >
                    Call us first
                  </div>
                  <a
                    href={BUSINESS.phoneHref}
                    className="block text-[28px] sm:text-[34px] font-bold text-white hover:text-orange-400 transition-colors tracking-tight"
                    style={{ fontFamily: FONT_HEAD }}
                  >
                    {BUSINESS.phoneDisplay}
                  </a>
                  <p
                    className="mt-3 text-[14px] leading-relaxed"
                    style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                  >
                    Mon–Fri, 7am–5pm. After hours? Leave a message — we
                    return calls in the morning.
                  </p>
                </div>

                <div
                  className="rounded-xl border p-6 sm:p-7"
                  style={{
                    background: BG_PANEL,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className="text-[10px] font-bold uppercase tracking-[0.22em] mb-4"
                    style={{ color: ACCENT, fontFamily: FONT_HEAD }}
                  >
                    Where we&apos;re based
                  </div>
                  <a
                    href={BUSINESS.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div
                      className="text-[18px] font-bold text-white group-hover:text-orange-400 transition-colors mb-1"
                      style={{ fontFamily: FONT_HEAD }}
                    >
                      Sequim, WA 98382
                    </div>
                    <div
                      className="text-[13px]"
                      style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                    >
                      {BUSINESS.address.mailing}
                    </div>
                    <div
                      className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold"
                      style={{ color: ACCENT, fontFamily: FONT_HEAD }}
                    >
                      Open in Maps
                      <ArrowRight size={12} weight="bold" />
                    </div>
                  </a>
                </div>

                <div
                  className="rounded-xl border p-6 sm:p-7"
                  style={{
                    background: BG_PANEL,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className="text-[10px] font-bold uppercase tracking-[0.22em] mb-4"
                    style={{ color: ACCENT, fontFamily: FONT_HEAD }}
                  >
                    Service Area
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {BUSINESS.serviceArea.map((city) => (
                      <span
                        key={city}
                        className="inline-block px-2.5 py-1 rounded text-[11px] font-medium"
                        style={{
                          background: "rgba(255, 255, 255, 0.04)",
                          color: INK_SOFT,
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                        }}
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ─────────────── FOOTER ─────────────── */}
        <footer
          className="border-t pt-12 pb-8"
          style={{
            background: BG_ALT,
            borderColor: "rgba(255, 255, 255, 0.06)",
          }}
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
              <div>
                <div
                  className="text-[18px] font-bold text-white tracking-wide mb-2"
                  style={{ fontFamily: FONT_HEAD }}
                >
                  PENINSULA PAVING
                </div>
                <p
                  className="text-[13px] leading-relaxed max-w-xs"
                  style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                >
                  Family-owned asphalt paving + excavation on the Olympic
                  Peninsula since 1985.
                </p>
              </div>

              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3"
                  style={{ color: ACCENT, fontFamily: FONT_HEAD }}
                >
                  Contact
                </div>
                <a
                  href={BUSINESS.phoneHref}
                  className="block text-[14px] text-white hover:text-orange-400 transition-colors mb-1.5"
                >
                  {BUSINESS.phoneDisplay}
                </a>
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[13px] hover:text-white transition-colors"
                  style={{ color: INK_SOFT }}
                >
                  {BUSINESS.address.full}
                </a>
              </div>

              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3"
                  style={{ color: ACCENT, fontFamily: FONT_HEAD }}
                >
                  Services
                </div>
                <ul className="space-y-1.5">
                  {SERVICES.slice(0, 4).map((s) => (
                    <li
                      key={s.title}
                      className="text-[13px]"
                      style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                    >
                      {s.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
            >
              <div
                className="text-[12px]"
                style={{ color: INK_DIM, fontFamily: FONT_BODY }}
              >
                © {new Date().getFullYear()} Peninsula Paving &amp;
                Excavating. All rights reserved.
              </div>
              {/* Required network-effect footer per CLAUDE.md */}
              <div className="flex items-center gap-2">
                <BluejayLogo className="w-4 h-4" />
                <span
                  className="text-[12px]"
                  style={{ color: INK_DIM, fontFamily: FONT_BODY }}
                >
                  Built by{" "}
                  <a
                    href="https://bluejayportfolio.com/audit"
                    className="hover:text-white transition-colors underline-offset-2 hover:underline"
                    style={{ color: ACCENT }}
                  >
                    BlueJays
                  </a>{" "}
                  — get your free site audit
                </span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </MotionConfig>
  );
}

/* ───────────────────────── STAT COMPONENT ───────────────────────── */
function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div
        className="text-[44px] sm:text-[56px] font-bold leading-none tracking-tight mb-2"
        style={{
          background: FIRE_GRAD,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontFamily: FONT_HEAD,
        }}
      >
        {number}
      </div>
      <div
        className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.16em] leading-snug"
        style={{ color: INK_SOFT, fontFamily: FONT_HEAD }}
      >
        {label}
      </div>
    </div>
  );
}
