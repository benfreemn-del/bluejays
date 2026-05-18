"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase. */

/**
 * /clients/all-in-one-services — All In One Service's LLC, Sequim WA
 *
 * REMODEL-MAGAZINE EDITORIAL build for Kyle B. Fritz's family-operated
 * general contracting biz on the Olympic Peninsula. Real Kyle photos
 * throughout (sourced + verified from his Squarespace gallery — Soldate
 * Shower finished, 710 Del Guzzi, Island before/after, Jay Sakas
 * Addition, 2nd-story addition before/after, Brody office buildout,
 * Kitchen + Bath before/after composites, wine cellar).
 *
 * Deliberately NOT the Meyer Electric template:
 * - Editorial split hero (text + real photo side-by-side), not a
 *   darkened-image full-bleed hero
 * - Before/After pairs as the centerpiece — the section that closes
 *   remodel sales. CLAUDE.md visual-QC rule 7 explicitly allows these
 *   for transformation businesses (remodeling qualifies)
 * - Numbered section callouts (01, 02, 03) — magazine-style instead
 *   of eyebrow-with-flanking-lines
 * - Named projects with location + scope, not generic service-grid cards
 * - Week-numbered process timeline, not generic 4-step icons
 * - Material/craft callouts (tile, cabinetry, glass, structural)
 *   reinforcing the craftsmanship POV — distinct from Meyer's "we hold
 *   X certification" trade-badge framing
 * - Warmer palette: cream-tinted ink, deep warm-black backgrounds —
 *   contrasted against Meyer's cold near-black/yellow
 *
 * Trust signals (WA L&I license ALLONOS841DJ, $1M Ohio Security
 * insurance, $12K Western Surety bond, BBB A+, BuildZoom Top 7% of
 * 128,670 WA contractors) are all real + verifiable + cited with their
 * source on the page.
 */

import { useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import {
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle,
  Quotes,
  Calendar,
  Star,
  Certificate,
  ShieldCheck,
  Trophy,
  House,
} from "@phosphor-icons/react";

import StickyNav from "./sticky-nav";
import AIOSContactForm from "./contact-form";
import AIOSMark from "./aios-mark";
import BluejayLogo from "@/components/BluejayLogo";

/* ───────────────────────── BUSINESS DATA ───────────────────────── */
const BUSINESS = {
  legalName: "All In One Service's LLC",
  name: "All In One Services",
  owner: "Kyle B. Fritz",
  partner: "Abi Fritz",
  established: 2016,
  yearsInBusiness: 10,
  craftYears: 22,
  phoneDisplay: "(360) 477-6859",
  phoneHref: "tel:+13604776859",
  address: {
    street: "1201 E Washington St",
    city: "Sequim",
    state: "WA",
    zip: "98382",
    full: "1201 E Washington St, Sequim, WA 98382",
  },
  mapsUrl:
    "https://maps.google.com/?q=1201+E+Washington+St+Sequim+WA+98382",
  license: "ALLONOS841DJ",
  insurance: "$1,000,000",
  insurer: "Ohio Security Insurance Co",
  bond: "$12,000",
  bondAgent: "Western Surety Co",
  bbbRating: "A+",
  buildZoomScore: "106",
  rating: "4.6",
  reviewCount: "18",
  avgPermitValue: "$49,296",
  serviceArea: [
    "Sequim",
    "Port Angeles",
    "Port Townsend",
    "Forks",
    "Clallam Bay",
    "Sekiu",
    "Chimacum",
    "Quilcene",
    "Kingston",
    "Poulsbo",
  ],
  counties: ["Clallam County", "Jefferson County"],
  // Live Supabase prospect UUID (inserted 2026-05-17).
  prospectId: "4a0dd735-c534-4393-81eb-e58659239b5b",
  facebook:
    "https://www.facebook.com/p/All-In-One-Services-LLC-100063469783661/",
  bbbUrl:
    "https://www.bbb.org/us/wa/sequim/profile/general-contractor/all-in-one-services-llc-1296-1000096300",
  buildzoomUrl:
    "https://www.buildzoom.com/contractor/all-in-one-services-llc-wa",
  birdeyeUrl:
    "https://reviews.birdeye.com/all-in-one-services-167497956805754",
} as const;

/* ───────────────────────── REAL PHOTOS ─────────────────────────
 * Every image below is a REAL photo of Kyle's actual finished work,
 * pulled from his Squarespace gallery + visually verified.
 * Filenames preserved so the source is traceable.
 */
const CDN = "https://images.squarespace-cdn.com/content/v1/67d1ad32f3d18013069458ea";
const PHOTOS = {
  // Hero & feature shots
  heroSoldate: `${CDN}/406cc182-0de5-46a0-94c2-fc64464e196c/Soldate+shower+finished.jpeg?format=2000w`,
  heroIslandAfter: `${CDN}/30713146-4026-41b1-aec4-20a5dcbecaf2/Island-after.JPG?format=2000w`,
  heroJaySakas: `${CDN}/66fc0c16-d356-41bf-bced-994865179e40/Jay+Sakas+Addition.jpg?format=2000w`,

  // Before/after composites
  kitchenBA: `${CDN}/f396f119-1f4c-4775-ba63-4ce7eb444e06/Kitchen+before-after.JPG?format=1500w`,
  bathBA: `${CDN}/dc38a546-2380-459e-bda6-600ac4df0bdc/Bathroom+before-after.JPG?format=1500w`,

  // Exterior pair (Island house)
  islandBefore: `${CDN}/84ed59df-47b8-4b3a-8490-6635fd76da05/Island-before.JPG?format=1500w`,
  islandAfter: `${CDN}/30713146-4026-41b1-aec4-20a5dcbecaf2/Island-after.JPG?format=1500w`,

  // 2nd-story addition pair
  additionBefore: `${CDN}/8aff2d14-96b0-416b-831c-64b9c8b1e188/2nd+story+addition+-+before.JPG?format=1500w`,
  additionAfter: `${CDN}/f1fef49e-a588-4c87-b34e-61808163f466/2nd+story+addition+-+after.JPG?format=1500w`,

  // Named projects
  soldateShower: `${CDN}/406cc182-0de5-46a0-94c2-fc64464e196c/Soldate+shower+finished.jpeg?format=1500w`,
  delGuzzi: `${CDN}/b8a04943-64c4-4b7c-a66e-9d5705651750/710+Del+Guzzi+Dr+Shower.jpg?format=1500w`,
  jaySakas: `${CDN}/66fc0c16-d356-41bf-bced-994865179e40/Jay+Sakas+Addition.jpg?format=1500w`,
  brodyOffice: `${CDN}/8c9c67a3-6b29-4b5d-9daf-aed1d974c7cf/Brody+office+-+Lobby.JPG?format=1500w`,
  wineCellar: `${CDN}/29be176a-c8e1-4b52-ade6-70a7641ff832/388.JPG?format=1500w`,
  kitchenDining: `${CDN}/8659d1ea-6f9c-446c-a6e4-ad5a7a8e7c65/Kitchen+dining+-+cropped.JPG?format=1500w`,
} as const;

/* ───────────────────────── COLORS — locked palette v3 (cream-default) ─────────────────────────
 *
 * Ben's rework brief (2026-05-18): the all-dark page felt heavy, the
 * alternating dark/cream felt jarring. New rule: cream is the page,
 * dark is the bookends. Hero opens with drama. Every content section
 * reads like magazine paper. Footer closes with gravity. Two cream
 * tones alternate for rhythm — never two dark/light flips in a row.
 *
 * Three tiers — every color on the page is one of these:
 *
 *   Tier 1  Surface  (cream)     BG / BG_ALT / BG_PANEL + INK
 *   Tier 2  Accent   (trade)     Copper + Blueprint
 *   Tier 3  Bookends (dark)      DARK_BG only on hero + footer
 */

// ── Tier 1: Surface ──────────────────────────────────────────────
const BG = "#f5ede0";          // Paper  — warm cream, primary section bg
const BG_ALT = "#ebe1d0";      // Stone  — deeper cream, alternating bg
const BG_PANEL = "#fbf6ec";    // Panel  — brightest cream, cards
const INK = "#1a1612";         // Espresso text
const INK_SOFT = "rgba(26, 22, 18, 0.75)";
const INK_DIM = "rgba(26, 22, 18, 0.50)";
const RULE = "rgba(26, 22, 18, 0.12)";

// ── Tier 2: Accent (trade) ───────────────────────────────────────
const ACCENT = "#d97706";       // Copper — primary identity
const ACCENT_DARK = "#92400e";  // Burnt copper — text + hover on cream
const ACCENT_LIGHT = "#fbbf24"; // Bright gold — gradient mid
const ACCENT_GOLD = "#fcd34d";  // Light gold — gradient top
const ACCENT_DIM = "rgba(217, 119, 6, 0.20)";
const COPPER_GRAD = `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 55%, ${ACCENT_DARK} 100%)`;

const BLUEPRINT = "#0e7490";        // Petrol — secondary accent (blueprint)
const BLUEPRINT_LIGHT = "#06b6d4";  // Cyan — gradient end
const BLUEPRINT_PALE = "#cffafe";
const BLUEPRINT_DIM = "rgba(14, 116, 144, 0.22)";
const BLUEPRINT_GRAD = `linear-gradient(135deg, ${BLUEPRINT_LIGHT} 0%, ${BLUEPRINT} 100%)`;

// ── Tier 3: Bookends (used ONLY on hero + footer) ────────────────
const DARK_BG = "#1c1917";          // Stone-black — hero, footer
const DARK_BG_PANEL = "#292524";    // Stone-gray — dark cards
const DARK_INK = "#fef6e8";         // Warm cream on dark
const DARK_INK_SOFT = "rgba(254, 246, 232, 0.78)";
const DARK_INK_DIM = "rgba(254, 246, 232, 0.55)";
const DARK_RULE = "rgba(254, 246, 232, 0.10)";

// ── Backward-compat aliases ──────────────────────────────────────
// Sections 02 / 04 / 08 still reference CREAM_* from the prior
// rework. After v3, "cream" and "default" mean the same thing —
// these aliases let existing JSX work without a sweeping rename.
const CREAM_BG = BG;
const CREAM_ALT = BG_ALT;
const CREAM_PANEL = BG_PANEL;
const CREAM_INK = INK;
const CREAM_INK_SOFT = INK_SOFT;
const CREAM_INK_DIM = INK_DIM;
const CREAM_RULE = RULE;

const FONT_HEAD = "'Space Grotesk', sans-serif";
const FONT_BODY = "'Inter', sans-serif";

/* ───────────────────────── ANIMATION ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 90, damping: 20 };
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: spring },
};

/* ───────────────────────── REUSABLE COMPONENTS ───────────────────────── */

function SectionNumber({
  n,
  label,
  tone = "copper",
  theme = "dark",
}: {
  n: string;
  label: string;
  /** Alternating tone — odd sections copper, even sections blueprint. */
  tone?: "copper" | "blueprint";
  /** Section background — "dark" uses cream label, "cream" uses dark label. */
  theme?: "dark" | "cream";
}) {
  const grad = tone === "blueprint" ? BLUEPRINT_GRAD : COPPER_GRAD;
  const labelColor = theme === "cream" ? CREAM_INK_DIM : INK_DIM;
  return (
    <div className="flex items-baseline gap-4 mb-6">
      <span
        className="font-bold tracking-tight leading-none"
        style={{
          fontFamily: FONT_HEAD,
          fontSize: "clamp(48px, 8vw, 88px)",
          background: grad,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {n}
      </span>
      <span
        className="text-[11px] sm:text-[12px] uppercase tracking-[0.28em] font-semibold"
        style={{ color: labelColor, fontFamily: FONT_HEAD }}
      >
        {label}
      </span>
    </div>
  );
}

function BeforeAfter({
  photo,
  title,
  scope,
  location,
}: {
  photo: string;
  title: string;
  scope: string;
  location: string;
}) {
  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-lg border" style={{ borderColor: RULE }}>
        <img
          src={photo}
          alt={`${title} — before and after, by All In One Service's LLC`}
          className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.02]"
          loading="lazy"
        />
        <div
          className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{
            background: "rgba(13, 10, 7, 0.75)",
            backdropFilter: "blur(8px)",
            color: ACCENT_LIGHT,
            border: `1px solid ${ACCENT_DIM}`,
            fontFamily: FONT_HEAD,
          }}
        >
          Before / After
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h3
            className="text-[22px] sm:text-[26px] font-bold tracking-tight"
            style={{ color: INK, fontFamily: FONT_HEAD }}
          >
            {title}
          </h3>
          <p
            className="mt-1 text-[14px]"
            style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
          >
            {scope}
          </p>
        </div>
        <span
          className="text-[11px] uppercase tracking-[0.20em] font-semibold whitespace-nowrap"
          style={{ color: ACCENT_LIGHT, fontFamily: FONT_HEAD }}
        >
          {location}
        </span>
      </div>
    </article>
  );
}

