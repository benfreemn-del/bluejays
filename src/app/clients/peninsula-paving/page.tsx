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

import { useEffect, useRef, useState } from "react";
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

/* ───────────────────────── COLORS — LIGHT THEME ─────────────────────────
 * Rewritten 2026-05-17 per Ben review: "lighten up the color palette,
 * white + orange + yellow 3-color scheme."
 *
 * Strict 3-color discipline:
 *   1. WHITE (warm white + cream variations) — base surface
 *   2. ORANGE (copper #ea580c family) — primary accent / CTAs / hero
 *   3. YELLOW (amber #f59e0b family) — secondary accent / highlights /
 *      sunset gradients
 *
 * Dark warm-charcoal #1c1410 is used as TEXT and the footer only —
 * not as a section background. Everything else breathes white/cream.
 */

// Surfaces (warm whites + creams — never pure flat white)
const BG = "#fefdfb";            // softest warm white — primary section bg
const BG_ALT = "#fef9ed";        // warm cream — alt section
const BG_PANEL = "#ffffff";      // pure white — cards (against cream bg)
const BG_WARM = "#fef3c7";       // amber-100 — daylight cream for hero variations
const BG_CREAM = "#fdf6e3";      // route map section
const BG_CREAM_ALT = "#fbecc7";  // route map gradient
const BG_DEEP = "#1c1410";       // dark warm-black — text + footer only

// ORANGE — primary accent (was already brand-locked)
const ACCENT = "#ea580c";        // orange-600 — primary
const ACCENT_HOT = "#f97316";    // orange-500 — bright on white
const ACCENT_DEEP = "#c2410c";   // orange-700 — depth + text-on-white
const ACCENT_DIM = "rgba(234, 88, 12, 0.18)";
const ACCENT_TINT = "rgba(234, 88, 12, 0.08)";   // for soft amber wash backgrounds

// YELLOW — third color (replaces olive + sky as secondary accent)
const YELLOW = "#f59e0b";        // amber-500 — secondary accent
const YELLOW_HOT = "#fbbf24";    // amber-400 — bright highlight
const YELLOW_DEEP = "#d97706";   // amber-600 — depth
const YELLOW_DIM = "rgba(245, 158, 11, 0.22)";
const YELLOW_TINT = "rgba(245, 158, 11, 0.10)"; // soft yellow wash

// Text on light bg (dark warm-black for max contrast on warm white)
const INK = BG_DEEP;
const INK_SOFT = "rgba(28, 20, 16, 0.82)";
const INK_DIM = "rgba(28, 20, 16, 0.62)";

// Legacy tokens preserved so existing inline-style references keep
// compiling. Repointed to light-theme values so nothing renders
// invisibly during the section sweep.
const INK_DARK = INK;
const INK_DARK_SOFT = INK_SOFT;
const INK_DARK_DIM = INK_DIM;

// Sunset gradient — orange-to-yellow only (the 2 brand colors blending).
// Used on hero, primary CTAs, badges. Reads as "freshly-laid asphalt
// caught in golden-hour Sequim sun."
const FIRE_GRAD = `linear-gradient(135deg, ${YELLOW_HOT} 0%, ${YELLOW} 35%, ${ACCENT_HOT} 65%, ${ACCENT} 100%)`;
const SUNSET_GRAD = `linear-gradient(180deg, ${YELLOW_HOT} 0%, ${ACCENT_HOT} 60%, ${ACCENT} 100%)`;

// Legacy olive/sky tokens repointed to yellow so any orphaned reference
// resolves to a brand color, not the removed sage/sky. Will be deleted
// after the section sweep flushes the last references.
const OLIVE = YELLOW;
const OLIVE_DEEP = YELLOW_DEEP;
const OLIVE_DIM = YELLOW_DIM;
const SKY = YELLOW_HOT;
const SKY_DEEP = YELLOW_DEEP;
const SKY_DIM = YELLOW_DIM;

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

/**
 * RoadStripe — decorative section divider that reads as a "road
 * centerline." Yellow + copper dashes on a thin asphalt-band, used
 * between sections to add personality + brand consistency. Costs ~0
 * vertical space (just 14px tall).
 */
