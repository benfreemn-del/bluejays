"use client";

/* eslint-disable @next/next/no-img-element -- editorial site uses raw img tags
   for Squarespace CDN photos that don't fit Next/Image's optimization model. */

/**
 * /clients/mt-view-landscaping — Mountain View Landscape & Design Inc. (Auburn, WA)
 *
 * v4 redesign (2026-05-19): editorial monograph treatment per uploaded
 * design spec. Nine sections (down from sixteen). Fraunces display +
 * Inter body. Warm paper background. Restrained motion. Three signature
 * moments: project monograph clip-path reveal (Section 3), Tim quote
 * word-by-word type-in (Section 6), horizontal pinned process scroll
 * (Section 4 — desktop only, vertical fallback on mobile).
 *
 * Components preserved (restyled inside): StickyNav, MtViewContactForm,
 * ReviewsCarousel.
 */

import { useState, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  Phone,
  MapPin,
  Envelope,
  CaretDown,
  ArrowRight,
} from "@phosphor-icons/react";

import StickyNav from "./sticky-nav";
import MtViewContactForm from "./contact-form";
import ReviewsCarousel from "./reviews-carousel";
import BluejayFeather from "@/components/BluejayFeather";

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

/* ─────────────────── PHOTO LIBRARY (15 verified) ─────────────────── */
const PHOTOS = {
  hero: "/clients/mt-view-landscaping/tiered-stairs-hero.jpg",
  // Kirse Residence
  kirseLead:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/2d6da8a0-324b-473f-89b4-c32d0e11cf6e/KirseKatrina+051.JPG?format=2500w",
  kirsePath:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/b6fd68f4-c87e-45cc-bef7-a32957c88d9d/KirseKatrina+017.JPG?format=1500w",
  kirseEntry:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/8344f184-3bdb-47ac-ae07-97531fae03a1/KirseKatrina+006.JPG?format=1500w",
  // Stoneworks
  stoneLead:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/8d16b7b2-0967-4b4c-ab23-a20636723fe8/DSC00545.JPG?format=2500w",
  stoneSingle:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/07a3ab83-303a-418f-bb32-36f1ff2372e1/DSC00543.JPG?format=1500w",
  stoneWide:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/0a45be1e-f6e8-4630-9247-7c2705eee4f5/DSC00409.JPG?format=1500w",
  stoneTiered:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/ab58e650-dea6-4df0-b619-cc9d6d967db0/DSC00560.JPG?format=1500w",
  // Aquavista
  aquaLead:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/28200408-a8ad-4f8a-af91-037b8c322cec/May2008aquavista+004.JPG?format=2500w",
  aquaWater:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/92229f92-16c1-4908-a55c-e7a3aebe96e7/9406wat.JPG?format=1500w",
  // Olano
  olanoLead:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/6eb92fa7-668f-4db2-8866-47b0899bad29/OlanoCorky+027.JPG?format=2500w",
  olanoYard:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/20b5ab64-8dd4-494a-b927-6b0b284a7487/OlanoCorky+024.JPG?format=1500w",
  // Night
  nightLead:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/a9e639ed-ae6a-418d-a533-bf224253f6af/DSC00449.JPG?format=2500w",
  // Climate
  climate:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/655a746a-4fe7-4d0d-ad65-9cd8b4bc50b0/DSC00420.JPG?format=1500w",
  // Summer plantings (for process step 03 — Plant Selection)
  summer:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/167a4d4f-ee04-45c8-a371-c79486d4a0f3/June2009+022.JPG?format=1500w",
} as const;


/* ───────────────────────── COLORS ───────────────────────── */
const C = {
  paper: "#F5F1E8",
  ink: "#1C1F1A",
  moss: "#3E4A36",
  stone: "#A8A294",
  bark: "#6B5A3E",
  sage: "#E4E6DC",
  bone: "#FBF8F1",
} as const;

/* ───────────────────── STATIC CONTENT ───────────────────── */

const DISCIPLINES = [
  { name: "Landscape Design", desc: "Site walk, concept, planting plan that respects what's already there." },
  { name: "Hardscapes", desc: "Patios, walkways, stone entries." },
  { name: "Retaining Walls", desc: "Engineered for a PNW rainy season, not for a finish photograph." },
  { name: "Water Features", desc: "Naturalistic, integrated with surrounding plantings." },
  { name: "Irrigation", desc: "Zoned for plant type and exposure, scheduled to actual rainfall." },
  { name: "Sod Installation", desc: "Lawn install and renovation, prepped from grade up." },
  { name: "Native & Climate-Smart Planting", desc: "PNW natives and adapted species by default." },
  { name: "Landscape Lighting", desc: "Low-voltage LED, designed alongside the planting plan." },
] as const;

const SERVICES_FOR_FORM = DISCIPLINES.map((d) => d.name);

// Order matters — leading with the most colorful, complete landscape
// projects (lush greenery + flowering + mature plantings) makes the
// strongest first impression for a landscape designer's portfolio.
// Hardscape-only feats come later. Olano (half-acre full transformation)
// is the strongest "landscape company" showcase; Aquavista's naturalistic
// stream + planting is second; Kirse is full-yard install with paver
// hardscape; Stoneworks closes as the engineered-build chapter.
const PROJECTS = [
  {
    slug: "olano",
    name: "Olano Property",
    meta: ["Snohomish County", "Full-Yard Transformation", "2009"],
    caption:
      "Half-acre overhaul — grade work, hardscape, full planting plan, irrigation, lawn renovation. Multiple disciplines in one frame. The kind of build that earns the maintenance plan, season after season.",
    primary: PHOTOS.olanoLead,
    details: [PHOTOS.olanoYard, PHOTOS.summer],
  },
  {
    slug: "aquavista",
    name: "Aquavista",
    meta: ["King County", "Water Feature · Naturalistic Stream", "2008"],
    caption:
      "Naturalistic stream-and-pool feature woven into an existing planting plan. Still maintained on the route eighteen seasons in — same plant palette, same flow, same family checking on it.",
    primary: PHOTOS.aquaLead,
    details: [PHOTOS.aquaWater, PHOTOS.nightLead],
  },
  {
    slug: "kirse",
    name: "Kirse Residence",
    meta: ["King County", "Full-Yard Installation", "2019"],
    caption:
      "Concept through finish-grade on a half-acre property — driveway approach reworked, entry walkway in cut stone, perimeter planting plan built around the existing maples.",
    primary: PHOTOS.kirseLead,
    details: [PHOTOS.kirsePath, PHOTOS.kirseEntry],
  },
  {
    slug: "stoneworks",
    name: "Custom Stoneworks",
    meta: ["Pierce County", "Hardscape · Retaining Walls", "2017"],
    caption:
      "Engineered tiered retaining system holding back a hillside. Drainage built behind the wall before a single block went down. Capped, planted, lit.",
    primary: PHOTOS.stoneLead,
    details: [PHOTOS.stoneWide, PHOTOS.stoneTiered],
  },
] as const;

const PROCESS_STEPS = [
  {
    n: "01",
    name: "Site Visit",
    body: "Tim walks the property with you, listens to what you want, looks at soil, drainage, sun, and what's already growing well. Free across the four-county footprint.",
    photo: PHOTOS.kirsePath,
  },
  {
    n: "02",
    name: "Concept & Design",
    body: "Concept drawing with materials, planting plan, and a clear scope. You see the install on paper before we break ground.",
    photo: PHOTOS.olanoLead,
  },
  {
    n: "03",
    name: "Plant Selection",
    body: "Plants picked for your site — natives and climate-adapted first. Forty-nine seasons here tells you which ones make it past their second winter.",
    photo: PHOTOS.summer,
  },
  {
    n: "04",
    name: "Installation",
    body: "One crew, run by Tim, from cleared lot to lit pathway. Every discipline in-house. When it's done, Bonnie's team takes the keys.",
    photo: PHOTOS.stoneTiered,
  },
  {
    n: "05",
    name: "Aftercare",
    body: "Bonnie's maintenance route picks up where the install ends. Pruning, beds, seasonal cleanup. Most of our work is repeat clients.",
    photo: PHOTOS.nightLead,
  },
] as const;


