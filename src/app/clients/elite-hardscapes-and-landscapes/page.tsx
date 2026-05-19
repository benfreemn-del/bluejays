"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase. */

/**
 * /clients/elite-hardscapes-and-landscapes — Tyler Fritz's hardscape +
 * landscape crew on the Olympic Peninsula (Port Angeles, WA).
 *
 * Custom-tier bespoke build. Real photos from Tyler's portfolio.
 * Rugged American craftsman aesthetic — matte black, chrome steel,
 * crimson accents. Lead capture via mailto (no portal backend per the
 * No-Backend Client Pattern in CLAUDE.md).
 *
 * Structure ported from a claude.ai artifact, palette + photos +
 * copy + icon library swapped to match BlueJays conventions
 * (@phosphor-icons/react, real assets, real address, real services).
 */

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Tree,
  Plant,
  ShieldCheck,
  Star,
  Phone,
  EnvelopeSimple,
  MapPin,
  Clock,
  ArrowUpRight,
  List as MenuIcon,
  X as CloseIcon,
  Check,
  Medal,
  Hammer,
  Stack,
  ChatCircleDots,
  Flower,
  Sun,
  Snowflake,
  CaretDown,
  Camera,
  Leaf,
} from "@phosphor-icons/react";
import BluejayFeather from "@/components/BluejayFeather";

const PHOTO_BASE = "/clients/elite-hardscapes-and-landscapes/photos";

// Real Google Business Profile snapshot — scraped 2026-05-17 from
// Tyler's actual GBP "Elite Hardscapes & Landscaping" (Google listing
// name differs from website brand by one letter — Landscaping vs
// Landscapes). Update when Tyler gains/loses reviews.
const GOOGLE_RATING = 4.7;
const GOOGLE_REVIEW_COUNT = 13;
// Search URL is the chip's external fallback (only used if STATIC_REVIEWS
// is somehow empty — currently impossible). Searches the Google listing
// directly by name + Sequim so result hits Tyler's GBP first.
const GOOGLE_REVIEW_URL =
  "https://www.google.com/search?q=" +
  encodeURIComponent("Elite Hardscapes Landscaping Port Angeles reviews");

type GoogleReview = {
  author: string;
  rating: number;             // 1-5
  text: string;
  relativeTime: string;       // "2 months ago", "a year ago", etc.
  profilePhoto?: string | null;
};

// STATIC_REVIEWS — the three most-recent 5-star reviews from Tyler's
// GBP, scraped 2026-05-17 (Elliot Witecki, David Overbaugh, Melissa
// Moss). The page seeds the marquee with these so it ALWAYS shows real
// social proof even when the Places API isn't wired up. The optional
// /api/clients/.../google-reviews fetch (below) can overwrite this list
// once a Place ID + API key are configured — it only overwrites if the
// API returns >= 1 review, so static reviews never get blanked.
//
// David's review is trimmed at the natural sentence break — Google's
// front-end truncates the full text server-side and requires a trusted
// click to expand. Ending at "stress-free." is cleaner than ending at
// the "...gets the job" cut Google ships.
const STATIC_REVIEWS: GoogleReview[] = [
  {
    author: "Elliot Witecki",
    rating: 5,
    text: "Excellent work on my retaining wall backyard project.",
    relativeTime: "a week ago",
  },
  {
    author: "David Overbaugh",
    rating: 5,
    text:
      "I had a great experience working with Tyler on my project. He communicates clearly and keeps you informed every step of the way, which made the whole process smooth and stress-free.",
    relativeTime: "2 weeks ago",
  },
  {
    author: "Melissa Moss",
    rating: 5,
    text:
      "I highly recommend Tyler! He always communicates with you and gets back to you quickly. He always does what I ask and makes my yard beautiful. He always shows up when he says and works hard.",
    relativeTime: "3 weeks ago",
  },
];

const BRAND = {
  name: "Elite",
  suffix: "Hardscapes & Landscapes",
  owner: "Tyler Fritz",
  location: "Port Angeles, Washington",
  region: "Olympic Peninsula",
  address: "9321 Old Olympic Hwy, Port Angeles, WA",
  addressMapHref:
    "https://maps.google.com/?q=" +
    encodeURIComponent("9321 Old Olympic Hwy, Port Angeles, WA"),
  phone: "(360) 797-4448",
  phoneRaw: "+13607974448",
  // Routes to Ben's inbox for now (Tyler's email TBD — Ben forwards via text).
  email: "bluejaycontactme@gmail.com",
  estYear: "2022",
  logo: `${PHOTO_BASE}/9BC866E7-33A3-4704-B978-7D3BED20191C.png`,
};

const PALETTE = {
  // Matte rugged base
  pureBlack: "#000000",     // exact match to the logo's background
  ink: "#0a0a0a",           // hero bg, primary dark
  inkSoft: "#171717",       // section bg alt
  steel: "#1f1f1f",         // cards
  steelLine: "#2a2a2a",     // hairlines
  chrome: "#9ca3af",        // muted steel text
  chromeBright: "#d4d4d4",  // bright steel
  // Brand accents (from logo: American flag red + flag blue + chrome)
  crimson: "#b91c1c",
  crimsonHot: "#dc2626",
  navy: "#1e3a5f",          // deeper navy — backgrounds, strips
  navyBright: "#3b82f6",    // bright flag-blue — pops on dark bg, ties Americana
  // 3rd accent — warm metallic bronze. Pairs with crimson + steel on
  // the dark base. Used on alternating kickers + the middle service
  // card so the page reads red-bronze-red instead of all-red.
  bronze: "#d4a85a",
  bronzeDeep: "#a17a37",
  // Light text on dark
  bone: "#f5f5f4",
  boneDim: "#e7e5e4",
};

const PORTFOLIO = [
  {
    src: `${PHOTO_BASE}/2026-05-16-front-yard-blue-house.jpg`,
    title: "Curbside Bed Refresh",
    tag: "Landscape · Curved bed, lilac, mulch, fresh edging",
    ratio: "aspect-[4/3]",
  },
  {
    src: `${PHOTO_BASE}/2026-05-16-red-ornamental-bed.jpg`,
    title: "Front-Bed Color Pop",
    tag: "Landscape · Japanese maple + mulch install",
    ratio: "aspect-[3/4]",
  },
  {
    src: `${PHOTO_BASE}/2026-05-16-boulder-feature.jpg`,
    title: "Driveway Boulder Feature",
    tag: "Hardscape · Stone accent + mulch bed shaping",
    ratio: "aspect-[3/4]",
  },
  {
    src: `${PHOTO_BASE}/2026-05-12-excavator-jobsite.jpg`,
    title: "Site Prep · Yanmar on Jobsite",
    tag: "Capability · Excavator + dump trailer on a Peninsula build",
    ratio: "aspect-[3/4]",
  },
  {
    src: `${PHOTO_BASE}/IMG_7199.jpg`,
    title: "Carlsborg Retaining Wall",
    tag: "Hardscape · Stack-block wall + walkway",
    ratio: "aspect-[4/3]",
  },
  {
    src: `${PHOTO_BASE}/IMG_0045.jpg`,
    title: "Paver Patio · Grass Joints",
    tag: "Hardscape · Custom under-deck patio",
    ratio: "aspect-[3/4]",
  },
  {
    src: `${PHOTO_BASE}/IMG_9499.jpg`,
    title: "Sequim Front Yard Refresh",
    tag: "Landscape · Beds, mulch, walkway",
    ratio: "aspect-[3/4]",
  },
  {
    src: `${PHOTO_BASE}/IMG_9330.jpg`,
    title: "Fern Garden Path",
    tag: "Hardscape · Natural-stone + tie steps",
    ratio: "aspect-[4/5]",
  },
  {
    src: `${PHOTO_BASE}/IMG_6481.jpg`,
    title: "Hydroseed Lawn Install",
    tag: "Landscape · Fresh hydroseed application",
    ratio: "aspect-[4/3]",
  },
  {
    src: `${PHOTO_BASE}/IMG_1974.jpg`,
    title: "Cedar Privacy Fence",
    tag: "Hardscape · New-build cedar fence",
    ratio: "aspect-[3/4]",
  },
  {
    src: `${PHOTO_BASE}/IMG_0877.jpg`,
    title: "Greenhouse Pad",
    tag: "Site work · Gravel pad + greenhouse",
    ratio: "aspect-[4/3]",
  },
  {
    src: `${PHOTO_BASE}/IMG_5918.jpg`,
    title: "Rhododendron Bed",
    tag: "Landscape · Mulch refresh",
    ratio: "aspect-[3/4]",
  },
];

