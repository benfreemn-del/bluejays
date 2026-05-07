"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase uses plain img tags intentionally. */

/**
 * /clients/hector-landscaping — Hector Landscaping & Design Inc. (Renton, WA).
 *
 * v3 rebuild (2026-05-01): clones the v2/landscaping portfolio template
 * (`src/app/v2/landscaping/page.tsx`) verbatim in structure, then swaps
 * every placeholder for Hector Landscaping's real business details and 19
 * curl-verified Squarespace CDN photos. All Unsplash URLs removed.
 *
 * Components preserved from the prior bespoke build:
 *   StickyNav         (mobile-hamburger client nav)
 *   HectorLandscapingContactForm (wired to /api/clients/inquire)
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
import HectorLandscapingContactForm from "./contact-form";
import ReviewsCarousel from "./reviews-carousel";

/* ───────────────────────── BUSINESS ───────────────────────── */
const BUSINESS = {
  name: "Hector Landscaping & Design",
  shortName: "Hector Landscaping",
  established: 2018,
  phoneDisplay: "(206) 681-3877",
  phoneHref: "tel:+12066813877",
  email: "hectorlandscapingonline@gmail.com",
  address: {
    street: "1408 Index Ave NE",
    city: "Renton",
    state: "WA",
    zip: "98056",
    full: "1408 Index Ave NE, Renton, WA 98056",
  },
  counties: ["King", "Pierce"],
} as const;

const LOGO =
  "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1564018868094-RPR549S5LI918CMW8EN9/Hector%2BLandscaping%2BLogo%2BYard.jpg?format=1500w";

/* ───────────────────────── HECTOR PHOTO LIBRARY (25 from his Squarespace) ─────
   All URLs pulled from his existing Squarespace CDN. We re-organize
   them into thematic clusters that match the on-page sections:
   hardscape & pavers, retaining walls, sod & lawn, full-yard projects.
   Older Squarespace URLs don't accept ?format= so they're rendered as
   originals. */