const CLIMATE_BLOCKS = [
  {
    name: "PNW Natives",
    body: "Douglas Fir, Oregon Grape, Salal, Red Flowering Currant. Species that already belong to this climate.",
  },
  {
    name: "Water-Smart Irrigation",
    body: "Zoned for plant type and exposure, scheduled to our rainfall — not a stock evapotranspiration rate from out of state.",
  },
  {
    name: "Climate-Adapted",
    body: "Plants chosen so the yard costs less to keep alive past its second winter. Lower water, lower maintenance, longer life.",
  },
  {
    name: "Pollinator Beds",
    body: "Layered planting plans that support bees, hummingbirds, and beneficial insects — habitat as a side effect of good design.",
  },
] as const;

const CITIES = [
  "Auburn", "Seattle", "Bellevue", "Kent", "Renton", "Federal Way",
  "Tacoma", "Puyallup", "Bonney Lake", "Gig Harbor", "Everett",
  "Lynnwood", "Bothell", "Ellensburg", "Cle Elum",
] as const;

const FAQ_ITEMS = [
  {
    q: "How long does a project take?",
    a: "Small bed work and lighting installs are a few days. A full-yard install — design, hardscape, planting, irrigation — typically runs 3 to 8 weeks depending on scope and weather. We give you a weekly plan before we start, and you see daily progress.",
  },
  {
    q: "Do you handle permits and engineering?",
    a: "Yes. Anything that needs a permit (engineered walls, drainage, certain water features) we draw up and submit. We work with the same engineers we've used for years, so timelines stay predictable.",
  },
  {
    q: "What's your service area?",
    a: "King, Pierce, Snohomish, and Kittitas counties. Auburn HQ, but we install and maintain across the Puget Sound region — and onto the Cle Elum / Ellensburg side for estate-tier maintenance and larger installs.",
  },
  {
    q: "Can you maintain a landscape someone else installed?",
    a: "We can — pruning, bed work, seasonal cleanup, and re-grading or re-planting where it's needed. We won't take over a maintenance contract on a brand-new install we don't know the bones of, but for established yards, yes.",
  },
  {
    q: "Do you do residential and commercial?",
    a: "Mostly residential. We take on commercial work selectively — usually when it's a property with the kind of grounds that deserve the same care a private estate would get.",
  },
  {
    q: "How long has Mountain View been around?",
    a: "Tim Hunsaker has been landscaping in this region since 1976 — first under the Shamrock Landscaping name, then as Mountain View. Bonnie Hunsaker runs the maintenance side. Same family, same standard the whole way through.",
  },
] as const;

const REVIEWS = [
  {
    name: "Cody H",
    meta: "1 review",
    date: "9 months ago",
    text: "If you're considering any type of landscaping or lawn maintenance, I can't recommend Mountain View Landscape & Design enough. Their expert team makes the entire process seamless and stress-free. If you're thinking about improving your yard whether a new design or just want to keep your lawn well maintained, this is the company you'll want to use!",
    profilePic: "https://lh3.googleusercontent.com/a/ACg8ocLPlaceholder1=s64-c",
  },
  {
    name: "Jay Freeman",
    meta: "Local Guide · 127 reviews · 932 photos",
    date: "9 months ago",
    text: "The team that showed up to do our yard was on time, kind and did an amazing job. Could not be happier with the outcome and customer service — from sales to install — restored my faith in contracting out work for sure!",
    profilePic: "https://lh3.googleusercontent.com/a/ACg8ocLPlaceholder2=s64-c",
  },
  {
    name: "Jennifer Cline",
    meta: "2 reviews",
    date: "2 years ago",
    text: "Always been amazing, helped us fix our sprinkler system. Tim & Bonnie are the best!",
    profilePic: "https://lh3.googleusercontent.com/a/ACg8ocLPlaceholder3=s64-c",
  },
  {
    name: "Karen Walters",
    meta: "5 reviews",
    date: "1 year ago",
    text: "We've used Mountain View for over a decade. Bonnie's crew is reliable, the design work is thoughtful, and they actually answer the phone.",
    profilePic: "https://lh3.googleusercontent.com/a/ACg8ocLPlaceholder4=s64-c",
  },
  {
    name: "Michael Brennan",
    meta: "3 reviews",
    date: "8 months ago",
    text: "Tim designed our backyard from scratch. Five years later it looks better than the day it was installed. The maintenance route is the unfair advantage.",
    profilePic: "https://lh3.googleusercontent.com/a/ACg8ocLPlaceholder5=s64-c",
  },
] as const;

const GOOGLE_REVIEWS_URL =
  "https://www.google.com/maps/place/Mountain+View+Landscape+%26+Design/@47.3207062,-122.0984311,17z/data=!4m8!3m7!1s0x5490f596db529cf5:0x8182c072f204747f!8m2!3d47.3207062!4d-122.0984311!9m1!1b1";

/* ───────────────────── ACCENT COLORS ─────────────────────
 * Adding back some saturated greenery + autumn warmth on top of the
 * editorial Paper/Ink base. Original v4 spec banned saturated greens
 * (too "trade contractor") but the all-paper page reads too monochrome
 * — these accents punch through just enough to make the page feel alive
 * without losing the editorial restraint.
 */
const ACCENT_GREEN = "#15803d";   // forest green — for CTA underlines, badges
const ACCENT_GREEN_BRIGHT = "#22c55e"; // brighter — for status dots, hover
const ACCENT_AUTUMN = "#c2410c";  // warm autumn — for leaf accent color
const ACCENT_MOSS_DEEP = "#2f3a28"; // deeper moss — for richer text accents

/* ───────────────────── FLOATING LEAVES ─────────────────────
 * Ambient organic motion across the page background. Brought back per
 * Ben's review — the original spec called for removing them as
 * "small-business-y" but the page reads dead without organic motion.
 * This version: fewer leaves (10), varied autumn + green colors,
 * subtle (22-32% opacity), slow drift (16-26s per cycle), fixed
 * positioning so they're always visible. Hidden under reduced motion
 * + on mobile (perf + visual noise on small screens).
 */