function RoadStripe({ flip = false }: { flip?: boolean }) {
  return (
    <div className="relative w-full" aria-hidden="true">
      <svg
        viewBox="0 0 1200 14"
        className="w-full h-[14px]"
        preserveAspectRatio="none"
        style={flip ? { transform: "scaleX(-1)" } : undefined}
      >
        {/* Thin asphalt band */}
        <rect x="0" y="4" width="1200" height="6" rx="3" fill="#1c1410" opacity="0.85" />
        {/* Yellow center-line dashes */}
        {Array.from({ length: 12 }).map((_, i) => (
          <rect
            key={`yellow-${i}`}
            x={20 + i * 100}
            y="6"
            width="42"
            height="2"
            rx="1"
            fill="#fbbf24"
          />
        ))}
        {/* Copper edge stripe — top */}
        <rect x="0" y="3" width="1200" height="1" fill="#ea580c" opacity="0.55" />
        {/* Copper edge stripe — bottom */}
        <rect x="0" y="10" width="1200" height="1" fill="#ea580c" opacity="0.55" />
      </svg>
    </div>
  );
}

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
    <div className={`max-w-3xl ${alignClass} mb-7 sm:mb-8`}>
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
        className="text-[32px] sm:text-[44px] lg:text-[54px] font-bold tracking-tight leading-[1.05] text-[#1c1410]"
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
      className="inline-flex items-center gap-2 text-[13px] sm:text-[14px] font-semibold text-[#1c1410]/85"
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
          background: ACCENT_TINT,
          color: ACCENT,
          border: `1px solid ${ACCENT_DIM}`,
        }}
      >
        {icon}
      </span>
      <div className="leading-tight">
        <div
          className="text-[13px] sm:text-[14px] font-bold uppercase tracking-wide text-[#1c1410]"
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
        borderColor: "rgba(28, 20, 16, 0.10)",
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

      <div className="relative p-5 sm:p-6">
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
          className="text-[20px] sm:text-[22px] font-bold text-[#1c1410] tracking-tight mb-3 leading-snug"
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
        {/* Daytime golden-hour sky — orange + yellow brand gradient
            from warm sunset at top down to cream at the horizon. Light
            theme. */}
        <linearGradient id="pp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="35%" stopColor="#fde68a" />
          <stop offset="65%" stopColor="#fbbf24" stopOpacity="0.65" />
          <stop offset="90%" stopColor="#f97316" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0.15" />
        </linearGradient>
        {/* Sun — soft cream-orange disc */}
        <radialGradient id="pp-sun" cx="60%" cy="62%" r="22%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#fde68a" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#fbbf24" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        {/* Asphalt — factually dark. Stays dark even on light theme
            because that's what fresh asphalt LOOKS like. */}
        <linearGradient id="pp-asphalt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#27272a" />
          <stop offset="50%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
        {/* Mountain back-range — distant Olympics ridge with sky-blue
            atmospheric haze. Further mountains read bluer because the
            atmosphere scatters the light (real PNW look). */}
        <linearGradient id="pp-mtn-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="55%" stopColor="#7c8ea6" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        {/* Mountain front-range — closer, warmer, more saturated.
            Slight slate-blue tint in the shadows. */}
        <linearGradient id="pp-mtn-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="60%" stopColor="#4b5563" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        {/* Forest treeline — Olympic National Park evergreen. Light
            green at top, deep forest at base. */}
        <linearGradient id="pp-trees" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="50%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
        {/* Snowcap shading — white on the sun-lit side (top-left)
            fading to cool blue-gray on the shadow side (bottom-right).
            Gives the snow real depth instead of flat white. */}
        <linearGradient id="pp-snow" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#bcc8d6" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width="800" height="380" fill="url(#pp-sky)" />
      {/* Sun glow */}
      <circle cx="480" cy="320" r="180" fill="url(#pp-sun)" />

      {/* Olympic Mountains — back range (Mt. Constance / The Brothers
          vibe). Slate-blue gradient. */}
      <path
        d="M0,330 L80,260 L140,290 L200,210 L260,250 L310,200 L370,240 L430,180 L500,230 L560,210 L630,260 L700,220 L770,250 L800,240 L800,380 L0,380 Z"
        fill="url(#pp-mtn-back)"
      />

      {/* SNOWCAPS — proper triangular caps spanning the upper third of
          each tallest back-range peak. Each cap traces from a base on
          the left slope, up to the peak point, down to a base on the
          right slope, then a gently wavy snowline back across the
          bottom. White-to-cool-blue gradient gives natural shading
          (sun-lit left, shadow right). */}
      <g fill="url(#pp-snow)" opacity="0.96">
        {/* The Brothers — peak (200, 210), bases at (179, 238) and (242, 238) */}
        <path d="M 179,238 L 200,210 L 242,238 Q 225,242 210,238 Q 198,235 188,240 Q 182,241 179,238 Z" />
        {/* Mt. Constance — peak (310, 200), bases at (282, 228) and (352, 228) */}
        <path d="M 282,228 L 310,200 L 352,228 Q 335,232 320,228 Q 305,225 295,230 Q 287,231 282,228 Z" />
        {/* Mt. Olympus — peak (430, 180), bases at (398, 212) and (475, 212).
            The tallest peak, so the snowcap reaches deepest down. */}
        <path d="M 398,212 L 430,180 L 475,212 Q 460,218 445,213 Q 432,210 420,215 Q 408,217 398,212 Z" />
        {/* Hurricane Ridge — peak (560, 210), bases at (500, 230) and (599, 238).
            Left side hits the shoulder so snow runs all the way down that side. */}
        <path d="M 500,230 L 560,210 L 599,238 Q 583,242 570,236 Q 555,233 540,237 Q 520,234 500,230 Z" />
        {/* Eastern ridge — peak (700, 220), bases at (658, 244) and (756, 244) */}
        <path d="M 658,244 L 700,220 L 756,244 Q 738,248 722,243 Q 708,240 695,245 Q 678,246 658,244 Z" />
      </g>

      {/* Peak highlights — bright white at the very tip of each peak,
          like late-afternoon sun catching the very top of the snow. */}
      <g fill="#ffffff" opacity="0.85">
        <ellipse cx="200" cy="213" rx="2.4" ry="3" />
        <ellipse cx="310" cy="203" rx="2.4" ry="3" />
        <ellipse cx="430" cy="183" rx="2.8" ry="3.5" />
        <ellipse cx="560" cy="213" rx="2.4" ry="3" />
        <ellipse cx="700" cy="223" rx="2.2" ry="2.8" />
      </g>

      {/* Snowline shadow — thin slate-blue band right beneath each
          snowcap, so the white doesn't read as a flat sticker pasted
          on top. */}
      <g fill="#7c8ea6" opacity="0.35">
        <path d="M 184,240 Q 200,236 215,240 Q 230,242 240,240 L 238,242 Q 220,244 200,242 Q 188,243 184,240 Z" />
        <path d="M 286,230 Q 305,226 320,230 Q 340,232 350,230 L 348,232 Q 320,234 296,232 Q 290,232 286,230 Z" />
        <path d="M 402,214 Q 420,212 440,214 Q 460,216 472,214 L 470,216 Q 445,218 420,216 Q 408,216 402,214 Z" />
        <path d="M 530,234 Q 555,232 575,236 Q 590,238 596,237 L 594,239 Q 570,240 545,238 Q 535,237 530,234 Z" />
        <path d="M 662,246 Q 685,242 705,246 Q 730,248 753,246 L 751,248 Q 720,250 695,248 Q 675,248 662,246 Z" />
      </g>

      {/* Front range — closer, darker slate */}
      <path
        d="M0,360 L60,320 L130,345 L180,310 L240,335 L310,300 L380,330 L450,295 L520,325 L590,305 L670,335 L730,315 L800,330 L800,400 L0,400 Z"
        fill="url(#pp-mtn-front)"
      />

      {/* FOREST TREELINE — Olympic National Park evergreen silhouette.
          Trees in the x=485 to x=555 range are SKIPPED — that's where
          the asphalt roller sits at the road's vanishing point. */}
      <g fill="url(#pp-trees)">
        {Array.from({ length: 32 }).map((_, i) => {
          const x = i * 27 - 8;
          // Skip the section directly behind the roller (footprint x=490-550)
          if (x + 14 > 482 && x < 558) return null;
          const h = 18 + ((i * 11) % 16);
          return (
            <polygon
              key={`tree-${i}`}
              points={`${x},398 ${x + 7},${398 - h} ${x + 14},398`}
              opacity={0.85 + ((i % 3) * 0.05)}
            />
          );
        })}
        {/* Second row of trees behind, slightly smaller for depth */}
        {Array.from({ length: 28 }).map((_, i) => {
          const x = i * 31 + 4;
          if (x + 10 > 482 && x < 558) return null;
          const h = 12 + ((i * 7) % 10);
          return (
            <polygon
              key={`tree2-${i}`}
              points={`${x},393 ${x + 5},${393 - h} ${x + 10},393`}
              opacity="0.55"
            />
          );
        })}
      </g>

      {/* Asphalt — freshly-paved driveway, perspective trapezoid.
          Shifted RIGHT 120px total from the geometric center so the
          road sits well right-of-center under the hero copy. New
          bottom 320-820, vanishing point centered at 520. */}
      <path
        d="M 320,600 L 820,600 L 550,400 L 490,400 Z"
        fill="url(#pp-asphalt)"
      />

      {/* Glossy wet-asphalt highlight — narrower trapezoid inset,
          reads as sunset reflecting off the surface. */}
      <path
        d="M 340,600 L 600,600 L 530,420 L 500,420 Z"
        fill="#1c1917"
        opacity="0.55"
      />

      {/* Warm sunset glow on the right edge of the road */}
      <path
        d="M 820,600 L 780,600 L 535,410 L 550,400 Z"
        fill={ACCENT}
        opacity="0.16"
      />

      {/* Center line dashed stripes — bright white, perspective-tapered.
          Centerline at x=520 (geometric center of the shifted trapezoid). */}
      <g fill="#f8fafc">
        {/* Stripe 1 — foreground (closest, biggest) */}
        <polygon points="506,600 534,600 528,560 512,560" opacity="0.95" />
        {/* Stripe 2 */}
        <polygon points="513,540 527,540 525,500 515,500" opacity="0.9" />
        {/* Stripe 3 */}
        <polygon points="516,480 524,480 523,450 517,450" opacity="0.85" />
        {/* Stripe 4 */}
        <polygon points="517.5,440 522.5,440 522,420 518,420" opacity="0.7" />
        {/* Stripe 5 (vanishing) */}
        <polygon points="518.5,415 521.5,415 521.2,405 518.8,405" opacity="0.5" />
      </g>

      {/* Solid white edge stripes — parallel to the road sides */}
      <g fill="#f8fafc">
        {/* Left edge stripe */}
        <polygon
          points="320,600 335,600 498,400 492,400"
          opacity="0.85"
        />
        {/* Right edge stripe */}
        <polygon
          points="805,600 820,600 548,400 542,400"
          opacity="0.85"
        />
      </g>

      {/* Subtle copper sunset wash on the asphalt — reads as PNW
          golden-hour light kissing the road surface. */}
      <path
        d="M 320,600 L 820,600 L 550,400 L 490,400 Z"
        fill={ACCENT}
        opacity="0.06"
      />

      {/* ASPHALT ROLLER parked at the far end of the road — sits on
          the vanishing point where the road meets the tree line.
          Replaces the section of trees behind that spot (handled by
          the skip-range in the tree loop above). Small enough to read
          as "distant" but recognisable as a real piece of paving
          equipment. */}
      <g transform="translate(490, 358)">
        {/* Ground shadow */}
        <ellipse cx="30" cy="44" rx="32" ry="2.5" fill="rgba(0,0,0,0.35)" />
        {/* Front drum (big steel cylinder that compacts the asphalt) */}
        <rect x="2" y="28" width="56" height="16" rx="3" fill="#1c1917" />
        <rect x="2" y="28" width="56" height="3" rx="1" fill="#52525b" />
        <rect x="2" y="38" width="56" height="1" fill="#71717a" opacity="0.6" />
        {/* Drum end-cap detail */}
        <circle cx="6" cy="36" r="3.5" fill="#1c1917" stroke="#52525b" strokeWidth="0.6" />
        <circle cx="54" cy="36" r="3.5" fill="#1c1917" stroke="#52525b" strokeWidth="0.6" />
        {/* Cab body — orange copper */}
        <rect x="14" y="12" width="32" height="18" rx="2" fill={ACCENT} />
        {/* Yellow safety stripe along the cab */}
        <rect x="14" y="20" width="32" height="2" fill={YELLOW_HOT} />
        {/* Cab roof — darker copper */}
        <rect x="18" y="4" width="24" height="9" rx="1.5" fill={ACCENT_DEEP} />
        {/* Windshield + side windows — cream tint */}
        <rect x="20" y="6" width="20" height="7" rx="1" fill="#fef3c7" opacity="0.92" />
        {/* Headlight on the front (right side) */}
        <circle cx="48" cy="26" r="1.6" fill={YELLOW_HOT} />
        {/* Exhaust pipe rising from the cab */}
        <rect x="40" y="0" width="2" height="6" rx="0.5" fill="#27272a" />
      </g>
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
  /**
   * Rewritten 2026-05-17 per Ben review:
   *   - Roller WAS overlapping the "Seal Coat" label at the top of
   *     the old diagram. Moved roller to its own dedicated row above
   *     the asphalt stack — sits cleanly on the wearing-course surface
   *     with no label nearby.
   *   - Old design had labels alternating left-right which crashed
   *     into adjacent layers. New design parks ALL labels on a single
   *     right-side rail with thin pointer lines back to the bands.
   *     Reads top-to-bottom like a spec sheet.
   *   - Dark sky stripe replaced with a LIGHT cream-orange-yellow
   *     sunset wash so the whole diagram reads as a cross-section
   *     sitting in daylight, not at night.
   *   - Diagram now occupies the LEFT 55% of the viewBox; labels live
   *     in the right 45%. Lots of breathing room.
   */

  // Asphalt-layer geometry — layers stack top-to-bottom inside the
  // diagram column (x = 60 → 500).
  const DIAGRAM_LEFT = 60;
  const DIAGRAM_RIGHT = 500;
  const DIAGRAM_WIDTH = DIAGRAM_RIGHT - DIAGRAM_LEFT;
  const SKY_HEIGHT = 110;
  const LABEL_BEND_X = 542; // where the leader line bends vertically
  const LABEL_RAIL_X = 582; // dot position on the right rail
  const LABEL_X = 602; // where the label text starts (anchor=start)
  const LABEL_PITCH = 50; // vertical spacing between rows (each row gets 50px)
  const LABEL_RAIL_START = SKY_HEIGHT + 18;

  let cumY = SKY_HEIGHT;
  const bands = ASPHALT_LAYERS.map((l, i) => {
    const layerMidY = cumY + l.height / 2;
    // EVERY label gets evenly-distributed rail Y, regardless of how
    // thin the actual layer is. Bent leader line connects the rail
    // position back to the layer mid-Y (which may be 4-10px apart
    // for the top thin layers — they don't crowd the labels anymore).
    const labelY = LABEL_RAIL_START + i * LABEL_PITCH;
    const band = { ...l, y: cumY, layerMidY, labelY };
    cumY += l.height;
    return band;
  });
  const labelsBottom =
    LABEL_RAIL_START + (ASPHALT_LAYERS.length - 1) * LABEL_PITCH + 32;
  const totalH = Math.max(cumY, labelsBottom) + 50;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 1140 ${totalH}`}
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Light-theme cutaway showing the six layers Peninsula Paving installs under every driveway: line striping, seal coat, wearing course, binder course, aggregate base, and compacted sub-grade."
      >
        <defs>
          {/* Daytime sunset sky — orange + yellow blend, the brand
              palette earning its keep at the top of the diagram. */}
          <linearGradient id="pp-xsec-sky-light" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={YELLOW_HOT} stopOpacity="0.32" />
            <stop offset="60%" stopColor={ACCENT_HOT} stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          {/* Aggregate base — crushed-rock texture (warm grays) */}
          <pattern
            id="pp-xsec-aggregate"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <rect width="14" height="14" fill="#a8a29e" />
            <circle cx="3" cy="4" r="1.8" fill="#d6d3d1" />
            <circle cx="10" cy="7" r="2.2" fill="#e7e5e4" />
            <circle cx="5" cy="11" r="1.4" fill="#d6d3d1" />
            <circle cx="12" cy="12" r="1.6" fill="#e7e5e4" />
          </pattern>
          {/* Sub-grade — compacted soil (warm brown texture) */}
          <pattern
            id="pp-xsec-subgrade"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <rect width="20" height="20" fill="#a16207" />
            <path
              d="M0 5 L20 4 M0 12 L20 11 M0 18 L20 17"
              stroke="#854d0e"
              strokeWidth="0.6"
            />
            <circle cx="5" cy="8" r="0.6" fill="#713f12" />
            <circle cx="14" cy="15" r="0.5" fill="#713f12" />
          </pattern>
          {/* Binder course — dark asphalt (factually correct — asphalt IS dark) */}
          <linearGradient id="pp-xsec-binder" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="100%" stopColor="#18181b" />
          </linearGradient>
          {/* Wearing course — slightly darker asphalt */}
          <linearGradient id="pp-xsec-wear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
          {/* Seal coat — thin shiny black band */}
          <linearGradient id="pp-xsec-seal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1c1917" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
        </defs>

        {/* SKY band — cream/sunset gradient at the top of the diagram.
            This is the "above ground" zone where the roller sits. */}
        <rect
          x={DIAGRAM_LEFT}
          y="0"
          width={DIAGRAM_WIDTH}
          height={SKY_HEIGHT}
          fill="url(#pp-xsec-sky-light)"
        />

        {/* Sun in the sky — soft cream-orange disc. Positioned far
            from where the roller will sit so they don't overlap. */}
        <circle cx={DIAGRAM_LEFT + 50} cy="38" r="18" fill={YELLOW_HOT} opacity="0.65" />
        <circle cx={DIAGRAM_LEFT + 50} cy="38" r="11" fill="#ffffff" opacity="0.75" />

        {/* Single yellow pickup truck driving on the road — wheels sit
            on the road surface (y = SKY_HEIGHT). The orange sedan that
            used to sit on its left was removed per Ben — one vehicle
            reads cleaner than two competing for attention next to the
            asphalt roller. */}
        <g transform={`translate(${DIAGRAM_LEFT + 150}, ${SKY_HEIGHT - 34})`}>
          {/* Shadow */}
          <ellipse cx="28" cy="35" rx="30" ry="2" fill="rgba(28, 20, 16, 0.22)" />
          {/* Truck bed (rear, lower) */}
          <path d="M 26,14 L 54,14 L 56,32 L 26,32 Z" fill={YELLOW} />
          {/* Bed rim */}
          <rect x="26" y="14" width="30" height="2" fill={YELLOW_DEEP} />
          {/* Cab body */}
          <path
            d="M 2,26 L 6,12 L 12,4 L 26,4 L 26,32 L 2,32 Z"
            fill={YELLOW_HOT}
          />
          {/* Cab roof */}
          <path d="M 12,4 L 14,2 L 24,2 L 26,4 Z" fill={YELLOW_DEEP} />
          {/* Windshield + side window */}
          <path d="M 8,12 L 13,5 L 22,5 L 22,12 Z" fill="#fef3c7" opacity="0.92" />
          <path d="M 23,12 L 23,5 L 25,5 L 25,12 Z" fill="#fef3c7" opacity="0.92" />
          {/* Door line */}
          <line x1="22" y1="12" x2="22" y2="30" stroke={YELLOW_DEEP} strokeWidth="0.8" />
          {/* Wheels */}
          <circle cx="12" cy="32" r="4.5" fill="#1c1410" />
          <circle cx="12" cy="32" r="1.8" fill="#a8a29e" />
          <circle cx="46" cy="32" r="4.5" fill="#1c1410" />
          <circle cx="46" cy="32" r="1.8" fill="#a8a29e" />
          {/* Headlight */}
          <rect x="3" y="20" width="3" height="2" rx="0.5" fill={ACCENT_HOT} />
        </g>

        {/* (Orange asphalt-roller silhouette removed per Ben — the
            yellow pickup truck is the only vehicle on the road now.) */}

        {/* Each asphalt layer band (drawn in the diagram column) */}
        {bands.map((b) => {
          let fill: string = b.color;
          if (b.name === "Aggregate Base") fill = "url(#pp-xsec-aggregate)";
          else if (b.name === "Compacted Sub-grade")
            fill = "url(#pp-xsec-subgrade)";
          else if (b.name === "Binder Course") fill = "url(#pp-xsec-binder)";
          else if (b.name === "Wearing Course") fill = "url(#pp-xsec-wear)";
          else if (b.name === "Seal Coat") fill = "url(#pp-xsec-seal)";

          return (
            <g key={`band-${b.name}`}>
              <rect
                x={DIAGRAM_LEFT}
                y={b.y}
                width={DIAGRAM_WIDTH}
                height={b.height}
                fill={fill}
              />
              {/* Line-striping layer — paint dashes across the top */}
              {b.name === "Line Striping" && (
                <>
                  <rect
                    x={DIAGRAM_LEFT + 40}
                    y={b.y + 1}
                    width="50"
                    height="2"
                    fill="#ffffff"
                  />
                  <rect
                    x={DIAGRAM_LEFT + 130}
                    y={b.y + 1}
                    width="50"
                    height="2"
                    fill="#ffffff"
                  />
                  <rect
                    x={DIAGRAM_LEFT + 220}
                    y={b.y + 1}
                    width="50"
                    height="2"
                    fill={YELLOW_HOT}
                  />
                  <rect
                    x={DIAGRAM_LEFT + 310}
                    y={b.y + 1}
                    width="50"
                    height="2"
                    fill="#ffffff"
                  />
                </>
              )}
            </g>
          );
        })}

        {/* Labels — distributed evenly on a right-side rail with bent
            leader lines back to the actual layer center. This is the
            architectural-drawing "callout" pattern: each label gets the
            same vertical breathing room (LABEL_PITCH px), and the
            leader line bends to reach a layer that may be packed
            tightly with others. */}
        {bands.map((b) => {
          const layerEdgeX = DIAGRAM_RIGHT;
          const leaderD = `M ${layerEdgeX} ${b.layerMidY} L ${LABEL_BEND_X} ${b.layerMidY} L ${LABEL_BEND_X} ${b.labelY} L ${LABEL_RAIL_X} ${b.labelY}`;

          return (
            <g key={`label-${b.name}`}>
              {/* Bent leader line */}
              <path
                d={leaderD}
                fill="none"
                stroke={ACCENT}
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.65"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Dot at the layer (where the leader starts) */}
              <circle
                cx={layerEdgeX}
                cy={b.layerMidY}
                r="2.5"
                fill={ACCENT}
                stroke="#ffffff"
                strokeWidth="1"
              />
              {/* Dot at the label rail */}
              <circle cx={LABEL_RAIL_X} cy={b.labelY} r="3" fill={ACCENT} />

              {/* Label text */}
              <text
                x={LABEL_X}
                y={b.labelY - 4}
                textAnchor="start"
                fontSize="15"
                fontWeight="700"
                fill={INK}
                fontFamily={FONT_HEAD}
              >
                {b.name}
              </text>
              <text
                x={LABEL_X}
                y={b.labelY + 14}
                textAnchor="start"
                fontSize="12"
                fill={INK_SOFT}
                fontFamily={FONT_HEAD}
                dangerouslySetInnerHTML={{
                  __html: b.spec.replace(/&middot;/g, "·"),
                }}
              />
            </g>
          );
        })}

        {/* Depth bracket on the LEFT edge — shows ~8" total depth */}
        <g>
          <line
            x1={DIAGRAM_LEFT - 12}
            y1={SKY_HEIGHT}
            x2={DIAGRAM_LEFT - 12}
            y2={cumY}
            stroke={ACCENT}
            strokeWidth="1"
          />
          <line
            x1={DIAGRAM_LEFT - 16}
            y1={SKY_HEIGHT}
            x2={DIAGRAM_LEFT - 8}
            y2={SKY_HEIGHT}
            stroke={ACCENT}
            strokeWidth="1"
          />
          <line
            x1={DIAGRAM_LEFT - 16}
            y1={cumY}
            x2={DIAGRAM_LEFT - 8}
            y2={cumY}
            stroke={ACCENT}
            strokeWidth="1"
          />
          <text
            x={DIAGRAM_LEFT - 22}
            y={(SKY_HEIGHT + cumY) / 2 + 4}
            textAnchor="end"
            fontSize="13"
            fontWeight="700"
            fill={ACCENT_DEEP}
            fontFamily={FONT_HEAD}
            letterSpacing="0.1em"
          >
            ~ 8&quot;
          </text>
        </g>

        {/* Bottom annotation */}
        <text
          x={DIAGRAM_LEFT + DIAGRAM_WIDTH / 2}
          y={totalH - 10}
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={ACCENT_DEEP}
          fontFamily={FONT_HEAD}
          letterSpacing="0.22em"
        >
          FROM 8&quot; DOWN, EVERYTHING WE DO
        </text>
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
// TOP-HALF Olympic Peninsula coastline — open polyline (not closed)
// traced from real lat/lon coordinates. Goes from Pacific coast south
// of Forks NORTH around Cape Flattery, EAST along the Strait of Juan
// de Fuca, SE through Discovery Bay + Quimper Peninsula (Port
// Townsend), then SOUTH along the Hood Canal east coast down to
// Quilcene Bay (~lat 47.76). Captures every coast our 12 cities sit on.
const PENINSULA_GEO_COORDS: Array<[number, number]> = [
  // Pacific coast — start south, going north
  [47.755, -124.430],
  [47.880, -124.520],
  [47.950, -124.620],
  [48.020, -124.665],
  [48.115, -124.733],
  [48.180, -124.730],
  [48.310, -124.760],
  // NW corner — Cape Flattery + Neah Bay
  [48.385, -124.731],
  [48.371, -124.625],
  [48.355, -124.520],
  // North coast — Strait of Juan de Fuca, west-to-east
  [48.296, -124.351],
  [48.255, -124.262],
  [48.230, -124.099],
  [48.221, -124.001],
  [48.196, -123.890],
  [48.176, -123.793],
  [48.169, -123.700],
  [48.158, -123.585],
  [48.144, -123.461],
  // Ediz Hook (Port Angeles harbor) — small curving spit
  [48.146, -123.422],
  [48.143, -123.385],
  [48.135, -123.395],
  [48.118, -123.430],
  [48.105, -123.341],
  [48.110, -123.260],
  [48.125, -123.180],
  // Dungeness Spit — iconic curving sandbar
  [48.135, -123.140],
  [48.165, -123.115],
  [48.183, -123.103],
  [48.175, -123.085],
  [48.155, -123.090],
  [48.140, -123.080],
  [48.095, -123.060],
  [48.058, -123.013],
  [48.080, -122.970],
  [48.041, -122.946],
  // Discovery Bay — real N-S inlet
  [48.045, -122.890],
  [48.030, -122.870],
  [48.000, -122.870],
  [48.040, -122.860],
  [48.080, -122.860],
  // Quimper Peninsula (Port Townsend)
  [48.090, -122.870],
  [48.105, -122.808],
  [48.117, -122.760],
  [48.143, -122.756],
  [48.130, -122.730],
  [48.080, -122.740],
  [48.040, -122.700],
  [48.005, -122.720],
  [47.975, -122.760],
  [47.945, -122.760],
  [47.910, -122.830],
  // East coast — Hood Canal (peninsula side), down to ~47.76
  [47.820, -122.870],
  [47.760, -122.860],
];

// Cities Peninsula Paving serves — real lat/lon + per-city label
// offsets so the names don't crash into adjacent labels.
const PENINSULA_CITIES: Array<{
  name: string;
  lat: number;
  lon: number;
  major?: boolean;
  labelDx: number;
  labelDy: number;
  anchor: "start" | "middle" | "end";
}> = [
  // Trimmed to 6 well-spaced hubs so labels don't crash into each
  // other. The smaller towns (Carlsborg, Dungeness, Blyn, Diamond
  // Point, Gardiner, Chimacum) are still covered — they live in the
  // BUSINESS.serviceArea chip list rendered in the Contact section.
  { name: "Forks", lat: 47.951, lon: -124.385, major: true, labelDx: 18, labelDy: 5, anchor: "start" },
  { name: "Joyce", lat: 48.176, lon: -123.793, labelDx: 0, labelDy: -14, anchor: "middle" },
  { name: "Port Angeles", lat: 48.118, lon: -123.430, major: true, labelDx: 0, labelDy: -16, anchor: "middle" },
  { name: "Sequim", lat: 48.078, lon: -123.108, major: true, labelDx: 0, labelDy: 22, anchor: "middle" },
  // Port Townsend sits near the right edge — label has to go ABOVE
  // the dot (centered) instead of to the right, or "Townsend" gets
  // clipped by the viewBox edge.
  { name: "Port Townsend", lat: 48.117, lon: -122.760, major: true, labelDx: 0, labelDy: -16, anchor: "middle" },
  // Quilcene's label also goes ABOVE the dot — it's nearly as far
  // east as Port Townsend, so "Quilcene" starting at x+18 would
  // bump the right edge too.
  { name: "Quilcene", lat: 47.823, lon: -122.872, labelDx: 0, labelDy: -14, anchor: "middle" },
];

// Bounding box + viewBox — cropped to the TOP HALF of the peninsula
// (lat 47.7-48.5) so the half-coast animation fills the frame
// without empty space at the bottom.
const GEO_BOUNDS = {
  latMin: 47.7,
  latMax: 48.5,
  lonMin: -125.0,
  lonMax: -122.6,
};
const VIEW_BOX_W = 1000;
const VIEW_BOX_H = 340;
const VIEW_PAD_X = 50;
const VIEW_PAD_Y = 40;

function geoToViewBox(lat: number, lon: number): [number, number] {
  const usableW = VIEW_BOX_W - 2 * VIEW_PAD_X;
  const usableH = VIEW_BOX_H - 2 * VIEW_PAD_Y;
  const x =
    VIEW_PAD_X +
    ((lon - GEO_BOUNDS.lonMin) /
      (GEO_BOUNDS.lonMax - GEO_BOUNDS.lonMin)) *
      usableW;
  const y =
    VIEW_PAD_Y +
    ((GEO_BOUNDS.latMax - lat) /
      (GEO_BOUNDS.latMax - GEO_BOUNDS.latMin)) *
      usableH;
  return [x, y];
}

// Pre-compute the SVG path (OPEN polyline — no Z).
const PENINSULA_PATH_D = PENINSULA_GEO_COORDS.map(([lat, lon], i) => {
  const [x, y] = geoToViewBox(lat, lon);
  return `${i === 0 ? "M" : "L"} ${x.toFixed(1)},${y.toFixed(1)}`;
}).join(" ");

/**
 * PeninsulaRouteMap — TOP-HALF Olympic Peninsula silhouette with a
 * scroll-triggered three-phase animation:
 *   Phase 1 (0 → 1.8s): coastline draws itself via stroke-dashoffset
 *   Phase 2 (1.8 → 2.9s): 12 city dots pop in one at a time (90ms stagger)
 *   Phase 3 (2.0s onward): city names "type in" next to each dot via
 *                          clip-path inset animation (steps timing)
 * Animation triggers once when the section scrolls into view; honors
 * prefers-reduced-motion (skips animation, shows final state).
 */
function PeninsulaRouteMap() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [pathLen, setPathLen] = useState(3000);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      if (len > 0) setPathLen(len);
    }
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setAnimated(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const LINE_DURATION = 1.8;
  const DOT_BASE_DELAY = LINE_DURATION;
  const DOT_STAGGER = 0.09;
  const NAME_BASE_DELAY = LINE_DURATION + 0.25;
  const NAME_STAGGER = 0.11;

  return (
    <div
      ref={wrapRef}
      className="rounded-2xl border overflow-hidden p-4 sm:p-6 lg:p-8"
      style={{
        background:
          "radial-gradient(ellipse at center, #fefdfb 0%, #fef9ed 100%)",
        borderColor: "rgba(28, 20, 16, 0.10)",
        boxShadow: "0 20px 50px rgba(28, 20, 16, 0.12)",
      }}
    >
      <svg
        viewBox={`0 0 ${VIEW_BOX_W} ${VIEW_BOX_H}`}
        className="w-full h-auto"
        aria-label="Top-half silhouette of the Olympic Peninsula. As you scroll into view, the coastline draws itself, then 12 city dots pop in, then each city name types in beside its dot."
      >
        {/* The coastline — open polyline. Animated via stroke-dashoffset. */}
        <path
          ref={pathRef}
          d={PENINSULA_PATH_D}
          fill="none"
          stroke={ACCENT}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={pathLen}
          strokeDashoffset={animated ? 0 : pathLen}
          style={{
            transition: `stroke-dashoffset ${LINE_DURATION}s cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        />

        {/* Subtle "STRAIT OF JUAN DE FUCA" label at the top — appears
            once the line is fully drawn. */}
        <text
          x={VIEW_BOX_W / 2}
          y={26}
          textAnchor="middle"
          fontSize="11"
          fill={YELLOW_DEEP}
          fontFamily={FONT_SERIF}
          fontStyle="italic"
          letterSpacing="0.32em"
          opacity={animated ? 0.7 : 0}
          style={{
            transition: `opacity 0.6s ease-out ${LINE_DURATION + 0.1}s`,
          }}
        >
          STRAIT OF JUAN DE FUCA
        </text>

        {/* City dots + name labels — render in the same SVG so they
            scale with the coastline. */}
        {PENINSULA_CITIES.map((c, idx) => {
          const [cx, cy] = geoToViewBox(c.lat, c.lon);
          const dotR = c.major ? 9 : 6;
          const haloR = c.major ? 16 : 11;
          const dotDelay = DOT_BASE_DELAY + idx * DOT_STAGGER;
          const nameDelay = NAME_BASE_DELAY + idx * NAME_STAGGER;
          const nameFontSize = c.major ? 17 : 14;

          return (
            <g key={c.name}>
              {/* Pulsing halo behind dot */}
              <circle
                cx={cx}
                cy={cy}
                r={haloR}
                fill={ACCENT}
                opacity={animated ? 0.18 : 0}
                style={{
                  transition: `opacity 0.3s ease-out ${dotDelay}s`,
                }}
              />
              {/* The dot itself — scales in with a pop */}
              <circle
                cx={cx}
                cy={cy}
                r={dotR}
                fill={ACCENT}
                stroke="#ffffff"
                strokeWidth="2"
                opacity={animated ? 1 : 0}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  transform: animated ? "scale(1)" : "scale(0)",
                  transition: `transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${dotDelay}s, opacity 0.2s ease-out ${dotDelay}s`,
                }}
              />
              {/* City name — types in via clip-path inset animation */}
              <text
                x={cx + c.labelDx}
                y={cy + c.labelDy}
                textAnchor={c.anchor}
                fontSize={nameFontSize}
                fontWeight={c.major ? 700 : 600}
                fill={INK}
                fontFamily={FONT_HEAD}
                letterSpacing="0.01em"
                style={{
                  clipPath: animated
                    ? "inset(0 0 0 0)"
                    : "inset(0 100% 0 0)",
                  WebkitClipPath: animated
                    ? "inset(0 0 0 0)"
                    : "inset(0 100% 0 0)",
                  transition: `clip-path 0.5s steps(${Math.max(
                    c.name.length,
                    6,
                  )}, end) ${nameDelay}s, -webkit-clip-path 0.5s steps(${Math.max(
                    c.name.length,
                    6,
                  )}, end) ${nameDelay}s`,
                  paintOrder: "stroke",
                  stroke: "rgba(254, 253, 251, 0.95)",
                  strokeWidth: "3.5px",
                  strokeLinejoin: "round",
                }}
              >
                {c.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Caption below — display-size italic so it actually lands as
          the closing line, not a forgettable footnote. */}
      <p
        className="mt-8 sm:mt-7 text-center text-[20px] sm:text-[26px] lg:text-[32px] leading-[1.3] italic max-w-3xl mx-auto"
        style={{
          color: INK,
          fontFamily: FONT_SERIF,
          opacity: animated ? 1 : 0,
          transition: `opacity 0.6s ease-out ${
            NAME_BASE_DELAY + PENINSULA_CITIES.length * NAME_STAGGER + 0.4
          }s`,
        }}
      >
        ~ 110 miles end to end. The truck knows{" "}
        <span style={{ color: ACCENT_DEEP, fontWeight: 600 }}>every mile</span>{" "}
        from Sequim to Forks.
      </p>
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
          {/* Illustrated hero background (asphalt driveway → Olympics).
              Light-theme legibility overlay: cream → transparent so dark
              text on the left stays readable over the illustration's
              sunset gradient + mountain silhouettes on the right. */}
          <div className="absolute inset-0 pointer-events-none">
            <OlympicHeroIllustration />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(254,253,251,0.92) 0%, rgba(254,253,251,0.78) 38%, rgba(254,253,251,0.40) 65%, rgba(254,253,251,0.10) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(254,253,251,0.40) 0%, rgba(254,253,251,0) 28%, rgba(254,253,251,0) 70%, rgba(254,253,251,0.5) 100%)",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-8 sm:py-10 lg:py-16">
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
                className="text-[44px] sm:text-[64px] lg:text-[80px] font-bold leading-[0.98] tracking-tight text-[#1c1410]"
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
                  className="inline-flex items-center justify-center gap-2 px-7 h-14 rounded-md font-bold uppercase tracking-wide text-[14px] text-[#1c1410] border-2 transition-all hover:bg-[#1c1410]/[0.04] active:scale-[0.97]"
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
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-3.5 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-7 items-center">
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
            borderTopColor: "rgba(28, 20, 16, 0.06)",
            borderBottomColor: "rgba(28, 20, 16, 0.08)",
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

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-3.5 sm:py-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-6">
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
                    className="text-[22px] sm:text-[24px] font-medium italic mt-0.5 text-[#1c1410]"
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
                style={{ background: "rgba(28, 20, 16, 0.10)" }}
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

        {/* Road-stripe divider — the Frick-founders section was about
            family + history, so a road stripe before the services
            grid reads as "OK, now let's get to what we lay down." */}
        <RoadStripe />

        {/* ─────────────── SERVICES ─────────────── */}
        <section
          id="services"
          className="py-14 sm:py-16 lg:py-20 relative overflow-hidden"
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
          className="py-14 sm:py-16 lg:py-20"
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
                      className="text-[18px] sm:text-[20px] font-bold text-[#1c1410] tracking-tight mb-2"
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

        {/* Road-stripe divider — between process steps and the brag-
            section. Flipped so the dashes run the other way for variety. */}
        <RoadStripe flip />

        {/* ─────────────── WHY US ─────────────── */}
        <section
          id="why-us"
          className="py-14 sm:py-16 lg:py-20 relative overflow-hidden"
          style={{ background: BG }}
        >
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
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
                          background: ACCENT_TINT,
                          color: ACCENT,
                          border: `1px solid ${ACCENT_DIM}`,
                        }}
                      >
                        {item.icon}
                      </span>
                      <div>
                        <h3
                          className="text-[18px] sm:text-[20px] font-bold text-[#1c1410] tracking-tight mb-1.5 leading-snug"
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

              {/* Right visual — refined stat cluster card */}
              <div className="relative">
                <div
                  className="relative aspect-square rounded-2xl overflow-hidden p-5 sm:p-6"
                  style={{
                    background: `radial-gradient(circle at 75% 25%, rgba(251, 191, 36, 0.18) 0%, transparent 55%), radial-gradient(circle at 20% 80%, rgba(234, 88, 12, 0.10) 0%, transparent 50%), linear-gradient(180deg, #ffffff 0%, #fef9ed 100%)`,
                    border: `1px solid rgba(234, 88, 12, 0.25)`,
                    boxShadow:
                      "0 24px 70px rgba(28, 20, 16, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                  }}
                >
                  {/* Topo-line pattern overlay (the brand's signature) */}
                  <svg
                    className="absolute inset-0 w-full h-full opacity-[0.10]"
                    aria-hidden="true"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <pattern
                        id="pp-stat-topo"
                        width="160"
                        height="36"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M0 18 Q40 6 80 18 T160 18"
                          fill="none"
                          stroke={ACCENT_DEEP}
                          strokeWidth="0.7"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#pp-stat-topo)" />
                  </svg>

                  {/* Decorative copper corner accent — top right */}
                  <div
                    className="absolute top-0 right-0 pointer-events-none"
                    style={{
                      width: "120px",
                      height: "120px",
                      background: `radial-gradient(circle at 100% 0%, ${ACCENT_DIM} 0%, transparent 70%)`,
                    }}
                    aria-hidden="true"
                  />

                  <div className="relative h-full flex flex-col">
                    {/* Eyebrow — with leading + trailing copper rules */}
                    <div className="flex items-center gap-3 mb-6">
                      <span
                        className="inline-block w-8 h-px"
                        style={{ background: ACCENT_DEEP }}
                      />
                      <div
                        className="text-[10px] font-bold uppercase tracking-[0.32em]"
                        style={{ color: ACCENT_DEEP, fontFamily: FONT_HEAD }}
                      >
                        By the Numbers
                      </div>
                    </div>

                    {/* 2x2 stat grid */}
                    <div className="grid grid-cols-2 gap-x-7 gap-y-7 flex-1">
                      <Stat
                        number="41"
                        label="Years on the Peninsula"
                        icon={<Clock size={14} weight="fill" />}
                      />
                      <Stat
                        number="6"
                        label="Core Services"
                        icon={<Wrench size={14} weight="fill" />}
                      />
                      <Stat
                        number="12+"
                        label="Cities Served"
                        icon={<MapPin size={14} weight="fill" />}
                      />
                      <Stat
                        number="1"
                        label="Family-Run Crew · Start to Finish"
                        icon={<HandWaving size={14} weight="fill" />}
                      />
                    </div>

                    {/* Bottom badge — bigger compass + tagline + a small
                        perspective-road tile on the right to fill the
                        previously-empty corner. */}
                    <div
                      className="mt-auto pt-5 border-t flex items-center gap-3"
                      style={{ borderColor: "rgba(28, 20, 16, 0.12)" }}
                    >
                      <CompassRose size={54} />
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[15px] font-bold leading-tight"
                          style={{ color: INK, fontFamily: FONT_HEAD }}
                        >
                          Sequim, WA
                        </div>
                        <div
                          className="text-[10px] tracking-[0.22em] uppercase font-bold mt-0.5"
                          style={{
                            color: ACCENT_DEEP,
                            fontFamily: FONT_HEAD,
                          }}
                        >
                          Olympic Peninsula
                        </div>
                      </div>
                      {/* Brand logo — mirrors the compass on the
                          opposite corner, balances the badge with the
                          real circular brand mark. Wrapped in
                          overflow-hidden + scaled 1.22× so the badge
                          fills the circle edge-to-edge (source JPEG
                          has whitespace padding around the artwork). */}
                      <div
                        className="shrink-0 rounded-full relative overflow-hidden"
                        style={{
                          width: 56,
                          height: 56,
                          boxShadow:
                            "0 1px 2px rgba(28, 20, 16, 0.08), 0 0 0 1px rgba(234, 88, 12, 0.18)",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/clients/peninsula-paving/logo.jpeg"
                          alt="Peninsula Paving & Excavating"
                          width={56}
                          height={56}
                          className="block w-full h-full"
                          style={{
                            objectFit: "cover",
                            transform: "scale(1.22)",
                            transformOrigin: "center center",
                          }}
                        />
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
          className="py-14 sm:py-16 lg:py-20 relative overflow-hidden"
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
            <div className="max-w-3xl text-center mx-auto mb-7 sm:mb-8">
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
          className="py-14 sm:py-16 lg:py-20 relative overflow-hidden"
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
              className="mt-8 sm:mt-7 text-center text-[22px] sm:text-[30px] lg:text-[38px] leading-[1.25] italic max-w-3xl mx-auto"
              style={{ color: INK, fontFamily: FONT_SERIF }}
            >
              &ldquo;Cheap paving is mostly invisible. So is good paving &mdash;
              but one shows up in{" "}
              <span style={{ color: ACCENT_DEEP, fontWeight: 600 }}>
                five years
              </span>{" "}
              and the other doesn&apos;t.&rdquo;
            </p>
          </div>
        </section>

        {/* Road-stripe divider before the founder quote — gives the
            "Cheap paving is mostly invisible" sub-quote space to land. */}
        <RoadStripe />

        {/* ─────────────── FOUNDER QUOTE ─────────────── */}
        {/* Set in Cormorant Garamond — a humanist serif — so the family
            voice reads warm + generational instead of trade-dress bold.
            Subtle olive underline anchors it to the PNW thread. */}
        <section
          className="py-14 sm:py-16 lg:py-20 relative overflow-hidden"
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
              className="text-[28px] sm:text-[36px] lg:text-[44px] leading-[1.2] tracking-tight text-[#1c1410] mb-8 font-medium italic"
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
          className="py-14 sm:py-16 lg:py-20 relative overflow-hidden"
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
                    className="block text-[28px] sm:text-[34px] font-bold text-[#1c1410] hover:text-orange-700 transition-colors tracking-tight"
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
                      className="text-[18px] font-bold text-[#1c1410] group-hover:text-orange-700 transition-colors mb-1"
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
                          background: "rgba(28, 20, 16, 0.06)",
                          color: INK_SOFT,
                          border: "1px solid rgba(28, 20, 16, 0.08)",
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
            borderColor: "rgba(28, 20, 16, 0.08)",
          }}
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
              <div className="flex items-start gap-4">
                {/* Big circular brand logo — anchor in the footer.
                    Wrapped + scaled 1.22× so the badge maxes out the
                    circle frame edge-to-edge (source JPEG has padding
                    around the artwork). */}
                <div
                  className="rounded-full shrink-0 relative overflow-hidden"
                  style={{
                    width: 84,
                    height: 84,
                    boxShadow:
                      "0 2px 4px rgba(28, 20, 16, 0.10), 0 0 0 1px rgba(234, 88, 12, 0.18)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/clients/peninsula-paving/logo.jpeg"
                    alt="Peninsula Paving & Excavating"
                    width={84}
                    height={84}
                    className="block w-full h-full"
                    style={{
                      objectFit: "cover",
                      transform: "scale(1.22)",
                      transformOrigin: "center center",
                    }}
                  />
                </div>
                <div>
                  <div
                    className="text-[18px] font-bold text-[#1c1410] tracking-wide mb-2"
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
                  className="block text-[14px] text-[#1c1410] hover:text-orange-700 transition-colors mb-1.5"
                >
                  {BUSINESS.phoneDisplay}
                </a>
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[13px] hover:text-[#1c1410] transition-colors"
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
              style={{ borderColor: "rgba(28, 20, 16, 0.08)" }}
            >
              <div
                className="text-[12px]"
                style={{ color: INK_DIM, fontFamily: FONT_BODY }}
              >
                © {new Date().getFullYear()} Peninsula Paving &amp;
                Excavating. All rights reserved.
              </div>
              {/* Required network-effect footer per CLAUDE.md.
                  BlueJay bird icon is now blue + click-targets the
                  password-gated owner backend (portal-demo). Operator-
                  facing — visitors never click it, but Ben (or the
                  prospect, after the password reveal on the sales
                  call) can jump straight from the public page into
                  the backend tour. */}
              <div className="flex items-center gap-2">
                <a
                  href="/clients/peninsula-paving/portal-demo"
                  aria-label="Open Peninsula Paving owner backend (password required)"
                  title="Owner backend — password required"
                  className="inline-flex items-center justify-center rounded-md transition-transform hover:scale-110"
                  style={{ color: "#0ea5e9" }}
                >
                  <BluejayLogo className="w-5 h-5" />
                </a>
                <span
                  className="text-[12px]"
                  style={{ color: INK_DIM, fontFamily: FONT_BODY }}
                >
                  Built by{" "}
                  <a
                    href="https://bluejayportfolio.com"
                    className="hover:text-[#1c1410] transition-colors underline-offset-2 hover:underline"
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
function Stat({
  number,
  label,
  icon,
}: {
  number: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {/* Small copper icon badge — gives each stat a glyph anchor */}
      {icon && (
        <div
          className="inline-flex items-center justify-center w-7 h-7 rounded-md mb-2"
          style={{
            background: "rgba(234, 88, 12, 0.12)",
            color: ACCENT_DEEP,
            border: "1px solid rgba(234, 88, 12, 0.22)",
          }}
        >
          {icon}
        </div>
      )}
      {/* Big stat number — solid copper for max punch on the cream bg */}
      <div
        className="text-[48px] sm:text-[60px] font-bold leading-none tracking-tight mb-2"
        style={{ color: ACCENT_DEEP, fontFamily: FONT_HEAD }}
      >
        {number}
      </div>
      <div
        className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.14em] leading-snug"
        style={{ color: INK, fontFamily: FONT_HEAD }}
      >
        {label}
      </div>
    </div>
  );
}