const PHOTOS = {
  // ─── HERO ─── Strongest portfolio shot: side-yard with stepping
  // stones, dark mulch beds, plantings, cedar privacy fence + bollard
  // light. Real Hector phone capture — 1.9MB native, beats every
  // Squarespace-cropped web shot in resolution + composition.
  hero: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/e21eb5d8-1dbb-4c52-ab70-456921b0a94e/Photo+Jun+08+2021%2C+3+30+52+PM.jpg",

  // ─── REAL PORTFOLIO — Hector's Phone Captures (1.5–2.1MB each) ───
  yardJun1: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/e21eb5d8-1dbb-4c52-ab70-456921b0a94e/Photo+Jun+08+2021%2C+3+30+52+PM.jpg",
  yardJun2: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1c1a47d7-39fc-4917-b830-182ff2a1b2ef/Photo+Jun+08+2021%2C+3+30+58+PM.jpg",
  yardJul:  "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/3ad7db31-09c6-4525-82e3-288033b2ffa7/Photo+Jul+27+2021%2C+2+34+23+PM.jpg",
  yardDec1: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1672371741329-2LRC8980E8URYZJ8RGHQ/Photo+Dec+14+2022%2C+10+23+36+AM.jpg",
  yardDec2: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1672371857664-RNVXY4XTDZIU5AFGPPZX/Photo+Dec+14+2022%2C+10+23+43+AM.jpg",
  yardDec3: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1672371909114-QJ3WAQXOO51Z7TBKA9V6/Photo+Dec+14+2022%2C+10+24+16+AM.jpg",
  yardDec5: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/366bffd1-20ae-49ef-be4f-10747ab0adc6/Photo+Dec+14+2022%2C+10+24+09+AM.jpg",

  // ─── FULL BACKYARD TRANSFORMATION ─── The "whole deal" wide shot:
  // patio + dry creek + curved beds + bushes + fresh lawn + house in
  // frame. Used as the About Hector spotlight + featured project lead.
  fullYard: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1567477064017-WYM36TXYQVTAVMT045FC/maxresdefault.jpg",

  // ─── HARDSCAPE & PAVERS — Squarespace web crops (lower res but
  // verified portfolio shots: backyard paver patios, brick walkways,
  // fire-pit area) ───
  hardscapeWide:  "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1567477339937-LY6F1JKFRWRDSLXUEX1O/hardscape-11.jpg",
  paver1: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1567471480808-J78224F71OX3SKTR56AH/paver1.PNG",
  paver2: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1567471481073-1MW9D768SGLBXCITI8X4/paver2.PNG",
  paver3: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1567471484506-II1PRTWCLXN28YR7B9IT/paver3.PNG",
  paver4: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1567471485624-RQN3BNDNFMFOEDPLLW3C/paver4.PNG",
  brick1: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1567472109602-G4P99NXLRBKGG89US7M3/brick1.PNG",
  brick2: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1567472109131-EIDYS20LTHA5T36LHZVD/brick2.PNG",
  brick3: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1567472111007-FWU4BDK8EEYJN4VVGPTG/brick3.PNG",

  // ─── RETAINING WALL ─── Single verified Hector wall + plantings shot.
  retainingMain: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1565058891162-OIS6MHJGI9ZH3JNJAJO1/retaining-wall1.jpg",

  // ─── LAWN ─── Single high-quality lawn shot.
  lawnFinished: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1567477190007-T44NY9I44S0Z3307JUJC/lawn.jpg",

  // ─── ALIASES (legacy keys still referenced by some sections,
  // re-pointed at strong real shots) ───
  // hardscapeShot1 + hardscapeShot2 were stock/hash files. yardDec4
  // was a 53KB low-quality phone shot. retainingBuild was a stock
  // "Building a Retaining Wall at Home" pull. stoneAccent was a
  // stock 1861659.jpg lawn-mower closeup. sodInstall was a low-res
  // staged shot. All re-pointed at verified portfolio.
  hardscapeShot1: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1567471480808-J78224F71OX3SKTR56AH/paver1.PNG",
  hardscapeShot2: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1567471481073-1MW9D768SGLBXCITI8X4/paver2.PNG",
  yardDec4: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1672371741329-2LRC8980E8URYZJ8RGHQ/Photo+Dec+14+2022%2C+10+23+36+AM.jpg",
  retainingBuild: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1672371909114-QJ3WAQXOO51Z7TBKA9V6/Photo+Dec+14+2022%2C+10+24+16+AM.jpg",
  stoneAccent: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1672371741329-2LRC8980E8URYZJ8RGHQ/Photo+Dec+14+2022%2C+10+23+36+AM.jpg",
  sodInstall: "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1567477190007-T44NY9I44S0Z3307JUJC/lawn.jpg",

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
// BG_CREAM/BG_CREAM_INK/BG_CREAM_INK_SOFT removed 2026-05-06 — only
// referenced by the maintenance-plans section which is gone. Reinstate
// from git history if/when the maintenance band comes back.
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
  // margin: "300px 0px 300px 0px" — POSITIVE margin expands the
  // detection area so sections register as in-view BEFORE they
  // actually scroll into the viewport. Was previously "-80px" which
  // meant anchor-link jumps (e.g. #contact) landed on a section that
  // hadn't yet triggered its fade-in, leaving the user staring at a
  // blank void until they scrolled 1px. With this margin, anchor
  // jumps always land on already-revealed content.
  const isInView = useInView(ref, { once: true, margin: "300px" });
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
 * for the plumber-style overlapping-card hero on Hector Landscaping). Tinted with
 * Hector Landscaping's PRIMARY (forest green) + EARTH (warm brown) instead of the
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