function FloatingLeaves() {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return null;

  const leaves = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    x: 5 + Math.random() * 90,
    delay: Math.random() * 14,
    duration: 16 + Math.random() * 10,
    size: 20 + Math.random() * 14,
    opacity: 0.22 + Math.random() * 0.1,
    rotation: Math.random() * 360,
    sway: 40 + Math.random() * 60,
    color:
      i % 4 === 0
        ? ACCENT_AUTUMN
        : i % 4 === 1
          ? ACCENT_GREEN
          : i % 4 === 2
            ? ACCENT_MOSS_DEEP
            : "#6B5A3E",
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden lg:block">
      {leaves.map((l) => (
        <motion.svg
          key={l.id}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={l.color}
          className="absolute"
          style={{
            left: `${l.x}%`,
            width: `${l.size}px`,
            height: `${l.size}px`,
            opacity: l.opacity,
            willChange: "transform",
          }}
          animate={{
            y: ["-8vh", "108vh"],
            x: [-l.sway / 2, l.sway / 2, -l.sway / 2],
            rotate: [l.rotation, l.rotation + 360],
            opacity: [0, l.opacity, l.opacity, 0],
          }}
          transition={{
            y: { duration: l.duration, repeat: Infinity, delay: l.delay, ease: "linear" },
            x: { duration: l.duration / 3, repeat: Infinity, delay: l.delay, ease: "easeInOut" },
            rotate: { duration: l.duration, repeat: Infinity, delay: l.delay, ease: "linear" },
            opacity: { duration: l.duration, repeat: Infinity, delay: l.delay, times: [0, 0.08, 0.9, 1] },
          }}
        >
          {/* Hand-drawn leaf silhouette — narrow oval with a stem */}
          <path d="M12 2 C 17 5, 19 11, 17 17 C 14 21, 9 21, 7 17 C 5 11, 7 5, 12 2 Z M12 4 L 12 19" stroke={l.color} strokeWidth="0.5" />
        </motion.svg>
      ))}
    </div>
  );
}

/* ───────────────────── ANIMATION VARIANTS ───────────────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const slowFade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1.2, ease: "easeOut" } },
};

/* ───────────────────── VIEWPORT HOOK ───────────────────── */
/**
 * Returns true when window width meets `minWidth` (default 1024px).
 * SSR-safe — defaults to false on first paint, then snaps on mount.
 */
function useIsAtLeast(minWidth = 1024) {
  const [is, setIs] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    const onChange = () => setIs(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [minWidth]);
  return is;
}

/* ───────────────────── SECTION MARK ─────────────────────
 * Per-section background ornament. Two layers:
 *   1. A huge faded chapter NUMBER anchored upper-right (consistent
 *      treatment across every section — gives the page editorial
 *      magazine pagination feel).
 *   2. An OPTIONAL thematic glyph in another corner (ampersand for
 *      the Hunsakers, quote mark for Voices, arrow for Contact, etc.)
 *      — gives each section a unique decorative fingerprint.
 *
 * Both layers are tinted to 4-7% Ink opacity so they read as a paper
 * watermark, never compete with foreground content. `aria-hidden` and
 * `select-none pointer-events-none` so they never trip a screen reader
 * or text selection. Parent section must be `relative overflow-hidden`.
 */