function NamedProject({
  photo,
  name,
  type,
  location,
  body,
  highlight,
  theme = "dark",
}: {
  photo: string;
  name: string;
  type: string;
  location: string;
  body: string;
  highlight?: string;
  theme?: "dark" | "cream";
}) {
  const isCream = theme === "cream";
  const cardBg = isCream ? CREAM_PANEL : BG_PANEL;
  const cardBorder = isCream ? CREAM_RULE : RULE;
  const titleColor = isCream ? CREAM_INK : INK;
  const subtleColor = isCream ? CREAM_INK_SOFT : INK_SOFT;
  const dimColor = isCream ? CREAM_INK_DIM : INK_DIM;
  const accentText = isCream ? ACCENT_DARK : ACCENT_LIGHT;
  return (
    <article
      className="grid sm:grid-cols-2 gap-6 sm:gap-8 items-center p-5 sm:p-7 rounded-xl border"
      style={{ background: cardBg, borderColor: cardBorder }}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-md">
        <img
          src={photo}
          alt={`${name} — ${type}`}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div>
        <div
          className="text-[10px] uppercase tracking-[0.22em] font-bold mb-2"
          style={{ color: accentText, fontFamily: FONT_HEAD }}
        >
          {type}
        </div>
        <h3
          className="text-[24px] sm:text-[28px] font-bold tracking-tight leading-[1.1] mb-2"
          style={{ color: titleColor, fontFamily: FONT_HEAD }}
        >
          {name}
        </h3>
        <div
          className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] mb-4"
          style={{ color: dimColor, fontFamily: FONT_HEAD }}
        >
          <MapPin size={12} weight="fill" />
          {location}
        </div>
        <p
          className="text-[14px] sm:text-[15px] leading-relaxed"
          style={{ color: subtleColor, fontFamily: FONT_BODY }}
        >
          {body}
        </p>
        {highlight && (
          <div
            className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider"
            style={{
              background: "rgba(217, 119, 6, 0.10)",
              border: `1px solid ${ACCENT_DIM}`,
              color: accentText,
              fontFamily: FONT_HEAD,
            }}
          >
            <CheckCircle size={12} weight="fill" />
            {highlight}
          </div>
        )}
      </div>
    </article>
  );
}