// Hector's accordion services. Pared from 8 to 6 on 2026-05-06 after a
// visual audit — "Water Features" and "Night Lights" both lacked any
// real Hector portfolio photo, so we removed them rather than ship
// stock-mismatched cards. Reinstate the moment Hector sends a real
// pond/waterfall shot and a real low-voltage night-lighting shot.
// Each service has a `photo` for the accordion expansion. Hector's
// archive doesn't have one unique photo per discipline, so a couple
// of duplicates across services are deliberate (yardJun2 reused for
// Irrigation + Native Planting since both showcase the same lush yard
// outcome) and acceptable per Ben's call.
const services = [
  { title: "Landscape Design", desc: "Site walk, concept, and a planting plan that respects what's already there before adding to it. The install runs from the same drawing — no surprises between the page and the ground.", icon: PaintBrush, photo: PHOTOS.hardscapeWide },
  { title: "Hardscapes", desc: "Patios, walkways, outdoor kitchens, and fire features in natural stone, pavers, and brick — built to last in a Pacific Northwest rainy season, not just to look right on day one.", icon: Mountains, photo: PHOTOS.paver1 },
  { title: "Retaining Walls", desc: "Engineered walls in natural stone, concrete, brick, or timber. Solves drainage and slope, reclaims yard, and reads as part of the design — not as a wall.", icon: Shovel, photo: PHOTOS.retainingMain },
  { title: "Irrigation", desc: "System design, install, and repair. Zoned for plant type and exposure, scheduled for our climate, and built to be serviceable years out.", icon: Drop, photo: PHOTOS.yardJun2 },
  { title: "Sod Installation", desc: "Grade work, soil amendment, and clean-edge sod laydown. The lawn looks finished the day we leave and roots in for the long haul.", icon: Leaf, photo: PHOTOS.lawnFinished },
  { title: "Native & Climate-Smart Planting", desc: "Pacific Northwest natives — Douglas Fir, Oregon Grape, Salal, Red Flowering Currant — for low-water, low-maintenance landscapes that already belong here.", icon: Plant, photo: PHOTOS.yardJun2 },
  // Water Features + Night Lights services removed pending real Hector
  // photos. Reinstate when Hector sends phone shots of his actual
  // pond/waterfall + low-voltage installs. Selling those services with
  // mismatched stock or wrong-discipline photos burns trust on cold
  // reads — the bait-and-switch of "Water Features" over a yard photo
  // is exactly what the audit caught.
];

// Process — 5 steps, voiced for Hector. Site visit → concept → plants → install → aftercare.
const processSteps = [
  { step: "01", title: "Site Visit", desc: "Hector walks the property with you, listens to what you want, and looks at soil, drainage, sun, and what's already growing well. No charge across the two-county service area. ", icon: Eye },
  { step: "02", title: "Concept & Design", desc: "A concept drawing with materials, planting plan, and a clear scope. You see the install on paper before we break ground — phased to your budget if it needs to be.", icon: Ruler },
  { step: "03", title: "Plant Selection", desc: "Plants picked for your site — natives and climate-adapted species first. Forty-nine seasons of installs in this region tells you which ones make it past their second winter.", icon: Plant },
  { step: "04", title: "Installation", desc: "One crew, run by Hector, from the first cleared lot to the last finished bed. Every discipline in-house — design, hardscape, irrigation, planting, sod. When it's done, you walk the yard with Hector for a final pass.", icon: Shovel },
  { step: "05", title: "Hand-Off", desc: "Final walk-through, plant care notes, and your direct line to Hector for any post-install questions. We're around for the next phase whenever it lands — most of our work is repeat clients calling back for the next yard or a friend's.", icon: Heart },
];

// 5 named Hector Landscaping projects, mapped from the existing PROJECTS array. Each
// project stays as one image in the masonry portfolio grid + has its lead
// photo reused in section spotlights (heroCards, owner spotlight, eco
// section, video placeholder, testimonial backdrops). All 19 photos used.
const projects = [
  { title: "Kirse Residence", location: "King County", scope: "Full-yard installation — terraced front-yard plantings, stone entry walkway, integrated bed work from curb to back door.", image: PHOTOS.hardscapeWide },
  { title: "Custom Stoneworks", location: "Western Washington", scope: "Engineered retaining walls in natural stone — built to hold a slope through a real PNW rainy season.", image: PHOTOS.retainingMain },
  { title: "Olano Property", location: "Puget Sound", scope: "Half-acre transformation across front, side, and rear yards — coordinated plantings, walkways, and grade work.", image: PHOTOS.lawnFinished },
  { title: "Stoneworks Detail", location: "King County", scope: "Tiered hardscape integration — stone wall meeting bed work and finished plantings.", image: PHOTOS.paver1 },
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
    tasks: ["Structural pruning", "Wall & hardscape repairs", "Concept design for spring", "Drainage & grading"],
  },
];

