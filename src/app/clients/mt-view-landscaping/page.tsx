"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase uses plain img tags intentionally. */

/**
 * /clients/mt-view-landscaping — Mountain View Landscape & Design Inc. (Auburn, WA).
 *
 * v3 rebuild (2026-05-01): clones the v2/landscaping portfolio template
 * (`src/app/v2/landscaping/page.tsx`) verbatim in structure, then swaps
 * every placeholder for Mt View's real business details and 19
 * curl-verified Squarespace CDN photos. All Unsplash URLs removed.
 *
 * Components preserved from the prior bespoke build:
 *   StickyNav         (mobile-hamburger client nav)
 *   MtViewContactForm (wired to /api/clients/mt-view-landscaping/contact)
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
  ShieldCheck,
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Tree,
  Leaf,
  Quotes,
  CalendarCheck,
  Heart,
  Sun,
  Drop,
  Lightning,
  Shovel,
  Mountains,
  Flower,
  CheckCircle,
  Snowflake,
  PaintBrush,
  Ruler,
  Eye,
  Envelope,
  Recycle,
  Plant,
  Medal,
  Check,
  Certificate,
  HandPointing,
  SealCheck,
  FlowerLotus,
  X as XIcon,
} from "@phosphor-icons/react";

import StickyNav from "./sticky-nav";
import MtViewContactForm from "./contact-form";

/* ───────────────────────── BUSINESS ───────────────────────── */
const BUSINESS = {
  name: "Mountain View Landscape & Design",
  shortName: "Mountain View",
  established: 1976,
  phoneDisplay: "(253) 638-0500",
  phoneHref: "tel:+12536380500",
  email: "mtviewlandscapeonline@gmail.com",
  address: {
    street: "18225 Southeast 313th Street",
    city: "Auburn",
    state: "WA",
    zip: "98092",
    full: "18225 Southeast 313th Street, Auburn, WA 98092",
  },
  counties: ["King", "Pierce", "Snohomish", "Kittitas"],
} as const;

const LOGO =
  "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/c7d25e65-6d11-45a8-a51f-87fc78e33417/Untitled+design+%2818%29.png?format=1500w";

/* ───────────────────────── MT VIEW PHOTO LIBRARY (19 verified) ─────────────────────────
   Every URL pulled from Mt View's Squarespace CDN and curl-verified.
   Hero / feature spots use ?format=2500w. Gallery / cluster spots use
   ?format=1500w. Excluded: hero.jpg sprinkler shot, 67738826_* team
   portrait, "unnamed (14).jpg" portrait. */
const PHOTOS = {
  // Hero — new (2026-05-02): Ben supplied a tiered red-block retaining-wall
  // hillside shot with stone steps + path-light bollards. Far stronger
  // hero subject than DSC00543 (which was a single-tier wall) — this
  // one shows the engineered-build + plantings + lighting + scale all
  // in one frame. Source PNG (991x741) was processed through
  // scripts/process-mt-view-hero.mjs: progressive JPEG q=85, modulated
  // saturation 0.95 + brightness 1.02 + linear contrast bump for
  // tonal cohesion with the rest of the page (229KB output).
  hero: "/clients/mt-view-landscaping/tiered-stairs-hero.jpg",
  // The previous hero (DSC00543, single-tier retaining wall) is now
  // surfaced inside the Stoneworks project section — see PHOTOS.stone543
  // below — so we don't lose a verified portfolio shot.
  stone543:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/07a3ab83-303a-418f-bb32-36f1ff2372e1/DSC00543.JPG?format=1500w",

  // Kirse Residence — full-yard installation
  kirseLead:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/2d6da8a0-324b-473f-89b4-c32d0e11cf6e/KirseKatrina+051.JPG?format=2500w",
  kirse006:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/8344f184-3bdb-47ac-ae07-97531fae03a1/KirseKatrina+006.JPG?format=1500w",
  kirse048:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/2beab713-b1a3-4b91-b3ce-65a733df6609/KirseKatrina+048.JPG?format=1500w",
  kirse017:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/b6fd68f4-c87e-45cc-bef7-a32957c88d9d/KirseKatrina+017.JPG?format=1500w",

  // Custom Stoneworks — hardscape & retaining walls
  stoneLead:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/8d16b7b2-0967-4b4c-ab23-a20636723fe8/DSC00545.JPG?format=2500w",
  stone409:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/0a45be1e-f6e8-4630-9247-7c2705eee4f5/DSC00409.JPG?format=1500w",
  stone560:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/ab58e650-dea6-4df0-b619-cc9d6d967db0/DSC00560.JPG?format=1500w",
  stone420:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/655a746a-4fe7-4d0d-ad65-9cd8b4bc50b0/DSC00420.JPG?format=1500w",

  // Aquavista — water feature
  aquaLead:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/28200408-a8ad-4f8a-af91-037b8c322cec/May2008aquavista+004.JPG?format=2500w",
  aqua022:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/75ff38cf-1acd-4320-87bd-754268863706/May2008aquavista+022.JPG?format=1500w",
  aqua9406:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/92229f92-16c1-4908-a55c-e7a3aebe96e7/9406wat.JPG?format=1500w",

  // Olano Property — full-yard transformation
  olanoLead:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/6eb92fa7-668f-4db2-8866-47b0899bad29/OlanoCorky+027.JPG?format=2500w",
  olano024:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/20b5ab64-8dd4-494a-b927-6b0b284a7487/OlanoCorky+024.JPG?format=1500w",
  olano032:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/16da4e07-19d6-4990-b977-77e471487bd4/OlanoCorky+032.JPG?format=1500w",
  june022:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/167a4d4f-ee04-45c8-a371-c79486d4a0f3/June2009+022.JPG?format=1500w",

  // Night Work — landscape lighting (the only verified after-dark shot)
  nightLead:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/a9e639ed-ae6a-418d-a533-bf224253f6af/DSC00449.JPG?format=2500w",
  // night415 (DSC00415) and night414 (DSC00414) declarations removed
  // 2026-05-02 — both are daytime photos that were misnamed as "night
  // work" in the v3 template clone. Ben caught the DSC00415 daytime
  // work-van shot in the original "Night Work" feature strip, which
  // was removed. These constants are no longer referenced.
} as const;

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
const BG = "#0f1a0f";
// Alt section bands — added 2026-05-02 to break the "endless dark"
// scroll that was making the page feel monochromatic. Cream and sage
// bands punctuate the dark editorial base at maintenance + seasonal
// sections so the eye gets visual rest between long dark stretches.
const BG_CREAM = "#f4ede1";        // warm parchment — for the maintenance band
const BG_CREAM_INK = "#1a2412";    // dark forest type for cream band
const BG_CREAM_INK_SOFT = "#3d4a35"; // muted dark sage for body type on cream
const BG_SAGE = "#dde2d3";         // desaturated sage — for seasonal calendar band
const BG_SAGE_INK = "#1f2c1c";     // forest type for sage band
const PRIMARY = "#16a34a";
const PRIMARY_LIGHT = "#22c55e";
const EARTH = "#a3845b";
const EARTH_DARK = "#7c6340";
const PRIMARY_GLOW = "rgba(22, 163, 74, 0.15)";
const EARTH_GLOW = "rgba(163, 132, 91, 0.12)";

