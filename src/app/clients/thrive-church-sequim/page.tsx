"use client";

/**
 * Thrive Church Sequim — Homepage
 * Concept: "Where Light Breaks" — a dawn-over-the-Olympics editorial.
 * Cream paper · Evergreen ink · Sunrise amber.
 *
 * Typography: Newsreader (display serif) + Inter (body). Swapped from
 *   Fraunces 2026-05-19 — Fraunces' canonical F/J letterforms read as
 *   "weird" at display sizes. Newsreader keeps the warm editorial feel
 *   with conventional letterforms.
 */

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  ArrowUpRight,
  MapPin,
  Phone,
  EnvelopeSimple,
  PlayCircle,
  FacebookLogo,
  InstagramLogo,
  YoutubeLogo,
  Coffee,
  Clock,
  Users,
  Baby,
  HandHeart,
  ForkKnife,
  Globe,
  House,
  BookOpen,
  Sparkle,
  HandsPraying,
} from "@phosphor-icons/react";

import StickyNav from "./sticky-nav";
import ConnectCardForm from "./connect-card";
import PrayerRequestForm from "./prayer-form";
import ThriveMark from "./thrive-mark";
import ChristianMotifs from "./christian-motifs";
import BluejayLogo from "@/components/BluejayLogo";

/* ---------- constants ---------- */
const ADDRESS = "640 N Sequim Ave, Sequim, WA 98382";
const ADDRESS_URL =
  "https://www.google.com/maps/search/?api=1&query=640+N+Sequim+Ave+Sequim+WA+98382";
const MAP_EMBED =
  "https://www.google.com/maps?q=640+N+Sequim+Ave+Sequim+WA+98382&output=embed";
const PHONE_DISPLAY = "(360) 683-7981";
const PHONE_TEL = "tel:+13606837981";
const EMAIL = "office@thrivesequim.com";
const YOUTUBE_URL = "https://www.youtube.com/@thrivechurch-sequim1514";
const LATEST_SERMON_URL = YOUTUBE_URL;
const FACEBOOK_URL = "https://www.facebook.com/ThriveSequim";
const INSTAGRAM_URL = "https://www.instagram.com/Thrive_Sequim/";
const GIVE_URL = "https://thrivesequim.com/generosity";
const PRESCHOOL_URL = "https://thrivesequim.breezechms.com/form/21d24b6151";
const AUDIT_URL = "https://bluejayportfolio.com";

/* ---------- motion helpers ---------- */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

const reveal: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1.2, ease: "easeOut" } },
};

/* ============================================================== */
/*                            PAGE                                 */
/* ============================================================== */
export default function ThriveChurchSequimPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#fbf7ee] font-[family-name:var(--font-thrive-body)] text-[#1a1a1a] antialiased selection:bg-[#0d4f4a] selection:text-[#fbf7ee]">
      {/* Subtle paper grain — applied everywhere */}
      <PaperGrain />
      <StickyNav />

      <Hero />
      <ServiceStripe />
      <TaglineSpread />
      <WhatToExpect />
      <LatestSermon />
      <ConnectSection />
      <MinistriesGrid />
      <PreschoolSpotlight />
      <BeliefsSpread />
      <Outreach />
      <Generosity />
      <PrayerSection />
      <VisitUs />
      <FinalCTA />
      <SiteFooter />
    </main>
  );
}

/* ============================================================== */
/*                         BACKGROUND GRAIN                        */
/* ============================================================== */
function PaperGrain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.035] mix-blend-multiply"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
}