function PullQuote({ children, by }: { children: React.ReactNode; by: string }) {
  return (
    <div
      className="border-l-2 pl-5 sm:pl-7 py-2 my-7"
      style={{ borderColor: ACCENT }}
    >
      <p
        className="text-[20px] sm:text-[26px] leading-snug font-medium"
        style={{ color: INK, fontFamily: FONT_HEAD }}
      >
        &ldquo;{children}&rdquo;
      </p>
      <p
        className="mt-3 text-[12px] uppercase tracking-[0.22em] font-semibold"
        style={{ color: ACCENT_LIGHT, fontFamily: FONT_HEAD }}
      >
        — {by}
      </p>
    </div>
  );
}

/* ───────────────────────── PAGE DATA ───────────────────────── */

const SERVICE_LIST = [
  "Kitchen remodel",
  "Bathroom remodel",
  "Home addition",
  "Whole-home remodel",
  "New construction",
  "Deck / outdoor living",
  "Commercial buildout",
  "Custom build (wine room, conversion, etc.)",
  "Other",
];

const TESTIMONIALS = [
  {
    name: "Hilary Rosen",
    when: "Recent · 5★",
    quote:
      "Customer service, spectacular results, attention to detail, being flexible when necessary.",
    project: "Residential remodel",
  },
  {
    name: "Bill Bryant",
    when: "Recent · 5★",
    quote:
      "Code compliant, high level of craftsmanship and the ability to follow through to the end.",
    project: "Custom residential",
  },
  {
    name: "Tom Sandy",
    when: "5 months ago · 5★",
    quote:
      "Kyle, Abi and the whole crew are great to work with. Super happy with all the projects.",
    project: "Multi-project client",
  },
  {
    name: "Michael Kurtze",
    when: "9 months ago · 5★",
    quote:
      "These guys have a team perfectly suited for what they do — which is make people's dreams come true.",
    project: "Custom build",
  },
] as const;

// Process timeline with REAL week ranges — contractor-specific, not
// the generic Meyer-style 4-step "Free Estimate → Plan → Build →
// Walkthrough" pattern.
const TIMELINE = [
  {
    range: "Week 0",
    label: "Site walk",
    body:
      "Kyle visits the property, walks the scope with you, photographs conditions, takes measurements. Free, no obligation, no high-pressure pitch.",
  },
  {
    range: "Week 1",
    label: "Estimate + plan",
    body:
      "Itemized estimate delivered. Finish selections start (cabinets, tile, fixtures). Permits filed with Clallam or Jefferson County. Schedule locked.",
  },
  {
    range: "Week 2-3",
    label: "Demo + rough-in",
    body:
      "Demo, structural changes, framing if needed. Licensed sub-trades in for electrical + plumbing rough-in. Inspections passed before moving forward.",
  },
  {
    range: "Week 3-5",
    label: "Tile + cabinetry",
    body:
      "Waterproofing, daylight tile work, cabinet install, countertop template + fabrication, finish carpentry. The phase where the room starts looking like the renders.",
  },
  {
    range: "Week 5-7",
    label: "Finishes + final inspection",
    body:
      "Plumbing trim, electrical trim, hardware, paint, glass. Final inspection passed. Punch list closed before the final invoice goes out.",
  },
  {
    range: "Week 7+",
    label: "Walkthrough + warranty",
    body:
      "Full walkthrough together. Project warrantied — if something's not right after handoff, we come back. References available on request.",
  },
];

const MATERIAL_CALLOUTS = [
  {
    label: "Tile",
    body:
      "Schluter / Kerdi waterproofing systems. Tile set flat by hand, not by template. No drift on grout lines, no slope errors on shower floors.",
  },
  {
    label: "Cabinetry",
    body:
      "Sourced cabinetry or shop-built finish carpentry — whichever the budget supports. Soft-close, real wood faces, hung level by the same crew that frames the wall.",
  },
  {
    label: "Glass + Fixtures",
    body:
      "Frameless glass, premium trim packages (Kohler, Delta, Moen, Brizo). Matte black, chrome, brushed nickel — finishes coordinated to the rest of the room.",
  },
  {
    label: "Structural",
    body:
      "Wall removals, additions, foundation work, second-story builds — done in-house. Engineered when required. Permits pulled, inspections passed, every project.",
  },
];

const SERVICES_LIST = [
  { name: "Kitchen Remodels", sub: "Cabinets · counters · tile · electrical · plumbing" },
  { name: "Bathroom Remodels", sub: "Tile showers · waterproofing · vanities · fixtures · glass" },
  { name: "Home Additions", sub: "2nd-story builds · bump-outs · in-law suites · sunrooms" },
  { name: "Whole-Home Remodels", sub: "Gut to keys · structural · MEP · finishes" },
  { name: "New Construction", sub: "Custom homes · foundation to handoff" },
  { name: "Decks & Outdoor Living", sub: "Composite · cedar · pergolas · outdoor kitchens" },
  { name: "Commercial Buildouts", sub: "Office · retail · daycare · realtor · restaurant conversions" },
  { name: "Custom Specialty", sub: "Wine rooms · caboose conversions · boat storage" },
];

/* ───────────────────────── PAGE ───────────────────────── */