const SERVICES = [
  {
    icon: Stack,
    kicker: "01 · Hardscape",
    title: "Pavers, Walls & Walkways",
    copy:
      "Retaining walls, paver patios, stone walkways, fire pits, fences. Built level, built drained, built to outlast the rain.",
    bullets: [
      "Stack-block & natural-stone retaining walls",
      "Paver patios, walkways, driveways",
      "Cedar fencing, custom steps, fire pits",
    ],
  },
  {
    icon: Plant,
    kicker: "02 · Landscape",
    title: "Design, Install & Hydroseed",
    copy:
      "From a single bed to a full property redesign. Plantings, mulch, beds, and hydroseed lawns that take root in PNW soil.",
    bullets: [
      "Bed design + native plant install",
      "Hydroseed + sod lawn installs",
      "Mulch, edging, drainage cleanup",
    ],
  },
  {
    icon: Tree,
    kicker: "03 · Maintenance",
    title: "Lawn & Property Care",
    copy:
      "Weekly and bi-weekly maintenance routes across the Peninsula. Same crew, same day, every visit. Keep the place sharp.",
    bullets: [
      "Mowing, edging, blowing",
      "Seasonal cleanups + brush clearing",
      "Storm cleanup + property prep",
    ],
  },
];

// Service area cities with per-city context. Order is intentional —
// Sequim leads (home base, most work), then west-to-Forks, then east-
// to-Port-Townsend, then the county catch-all. Each `note` field is one
// short line per city: what work happens there OR how close it is to
// Tyler's base. Used by the redesigned WHERE WE WORK section AND the
// footer's compact city list (which only reads .name).
const SERVICE_AREA_CITIES: { name: string; note: string; isBase?: boolean }[] = [
  { name: "Sequim", note: "Home base · most weekly routes start here", isBase: true },
  { name: "Carlsborg", note: "Walls, paver patios, fresh bed installs" },
  { name: "Port Angeles", note: "Hardscape + property maintenance routes" },
  { name: "Joyce", note: "Brush clearing, storm prep, larger lots" },
  { name: "Forks", note: "Out-of-area builds — quote required" },
  { name: "Diamond Point", note: "Lakefront landscapes + waterfront yards" },
  { name: "Port Townsend", note: "Hardscape-heavy patio + fence builds" },
  { name: "Clallam County", note: "Anywhere in the county — we'll come look" },
];

// Seasonal calendar — PNW timing. Each season gets its own accent so
// the row reads as four distinct cards.
const SEASONAL = [
  {
    season: "Spring",
    icon: Flower,
    accent: "#7eb84a",
    tasks: [
      "New plantings & mulch refresh",
      "Hydroseed lawn installs",
      "Bed cleanup & soil prep",
      "Lawn dethatching",
    ],
  },
  {
    season: "Summer",
    icon: Sun,
    accent: "#d4a85a", // bronze
    tasks: [
      "Weekly mowing & edging",
      "Irrigation checks",
      "Brush clearing",
      "Patio + fence builds",
    ],
  },
  {
    season: "Fall",
    icon: Tree,
    accent: "#c2410c", // burnt orange
    tasks: [
      "Leaf removal & cleanups",
      "Fall planting window",
      "Mulch refresh",
      "Storm-prep & drainage",
    ],
  },
  {
    season: "Winter",
    icon: Snowflake,
    accent: "#7392c7", // cool slate-blue
    tasks: [
      "Hardscape installs (dry-window work)",
      "Pruning & tree work",
      "Retaining wall + drainage projects",
      "Design planning for spring",
    ],
  },
];

const FAQS = [
  {
    q: "What's your service area?",
    a: "We cover the Olympic Peninsula — Sequim, Port Angeles, Carlsborg, Port Townsend, Joyce, Diamond Point, Forks and the rest of Clallam County. If you're close to the edge and not sure, call. We'll tell you straight.",
  },
  {
    q: "Are estimates really free?",
    a: "Yes. We come out, walk the property, and put a written estimate together within a few days. No deposit pressure, no high-pressure sales, no obligation to book.",
  },
  {
    q: "Are you licensed and insured?",
    a: "Yes — licensed in Washington State and fully insured. Documentation available on request, and we're happy to confirm before the walkthrough if that's important to you.",
  },
  {
    q: "How fast can you start?",
    a: "Maintenance routes usually within one to two weeks. Hardscape and design/install projects depend on scope and weather — PNW rain windows matter. We give a realistic timeline at the walkthrough, not a hopeful one.",
  },
  {
    q: "Do you take small jobs or just big ones?",
    a: "Both. A single front bed refresh, a fence repair, a one-off cleanup — same crew, same standard. Big multi-week installs are where we shine, but small jobs keep the routes balanced and the neighbors happy.",
  },
  {
    q: "When's the best season to start a project?",
    a: "Spring and early fall are the sweet spots for plantings and hydroseed in the PNW. Hardscape can run most of the year as long as we're not pouring rain. Book your walkthrough 2-4 weeks before you want install to begin.",
  },
];

/* ───────────── floating leaves (ambient bg) ─────────────
   CSS-only port of the Hector landscaping leaf animation. 18
   leaves drift top-to-bottom with a horizontal sway + slow rotate.
   Colors mix Elite's accent palette: bronze, sage, crimson, navy
   (Americana).
   Behavior: leaves START rendering only after the user scrolls past
   the hero (scrollY > 30). 5-second total run, fading the last 1.5s
   then unmount. Resets on page refresh (state initializes fresh). */
function FloatingLeaves() {
  const [mounted, setMounted] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => setMounted(true), []);

  // Scroll trigger — fires once when user nudges past the hero edge.
  useEffect(() => {
    if (!mounted || triggered) return;
    const onScroll = () => {
      if (window.scrollY > 30) {
        setTriggered(true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mounted, triggered]);

  // 5-second life cycle — start fading at 3.5s, fully gone at 5s.
  useEffect(() => {
    if (!triggered) return;
    const fadeT = setTimeout(() => setFading(true), 3500);
    const hideT = setTimeout(() => setHidden(true), 5000);
    return () => {
      clearTimeout(fadeT);
      clearTimeout(hideT);
    };
  }, [triggered]);

  const leaves = useMemo(
    () =>
      mounted
        ? Array.from({ length: 18 }, (_, i) => {
            // Autumn-leaf palette: red, yellow, green, brown. No blue
            // in the leaves — that's reserved for the Americana accents
            // in the trust strip / footer / address pins.
            const palette = [
              PALETTE.crimsonHot, // red
              "#eab308",          // warm yellow / gold
              "#7eb84a",          // sage green
              "#92400e",          // saddle brown
            ];
            return {
              id: i,
              left: Math.random() * 100,
              delay: -(Math.random() * 22),
              duration: 16 + Math.random() * 12,
              size: 18 + Math.random() * 18,
              opacity: 0.22 + Math.random() * 0.18,
              rotate: Math.random() * 360,
              sway: 30 + Math.random() * 50,
              tone: palette[i % palette.length],
            };
          })
        : [],
    [mounted],
  );

  if (!mounted || !triggered || hidden) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
      style={{
        opacity: fading ? 0 : 1,
        transition: "opacity 1.5s ease-out",
      }}
    >
      {leaves.map((l) => (
        <div
          key={l.id}
          className="absolute will-change-transform"
          style={{
            left: `${l.left}%`,
            top: "-8vh",
            animation: `leafFall ${l.duration}s linear ${l.delay}s infinite`,
            opacity: l.opacity,
          }}
        >
          <div
            style={{
              animation: `leafSway ${l.duration / 3}s ease-in-out ${l.delay}s infinite alternate`,
              ["--sway" as string]: `${l.sway}px`,
            }}
          >
            <div
              style={{
                animation: `leafSpin ${l.duration}s linear ${l.delay}s infinite`,
                ["--start-rot" as string]: `${l.rotate}deg`,
              }}
            >
              <Leaf size={l.size} weight="fill" color={l.tone} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────── Google reviews chip (sliding) ─────────────
   Small floating badge that slides in from the bottom-left after a
   2s delay. Dismissable. Click-through to a Google search that
   surfaces Tyler's GBP. Numbers are real (provided by Tyler). */
function GoogleReviewBadge({ hasOnPageReviews }: { hasOnPageReviews: boolean }) {
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShown(true), 2000);
    return () => clearTimeout(t);
  }, []);

  if (dismissed) return null;

  const rating = GOOGLE_RATING.toFixed(1);
  const fillPct = Math.max(0, Math.min(100, (GOOGLE_RATING / 5) * 100));

  // When the on-page marquee has reviews, the chip scroll-targets it
  // instead of bouncing the visitor out to Google. Falls back to the
  // Google search URL until the API returns review content.
  const linkProps = hasOnPageReviews
    ? {
        href: "#google-reviews",
        onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          const target = document.getElementById("google-reviews");
          if (target)
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        },
      }
    : {
        href: GOOGLE_REVIEW_URL,
        target: "_blank" as const,
        rel: "noopener noreferrer",
      };

  return (
    <a
      {...linkProps}
      aria-label={`${rating} stars on Google — ${GOOGLE_REVIEW_COUNT} reviews${hasOnPageReviews ? " (jump to reviews)" : ""}`}
      className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-40 group inline-flex items-center gap-3 pl-3 pr-2 py-2 transition-all hover:gap-3.5 hover:-translate-y-0.5"
      style={{
        background: "rgba(0,0,0,0.85)",
        border: `1px solid ${PALETTE.steelLine}`,
        borderRadius: "10px",
        backdropFilter: "blur(8px)",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",
        transform: shown ? "translateX(0)" : "translateX(-130%)",
        opacity: shown ? 1 : 0,
        transition:
          "transform 700ms cubic-bezier(.22,.61,.36,1), opacity 700ms ease, gap 200ms ease",
      }}
    >
      {/* Google G */}
      <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden>
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4C12.9 4 4 12.9 4 24s8.9 20 20 20s20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="m6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4C16.3 4 9.6 8.3 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.5 0 10.5-2.1 14.2-5.6l-6.6-5.4c-2 1.5-4.6 2.5-7.6 2.5c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.8l6.6 5.4C41.4 36 44 30.5 44 24c0-1.3-.1-2.3-.4-3.5z"
        />
      </svg>

      {/* Rating + stars + count */}
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <span
            className="text-sm font-semibold"
            style={{ color: PALETTE.bone }}
          >
            {rating}
          </span>
          {/* 5-star track with partial fill */}
          <span
            className="relative inline-block"
            style={{ width: "70px", height: "12px" }}
          >
            {/* base (dim stars) */}
            <span
              className="absolute inset-0 flex items-center gap-0.5"
              style={{ color: "#3f3f46" }}
              aria-hidden
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={12} weight="fill" />
              ))}
            </span>
            {/* fill (gold stars, clipped to rating %) */}
            <span
              className="absolute inset-0 flex items-center gap-0.5 overflow-hidden"
              style={{
                color: "#FBBF24",
                width: `${fillPct}%`,
                whiteSpace: "nowrap",
              }}
              aria-hidden
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={12} weight="fill" />
              ))}
            </span>
          </span>
        </div>
        <div
          className="text-[10px] mt-0.5"
          style={{ color: PALETTE.chrome }}
        >
          {GOOGLE_REVIEW_COUNT} Google reviews · Tap to read
        </div>
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDismissed(true);
        }}
        aria-label="Dismiss"
        className="ml-1 w-6 h-6 inline-flex items-center justify-center rounded-md transition-colors hover:bg-white/[0.08]"
        style={{ color: PALETTE.chrome }}
      >
        <CloseIcon size={12} weight="bold" />
      </button>
    </a>
  );
}