/* ============================================================== */
/*                              HERO                               */
/* ============================================================== */
function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-3 sm:pt-8 lg:pt-10 xl:pt-14 2xl:pt-20">
      {/* Topographic background */}
      <TopoLines />

      <div className="relative z-10 mx-auto grid max-w-[1480px] grid-cols-1 gap-y-4 px-6 pb-3 sm:gap-y-6 sm:px-10 sm:pb-6 lg:grid-cols-12 lg:gap-x-10 lg:pb-6 xl:pb-10 xl:max-w-[1640px] xl:gap-x-14 2xl:pb-14">
        {/* TEXT BLOCK */}
        <div className="lg:col-span-7 lg:pt-2">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.28em] text-[#0a3a36]"
          >
            <span className="inline-block h-px w-10 bg-[#d97706]" />
            Sequim, Washington · Olympic Peninsula
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="mt-6 font-[family-name:var(--font-thrive-display)] text-[clamp(2.4rem,5.2vw,6rem)] leading-[1] tracking-[-0.02em] text-[#0d4f4a]"
            style={{ fontWeight: 500 }}
          >
            We are{" "}
            <em className="italic text-[#d97706]" style={{ fontWeight: 400 }}>
              Thrive.
            </em>
          </motion.h1>

          {/* Paragraph removed 2026-05-19 per Ben — the same mission
              quote appears immediately below the ServiceStripe marquee
              inside TaglineSpread, so this duplicated it. Hero now
              reads cleaner: eyebrow → giant H1 → CTA → service stamp.
              CTA margin bumped (mt-6 → mt-10) to compensate for the
              vertical breathing room the paragraph used to provide. */}

          {/* CTA cluster */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              href="#connect"
              className="group inline-flex items-center gap-3 rounded-full bg-[#0d4f4a] px-8 py-4 text-sm font-medium uppercase tracking-[0.18em] text-[#fbf7ee] transition-all duration-300 hover:bg-[#0a3d39] hover:shadow-[0_18px_40px_-12px_rgba(13,79,74,0.5)]"
            >
              Plan a Visit
              <ArrowUpRight
                size={16}
                weight="bold"
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href={LATEST_SERMON_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-[44px] items-center gap-3 px-2 py-2 text-sm font-medium uppercase tracking-[0.18em] text-[#0d4f4a] transition-colors hover:text-[#d97706]"
            >
              <PlayCircle size={28} weight="duotone" />
              Watch live
            </Link>
          </motion.div>

          {/* Service stamp */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-5 inline-flex max-w-md flex-col gap-1 border-l-2 border-[#d97706] pl-4"
          >
            <span className="text-[12px] font-bold uppercase tracking-[0.28em] text-[#d97706]">
              Sunday Gathering
            </span>
            <span className="font-[family-name:var(--font-thrive-display)] text-xl text-[#0d4f4a] sm:text-2xl xl:text-3xl" style={{ fontWeight: 500 }}>
              10:30 a.m. — in person or livestream
            </span>
            <Link
              href={ADDRESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center py-2 text-[15px] text-[#1a1a1a]/80 underline-offset-4 hover:text-[#0d4f4a] hover:underline"
            >
              {ADDRESS}
            </Link>
          </motion.div>
        </div>

        {/* ILLUSTRATION BLOCK */}
        <motion.div
          variants={reveal}
          initial="hidden"
          animate="show"
          className="relative lg:col-span-5 lg:pt-4"
        >
          <SunriseIllustration />

          {/* Pull quote — sits inside the illustration frame so it
              doesn't add to the section's overall height (keeps the
              marquee above the fold on initial landing). */}
          <motion.figure
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={5}
            className="absolute bottom-3 left-3 right-3 max-w-md bg-[#fbf7ee]/95 px-6 py-4 shadow-[0_18px_40px_-18px_rgba(13,79,74,0.4)] backdrop-blur-sm sm:bottom-4 sm:left-4 sm:right-auto sm:px-7 sm:py-5"
          >
            <span className="absolute -top-4 left-6 bg-[#fbf7ee] px-2 font-[family-name:var(--font-thrive-display)] text-4xl leading-none text-[#d97706]">
              &ldquo;
            </span>
            <blockquote className="font-[family-name:var(--font-thrive-display)] text-xl italic leading-snug text-[#0d4f4a] sm:text-2xl" style={{ fontWeight: 500 }}>
              The light shines in the darkness, and the darkness has not
              overcome it.
            </blockquote>
            <figcaption className="mt-3 text-[12px] font-bold uppercase tracking-[0.24em] text-[#d97706]">
              John 1:5
            </figcaption>
            <span className="absolute -bottom-4 right-6 bg-[#fbf7ee] px-2 font-[family-name:var(--font-thrive-display)] text-4xl leading-none text-[#d97706]">
              &rdquo;
            </span>
          </motion.figure>
        </motion.div>
      </div>
    </section>
  );
}

/* Custom SVG: sunrise over the Olympic Mountains as seen from Sequim.
 *
 * Animated reveal — Genesis-1-style sequential creation. The viewer
 * loads, and the illustration assembles in front of them:
 *
 *   1. Sky brightens (dawn gradient fades in)
 *   2. Mist hangs in the valleys
 *   3. Distant Olympic peaks rise from below (snow-capped — Mt. Olympus
 *      profile-ish)
 *   4. Mid-range forested ridge rises
 *   5. Sun crests behind the peaks
 *   6. Foreground conifer tree-line drops in
 *   7. Birds fly across
 *   8. "And there was light." (Gen 1:3) caption fades in
 *
 * Total run ~3 seconds, then everything stays in place. The whole thing
 * is in the hero so it animates on initial paint.
 */
/**
 * React-state-driven timeline. The Claude preview Chromium variant
 * disables both CSS keyframes AND SMIL animations for headless reasons,
 * so we drive the reveal via requestAnimationFrame + setState — works
 * in every real browser and the preview tool.
 */
function useGenesisTimeline(totalMs = 7200) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const start = performance.now();
    let raf = 0;
    let fallback = 0;
    const tick = () => {
      const t = performance.now() - start;
      setElapsed(t);
      if (t < totalMs) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Fallback: if RAF gets paused (hidden tab, throttled browser),
    // setTimeout still fires and snaps the timeline to its end state
    // so the illustration is never stuck invisible.
    fallback = window.setTimeout(() => {
      cancelAnimationFrame(raf);
      setElapsed(totalMs);
    }, totalMs + 800);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
    };
  }, [totalMs]);
  return elapsed;
}

/** ease-out cubic for smoother fade-ins. */
function easeOut(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

/** Returns opacity for an element that begins at `begin` ms,
 *  takes `dur` ms to reach `max` opacity. */
function fade(elapsed: number, begin: number, dur: number, max = 1) {
  if (elapsed < begin) return 0;
  const t = Math.min((elapsed - begin) / dur, 1);
  return easeOut(t) * max;
}

function SunriseIllustration() {
  const elapsed = useGenesisTimeline();

  // Genesis-1 creation order (locked 2026-05-18 — Ben 7-second pass).
  // Compressed from 10.6s → 7s. Each Day still reads distinct
  // because the relative gaps between steps were preserved while
  // overall pace tightened. Each step starts 400-800ms after the
  // previous one started so the eye still has time to register each
  // piece arriving without dragging the whole sequence out.
  //
  //   Day 1 — Light          (sky fades up)          0.00s → 0.85s
  //   Day 1 — Sun            (rises in upper-right)  0.25s → 1.40s
  //   Day 2 — Firmament      (atmospheric haze)      1.05s → 2.00s
  //   Day 3a — Land          (distant Olympics)      1.85s → 2.80s
  //   Day 3b — More land     (forested mid ridge)    2.50s → 3.45s
  //   Day 3c — Waters btwn   (Strait of Juan de F.)  3.10s → 4.00s
  //   Day 3d — Waters below  (Sequim Bay foreground) 3.50s → 4.40s
  //   Day 3e — Vegetation    (trees + shore)         4.05s → 5.00s
  //   Day 4 — Sun warms      (slope highlights)      4.60s → 5.60s
  //   Day 5 — Sea life       (water ripples)         5.15s → 6.15s, max 0.55
  //   Day 5 — Birds          (10, spread, depth)     5.40s → 6.60s, max 0.75
  //   Caption                ("And there was light") 6.20s → 7.00s, max 0.85
  const skyOp = fade(elapsed, 0, 850);
  const sunOp = fade(elapsed, 250, 1150);
  const hazeOp = fade(elapsed, 1050, 950);
  const peaksOp = fade(elapsed, 1850, 950);
  const midRidgeOp = fade(elapsed, 2500, 950);
  const straitOp = fade(elapsed, 3100, 900);
  const waterOp = fade(elapsed, 3500, 900);
  const treesOp = fade(elapsed, 4050, 950);
  const slopeOp = fade(elapsed, 4600, 1000);
  const ripplesOp = fade(elapsed, 5150, 1000, 0.55);
  const birdsOp = fade(elapsed, 5400, 1200, 0.75);
  const captionOp = fade(elapsed, 6200, 800, 0.85);

  return (
    <div className="relative aspect-[21/9] w-full overflow-hidden rounded-sm bg-[#fef3c7]/40 sm:aspect-[4/3]">
      <svg
        viewBox="0 0 600 450"
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          {/* Warm dawn sky — peach → cream */}
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="40%" stopColor="#fdebbf" />
            <stop offset="80%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#faf3df" />
          </linearGradient>
          {/* Sun halo — wide soft warm glow */}
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#fbbf24" stopOpacity="0.45" />
            <stop offset="75%" stopColor="#d97706" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </radialGradient>
          {/* Sun disc — subtle gradient gives it some dimension */}
          <radialGradient id="sunDisc" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#c2410c" />
          </radialGradient>
          {/* Atmospheric haze — used to soften the back ridge into the
              mid ridge so the transition reads as distance, not as a
              hard horizontal band. */}
          <linearGradient id="haze" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fbf7ee" stopOpacity="0" />
            <stop offset="100%" stopColor="#fbf7ee" stopOpacity="0.7" />
          </linearGradient>
          {/* Water — Strait of Juan de Fuca / Sequim Bay at dawn.
              Top is reflection of the dawn sky (lighter), bottom is
              deeper teal. */}
          <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#a4c5c0" />
            <stop offset="25%" stopColor="#6b9a94" />
            <stop offset="100%" stopColor="#1f4d47" />
          </linearGradient>
          {/* Warm sunrise glow on the water — where the sun's reflection
              hits the surface. cx tracks the sun position (now at 79%). */}
          <radialGradient id="waterGlow" cx="79%" cy="0%" r="70%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.42" />
            <stop offset="60%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          {/* Strait/bay between the mountain ranges — slightly lighter
              than the foreground water since it's farther away and
              catches more sky reflection. */}
          <linearGradient id="strait" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#bcd6d1" />
            <stop offset="100%" stopColor="#7ba89f" />
          </linearGradient>
        </defs>

        {/* ── DAY 1 — LIGHT (sky fades in) ── */}
        <g opacity={skyOp}>
          <rect width="600" height="450" fill="url(#sky)" />
        </g>

        {/* ── DAY 1 — SUN (rises first per Ben's Gen-1:3 brief).
            Moved up + right (cx 475 / cy 100) so it sits clearly in
            the upper-right sky rather than half-hidden by the back
            mountain ridge. Halo + disc + a soft warm wash across
            the lower sky. ── */}
        <g opacity={sunOp}>
          <circle cx="475" cy="100" r="170" fill="url(#sunGlow)" />
          <circle cx="475" cy="100" r="38" fill="url(#sunDisc)" />
          {/* Sun-side warm halo wash on the right edge of the sky */}
          <ellipse cx="475" cy="100" r="0" />
          <ellipse cx="475" cy="220" rx="220" ry="6" fill="#fde68a" opacity="0.32" />
        </g>

        {/* ── DAY 2 (cont.) — CLOUDS drifting in with the firmament.
            Soft ellipse clusters in cream-white with a warm peach
            underside catching the sun's dawn light. Positioned to
            avoid the sun disc itself (475, 100). The cloud nearest
            the sun (x≈370) picks up a stronger warm wash to sell the
            "sunrise lighting the underside of the clouds" moment. ── */}
        <g opacity={hazeOp}>
          {/* Cloud 1 — far left, high */}
          <g>
            <ellipse cx="90" cy="78" rx="38" ry="13" fill="#fdf6ee" opacity="0.92" />
            <ellipse cx="64" cy="83" rx="22" ry="11" fill="#fdf6ee" opacity="0.88" />
            <ellipse cx="116" cy="83" rx="26" ry="11" fill="#fdf6ee" opacity="0.88" />
            <ellipse cx="80" cy="70" rx="18" ry="9" fill="#fdf6ee" opacity="0.95" />
            <ellipse cx="105" cy="70" rx="20" ry="10" fill="#fdf6ee" opacity="0.95" />
            <ellipse cx="90" cy="90" rx="38" ry="3" fill="#fed7aa" opacity="0.40" />
          </g>
          {/* Cloud 2 — left mid-sky */}
          <g>
            <ellipse cx="225" cy="155" rx="44" ry="13" fill="#fdf6ee" opacity="0.88" />
            <ellipse cx="195" cy="158" rx="20" ry="10" fill="#fdf6ee" opacity="0.85" />
            <ellipse cx="255" cy="155" rx="22" ry="10" fill="#fdf6ee" opacity="0.85" />
            <ellipse cx="215" cy="148" rx="18" ry="9" fill="#fdf6ee" opacity="0.9" />
            <ellipse cx="242" cy="148" rx="20" ry="9" fill="#fdf6ee" opacity="0.9" />
            <ellipse cx="225" cy="165" rx="44" ry="3" fill="#fed7aa" opacity="0.45" />
          </g>
          {/* Cloud 3 — small wisp near the sun · catches strongest warm light */}
          <g>
            <ellipse cx="365" cy="185" rx="34" ry="11" fill="#fef3c7" opacity="0.85" />
            <ellipse cx="343" cy="188" rx="16" ry="8" fill="#fef3c7" opacity="0.82" />
            <ellipse cx="388" cy="185" rx="18" ry="9" fill="#fef3c7" opacity="0.82" />
            <ellipse cx="365" cy="179" rx="16" ry="8" fill="#fef3c7" opacity="0.88" />
            <ellipse cx="365" cy="194" rx="34" ry="3" fill="#fdba74" opacity="0.55" />
          </g>
          {/* Cloud 4 — far right, just below sun · also lit warm */}
          <g>
            <ellipse cx="555" cy="180" rx="34" ry="11" fill="#fef3c7" opacity="0.82" />
            <ellipse cx="535" cy="183" rx="18" ry="9" fill="#fef3c7" opacity="0.80" />
            <ellipse cx="578" cy="180" rx="19" ry="9" fill="#fef3c7" opacity="0.80" />
            <ellipse cx="552" cy="173" rx="14" ry="7" fill="#fef3c7" opacity="0.86" />
            <ellipse cx="555" cy="190" rx="34" ry="3" fill="#fdba74" opacity="0.50" />
          </g>
        </g>

        {/* ── DAY 3a — DISTANT OLYMPIC PEAKS rise from the deep
            ("Let dry ground appear"). Softened, organic ridgeline with
            snow-capped highest peaks. ── */}
        <g opacity={peaksOp}>
          <path
            d="M -10 270
               Q 20 260, 40 252
               Q 55 248, 70 245
               L 95 220
               L 115 245
               L 135 215
               L 158 245
               L 180 225
               L 205 250
               L 232 220
               L 260 250
               L 290 200
               L 320 245
               L 348 195
               L 378 240
               L 408 215
               L 438 250
               L 472 225
               L 502 250
               L 538 235
               L 575 250
               L 610 245
               L 610 270 Z"
            fill="#6b9a94"
            opacity="0.78"
          />
          {/* Snow caps on the three highest peaks (Mt. Olympus center) */}
          <path d="M 280 215 L 290 200 L 305 220 Z" fill="#ffffff" opacity="0.65" />
          <path d="M 338 210 L 348 195 L 365 218 Z" fill="#ffffff" opacity="0.75" />
          <path d="M 128 225 L 135 215 L 145 228 Z" fill="#ffffff" opacity="0.55" />
        </g>

        {/* ── DAY 4 (cont.) — slope highlights: the sun's light catches
            east-facing slopes. Appears WITH the sun. ── */}
        <g opacity={slopeOp}>
          <path d="M 290 200 L 320 245 L 308 240 Z" fill="#fcd34d" opacity="0.55" />
          <path d="M 348 195 L 378 240 L 365 235 Z" fill="#fcd34d" opacity="0.6" />
        </g>

        {/* ── DAY 2 — WATERS ABOVE (atmospheric haze, "the firmament
            between the waters"). ── */}
        <g opacity={hazeOp}>
          <rect x="0" y="240" width="600" height="60" fill="url(#haze)" />
        </g>

        {/* ── DAY 3c — STRAIT BETWEEN THE RANGES — Strait of Juan de
            Fuca as seen from Sequim, sitting between the distant
            Olympic peaks and the near-shore mid ridge. Drawn BEFORE
            the mid ridge so the ridge's jagged top edge naturally
            covers the water where the ridge rises above y=275,
            leaving water visible where the ridge dips lower. Soft
            sun-side wash on the right matches the new sun position. ── */}
        <g opacity={straitOp}>
          <rect x="0" y="272" width="600" height="75" fill="url(#strait)" />
          {/* Sun-side dawn shimmer on the strait — concentrates the
              warmth under where the sun sits at cx=475. */}
          <ellipse cx="475" cy="280" rx="180" ry="20" fill="#fde68a" opacity="0.32" />
          {/* A few tiny ripples on the strait surface */}
          <line x1="50" y1="296" x2="140" y2="296" stroke="#ffffff" strokeWidth="0.6" opacity="0.5" />
          <line x1="180" y1="304" x2="270" y2="304" stroke="#ffffff" strokeWidth="0.6" opacity="0.45" />
          <line x1="320" y1="298" x2="420" y2="298" stroke="#ffffff" strokeWidth="0.6" opacity="0.5" />
          <line x1="450" y1="310" x2="555" y2="310" stroke="#ffffff" strokeWidth="0.6" opacity="0.4" />
        </g>

        {/* ── DAY 3b — MID RIDGE / forested foothills appear ── */}
        <g opacity={midRidgeOp}>
          <path
            d="M -10 345
               Q 20 335, 50 332
               L 90 305
               Q 110 312, 130 315
               L 160 290
               Q 185 298, 210 300
               L 240 278
               Q 270 290, 300 290
               L 335 268
               Q 365 280, 395 282
               L 425 265
               Q 455 278, 485 275
               L 520 260
               Q 555 272, 590 275
               L 610 280
               L 610 360 L -10 360 Z"
            fill="#1f4d47"
            opacity="0.95"
          />
        </g>

        {/* ── DAY 3c — WATERS GATHERED ("Let the water under the sky
            be gathered to one place"). Sequim Bay between the mountains
            and the near shore, with a warm dawn reflection where the
            sun will land. ── */}
        <g opacity={waterOp}>
          <rect x="0" y="360" width="600" height="45" fill="url(#water)" />
          <rect x="0" y="360" width="600" height="45" fill="url(#waterGlow)" />
          <rect x="0" y="360" width="600" height="14" fill="#6b9a94" opacity="0.22" />
        </g>

        {/* ── DAY 5 — SEA LIFE: water ripples ── */}
        <g opacity={ripplesOp}>
          <line x1="40" y1="376" x2="190" y2="376" stroke="#fbf7ee" strokeWidth="0.8" />
          <line x1="220" y1="382" x2="340" y2="382" stroke="#fbf7ee" strokeWidth="0.7" />
          <line x1="380" y1="378" x2="540" y2="378" stroke="#fbf7ee" strokeWidth="0.8" />
          <line x1="80" y1="392" x2="280" y2="392" stroke="#fbf7ee" strokeWidth="0.6" />
          <line x1="320" y1="396" x2="500" y2="396" stroke="#fbf7ee" strokeWidth="0.6" />
        </g>

        {/* ── DAY 3d — VEGETATION: near-shore + conifer tree-line ── */}
        <g opacity={treesOp}>
          {/* Ground — slight curve so it feels like a real forest floor */}
          <path
            d="M 0 405
               Q 150 392, 300 398
               Q 450 404, 600 395
               L 600 450 L 0 450 Z"
            fill="#0a3a36"
          />
          {/* Distant smaller conifers — back row */}
          {[
            { x: 30, h: 22, y: 402 }, { x: 65, h: 18, y: 401 },
            { x: 100, h: 25, y: 400 }, { x: 135, h: 20, y: 399 },
            { x: 178, h: 24, y: 397 }, { x: 218, h: 19, y: 397 },
            { x: 258, h: 22, y: 397 }, { x: 298, h: 26, y: 398 },
            { x: 338, h: 20, y: 399 }, { x: 378, h: 24, y: 400 },
            { x: 418, h: 18, y: 401 }, { x: 458, h: 23, y: 402 },
            { x: 498, h: 20, y: 402 }, { x: 538, h: 25, y: 400 },
            { x: 575, h: 22, y: 398 },
          ].map((t, i) => (
            <path
              key={"b" + i}
              d={`M${t.x - 5},${t.y} L${t.x},${t.y - t.h} L${t.x + 5},${t.y} Z`}
              fill="#0a3a36"
              opacity="0.85"
            />
          ))}
          {/* Hero conifers — taller front-row, varied heights */}
          {[
            { x: 55, h: 50 }, { x: 130, h: 65 }, { x: 200, h: 78 },
            { x: 270, h: 58 }, { x: 360, h: 85 }, { x: 430, h: 62 },
            { x: 510, h: 72 }, { x: 565, h: 55 },
          ].map((t, i) => (
            <path
              key={"f" + i}
              d={`M${t.x - 8},${405} L${t.x},${405 - t.h} L${t.x + 8},${405} Z`}
              fill="#0a3a36"
            />
          ))}
        </g>

        {/* ── DAY 5 — BIRDS crossing the sky ──
            10 birds spread across the canvas per Ben 2026-05-18.
            Sized in three tiers (close / mid / distant) so the eye
            reads depth. Positioned to AVOID the sun disc at
            (475, 100) — birds fly AROUND it, not in front. */}
        <g
          opacity={birdsOp}
          fill="none"
          stroke="#0d4f4a"
          strokeLinecap="round"
        >
          {/* Close birds (foreground) — strongest stroke */}
          <path d="M70 95 q7 -9 14 0 q7 -9 14 0" strokeWidth="2" />
          <path d="M555 145 q7 -9 14 0 q7 -9 14 0" strokeWidth="2" />
          <path d="M205 135 q6 -8 12 0 q6 -8 12 0" strokeWidth="1.9" />
          {/* Mid-distance birds */}
          <path d="M120 65 q5 -7 10 0 q5 -7 10 0" strokeWidth="1.6" />
          <path d="M255 88 q5 -7 10 0 q5 -7 10 0" strokeWidth="1.6" />
          <path d="M340 165 q5 -7 10 0 q5 -7 10 0" strokeWidth="1.6" />
          <path d="M390 70 q5 -7 10 0 q5 -7 10 0" strokeWidth="1.6" />
          {/* Distant birds — thinnest stroke, smaller arcs */}
          <path d="M165 175 q4 -5 8 0 q4 -5 8 0" strokeWidth="1.3" opacity="0.85" />
          <path d="M295 50 q4 -5 8 0 q4 -5 8 0" strokeWidth="1.3" opacity="0.85" />
          <path d="M520 60 q4 -5 8 0 q4 -5 8 0" strokeWidth="1.3" opacity="0.8" />
        </g>

        {/* ── CAPTION — "And there was light." settles in last. ── */}
        <g opacity={captionOp}>
          <text
            x="32"
            y="442"
            fontFamily="var(--font-thrive-display), serif"
            fontStyle="italic"
            fontSize="13"
            fill="#fbf7ee"
          >
            And there was light.  ·  Gen 1:3
          </text>
        </g>
      </svg>
    </div>
  );
}

/* Topographic line texture in the hero background */
function TopoLines() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.08]"
      viewBox="0 0 1480 900"
      preserveAspectRatio="xMidYMid slice"
    >
      <g fill="none" stroke="#0d4f4a" strokeWidth="1">
        {Array.from({ length: 14 }).map((_, i) => {
          const y = 120 + i * 55;
          return (
            <path
              key={i}
              d={`M-50,${y} Q200,${y - 30 + (i % 3) * 8} 500,${y - 10} T1100,${y - 20} T1530,${y - 5}`}
            />
          );
        })}
      </g>
    </svg>
  );
}