// REAL Google reviews — pulled directly from Hector Landscaping's Google Business
// Profile (5.0 average · 14 total · all 5-star). 10 reviews with full
// reviewer names, profile photos (Google CDN), text, and dates. Verified
// 2026-05-02 via Chrome automation against
// https://search.google.com/local/reviews?placeid=...
// We do NOT fabricate or paraphrase — these are exact quotes.
type Review = {
  name: string;
  meta: string;       // "Local Guide · 127 reviews" / "5 reviews" etc.
  date: string;       // "9 months ago"
  text: string;
  profilePic: string; // Google CDN URL
};
const reviews: Review[] = [
  {
    name: "Cody H",
    meta: "1 review",
    date: "9 months ago",
    text: "If you're considering any type of landscaping or lawn maintenance, I can't recommend Hector Landscaping & Design enough. Their expert team makes the entire process seamless and stress-free. If you're thinking about improving your yard whether a new design or just want to keep your lawn well maintained, this is the company you'll want to use!",
    profilePic: "https://lh3.googleusercontent.com/a/ACg8ocIhFh6Y5gPkgtnvqko0Wd8nZ2roGxDpE_vx_ngK3-qJQw6qsA=s128-c-rp-mo-br100",
  },
  {
    name: "Jay Freeman",
    meta: "Local Guide · 127 reviews · 932 photos",
    date: "9 months ago",
    text: "Always been amazing, helped us fix our sprinkler system. Hector are the best!",
    profilePic: "https://lh3.googleusercontent.com/a-/ALV-UjW7favqis2z2n9X9uF3xqXNLQB331PPUocuGg3Z0el0UR76M5B-2Q=s128-c-rp-mo-ba5-br100",
  },
  {
    name: "Jennifer Cline",
    meta: "2 reviews",
    date: "2 years ago",
    text: "The team that showed up to do our yard was on time, kind and did an amazing job. Could not be happier with the outcome and customer service - from sales to install - restored my faith in contracting out work for sure!",
    profilePic: "https://lh3.googleusercontent.com/a-/ALV-UjU973V77tJoDBQM9ZJ4NemJ2nhRSJ_EmkOVtmzT2Hq2SEWNsWw2_w=s128-c-rp-mo-br100",
  },
  {
    name: "Brandi Whitehurst",
    meta: "5 reviews",
    date: "9 months ago",
    text: "They did an amazing job, couldn't have turned out any better.",
    profilePic: "https://lh3.googleusercontent.com/a-/ALV-UjU7s7ftxlAoH8cLI8aAVuRFkc4qzCSNRnicjuzKKALBiEdZAMg=s128-c-rp-mo-br100",
  },
  {
    name: "Tierney Goaslind",
    meta: "6 reviews",
    date: "9 months ago",
    text: "Great installation and everything came together quicker than expected!",
    profilePic: "https://lh3.googleusercontent.com/a/ACg8ocJU92HajdoW-EiZ21tBZJuCZksIUOALbjpyiKjtS5djw_MOMA=s128-c-rp-mo-br100",
  },
  {
    name: "Kylee Trombley",
    meta: "1 review",
    date: "9 months ago",
    text: "This guy knows what he's doing!! I can't believe how good my yard looks. It's exactly how I wanted it.",
    profilePic: "https://lh3.googleusercontent.com/a-/ALV-UjVrD63Wya0zQ1lA2eDmicXIkCmwT7kTpKGxw0x2veWXsTmL60md=s128-c-rp-mo-br100",
  },
  {
    name: "Cindy McNabb",
    meta: "Local Guide · 202 reviews · 118 photos",
    date: "5 years ago",
    text: "Super friendly and professional family oriented business. I highly recommend.",
    profilePic: "https://lh3.googleusercontent.com/a/ACg8ocKWLFl5Bvu6Dj8UGX_tVdbo8WmKbWLFcJMBuhjOgce6FysdHw=s128-c-rp-mo-ba4-br100",
  },
  {
    name: "Monica Rein",
    meta: "2 reviews",
    date: "5 years ago",
    text: "Really professional and friendly! Would recommend to anyone!",
    profilePic: "https://lh3.googleusercontent.com/a/ACg8ocLdRRtiCACtCSlARU1ygzGdmEc4yTVObZ3PEyjr2u7-HaFvFg=s128-c-rp-mo-br100",
  },
  {
    name: "Brad Baker",
    meta: "Local Guide · 44 reviews · 192 photos",
    date: "8 years ago",
    text: "Easy to work with. Great pricing.",
    profilePic: "https://lh3.googleusercontent.com/a/ACg8ocJ6eVlKI_LNwSLF_lfPUaC-FEwJLGvmLvcmHgJl-rSfCwwMzw=s128-c-rp-mo-ba4-br100",
  },
  {
    name: "bob marley",
    meta: "5 reviews",
    date: "10 months ago",
    text: "Fast, competent, honest.",
    profilePic: "https://lh3.googleusercontent.com/a/ACg8ocJKq55aA8GoNvb9JJwvZvr4meV-b3-tW8FUPB_Wn1PplYYvbA=s128-c-rp-mo-br100",
  },
];