export default function AllInOneServicesPage() {
  return (
    <MotionConfig reducedMotion="never">
      <main
        id="top"
        className="min-h-screen"
        style={{ background: BG, color: INK, fontFamily: FONT_BODY }}
      >
        <StickyNav />

        {/* ────────────────────── 01 · HERO (editorial split) ────────────────────── */}
        <section className="relative">
          {/* Soft copper radial glow behind hero */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            <div
              className="absolute -left-32 -top-20 w-[520px] h-[520px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(217, 119, 6, 0.12) 0%, rgba(217, 119, 6, 0) 70%)",
              }}
            />
            <div
              className="absolute right-0 top-1/3 w-[420px] h-[420px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(252, 211, 77, 0.08) 0%, rgba(252, 211, 77, 0) 70%)",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pt-10 sm:pt-14 lg:pt-20 pb-10 sm:pb-14">
            <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
              {/* Hero copy */}
              <motion.div initial="hidden" animate="show" variants={fadeUp}>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.22em] mb-6"
                  style={{
                    background: "rgba(217, 119, 6, 0.10)",
                    border: `1px solid ${ACCENT_DIM}`,
                    color: ACCENT_DARK,
                    fontFamily: FONT_HEAD,
                  }}
                >
                  <Certificate size={12} weight="fill" />
                  Sequim, WA · Since 2016 · WA L&I {BUSINESS.license}
                </div>

                <h1
                  className="font-bold tracking-tight leading-[0.95] mb-6 uppercase"
                  style={{
                    fontFamily: FONT_HEAD,
                    fontSize: "clamp(44px, 7vw, 84px)",
                  }}
                >
                  The remodel that{" "}
                  <em
                    className="not-italic"
                    style={{
                      background: COPPER_GRAD,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      fontStyle: "normal",
                    }}
                  >
                    finishes when it&apos;s supposed to.
                  </em>
                </h1>

                <p
                  className="text-[17px] sm:text-[19px] leading-relaxed mb-8 max-w-xl"
                  style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                >
                  Kyle Fritz and a hand-picked crew have been building kitchens,
                  baths, additions, and whole-home renovations for Clallam and
                  Jefferson County families for ten years. Code-compliant work,
                  honest estimates, and a punch list closed before the final
                  invoice.
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <a
                    href="#estimate"
                    className="inline-flex items-center gap-2 px-7 h-14 rounded-md font-bold text-[13px] uppercase tracking-[0.16em] text-black transition-all hover:brightness-110 active:scale-95"
                    style={{
                      background: COPPER_GRAD,
                      fontFamily: FONT_HEAD,
                      boxShadow: "0 6px 26px rgba(217, 119, 6, 0.45)",
                    }}
                  >
                    Request a Site Walk
                    <ArrowRight size={14} weight="bold" />
                  </a>
                  <a
                    href={BUSINESS.phoneHref}
                    className="inline-flex items-center gap-2 text-[15px] font-semibold transition-opacity hover:opacity-70"
                    style={{ color: INK, fontFamily: FONT_HEAD }}
                  >
                    <Phone size={15} weight="fill" style={{ color: ACCENT_DARK }} />
                    {BUSINESS.phoneDisplay}
                  </a>
                </div>

                <div
                  className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[12px] uppercase tracking-[0.18em] font-semibold pt-6 border-t"
                  style={{ color: INK_DIM, fontFamily: FONT_HEAD, borderColor: RULE }}
                >
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck size={14} weight="fill" style={{ color: ACCENT_DARK }} />
                    $1M Insured
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck size={14} weight="fill" style={{ color: ACCENT_DARK }} />
                    $12K Bonded
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Trophy size={14} weight="fill" style={{ color: ACCENT_DARK }} />
                    BuildZoom Top 7% WA
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Star size={14} weight="fill" style={{ color: ACCENT_DARK }} />
                    4.6★ · 18 reviews
                  </span>
                </div>
              </motion.div>

              {/* Hero feature photo — Soldate Shower (real Kyle work) */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.15 }}
                className="relative"
              >
                <div
                  className="absolute -inset-4 rounded-2xl pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(217, 119, 6, 0.25) 0%, rgba(217, 119, 6, 0) 65%)",
                  }}
                />
                <div
                  className="relative aspect-[4/5] sm:aspect-[3/4] rounded-xl overflow-hidden border"
                  style={{ borderColor: "rgba(217, 119, 6, 0.30)" }}
                >
                  <img
                    src={PHOTOS.heroSoldate}
                    alt="Soldate Shower — finished tile shower remodel by All In One Service's LLC, Sequim WA"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(13,10,7,0) 55%, rgba(13,10,7,0.85) 100%)",
                    }}
                  />
                  <div className="absolute bottom-5 left-5 right-5">
                    <div
                      className="text-[10px] uppercase tracking-[0.24em] font-bold mb-1.5"
                      style={{ color: ACCENT_LIGHT, fontFamily: FONT_HEAD }}
                    >
                      Featured Build
                    </div>
                    <div
                      className="text-[22px] font-bold leading-tight"
                      style={{ color: INK, fontFamily: FONT_HEAD }}
                    >
                      Soldate Shower
                    </div>
                    <div
                      className="text-[13px] mt-0.5"
                      style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                    >
                      Custom tile · matte black trim · Sequim, WA
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ────────────────────── 02 · MANIFESTO (cream) ────────────────────── */}
        <section className="relative" style={{ background: CREAM_BG }}>
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 sm:py-16 lg:py-20">
            <SectionNumber n="02" label="Who builds your project" tone="blueprint" theme="cream" />
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16">
              <div>
                <h2
                  className="font-bold tracking-tight leading-[1.02]"
                  style={{
                    fontFamily: FONT_HEAD,
                    fontSize: "clamp(32px, 5vw, 56px)",
                    color: CREAM_INK,
                  }}
                >
                  One family-run crew.
                  <br />
                  <span style={{ color: ACCENT_DARK }}>
                    Ten years on the Peninsula.
                  </span>
                </h2>
                <p
                  className="mt-6 text-[15px] uppercase tracking-[0.20em] font-semibold"
                  style={{ color: CREAM_INK_DIM, fontFamily: FONT_HEAD }}
                >
                  Kyle &amp; Abi Fritz · Sequim, WA
                </p>
              </div>
              <div>
                <p
                  className="text-[18px] sm:text-[20px] leading-relaxed mb-6"
                  style={{ color: CREAM_INK_SOFT, fontFamily: FONT_BODY }}
                >
                  Kyle started this business from the ground up &mdash;
                  literally. The first jobs were weeding, repairs, minor
                  construction. Twenty-two years of craft later, he&apos;s
                  running a crew that handles full kitchen + bath remodels,
                  second-story additions, commercial buildouts, and the
                  specialty projects most contractors send to someone else.
                </p>
                <div
                  className="border-l-2 pl-5 sm:pl-7 py-2 my-7"
                  style={{ borderColor: ACCENT }}
                >
                  <p
                    className="text-[20px] sm:text-[26px] leading-snug font-medium"
                    style={{ color: CREAM_INK, fontFamily: FONT_HEAD }}
                  >
                    &ldquo;Code compliant, high level of craftsmanship and the
                    ability to follow through to the end.&rdquo;
                  </p>
                  <p
                    className="mt-3 text-[12px] uppercase tracking-[0.22em] font-semibold"
                    style={{ color: ACCENT_DARK, fontFamily: FONT_HEAD }}
                  >
                    — Bill Bryant · verified Birdeye review · 5★
                  </p>
                </div>
                <p
                  className="text-[15px] leading-relaxed"
                  style={{ color: CREAM_INK_SOFT, fontFamily: FONT_BODY }}
                >
                  Family-operated means the same people who walked the scope
                  with you are the people on site. No bait-and-switch with a
                  subcontracted crew you&apos;ve never met. No project handoffs
                  to strangers. The bid you signed is the team that shows up.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────────── 03 · THE TRANSFORMATIONS ────────────────────── */}
        <section
          id="transformations"
          className="relative border-t"
          style={{ background: BG_ALT, borderColor: RULE }}
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 sm:py-16 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                <SectionNumber n="03" label="The transformations" />
                <h2
                  className="font-bold tracking-tight leading-[1.02]"
                  style={{
                    fontFamily: FONT_HEAD,
                    fontSize: "clamp(32px, 5vw, 56px)",
                    color: INK,
                  }}
                >
                  Real jobs.
                  <br />
                  <span style={{ color: ACCENT_LIGHT }}>Same room, different decade.</span>
                </h2>
              </div>
              <p
                className="max-w-md text-[15px] sm:text-[16px] leading-relaxed"
                style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
              >
                Every before/after below is a real All In One Service&apos;s
                project. Same camera angle, same room. Names redacted only
                where the homeowner asked.
              </p>
            </div>

            <div className="space-y-12 sm:space-y-16">
              <BeforeAfter
                photo={PHOTOS.kitchenBA}
                title="Kitchen Gut + Rebuild"
                scope="Dated stained-wood cabinetry → gray shaker doors, quartz counters, undermount sink, premium gooseneck faucet, recessed lighting, hardwood floors."
                location="Sequim, WA"
              />
              <BeforeAfter
                photo={PHOTOS.bathBA}
                title="Commercial Bathroom Refresh"
                scope="Tan paint + broken tile → sage green walls, wood-look wainscoting, vinyl plank flooring, modern fixtures. Daycare facility."
                location="Sequim, WA"
              />
              {/* Island house before/after as a manual pair */}
              <div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg border flex items-center justify-center" style={{ borderColor: RULE, background: BG_PANEL }}>
                    <img
                      src={PHOTOS.islandBefore}
                      alt="Sequim cottage exterior — before refresh"
                      className="absolute inset-0 w-full h-full object-contain"
                      loading="lazy"
                    />
                    <span
                      className="absolute top-3 left-3 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-[0.20em]"
                      style={{
                        background: BLUEPRINT_GRAD,
                        color: "#fef6e8",
                        fontFamily: FONT_HEAD,
                      }}
                    >
                      Before
                    </span>
                  </div>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg border flex items-center justify-center" style={{ borderColor: ACCENT_DIM, background: BG_PANEL }}>
                    <img
                      src={PHOTOS.islandAfter}
                      alt="Sequim cottage exterior — after exterior + porch refresh by All In One Service's LLC"
                      className="absolute inset-0 w-full h-full object-contain"
                      loading="lazy"
                    />
                    <span
                      className="absolute top-3 left-3 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-[0.20em]"
                      style={{
                        background: COPPER_GRAD,
                        color: "#0a0a0a",
                        fontFamily: FONT_HEAD,
                      }}
                    >
                      After
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <h3
                      className="text-[22px] sm:text-[26px] font-bold tracking-tight"
                      style={{ color: INK, fontFamily: FONT_HEAD }}
                    >
                      Cottage Exterior Refresh
                    </h3>
                    <p
                      className="mt-1 text-[14px]"
                      style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                    >
                      Cream paint + dated trim → cool gray siding, dormer
                      addition, refreshed wraparound porch with new railing
                      detail. Peninsula craftsman bones, modern finish.
                    </p>
                  </div>
                  <span
                    className="text-[11px] uppercase tracking-[0.20em] font-semibold whitespace-nowrap"
                    style={{ color: ACCENT_LIGHT, fontFamily: FONT_HEAD }}
                  >
                    Olympic Peninsula
                  </span>
                </div>
              </div>

              {/* 2nd-story addition pair */}
              <div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg border flex items-center justify-center" style={{ borderColor: RULE, background: BG_PANEL }}>
                    <img
                      src={PHOTOS.additionBefore}
                      alt="Single-story ranch home — before 2nd-story addition, crew on roof framing"
                      className="absolute inset-0 w-full h-full object-contain"
                      loading="lazy"
                    />
                    <span
                      className="absolute top-3 left-3 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-[0.20em]"
                      style={{
                        background: BLUEPRINT_GRAD,
                        color: "#fef6e8",
                        fontFamily: FONT_HEAD,
                      }}
                    >
                      In Progress
                    </span>
                  </div>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg border flex items-center justify-center" style={{ borderColor: ACCENT_DIM, background: BG_PANEL }}>
                    <img
                      src={PHOTOS.additionAfter}
                      alt="Finished 2nd-story addition — yellow craftsman home, completed by All In One Service's LLC"
                      className="absolute inset-0 w-full h-full object-contain"
                      loading="lazy"
                    />
                    <span
                      className="absolute top-3 left-3 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-[0.20em]"
                      style={{
                        background: COPPER_GRAD,
                        color: "#0a0a0a",
                        fontFamily: FONT_HEAD,
                      }}
                    >
                      After
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <h3
                      className="text-[22px] sm:text-[26px] font-bold tracking-tight"
                      style={{ color: INK, fontFamily: FONT_HEAD }}
                    >
                      2nd-Story Addition
                    </h3>
                    <p
                      className="mt-1 text-[14px]"
                      style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                    >
                      Single-story ranch with a torn-off roof and crew up top
                      → finished two-story craftsman with new dormer detail,
                      seamlessly integrated siding, full structural tie-in.
                    </p>
                  </div>
                  <span
                    className="text-[11px] uppercase tracking-[0.20em] font-semibold whitespace-nowrap"
                    style={{ color: ACCENT_LIGHT, fontFamily: FONT_HEAD }}
                  >
                    Clallam County
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────────── 04 · NAMED PROJECTS (cream) ────────────────────── */}
        <section
          id="projects"
          className="relative"
          style={{ background: CREAM_BG }}
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 sm:py-16 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
              <div className="max-w-2xl">
                <SectionNumber n="04" label="Named projects" tone="blueprint" theme="cream" />
                <h2
                  className="font-bold tracking-tight leading-[1.02]"
                  style={{
                    fontFamily: FONT_HEAD,
                    fontSize: "clamp(32px, 5vw, 56px)",
                    color: CREAM_INK,
                  }}
                >
                  Selected work
                  <span style={{ color: ACCENT_DARK }}> from the shop.</span>
                </h2>
              </div>
              <p
                className="max-w-md text-[15px] sm:text-[16px] leading-relaxed"
                style={{ color: CREAM_INK_SOFT, fontFamily: FONT_BODY }}
              >
                Five jobs that show range &mdash; baths, additions, custom
                builds, commercial. All on the Olympic Peninsula. All by the
                same crew.
              </p>
            </div>

            <div className="space-y-6">
              <NamedProject
                theme="cream"
                photo={PHOTOS.soldateShower}
                name="Soldate Shower"
                type="Custom tile shower"
                location="Sequim, WA"
                body="Large-format stone-look tile with frameless glass, ceiling-mount rain head + handshower, matte-black trim throughout, integrated niches, built-in seating bench, pebble shower floor. Premium fit-and-finish."
                highlight="Schluter / Kerdi waterproofing system"
              />
              <NamedProject
                theme="cream"
                photo={PHOTOS.delGuzzi}
                name="710 Del Guzzi Drive"
                type="Bathroom remodel"
                location="Sequim, WA"
                body="Full bath rebuild — large-format marble-look tile shower, frameless sliding glass door, white shaker vanity with quartz top, pebble shower floor with chrome center drain, mirrored vanity wall, refreshed wood-look LVP flooring."
                highlight="Lighted vanity mirror"
              />
              <NamedProject
                theme="cream"
                photo={PHOTOS.jaySakas}
                name="Jay Sakas Addition"
                type="Room addition"
                location="Olympic Peninsula"
                body="New addition with vaulted ceiling, two skylights, wraparound windows on two walls for max natural light, dark-stained wood floors, modern ceiling fan with wood beam center accent. Built to feel like it was always part of the house."
                highlight="Vaulted ceiling + dual skylights"
              />
              <NamedProject
                theme="cream"
                photo={PHOTOS.brodyOffice}
                name="Brody Office Conversion"
                type="Commercial buildout"
                location="Sequim, WA"
                body="Commercial-to-office conversion: light wood-plank flooring, gray walls with crisp black baseboard, interior glass-and-drywall window openings into each office, recessed lighting throughout. Code-compliant, ADA-accessible, on schedule."
                highlight="ADA-compliant + on schedule"
              />
              <NamedProject
                theme="cream"
                photo={PHOTOS.wineCellar}
                name="Wine Cellar / Lounge"
                type="Custom specialty build"
                location="Sequim, WA"
                body="Custom basement build — copper-tile coffered ceiling, exposed wood beam, stacked-stone fireplace facade with linear gas insert, wide-plank wood-look LVP, glass entry door. The kind of project most GCs won't take on."
                highlight="Copper-tile coffered ceiling"
              />
            </div>
          </div>
        </section>

        {/* ────────────────────── 05 · MATERIALS / THE CRAFT ────────────────────── */}
        <section
          id="craft"
          className="relative border-t"
          style={{ background: BG_ALT, borderColor: RULE }}
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 sm:py-16 lg:py-20">
            <SectionNumber n="05" label="The craft" />
            <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-start">
              <div>
                <h2
                  className="font-bold tracking-tight leading-[1.02]"
                  style={{
                    fontFamily: FONT_HEAD,
                    fontSize: "clamp(32px, 5vw, 52px)",
                    color: INK,
                  }}
                >
                  How the
                  <br />
                  <span style={{ color: ACCENT_LIGHT }}>work holds up.</span>
                </h2>
                <p
                  className="mt-6 text-[15px] sm:text-[16px] leading-relaxed"
                  style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                >
                  Bad work shows up a year later &mdash; on the ceiling below
                  the bathroom, in the cabinet face that won&apos;t close, on
                  the deck board that warps the first wet winter. Four things
                  we don&apos;t cut corners on:
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {MATERIAL_CALLOUTS.map((m, i) => (
                  <div
                    key={m.label}
                    className="p-6 rounded-xl border"
                    style={{
                      background: BG_PANEL,
                      borderColor: RULE,
                    }}
                  >
                    <div
                      className="text-[10px] uppercase tracking-[0.22em] font-bold mb-2"
                      style={{ color: ACCENT_LIGHT, fontFamily: FONT_HEAD }}
                    >
                      {String(i + 1).padStart(2, "0")} · {m.label}
                    </div>
                    <p
                      className="text-[14px] sm:text-[15px] leading-relaxed"
                      style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                    >
                      {m.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────────── 06 · WHAT WE BUILD ────────────────────── */}
        <section
          id="services"
          className="relative border-t"
          style={{ borderColor: RULE }}
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 sm:py-16 lg:py-20">
            <SectionNumber n="06" label="What we build" tone="blueprint" />
            <div className="grid lg:grid-cols-[1fr_1.3fr] gap-10 lg:gap-16">
              <div>
                <h2
                  className="font-bold tracking-tight leading-[1.02]"
                  style={{
                    fontFamily: FONT_HEAD,
                    fontSize: "clamp(32px, 5vw, 52px)",
                    color: INK,
                  }}
                >
                  One crew.
                  <br />
                  <span style={{ color: ACCENT_LIGHT }}>
                    Everything inside the four walls.
                  </span>
                </h2>
                <p
                  className="mt-6 text-[15px] sm:text-[16px] leading-relaxed mb-6"
                  style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                >
                  Kitchen + bath remodels are the bread and butter. But the
                  crew is built to take on the harder stuff &mdash; additions,
                  whole-home renovations, the specialty work most GCs send to
                  someone else.
                </p>
                <a
                  href="#estimate"
                  className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.16em] transition-colors hover:brightness-125"
                  style={{ color: ACCENT_LIGHT, fontFamily: FONT_HEAD }}
                >
                  See if your project fits
                  <ArrowRight size={13} weight="bold" />
                </a>
              </div>
              <ul className="divide-y" style={{ borderColor: RULE }}>
                {SERVICES_LIST.map((s, i) => (
                  <li
                    key={s.name}
                    className="py-5 sm:py-6 grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] gap-4 sm:gap-6 items-baseline"
                    style={{ borderColor: RULE }}
                  >
                    <span
                      className="text-[12px] uppercase tracking-[0.22em] font-bold tabular-nums"
                      style={{ color: ACCENT_LIGHT, fontFamily: FONT_HEAD }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div
                        className="text-[20px] sm:text-[22px] font-bold tracking-tight"
                        style={{ color: INK, fontFamily: FONT_HEAD }}
                      >
                        {s.name}
                      </div>
                      <div
                        className="mt-1 text-[13px] sm:text-[14px]"
                        style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                      >
                        {s.sub}
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      weight="bold"
                      className="hidden sm:block opacity-50"
                      style={{ color: ACCENT_LIGHT }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ────────────────────── 07 · THE TIMELINE ────────────────────── */}
        <section
          id="timeline"
          className="relative border-t"
          style={{ background: BG_ALT, borderColor: RULE }}
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 sm:py-16 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                <SectionNumber n="07" label="The timeline" />
                <h2
                  className="font-bold tracking-tight leading-[1.02]"
                  style={{
                    fontFamily: FONT_HEAD,
                    fontSize: "clamp(32px, 5vw, 56px)",
                    color: INK,
                  }}
                >
                  What a remodel
                  <br />
                  <span style={{ color: ACCENT_LIGHT }}>actually looks like.</span>
                </h2>
              </div>
              <p
                className="max-w-md text-[15px] sm:text-[16px] leading-relaxed"
                style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
              >
                Most stress on a remodel comes from not knowing what&apos;s
                next. Here&apos;s a typical 6&ndash;7 week mid-size project,
                week by week.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-x-12 gap-y-2">
              {TIMELINE.map((t, i) => (
                <div
                  key={t.range}
                  className="grid grid-cols-[auto_1fr] gap-5 sm:gap-7 py-6 border-b"
                  style={{ borderColor: RULE }}
                >
                  <div className="text-right">
                    <div
                      className="text-[10px] uppercase tracking-[0.22em] font-bold mb-1"
                      style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
                    >
                      Step {String(i + 1).padStart(2, "0")}
                    </div>
                    <div
                      className="text-[14px] sm:text-[16px] font-bold whitespace-nowrap"
                      style={{ color: ACCENT_LIGHT, fontFamily: FONT_HEAD }}
                    >
                      {t.range}
                    </div>
                  </div>
                  <div>
                    <h3
                      className="text-[18px] sm:text-[20px] font-bold tracking-tight mb-1.5"
                      style={{ color: INK, fontFamily: FONT_HEAD }}
                    >
                      {t.label}
                    </h3>
                    <p
                      className="text-[14px] leading-relaxed"
                      style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                    >
                      {t.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ────────────────────── 08 · CREDENTIALS (cream) ────────────────────── */}
        <section
          id="credentials"
          className="relative"
          style={{ background: CREAM_BG }}
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 sm:py-16 lg:py-20">
            <SectionNumber n="08" label="Receipts, not slogans" tone="blueprint" theme="cream" />
            <h2
              className="font-bold tracking-tight leading-[1.02] mb-10 max-w-3xl"
              style={{
                fontFamily: FONT_HEAD,
                fontSize: "clamp(32px, 5vw, 56px)",
                color: CREAM_INK,
              }}
            >
              The numbers
              <span style={{ color: ACCENT_DARK }}> that actually matter.</span>
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-12">
              <CredStat
                theme="cream"
                label="WA Contractor Score"
                value="106"
                sub="Top 7% of 128,670"
                source="BuildZoom"
              />
              <CredStat
                theme="cream"
                label="Avg permit value"
                value={BUSINESS.avgPermitValue}
                sub="Per L&I records"
                source="WA L&I"
              />
              <CredStat
                theme="cream"
                label="Years in business"
                value="10"
                sub="Since March 2016"
                source="WA Sec. of State"
              />
              <CredStat
                theme="cream"
                label="Customer rating"
                value={`${BUSINESS.rating}★`}
                sub={`${BUSINESS.reviewCount} verified reviews`}
                source="Birdeye + Chamber"
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              <div
                className="p-7 sm:p-9 rounded-xl border"
                style={{ background: CREAM_PANEL, borderColor: CREAM_RULE }}
              >
                <Certificate
                  size={28}
                  weight="duotone"
                  style={{ color: ACCENT_DARK }}
                  className="mb-4"
                />
                <h3
                  className="text-[22px] sm:text-[24px] font-bold tracking-tight mb-4"
                  style={{ color: CREAM_INK, fontFamily: FONT_HEAD }}
                >
                  Licensed · Bonded · Insured.
                </h3>
                <dl
                  className="space-y-3 text-[14px] sm:text-[15px]"
                  style={{ fontFamily: FONT_BODY }}
                >
                  <CredRow theme="cream" label="WA L&I License #" value={BUSINESS.license} />
                  <CredRow
                    theme="cream"
                    label="General Liability"
                    value={`${BUSINESS.insurance} · Ohio Security`}
                  />
                  <CredRow
                    theme="cream"
                    label="Surety Bond"
                    value={`${BUSINESS.bond} · Western Surety`}
                  />
                  <CredRow theme="cream" label="USDOT" value="3515033" />
                  <CredRow theme="cream" label="BBB Rating" value={`${BUSINESS.bbbRating} (since 2017)`} />
                </dl>
              </div>

              <div
                className="p-7 sm:p-9 rounded-xl border"
                style={{ background: CREAM_PANEL, borderColor: CREAM_RULE }}
              >
                <Trophy
                  size={28}
                  weight="duotone"
                  style={{ color: ACCENT_DARK }}
                  className="mb-4"
                />
                <h3
                  className="text-[22px] sm:text-[24px] font-bold tracking-tight mb-3"
                  style={{ color: CREAM_INK, fontFamily: FONT_HEAD }}
                >
                  Top 7% of every
                  <br />
                  <span style={{ color: ACCENT_DARK }}>WA contractor.</span>
                </h3>
                <p
                  className="text-[14px] sm:text-[15px] leading-relaxed mb-4"
                  style={{ color: CREAM_INK_SOFT, fontFamily: FONT_BODY }}
                >
                  BuildZoom — the largest independent contractor index in the
                  US — scores All In One Service&apos;s LLC at{" "}
                  <strong style={{ color: CREAM_INK }}>106</strong>, in the 93rd
                  percentile of 128,670 Washington licensed contractors. The
                  score factors permits pulled, clean inspections, insurance
                  posture, and verified client feedback.
                </p>
                <a
                  href={BUSINESS.buildzoomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors hover:brightness-125"
                  style={{ color: ACCENT_DARK, fontFamily: FONT_HEAD }}
                >
                  Verify on BuildZoom
                  <ArrowRight size={13} weight="bold" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────────── 09 · VOICES ────────────────────── */}
        <section
          id="voices"
          className="relative border-t"
          style={{ background: BG_ALT, borderColor: RULE }}
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 sm:py-16 lg:py-20">
            <SectionNumber n="09" label="What Kyle's customers say" />
            <h2
              className="font-bold tracking-tight leading-[1.02] mb-12 max-w-3xl"
              style={{
                fontFamily: FONT_HEAD,
                fontSize: "clamp(32px, 5vw, 56px)",
                color: INK,
              }}
            >
              Five-star reviews.
              <span style={{ color: ACCENT_LIGHT }}> Real names attached.</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-5 max-w-5xl">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="p-7 sm:p-8 rounded-xl border"
                  style={{ background: BG_PANEL, borderColor: RULE }}
                >
                  <Quotes
                    size={26}
                    weight="fill"
                    style={{ color: ACCENT_LIGHT, opacity: 0.5 }}
                    className="mb-3"
                  />
                  <p
                    className="text-[16px] sm:text-[18px] leading-relaxed mb-5"
                    style={{ color: INK, fontFamily: FONT_BODY }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: RULE }}>
                    <div>
                      <div
                        className="text-[14px] font-bold"
                        style={{ color: INK, fontFamily: FONT_HEAD }}
                      >
                        {t.name}
                      </div>
                      <div
                        className="text-[11px] uppercase tracking-[0.18em] mt-0.5"
                        style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
                      >
                        {t.project}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={13}
                          weight="fill"
                          style={{ color: ACCENT_LIGHT }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <a
                href={BUSINESS.birdeyeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.16em] transition-colors hover:brightness-125"
                style={{ color: ACCENT_LIGHT, fontFamily: FONT_HEAD }}
              >
                Read all 18+ reviews on Birdeye
                <ArrowRight size={14} weight="bold" />
              </a>
            </div>
          </div>
        </section>

        {/* ────────────────────── 10 · WHERE WE BUILD ────────────────────── */}
        <section
          id="coverage"
          className="relative border-t"
          style={{ borderColor: RULE }}
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 sm:py-16 lg:py-20">
            <SectionNumber n="10" label="Where we build" tone="blueprint" />
            <div className="grid lg:grid-cols-[1fr_1.3fr] gap-10 lg:gap-16 items-start">
              <div>
                <h2
                  className="font-bold tracking-tight leading-[1.02]"
                  style={{
                    fontFamily: FONT_HEAD,
                    fontSize: "clamp(32px, 5vw, 52px)",
                    color: INK,
                  }}
                >
                  The Olympic
                  <br />
                  <span style={{ color: ACCENT_LIGHT }}>Peninsula.</span>
                </h2>
                <p
                  className="mt-6 text-[15px] sm:text-[16px] leading-relaxed"
                  style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                >
                  Shop is on E Washington St in Sequim. Most projects within
                  an hour. Two-county coverage: Clallam + Jefferson.
                </p>
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-3 mt-6 group"
                >
                  <MapPin
                    size={18}
                    weight="fill"
                    style={{ color: ACCENT_LIGHT, marginTop: 4 }}
                  />
                  <span>
                    <span
                      className="block text-[16px] font-bold transition-colors group-hover:text-white"
                      style={{ color: INK, fontFamily: FONT_HEAD }}
                    >
                      {BUSINESS.address.street}
                    </span>
                    <span
                      className="block text-[13px] mt-0.5"
                      style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                    >
                      {BUSINESS.address.city}, {BUSINESS.address.state}{" "}
                      {BUSINESS.address.zip}
                    </span>
                  </span>
                </a>
              </div>

              <div>
                <div className="flex flex-wrap gap-2 mb-7">
                  {BUSINESS.serviceArea.map((city) => (
                    <span
                      key={city}
                      className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[12px] font-semibold"
                      style={{
                        background: "rgba(217, 119, 6, 0.08)",
                        color: ACCENT_LIGHT,
                        border: `1px solid ${ACCENT_DIM}`,
                        fontFamily: FONT_HEAD,
                      }}
                    >
                      {city}, WA
                    </span>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-[14px]">
                  {BUSINESS.counties.map((c) => (
                    <div
                      key={c}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-md"
                      style={{
                        background: "rgba(254, 246, 232, 0.03)",
                        color: INK_SOFT,
                        fontFamily: FONT_BODY,
                      }}
                    >
                      <CheckCircle
                        size={15}
                        weight="fill"
                        style={{ color: ACCENT_LIGHT }}
                      />
                      <span className="font-semibold" style={{ color: INK }}>
                        {c}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────────── 11 · ESTIMATE ────────────────────── */}
        <section
          id="estimate"
          className="relative border-t"
          style={{ background: BG_ALT, borderColor: RULE }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            <div
              className="absolute -left-40 top-1/4 w-[520px] h-[520px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(217, 119, 6, 0.14) 0%, rgba(217, 119, 6, 0) 70%)",
              }}
            />
            <div
              className="absolute -right-40 bottom-0 w-[480px] h-[480px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(252, 211, 77, 0.10) 0%, rgba(252, 211, 77, 0) 70%)",
              }}
            />
          </div>
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-12 sm:py-16 lg:py-20">
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-14">
              <div>
                <SectionNumber n="11" label="Free estimate" />
                <h2
                  className="font-bold tracking-tight leading-[1.02] mb-6"
                  style={{
                    fontFamily: FONT_HEAD,
                    fontSize: "clamp(32px, 5vw, 56px)",
                    color: INK,
                  }}
                >
                  Send the sketch.
                  <br />
                  <span style={{ color: ACCENT_LIGHT }}>
                    We&apos;ll price it honest.
                  </span>
                </h2>
                <p
                  className="text-[16px] leading-relaxed mb-8"
                  style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                >
                  Drop the rough idea below. Kyle visits the property within a
                  few days, walks the scope with you, and prices the job
                  itemized line-by-line. No charge, no obligation, no
                  high-pressure pitch.
                </p>
                <div className="space-y-4">
                  <ContactRow
                    icon={<Phone size={18} weight="fill" />}
                    label="Call or text"
                    value={BUSINESS.phoneDisplay}
                    href={BUSINESS.phoneHref}
                  />
                  <ContactRow
                    icon={<MapPin size={18} weight="fill" />}
                    label="Shop"
                    value={BUSINESS.address.full}
                    href={BUSINESS.mapsUrl}
                  />
                  <ContactRow
                    icon={<Calendar size={18} weight="fill" />}
                    label="Hours"
                    value="Mon–Fri · 8am–5pm"
                  />
                  <ContactRow
                    icon={<Certificate size={18} weight="fill" />}
                    label="License"
                    value={`WA L&I · ${BUSINESS.license}`}
                  />
                </div>
              </div>
              <div>
                <AIOSContactForm
                  prospectId={BUSINESS.prospectId}
                  services={SERVICE_LIST}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────────── FOOTER (dark bookend) ────────────────────── */}
        <footer
          className="relative pt-14 pb-8 border-t"
          style={{ background: DARK_BG, borderColor: ACCENT_DIM }}
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <AIOSMark size={36} flat />
                  <div
                    className="flex flex-col leading-tight"
                    style={{ color: DARK_INK, fontFamily: FONT_HEAD }}
                  >
                    <span className="text-[15px] font-bold tracking-wide">
                      ALL IN ONE SERVICES
                    </span>
                    <span
                      className="text-[10px] tracking-[0.22em] uppercase font-medium mt-0.5"
                      style={{ color: ACCENT_LIGHT }}
                    >
                      Licensed · Bonded · Insured
                    </span>
                  </div>
                </div>
                <p
                  className="text-[13px] leading-relaxed mb-4"
                  style={{ color: DARK_INK_DIM, fontFamily: FONT_BODY }}
                >
                  Family-operated general contractor serving Clallam and
                  Jefferson Counties since 2016.
                </p>
                <div
                  className="text-[11px] uppercase tracking-[0.20em] font-semibold"
                  style={{ color: ACCENT_LIGHT, fontFamily: FONT_HEAD }}
                >
                  WA L&I: {BUSINESS.license}
                </div>
              </div>

              <FooterCol title="The shop">
                <FooterLink href="#transformations" label="Before / After" />
                <FooterLink href="#projects" label="Named Projects" />
                <FooterLink href="#craft" label="The Craft" />
                <FooterLink href="#services" label="What We Build" />
                <FooterLink href="#timeline" label="The Timeline" />
              </FooterCol>

              <FooterCol title="Trust">
                <FooterExt href={BUSINESS.bbbUrl} label="BBB Profile ↗" />
                <FooterExt href={BUSINESS.buildzoomUrl} label="BuildZoom ↗" />
                <FooterExt href={BUSINESS.birdeyeUrl} label="Birdeye Reviews ↗" />
                <FooterExt href={BUSINESS.facebook} label="Facebook ↗" />
              </FooterCol>

              <FooterCol title="Contact">
                <li>
                  <a
                    href={BUSINESS.phoneHref}
                    className="inline-flex items-center gap-2 transition-colors hover:text-white"
                    style={{ color: DARK_INK_DIM }}
                  >
                    <Phone
                      size={13}
                      weight="fill"
                      style={{ color: ACCENT_LIGHT }}
                    />
                    {BUSINESS.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={BUSINESS.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-2 transition-colors hover:text-white"
                    style={{ color: DARK_INK_DIM }}
                  >
                    <MapPin
                      size={13}
                      weight="fill"
                      style={{ color: ACCENT_LIGHT, marginTop: 3 }}
                    />
                    <span>
                      {BUSINESS.address.street}
                      <br />
                      {BUSINESS.address.city}, {BUSINESS.address.state}{" "}
                      {BUSINESS.address.zip}
                    </span>
                  </a>
                </li>
              </FooterCol>
            </div>

            <div
              className="pt-7 mt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px]"
              style={{
                borderColor: DARK_RULE,
                color: DARK_INK_DIM,
                fontFamily: FONT_BODY,
              }}
            >
              <div>
                © {new Date().getFullYear()} All In One Service&apos;s LLC. All
                rights reserved.
              </div>
              <div className="inline-flex items-center gap-2">
                <BluejayLogo size={16} />
                <span>
                  Built by{" "}
                  <a
                    href="https://bluejayportfolio.com/audit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold transition-colors hover:text-white"
                    style={{ color: ACCENT_LIGHT }}
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

/* ───────────────────────── SUB COMPONENTS ───────────────────────── */

function CredStat({
  label,
  value,
  sub,
  source,
  theme = "dark",
}: {
  label: string;
  value: string;
  sub: string;
  source: string;
  theme?: "dark" | "cream";
}) {
  const isCream = theme === "cream";
  return (
    <div
      className="p-5 sm:p-6 rounded-xl border"
      style={{
        background: isCream ? CREAM_PANEL : BG_PANEL,
        borderColor: isCream ? CREAM_RULE : RULE,
      }}
    >
      <div
        className="text-[10px] uppercase tracking-[0.20em] font-semibold mb-2"
        style={{ color: isCream ? ACCENT_DARK : ACCENT_LIGHT, fontFamily: FONT_HEAD }}
      >
        {label}
      </div>
      <div
        className="text-[32px] sm:text-[40px] font-bold leading-none mb-2 tracking-tight"
        style={{ color: isCream ? CREAM_INK : INK, fontFamily: FONT_HEAD }}
      >
        {value}
      </div>
      <div
        className="text-[12px] sm:text-[13px]"
        style={{ color: isCream ? CREAM_INK_SOFT : INK_SOFT, fontFamily: FONT_BODY }}
      >
        {sub}
      </div>
      <div
        className="text-[10px] uppercase tracking-[0.18em] mt-3 pt-3 border-t"
        style={{
          color: BLUEPRINT,
          fontFamily: FONT_HEAD,
          borderColor: BLUEPRINT_DIM,
        }}
      >
        Source · {source}
      </div>
    </div>
  );
}

function CredRow({
  label,
  value,
  theme = "dark",
}: {
  label: string;
  value: string;
  theme?: "dark" | "cream";
}) {
  const isCream = theme === "cream";
  return (
    <div
      className="flex items-center justify-between gap-4 py-1.5 border-b last:border-0"
      style={{ borderColor: isCream ? CREAM_RULE : RULE }}
    >
      <dt
        className="text-[11px] uppercase tracking-[0.18em] font-semibold"
        style={{ color: isCream ? CREAM_INK_DIM : INK_DIM, fontFamily: FONT_HEAD }}
      >
        {label}
      </dt>
      <dd
        className="text-[13px] sm:text-[14px] font-bold tabular-nums"
        style={{ color: isCream ? CREAM_INK : INK, fontFamily: FONT_HEAD }}
      >
        {value}
      </dd>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <>
      <div
        className="shrink-0 flex items-center justify-center w-10 h-10 rounded-md"
        style={{
          background: "rgba(217, 119, 6, 0.12)",
          color: ACCENT_LIGHT,
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-[10px] uppercase tracking-[0.20em] font-semibold mb-0.5"
          style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
        >
          {label}
        </div>
        <div
          className="text-[15px] font-semibold"
          style={{ color: INK, fontFamily: FONT_HEAD }}
        >
          {value}
        </div>
      </div>
    </>
  );
  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="flex items-start gap-4 p-4 rounded-lg border transition-all hover:border-white/20"
        style={{
          background: "rgba(254, 246, 232, 0.02)",
          borderColor: RULE,
        }}
      >
        {inner}
      </a>
    );
  }
  return (
    <div
      className="flex items-start gap-4 p-4 rounded-lg border"
      style={{
        background: "rgba(254, 246, 232, 0.02)",
        borderColor: RULE,
      }}
    >
      {inner}
    </div>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="text-[12px] uppercase tracking-[0.22em] font-bold mb-4"
        style={{ color: DARK_INK, fontFamily: FONT_HEAD }}
      >
        {title}
      </div>
      <ul
        className="space-y-2.5 text-[13px]"
        style={{ color: DARK_INK_DIM, fontFamily: FONT_BODY }}
      >
        {children}
      </ul>
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a href={href} className="transition-colors hover:text-white">
        {label}
      </a>
    </li>
  );
}

function FooterExt({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:text-white"
        style={{ color: ACCENT_LIGHT }}
      >
        {label}
      </a>
    </li>
  );
}