/* ============================================================== */
/*                       SERVICE STRIPE                            */
/* ============================================================== */
function ServiceStripe() {
  const items = [
    "Sundays · 10:30 a.m.",
    "640 N Sequim Ave",
    "All ages welcome",
    "Coffee's on",
    "Casual dress",
    "~75 minutes",
    "In person or livestream",
  ];
  // Repeat for seamless marquee
  const loop = [...items, ...items, ...items];
  return (
    <section
      aria-label="Service details"
      className="relative z-10 border-y border-[#0d4f4a]/15 bg-[#0d4f4a] text-[#fbf7ee]"
    >
      <div className="overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap py-5"
          animate={{ x: ["0%", "-33.333%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        >
          {loop.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-6 px-6 text-[11px] font-medium uppercase tracking-[0.32em]"
            >
              {item}
              <Sparkle size={12} weight="fill" className="text-[#d97706]" />
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================== */
/*                       TAGLINE SPREAD                            */
/*  Editorial full-bleed treatment of the mission tagline.         */
/* ============================================================== */
function TaglineSpread() {
  return (
    <section
      id="mission"
      className="relative overflow-hidden bg-[#fbf7ee] py-14 sm:py-20"
    >
      {/* Alpha + Omega watermark + dove — Christ as beginning and end. */}
      <ChristianMotifs variant="mission" />

      <div className="mx-auto max-w-[1480px] px-6 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-[#0d4f4a]/70"
        >
          <span className="inline-block h-px w-10 bg-[#d97706]" />
          Our Mission
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="mt-10 font-[family-name:var(--font-thrive-display)] text-[clamp(2.6rem,7vw,7.5rem)] font-light leading-[1.02] tracking-[-0.025em] text-[#0d4f4a]"
          style={{ fontWeight: 500 }}
        >
          Imperfect people{" "}
          <br className="hidden sm:block" />
          <em className="italic" style={{ fontWeight: 500 }}>
            becoming
          </em>{" "}
          the church,{" "}
          <br className="hidden sm:block" />
          on the mission with Jesus,{" "}
          <br className="hidden sm:block" />
          bringing{" "}
          <span className="text-[#d97706]">hope</span> and{" "}
          <span className="text-[#d97706]">healing</span>{" "}
          to the world.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-16 grid gap-10 border-t border-[#0d4f4a]/15 pt-10 sm:grid-cols-3"
        >
          <p className="font-[family-name:var(--font-thrive-display)] text-lg italic leading-relaxed text-[#0d4f4a]">
            We don't pretend to have it all together.
          </p>
          <p className="text-base leading-relaxed text-[#1a1a1a]/70">
            That's exactly the point. Following Jesus is a long walk home —
            and we'd rather take it together than alone.
          </p>
          <p className="text-base leading-relaxed text-[#1a1a1a]/70">
            Whether you're a lifelong believer, exploring faith for the first
            time, or finding your way back — there's a place at the table.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================== */
/*                       WHAT TO EXPECT                            */
/* ============================================================== */
function WhatToExpect() {
  const items = [
    {
      icon: Clock,
      label: "About 75 minutes",
      body: "Worship together, hear from God's word, take communion most weeks. No tricks — you can come and go freely.",
    },
    {
      icon: Coffee,
      label: "Coffee's on",
      body: "Come early. The coffee bar opens at 10:00. Real coffee, real people, no pressure to make small talk if you'd rather not.",
    },
    {
      icon: Users,
      label: "Casual dress",
      body: "Jeans, flannel, raincoat from this morning's hike — all great. Wear what you'd wear to a friend's house.",
    },
    {
      icon: Baby,
      label: "Kids are welcome",
      body: "Next Wave Kids runs during the service for infants through fifth grade. Check-in is just inside the front doors.",
    },
  ];
  return (
    <section id="expect" className="relative overflow-hidden bg-[#fbf7ee] py-16 sm:py-22">
      <ChristianMotifs variant="right" />
      <div className="relative mx-auto max-w-[1480px] px-6 sm:px-10">
        <div className="grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
            <div className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.26em] text-[#0a3a36]">
              <span className="inline-block h-px w-10 bg-[#d97706]" />
              First Sunday
            </div>
            <h2
              className="mt-8 font-[family-name:var(--font-thrive-display)] text-[clamp(2.4rem,5.5vw,5rem)] font-light leading-[0.98] tracking-[-0.025em] text-[#0d4f4a]"
              style={{ fontWeight: 500 }}
            >
              Here's what
              <br />
              your <em className="italic">first</em>
              <br />
              visit feels like.
            </h2>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-[#1a1a1a]/70">
              No registration, no awkward introductions, no "stand up and wave."
              Just slip in, grab a coffee, and see for yourself.
            </p>
            <Link
              href="#connect"
              className="mt-10 inline-flex min-h-[44px] items-center gap-2 py-2 text-sm font-medium uppercase tracking-[0.18em] text-[#0d4f4a] underline decoration-[#d97706] decoration-2 underline-offset-[6px] transition-colors hover:text-[#d97706]"
            >
              Tell us you're coming
              <ArrowUpRight size={14} weight="bold" />
            </Link>
          </div>

          <div className="lg:col-span-7">
            <ul className="divide-y divide-[#0d4f4a]/15 border-y border-[#0d4f4a]/15">
              {items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      duration: 0.7,
                      delay: i * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="group grid grid-cols-[auto_1fr] gap-6 py-8 sm:gap-10 sm:py-10"
                  >
                    <div className="flex items-start gap-4">
                      <span className="font-[family-name:var(--font-thrive-display)] text-xl text-[#d97706]">
                        0{i + 1}
                      </span>
                      <Icon
                        size={32}
                        weight="duotone"
                        className="mt-0.5 text-[#0d4f4a] transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div>
                      <h3 className="font-[family-name:var(--font-thrive-display)] text-2xl text-[#0d4f4a] sm:text-3xl">
                        {item.label}
                      </h3>
                      <p className="mt-3 text-base leading-relaxed text-[#1a1a1a]/70">
                        {item.body}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================== */
/*                       LATEST SERMON                             */
/* ============================================================== */
function LatestSermon() {
  return (
    <section
      id="watch"
      className="relative overflow-hidden bg-[#0d4f4a] py-24 text-[#fbf7ee] sm:py-32"
    >
      {/* Decorative spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(217,119,6,0.18) 0%, rgba(217,119,6,0) 60%)",
        }}
      />
      <div className="relative mx-auto max-w-[1480px] px-6 sm:px-10">
        <div className="grid items-end gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.26em] text-[#fbbf24]">
              <span className="inline-block h-px w-10 bg-[#d97706]" />
              Latest Sermon
            </div>
            <p className="mt-8 font-[family-name:var(--font-thrive-display)] text-sm uppercase tracking-[0.3em] text-[#fbf7ee]/75">
              Sunday — recent
            </p>
            <h2
              className="mt-3 font-[family-name:var(--font-thrive-display)] text-[clamp(2.6rem,5.8vw,5.5rem)] font-light leading-[0.95] tracking-[-0.025em]"
              style={{ fontWeight: 500 }}
            >
              What does it
              <br />
              mean to{" "}
              <em className="italic">gather</em>?
            </h2>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-[#fbf7ee]/75">
              A look at why we still meet — Sunday after Sunday — and what
              happens when we do. Watch it now, or come hear what's next this
              Sunday.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href={LATEST_SERMON_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-full bg-[#d97706] px-7 py-4 text-sm font-medium uppercase tracking-[0.18em] text-[#fbf7ee] transition-all duration-300 hover:bg-[#b45309] hover:shadow-[0_18px_40px_-12px_rgba(217,119,6,0.6)]"
              >
                <PlayCircle size={20} weight="fill" />
                Watch on YouTube
              </Link>
              <Link
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center py-2 text-sm uppercase tracking-[0.18em] text-[#fbf7ee]/70 underline-offset-4 hover:text-[#fbf7ee] hover:underline"
              >
                Sermon archive →
              </Link>
            </div>
          </div>

          {/* Magazine-cover treatment */}
          <div className="lg:col-span-7">
            <Link
              href={LATEST_SERMON_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-[4/3] overflow-hidden rounded-sm bg-[#0a3d39]"
            >
              {/* Layered visual: sunrise + serif title overlaid */}
              <svg
                viewBox="0 0 900 675"
                className="absolute inset-0 h-full w-full"
                aria-hidden
              >
                <defs>
                  <radialGradient id="sermonGlow" cx="80%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
                    <stop offset="60%" stopColor="#d97706" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="900" height="675" fill="#0a3d39" />
                <rect width="900" height="675" fill="url(#sermonGlow)" />

                {/* Ridge silhouettes */}
                <path
                  d="M0,460 Q150,420 300,440 T600,415 T900,425 L900,675 L0,675 Z"
                  fill="#0d4f4a"
                  opacity="0.5"
                />
                <path
                  d="M0,520 L100,490 L220,510 L340,475 L460,495 L580,470 L700,490 L820,475 L900,485 L900,675 L0,675 Z"
                  fill="#063432"
                  opacity="0.7"
                />
                <path
                  d="M0,580 L120,560 L260,575 L390,545 L520,565 L660,545 L800,560 L900,555 L900,675 L0,675 Z"
                  fill="#031e1c"
                />

                {/* Sun crest */}
                <circle cx="720" cy="280" r="68" fill="#d97706" />
                <ellipse cx="720" cy="280" rx="150" ry="2" fill="#fbbf24" opacity="0.6" />

                {/* Edition stamp */}
                <g transform="translate(50,80)">
                  <text
                    fontFamily="Instrument Sans, sans-serif"
                    fontSize="11"
                    letterSpacing="4"
                    fill="#fbf7ee"
                    opacity="0.55"
                  >
                    THRIVE CHURCH · VOL. 01
                  </text>
                </g>
              </svg>

              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#fbf7ee]/95 text-[#0d4f4a] shadow-2xl transition-transform duration-300 group-hover:scale-110">
                  <PlayCircle size={56} weight="fill" />
                </div>
              </div>

              {/* Bottom rail */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-[#fbf7ee]/20 bg-[#063432]/60 px-6 py-4 backdrop-blur-sm">
                <span className="font-[family-name:var(--font-thrive-display)] text-sm italic text-[#fbf7ee]/80">
                  Now playing
                </span>
                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d97706]">
                  Watch full sermon
                  <ArrowUpRight size={12} weight="bold" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================== */
/*                     CONNECT CARD SECTION                        */
/* ============================================================== */
function ConnectSection() {
  return (
    <section id="connect" className="relative overflow-hidden bg-[#f5ede0] py-16 sm:py-22">
      <ChristianMotifs variant="connect" />
      <div className="relative mx-auto max-w-[1480px] px-6 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.26em] text-[#0a3a36]">
              <span className="inline-block h-px w-10 bg-[#d97706]" />
              Connect Card
            </div>
            <h2
              className="mt-8 font-[family-name:var(--font-thrive-display)] text-[clamp(2.4rem,5.4vw,5rem)] font-light leading-[0.98] tracking-[-0.025em] text-[#0d4f4a]"
              style={{ fontWeight: 500 }}
            >
              Let's start
              <br />a <em className="italic">conversation</em>.
            </h2>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-[#1a1a1a]/70">
              Whether you're planning your first visit, looking for a small
              group, or curious about baptism — fill this out and our team will
              follow up personally. No mailing lists, no auto-replies.
            </p>
            <ul className="mt-10 space-y-3 text-sm text-[#1a1a1a]/75 lg:space-y-4 lg:text-xl">
              <li className="flex items-center gap-3 lg:gap-4">
                <Sparkle size={12} weight="fill" className="shrink-0 text-[#d97706] lg:hidden" />
                <Sparkle size={16} weight="fill" className="hidden shrink-0 text-[#d97706] lg:inline" />
                Real reply from a real person
              </li>
              <li className="flex items-center gap-3 lg:gap-4">
                <Sparkle size={12} weight="fill" className="shrink-0 text-[#d97706] lg:hidden" />
                <Sparkle size={16} weight="fill" className="hidden shrink-0 text-[#d97706] lg:inline" />
                Usually within a couple of days
              </li>
              <li className="flex items-center gap-3 lg:gap-4">
                <Sparkle size={12} weight="fill" className="shrink-0 text-[#d97706] lg:hidden" />
                <Sparkle size={16} weight="fill" className="hidden shrink-0 text-[#d97706] lg:inline" />
                Your info stays with us
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-sm border border-[#0d4f4a]/15 bg-[#fbf7ee] p-7 shadow-[0_24px_50px_-30px_rgba(13,79,74,0.25)] sm:p-9 lg:p-11">
              <ConnectCardForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================== */
/*                       MINISTRIES GRID                           */
/* ============================================================== */
function MinistriesGrid() {
  const ministries: Array<{
    tag: string;
    name: string;
    tagline: string;
    body: string;
    icon: typeof Users;
    cta: string;
    accent: string;
    href: string;
    external?: boolean;
  }> = [
    {
      tag: "01",
      name: "Thrive Groups",
      tagline: "Faith, lived around a table.",
      body: "Small groups that meet in homes throughout Sequim & Port Angeles. Bible study, real conversation, occasional potlucks. Most groups run weekly.",
      icon: Users,
      cta: "Find a group",
      accent: "from-[#fdebbf] to-[#fbf7ee]",
      // ?group=<id> pre-checks the matching opt-in checkbox on the
      // Connect Card so the visitor doesn't have to re-state which
      // ministry they came from. Added 2026-05-19.
      href: "?group=thrive-groups#connect",
    },
    {
      tag: "02",
      name: "Next Wave Kids",
      tagline: "Infants through 5th grade.",
      body: "Sundays during the 10:30 service. Safe, fun, and built around helping kids actually love church. Secure check-in just inside the front doors.",
      icon: Baby,
      cta: "Kids ministry",
      accent: "from-[#fef3c7] to-[#fbf7ee]",
      href: "?group=next-wave-kids#connect",
    },
    {
      tag: "03",
      name: "Next Wave Youth",
      tagline: "Middle & high school.",
      body: "A space where teenagers can ask hard questions, find friends who get it, and grow into who God made them to be. Weekly hangouts + Sunday gatherings.",
      icon: HandHeart,
      cta: "Youth ministry",
      accent: "from-[#fdebbf] to-[#f5ede0]",
      href: "?group=next-wave-youth#connect",
    },
    {
      tag: "04",
      name: "Thrive Preschool",
      tagline: "Licensed Christian preschool.",
      body: "Play-based learning, small class sizes, certified teachers who genuinely love kids. Enrollment is open for the 2026/2027 school year.",
      icon: BookOpen,
      cta: "Enroll now",
      accent: "from-[#fef3c7] to-[#fdebbf]",
      href: PRESCHOOL_URL,
      external: true,
    },
  ];
  return (
    <section id="ministries" className="relative overflow-hidden bg-[#fbf7ee] py-16 sm:py-22">
      <ChristianMotifs variant="ministries" />
      <div className="relative mx-auto max-w-[1480px] px-6 sm:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.26em] text-[#0a3a36]">
              <span className="inline-block h-px w-10 bg-[#d97706]" />
              Ministries
            </div>
            <h2
              className="mt-6 font-[family-name:var(--font-thrive-display)] text-[clamp(2.4rem,5.5vw,5rem)] font-light leading-[0.98] tracking-[-0.025em] text-[#0d4f4a]"
              style={{ fontWeight: 500 }}
            >
              Find your <em className="italic">people</em>.
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-[#1a1a1a]/70">
            Sunday is the start, but the church really happens in the in-between.
            Here's where to plug in.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-sm bg-[#0d4f4a]/15 sm:grid-cols-2">
          {ministries.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.a
                key={m.name}
                href={m.href}
                target={m.external ? "_blank" : undefined}
                rel={m.external ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`group relative block h-full overflow-hidden bg-gradient-to-br ${m.accent} p-6 transition-all duration-500 hover:from-[#0d4f4a] hover:to-[#0a3a36] hover:shadow-[0_24px_60px_-20px_rgba(13,79,74,0.55)] sm:p-10 lg:p-14`}
              >
                  {/* Tag */}
                  <div className="flex items-start justify-between">
                    <span className="font-[family-name:var(--font-thrive-display)] text-sm tracking-[0.2em] text-[#d97706] transition-colors duration-500 group-hover:text-[#fdebbf]">
                      {m.tag}
                    </span>
                    <Icon
                      size={36}
                      weight="duotone"
                      className="text-[#0d4f4a] transition-all duration-500 group-hover:scale-110 group-hover:text-[#d97706]"
                    />
                  </div>

                  <h3
                    className="mt-14 font-[family-name:var(--font-thrive-display)] text-3xl leading-tight tracking-tight text-[#0d4f4a] transition-colors duration-500 group-hover:text-[#fbf7ee] sm:text-4xl lg:text-5xl"
                    style={{ fontWeight: 500 }}
                  >
                    {m.name}
                  </h3>
                  <p className="mt-3 font-[family-name:var(--font-thrive-display)] text-lg italic text-[#0d4f4a]/70 transition-colors duration-500 group-hover:text-[#fdebbf]/85">
                    {m.tagline}
                  </p>
                  <p className="mt-6 max-w-md text-base leading-relaxed text-[#1a1a1a]/70 transition-colors duration-500 group-hover:text-[#fbf7ee]/80">
                    {m.body}
                  </p>

                <div className="mt-10 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.22em] text-[#0d4f4a] transition-colors duration-500 group-hover:text-[#fbbf24]">
                  {m.cta}
                  <ArrowUpRight
                    size={14}
                    weight="bold"
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================== */
/*                     PRESCHOOL SPOTLIGHT                         */
/* ============================================================== */
function PreschoolSpotlight() {
  return (
    <section id="preschool" className="relative overflow-hidden bg-[#1a1612] py-24 text-[#fbf7ee] sm:py-32">
      {/* Warm amber glow — kid-friendly warmth on the dark backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(251,191,36,0.18) 0%, rgba(251,191,36,0) 60%)",
        }}
      />
      {/* Decorative scribble — recolored for dark backdrop */}
      <svg
        aria-hidden
        className="pointer-events-none absolute right-0 top-12 w-[280px] opacity-40 sm:w-[420px]"
        viewBox="0 0 400 200"
      >
        <g fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round">
          <path d="M20,100 Q60,40 100,100 T180,100 T260,100 T340,100 T420,100" />
          <path
            d="M20,140 Q60,80 100,140 T180,140 T260,140 T340,140 T420,140"
            opacity="0.6"
          />
          <path
            d="M20,60 Q60,0 100,60 T180,60 T260,60 T340,60 T420,60"
            opacity="0.4"
          />
        </g>
      </svg>

      {/* Cartoonish stacking blocks — bottom-right corner, desktop only */}
      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-8 right-8 hidden w-[280px] lg:block xl:w-[340px]"
        viewBox="0 0 340 280"
      >
        {/* soft glow behind the stack */}
        <ellipse
          cx="170"
          cy="248"
          rx="120"
          ry="14"
          fill="#fbbf24"
          opacity="0.18"
        />

        {/* Block 1 — bottom, biggest, teal "T" */}
        <g transform="translate(60 168) rotate(-3)">
          <rect width="120" height="72" rx="10" fill="#0d4f4a" />
          <rect
            x="2"
            y="2"
            width="116"
            height="68"
            rx="8"
            fill="none"
            stroke="#1a1612"
            strokeWidth="2"
            opacity="0.35"
          />
          <text
            x="60"
            y="50"
            textAnchor="middle"
            fontFamily="var(--font-thrive-display), Georgia, serif"
            fontSize="42"
            fontWeight="700"
            fill="#fbf7ee"
          >
            T
          </text>
        </g>

        {/* Block 2 — second tier, amber "H" */}
        <g transform="translate(78 102) rotate(2)">
          <rect width="92" height="68" rx="9" fill="#fbbf24" />
          <rect
            x="2"
            y="2"
            width="88"
            height="64"
            rx="7"
            fill="none"
            stroke="#1a1612"
            strokeWidth="2"
            opacity="0.4"
          />
          <text
            x="46"
            y="48"
            textAnchor="middle"
            fontFamily="var(--font-thrive-display), Georgia, serif"
            fontSize="38"
            fontWeight="700"
            fill="#1a1612"
          >
            H
          </text>
        </g>

        {/* Block 3 — third tier, cream/coral "R" */}
        <g transform="translate(92 44) rotate(-4)">
          <rect width="74" height="62" rx="8" fill="#fbf7ee" />
          <rect
            x="2"
            y="2"
            width="70"
            height="58"
            rx="6"
            fill="none"
            stroke="#1a1612"
            strokeWidth="2"
            opacity="0.45"
          />
          <text
            x="37"
            y="44"
            textAnchor="middle"
            fontFamily="var(--font-thrive-display), Georgia, serif"
            fontSize="34"
            fontWeight="700"
            fill="#d97706"
          >
            R
          </text>
        </g>

        {/* Block 4 — tippy-top, orange "I" tilted */}
        <g transform="translate(186 122) rotate(14)">
          <rect width="54" height="54" rx="7" fill="#d97706" />
          <rect
            x="2"
            y="2"
            width="50"
            height="50"
            rx="5"
            fill="none"
            stroke="#1a1612"
            strokeWidth="2"
            opacity="0.4"
          />
          <text
            x="27"
            y="40"
            textAnchor="middle"
            fontFamily="var(--font-thrive-display), Georgia, serif"
            fontSize="34"
            fontWeight="700"
            fill="#fbf7ee"
          >
            I
          </text>
        </g>

        {/* Small "V" block tipped on its side next to the stack */}
        <g transform="translate(214 196) rotate(22)">
          <rect width="46" height="46" rx="6" fill="#0d4f4a" />
          <rect
            x="2"
            y="2"
            width="42"
            height="42"
            rx="4"
            fill="none"
            stroke="#1a1612"
            strokeWidth="2"
            opacity="0.4"
          />
          <text
            x="23"
            y="33"
            textAnchor="middle"
            fontFamily="var(--font-thrive-display), Georgia, serif"
            fontSize="28"
            fontWeight="700"
            fill="#fbbf24"
          >
            V
          </text>
        </g>

        {/* Tiny "E" cube on the ground, cream */}
        <g transform="translate(34 212) rotate(-8)">
          <rect width="38" height="38" rx="5" fill="#fbf7ee" />
          <rect
            x="2"
            y="2"
            width="34"
            height="34"
            rx="3"
            fill="none"
            stroke="#1a1612"
            strokeWidth="2"
            opacity="0.4"
          />
          <text
            x="19"
            y="27"
            textAnchor="middle"
            fontFamily="var(--font-thrive-display), Georgia, serif"
            fontSize="22"
            fontWeight="700"
            fill="#0d4f4a"
          >
            E
          </text>
        </g>

        {/* Sparkle accents — playful kid energy */}
        <g fill="#fbbf24" opacity="0.85">
          <circle cx="30" cy="60" r="3" />
          <circle cx="290" cy="80" r="2.5" />
          <circle cx="310" cy="160" r="3" />
          <circle cx="20" cy="160" r="2" />
        </g>
        <g fill="#fbf7ee" opacity="0.6">
          <circle cx="270" cy="40" r="2" />
          <circle cx="50" cy="20" r="2" />
        </g>
      </svg>

      <div className="relative mx-auto max-w-[1480px] px-6 sm:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="inline-flex -rotate-2 items-center gap-3 rounded-full border-2 border-[#fbbf24] bg-[#fdebbf] px-7 py-3 text-sm font-bold uppercase tracking-[0.26em] text-[#1a1612] sm:text-base">
              <span className="block h-2 w-2 rounded-full bg-[#d97706]" />
              Now Enrolling · 2026 / 2027
            </div>
            <h2
              className="mt-8 font-[family-name:var(--font-thrive-display)] text-[clamp(2.6rem,6vw,6rem)] font-light leading-[0.96] tracking-[-0.025em] text-[#fbf7ee]"
              style={{ fontWeight: 500 }}
            >
              A preschool
              <br />
              that <em className="italic text-[#fbbf24]">feels</em>
              <br />
              like home.
            </h2>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-[#fbf7ee]/75">
              Thrive Preschool is a licensed Christian preschool in the heart of
              Sequim, offering play-based learning, small class sizes, and
              certified teachers who genuinely love kids. Families come for the
              education — they stay for the community.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href={PRESCHOOL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-full bg-[#d97706] px-8 py-4 text-sm font-medium uppercase tracking-[0.18em] text-[#fbf7ee] transition-all duration-300 hover:bg-[#b45309] hover:shadow-[0_18px_40px_-12px_rgba(217,119,6,0.6)]"
              >
                Register your child
                <ArrowUpRight
                  size={16}
                  weight="bold"
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href={`mailto:${EMAIL}?subject=Preschool%20Question`}
                className="inline-flex min-h-[44px] items-center py-2 text-sm uppercase tracking-[0.18em] text-[#fbf7ee]/70 underline-offset-4 hover:text-[#fbbf24] hover:underline"
              >
                Have questions? →
              </Link>
            </div>
          </div>

          {/* Preschool stat card — inverted for dark backdrop */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm bg-[#fbf7ee]/10">
              {[
                { stat: "Ages 3–5", label: "Play-based learning" },
                { stat: "≤12 / class", label: "Small class sizes" },
                { stat: "9 AM – 12 PM", label: "M · W · F mornings" },
                { stat: "9 mo.", label: "Full school year" },
              ].map((s) => (
                <div
                  key={s.stat}
                  className="bg-[#1a1612] p-8 transition-colors duration-300 hover:bg-[#251e18]"
                >
                  <p
                    className="font-[family-name:var(--font-thrive-display)] text-3xl font-light leading-none text-[#fbbf24] sm:text-4xl"
                    style={{ fontWeight: 500 }}
                  >
                    {s.stat}
                  </p>
                  <p className="mt-3 text-[13px] font-bold uppercase tracking-[0.18em] text-[#fbf7ee]/85">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================== */
/*                       BELIEFS SPREAD                            */
/*  Editorial "constitution" of Preferences/Convictions/Absolutes. */
/* ============================================================== */
function BeliefsSpread() {
  const tiers = [
    {
      numeral: "I.",
      name: "Preferences",
      summary: "Style. Tradition. Taste.",
      body: "How we sing, how we dress, what we serve at potlucks. These shape our culture, but we hold them loosely — and joyfully. Christians can disagree here without anyone being wrong.",
    },
    {
      numeral: "II.",
      name: "Convictions",
      summary: "Practice. Pattern. Posture.",
      body: "How we read scripture, how we structure leadership, how we approach the sacraments. We've prayed, studied, and landed somewhere — but we honor the broader Church when it lands elsewhere.",
    },
    {
      numeral: "III.",
      name: "Absolutes",
      summary: "The gospel itself.",
      body: "Jesus is the Son of God, crucified for us, risen from the dead, returning in glory. Salvation by grace through faith. The authority of scripture. The triune God. These we hold without compromise.",
    },
  ];
  return (
    <section
      id="beliefs"
      className="relative overflow-hidden bg-[#fbf7ee] py-16 sm:py-22"
    >
      <ChristianMotifs variant="beliefs" />
      <div className="relative mx-auto max-w-[1480px] px-6 sm:px-10">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.26em] text-[#0a3a36]">
              <span className="inline-block h-px w-10 bg-[#d97706]" />
              Beliefs
            </div>
            <h2
              className="mt-8 font-[family-name:var(--font-thrive-display)] text-[clamp(2.4rem,5.5vw,5rem)] font-light leading-[0.98] tracking-[-0.025em] text-[#0d4f4a]"
              style={{ fontWeight: 500 }}
            >
              What we
              <br />
              <em className="italic">hold</em>
              <br />
              and how
              <br />
              we hold it.
            </h2>
            <p className="mt-8 max-w-sm text-base leading-relaxed text-[#1a1a1a]/70">
              Not everything matters the same. We sort our theology into three
              categories — and the order matters as much as the content.
            </p>
          </div>

          <div className="lg:col-span-8">
            <ol className="space-y-px overflow-hidden rounded-sm bg-[#0d4f4a]/10">
              {tiers.map((t, i) => (
                <motion.li
                  key={t.name}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.9,
                    delay: i * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group grid grid-cols-[auto_1fr] gap-5 bg-[#fbf7ee] p-6 transition-colors duration-300 hover:bg-[#f5ede0] sm:gap-8 sm:p-12"
                >
                  <span
                    className="font-[family-name:var(--font-thrive-display)] text-[clamp(3rem,8vw,7rem)] font-light leading-none text-[#d97706] transition-transform duration-500 group-hover:-translate-y-1"
                    style={{ fontWeight: 500 }}
                  >
                    {t.numeral}
                  </span>
                  <div className="pt-2">
                    <h3
                      className="font-[family-name:var(--font-thrive-display)] text-3xl text-[#0d4f4a] sm:text-4xl"
                      style={{ fontWeight: 500 }}
                    >
                      {t.name}
                    </h3>
                    <p className="mt-2 font-[family-name:var(--font-thrive-display)] text-lg italic text-[#0d4f4a]/70">
                      {t.summary}
                    </p>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#1a1a1a]/75">
                      {t.body}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================== */
/*                          OUTREACH                               */
/*  Three fronts presented as compass bearings.                    */
/* ============================================================== */
function Outreach() {
  // Three arms of the cross — replaces the compass analogy 2026-05-18
  // per Ben. Each "front" is one direction the cross reaches:
  //   ↑ BEYOND — vertical-up arm (the gospel reaching past Sequim)
  //   ↔ ACROSS — horizontal arm (loving our neighbors face-to-face)
  //   ↓ AMONG  — vertical-down arm (rooted, where the cross meets the
  //              ground and everyone has a seat at the table)
  // Each card "Learn more" button deep-links to the matching resource
  // page on the live thrivesequim.com site (the real ministry content
  // already lives there). Added 2026-05-19 — before this each card just
  // dropped visitors at the connect form, dead-ending the curious.
  const fronts = [
    {
      bearing: "BEYOND",
      arrow: "↑",
      label: "Around the World",
      tagline: "Global mission partners.",
      body: "Supporting missionaries and indigenous leaders across continents — sharing the gospel, planting churches, and meeting practical needs in some of the hardest places.",
      icon: Globe,
      href: "https://thrivesequim.com/around-the-world",
    },
    {
      bearing: "ACROSS",
      arrow: "↔",
      label: "Across the Street",
      tagline: "Loving our neighbors first.",
      body: "Sequim is our parish. We partner with local schools, recovery ministries, food banks, and the Sequim community — because the gospel travels best on first-name terms.",
      icon: House,
      href: "https://thrivesequim.com/across-the-street",
    },
    {
      bearing: "AMONG",
      arrow: "↓",
      label: "Table of Grace",
      tagline: "Community meals, no questions.",
      body: "A free hot meal served regularly to anyone who shows up — no signups, no sermons, no strings. Just food, warmth, and people who'll remember your name next time.",
      icon: ForkKnife,
      href: "https://thrivesequim.com/table-of-grace",
    },
  ];
  return (
    <section
      id="outreach"
      className="relative overflow-hidden bg-[#0d4f4a] py-24 text-[#fbf7ee] sm:py-32"
    >
      {/* Cross watermark — Latin cross with the three reach-labels at
          each visible arm tip. Replaces the prior compass. */}
      <svg
        aria-hidden
        viewBox="0 0 600 700"
        className="pointer-events-none absolute -right-32 top-1/2 hidden h-[600px] w-[520px] -translate-y-1/2 opacity-[0.07] lg:block"
      >
        <g
          fill="none"
          stroke="#fbf7ee"
          strokeWidth="14"
          strokeLinecap="round"
          transform="translate(300,350)"
        >
          {/* Vertical bar of the cross */}
          <line x1="0" y1="-300" x2="0" y2="300" />
          {/* Horizontal bar (crossbar) — upper-third per Latin cross */}
          <line x1="-180" y1="-100" x2="180" y2="-100" />
        </g>
        <g
          fill="#fbf7ee"
          fontFamily="var(--font-thrive-display), serif"
          fontWeight="600"
          textAnchor="middle"
          transform="translate(300,350)"
        >
          {/* Three arm labels */}
          <text x="0" y="-320" fontSize="22" letterSpacing="6">BEYOND</text>
          <text x="0" y="332" fontSize="22" letterSpacing="6">AMONG</text>
          <text x="220" y="-93" fontSize="22" letterSpacing="6" textAnchor="start">
            ACROSS
          </text>
        </g>
      </svg>

      <div className="relative mx-auto max-w-[1480px] px-6 sm:px-10">
        <div className="grid items-end gap-6 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.26em] text-[#fbbf24]">
              <span className="inline-block h-px w-10 bg-[#d97706]" />
              Outreach
            </div>
            <h2
              className="mt-8 font-[family-name:var(--font-thrive-display)] text-[clamp(2.4rem,5.5vw,5rem)] font-light leading-[0.98] tracking-[-0.025em]"
              style={{ fontWeight: 500 }}
            >
              One <em className="italic">cross</em>.<br />
              Three reaches.
            </h2>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-[#fbf7ee]/85 sm:justify-self-end sm:text-xl">
            The mission isn&rsquo;t in here. It&rsquo;s out there — and the
            cross reaches three ways at once: <em className="italic">beyond</em>{" "}
            us, <em className="italic">across</em> the street, and{" "}
            <em className="italic">among</em> us.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-sm bg-[#fbf7ee]/10 lg:grid-cols-3">
          {fronts.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.a
                key={f.label}
                href={f.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative block bg-[#0d4f4a] p-7 transition-colors duration-500 hover:bg-[#0a3d39] sm:p-12"
              >
                <div className="flex items-start justify-between border-b border-[#fbf7ee]/20 pb-6">
                  <div className="flex items-baseline gap-3">
                    <span
                      className="font-[family-name:var(--font-thrive-display)] text-6xl font-light leading-none text-[#fbbf24]"
                      style={{ fontWeight: 500 }}
                      aria-hidden
                    >
                      {f.arrow}
                    </span>
                    <span
                      className="text-[12px] font-bold uppercase tracking-[0.28em] text-[#fbbf24]"
                    >
                      {f.bearing}
                    </span>
                  </div>
                  <Icon
                    size={36}
                    weight="duotone"
                    className="text-[#fbbf24]/80 transition-all duration-500 group-hover:scale-110 group-hover:text-[#d97706]"
                  />
                </div>
                <h3
                  className="mt-10 font-[family-name:var(--font-thrive-display)] text-3xl tracking-tight sm:text-4xl"
                  style={{ fontWeight: 500 }}
                >
                  {f.label}
                </h3>
                <p className="mt-3 font-[family-name:var(--font-thrive-display)] text-lg italic text-[#fbbf24] sm:text-xl">
                  {f.tagline}
                </p>
                <p className="mt-5 text-base leading-relaxed text-[#fbf7ee]/85 sm:text-lg">
                  {f.body}
                </p>
                <span className="mt-7 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.22em] text-[#fbbf24] transition-colors group-hover:text-[#d97706]">
                  Learn more
                  <ArrowUpRight
                    size={14}
                    weight="bold"
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================== */
/*                          GENEROSITY                             */
/* ============================================================== */
function Generosity() {
  return (
    <section
      id="give"
      className="relative overflow-hidden bg-[#fbf7ee] py-16 sm:py-22"
    >
      <ChristianMotifs variant="generosity" />
      <div className="relative mx-auto max-w-[1480px] px-6 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-4xl text-center"
        >
          <div className="flex items-center justify-center gap-3 text-[14px] font-bold uppercase tracking-[0.26em] text-[#92400e]">
            <span className="inline-block h-px w-12 bg-[#d97706]" />
            Generosity
            <span className="inline-block h-px w-12 bg-[#d97706]" />
          </div>

          <h2
            className="mt-8 font-[family-name:var(--font-thrive-display)] text-[clamp(2.6rem,7vw,7rem)] font-light leading-[0.95] tracking-[-0.03em] text-[#0d4f4a]"
            style={{ fontWeight: 500 }}
          >
            Generosity
            <br />
            <em className="italic">moves</em> the mission
            <br />
            forward.
          </h2>

          <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-[#1a1a1a]/75">
            Every meal at the Table of Grace, every Sunday morning, every
            preschool scholarship — it's all funded by people who simply
            decided to give. Thank you for being part of it.
          </p>

          <Link
            href={GIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-12 inline-flex items-center gap-3 rounded-full bg-[#d97706] px-9 py-5 text-sm font-medium uppercase tracking-[0.18em] text-[#fbf7ee] transition-all duration-300 hover:bg-[#b45309] hover:shadow-[0_18px_40px_-12px_rgba(217,119,6,0.6)]"
          >
            <HandHeart size={18} weight="duotone" />
            Give Online
            <ArrowUpRight
              size={16}
              weight="bold"
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>

          <p className="mt-8 font-[family-name:var(--font-thrive-display)] text-base italic text-[#0d4f4a]/70">
            Secure giving via Thrive Sequim Generosity.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================== */
/*                       PRAYER SECTION                            */
/* ============================================================== */
function PrayerSection() {
  return (
    <section id="prayer" className="relative overflow-hidden bg-[#f5ede0] py-16 sm:py-22">
      <ChristianMotifs variant="prayer" />
      <div className="relative mx-auto max-w-[1480px] px-6 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-7 lg:order-2">
            <div className="rounded-sm border border-[#0d4f4a]/15 bg-[#fbf7ee] p-7 shadow-[0_24px_50px_-30px_rgba(13,79,74,0.25)] sm:p-9 lg:p-11">
              <PrayerRequestForm />
            </div>
          </div>

          <div className="lg:col-span-5 lg:order-1">
            <div className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.26em] text-[#0a3a36]">
              <span className="inline-block h-px w-10 bg-[#d97706]" />
              Prayer Request
            </div>
            <h2
              className="mt-8 font-[family-name:var(--font-thrive-display)] text-[clamp(2.4rem,5.4vw,5rem)] font-light leading-[0.98] tracking-[-0.025em] text-[#0d4f4a]"
              style={{ fontWeight: 500 }}
            >
              We'll <em className="italic">pray</em>
              <br />
              with you.
            </h2>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-[#1a1a1a]/70">
              Big or small. Anonymous or named. Whatever you're carrying — our
              prayer team would consider it an honor to pray over it with you
              this week.
            </p>
            <div className="mt-10 flex items-center gap-4 rounded-sm border border-[#0d4f4a]/15 bg-[#fbf7ee] p-5">
              <HandsPraying
                size={28}
                weight="duotone"
                className="text-[#d97706]"
              />
              <p className="text-sm leading-snug text-[#1a1a1a]/70">
                Requests stay private to our pastoral team unless you ask
                otherwise.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================== */
/*                          VISIT US                               */
/* ============================================================== */
function VisitUs() {
  return (
    <section id="visit" className="relative overflow-hidden bg-[#fbf7ee] py-16 sm:py-22">
      <ChristianMotifs variant="visit" />
      <div className="relative mx-auto max-w-[1480px] px-6 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Postcard-style info card */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.26em] text-[#0a3a36]">
              <span className="inline-block h-px w-10 bg-[#d97706]" />
              Visit Us
            </div>
            <h2
              className="mt-8 font-[family-name:var(--font-thrive-display)] text-[clamp(2.4rem,5.5vw,5rem)] font-light leading-[0.98] tracking-[-0.025em] text-[#0d4f4a]"
              style={{ fontWeight: 500 }}
            >
              See you
              <br />
              this <em className="italic">Sunday</em>.
            </h2>

            {/* Address card */}
            <div className="mt-10 space-y-px overflow-hidden rounded-sm bg-[#0d4f4a]/10">
              <a
                href={ADDRESS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-5 bg-[#fbf7ee] p-6 transition-colors hover:bg-[#f5ede0]"
              >
                <MapPin
                  size={24}
                  weight="duotone"
                  className="mt-1 shrink-0 text-[#d97706]"
                />
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#1a1a1a]/82">
                    Address
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-thrive-display)] text-xl text-[#0d4f4a]">
                    640 N Sequim Ave
                  </p>
                  <p className="font-[family-name:var(--font-thrive-display)] text-xl text-[#0d4f4a]">
                    Sequim, WA 98382
                  </p>
                  <p className="mt-2 text-sm text-[#0d4f4a]/70 underline-offset-4 group-hover:underline">
                    Open in Google Maps →
                  </p>
                </div>
              </a>

              <a
                href={PHONE_TEL}
                className="flex items-start gap-5 bg-[#fbf7ee] p-6 transition-colors hover:bg-[#f5ede0]"
              >
                <Phone
                  size={24}
                  weight="duotone"
                  className="mt-1 shrink-0 text-[#d97706]"
                />
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#1a1a1a]/82">
                    Phone
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-thrive-display)] text-xl text-[#0d4f4a]">
                    {PHONE_DISPLAY}
                  </p>
                </div>
              </a>

              <a
                href={`mailto:${EMAIL}`}
                className="flex items-start gap-5 bg-[#fbf7ee] p-6 transition-colors hover:bg-[#f5ede0]"
              >
                <EnvelopeSimple
                  size={24}
                  weight="duotone"
                  className="mt-1 shrink-0 text-[#d97706]"
                />
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#1a1a1a]/82">
                    Email
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-thrive-display)] text-xl text-[#0d4f4a]">
                    {EMAIL}
                  </p>
                </div>
              </a>

              <div className="bg-[#fbf7ee] p-6">
                <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#1a1a1a]/82">
                  Follow Along
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <SocialLink href={FACEBOOK_URL} label="Facebook">
                    <FacebookLogo size={18} weight="fill" />
                  </SocialLink>
                  <SocialLink href={INSTAGRAM_URL} label="Instagram">
                    <InstagramLogo size={18} weight="fill" />
                  </SocialLink>
                  <SocialLink href={YOUTUBE_URL} label="YouTube">
                    <YoutubeLogo size={18} weight="fill" />
                  </SocialLink>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-[#0d4f4a]/15 bg-[#0d4f4a] shadow-[0_30px_60px_-30px_rgba(13,79,74,0.4)]">
              <iframe
                title="Map to Thrive Church Sequim"
                src={MAP_EMBED}
                width="100%"
                height="100%"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full grayscale-[0.15] sepia-[0.05]"
              />
              {/* Pin overlay */}
              <div className="pointer-events-none absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div className="pointer-events-auto rounded-sm bg-[#fbf7ee] px-5 py-4 shadow-lg">
                  <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#d97706]">
                    Sundays · 10:30 AM
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-thrive-display)] text-lg text-[#0d4f4a]">
                    Thrive Church Sequim
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0d4f4a]/20 text-[#0d4f4a] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d97706] hover:bg-[#0d4f4a] hover:text-[#fbf7ee]"
    >
      {children}
    </a>
  );
}

/* ============================================================== */
/*                          FINAL CTA                              */
/* ============================================================== */
function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#0d4f4a] py-32 text-[#fbf7ee] sm:py-44">
      {/* Sunrise wash at the bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(217,119,6,0.35) 0%, rgba(217,119,6,0) 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#d97706] opacity-30 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1480px] px-6 text-center sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center justify-center gap-3 text-[13px] font-bold uppercase tracking-[0.28em] text-[#fbbf24]">
            <span className="inline-block h-px w-12 bg-[#fbbf24]" />
            We&rsquo;d love to meet you
            <span className="inline-block h-px w-12 bg-[#fbbf24]" />
          </div>

          <h2
            className="mt-10 font-[family-name:var(--font-thrive-display)] text-[clamp(3rem,9vw,10rem)] font-light leading-[0.92] tracking-[-0.035em]"
            style={{ fontWeight: 500 }}
          >
            We'll save
            <br />
            you a <em className="italic">seat</em>.
          </h2>

          <p className="mx-auto mt-10 max-w-xl text-lg leading-relaxed text-[#fbf7ee]/75">
            Sunday at 10:30. Coffee from 10:00. The doors open early and the
            welcome's already waiting.
          </p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="#connect"
              className="group inline-flex items-center gap-3 rounded-full bg-[#d97706] px-9 py-5 text-sm font-medium uppercase tracking-[0.18em] text-[#fbf7ee] transition-all duration-300 hover:bg-[#b45309] hover:shadow-[0_18px_40px_-12px_rgba(217,119,6,0.6)]"
            >
              Plan your visit
              <ArrowUpRight
                size={16}
                weight="bold"
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href={ADDRESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-[44px] items-center gap-3 px-2 py-2 text-sm font-medium uppercase tracking-[0.18em] text-[#fbf7ee]/80 transition-colors hover:text-[#d97706]"
            >
              <MapPin size={20} weight="duotone" />
              Get directions
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================== */
/*                            FOOTER                               */
/* ============================================================== */
function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#0a3d39] py-11 text-[#fbf7ee]">
      {/* Subtle amber wash in the top-right — echoes the FinalCTA glow
          so the page closes with one continuous dark "movement" rather
          than two unrelated dark sections. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-1/4 h-[420px] w-[420px] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(217,119,6,0.18) 0%, rgba(217,119,6,0) 60%)",
          filter: "blur(14px)",
        }}
      />
      <div className="relative mx-auto max-w-[1480px] px-6 sm:px-10">
        <div className="grid gap-12 sm:grid-cols-12">
          {/* Brand */}
          <div className="sm:col-span-5">
            <Link
              href="/clients/thrive-church-sequim"
              className="inline-flex items-center gap-3"
            >
              <span className="h-12 w-12 text-[#fbbf24]">
                <ThriveMark flat />
              </span>
              <div className="leading-tight">
                <p className="font-[family-name:var(--font-thrive-display)] text-2xl text-[#fbf7ee]">
                  Thrive Church
                </p>
                <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#fbbf24]">
                  Sequim, Washington
                </p>
              </div>
            </Link>
            <p className="mt-6 max-w-sm font-[family-name:var(--font-thrive-display)] text-base italic leading-relaxed text-[#fbf7ee]/80">
              Imperfect people becoming the church, on the mission with Jesus,
              bringing hope and healing to the world.
            </p>
          </div>

          {/* Nav columns */}
          <div className="sm:col-span-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#fbbf24]">
              Sundays
            </p>
            <ul className="mt-5 space-y-1 text-sm text-[#fbf7ee]/85 [&_a]:inline-flex [&_a]:items-center [&_a]:py-2">
              <li>
                <Link href="#connect" className="transition-colors hover:text-[#d97706]">
                  Plan a Visit
                </Link>
              </li>
              <li>
                <Link
                  href={LATEST_SERMON_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#d97706]"
                >
                  Watch Live
                </Link>
              </li>
              <li>
                <Link href="#ministries" className="transition-colors hover:text-[#d97706]">
                  Ministries
                </Link>
              </li>
              <li>
                <Link href="#beliefs" className="transition-colors hover:text-[#d97706]">
                  Beliefs
                </Link>
              </li>
            </ul>
          </div>

          <div className="sm:col-span-4">
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#fbbf24]">
              Connect
            </p>
            <ul className="mt-5 space-y-1 text-sm text-[#fbf7ee]/85 [&_a]:inline-flex [&_a]:items-center [&_a]:py-2">
              <li>
                <a
                  href={ADDRESS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#d97706]"
                >
                  {ADDRESS}
                </a>
              </li>
              <li>
                <a href={PHONE_TEL} className="transition-colors hover:text-[#d97706]">
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className="transition-colors hover:text-[#d97706]">
                  {EMAIL}
                </a>
              </li>
              <li>
                <Link
                  href={GIVE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#d97706]"
                >
                  Give Online
                </Link>
              </li>
            </ul>
            <div className="mt-5 flex items-center gap-3">
              <FooterSocial href={FACEBOOK_URL} label="Facebook">
                <FacebookLogo size={16} weight="fill" />
              </FooterSocial>
              <FooterSocial href={INSTAGRAM_URL} label="Instagram">
                <InstagramLogo size={16} weight="fill" />
              </FooterSocial>
              <FooterSocial href={YOUTUBE_URL} label="YouTube">
                <YoutubeLogo size={16} weight="fill" />
              </FooterSocial>
            </div>
          </div>
        </div>

        {/* Bottom rail */}
        <div className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-[#fbf7ee]/15 pt-8 text-[13px] text-[#fbf7ee]/72 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-4">
            <p>
              © {new Date().getFullYear()} Thrive Church Sequim. All rights
              reserved.
            </p>
            {/* Staff sign-in — the BlueJay icon doubles as the portal
                entry. Discreet pill styling so public visitors aren't
                distracted, clear enough that staff know where to click. */}
            <Link
              href="/clients/thrive-church-sequim/portal-demo"
              aria-label="Staff sign in"
              title="Staff sign in"
              className="group inline-flex items-center gap-1.5 rounded-full border border-[#fbf7ee]/15 bg-[#fbf7ee]/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#fbf7ee]/65 transition-all hover:border-[#5b9cf6]/40 hover:bg-[#5b9cf6]/10 hover:text-[#fbf7ee]"
            >
              <BluejayLogo className="h-3.5 w-auto text-[#5b9cf6] transition-colors group-hover:text-[#93c5fd]" />
              <span>Staff Sign in</span>
            </Link>
          </div>
          <Link
            href={AUDIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-[#fbf7ee]/78 transition-colors hover:text-[#fbf7ee]"
          >
            <span className="text-[12px] font-semibold uppercase tracking-[0.2em]">
              Built by
            </span>
            <BluejayLogo className="h-5 w-auto text-[#5b9cf6] transition-colors group-hover:text-[#93c5fd]" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.2em]">
              · Free site audit →
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* Inverted SocialLink for the dark footer — cream-on-deep-teal hover
   to amber instead of the light-section teal-bordered variant. */
function FooterSocial({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#fbf7ee]/20 text-[#fbf7ee] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d97706] hover:bg-[#d97706] hover:text-[#fbf7ee]"
    >
      {children}
    </a>
  );
}