/* ───────────────────────── FLOATING LEAF SVG BG ───────────────────────── */
function FloatingLeaves() {
  // Bumped 2026-05-02 for visibility: opacity 0.06-0.16 → 0.22-0.42
  // (~3-4x more visible but still ambient, not distracting). Size
  // 14-24 → 20-36px. Leaf count 14 → 18 for slightly fuller density.
  // Color mix expanded — adds a warm autumn-orange accent so the
  // leaves now read as actual fall-color leaves, not just sage flecks.
  const leaves = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 14,
    duration: 12 + Math.random() * 10,
    size: 20 + Math.random() * 16,
    opacity: 0.22 + Math.random() * 0.2,
    rotation: Math.random() * 360,
    sway: 25 + Math.random() * 50,
    color:
      i % 4 === 0
        ? EARTH
        : i % 4 === 1
          ? "#d97706"      // warm autumn orange — color punctuation
          : PRIMARY_LIGHT,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {leaves.map((l) => (
        <motion.div
          key={l.id}
          className="absolute"
          style={{ left: `${l.x}%`, willChange: "transform, opacity" }}
          animate={{
            y: ["-5vh", "110vh"],
            x: [-l.sway / 2, l.sway / 2, -l.sway / 2],
            rotate: [l.rotation, l.rotation + 360],
            opacity: [0, l.opacity, l.opacity, 0],
          }}
          transition={{
            y: { duration: l.duration, repeat: Infinity, delay: l.delay, ease: "linear" },
            x: { duration: l.duration / 3, repeat: Infinity, delay: l.delay, ease: "easeInOut" },
            rotate: { duration: l.duration, repeat: Infinity, delay: l.delay, ease: "linear" },
            opacity: { duration: l.duration, repeat: Infinity, delay: l.delay, times: [0, 0.05, 0.9, 1] },
          }}
        >
          <Leaf size={l.size} weight="fill" style={{ color: l.color }} />
        </motion.div>
      ))}
    </div>
  );
}

/* ───────────────────────── REUSABLE COMPONENTS ───────────────────────── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.span ref={ref} className={`inline-flex flex-wrap gap-x-3 ${className}`} variants={stagger} initial="hidden" animate={isInView ? "show" : "hidden"}>
      {text.split(" ").map((word, i) => (<motion.span key={i} variants={fadeUp} className="inline-block">{word}</motion.span>))}
    </motion.span>
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
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section ref={ref} id={id} className={className} style={style} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>
      {children}
    </motion.section>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] ${className}`}>{children}</div>;
}

/**
 * RippleBorderCard — animated conic-gradient border that slowly rotates.
 * Lifted from the v2/plumber template's hero card (Ben asked specifically
 * for the plumber-style overlapping-card hero on Mt View). Tinted with
 * Mt View's PRIMARY (forest green) + EARTH (warm brown) instead of the
 * plumber's teal/blue.
 */
function RippleBorderCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[2px] overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from 0deg, ${PRIMARY}44, ${EARTH}66, ${PRIMARY}22, transparent, ${PRIMARY}44, ${EARTH}44, ${PRIMARY}66, transparent)`,
          willChange: "transform",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-[2px] rounded-2xl" style={{ background: "rgba(15, 26, 15, 0.97)" }} />
      <div className="relative z-10">{children}</div>
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
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || isTouchDevice) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25);
  }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return (
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${PRIMARY}, transparent, ${EARTH}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── 3D TILT CARD ───────────────────────── */
function TiltCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const sRotX = useSpring(rotX, springFast);
  const sRotY = useSpring(rotY, springFast);

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rotX.set(((e.clientY - cy) / (rect.height / 2)) * -8);
    rotY.set(((e.clientX - cx) / (rect.width / 2)) * 8);
  }, [rotX, rotY]);

  const handleLeave = useCallback(() => { rotX.set(0); rotY.set(0); }, [rotX, rotY]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX: sRotX, rotateY: sRotY, transformStyle: "preserve-3d", willChange: "transform", ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────────────── LEAF SVG PATTERN ───────────────────────── */
function LeafPattern({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity }}>
      <svg width="100%" height="100%">
        <defs>
          <pattern id="leaf-pat" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M40 10 Q50 30 40 50 Q30 30 40 10Z" fill={PRIMARY_LIGHT} fillOpacity="0.4" />
            <path d="M10 60 Q20 50 30 60 Q20 70 10 60Z" fill={EARTH} fillOpacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#leaf-pat)" />
      </svg>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */

// Mt View's actual 10 disciplines, condensed to the 8 most premium-feeling
// for the accordion section. Native Planting and Night Lights become their
// own service rows (vs. being folded into Design / Lighting elsewhere).
const services = [
  { title: "Landscape Design", desc: "Site walk, concept, and a planting plan that respects what's already there before adding to it. The install runs from the same drawing — no surprises between the page and the ground.", icon: PaintBrush },
  { title: "Hardscapes", desc: "Patios, walkways, outdoor kitchens, and fire features in natural stone, pavers, and brick — built to last in a Pacific Northwest rainy season, not just to look right on day one.", icon: Mountains },
  { title: "Retaining Walls", desc: "Engineered walls in natural stone, concrete, brick, or timber. Solves drainage and slope, reclaims yard, and reads as part of the design — not as a wall.", icon: Shovel },
  { title: "Water Features", desc: "Ponds, waterfalls, and naturalistic stream beds installed alongside the planting so the stone, water, and surrounding bed all arrive together.", icon: Drop },
  { title: "Irrigation", desc: "System design, install, and repair. Zoned for plant type and exposure, scheduled for our climate, and built to be serviceable years out.", icon: Drop },
  { title: "Sod Installation", desc: "Grade work, soil amendment, and clean-edge sod laydown. The lawn looks finished the day we leave and roots in for the long haul.", icon: Leaf },
  { title: "Native & Climate-Smart Planting", desc: "Pacific Northwest natives — Douglas Fir, Oregon Grape, Salal, Red Flowering Currant — for low-water, low-maintenance landscapes that already belong here.", icon: Plant },
  { title: "Night Lighting", desc: "Low-voltage LED designed in the same pass as the plantings. Pathway, accent, and architectural — so the yard reads after sunset, not just at noon.", icon: Lightning },
];

// Process — 5 steps, voiced for Tim. Site visit → concept → plants → install → aftercare.
const processSteps = [
  { step: "01", title: "Site Visit", desc: "Tim walks the property with you, listens to what you want, and looks at soil, drainage, sun, and what's already growing well. No charge across the four-county service area. Bonnie joins for maintenance-only visits.", icon: Eye },
  { step: "02", title: "Concept & Design", desc: "A concept drawing with materials, planting plan, and a clear scope. You see the install on paper before we break ground — phased to your budget if it needs to be.", icon: Ruler },
  { step: "03", title: "Plant Selection", desc: "Plants picked for your site — natives and climate-adapted species first. Forty-nine seasons of installs in this region tells you which ones make it past their second winter.", icon: Plant },
  { step: "04", title: "Installation", desc: "One crew, run by Tim, from the first cleared lot to the last lit pathway. Every discipline in-house — design, hardscape, irrigation, planting, lighting. When it's done, Bonnie's maintenance team takes the keys.", icon: Shovel },
  { step: "05", title: "Aftercare", desc: "Bonnie's maintenance route picks up where the install ends. Pruning, bed maintenance, seasonal cleanup — and we're around for the next phase whenever it lands. Most of our work is repeat clients.", icon: Heart },
];

// 5 named Mt View projects, mapped from the existing PROJECTS array. Each
// project stays as one image in the masonry portfolio grid + has its lead
// photo reused in section spotlights (heroCards, owner spotlight, eco
// section, video placeholder, testimonial backdrops). All 19 photos used.
const projects = [
  { title: "Kirse Residence", location: "King County", scope: "Full-yard installation — terraced front-yard plantings, stone entry walkway, integrated bed work from curb to back door.", image: PHOTOS.kirseLead },
  { title: "Custom Stoneworks", location: "Western Washington", scope: "Engineered retaining walls in natural stone — built to hold a slope through a real PNW rainy season.", image: PHOTOS.stoneLead },
  { title: "Aquavista", location: "Pierce County", scope: "Naturalistic water feature carried through the surrounding plantings — stone, water, and beds installed together.", image: PHOTOS.aquaLead },
  { title: "Olano Property", location: "Puget Sound", scope: "Half-acre transformation across front, side, and rear yards — coordinated plantings, walkways, and grade work.", image: PHOTOS.olanoLead },
  { title: "Night Work", location: "Multi-site", scope: "Low-voltage LED lighting designed alongside the planting plan — pathway, accent, and architectural.", image: PHOTOS.nightLead },
  { title: "Stoneworks Detail", location: "King County", scope: "Tiered hardscape integration — stone wall meeting bed work and finished plantings.", image: PHOTOS.stone560 },
];

// Each season gets its own palette so the row reads as four distinct
// moods rather than four identical white cards. Tints are kept SUBTLE
// (10-15% hue) so they sit comfortably on the sage band without
// fighting it. Accent (top strip + icon tint) is the seasonal
// signature color.
const seasonalData = [
  {
    season: "Spring",
    accent: "#7eb84a",        // fresh moss-green
    bg: "#eef2dc",            // pale sage-cream
    icon: Flower,
    tasks: ["New plantings & mulching", "Irrigation start-up & adjustment", "Bed cleanup & soil amendment", "Lawn dethatching"],
  },
  {
    season: "Summer",
    accent: "#ca8a04",        // amber-yellow (warm but clearly yellow, not marigold)
    bg: "#fef9c3",            // pale yellow / sunshine cream
    icon: Sun,
    tasks: ["Irrigation monitoring", "Pruning & shaping", "Weed & bed maintenance", "Hardscape installs"],
  },
  {
    season: "Fall",
    accent: "#b45309",        // burnt amber
    bg: "#f4dec7",            // peach-rust
    icon: Leaf,
    tasks: ["Leaf removal & cleanup", "Fall planting window", "Aeration & overseed", "Irrigation winterization"],
  },
  {
    season: "Winter",
    accent: "#6b8a96",        // cool slate-blue
    bg: "#dde6ea",            // frost-gray
    icon: Snowflake,
    tasks: ["Structural pruning", "Wall & hardscape repairs", "Concept design for spring", "Lighting installs"],
  },
];

// Voice-of-Tim observations (NOT fabricated client quotes). Each card pairs
// an editorial pull-quote-style line with a real Mt View landscape photo as
// the backdrop — so the section reads "what we hear from clients" instead
// of inventing names.
const observations = [
  { name: "What clients tell us", text: "The most common line we hear: 'we wish we'd called you the first time.' That's the work — building landscapes the second contractor doesn't have to come fix.", image: PHOTOS.kirse048 },
  { name: "On longevity", text: "Most of our clients came back five, ten, fifteen years after the first install for the next phase. That's the standard we install to.", image: PHOTOS.olano032 },
  { name: "On the install", text: "One crew, run by Tim from cleared lot to lit pathway. Bonnie's crew picks it up after the install — same family, same standard. Nothing falls between the trades.", image: PHOTOS.aqua022 },
];

const comparisonRows = [
  { feature: "In-house design, hardscape & planting", us: true, them: false },
  { feature: "Engineered retaining walls", us: true, them: "Sometimes" },
  { feature: "Water feature design & install", us: true, them: false },
  { feature: "Native & climate-adapted plantings", us: true, them: "Limited" },
  { feature: "Low-voltage LED lighting design", us: true, them: false },
  { feature: "Same-owner continuity since 1976", us: true, them: false },
  { feature: "Aftercare on installs we built", us: true, them: "Varies" },
];

const ecoFeatures = [
  { title: "PNW Natives", desc: "Douglas Fir, Oregon Grape, Salal, Red Flowering Currant — species that already belong to this climate.", icon: Plant },
  { title: "Water-Smart Irrigation", desc: "Zoned for plant type and exposure, scheduled for our actual rainfall — not a stock evapotranspiration rate from out of state.", icon: Drop },
  { title: "Climate-Adapted Landscapes", desc: "Plants chosen so the yard costs less to keep alive past its second winter. Lower water, lower maintenance, longer life.", icon: Recycle },
  { title: "Pollinator-Friendly Beds", desc: "Layered planting plans that support bees, hummingbirds, and beneficial insects — habitat as a side effect of good design.", icon: FlowerLotus },
];

const faqs = [
  { q: "How long does a project take?", a: "It depends on scope. A focused install — say a patio with surrounding beds and irrigation — is typically 1–3 weeks of build time after the design is signed off. A multi-phase, full-yard transformation can run a season. We'll give you a realistic timeline at concept stage, not a hopeful one." },
  { q: "Do you handle permits and engineering?", a: "Yes — for retaining walls that need engineering, drainage work, and any hardscape that triggers a permit, we coordinate with the engineer and the permitting jurisdiction. You're not chasing offices on weekends." },
  { q: "What's your service area?", a: "King, Pierce, Snohomish, and Kittitas counties — based out of Auburn, WA. Site visits across the four-county footprint are free. If you're close to the edge of that footprint and not sure, call. We'll tell you straight." },
  { q: "Can you maintain a landscape someone else installed?", a: "We can — pruning, bed work, seasonal cleanup, and re-grading or re-planting where it's needed. We won't take over a maintenance contract on a brand-new install we don't know the bones of, but for established yards, yes." },
  { q: "Do you do residential and commercial?", a: "Both, though our archive leans residential. Property managers, HOAs, and commercial sites have hired us for hardscape and planting work — same in-house crew, same standard." },
  { q: "How long has Mountain View been around?", a: "Tim Hunsaker has been landscaping in this region since 1976 — first under the Shamrock Landscaping name, then as Mountain View. Bonnie Hunsaker runs the maintenance side. Same family, same standard the whole way through." },
];

// Hero floating cards — three feature views from Mt View's archive.
const heroCards = [
  { src: PHOTOS.kirseLead, alt: "Kirse residence — full-yard installation with mature plantings" },
  { src: PHOTOS.aquaLead, alt: "Aquavista — naturalistic water feature with surrounding landscape" },
  { src: PHOTOS.stoneLead, alt: "Custom Stoneworks — tiered retaining wall in natural stone" },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function MtViewLandscapingPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const yearsInBusiness = new Date().getFullYear() - BUSINESS.established;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingLeaves />

      {/* ═══════════════ NAV — uses existing StickyNav client component ═══════════════ */}
      <div className="relative z-50">
        <StickyNav
          businessName={BUSINESS.name}
          logoSrc={LOGO}
          phoneDisplay={BUSINESS.phoneDisplay}
          phoneHref={BUSINESS.phoneHref}
        />
      </div>

      {/* ═══════════════ 1. HERO — OVERLAPPING CARD (plumber-template style) ═══════════════ */}
      <section id="top" className="relative min-h-[100dvh] flex items-center pt-28 pb-16 z-10 overflow-hidden">
        {/* Background gradients — subtler than the floating-cards version */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 20% 30%, ${PRIMARY_GLOW} 0%, transparent 60%),
                          radial-gradient(ellipse at 80% 70%, ${EARTH_GLOW} 0%, transparent 50%)`,
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6 w-full">
          <div className="relative flex flex-col lg:flex-row items-center lg:items-stretch gap-8 lg:gap-0">
            {/* Glass / ripple-border card — overlaps the image on desktop */}
            <div className="relative z-20 lg:w-[48%] lg:mr-[-8%]">
              <RippleBorderCard className="h-full">
                <div className="p-8 md:p-10 lg:p-12 space-y-6">
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...spring, delay: 0.1 }}
                    className="text-sm md:text-base uppercase tracking-widest font-medium"
                    style={{ color: PRIMARY_LIGHT }}
                  >
                    Family-Owned in Western Washington Since {BUSINESS.established}
                  </motion.p>

                  <h1 className="text-5xl md:text-7xl lg:text-[84px] xl:text-[96px] tracking-tighter leading-[0.98] font-bold text-white">
                    <WordReveal text="Custom Landscapes. Maintained for Life." />
                  </h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.6 }}
                    className="text-lg text-slate-400 leading-relaxed max-w-md"
                  >
                    From the first concept sketch to the lawn Bonnie cuts every other Tuesday —
                    the Hunsakers have built and kept Pacific Northwest landscapes
                    healthy for nearly fifty years. Tim runs design and install. Bonnie runs
                    the maintenance route.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.8 }}
                    className="flex flex-wrap gap-4"
                  >
                    <a href="#contact">
                      <MagneticButton
                        className="px-7 py-3.5 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer"
                        style={{ background: PRIMARY } as React.CSSProperties}
                      >
                        Free Estimate
                        <ArrowRight size={18} weight="bold" />
                      </MagneticButton>
                    </a>
                    <a href={BUSINESS.phoneHref}>
                      <MagneticButton className="px-7 py-3.5 rounded-full text-base font-semibold text-white border border-white/15 flex items-center gap-2 cursor-pointer">
                        <Phone size={18} weight="duotone" />
                        Call the Hunsakers
                      </MagneticButton>
                    </a>
                  </motion.div>

                  {/* Badges below CTAs — recurring-maintenance + family-owned signal */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ ...spring, delay: 1.0 }}
                    className="flex flex-wrap gap-3 pt-2"
                  >
                    {/* Maintenance-route badge — pulses to draw attention because
                        recurring service is the highest-LTV product Mt View sells */}
                    <a
                      href="#maintenance"
                      className="relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white hover:opacity-90 transition"
                      style={{ background: `${PRIMARY}33`, border: `1px solid ${PRIMARY}66` }}
                    >
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: PRIMARY_LIGHT }} />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: PRIMARY_LIGHT }} />
                      </span>
                      Maintenance plans available
                    </a>
                    <span
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white"
                      style={{ background: EARTH_GLOW, border: `1px solid ${EARTH}44` }}
                    >
                      <Certificate size={14} weight="bold" style={{ color: EARTH }} />
                      Family-owned since 1976
                    </span>
                  </motion.div>
                </div>
              </RippleBorderCard>
            </div>

            {/* Hero Image — 60% width on desktop, behind the card overlap.
                Stretches to match the glass card's natural height (driven by
                the H1 + subhead + CTAs + badges). Removed maxHeight clamp
                that was creating the visible "card taller than image" gap
                where the rectangle bumped into the square. items-stretch
                on the parent flex makes both children share the tallest
                child's height now. */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: 0.3 }}
              className="relative z-10 lg:w-[60%] rounded-2xl overflow-hidden self-stretch"
              style={{ minHeight: 400 }}
            >
              <img
                src={PHOTOS.hero}
                alt="Mountain View landscape — engineered stonework with naturalistic plantings, Auburn WA"
                className="absolute inset-0 w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0f1a0f]/60 rounded-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 2. TRUST BAR ═══════════════ */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-5 md:p-6">
            <motion.div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {[
                { icon: Medal, label: `${yearsInBusiness}+ Years in the Region` },
                { icon: Certificate, label: "Family-Owned Since 1976" },
                { icon: CheckCircle, label: "Every Discipline In-House" },
                { icon: SealCheck, label: "Licensed & Insured (WA)" },
                { icon: Recycle, label: "Native & Climate-Smart Planting" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-center gap-2 text-slate-300">
                  <item.icon size={18} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══════════════ 2.5 · MAINTENANCE PLANS — RECURRING-REVENUE PRODUCT ═══════════════
           This section is intentionally placed BEFORE the design-build services
           section. Recurring maintenance is the highest-LTV product Mt View sells
           — capturing a maintenance customer for $200/mo is worth more over five
           years than a one-time $20k install. The hero badge "Maintenance plans
           available" anchors here. */}
      <SectionReveal id="maintenance" className="relative z-10 py-20 md:py-32 overflow-hidden" style={{ background: BG_CREAM }}>
        {/* Soft fade-in from the dark Trust Bar above so the cream
            doesn't slam in as a hard horizontal stripe. */}
        <div
          className="absolute inset-x-0 top-0 h-20 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, ${BG}, transparent)` }}
        />
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: PRIMARY }}>
              Already have a yard?
            </p>
            <h2 className="text-3xl md:text-5xl tracking-tighter leading-[1.05] font-bold mb-5" style={{ color: BG_CREAM_INK }}>
              <WordReveal text="We'll keep it that way." />
            </h2>
            <p className="leading-relaxed" style={{ color: BG_CREAM_INK_SOFT }}>
              Ongoing care is what keeps a $30,000 install looking like one a decade
              later. Bonnie Hunsaker runs Mt View&rsquo;s year-round maintenance route across
              King, Pierce, Snohomish &amp; Kittitas counties — three plans, all built around
              your property, all serviced by the same family crew that&rsquo;s been doing this
              since 1976.
            </p>
          </div>

          {/* Three-tier maintenance plans — Essentials / Full Care / Estate.
              Restyled for the cream band: solid white cards with forest-ink
              type instead of glass-on-dark. Featured tier (Full Care) gets
              a real visible ring + slightly elevated shadow + green wash. */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              {
                name: "Essentials",
                cadence: "Weekly or bi-weekly",
                ideal: "Front-yard homeowners, small lots",
                features: [
                  "Mowing, edging, line-trim",
                  "Blower clean-up of walks & drives",
                  "Seasonal debris removal",
                  "Curbside-bag disposal",
                ],
                accent: PRIMARY,
              },
              {
                name: "Full Care",
                cadence: "Weekly · year-round",
                ideal: "Most clients we install for",
                features: [
                  "Everything in Essentials",
                  "Bed weeding, mulch refresh",
                  "Pruning & deadheading",
                  "Spring & fall fertilization",
                  "Irrigation start-up &amp; winterize",
                ],
                accent: PRIMARY,
                featured: true,
              },
              {
                name: "Estate",
                cadence: "Custom schedule · 1+ acre",
                ideal: "Larger properties, custom landscapes",
                features: [
                  "Everything in Full Care",
                  "On-call repairs & touch-ups",
                  "Seasonal redesign & replanting",
                  "Lighting maintenance",
                  "Direct line to Tim & Bonnie",
                ],
                accent: EARTH_DARK,
              },
            ].map((plan, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className={`h-full ${plan.featured ? "md:-translate-y-3" : ""}`}
              >
                <div
                  className="h-full p-7 md:p-8 flex flex-col rounded-2xl bg-white transition-shadow"
                  style={{
                    // Featured tier: 2px ring + 6px halo + tall green-tinted shadow
                    // for genuine "elevated" feel. Non-featured: hairline + soft shadow.
                    boxShadow: plan.featured
                      ? `0 0 0 2px ${PRIMARY}, 0 0 0 8px ${PRIMARY}1f, 0 28px 80px -20px ${PRIMARY}55`
                      : "0 4px 20px -8px rgba(26, 36, 18, 0.12)",
                    border: plan.featured ? "none" : "1px solid rgba(26, 36, 18, 0.08)",
                  }}
                >
                  <div className="flex items-baseline justify-between mb-1 gap-2">
                    <span className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: plan.accent }}>
                      {plan.name}
                    </span>
                    {plan.featured && (
                      <span className="text-[10px] uppercase tracking-[0.18em] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: PRIMARY }}>
                        Most popular
                      </span>
                    )}
                  </div>
                  <p className="text-2xl md:text-3xl font-bold mb-1" style={{ color: BG_CREAM_INK }}>{plan.cadence}</p>
                  <p className="text-sm mb-6" style={{ color: BG_CREAM_INK_SOFT }}>{plan.ideal}</p>
                  <ul className="space-y-2.5 mb-7 flex-1">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2.5 text-sm" style={{ color: BG_CREAM_INK }}>
                        <CheckCircle size={16} weight="fill" style={{ color: plan.accent }} className="shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contact"
                    className="block w-full text-center px-5 py-3 rounded-full text-sm font-semibold transition-colors"
                    style={{
                      background: plan.featured ? PRIMARY : "transparent",
                      color: plan.featured ? "#ffffff" : BG_CREAM_INK,
                      border: plan.featured ? "none" : `1.5px solid ${BG_CREAM_INK}`,
                    }}
                  >
                    {plan.featured ? "Join the route" : "Get a quote"}
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <p className="text-center text-xs mt-8 max-w-2xl mx-auto leading-relaxed" style={{ color: BG_CREAM_INK_SOFT }}>
            Pricing is per-property — quoted after a free walk-through so we can see
            the lot before we put numbers on it. Most clients sit at $180&ndash;$420/mo.
          </p>
        </div>
      </SectionReveal>

      {/* ═══════════════ 3. SERVICES — 8 ACCORDION CARDS ═══════════════ */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <LeafPattern opacity={0.025} />
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left side — sticky header */}
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>Practice</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Every Discipline In-House" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Mountain View runs design, hardscape, planting, irrigation, and lighting under one crew. Nothing falls between trades, and nothing waits on a sub. Click any service to learn more.
              </p>
              <div className="hidden lg:block">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/[0.07]">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: PRIMARY_LIGHT }} />
                  <span className="text-sm text-slate-400">Now scheduling spring &amp; summer projects</span>
                </div>
              </div>
            </div>
            {/* Right side — accordion */}
            <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {services.map((svc, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="overflow-hidden">
                    <button
                      onClick={() => setOpenService(openService === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: i % 2 === 0 ? PRIMARY_GLOW : EARTH_GLOW }}>
                          <svc.icon size={20} weight="duotone" style={{ color: i % 2 === 0 ? PRIMARY_LIGHT : EARTH }} />
                        </div>
                        <span className="text-lg font-semibold text-white">{svc.title}</span>
                      </div>
                      <motion.div animate={{ rotate: openService === i ? 180 : 0 }} transition={spring}>
                        <CaretDown size={20} className="text-slate-400" />
                      </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {openService === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                          <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed pl-[4.5rem]">{svc.desc}</p>
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

      {/* ═══════════════ WHY MT VIEW — VALUE PROPS ═══════════════
           Warm color wash added 2026-05-02: subtle radial gradient
           combining PRIMARY_GLOW + EARTH_GLOW. Breaks up the dark
           monochromatic stretch between Services and Process. */}
      <SectionReveal className="relative z-10 py-12 md:py-20 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 25% 50%, ${PRIMARY_GLOW} 0%, transparent 55%),
                          radial-gradient(ellipse at 75% 50%, ${EARTH_GLOW} 0%, transparent 50%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: PRIMARY_LIGHT }}>The Mountain View Standard</p>
            <h2 className="text-3xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Why Homeowners Call Us Back" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              { icon: Certificate, title: "Same Family Since 1976", desc: "Tim and Bonnie Hunsaker — same standard, same crew style, the whole way through. Most of our work is repeat clients on their next phase." },
              { icon: PaintBrush, title: "Design You See First", desc: "A concept and planting plan with materials and scope, before we break ground. The install runs from the same drawing." },
              { icon: ShieldCheck, title: "Engineered to Last", desc: "Walls, walkways, and water features sized for a Pacific Northwest rainy season — not for a finish photograph." },
              { icon: Recycle, title: "Climate-Smart First", desc: "PNW natives and adapted species default. Lower water, lower maintenance, plants that make it past their second winter." },
            ].map((v, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full text-center">
                  <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-4" style={{ background: PRIMARY_GLOW }}>
                    <v.icon size={24} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════ 5. PROCESS — 5 STEPS ═══════════════ */}
      <SectionReveal id="process" className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
          <svg width="100%" height="100%"><pattern id="land-dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="1" fill={PRIMARY_LIGHT} /></pattern><rect width="100%" height="100%" fill="url(#land-dots)" /></svg>
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>How We Work</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="How a Project Unfolds" />
            </h2>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px hidden md:block" style={{ background: `linear-gradient(180deg, transparent, ${PRIMARY}60, ${EARTH}40, transparent)` }} />
            <motion.div className="space-y-5 md:space-y-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {processSteps.map((step, i) => (
                <motion.div key={i} variants={fadeUp} className={`flex items-start gap-6 md:gap-12 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <GlassCard className="p-6 inline-block">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}>
                          <step.icon size={20} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                        </div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: EARTH }}>Step {step.step}</span>
                          <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                    </GlassCard>
                  </div>
                  <div className="hidden md:flex w-12 shrink-0 justify-center relative z-10">
                    <div className="w-4 h-4 rounded-full border-2 mt-8" style={{ borderColor: PRIMARY_LIGHT, background: BG }} />
                  </div>
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ 6. ABOUT TIM — OWNER SPOTLIGHT ═══════════════
          NOTE: Mt View has no client-released portrait of Tim that survived
          the photo-screening rule (the team-portrait + "unnamed (14)" are
          excluded). Spotlight uses a Mountain View landscape photo as the
          feature image instead — keeps the section but stays honest. */}
      <SectionReveal id="about" className="relative z-10 py-20 md:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: `radial-gradient(circle, ${PRIMARY} 0%, transparent 60%)`, opacity: 0.08, filter: "blur(80px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img src={PHOTOS.kirse017} alt="A Mountain View installation — garden path detail" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <GlassCard className="px-5 py-3 flex items-center gap-3">
                  <Certificate size={20} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                  <span className="text-sm text-white font-medium">{yearsInBusiness} years landscaping in the region</span>
                </GlassCard>
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>About</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="The Hunsakers" />
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>Mountain View Landscape &amp; Design is a family-owned firm based in Auburn, Washington. <span className="text-white font-medium">Tim Hunsaker</span> has been landscaping in the Pacific Northwest since 1976 — first under the Shamrock Landscaping name, then as Mountain View. <span className="text-white font-medium">Bonnie Hunsaker</span> runs the maintenance side of the business — the year-round route, bed work, pruning, and the relationships with clients who call back every season.</p>
                <p>The work is residential, the crew is local, and every discipline runs in-house. Forty-nine seasons of installs in this region tells you which plants make it past their second winter and which ones don&rsquo;t. It tells you how to size a base course for our rainfall. It tells you which clients call back, and why.</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Certificate, label: "Family-Owned Since 1976" },
                  { icon: ShieldCheck, label: "Licensed & Insured (WA)" },
                  { icon: Recycle, label: "Climate-Smart Planting" },
                  { icon: Heart, label: "Locally Run" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}>
                      <item.icon size={16} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                    </div>
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ 7. PROJECT PORTFOLIO — STAGGERED MASONRY ═══════════════ */}
      <SectionReveal id="work" className="relative z-10 py-20 md:py-32">
        <LeafPattern opacity={0.02} />
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>Selected Work</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="From the Archive" />
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-slate-400 leading-relaxed">A representative slice of the archive — residential installations, hardscape, water features, and lighting — drawn from work delivered across the four-county footprint.</p>
          </div>
          <motion.div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {projects.map((p, i) => {
              const heights = ["h-[280px]", "h-[340px]", "h-[260px]", "h-[320px]", "h-[290px]", "h-[350px]"];
              return (
                <motion.div key={i} variants={fadeUp} className="break-inside-avoid">
                  <div className="group relative rounded-2xl overflow-hidden border border-white/15">
                    <img src={p.image} alt={p.title} className={`w-full ${heights[i]} object-cover transition-transform duration-700 group-hover:scale-105`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-white font-semibold text-lg">{p.title}</h3>
                      <p className="text-sm mt-1 flex items-center gap-1" style={{ color: PRIMARY_LIGHT }}>
                        <MapPin size={14} weight="fill" /> {p.location}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{p.scope}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Detail strip — 6 in-grid photos under the lead masonry. Reuses
              cluster shots from each project so the archive depth shows. */}
          <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              { src: PHOTOS.kirse006, alt: "Kirse residence — entry walkway in natural stone" },
              { src: PHOTOS.stone543, alt: "Stoneworks — engineered single-tier retaining wall" },
              { src: PHOTOS.stone409, alt: "Stoneworks — landscape integrated with retaining wall" },
              { src: PHOTOS.aqua9406, alt: "Aquavista — water feature integrated into the landscape" },
              { src: PHOTOS.olano024, alt: "Olano residence — yard view" },
              { src: PHOTOS.june022, alt: "Mountain View — summer plantings" },
            ].map((d, i) => (
              <motion.div key={i} variants={fadeUp} className="aspect-square rounded-xl overflow-hidden border border-white/15">
                <img src={d.src} alt={d.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════ 8. SEASONAL SERVICES CALENDAR ═══════════════
           Sage band added 2026-05-02. Different texture from the cream
           Maintenance band — paler, more meadow-toned. Cards stay
           neutral white with forest-ink type for contrast. */}
      <SectionReveal className="relative z-10 py-20 md:py-32 overflow-hidden" style={{ background: BG_SAGE }}>
        {/* Soft fade-in from the dark portfolio above */}
        <div
          className="absolute inset-x-0 top-0 h-20 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, ${BG}, transparent)` }}
        />
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.2em] mb-3 font-medium" style={{ color: EARTH_DARK }}>Year-Round Partnership</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold" style={{ color: BG_SAGE_INK }}>
              <WordReveal text="A Yard Through the Seasons" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {seasonalData.map((s, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div
                  className="p-6 h-full rounded-2xl transition-shadow relative overflow-hidden"
                  style={{
                    background: s.bg,
                    boxShadow: "0 4px 20px -8px rgba(31, 44, 28, 0.18)",
                    border: `1px solid ${s.accent}33`,
                  }}
                >
                  {/* Top accent strip — gives each season its own
                      visual signature without overpowering the card. */}
                  <div
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ background: s.accent }}
                  />
                  <div className="flex items-center gap-3 mb-4 mt-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.accent}30` }}>
                      <s.icon size={22} weight="duotone" style={{ color: s.accent }} />
                    </div>
                    <h3 className="text-xl font-bold" style={{ color: BG_SAGE_INK }}>{s.season}</h3>
                  </div>
                  <ul className="space-y-2">
                    {s.tasks.map((t, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm" style={{ color: BG_SAGE_INK }}>
                        <CheckCircle size={14} weight="duotone" style={{ color: s.accent }} className="shrink-0 mt-0.5" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════ 9. YARD QUIZ ═══════════════ */}
      <SectionReveal className="relative z-10 py-12 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <HandPointing size={32} weight="duotone" style={{ color: PRIMARY_LIGHT }} className="mx-auto mb-3" />
                <h2 className="text-3xl md:text-4xl tracking-tighter font-bold text-white mb-2">What does your yard need?</h2>
                <p className="text-slate-400">Select the option that best describes the project.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Full-Yard Install", color: PRIMARY_LIGHT, desc: "Design, plant, hardscape — start to finish" },
                  { label: "Hardscape Project", color: "#f59e0b", desc: "Patio, walkway, retaining wall" },
                  { label: "Water Feature", color: EARTH, desc: "Pond, waterfall, naturalistic stream" },
                  { label: "Lighting & Aftercare", color: "#f97316", desc: "Night lighting or maintenance on existing" },
                ].map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setQuizChoice(i)}
                    className={`p-5 rounded-xl text-left border transition-all duration-300 cursor-pointer ${quizChoice === i ? "border-green-500/50 bg-white/[0.08]" : "border-white/15 bg-white/[0.07] hover:bg-white/[0.08]"}`}
                  >
                    <div className="w-3 h-3 rounded-full mb-3" style={{ background: opt.color }} />
                    <div className="text-white font-semibold">{opt.label}</div>
                    <div className="text-xs text-slate-500 mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
              {quizChoice !== null && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
                  <a href={BUSINESS.phoneHref}>
                    <MagneticButton className="px-8 py-3 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                      <span className="flex items-center gap-2"><Phone size={16} weight="duotone" /> Call {BUSINESS.phoneDisplay} for a free site visit</span>
                    </MagneticButton>
                  </a>
                </motion.div>
              )}
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ═══════════════ 10. ECO / CLIMATE-SMART SECTION ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] rounded-full" style={{ background: `radial-gradient(circle, ${PRIMARY} 0%, transparent 60%)`, opacity: 0.06, filter: "blur(100px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: PRIMARY_LIGHT }}>Climate-Smart Landscapes</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Plants That Belong Here" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                We default to Pacific Northwest natives and climate-adapted species. Forty-nine seasons of installs in this region tells you which plants make it past their second winter — and water-smart irrigation keeps the rest of the planting plan honest.
              </p>
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-5" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
                {ecoFeatures.map((eco, i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}>
                        <eco.icon size={20} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{eco.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed mt-1">{eco.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img src={PHOTOS.stone420} alt="Mountain View installation — climate-adapted plantings carried through engineered hardscape" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1a0f]/70 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="px-4 py-2 rounded-full backdrop-blur-md border border-green-500/30 bg-black/40 flex items-center gap-2">
                  <Recycle size={16} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                  <span className="text-sm font-medium text-white">Native &amp; Climate-Adapted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ 11. WHAT CLIENTS TELL US (no fabricated testimonials) ═══════════════
          Template's testimonials section had 5 fake review cards. Mt View has
          no published testimonials, so this is rebuilt as voice-of-Tim
          observations on Mountain View landscape photos — kept as 3 cards
          (vs. 5) so it doesn't read as filler. */}
      <SectionReveal id="reviews" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>The Standard</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-4">
              <WordReveal text="What Clients Tell Us" />
            </h2>
            <p className="max-w-xl mx-auto text-slate-400 leading-relaxed mt-4">Three observations from forty-nine seasons of installing in this region — about the work, the crew, and the clients who keep coming back.</p>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {observations.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden h-full flex flex-col">
                  <div className="h-36 overflow-hidden relative">
                    <img src={t.image} alt="A Mountain View landscape" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1a0f] via-transparent to-transparent" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <Quotes size={24} weight="fill" style={{ color: PRIMARY_LIGHT }} className="mb-2 opacity-40" />
                    <p className="text-sm text-slate-300 leading-relaxed flex-1">{t.text}</p>
                    <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{t.name}</span>
                      <Star size={14} weight="fill" style={{ color: PRIMARY_LIGHT }} />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════ 12. COMPETITOR COMPARISON ═══════════════ */}
      <SectionReveal className="relative z-10 py-12 md:py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>Why Mountain View</p>
            <h2 className="text-3xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Mountain View vs Mow-and-Go Crews" />
            </h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="text-left p-4 text-slate-400 font-medium">Capability</th>
                    <th className="text-center p-4 font-semibold text-white">Mountain View</th>
                    <th className="text-center p-4 text-slate-500 font-medium">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={i} className="border-b border-white/8">
                      <td className="p-4 text-slate-300">{row.feature}</td>
                      <td className="p-4 text-center">
                        <CheckCircle size={20} weight="fill" style={{ color: PRIMARY_LIGHT }} className="inline-block" />
                      </td>
                      <td className="p-4 text-center text-slate-500">
                        {row.them === true ? <CheckCircle size={20} weight="fill" className="inline-block text-slate-500" /> : row.them === false ? <XIcon size={20} className="inline-block text-red-400/60" /> : <span className="text-xs">{row.them}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* Removed 2026-05-02: "Night Work" feature strip used DSC00415
          (a daytime work-van shot) with "after sunset" copy — Ben
          flagged it as out-of-context. Mt View only has ONE real
          after-dark photo (DSC00449 / PHOTOS.nightLead) and it's
          already used in the projects section. Rather than reuse the
          same photo twice, the night-lighting content stays where
          the photography supports it (services accordion + projects).
          If Tim commissions actual night-lighting photography later,
          this section can come back. */}

      {/* ═══════════════ 14. CONTACT — uses MtViewContactForm ═══════════════ */}
      <SectionReveal id="contact" className="relative z-10 py-20 md:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full" style={{ background: `radial-gradient(circle, ${PRIMARY} 0%, transparent 60%)`, opacity: 0.05, filter: "blur(100px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>Get Started</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Tell the Hunsakers about your yard" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Site visits are free across King, Pierce, Snohomish &amp; Kittitas counties. We typically respond within one business day, usually faster.
              </p>
              <div className="space-y-5">
                {[
                  { icon: MapPin, label: "Office", value: BUSINESS.address.full, href: `https://maps.google.com/?q=${encodeURIComponent(BUSINESS.address.full)}` },
                  { icon: Phone, label: "Phone", value: BUSINESS.phoneDisplay, href: BUSINESS.phoneHref },
                  { icon: Envelope, label: "Email", value: BUSINESS.email, href: `mailto:${BUSINESS.email}` },
                  { icon: Clock, label: "Service Area", value: `${BUSINESS.counties.join(", ")} counties` },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <item.icon size={20} weight="duotone" style={{ color: PRIMARY_LIGHT }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors">{item.value}</a>
                      ) : (
                        <p className="text-sm text-slate-400">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: PRIMARY_LIGHT }} />
                <span className="text-sm text-slate-400">Now booking spring &amp; summer projects</span>
              </div>
            </div>
            {/* Inverted color treatment: the contact form is a light, sharp-
                cornered card so it visually registers as the primary action
                against the dark page. Strips rounded-* so MtViewContactForm
                children render as squared boxes per the form's editorial
                styling. */}
            <div className="bg-[#f8f5ef] text-[#1a1612] rounded-2xl p-6 md:p-8 border border-white/10 [&_.rounded-2xl]:rounded-none [&_.rounded-xl]:rounded-none [&_.rounded-lg]:rounded-none [&_.rounded-3xl]:rounded-none">
              <h3 className="text-xl font-semibold mb-6">Request a free site visit</h3>
              <MtViewContactForm services={services.map((s) => s.title)} />
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ 15. SERVICE AREA ═══════════════ */}
      <SectionReveal id="service-area" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>Where We Work</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Four Counties, Same Crew" />
            </h2>
          </div>
          <GlassCard className="p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: PRIMARY_GLOW }}>
                  <MapPin size={28} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Coverage</h3>
                <p className="text-sm text-slate-400 leading-relaxed">King, Pierce, Snohomish &amp; Kittitas counties — based out of Auburn, WA. Site visits across the four-county footprint are free.</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: PRIMARY_GLOW }}>
                  <Clock size={28} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Response</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Typically within one business day, usually faster. Site visits scheduled at your pace, not on a quarterly cadence.</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: PRIMARY_GLOW }}>
                  <CalendarCheck size={28} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Availability</h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: PRIMARY_LIGHT }} />
                  <span className="text-sm font-medium" style={{ color: PRIMARY_LIGHT }}>Booking new projects</span>
                </div>
                <p className="text-sm text-slate-400">Family-owned since {BUSINESS.established}</p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/8">
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  "Auburn", "Seattle", "Bellevue", "Kent", "Renton", "Federal Way",
                  "Tacoma", "Puyallup", "Bonney Lake", "Gig Harbor",
                  "Everett", "Lynnwood", "Bothell",
                  "Ellensburg", "Cle Elum",
                ].map((area) => (
                  <span key={area} className="px-3 py-1 rounded-full text-xs border border-white/15 text-slate-400 bg-white/[0.07]">{area}</span>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══════════════ 16. FAQ ═══════════════ */}
      <SectionReveal className="relative z-10 py-12 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>Common Questions</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Frequently Asked" />
            </h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
                    <span className="text-base font-semibold text-white pr-4">{faq.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}>
                      <CaretDown size={20} className="text-slate-400 shrink-0" />
                    </motion.div>
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

      {/* ═══════════════ 17. FOOTER ═══════════════ */}
      <footer className="relative z-10 border-t border-white/8 py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Tree size={22} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                <span className="text-lg font-bold text-white">{BUSINESS.shortName}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">Family-owned landscape design and installation in Auburn, WA. Serving King, Pierce, Snohomish &amp; Kittitas counties since {BUSINESS.established}.</p>
              <div className="flex flex-wrap gap-2">
                {["Family-Owned", "In-House", "Licensed", "Insured"].map((badge) => (
                  <span key={badge} className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-white/15 text-slate-500 bg-white/[0.07]">{badge}</span>
                ))}
              </div>
            </div>
            {/* Services */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Practice</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                {services.slice(0, 6).map((svc) => (
                  <li key={svc.title}><a href="#services" className="hover:text-white transition-colors">{svc.title}</a></li>
                ))}
              </ul>
            </div>
            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">On the page</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#about" className="hover:text-white transition-colors">About Tim</a></li>
                <li><a href="#work" className="hover:text-white transition-colors">Selected Work</a></li>
                <li><a href="#process" className="hover:text-white transition-colors">Process</a></li>
                <li><a href="#service-area" className="hover:text-white transition-colors">Service Area</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Tell the Hunsakers about your yard</a></li>
              </ul>
            </div>
            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
              <div className="space-y-3 text-sm text-slate-500">
                <p className="flex items-start gap-2">
                  <Phone size={14} weight="duotone" style={{ color: PRIMARY_LIGHT }} className="mt-0.5 shrink-0" />
                  <a href={BUSINESS.phoneHref} className="hover:text-white transition-colors">{BUSINESS.phoneDisplay}</a>
                </p>
                <p className="flex items-start gap-2">
                  <Envelope size={14} weight="duotone" style={{ color: PRIMARY_LIGHT }} className="mt-0.5 shrink-0" />
                  <a href={`mailto:${BUSINESS.email}`} className="hover:text-white transition-colors break-all">{BUSINESS.email}</a>
                </p>
                <p className="flex items-start gap-2">
                  <MapPin size={14} weight="duotone" style={{ color: PRIMARY_LIGHT }} className="mt-0.5 shrink-0" />
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(BUSINESS.address.full)}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{BUSINESS.address.street}<br />{BUSINESS.address.city}, {BUSINESS.address.state} {BUSINESS.address.zip}</a>
                </p>
                <p className="flex items-start gap-2">
                  <Clock size={14} weight="duotone" style={{ color: PRIMARY_LIGHT }} className="mt-0.5 shrink-0" />
                  <span>{BUSINESS.counties.join(", ")} counties</span>
                </p>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Tree size={14} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
              <span>{BUSINESS.name} &copy; {new Date().getFullYear()}. All rights reserved.</span>
            </div>
            <p className="text-xs text-slate-600 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Built by <a href="https://bluejayportfolio.com/audit" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400 transition-colors">BlueJays</a>{" "}— get your free site audit</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