/* ───────────── Google reviews marquee ─────────────
   Auto-scrolling row of review cards. Pauses on hover (CSS). Lives
   right under the FAQ section. The bottom-left GoogleReviewBadge
   scroll-targets this section's id. Duplicates the review list once
   so the keyframe can translate -50% and feel like infinite scroll.
   Only renders when GOOGLE_REVIEWS has entries (no fake data ever). */
function GoogleReviewMarquee({ reviews }: { reviews: GoogleReview[] }) {
  if (reviews.length === 0) return null;
  // Two copies of the list back-to-back lets the keyframe glide -50%
  // and visually loop. Slower (~50s) for longer lists; min 30s.
  const duration = Math.max(30, reviews.length * 6);
  const doubled = [...reviews, ...reviews];
  return (
    <div className="relative w-full">
      {/* Edge fades — soften the loop seam */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 md:w-32 z-10"
        style={{
          background: `linear-gradient(90deg, ${PALETTE.inkSoft} 0%, transparent 100%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 md:w-32 z-10"
        style={{
          background: `linear-gradient(270deg, ${PALETTE.inkSoft} 0%, transparent 100%)`,
        }}
      />
      <div
        className="flex gap-4 md:gap-5"
        style={{
          width: "max-content",
          animation: `elite-reviews-scroll ${duration}s linear infinite`,
        }}
      >
        {doubled.map((r, i) => (
          <article
            key={i}
            className="shrink-0 w-[280px] md:w-[340px] p-5 flex flex-col"
            style={{
              background: PALETTE.steel,
              border: `1px solid ${PALETTE.steelLine}`,
              borderRadius: "12px",
              minHeight: "180px",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              {/* Google G icon */}
              <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
                <path
                  fill="#FFC107"
                  d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4C12.9 4 4 12.9 4 24s8.9 20 20 20s20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
                />
                <path
                  fill="#FF3D00"
                  d="m6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4C16.3 4 9.6 8.3 6.3 14.7z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.5 0 10.5-2.1 14.2-5.6l-6.6-5.4c-2 1.5-4.6 2.5-7.6 2.5c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.8l6.6 5.4C41.4 36 44 30.5 44 24c0-1.3-.1-2.3-.4-3.5z"
                />
              </svg>
              <span
                className="inline-flex items-center gap-0.5"
                aria-label={`${r.rating} of 5 stars`}
              >
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star
                    key={s}
                    size={13}
                    weight="fill"
                    color={s < r.rating ? "#FBBF24" : "#3f3f46"}
                  />
                ))}
              </span>
            </div>
            <p
              className="text-sm leading-relaxed flex-1 mb-3"
              style={{ color: PALETTE.chromeBright }}
            >
              {r.text}
            </p>
            <div className="flex items-center justify-between gap-2">
              <span
                className="text-[13px] font-semibold"
                style={{ color: PALETTE.bone }}
              >
                {r.author}
              </span>
              <span
                className="text-[11px]"
                style={{ color: PALETTE.chrome }}
              >
                {r.relativeTime}
              </span>
            </div>
          </article>
        ))}
      </div>
      {/* Keyframe + pause-on-hover for the row */}
      <style jsx>{`
        div:hover > div[style*="animation"] {
          animation-play-state: paused !important;
        }
      `}</style>
      <style jsx global>{`
        @keyframes elite-reviews-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="elite-reviews-scroll"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ───────────── scroll-reveal hook ───────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -50px 0px" },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

function Reveal({
  children,
  delay = 0,
  y = 24,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity 900ms cubic-bezier(.22,.61,.36,1) ${delay}ms, transform 900ms cubic-bezier(.22,.61,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ───────────── component ───────────── */
export default function Site() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  // Seeded with the 3 real GBP reviews scraped 2026-05-17 (STATIC_REVIEWS).
  // The Places API fetch below CAN overwrite this list once a Place ID
  // is wired up — but only if it returns >= 1 review, so static reviews
  // never get blanked by an empty API response. Floating Google chip
  // checks reviews.length > 0 to decide whether to scroll-target the
  // on-page marquee (always true here) vs. open Google search.
  const [reviews, setReviews] = useState<GoogleReview[]>(STATIC_REVIEWS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          "/api/clients/elite-hardscapes-and-landscapes/google-reviews",
          { cache: "force-cache" },
        );
        const j = (await r.json()) as {
          ok: boolean;
          reviews?: GoogleReview[];
        };
        // Only overwrite static reviews if the API returned >= 1 review —
        // an empty API response (e.g. missing Place ID env var) must not
        // blank the marquee.
        if (!cancelled && j.ok && Array.isArray(j.reviews) && j.reviews.length > 0) {
          setReviews(j.reviews);
        }
      } catch {
        // Endpoint unreachable / env var missing — empty array keeps
        // the marquee hidden and the chip in fallback mode.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const navItems = [
    { label: "Services", href: "#services" },
    { label: "Work", href: "#work" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <div
      className="font-body min-h-screen relative"
      style={{ background: PALETTE.ink, color: PALETTE.bone }}
    >
      <FloatingLeaves />
      <GoogleReviewBadge hasOnPageReviews={reviews.length > 0} />
      {/* CSS via dangerouslySetInnerHTML — avoids Turbopack 16.2.2
          optimized-build hang on large <style>{`...`}</style> blocks
          in client components (CLAUDE.md NON-NEGOTIABLE). */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .font-display { font-family: 'Oswald', 'Arial Narrow', sans-serif; letter-spacing: 0.01em; }
        .font-body    { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        .tracking-tightest { letter-spacing: -0.02em; }
        .tracking-display  { letter-spacing: 0em; }
        body { background: ${PALETTE.ink}; }
        .grain::before {
          content:''; position:absolute; inset:0; pointer-events:none; opacity:.06;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .stripe::before {
          content:''; position:absolute; inset:0; pointer-events:none; opacity:.04;
          background-image: repeating-linear-gradient(135deg, ${PALETTE.bone} 0 1px, transparent 1px 14px);
        }
        @keyframes leafFall {
          0%   { transform: translateY(-8vh); }
          100% { transform: translateY(115vh); }
        }
        @keyframes leafSway {
          from { transform: translateX(calc(var(--sway) * -0.5)); }
          to   { transform: translateX(calc(var(--sway) * 0.5)); }
        }
        @keyframes leafSpin {
          from { transform: rotate(var(--start-rot)); }
          to   { transform: rotate(calc(var(--start-rot) + 360deg)); }
        }
      `,
        }}
      />

      {/* ═══════════════ NAV ═══════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: PALETTE.pureBlack,
          borderBottom: `1px solid ${PALETTE.steelLine}`,
          boxShadow: scrolled
            ? "0 2px 16px rgba(0,0,0,0.6)"
            : "0 2px 12px rgba(0,0,0,0.35)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between h-24 md:h-28">
          {/* logo */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-4 group"
          >
            <img
              src={BRAND.logo}
              alt="Elite Hardscapes & Landscapes"
              className="h-20 md:h-24 w-auto transition-transform group-hover:scale-105"
            />
            <div className="hidden sm:block leading-none">
              <div
                className="font-display text-2xl md:text-3xl uppercase"
                style={{ color: PALETTE.bone, fontWeight: 700 }}
              >
                {BRAND.name}
              </div>
              <div
                className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] mt-1.5"
                style={{ color: PALETTE.chrome }}
              >
                Hardscapes & Landscapes
              </div>
            </div>
          </a>

          {/* desktop nav */}
          <div className="hidden md:flex items-center gap-10">
            <ul className="flex items-center gap-8">
              {navItems.map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    className="text-sm uppercase tracking-[0.15em] transition-colors hover:text-white"
                    style={{ color: PALETTE.boneDim, fontWeight: 500 }}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={`tel:${BRAND.phoneRaw}`}
              className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm uppercase tracking-[0.15em] transition-all hover:gap-3"
              style={{
                background: PALETTE.crimson,
                color: PALETTE.bone,
                fontWeight: 600,
              }}
            >
              <Phone size={16} weight="bold" />
              {BRAND.phone}
            </a>
          </div>

          {/* mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <CloseIcon size={26} color={PALETTE.bone} weight="bold" />
            ) : (
              <MenuIcon size={26} color={PALETTE.bone} weight="bold" />
            )}
          </button>
        </div>

        {/* mobile menu overlay */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ${menuOpen ? "max-h-[420px]" : "max-h-0"}`}
          style={{
            background: PALETTE.inkSoft,
            borderTop: menuOpen ? `1px solid ${PALETTE.steelLine}` : "none",
          }}
        >
          <ul className="px-6 py-6 space-y-4">
            {navItems.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  onClick={() => setMenuOpen(false)}
                  className="block font-display uppercase text-2xl tracking-display"
                  style={{ color: PALETTE.bone, fontWeight: 600 }}
                >
                  {n.label}
                </a>
              </li>
            ))}
            <li className="pt-2 flex gap-3">
              <a
                href={`tel:${BRAND.phoneRaw}`}
                onClick={() => setMenuOpen(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm uppercase tracking-[0.15em]"
                style={{
                  background: PALETTE.crimson,
                  color: PALETTE.bone,
                  fontWeight: 600,
                }}
              >
                <Phone size={16} weight="bold" /> Call
              </a>
              <a
                href={`sms:${BRAND.phoneRaw}`}
                onClick={() => setMenuOpen(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm uppercase tracking-[0.15em]"
                style={{
                  background: "transparent",
                  color: PALETTE.bone,
                  border: `1px solid ${PALETTE.chrome}`,
                  fontWeight: 600,
                }}
              >
                <ChatCircleDots size={16} weight="bold" /> Text
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        {/* bg image */}
        <div className="absolute inset-0">
          <img
            src={`${PHOTO_BASE}/RenderedImage.jpg`}
            alt="Property maintenance on the Olympic Peninsula"
            className="w-full h-full object-cover"
            style={{ filter: "saturate(0.95) brightness(0.7) contrast(1.05)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.25) 30%, rgba(10,10,10,0.45) 65%, rgba(10,10,10,0.95) 100%)",
            }}
          />
          {/* crimson accent vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 80% 20%, rgba(185,28,28,0.18), transparent 55%)",
            }}
          />
        </div>

        {/* content */}
        <div className="relative max-w-[1400px] mx-auto w-full px-6 md:px-10 pb-20 md:pb-28 pt-32">
          <Reveal>
            <div className="inline-flex items-center gap-3 mb-8">
              <div
                className="w-12 h-px"
                style={{
                  background: PALETTE.crimsonHot,
                  boxShadow: `0 0 12px ${PALETTE.crimsonHot}`,
                }}
              />
              <span
                className="inline-block text-[11px] uppercase tracking-[0.3em] px-3 py-1.5"
                style={{
                  color: PALETTE.bone,
                  fontWeight: 700,
                  background: "rgba(0,0,0,0.55)",
                  border: `1px solid ${PALETTE.crimson}`,
                  textShadow:
                    "0 0 12px rgba(220,38,38,0.85), 0 1px 2px rgba(0,0,0,0.9)",
                  boxShadow:
                    "0 0 18px rgba(220,38,38,0.45), inset 0 0 12px rgba(220,38,38,0.18)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {BRAND.region} · {BRAND.location}
              </span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h1
              className="font-display uppercase tracking-tightest leading-[0.92] text-5xl sm:text-6xl md:text-7xl lg:text-[7.5rem] max-w-5xl"
              style={{ color: PALETTE.bone, fontWeight: 700 }}
            >
              Built on rock.
              <br />
              <span style={{ color: PALETTE.crimsonHot }}>Rooted</span>{" "}
              <span style={{ color: PALETTE.bone }}>in the Peninsula.</span>
            </h1>
          </Reveal>

          <Reveal delay={260}>
            <p
              className="mt-8 max-w-xl text-base md:text-lg leading-relaxed"
              style={{ color: PALETTE.boneDim }}
            >
              Hardscape, landscape, and property maintenance for homes
              across Sequim, Port Angeles, and the rest of the Olympic
              Peninsula. Hands-on, fully insured, and honest about what
              your yard actually needs.
            </p>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2.5 px-7 py-4 text-sm uppercase tracking-[0.15em] transition-all hover:gap-3.5"
                style={{
                  background: PALETTE.crimson,
                  color: PALETTE.bone,
                  fontWeight: 600,
                }}
              >
                Get a Free Estimate
                <ArrowUpRight size={18} weight="bold" />
              </a>
              <a
                href={`tel:${BRAND.phoneRaw}`}
                className="group inline-flex items-center gap-2.5 px-7 py-4 text-sm uppercase tracking-[0.15em] transition-all hover:gap-3.5"
                style={{
                  background: "transparent",
                  color: PALETTE.bone,
                  border: `1px solid ${PALETTE.chrome}`,
                  fontWeight: 600,
                }}
              >
                <Phone size={16} weight="bold" />
                {BRAND.phone}
              </a>
            </div>
          </Reveal>

          {/* Above-fold believability pills — Meyer rule #3 (3 markers
              visible at first paint: license + insurance + tenure). */}
          <Reveal delay={520}>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              {[
                { icon: ShieldCheck, label: "Licensed in WA", tone: PALETTE.crimsonHot },
                { icon: Medal, label: "Fully Insured", tone: PALETTE.bronze },
                { icon: Star, label: `Est. ${BRAND.estYear} · Owner-operated`, tone: PALETTE.navyBright },
              ].map((m, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5"
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    border: `1px solid ${PALETTE.steelLine}`,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <m.icon size={14} weight="bold" color={m.tone} />
                  <span
                    className="text-[11px] uppercase tracking-[0.18em]"
                    style={{ color: PALETTE.bone, fontWeight: 600 }}
                  >
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* corner mark */}
          <Reveal delay={600}>
            <div
              className="hidden md:flex items-center gap-3 absolute right-10 bottom-28"
              style={{ color: PALETTE.chrome }}
            >
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-[0.25em]">
                  Est.
                </div>
                <div
                  className="font-display text-3xl"
                  style={{ color: PALETTE.bone, fontWeight: 700 }}
                >
                  {BRAND.estYear}
                </div>
              </div>
              <div
                className="w-px h-10"
                style={{ background: PALETTE.steelLine }}
              />
              <div className="text-[10px] uppercase tracking-[0.25em] leading-relaxed">
                Hardscape
                <br />
                Landscape
                <br />
                Maintenance
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ TRUST STRIP ═══════════════ */}
      <section
        className="border-y"
        style={{
          background: PALETTE.inkSoft,
          borderColor: PALETTE.steelLine,
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-6 md:py-8">
          <div className="grid grid-cols-2 md:flex md:flex-wrap md:items-center md:justify-center gap-y-6 gap-x-6 md:gap-x-12 lg:gap-x-16">
            {[
              { icon: ShieldCheck, label: "Licensed" },
              { icon: Medal, label: "Fully Insured" },
              {
                icon: Hammer,
                label: "Hardscape Crew",
                sub: "Walls, patios, fences",
              },
              {
                icon: MapPin,
                label: "Olympic Peninsula",
                sub: "Sequim to Forks",
              },
              {
                icon: Star,
                label: `Est. ${BRAND.estYear}`,
                sub: "Locally owned",
              },
            ].map((item, i, arr) => (
              <Reveal
                key={i}
                delay={i * 70}
                className={`flex items-center gap-3.5 ${
                  i < arr.length - 1
                    ? "md:pr-12 lg:pr-16 md:border-r"
                    : ""
                }`}
              >
                <item.icon
                  size={22}
                  color={
                    i % 3 === 0
                      ? PALETTE.crimsonHot
                      : i % 3 === 1
                        ? PALETTE.bronze
                        : PALETTE.navyBright
                  }
                  weight="bold"
                />
                <div className="leading-tight">
                  <div
                    className="text-sm uppercase tracking-[0.1em]"
                    style={{ color: PALETTE.bone, fontWeight: 600 }}
                  >
                    {item.label}
                  </div>
                  {item.sub && (
                    <div
                      className="text-[11px] mt-0.5"
                      style={{ color: PALETTE.chrome }}
                    >
                      {item.sub}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SERVICES ═══════════════ */}
      <section id="services" className="py-20 sm:py-24 lg:py-32 relative">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
              <div className="inline-flex items-center gap-3 mb-6">
                <div
                  className="w-8 h-px"
                  style={{ background: PALETTE.bronze }}
                />
                <span
                  className="text-[11px] uppercase tracking-[0.3em]"
                  style={{ color: PALETTE.bronze, fontWeight: 600 }}
                >
                  What We Do
                </span>
                <div
                  className="w-8 h-px"
                  style={{ background: PALETTE.bronze }}
                />
              </div>
              <h2
                className="font-display uppercase tracking-tightest leading-[0.98] text-4xl md:text-5xl lg:text-6xl"
                style={{ color: PALETTE.bone, fontWeight: 700 }}
              >
                Three trades.
                <br />
                <span style={{ color: PALETTE.crimsonHot }}>
                  One callback.
                </span>
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {SERVICES.map((s, i) => {
              // Middle card uses bronze accents — gives the trio a
              // red-bronze-red rhythm instead of a flat red wall.
              const toneStrip = i === 1 ? PALETTE.bronze : PALETTE.crimson;
              const toneHot = i === 1 ? PALETTE.bronze : PALETTE.crimsonHot;
              const toneBorder = i === 1 ? PALETTE.bronzeDeep : PALETTE.crimson;
              return (
                <Reveal key={i} delay={i * 120}>
                  <div
                    className="group h-full p-8 md:p-10 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
                    style={{
                      background: PALETTE.steel,
                      border: `1px solid ${PALETTE.steelLine}`,
                    }}
                  >
                    {/* tone accent strip */}
                    <div
                      className="absolute top-0 left-0 h-1 w-12 transition-all group-hover:w-full duration-500"
                      style={{ background: toneStrip }}
                    />

                    <div className="flex items-start justify-between mb-10">
                      <div
                        className="w-14 h-14 flex items-center justify-center transition-all group-hover:scale-110"
                        style={{
                          background: PALETTE.ink,
                          border: `1px solid ${toneBorder}`,
                        }}
                      >
                        <s.icon size={26} color={toneHot} weight="bold" />
                      </div>
                      <span
                        className="text-[10px] uppercase tracking-[0.25em] mt-2"
                        style={{ color: PALETTE.chrome, fontWeight: 600 }}
                      >
                        {s.kicker}
                      </span>
                    </div>

                    <h3
                      className="font-display uppercase text-2xl md:text-3xl tracking-display leading-[1.05] mb-5"
                      style={{ color: PALETTE.bone, fontWeight: 700 }}
                    >
                      {s.title}
                    </h3>
                    <p
                      className="text-[15px] leading-relaxed mb-8"
                      style={{ color: PALETTE.chromeBright }}
                    >
                      {s.copy}
                    </p>

                    <ul className="space-y-3 mb-10">
                      {s.bullets.map((b, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-3 text-sm"
                          style={{ color: PALETTE.boneDim }}
                        >
                          <Check
                            size={16}
                            weight="bold"
                            color={toneHot}
                            className="mt-0.5 shrink-0"
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href="#contact"
                      className="group/cta inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] border-b pb-1 transition-all hover:gap-3"
                      style={{
                        color: toneHot,
                        borderColor: toneBorder,
                        fontWeight: 600,
                      }}
                    >
                      Book this work
                      <ArrowUpRight size={16} weight="bold" />
                    </a>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ PORTFOLIO ═══════════════ */}
      <section
        id="work"
        className="py-20 sm:py-24 lg:py-32 relative"
        style={{ background: PALETTE.inkSoft }}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6 mb-16">
              <div>
                <div className="inline-flex items-center gap-3 mb-6">
                  <div
                    className="w-8 h-px"
                    style={{ background: PALETTE.crimson }}
                  />
                  <span
                    className="text-[11px] uppercase tracking-[0.3em]"
                    style={{ color: PALETTE.crimsonHot, fontWeight: 600 }}
                  >
                    Selected Work
                  </span>
                </div>
                <h2
                  className="font-display uppercase tracking-tightest leading-[0.98] text-4xl md:text-5xl lg:text-6xl max-w-2xl"
                  style={{ color: PALETTE.bone, fontWeight: 700 }}
                >
                  Recent jobs on the{" "}
                  <span style={{ color: PALETTE.crimsonHot }}>Peninsula.</span>
                </h2>
              </div>
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] border-b pb-1"
                style={{
                  color: PALETTE.bone,
                  borderColor: PALETTE.chrome,
                  fontWeight: 600,
                }}
              >
                Start your project
                <ArrowUpRight size={16} weight="bold" />
              </a>
            </div>
          </Reveal>

          {/* masonry via CSS columns */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-5 md:gap-6">
            {PORTFOLIO.map((p, i) => (
              <Reveal key={i} delay={(i % 3) * 100}>
                <div
                  className={`group relative block mb-5 md:mb-6 overflow-hidden break-inside-avoid ${p.ratio}`}
                  style={{
                    border: `1px solid ${PALETTE.steelLine}`,
                  }}
                >
                  <img
                    src={p.src}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                    style={{ filter: "saturate(0.9) contrast(1.05)" }}
                  />
                  <div
                    className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 35%, rgba(10,10,10,0.92) 100%)",
                    }}
                  />
                  <div className="absolute left-5 right-5 bottom-5 translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <div
                      className="text-[10px] uppercase tracking-[0.25em] mb-1"
                      style={{ color: PALETTE.crimsonHot, fontWeight: 600 }}
                    >
                      {p.tag}
                    </div>
                    <div
                      className="font-display uppercase text-xl md:text-2xl"
                      style={{ color: PALETTE.bone, fontWeight: 700 }}
                    >
                      {p.title}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SEASONAL CALENDAR ═══════════════ */}
      <section
        id="seasonal"
        className="py-20 sm:py-24 lg:py-32 relative"
        style={{ background: PALETTE.inkSoft }}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
              <div className="inline-flex items-center gap-3 mb-6">
                <div
                  className="w-8 h-px"
                  style={{ background: PALETTE.bronze }}
                />
                <span
                  className="text-[11px] uppercase tracking-[0.3em]"
                  style={{ color: PALETTE.bronze, fontWeight: 600 }}
                >
                  Year-Round Crew
                </span>
                <div
                  className="w-8 h-px"
                  style={{ background: PALETTE.bronze }}
                />
              </div>
              <h2
                className="font-display uppercase tracking-tightest leading-[0.98] text-4xl md:text-5xl lg:text-6xl"
                style={{ color: PALETTE.bone, fontWeight: 700 }}
              >
                A yard through{" "}
                <span style={{ color: PALETTE.crimsonHot }}>
                  every season.
                </span>
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {SEASONAL.map((s, i) => (
              <Reveal key={i} delay={i * 100}>
                <div
                  className="group h-full p-6 md:p-7 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
                  style={{
                    background: PALETTE.steel,
                    border: `1px solid ${PALETTE.steelLine}`,
                  }}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1 transition-all"
                    style={{ background: s.accent }}
                  />
                  <div className="flex items-center gap-3 mb-5 mt-1">
                    <div
                      className="w-11 h-11 flex items-center justify-center transition-all group-hover:scale-110"
                      style={{
                        background: PALETTE.ink,
                        border: `1px solid ${s.accent}`,
                      }}
                    >
                      <s.icon size={22} weight="bold" color={s.accent} />
                    </div>
                    <h3
                      className="font-display uppercase text-xl md:text-2xl tracking-display"
                      style={{ color: PALETTE.bone, fontWeight: 700 }}
                    >
                      {s.season}
                    </h3>
                  </div>
                  <ul className="space-y-2.5">
                    {s.tasks.map((t, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2.5 text-sm"
                        style={{ color: PALETTE.boneDim }}
                      >
                        <Check
                          size={14}
                          weight="bold"
                          color={s.accent}
                          className="shrink-0 mt-0.5"
                        />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ ABOUT / TYLER ═══════════════ */}
      <section id="about" className="py-20 sm:py-24 lg:py-32 relative">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-20 items-center">
            <Reveal>
              <div
                className="relative aspect-[4/5] overflow-hidden"
                style={{ border: `1px solid ${PALETTE.steelLine}` }}
              >
                <img
                  src={`${PHOTO_BASE}/IMG_6672.jpg`}
                  alt={`${BRAND.owner}, owner of Elite Hardscapes & Landscapes`}
                  className="w-full h-full object-cover object-top"
                  style={{ filter: "saturate(0.95) contrast(1.05)" }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 65%, rgba(10,10,10,0.85) 100%)",
                  }}
                />
                <div className="absolute left-6 right-6 bottom-6">
                  <div
                    className="text-[10px] uppercase tracking-[0.3em] mb-1"
                    style={{ color: PALETTE.crimsonHot, fontWeight: 700 }}
                  >
                    Owner · Operator
                  </div>
                  <div
                    className="font-display uppercase text-3xl md:text-4xl"
                    style={{ color: PALETTE.bone, fontWeight: 700 }}
                  >
                    {BRAND.owner}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div>
                <div className="inline-flex items-center gap-3 mb-6">
                  <div
                    className="w-8 h-px"
                    style={{ background: PALETTE.bronze }}
                  />
                  <span
                    className="text-[11px] uppercase tracking-[0.3em]"
                    style={{ color: PALETTE.bronze, fontWeight: 600 }}
                  >
                    About Elite
                  </span>
                </div>

                <h2
                  className="font-display uppercase tracking-tightest leading-[0.98] text-4xl md:text-5xl mb-8"
                  style={{ color: PALETTE.bone, fontWeight: 700 }}
                >
                  Local crew.
                  <br />
                  <span style={{ color: PALETTE.crimsonHot }}>
                    Real hands.
                  </span>{" "}
                  <span style={{ color: PALETTE.bone }}>Real work.</span>
                </h2>

                <div
                  className="space-y-5 text-[15px] leading-relaxed"
                  style={{ color: PALETTE.chromeBright }}
                >
                  <p>
                    Elite Hardscapes & Landscapes is owned and operated by{" "}
                    {BRAND.owner} on the Olympic Peninsula. We handle
                    hardscape, landscape design and install, and weekly
                    property maintenance — end-to-end on every project,
                    and you talk to the owner from quote through walk-off.
                  </p>
                  <p>
                    Since {BRAND.estYear}, we&apos;ve been building
                    retaining walls, paver patios, fences, hydroseed
                    lawns, and full yard redesigns from Forks to Port
                    Townsend. We work the way Olympic Peninsula homeowners
                    want their projects worked: on time, fully insured,
                    and you talk to the owner — not a call center.
                  </p>
                  <p>
                    If you can describe it, we can quote it. Fastest way
                    to get on the calendar is a call or text.
                  </p>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-4">
                  <a
                    href={`tel:${BRAND.phoneRaw}`}
                    className="group inline-flex items-center justify-center gap-2 px-5 py-4 text-sm uppercase tracking-[0.15em] transition-all hover:gap-3"
                    style={{
                      background: PALETTE.crimson,
                      color: PALETTE.bone,
                      fontWeight: 600,
                    }}
                  >
                    <Phone size={16} weight="bold" />
                    Call {BRAND.owner.split(" ")[0]}
                  </a>
                  <a
                    href={`sms:${BRAND.phoneRaw}`}
                    className="group inline-flex items-center justify-center gap-2 px-5 py-4 text-sm uppercase tracking-[0.15em] transition-all hover:gap-3"
                    style={{
                      background: "transparent",
                      color: PALETTE.bone,
                      border: `1px solid ${PALETTE.chrome}`,
                      fontWeight: 600,
                    }}
                  >
                    <ChatCircleDots size={16} weight="bold" />
                    Text Us
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ WHERE WE WORK — SERVICE AREA SHOWCASE ═══════════════
          Replaces the old single-line "Serving →" strip. Best-in-class
          contractor sites (Bahler Bros, Cornell Landscape, Belgard
          dealer pages) treat the service area as a proof surface, not
          a city list — each city tile carries one specific note about
          what Tyler actually does there, so prospects in that town see
          themselves on the page. HQ (Sequim) gets a bronze accent +
          "HQ" badge. Bottom CTA tile handles edge-cases warmly. */}
      <section
        id="service-area"
        className="relative py-20 sm:py-24 lg:py-32 overflow-hidden grain"
        style={{
          background: PALETTE.inkSoft,
          borderTop: `1px solid ${PALETTE.steelLine}`,
          borderBottom: `1px solid ${PALETTE.steelLine}`,
        }}
      >
        <div className="relative max-w-[1400px] mx-auto px-6 md:px-10">
          {/* heading */}
          <Reveal>
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-3 mb-6">
                <div
                  className="w-8 h-px"
                  style={{ background: PALETTE.bronze }}
                />
                <span
                  className="text-[11px] uppercase tracking-[0.3em]"
                  style={{ color: PALETTE.bronze, fontWeight: 600 }}
                >
                  Where We Work
                </span>
                <div
                  className="w-8 h-px"
                  style={{ background: PALETTE.bronze }}
                />
              </div>
              <h2
                className="font-display uppercase tracking-tightest leading-[0.98] text-4xl md:text-5xl lg:text-6xl"
                style={{ color: PALETTE.bone, fontWeight: 700 }}
              >
                From Sequim{" "}
                <span style={{ color: PALETTE.crimsonHot }}>to Forks.</span>
              </h2>
              <p
                className="mt-6 max-w-2xl mx-auto text-base md:text-lg leading-relaxed"
                style={{ color: PALETTE.boneDim }}
              >
                Olympic Peninsula coverage end to end — Diamond Point
                and Port Townsend in the east, Joyce and Forks in the
                west, and every town in between. Most weekly routes run
                out of Sequim.
              </p>
            </div>
          </Reveal>

          {/* city grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {SERVICE_AREA_CITIES.map((city, i) => {
              const accent = city.isBase ? PALETTE.bronze : PALETTE.crimson;
              return (
                <Reveal key={city.name} delay={i * 50}>
                  <div
                    className="group relative p-5 md:p-6 transition-all hover:-translate-y-0.5 h-full"
                    style={{
                      background: PALETTE.steel,
                      border: `1px solid ${PALETTE.steelLine}`,
                    }}
                  >
                    {/* left accent strip */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-1.5"
                      style={{ background: accent }}
                    />
                    {city.isBase && (
                      <div
                        className="absolute right-3 top-3 text-[9px] uppercase tracking-[0.25em] px-2 py-1"
                        style={{
                          color: PALETTE.bronze,
                          border: `1px solid ${PALETTE.bronzeDeep}`,
                          background: "rgba(212, 168, 90, 0.05)",
                        }}
                      >
                        HQ
                      </div>
                    )}
                    <div className="pl-3">
                      <div
                        className="font-display uppercase text-xl md:text-2xl tracking-tightest mb-2"
                        style={{ color: PALETTE.bone, fontWeight: 700 }}
                      >
                        {city.name}
                      </div>
                      <div
                        className="text-xs md:text-[13px] leading-relaxed"
                        style={{ color: PALETTE.chromeBright }}
                      >
                        {city.note}
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* don't-see-your-town CTA tile */}
          <Reveal delay={450}>
            <div
              className="mt-4 md:mt-5 p-6 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-6 text-center md:text-left"
              style={{
                background: PALETTE.steel,
                border: `1px dashed ${PALETTE.bronzeDeep}`,
              }}
            >
              <div className="md:max-w-2xl">
                <div
                  className="font-display uppercase text-xl md:text-2xl tracking-tightest"
                  style={{ color: PALETTE.bone, fontWeight: 700 }}
                >
                  Don't see your town?
                </div>
                <div
                  className="text-sm mt-2 leading-relaxed"
                  style={{ color: PALETTE.chromeBright }}
                >
                  If you're close enough to the Peninsula, we'll quote
                  the drive too. Call or text and we'll tell you straight.
                </div>
              </div>
              <a
                href={`tel:${BRAND.phoneRaw}`}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-sm uppercase tracking-[0.15em] transition-all hover:gap-3 shrink-0"
                style={{
                  background: PALETTE.crimson,
                  color: PALETTE.bone,
                  fontWeight: 600,
                }}
              >
                <Phone size={16} weight="bold" />
                {BRAND.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ FAQ ═══════════════ */}
      <section id="faq" className="py-20 sm:py-24 lg:py-32 relative">
        <div className="max-w-3xl mx-auto px-6 md:px-10">
          <Reveal>
            <div className="text-center mb-14 md:mb-16">
              <div className="inline-flex items-center gap-3 mb-6">
                <div
                  className="w-8 h-px"
                  style={{ background: PALETTE.bronze }}
                />
                <span
                  className="text-[11px] uppercase tracking-[0.3em]"
                  style={{ color: PALETTE.bronze, fontWeight: 600 }}
                >
                  Common Questions
                </span>
                <div
                  className="w-8 h-px"
                  style={{ background: PALETTE.bronze }}
                />
              </div>
              <h2
                className="font-display uppercase tracking-tightest leading-[0.98] text-4xl md:text-5xl lg:text-6xl"
                style={{ color: PALETTE.bone, fontWeight: 700 }}
              >
                Frequently{" "}
                <span style={{ color: PALETTE.crimsonHot }}>asked.</span>
              </h2>
            </div>
          </Reveal>

          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <Reveal key={i} delay={i * 60}>
                  <div
                    className="overflow-hidden transition-colors"
                    style={{
                      background: PALETTE.steel,
                      border: `1px solid ${
                        isOpen ? PALETTE.crimson : PALETTE.steelLine
                      }`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left transition-colors hover:bg-white/[0.02]"
                    >
                      <span
                        className="text-base md:text-lg pr-4"
                        style={{
                          color: PALETTE.bone,
                          fontWeight: 600,
                        }}
                      >
                        {faq.q}
                      </span>
                      <CaretDown
                        size={20}
                        weight="bold"
                        color={isOpen ? PALETTE.crimsonHot : PALETTE.chrome}
                        style={{
                          transition: "transform 300ms ease",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          flexShrink: 0,
                        }}
                      />
                    </button>
                    <div
                      style={{
                        maxHeight: isOpen ? "400px" : "0px",
                        transition:
                          "max-height 400ms cubic-bezier(.22,.61,.36,1)",
                        overflow: "hidden",
                      }}
                    >
                      <p
                        className="px-5 pb-5 md:px-6 md:pb-6 text-sm md:text-[15px] leading-relaxed"
                        style={{ color: PALETTE.chromeBright }}
                      >
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ GOOGLE REVIEWS MARQUEE ═══════════════
          Sits right under FAQ. The bottom-left GoogleReviewBadge
          scroll-targets this section's id. Auto-hides when the
          /api/clients/.../google-reviews endpoint returns empty —
          never ship fake data per CLAUDE.md. */}
      {reviews.length > 0 && (
        <section
          id="google-reviews"
          className="relative py-20 sm:py-24 lg:py-32 overflow-hidden"
          style={{ background: PALETTE.inkSoft }}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 mb-10 md:mb-12">
            <Reveal>
              <div className="text-center">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div
                    className="w-8 h-px"
                    style={{ background: PALETTE.bronze }}
                  />
                  <span
                    className="text-[11px] uppercase tracking-[0.3em]"
                    style={{ color: PALETTE.bronze, fontWeight: 600 }}
                  >
                    Verified on Google
                  </span>
                  <div
                    className="w-8 h-px"
                    style={{ background: PALETTE.bronze }}
                  />
                </div>
                <h2
                  className="font-display uppercase tracking-tightest leading-[0.98] text-4xl md:text-5xl lg:text-6xl mb-4"
                  style={{ color: PALETTE.bone, fontWeight: 700 }}
                >
                  What our neighbors{" "}
                  <span style={{ color: PALETTE.crimsonHot }}>say.</span>
                </h2>
                <div className="inline-flex items-center gap-3 mt-2">
                  <span
                    className="text-2xl md:text-3xl font-semibold tabular-nums"
                    style={{ color: PALETTE.bone }}
                  >
                    {GOOGLE_RATING.toFixed(1)}
                  </span>
                  <span className="inline-flex items-center gap-0.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star
                        key={i}
                        size={20}
                        weight="fill"
                        color={i < Math.round(GOOGLE_RATING) ? "#FBBF24" : "#3f3f46"}
                      />
                    ))}
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: PALETTE.chrome }}
                  >
                    · {GOOGLE_REVIEW_COUNT} Google reviews
                  </span>
                </div>
              </div>
            </Reveal>
          </div>

          <GoogleReviewMarquee reviews={reviews} />

          <div className="max-w-[1400px] mx-auto px-6 md:px-10 mt-10 text-center">
            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
              style={{ color: PALETTE.chromeBright, fontWeight: 600 }}
            >
              <span>Read every review on Google</span>
              <span aria-hidden>→</span>
            </a>
          </div>
        </section>
      )}

      {/* ═══════════════ CTA / CONTACT ═══════════════ */}
      <section
        id="contact"
        className="relative overflow-hidden stripe"
        style={{ background: PALETTE.ink, color: PALETTE.bone }}
      >
        <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-20 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-14 lg:gap-20 items-start">
            {/* left: pitch */}
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-3 mb-6">
                  <div
                    className="w-8 h-px"
                    style={{ background: PALETTE.bronze }}
                  />
                  <span
                    className="text-[11px] uppercase tracking-[0.3em]"
                    style={{ color: PALETTE.bronze, fontWeight: 600 }}
                  >
                    Free Estimate
                  </span>
                </div>
                <h2
                  className="font-display uppercase tracking-tightest leading-[0.95] text-4xl md:text-5xl lg:text-6xl mb-8"
                  style={{ color: PALETTE.bone, fontWeight: 700 }}
                >
                  Ready to break{" "}
                  <span style={{ color: PALETTE.crimsonHot }}>ground?</span>
                </h2>
                <p
                  className="text-base md:text-lg leading-relaxed max-w-md mb-10"
                  style={{ color: PALETTE.chromeBright }}
                >
                  Send the form, call, or text. We&apos;ll get back to you the
                  same day to set up a walkthrough — no obligation, no
                  pressure.
                </p>
                <div className="space-y-4">
                  <a
                    href={`tel:${BRAND.phoneRaw}`}
                    className="flex items-center gap-3 text-sm hover:underline"
                    style={{ color: PALETTE.bone }}
                  >
                    <Phone
                      size={18}
                      weight="bold"
                      color={PALETTE.crimsonHot}
                    />
                    <span>{BRAND.phone}</span>
                  </a>
                  <a
                    href={`mailto:${BRAND.email}`}
                    className="flex items-center gap-3 text-sm hover:underline"
                    style={{ color: PALETTE.bone }}
                  >
                    <EnvelopeSimple
                      size={18}
                      weight="bold"
                      color={PALETTE.bronze}
                    />
                    <span>{BRAND.email}</span>
                  </a>
                  <a
                    href={BRAND.addressMapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 text-sm hover:underline"
                    style={{ color: PALETTE.bone }}
                  >
                    <MapPin
                      size={18}
                      weight="bold"
                      color={PALETTE.navyBright}
                      className="mt-0.5"
                    />
                    <span>{BRAND.address}</span>
                  </a>
                </div>
              </div>
            </Reveal>

            {/* right: mailto form */}
            <Reveal delay={150}>
              <form
                action={`mailto:${BRAND.email}`}
                method="post"
                encType="text/plain"
                className="p-7 md:p-10"
                style={{
                  background: PALETTE.steel,
                  border: `1px solid ${PALETTE.steelLine}`,
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    {
                      label: "Name",
                      name: "Name",
                      type: "text",
                      placeholder: "Your full name",
                    },
                    {
                      label: "Phone",
                      name: "Phone",
                      type: "tel",
                      placeholder: "(360) 555-0123",
                    },
                    {
                      label: "Email",
                      name: "Email",
                      type: "email",
                      placeholder: "you@email.com",
                      full: true,
                    },
                    {
                      label: "Property Address",
                      name: "Address",
                      type: "text",
                      placeholder: "Street, city",
                      full: true,
                    },
                  ].map((f, i) => (
                    <div key={i} className={f.full ? "sm:col-span-2" : ""}>
                      <label
                        className="block text-[10px] uppercase tracking-[0.25em] mb-2"
                        style={{ color: PALETTE.chrome, fontWeight: 600 }}
                      >
                        {f.label}
                      </label>
                      <input
                        type={f.type}
                        name={f.name}
                        placeholder={f.placeholder}
                        required={f.name === "Name" || f.name === "Phone"}
                        className="w-full bg-transparent outline-none text-sm pb-3 transition-colors"
                        style={{
                          color: PALETTE.bone,
                          borderBottom: `1px solid ${PALETTE.steelLine}`,
                        }}
                      />
                    </div>
                  ))}

                  <div className="sm:col-span-2">
                    <label
                      className="block text-[10px] uppercase tracking-[0.25em] mb-2"
                      style={{ color: PALETTE.chrome, fontWeight: 600 }}
                    >
                      Project Type
                    </label>
                    <select
                      name="Project"
                      defaultValue=""
                      className="w-full bg-transparent outline-none text-sm pb-3 appearance-none cursor-pointer"
                      style={{
                        color: PALETTE.bone,
                        borderBottom: `1px solid ${PALETTE.steelLine}`,
                        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg width='12' height='8' viewBox='0 0 12 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23d4d4d4' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0 center",
                      }}
                    >
                      <option
                        value=""
                        style={{
                          background: PALETTE.steel,
                          color: PALETTE.bone,
                        }}
                      >
                        Select one…
                      </option>
                      {[
                        "Retaining wall / hardscape",
                        "Paver patio or walkway",
                        "Landscape design + install",
                        "Hydroseed or lawn install",
                        "Maintenance",
                        "Cedar fence",
                        "Not sure yet",
                      ].map((o) => (
                        <option
                          key={o}
                          value={o}
                          style={{
                            background: PALETTE.steel,
                            color: PALETTE.bone,
                          }}
                        >
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      className="block text-[10px] uppercase tracking-[0.25em] mb-2"
                      style={{ color: PALETTE.chrome, fontWeight: 600 }}
                    >
                      Details
                    </label>
                    <textarea
                      name="Details"
                      rows={3}
                      placeholder="Tell us about the property and what you're picturing"
                      className="w-full bg-transparent outline-none text-sm py-2 resize-none"
                      style={{
                        color: PALETTE.bone,
                        borderBottom: `1px solid ${PALETTE.steelLine}`,
                      }}
                    />
                  </div>

                  <div className="sm:col-span-2 mt-4">
                    <button
                      type="submit"
                      className="group w-full inline-flex items-center justify-center gap-2.5 px-7 py-4 text-sm uppercase tracking-[0.15em] transition-all hover:gap-3.5"
                      style={{
                        background: PALETTE.crimson,
                        color: PALETTE.bone,
                        fontWeight: 600,
                      }}
                    >
                      Send Estimate Request
                      <ArrowUpRight size={18} weight="bold" />
                    </button>
                  </div>

                  <div className="sm:col-span-2 mt-3">
                    <a
                      href={`sms:${BRAND.phoneRaw}?&body=${encodeURIComponent(
                        "Hi Tyler — sending photos for an estimate. My address: ___  Project: ___",
                      )}`}
                      className="group w-full inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm uppercase tracking-[0.15em] transition-all hover:gap-3.5"
                      style={{
                        background: "transparent",
                        color: PALETTE.bronze,
                        border: `1px dashed ${PALETTE.bronzeDeep}`,
                        fontWeight: 600,
                      }}
                    >
                      <Camera size={18} weight="bold" />
                      Send Photos via Text
                    </a>
                    <p
                      className="text-[11px] mt-2 text-center"
                      style={{ color: PALETTE.chrome }}
                    >
                      Opens your text app — attach photos of the area
                      so we can quote it right.
                    </p>
                  </div>

                  <p
                    className="sm:col-span-2 text-[11px] mt-3 text-center"
                    style={{ color: PALETTE.chrome }}
                  >
                    Or skip the form — call {BRAND.phone}.
                  </p>
                </div>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer
        style={{
          background: PALETTE.pureBlack,
          color: PALETTE.bone,
          borderTop: `1px solid ${PALETTE.steelLine}`,
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 md:py-14">
          <div className="grid md:grid-cols-12 gap-10 md:gap-12">
            {/* brand */}
            <div className="md:col-span-4">
              <div className="flex items-center gap-3 mb-5">
                <img
                  src={BRAND.logo}
                  alt="Elite Hardscapes & Landscapes"
                  className="h-14 w-auto"
                />
                <div className="leading-none">
                  <div
                    className="font-display uppercase text-xl"
                    style={{ color: PALETTE.bone, fontWeight: 700 }}
                  >
                    {BRAND.name}
                  </div>
                  <div
                    className="text-[10px] uppercase tracking-[0.25em] mt-1"
                    style={{ color: PALETTE.chrome }}
                  >
                    Hardscapes & Landscapes
                  </div>
                </div>
              </div>
              <p
                className="text-sm leading-relaxed max-w-xs mb-6"
                style={{ color: PALETTE.chromeBright }}
              >
                Locally-owned hardscape + landscape crew working the
                Olympic Peninsula since {BRAND.estYear}.
              </p>
            </div>

            {/* service area */}
            <div className="md:col-span-3">
              <div
                className="text-[10px] uppercase tracking-[0.3em] mb-5"
                style={{ color: PALETTE.crimsonHot, fontWeight: 600 }}
              >
                Service Area
              </div>
              <ul className="space-y-2 text-sm">
                {SERVICE_AREA_CITIES.filter(
                  (c) => c.name !== "Clallam County",
                ).map((c) => (
                  <li key={c.name} style={{ color: PALETTE.boneDim }}>
                    {c.name}
                  </li>
                ))}
                <li
                  className="pt-1 text-[12px]"
                  style={{ color: PALETTE.chrome }}
                >
                  + the rest of Clallam County
                </li>
              </ul>
            </div>

            {/* hours */}
            <div className="md:col-span-2">
              <div
                className="text-[10px] uppercase tracking-[0.3em] mb-5"
                style={{ color: PALETTE.bronze, fontWeight: 600 }}
              >
                Hours
              </div>
              <ul
                className="space-y-2 text-sm"
                style={{ color: PALETTE.boneDim }}
              >
                <li>Mon–Sat · 7a–6p</li>
                <li style={{ color: PALETTE.chrome }}>Sun · Closed</li>
              </ul>
            </div>

            {/* contact */}
            <div className="md:col-span-3">
              <div
                className="text-[10px] uppercase tracking-[0.3em] mb-5"
                style={{ color: PALETTE.navyBright, fontWeight: 600 }}
              >
                Get in Touch
              </div>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href={`tel:${BRAND.phoneRaw}`}
                    className="flex items-center gap-2.5 hover:underline"
                    style={{ color: PALETTE.bone }}
                  >
                    <Phone
                      size={14}
                      weight="bold"
                      color={PALETTE.crimsonHot}
                    />
                    {BRAND.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={`sms:${BRAND.phoneRaw}`}
                    className="flex items-center gap-2.5 hover:underline"
                    style={{ color: PALETTE.bone }}
                  >
                    <ChatCircleDots
                      size={14}
                      weight="bold"
                      color={PALETTE.bronze}
                    />
                    Text {BRAND.owner.split(" ")[0]}
                  </a>
                </li>
                <li>
                  <a
                    href={BRAND.addressMapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 hover:underline"
                    style={{ color: PALETTE.bone }}
                  >
                    <MapPin
                      size={14}
                      weight="bold"
                      color={PALETTE.navyBright}
                      className="mt-0.5"
                    />
                    {BRAND.address}
                  </a>
                </li>
                <li
                  className="flex items-start gap-2.5"
                  style={{ color: PALETTE.boneDim }}
                >
                  <Clock
                    size={14}
                    weight="bold"
                    color={PALETTE.bronze}
                    className="mt-0.5"
                  />
                  Walkthroughs by appointment
                </li>
              </ul>
            </div>
          </div>

          {/* baseline */}
          <div
            className="mt-16 pt-8 flex flex-wrap items-center justify-between gap-4 text-[11px]"
            style={{
              borderTop: `1px solid ${PALETTE.steelLine}`,
              color: PALETTE.chrome,
            }}
          >
            <div>
              © {new Date().getFullYear()} {BRAND.name}{" "}
              {BRAND.suffix}. Licensed · Insured.
            </div>
            <div className="flex items-center gap-1.5">
              Built by{" "}
              <a
                href="https://bluejayportfolio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:underline transition-opacity hover:opacity-80"
                style={{ fontWeight: 600 }}
                aria-label="BlueJays — visit the portfolio"
              >
                <BluejayFeather size={14} />
                <span style={{ color: "#38bdf8" }}>BlueJays</span>
              </a>{" "}
              — get your free site audit
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