const comparisonRows = [
  { feature: "In-house design, hardscape & planting", us: true, them: false },
  { feature: "Engineered retaining walls", us: true, them: "Sometimes" },
  { feature: "Sod, grading & drainage on the same crew", us: true, them: "Sometimes" },
  { feature: "Native & climate-adapted plantings", us: true, them: "Limited" },
  { feature: "Irrigation design & install", us: true, them: false },
  { feature: "Same-owner continuity since 2018", us: true, them: false },
  { feature: "Free design before you commit", us: true, them: "Rare" },
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
  { q: "What's your service area?", a: "King and Pierce counties — based out of Renton, WA. Site visits across the two-county footprint are free. If you're close to the edge of that footprint and not sure, call. We'll tell you straight." },
  { q: "Do you do residential and commercial?", a: "Both, though our archive leans residential. Property managers, HOAs, and commercial sites have hired us for hardscape and planting work — same in-house crew, same standard." },
  { q: "How long has Hector Landscaping been around?", a: "Hector has been landscaping in the Renton area since 2018. Family-run from day one — same standard, same crew style, the whole way through." },
];

// Hero floating cards — three feature views from Hector Landscaping's archive.
const heroCards = [
  { src: PHOTOS.hardscapeWide, alt: "Kirse residence — full-yard installation with mature plantings" },
  { src: PHOTOS.retainingMain, alt: "Custom Stoneworks — tiered retaining wall in natural stone" },
  { src: PHOTOS.lawnFinished, alt: "Olano Property — finished lawn carried through coordinated bed work" },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function HectorLandscapingLandscapingPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const yearsInBusiness = new Date().getFullYear() - BUSINESS.established;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      {/* Earthy scrollbar — brown roots → green growth */}
      <style>{`
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #0f1a0f; }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to top, #16a34a, #4a7c2f, #7c5a1e, #5c3311);
          border-radius: 8px;
          border: 2px solid #0f1a0f;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to top, #22c55e, #5a9c3a, #9c7030, #7a4418);
        }
        * { scrollbar-width: thin; scrollbar-color: #5c7a2a #0f1a0f; }
      `}</style>
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
                    className="text-sm md:text-base uppercase tracking-widest font-medium flex items-center gap-2 flex-wrap"
                    style={{ color: PRIMARY_LIGHT }}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      Affordable Landscaping with a 5-Star Reputation
                      <SealCheck
                        size={18}
                        weight="fill"
                        style={{ color: "#1d9bf0" }}
                        aria-label="Verified 5-star reputation"
                      />
                    </span>
                  </motion.p>

                  <h1 className="text-4xl md:text-5xl lg:text-[60px] xl:text-[72px] tracking-tighter leading-[1.02] font-bold text-white">
                    <WordReveal text="Built to last. Designed to wow." />
                  </h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.6 }}
                    className="text-lg text-slate-400 leading-relaxed max-w-md"
                  >
                    Hardscapes, pavers, retaining walls, sod, and full-yard
                    transformations across the greater Renton area.
                    Owner-operated by Hector — every project is hands-on,
                    on-budget, and built to last more than a decade.
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
                        Call Hector
                      </MagneticButton>
                    </a>
                  </motion.div>

                  {/* Badge below CTAs — family-owned signal. Recurring-
                      maintenance badge removed 2026-05-06 since Hector
                      doesn't sell maintenance plans as a structured
                      service. Reinstate when/if that changes. */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ ...spring, delay: 1.0 }}
                    className="flex flex-wrap gap-3 pt-2"
                  >
                    <span
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white"
                      style={{ background: EARTH_GLOW, border: `1px solid ${EARTH}44` }}
                    >
                      <Certificate size={14} weight="bold" style={{ color: EARTH }} />
                      Owner-operated since 2018
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
                src={PHOTOS.fullYard}
                alt="Hector Landscaping — full backyard transformation: patio, dry creek, curved beds, fresh lawn — Renton WA"
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
                { icon: Certificate, label: "Owner-Operated Since 2018" },
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

      {/* ═══════════════ 2.5 · MAINTENANCE PLANS · REMOVED 2026-05-06 ═══════════════
           Hector doesn't sell structured maintenance plans (Essentials
           / Full Care / Estate). Full ~140-line section (cream/parchment
           band with three pricing tiers) deleted from JSX entirely.
           Reinstate from git history if/when Hector formalizes a
           maintenance offering. */}

      {/* ═══════════════ 3. SERVICES — 6 ACCORDION CARDS ═══════════════ */}
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
                Hector Landscaping runs design, hardscape, planting, irrigation, and sod work under one crew. Nothing falls between trades, and nothing waits on a sub. Click any service to learn more.
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
                          <div className="px-5 pb-5 md:px-6 md:pb-6 pl-[4.5rem] space-y-4">
                            <p className="text-slate-400 leading-relaxed">{svc.desc}</p>
                            {/* Context-relevant photo from the Hector Landscaping archive.
                                Per Ben: duplicates across services are OK
                                here since the archive doesn't have one
                                unique frame per discipline. */}
                            <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-[16/9]">
                              <img
                                src={svc.photo}
                                alt={`${svc.title} — Hector Landscaping & Design`}
                                className="absolute inset-0 w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            </div>
                          </div>
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

      {/* ═══════════════ WHY HECTOR LANDSCAPING — VALUE PROPS ═══════════════
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
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: PRIMARY_LIGHT }}>The Hector Landscaping Standard</p>
            <h2 className="text-3xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Why Homeowners Call Us Back" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              { icon: Certificate, title: "Same Family Since 2018", desc: "Owner-operated by Hector — same standard, same crew style, the whole way through. Most of our work is repeat clients calling back for the next phase." },
              { icon: PaintBrush, title: "Design You See First", desc: "A concept and planting plan with materials and scope, before we break ground. The install runs from the same drawing." },
              { icon: ShieldCheck, title: "Engineered to Last", desc: "Walls, walkways, and stone work sized for a Pacific Northwest rainy season — not for a finish photograph." },
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

      {/* ═══════════════ 6. ABOUT HECTOR — OWNER SPOTLIGHT ═══════════════
          NOTE: Hector Landscaping has no client-released portrait of Hector that survived
          the photo-screening rule (the team-portrait + "unnamed (14)" are
          excluded). Spotlight uses a Hector Landscaping landscape photo as the
          feature image instead — keeps the section but stays honest. */}
      <SectionReveal id="about" className="relative z-10 py-20 md:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: `radial-gradient(circle, ${PRIMARY} 0%, transparent 60%)`, opacity: 0.08, filter: "blur(80px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img src={PHOTOS.hero} alt="Hector Landscaping — side-yard pathway, dark mulch beds, plantings, cedar privacy fence with bollard light" className="w-full h-full object-cover" />
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
                <WordReveal text="Meet Hector" />
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>Hector Landscaping Landscape &amp; Design is a family-owned firm based in Renton, Washington. <span className="text-white font-medium">Hector</span> has been landscaping in the Pacific Northwest since 2018 — What started as a one-truck operation has grown into a full-service crew known for paver work, retaining walls, sod, and full-yard transformations across the greater Renton area.</p>
                <p>The work is residential, the crew is local, and every discipline runs in-house. Forty-nine seasons of installs in this region tells you which plants make it past their second winter and which ones don&rsquo;t. It tells you how to size a base course for our rainfall. It tells you which clients call back, and why.</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Certificate, label: "Owner-Operated Since 2018" },
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
            <p className="mt-6 max-w-2xl mx-auto text-slate-400 leading-relaxed">A representative slice of the archive — residential installations, hardscape, retaining walls, and full-yard work — drawn across the two-county footprint.</p>
          </div>
          {/* Layout was a 3-column CSS-columns masonry tuned for 6 cards;
              after the Water Features + Night Lights cards came out
              (no real Hector photos to back them), 4 cards in a 3-col
              masonry left a visible gap on desktop. Switched to a clean
              CSS grid: 1 col mobile / 2 cols tablet / 2 cols desktop —
              4 cards fill a 2×2 grid evenly. Heights kept as a tasteful
              row-rhythm (small / tall / tall / small) so the grid still
              has the editorial feel without the masonry math. */}
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-5" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {projects.map((p, i) => {
              const heights = ["h-[300px]", "h-[380px]", "h-[380px]", "h-[300px]"];
              return (
                <motion.div key={i} variants={fadeUp}>
                  <div className="group relative rounded-2xl overflow-hidden border border-white/15">
                    <img src={p.image} alt={p.title} className={`w-full ${heights[i] ?? "h-[320px]"} object-cover transition-transform duration-700 group-hover:scale-105`} />
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
              { src: PHOTOS.brick1, alt: "Kirse residence — entry walkway in natural stone" },
              { src: PHOTOS.retainingMain, alt: "Stoneworks — engineered single-tier retaining wall" },
              { src: PHOTOS.paver1, alt: "Stoneworks — paver patio carried through bed work" },
              { src: PHOTOS.lawnFinished, alt: "Olano Property — finished lawn integrated into the landscape" },
              { src: PHOTOS.yardJun2, alt: "Olano residence — yard view" },
              { src: PHOTOS.yardJun1, alt: "Hector Landscaping — summer plantings" },
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
                  { label: "Hardscape Project", color: EARTH, desc: "Patio, walkway, retaining wall" },
                  { label: "Sod & New Lawn", color: PRIMARY, desc: "Grade, amend soil, lay clean-edge sod" },
                  { label: "Plantings & Beds", color: EARTH_DARK, desc: "PNW natives, layered planting plans" },
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
              <img src={PHOTOS.retainingBuild} alt="Hector Landscaping installation — climate-adapted plantings carried through engineered hardscape" className="w-full h-full object-cover" />
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

      {/* ═══════════════ 11. REAL GOOGLE REVIEWS — sliding carousel ═══════════════
          10 real 5-star reviews pulled from Hector Landscaping's Google Business
          Profile (5.0 · 14 total, all 5-star) on 2026-05-02. Sliding
          carousel built on CSS scroll-snap so it works the same on
          mobile (swipe) and desktop (prev/next arrows). View All
          link points back to the live GMB listing. */}
      <SectionReveal id="reviews" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] mb-3 flex items-center justify-center gap-2" style={{ color: EARTH }}>
              <Star size={14} weight="fill" style={{ color: "#fbbf24" }} />
              5.0 on Google · 14 Reviews
              <Star size={14} weight="fill" style={{ color: "#fbbf24" }} />
            </p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-4">
              <WordReveal text="Five Stars. Fifty Years." />
            </h2>
            <p className="max-w-xl mx-auto text-slate-400 leading-relaxed mt-4">
              Verified Google reviews from Hector Landscaping clients across King, Pierce,
              and the surrounding Eastside. Every review below is real — names,
              dates, and photos pulled directly from their public Google Business Profile.
            </p>
          </div>
          <ReviewsCarousel
            reviews={reviews}
            viewAllUrl="https://www.google.com/maps/place/Mountain+View+Landscape+%26+Design/@47.3207062,-122.0984311,17z/data=!4m8!3m7!1s0x5490f596db529cf5:0x8182c072f204747f!8m2!3d47.3207062!4d-122.0984311!9m1!1b1"
          />
        </div>
      </SectionReveal>

      {/* ═══════════════ 12. COMPETITOR COMPARISON ═══════════════ */}
      <SectionReveal className="relative z-10 py-12 md:py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>Why Hector Landscaping</p>
            <h2 className="text-3xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Hector Landscaping vs Mow-and-Go Crews" />
            </h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="text-left p-4 text-slate-400 font-medium">Capability</th>
                    <th className="text-center p-4 font-semibold text-white">Hector Landscaping</th>
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
          flagged it as out-of-context. Hector Landscaping only has ONE real
          after-dark photo (DSC00449 / PHOTOS.yardDec5) and it's
          already used in the projects section. Rather than reuse the
          same photo twice, the night-lighting content stays where
          the photography supports it (services accordion + projects).
          If Hector commissions actual night-lighting photography later,
          this section can come back. */}

      {/* ═══════════════ 14. CONTACT — uses HectorLandscapingContactForm ═══════════════ */}
      <SectionReveal id="contact" className="relative z-10 py-20 md:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full" style={{ background: `radial-gradient(circle, ${PRIMARY} 0%, transparent 60%)`, opacity: 0.05, filter: "blur(100px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>Get Started</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Tell Hector about your yard" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Site visits are free across King, Pierce, and the surrounding Eastside. We typically respond within one business day, usually faster.
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
                against the dark page. Strips rounded-* so HectorLandscapingContactForm
                children render as squared boxes per the form's editorial
                styling. */}
            <div className="bg-[#f8f5ef] text-[#1a1612] rounded-2xl p-6 md:p-8 border border-white/10 [&_.rounded-2xl]:rounded-none [&_.rounded-xl]:rounded-none [&_.rounded-lg]:rounded-none [&_.rounded-3xl]:rounded-none">
              <h3 className="text-xl font-semibold mb-6">Request a free site visit</h3>
              <HectorLandscapingContactForm services={services.map((s) => s.title)} />
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
                <p className="text-sm text-slate-400 leading-relaxed">King, Pierce, and the surrounding Eastside — based out of Renton, WA. Site visits across the two-county footprint are free.</p>
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
                  "Renton", "Seattle", "Bellevue", "Kent", "Renton", "Federal Way",
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
              <p className="text-sm text-slate-500 leading-relaxed mb-4">Owner-operated landscape design and installation in Renton, WA. Serving King, Pierce, and the surrounding Eastside since {BUSINESS.established}.</p>
              <div className="flex flex-wrap gap-2">
                {["Owner-Operated", "In-House", "Licensed", "Insured"].map((badge) => (
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
                <li><a href="#about" className="hover:text-white transition-colors">About Hector</a></li>
                <li><a href="#work" className="hover:text-white transition-colors">Selected Work</a></li>
                <li><a href="#process" className="hover:text-white transition-colors">Process</a></li>
                <li><a href="#service-area" className="hover:text-white transition-colors">Service Area</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Tell Hector about your yard</a></li>
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
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500" aria-hidden>
                <path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/>
              </svg>
              Built by <a href="/clients/hector-landscaping/login" className="underline hover:text-slate-400 transition-colors">BlueJays</a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