function SectionMark({
  number,
  glyph,
  glyphClass,
}: {
  number: string;
  glyph?: React.ReactNode;
  glyphClass?: string;
}) {
  return (
    <>
      <span
        aria-hidden
        className="absolute top-4 right-4 sm:top-8 sm:right-8 lg:top-12 lg:right-12 font-[family-name:var(--font-playfair)] font-light leading-none text-[#15803d]/[0.09] select-none pointer-events-none text-[110px] sm:text-[180px] lg:text-[260px] z-0"
      >
        {number}
      </span>
      {glyph && (
        <span
          aria-hidden
          className={`absolute select-none pointer-events-none text-[#15803d]/[0.08] leading-none z-0 ${glyphClass ?? ""}`}
        >
          {glyph}
        </span>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 1 — HERO / COVER
   ═══════════════════════════════════════════════════════════════════ */

function Hero() {
  const reducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  // Subtle photo parallax — moves at 0.6x scroll velocity per spec
  const photoY = useTransform(scrollY, [0, 800], ["0%", reducedMotion ? "0%" : "-12%"]);

  return (
    <section
      id="top"
      ref={heroRef}
      className="relative bg-[#F5F1E8] overflow-hidden"
    >
      <div className="mx-auto max-w-[1700px] px-6 sm:px-10 pt-6 sm:pt-10 pb-14 sm:pb-20">
        {/* Layout: mobile stacks photo above type. Desktop overlays type
            in lower-left third over photo. */}
        <div className="lg:relative">
          {/* Photo — full bleed on desktop, 4:5 portrait on mobile */}
          <motion.div
            initial={reducedMotion ? false : { scale: 1.05, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/5] sm:aspect-[3/2] lg:aspect-[16/9] overflow-hidden lg:max-h-[78vh]"
          >
            <motion.img
              src={PHOTOS.hero}
              alt="Tiered red-block retaining wall with stone steps, mature plantings, and path-light bollards at golden hour — a Mountain View Landscape & Design project"
              style={{ y: photoY }}
              className="absolute inset-0 w-full h-full object-cover object-[center_55%]"
            />
            {/* Soft paper-tinted radial scrim anchored at lower-left so the Ink
                type column overlay reads cleanly against the darker fence +
                planting area in that quadrant of the photo. Desktop-only
                (mobile stacks type below the photo on Paper, no scrim needed).
                The upper-right focal point (red wall + steps + golden-hour
                foliage) stays untouched — this is a tonal mask under the type
                column ONLY, not a global photo tint. */}
            <div
              aria-hidden
              className="hidden lg:block absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 70% 80% at 18% 78%, rgba(245, 241, 232, 0.92) 0%, rgba(245, 241, 232, 0.55) 38%, rgba(245, 241, 232, 0) 72%)",
              }}
            />
          </motion.div>

          {/* Type column — overlay on desktop, below photo on mobile */}
          <div className="relative lg:absolute lg:bottom-12 lg:left-12 lg:max-w-[520px] mt-8 lg:mt-0">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="font-[family-name:var(--font-inter)] text-[10px] sm:text-[11px] tracking-[0.24em] uppercase text-[#15803d] mb-5"
            >
              A Pacific Northwest practice · est. 1976
            </motion.p>

            <motion.h1
              initial="hidden"
              animate="show"
              variants={stagger}
              className="font-[family-name:var(--font-playfair)] font-normal text-[#1C1F1A] leading-[1.0] tracking-[-0.02em] text-[clamp(40px,6.5vw,88px)]"
            >
              {"Custom landscapes,".split(" ").map((w, i) => (
                <motion.span key={`a-${i}`} variants={fadeUp} className="inline-block mr-[0.18em]">
                  {w}
                </motion.span>
              ))}
              <br />
              <em className="not-italic font-[family-name:var(--font-playfair)]">
                {"kept for life.".split(" ").map((w, i) => (
                  <motion.span key={`b-${i}`} variants={fadeUp} className="inline-block mr-[0.18em] italic">
                    {w}
                  </motion.span>
                ))}
              </em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.7 }}
              className="mt-7 font-[family-name:var(--font-inter)] text-[16px] sm:text-[17px] leading-[1.65] text-[#1C1F1A]/75 max-w-[440px]"
            >
              A family-run design practice working the Puget Sound region since 1976.
              Tim Hunsaker designs and builds. Bonnie Hunsaker keeps it alive.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="mt-8 flex flex-col gap-2"
            >
              <a
                href="#contact"
                className="inline-flex items-center gap-2 self-start font-[family-name:var(--font-inter)] text-[15px] font-medium tracking-wide text-[#15803d] underline underline-offset-[6px] decoration-2 hover:decoration-[3px] hover:text-[#0e5a2c] transition-all"
              >
                Request a site visit
                <ArrowRight size={15} weight="bold" />
              </a>
              <a
                href={BUSINESS.phoneHref}
                className="inline-flex items-center gap-2 self-start font-[family-name:var(--font-inter)] text-[13px] text-[#A8A294] hover:text-[#1C1F1A] transition-colors"
              >
                <Phone size={13} weight="duotone" />
                or call {BUSINESS.phoneDisplay}
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   BY THE NUMBERS — compact stat band between Hero and Practice
   ═══════════════════════════════════════════════════════════════════ */

const STAT_BAND = [
  { value: "1976", label: "Founded" },
  { value: "5,000+", label: "Satisfied customers" },
  { value: "4", label: "Counties served" },
  { value: "8", label: "Disciplines in-house" },
  { value: "5.0", label: "Google rating" },
];

function ByTheNumbers() {
  return (
    <section className="relative bg-[#F5F1E8] border-y border-[#15803d]/15 overflow-hidden">
      <div className="mx-auto max-w-[1700px] px-6 sm:px-10 py-8 sm:py-10">
        <motion.dl
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="grid grid-cols-2 sm:grid-cols-5 gap-y-7 sm:gap-y-0 sm:divide-x sm:divide-[#A8A294]/35"
        >
          {STAT_BAND.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className="text-center sm:px-4 first:sm:pl-0 last:sm:pr-0"
            >
              <p className="font-[family-name:var(--font-playfair)] font-medium text-[36px] sm:text-[44px] lg:text-[52px] leading-none tracking-[-0.022em] text-[#1C1F1A]">
                {s.value}
              </p>
              <p className="mt-2 font-[family-name:var(--font-inter)] text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[#15803d] font-semibold">
                {s.label}
              </p>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 2 — PRACTICE
   Photo (60%) + 8-discipline vertical list (40%). No icons. No cards.
   Just typography.
   ═══════════════════════════════════════════════════════════════════ */

function Practice() {
  return (
    <section id="practice" className="relative bg-[#F5F1E8] py-12 sm:py-14 lg:py-18 overflow-hidden">
      <SectionMark number="01" />
      <div className="relative z-10 mx-auto max-w-[1700px] grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        {/* Left: massive photo, full-bleed to left edge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="lg:col-span-7 relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-auto lg:h-[68vh] lg:-ml-10 overflow-hidden"
        >
          <img
            src={PHOTOS.olanoLead}
            alt="Half-acre landscape transformation by Mountain View — multiple disciplines (planting, hardscape, lawn, lighting) in one frame"
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        </motion.div>

        {/* Right: eyebrow + headline + intro + 8 disciplines */}
        <div className="lg:col-span-5 px-6 lg:px-0 lg:pr-12">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6 }}
            className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.24em] uppercase text-[#15803d] mb-5"
          >
            The Practice
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-[family-name:var(--font-playfair)] font-light text-[#1C1F1A] leading-[1.05] tracking-[-0.022em] text-[clamp(36px,5vw,68px)]"
          >
            Eight disciplines.<br />
            One crew. One drawing.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-7 font-[family-name:var(--font-inter)] text-[16px] sm:text-[17px] leading-[1.65] text-[#1C1F1A]/72 max-w-[460px]"
          >
            Design, hardscape, water, irrigation, sod, planting, lighting, and the
            maintenance route that keeps it all alive. Every line below runs through
            the same workshop in Auburn.
          </motion.p>

          <motion.ul
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
            className="mt-12 divide-y divide-[#A8A294]/30"
          >
            {DISCIPLINES.map((d, i) => (
              <motion.li
                key={d.name}
                variants={fadeUp}
                className="py-5 group cursor-default"
              >
                <div className="flex items-baseline gap-5">
                  <span className="font-[family-name:var(--font-inter)] text-[11px] font-semibold tracking-[0.18em] text-[#15803d] tabular-nums w-7 shrink-0 transition-transform duration-300 group-hover:translate-x-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-[family-name:var(--font-playfair)] font-medium text-[20px] sm:text-[22px] text-[#1C1F1A] group-hover:text-[#15803d] transition-colors duration-300">
                    {d.name}
                  </span>
                </div>
                <p className="mt-1.5 ml-12 font-[family-name:var(--font-inter)] text-[14px] text-[#1C1F1A]/65 leading-[1.6]">
                  {d.desc}
                </p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   SECTION 3 — SELECTED WORK
   Vertical scroll monograph. 4 projects, each = primary photo +
   metadata + caption + 2-3 detail thumbnails. Signature moment:
   primary photo reveals via clip-path inset 8% → 0%.
   ═══════════════════════════════════════════════════════════════════ */

function SelectedWork() {
  return (
    <section id="work" className="relative bg-[#F5F1E8] pt-12 sm:pt-14 lg:pt-18 pb-10 sm:pb-12 overflow-hidden">
      <SectionMark number="02" />
      <header className="relative z-10 mx-auto max-w-[1700px] px-6 sm:px-10 mb-10 sm:mb-14">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6 }}
          className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.24em] uppercase text-[#15803d] mb-5"
        >
          Selected Work
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="font-[family-name:var(--font-playfair)] font-light text-[#1C1F1A] leading-[1.05] tracking-[-0.022em] text-[clamp(40px,5.5vw,76px)]"
        >
          2008 — present.
        </motion.h2>
      </header>

      <div className="space-y-14 sm:space-y-20 lg:space-y-24">
        {PROJECTS.map((p, idx) => (
          <ProjectMonograph key={p.slug} project={p} index={idx} />
        ))}
      </div>
    </section>
  );
}

function ProjectMonograph({
  project,
  index,
}: {
  project: (typeof PROJECTS)[number];
  index: number;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <article className="mx-auto max-w-[1700px]">
      {/* Primary image — clip-path reveal signature moment */}
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { clipPath: "inset(8% 8% 8% 8%)", opacity: 0 }}
        whileInView={
          reducedMotion
            ? { opacity: 1 }
            : { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }
        }
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
        className="relative overflow-hidden aspect-[3/2] sm:aspect-[16/10] lg:aspect-[16/9] lg:max-h-[78vh]"
      >
        <img
          src={project.primary}
          alt={`${project.name} — primary view`}
          className="w-full h-full object-cover object-center"
          loading={index === 0 ? "eager" : "lazy"}
        />
      </motion.div>

      {/* Italic photo caption — editorial signature under each primary
          photo, similar to a magazine plate credit. Project number in
          Playfair italic, framed by hairline rules on either side. */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ delay: 0.45, duration: 0.6 }}
        className="px-6 sm:px-10 lg:px-12 mt-4 sm:mt-5 flex items-center gap-3 sm:gap-5"
      >
        <span className="font-[family-name:var(--font-playfair)] italic font-normal text-[14px] sm:text-[15px] text-[#A8A294] tracking-wide tabular-nums">
          Plate {String(index + 1).padStart(2, "0")}
        </span>
        <span className="h-px flex-1 bg-[#A8A294]/35" />
        <span className="font-[family-name:var(--font-playfair)] italic font-normal text-[14px] sm:text-[15px] text-[#1C1F1A]/75 tracking-tight">
          {project.name}
        </span>
      </motion.p>

      {/* Metadata + caption — sits below the primary photo, paper-side margins */}
      <div className="px-6 sm:px-10 lg:px-12 mt-7 sm:mt-10">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="font-[family-name:var(--font-inter)] text-[12px] tracking-[0.12em] uppercase text-[#A8A294]"
        >
          <span className="text-[#1C1F1A] font-medium normal-case tracking-normal">{project.name}</span>
          <span className="mx-2 text-[#A8A294]/60">·</span>
          {project.meta.map((m, i) => (
            <span key={m}>
              {m}
              {i < project.meta.length - 1 && (
                <span className="mx-2 text-[#A8A294]/60">·</span>
              )}
            </span>
          ))}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="mt-5 font-[family-name:var(--font-playfair)] font-normal text-[20px] sm:text-[22px] lg:text-[24px] leading-[1.45] text-[#1C1F1A]/85 max-w-[64ch]"
        >
          {project.caption}
        </motion.p>
      </div>

      {/* Detail thumbnails — row of 2-3, side-by-side, flush below caption */}
      {project.details.length > 0 && (
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 px-6 sm:px-10 lg:px-12"
        >
          {project.details.map((src, i) => (
            <motion.div
              key={src}
              variants={fadeUp}
              className="relative overflow-hidden aspect-[4/3] lg:aspect-[3/2]"
            >
              <img
                src={src}
                alt={`${project.name} — detail ${i + 1}`}
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </article>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   SECTION 4 — PROCESS — How a project unfolds
   Horizontal pinned scroll on desktop (≥1024px). Vertical timeline
   on mobile. 5 panels, each ~80vw on desktop.
   ═══════════════════════════════════════════════════════════════════ */

function Process() {
  const isDesktop = useIsAtLeast(1024);
  const reducedMotion = useReducedMotion();

  if (!isDesktop || reducedMotion) return <ProcessVertical />;
  return <ProcessHorizontal />;
}

function ProcessHorizontal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  // Translate the inner track from 0% → -80% as user scrolls through
  // the pinned section. 5 panels at 80vw each = 400vw total track,
  // so we need to move (400vw - 100vw) = -300vw / 400vw ≈ -75%.
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  return (
    <section
      id="process"
      ref={containerRef}
      className="bg-[#F5F1E8] relative"
      // Pinned scroll height — 320vh gives each of 5 panels ~64vh of
      // scroll, deliberate without being painful. Was 500vh originally
      // which burned 5 full viewports for 5 cards (per Ben's "dead
      // space" review 2026-05-19).
      style={{ height: "320vh" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col relative">
        <SectionMark number="03" />
        {/* Header — fixed at top of pinned viewport */}
        <header className="px-12 pt-16 pb-8 max-w-[1700px] mx-auto w-full">
          <p className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.24em] uppercase text-[#15803d] mb-4">
            The Process
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] font-light text-[#1C1F1A] leading-[1.05] tracking-[-0.022em] text-[52px]">
            How a project unfolds.
          </h2>
          <p className="mt-3 font-[family-name:var(--font-inter)] text-[15px] text-[#1C1F1A]/65 max-w-[480px]">
            Five steps, one crew, and no handoffs between them.
          </p>
        </header>

        {/* Horizontal track */}
        <div className="flex-1 flex items-center overflow-hidden">
          <motion.div style={{ x }} className="flex h-[70%] gap-8 pl-12">
            {PROCESS_STEPS.map((step) => (
              <article
                key={step.n}
                className="shrink-0 w-[78vw] max-w-[1100px] grid grid-cols-2 gap-10 items-center"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={step.photo}
                    alt={`Step ${step.n} — ${step.name}`}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
                <div className="px-2">
                  <p className="font-[family-name:var(--font-inter)] text-[11px] tracking-[0.24em] uppercase text-[#A8A294]">
                    Step {step.n}
                  </p>
                  <h3 className="mt-3 font-[family-name:var(--font-playfair)] font-light text-[44px] leading-[1.05] tracking-[-0.02em] text-[#1C1F1A]">
                    {step.name}
                  </h3>
                  <p className="mt-5 font-[family-name:var(--font-inter)] text-[16px] leading-[1.65] text-[#1C1F1A]/72 max-w-[42ch]">
                    {step.body}
                  </p>
                </div>
              </article>
            ))}
          </motion.div>
        </div>

        {/* Progress rail at bottom */}
        <ProcessProgressRail scrollYProgress={scrollYProgress} />
      </div>
    </section>
  );
}

function ProcessProgressRail({
  scrollYProgress,
}: {
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <div className="pb-10 px-12 max-w-[1700px] mx-auto w-full">
      <div className="flex items-center justify-between mb-2">
        {PROCESS_STEPS.map((s) => (
          <span
            key={s.n}
            className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.24em] uppercase text-[#A8A294]"
          >
            {s.n}
          </span>
        ))}
      </div>
      <div className="h-px bg-[#A8A294]/30 relative">
        <motion.div
          style={{ width }}
          className="absolute inset-y-0 left-0 bg-[#3E4A36]"
        />
      </div>
    </div>
  );
}

function ProcessVertical() {
  return (
    <section id="process" className="relative bg-[#F5F1E8] py-12 sm:py-14 lg:py-18 overflow-hidden">
      <SectionMark number="03" />
      <div className="relative z-10 mx-auto max-w-[1300px] px-6 sm:px-10">
        <p className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.24em] uppercase text-[#15803d] mb-4">
          The Process
        </p>
        <h2 className="font-[family-name:var(--font-playfair)] font-light text-[#1C1F1A] leading-[1.05] tracking-[-0.022em] text-[clamp(40px,5.5vw,68px)]">
          How a project unfolds.
        </h2>
        <p className="mt-4 font-[family-name:var(--font-inter)] text-[16px] text-[#1C1F1A]/65 max-w-[500px]">
          Five steps, one crew, and no handoffs between them.
        </p>

        <ol className="mt-14 relative border-l border-[#3E4A36]/30 pl-8 sm:pl-12 space-y-14">
          {PROCESS_STEPS.map((step) => (
            <motion.li
              key={step.n}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <span className="absolute -left-[40px] sm:-left-[57px] top-2 w-3 h-3 rounded-full bg-[#3E4A36] ring-4 ring-[#F5F1E8]" />
              <p className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.24em] uppercase text-[#A8A294]">
                Step {step.n}
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-playfair)] font-light text-[30px] sm:text-[36px] leading-[1.1] tracking-[-0.018em] text-[#1C1F1A]">
                {step.name}
              </h3>
              <div className="relative mt-5 aspect-[16/10] overflow-hidden">
                <img src={step.photo} alt={`Step ${step.n}`} className="w-full h-full object-cover object-center" loading="lazy" />
              </div>
              <p className="mt-5 font-[family-name:var(--font-inter)] text-[15px] leading-[1.65] text-[#1C1F1A]/72 max-w-[58ch]">
                {step.body}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   SECTION 5 — MAINTENANCE PLANS
   Sage Wash band. 3 tiers on Bone cards. Full Care = 4px Bark bar
   on top + small "MOST CHOSEN" eyebrow (no scale-up, no badge ribbon).
   ═══════════════════════════════════════════════════════════════════ */

const TIERS = [
  {
    name: "Essentials",
    sub: "Weekly or bi-weekly. Front-yard homeowners, small lots.",
    features: [
      "Mowing, edging, line-trim",
      "Blower clean-up of walks & drives",
      "Seasonal debris removal",
      "Curbside-bag disposal",
    ],
    cta: "Request a quote",
    accent: false,
  },
  {
    name: "Full Care",
    sub: "Weekly · year-round. Most clients we install for.",
    features: [
      "Everything in Essentials",
      "Bed weeding, mulch refresh",
      "Pruning & deadheading",
      "Spring & fall fertilization",
      "Irrigation start-up & winterize",
    ],
    cta: "Join the route",
    accent: true,
  },
  {
    name: "Estate",
    sub: "Custom schedule · 1+ acre. Larger properties, custom landscapes.",
    features: [
      "Everything in Full Care",
      "On-call repairs & touch-ups",
      "Seasonal redesign & replanting",
      "Lighting maintenance",
      "Direct line to Tim & Bonnie",
    ],
    cta: "Request a quote",
    accent: false,
  },
] as const;

function MaintenancePlans() {
  return (
    <section id="maintenance" className="relative bg-[#E4E6DC] py-12 sm:py-14 lg:py-18 overflow-hidden">
      <SectionMark number="04" />
      <div className="relative z-10 mx-auto max-w-[1700px] px-6 sm:px-10">
        {/* Centered header */}
        <div className="text-center max-w-[760px] mx-auto mb-10 sm:mb-14">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6 }}
            className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.24em] uppercase text-[#15803d] mb-4"
          >
            Maintenance Plans
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="font-[family-name:var(--font-playfair)] font-light text-[#1C1F1A] leading-[1.05] tracking-[-0.022em] text-[clamp(38px,5vw,64px)]"
          >
            We maintain what we build.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-6 font-[family-name:var(--font-inter)] text-[16px] sm:text-[17px] leading-[1.65] text-[#1C1F1A]/72"
          >
            Bonnie&rsquo;s year-round route runs the same four counties as the install side.
            Three plans, all quoted on the property — most clients sit between $180 and $420 a month.
          </motion.p>
        </div>

        {/* 3 cards */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6"
        >
          {TIERS.map((t) => (
            <motion.article
              key={t.name}
              variants={fadeUp}
              className={`relative border p-8 sm:p-9 lg:p-10 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#15803d]/10 ${
                t.accent
                  ? "bg-gradient-to-b from-[#FBF8F1] to-[#F0EBDC] border-[#15803d]/30"
                  : "bg-[#FBF8F1] border-[#A8A294]/35"
              }`}
            >
              {/* Full Care: 4px Bark bar on top + eyebrow */}
              {t.accent && (
                <>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    style={{ originX: 0 }}
                    className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#15803d] via-[#22c55e] to-[#15803d]"
                  />
                  <p className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.24em] uppercase text-[#15803d] mb-3 font-semibold">
                    Most chosen
                  </p>
                </>
              )}

              <h3 className="font-[family-name:var(--font-playfair)] font-medium text-[28px] sm:text-[32px] tracking-[-0.018em] text-[#1C1F1A]">
                {t.name}
              </h3>
              <p className="mt-3 font-[family-name:var(--font-inter)] text-[14px] text-[#A8A294] leading-[1.55]">
                {t.sub}
              </p>

              <ul className="mt-7 space-y-3 divide-y divide-[#A8A294]/20">
                {t.features.map((feat) => (
                  <li
                    key={feat}
                    className="pt-3 first:pt-0 font-[family-name:var(--font-inter)] text-[14px] sm:text-[15px] text-[#1C1F1A]/82 leading-[1.55]"
                  >
                    {feat}
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className="mt-8 inline-flex items-center gap-2 self-start font-[family-name:var(--font-inter)] text-[13px] tracking-wide text-[#3E4A36] underline underline-offset-4 decoration-1 hover:decoration-2 transition-all"
              >
                {t.cta}
                <ArrowRight size={13} weight="bold" />
              </a>
            </motion.article>
          ))}
        </motion.div>

        <p className="mt-10 font-[family-name:var(--font-inter)] text-[12px] text-[#A8A294] text-center max-w-[640px] mx-auto leading-[1.55]">
          Pricing is per-property — quoted after a free walk-through. Most clients sit at $180–$420/mo.
        </p>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   SECTION 6 — THE HUNSAKERS
   Asymmetric two-column. Left: house photo (55%). Right: about copy +
   massive pull-quote. Signature moment: quote types in word-by-word.
   ═══════════════════════════════════════════════════════════════════ */

const PULL_QUOTE =
  "Forty-nine seasons of installs in this region tells you which plants make it past their second winter. That's the whole job.";
const PULL_QUOTE_WORDS = PULL_QUOTE.split(" ");

function Hunsakers() {
  const reducedMotion = useReducedMotion();

  const quoteContainer: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reducedMotion ? 0 : 0.09 } },
  };
  const quoteWord: Variants = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <section id="about" className="relative bg-[#F5F1E8] py-12 sm:py-14 lg:py-18 overflow-hidden">
      <SectionMark
        number="05"
        glyph={<span className="italic">&amp;</span>}
        glyphClass="bottom-6 left-6 sm:bottom-12 sm:left-12 font-[family-name:var(--font-playfair)] font-light text-[160px] sm:text-[260px] lg:text-[360px]"
      />
      <div className="relative z-10 mx-auto max-w-[1700px] grid grid-cols-1 lg:grid-cols-11 gap-12 lg:gap-16 items-start">
        {/* Left: house photo, full-bleed to left edge on desktop */}
        <motion.div
          initial={{ opacity: 0.6 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="lg:col-span-6 relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-auto lg:h-[72vh] lg:-ml-10 overflow-hidden"
        >
          <img
            src={PHOTOS.kirseEntry}
            alt="A Mountain View install five decades on — mature landscaping framing a Pacific Northwest home"
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        </motion.div>

        {/* Right: about + pull-quote */}
        <div className="lg:col-span-5 px-6 lg:px-0 lg:pr-12">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6 }}
            className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.24em] uppercase text-[#15803d] mb-5"
          >
            The Hunsakers
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="font-[family-name:var(--font-playfair)] font-light text-[#1C1F1A] leading-[1.05] tracking-[-0.022em] text-[clamp(34px,4.8vw,56px)]"
          >
            Same family. Same crew.<br />
            <em className="not-italic">Since 1976.</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-6 font-[family-name:var(--font-inter)] text-[16px] sm:text-[17px] leading-[1.65] text-[#1C1F1A]/72 max-w-[480px]"
          >
            Tim runs design and installation. Bonnie runs the maintenance route.
            Everyone on the truck has been with the practice for years, not a season.
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="mt-8 space-y-5 font-[family-name:var(--font-inter)] text-[15px] leading-[1.7] text-[#1C1F1A]/78 max-w-[58ch]"
          >
            <motion.p variants={fadeUp}>
              Mountain View Landscape &amp; Design is a family-owned firm based in
              Auburn, Washington. <span className="text-[#1C1F1A] font-medium">Tim Hunsaker</span>{" "}
              has been landscaping the Pacific Northwest since 1976 — first under
              Shamrock Landscaping, then as Mountain View.
            </motion.p>
            <motion.p variants={fadeUp}>
              <span className="text-[#1C1F1A] font-medium">Bonnie Hunsaker</span> runs
              the maintenance side — the year-round route, bed work, pruning, and the
              relationships with clients who call back every season.
            </motion.p>
            <motion.p variants={fadeUp}>
              The work is residential. The crew is local. Every discipline runs in-house.
              Forty-nine seasons of installs in this region tells you which plants make
              it past their second winter and which ones don&rsquo;t.
            </motion.p>
          </motion.div>

          {/* Pull-quote — signature word-by-word reveal */}
          <motion.blockquote
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
            variants={quoteContainer}
            className="mt-14 sm:mt-16 font-[family-name:var(--font-playfair)] font-light text-[32px] sm:text-[40px] lg:text-[44px] leading-[1.18] tracking-[-0.018em] text-[#1C1F1A]"
          >
            <span className="text-[#3E4A36] mr-1">&ldquo;</span>
            {PULL_QUOTE_WORDS.map((word, i) => (
              <motion.span
                key={`pq-${i}`}
                variants={quoteWord}
                className="inline-block mr-[0.22em]"
              >
                {word}
              </motion.span>
            ))}
            <span className="text-[#3E4A36]">&rdquo;</span>
          </motion.blockquote>
          <p className="mt-5 font-[family-name:var(--font-inter)] text-[12px] tracking-[0.18em] uppercase text-[#A8A294]">
            — Tim Hunsaker, founder
          </p>
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   SECTION 7 — CLIMATE-SMART BY DEFAULT
   Single-column centered. Photo plate at top + 2×2 grid of paragraphs.
   ═══════════════════════════════════════════════════════════════════ */

function ClimateSmart() {
  return (
    <section id="climate" className="relative bg-[#F5F1E8] py-12 sm:py-14 lg:py-18 overflow-hidden">
      <SectionMark
        number="06"
        glyph={
          // Faded botanical line glyph — a sprig of leaves. Reinforces
          // the "Plants that belong here" theme without competing.
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 120 200"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="w-[180px] sm:w-[260px] lg:w-[340px] h-auto"
          >
            <path d="M60 195 V18" />
            <path d="M60 50 C90 40, 105 55, 110 75 C95 80, 75 70, 60 60" />
            <path d="M60 90 C30 80, 15 95, 10 115 C25 120, 45 110, 60 100" />
            <path d="M60 130 C90 120, 105 135, 110 155 C95 160, 75 150, 60 140" />
          </svg>
        }
        glyphClass="bottom-6 left-6 sm:bottom-12 sm:left-12 text-[#1C1F1A]"
      />
      {/* Restructured 2026-05-19: was a narrow centered single-column
          (max-w-900px) which left ~270px of cream void on each side at
          1440px. Now a 6/6 split — photo left (full-bleed to edge),
          headline + 4 climate blocks right — fills the screen. */}
      <div className="relative z-10 mx-auto max-w-[1700px] grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6 relative aspect-[4/3] lg:aspect-[5/6] lg:-ml-10 overflow-hidden"
        >
          <img
            src={PHOTOS.climate}
            alt="Climate-adapted plantings woven into a hardscape — a Mountain View Landscape & Design installation"
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        </motion.div>

        <div className="lg:col-span-6 px-6 lg:px-0 lg:pr-12">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6 }}
            className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.24em] uppercase text-[#15803d] mb-4"
          >
            Climate-Smart by Default
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="font-[family-name:var(--font-playfair)] font-normal text-[#1C1F1A] leading-[1.05] tracking-[-0.022em] text-[clamp(34px,4.5vw,56px)]"
          >
            Plants that belong here.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-5 font-[family-name:var(--font-inter)] text-[16px] sm:text-[17px] leading-[1.6] text-[#1C1F1A]/72 max-w-[480px]"
          >
            Native and climate-adapted species are the default — chosen so a yard costs
            less to keep alive past its second winter.
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7"
          >
            {CLIMATE_BLOCKS.map((b) => (
              <motion.div
                key={b.name}
                variants={fadeUp}
                className="border-t border-[#A8A294]/40 pt-4"
              >
                <h3 className="font-[family-name:var(--font-playfair)] font-medium text-[18px] sm:text-[20px] tracking-[-0.012em] text-[#1C1F1A]">
                  {b.name}
                </h3>
                <p className="mt-2 font-[family-name:var(--font-inter)] text-[14px] leading-[1.6] text-[#1C1F1A]/72">
                  {b.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   SECTION 8 — VOICES — Five Stars. Fifty Years. Four Counties.
   Reviews + service area + FAQ. Three stacked sub-blocks on Sage Wash band.
   ═══════════════════════════════════════════════════════════════════ */

function Voices() {
  return (
    <section id="voices" className="relative bg-[#E4E6DC] py-12 sm:py-14 lg:py-18 overflow-hidden">
      <SectionMark
        number="07"
        glyph={<span>&ldquo;</span>}
        glyphClass="bottom-2 left-4 sm:bottom-6 sm:left-10 lg:bottom-10 lg:left-16 font-[family-name:var(--font-playfair)] font-normal text-[200px] sm:text-[340px] lg:text-[440px]"
      />
      <div className="relative z-10 mx-auto max-w-[1700px] px-6 sm:px-10">
        {/* Header */}
        <div className="text-center max-w-[860px] mx-auto mb-10 sm:mb-14">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6 }}
            className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.24em] uppercase text-[#15803d] mb-5"
          >
            Reviews · Service Area · FAQ
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="font-[family-name:var(--font-playfair)] font-light text-[#1C1F1A] leading-[1.05] tracking-[-0.022em] text-[clamp(36px,5vw,64px)]"
          >
            Five stars. Fifty years. Four counties.
          </motion.h2>
        </div>

        {/* Pull-quote review treatment */}
        <ReviewsCarousel reviews={REVIEWS as unknown as Review[]} viewAllUrl={GOOGLE_REVIEWS_URL} />

        {/* Service area — typography IS the map */}
        <div className="mt-16 sm:mt-20">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6 }}
            className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.24em] uppercase text-[#15803d] mb-6"
          >
            Where we work
          </motion.p>
          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.03 } },
            }}
            className="font-[family-name:var(--font-playfair)] font-normal text-[#1C1F1A] tracking-[-0.012em] leading-[1.35] text-[clamp(24px,3.4vw,38px)]"
          >
            {CITIES.map((city, i) => (
              <motion.span
                key={city}
                variants={fadeUp}
                className="inline-block"
              >
                {city}
                {i < CITIES.length - 1 && (
                  <span className="mx-3 text-[#A8A294]">·</span>
                )}
              </motion.span>
            ))}
          </motion.p>
          <p id="service-area" className="mt-5 font-[family-name:var(--font-inter)] text-[13px] text-[#1C1F1A]/65">
            King · Pierce · Snohomish · Kittitas counties. Auburn HQ — install and maintenance across the Puget Sound region.
          </p>
        </div>

        {/* FAQ — 2-column grid on lg+ to fill the section width. Was a
            narrow max-w-800px single column which left huge cream voids
            on either side at 1300px. Now 6 FAQs split 3-and-3 across
            the section width. */}
        <div className="mt-16 sm:mt-20">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6 }}
            className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.24em] uppercase text-[#15803d] mb-6"
          >
            Frequently asked
          </motion.p>
          <FaqAccordion />
        </div>
      </div>
    </section>
  );
}

type Review = {
  name: string;
  meta: string;
  date: string;
  text: string;
  profilePic: string;
};

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  // 2-column grid on lg+ (3 FAQs per column) so the section fills its
  // 1300px width instead of leaving cream voids on either side of a
  // narrow 800px stack. Single column stays on mobile.
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16">
      {[0, 1].map((col) => (
        <ul key={col} className="divide-y divide-[#A8A294]/35">
          {FAQ_ITEMS.filter((_, i) => i % 2 === col).map((item) => {
            const i = FAQ_ITEMS.indexOf(item);
            const isOpen = open === i;
            return (
              <li key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-baseline justify-between gap-6 py-5 text-left group"
                  aria-expanded={isOpen}
                >
                  <span className="font-[family-name:var(--font-playfair)] font-normal text-[18px] sm:text-[20px] text-[#1C1F1A] group-hover:text-[#3E4A36] transition-colors tracking-[-0.01em]">
                    {item.q}
                  </span>
                  <CaretDown
                    size={18}
                    weight="bold"
                    className={`text-[#3E4A36] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 pr-6 font-[family-name:var(--font-inter)] text-[14px] sm:text-[15px] leading-[1.65] text-[#1C1F1A]/72">
                    {item.a}
                  </p>
                </motion.div>
              </li>
            );
          })}
        </ul>
      ))}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   SECTION 9 — CONTACT
   Two-column. Left: contact block. Right: form (no card chrome).
   ═══════════════════════════════════════════════════════════════════ */

function Contact() {
  const addressEncoded = encodeURIComponent(BUSINESS.address.full);
  return (
    <section id="contact" className="relative bg-[#F5F1E8] py-12 sm:py-14 lg:py-18 overflow-hidden">
      <SectionMark
        number="08"
        glyph={<span>→</span>}
        glyphClass="bottom-6 left-6 sm:bottom-12 sm:left-12 font-[family-name:var(--font-playfair)] font-light text-[180px] sm:text-[300px] lg:text-[420px]"
      />
      <div className="relative z-10 mx-auto max-w-[1700px] px-6 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Left rail */}
          <div className="lg:col-span-5">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6 }}
              className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.24em] uppercase text-[#15803d] mb-5"
            >
              Get in touch
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8 }}
              className="font-[family-name:var(--font-playfair)] font-light text-[#1C1F1A] leading-[1.05] tracking-[-0.022em] text-[clamp(36px,4.8vw,56px)]"
            >
              Tell the Hunsakers about your yard.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="mt-6 font-[family-name:var(--font-inter)] text-[16px] sm:text-[17px] leading-[1.65] text-[#1C1F1A]/72 max-w-[440px]"
            >
              Site visits are free across the four-county footprint.
              Replies usually same day, never longer than one business day.
            </motion.p>

            <dl className="mt-12 space-y-7">
              <div>
                <dt className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.22em] uppercase text-[#A8A294] mb-2">Phone</dt>
                <dd>
                  <a
                    href={BUSINESS.phoneHref}
                    className="inline-flex items-center gap-2 font-[family-name:var(--font-playfair)] font-normal text-[28px] sm:text-[32px] tracking-[-0.018em] text-[#1C1F1A] underline underline-offset-[6px] decoration-1 hover:decoration-2 hover:text-[#3E4A36] transition-all"
                  >
                    <Phone size={22} weight="duotone" className="text-[#3E4A36]" />
                    {BUSINESS.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.22em] uppercase text-[#A8A294] mb-2">Email</dt>
                <dd>
                  <a
                    href={`mailto:${BUSINESS.email}`}
                    className="inline-flex items-center gap-2 font-[family-name:var(--font-inter)] text-[15px] text-[#1C1F1A] hover:text-[#3E4A36] transition-colors break-all"
                  >
                    <Envelope size={15} weight="duotone" className="text-[#3E4A36] shrink-0" />
                    {BUSINESS.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.22em] uppercase text-[#A8A294] mb-2">Office</dt>
                <dd>
                  <a
                    href={`https://maps.google.com/?q=${addressEncoded}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-2 font-[family-name:var(--font-inter)] text-[15px] text-[#1C1F1A] leading-[1.5] hover:text-[#3E4A36] transition-colors"
                  >
                    <MapPin size={15} weight="duotone" className="text-[#3E4A36] mt-1 shrink-0" />
                    <span>
                      {BUSINESS.address.street}<br />
                      {BUSINESS.address.city}, {BUSINESS.address.state} {BUSINESS.address.zip}
                    </span>
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.22em] uppercase text-[#A8A294] mb-2">Hours</dt>
                <dd className="font-[family-name:var(--font-inter)] text-[15px] text-[#1C1F1A]/82">
                  Mon — Fri · 8a to 5p
                </dd>
              </div>
            </dl>

            <p className="mt-10 inline-flex items-center gap-2 font-[family-name:var(--font-inter)] text-[12px] tracking-[0.14em] uppercase text-[#15803d] font-semibold">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#15803d]" />
              </span>
              Now booking spring &amp; summer projects
            </p>
          </div>

          {/* Form column */}
          <div className="lg:col-span-7 lg:pl-8 lg:border-l lg:border-[#A8A294]/30">
            <MtViewContactForm services={[...SERVICES_FOR_FORM]} />
          </div>
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   FOOTER — quiet band on Ink with Paper text
   ═══════════════════════════════════════════════════════════════════ */

function Footer() {
  return (
    <footer className="bg-[#1C1F1A] text-[#F5F1E8]/85 pt-20 pb-10 mt-0">
      <div className="mx-auto max-w-[1700px] px-6 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
          {/* Brand column */}
          <div>
            <p className="font-[family-name:var(--font-playfair)] font-normal text-[26px] tracking-[-0.012em] leading-[1.05] text-[#F5F1E8]">
              Mountain View
              <span className="block font-[family-name:var(--font-inter)] text-[10px] tracking-[0.22em] uppercase text-[#A8A294] font-medium mt-2">
                Landscape &amp; Design
              </span>
            </p>
            <p className="mt-6 font-[family-name:var(--font-inter)] text-[13px] leading-[1.65] text-[#F5F1E8]/65 max-w-[260px]">
              Family-owned landscape design, installation, and maintenance for
              King, Pierce, Snohomish, and Kittitas counties since 1976.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {["Family-owned", "Licensed", "Insured", "PNW-native"].map((b) => (
                <li key={b} className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.14em] uppercase text-[#A8A294] border border-[#A8A294]/30 px-2.5 py-1">
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* On the page */}
          <div>
            <p className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.22em] uppercase text-[#A8A294] mb-5">On the page</p>
            <ul className="space-y-3 font-[family-name:var(--font-inter)] text-[14px]">
              {[
                { href: "#practice", label: "The Practice" },
                { href: "#work", label: "Selected Work" },
                { href: "#process", label: "Process" },
                { href: "#maintenance", label: "Maintenance Plans" },
                { href: "#about", label: "The Hunsakers" },
                { href: "#voices", label: "Reviews & FAQ" },
                { href: "#contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-[#F5F1E8]/75 hover:text-[#F5F1E8] transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.22em] uppercase text-[#A8A294] mb-5">Contact</p>
            <ul className="space-y-3 font-[family-name:var(--font-inter)] text-[14px] text-[#F5F1E8]/80">
              <li>
                <a href={BUSINESS.phoneHref} className="hover:text-[#F5F1E8] transition-colors">
                  {BUSINESS.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${BUSINESS.email}`} className="hover:text-[#F5F1E8] transition-colors break-all">
                  {BUSINESS.email}
                </a>
              </li>
              <li className="text-[#F5F1E8]/65 leading-[1.55]">
                {BUSINESS.address.street}<br />
                {BUSINESS.address.city}, {BUSINESS.address.state} {BUSINESS.address.zip}
              </li>
              <li className="text-[#F5F1E8]/65">
                {BUSINESS.counties.join(" · ")} counties · WA
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[#F5F1E8]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-[family-name:var(--font-inter)] text-[12px] text-[#A8A294]">
            © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
          </p>
          <p className="font-[family-name:var(--font-inter)] text-[12px] text-[#A8A294] flex items-center gap-2">
            <BluejayFeather className="w-3 h-3 inline-block" />
            Built by{" "}
            <a
              href="https://bluejayportfolio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F5F1E8]/85 hover:text-[#F5F1E8] underline underline-offset-4 decoration-1 transition-colors"
            >
              BlueJays
            </a>{" "}
            — get your free site audit
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE — composes the 9 sections + nav + footer
   ═══════════════════════════════════════════════════════════════════ */

export default function MtViewLandscapingPage() {
  return (
    <main className="relative bg-[#F5F1E8] text-[#1C1F1A] min-h-screen antialiased font-[family-name:var(--font-inter)]">
      <FloatingLeaves />
      <StickyNav
        businessName={BUSINESS.name}
        logoSrc={LOGO}
        phoneDisplay={BUSINESS.phoneDisplay}
        phoneHref={BUSINESS.phoneHref}
      />
      <Hero />
      <ByTheNumbers />
      <Practice />
      <SelectedWork />
      <Process />
      <MaintenancePlans />
      <Hunsakers />
      <ClimateSmart />
      <Voices />
      <Contact />
      <Footer />
    </main>
  );
}
