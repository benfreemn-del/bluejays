"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase. */

/**
 * /clients/meyer-electric — Meyer Electric LLC, Sequim WA
 *
 * Custom-tier bespoke premium showcase for the Olympic Peninsula's
 * Tesla Powerwall Certified Installer + Generac Certified Installer +
 * licensed electrical contractor. Real services + real photos + real
 * trust signals from sequimelectrician.com — recolored to a yellow-on-
 * black trade-dress that screams "modern electrician, premium energy
 * specialist" instead of the generic blue+white plug logo their
 * existing site uses.
 *
 * Aesthetic locked by Ben 2026-05-06: yellow (#facc15) on near-black
 * (#0a0a0a). Lightning-bolt motif. Tesla Powerwall hero. Matches the
 * screenshot template Ben sourced exactly.
 *
 * Pattern reference: masters-window-tinting/page.tsx (component
 * structure) + hector-landscaping/page.tsx (custom-tier feel).
 */

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle,
  Lightning,
  Shield,
  ShieldCheck,
  Wrench,
  House,
  Buildings,
  Plug,
  Sun,
  Lifebuoy,
  Quotes,
  Calendar,
  CaretRight,
  Certificate,
  WifiHigh,
  SpeakerHigh,
  Star,
  CaretDown,
  XCircle,
  Trophy,
  LockKey,
  InstagramLogo,
} from "@phosphor-icons/react";

import StickyNav from "./sticky-nav";
import MeyerElectricContactForm from "./contact-form";
import MeyerMark from "./meyer-mark";

/* ───────────────────────── BUSINESS DATA ───────────────────────── */
const BUSINESS = {
  name: "Meyer Electric LLC",
  tagline: "Reliable Power. No Compromises.",
  established: 2010,
  yearsInBusiness: 15,
  phoneDisplay: "(360) 477-2202",
  phoneHref: "tel:+13604772202",
  email: "info@sequimelectrician.com",
  address: {
    street: "35 Robbins Rd",
    city: "Sequim",
    state: "WA",
    zip: "98382",
    full: "35 Robbins Rd, Sequim, WA 98382",
  },
  mapsUrl: "https://maps.google.com/?q=35+Robbins+Rd+Sequim+WA+98382",
  license: "MEYERE*862P1",
  // Instagram added 2026-08-17 per Kyle. Their social-media contractor
  // posts job photos here; when she starts sending content, drop real
  // posts into the "See the work" band above the contact section.
  instagramHandle: "@meyerelectric360",
  instagramUrl: "https://www.instagram.com/meyerelectric360/",
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
  prospectId: "063c4d4a-81e1-4cae-bbf1-3ce615e1c6f7",
} as const;

/* ───────────────────── HIGHLIGHT FILM ─────────────────────
 * Vertical (9:16) highlight reel of real Meyer jobs. Slot prepped
 * 2026-08-17; Kyle is sending the file.
 *
 * ── TO TURN IT ON ──
 * Set `src` (and ideally `poster`). That's the only edit needed —
 * the section, the nav link, and the anchor all wake up together.
 * While `src` is empty the ENTIRE section renders nothing, so the
 * live site never shows a "video coming soon" placeholder.
 *
 * ── WHERE TO PUT THE FILE (read this first) ──
 * CLAUDE.md "Vercel Cost Discipline" bans heavy media in /public —
 * that folder is served unoptimised (`images: { unoptimized: true }`)
 * and a phone-shot reel is tens of MB. Prefer an external host and
 * paste its full https URL here:
 *   - Supabase Storage (already in the stack, public bucket)
 *   - Cloudflare R2 (free egress)
 * A local "/videos/meyer-electric/highlight.mp4" path also works if
 * the file is compressed hard first (H.264 mp4, ~1080x1920, target
 * well under 10 MB) — but external is the right default.
 *
 * ── FORMAT ──
 * mp4/H.264 + AAC plays everywhere. `poster` is the first-frame
 * image (jpg/webp, same 9:16 ratio) — without it the frame is black
 * until the visitor presses play, which looks broken.
 */
const HIGHLIGHT_FILM: {
  src: string;
  poster: string;
  /** Muted autoplay + loop, reel-style. false = click to play. */
  autoPlay: boolean;
  eyebrow: string;
  heading: string;
  headingAccent: string;
  body: string;
} = {
  // Shot by Kyle's social-media contractor, already branded with the
  // on-screen title card + @meyerelectric360 watermark. Source was a
  // 9.2 MB HEVC .mov — HEVC does NOT decode in Chrome on Windows or in
  // Firefox, so it was transcoded to H.264/yuv420p mp4 (3.3 MB) with
  // +faststart. ANY future clip must get the same treatment; dropping
  // a raw iPhone .mov in here plays fine on Ben's phone and renders a
  // black box for most of Kyle's visitors.
  src: "/videos/meyer-electric/highlight.mp4",
  poster: "/videos/meyer-electric/highlight-poster.jpg",
  autoPlay: true,
  eyebrow: "On The Job",
  heading: "Watch a real job,",
  headingAccent: "start to finish",
  // Describes THIS footage (an EV charger circuit + outlet install).
  // If the clip is swapped for a different job, update this line —
  // don't let the copy promise work the video doesn't show.
  body:
    "No stock footage, no actors. This is a Meyer crew running an EV charger circuit and outlet install on the Peninsula — the same crew that shows up at your place.",
};

const PHOTOS = {
  hero: "/images/meyer-electric/hero-powerwall-storm.jpg",
  about: "/images/meyer-electric/about-twilight-home.jpg",
  powerwall: "/images/meyer-electric/gallery-aerial-solar.jpg",
  generator: "/images/meyer-electric/generator-install.jpg",
  underground: "/images/meyer-electric/gallery-tesla-charger.jpg",
  electrical: "/images/meyer-electric/about-twilight-home.jpg",
  // NOTE: team-crew-panel.jpg + team-award-2022.jpg are still on disk
  // at /public/images/meyer-electric/ — preserved per Ben's revert
  // 2026-05-06 in case he wants them back. Re-add by re-importing
  // the keys here AND restoring the Award section + Why-Us crew
  // photo block from git history (commit 699c045).
} as const;

/* ───────────────────────── COLORS ───────────────────────── */
// Yellow-on-black per Ben 2026-05-06 (matches the Tesla Powerwall
// installer template he sourced). Pure near-black BG with bright
// yellow lightning accent. Subtle warm tint on the alt panel so the
// page doesn't feel monolithic.
const BG = "#0a0a0a";
const BG_ALT = "#111111";
const BG_PANEL = "#161614";
const ACCENT = "#facc15";        // primary yellow — buttons, headlines, accent
const ACCENT_DARK = "#eab308";   // darker yellow — gradient end on yellow-only fades
const ACCENT_DIM = "rgba(250, 204, 21, 0.18)";
// Orange secondary — augments the yellow, never replaces it. Used for:
// "ember" gradients (buttons + badges), bolt-glow halo outer ring,
// energy-orb variation in backgrounds, hero-CTA hover end-color.
const ACCENT_ORANGE = "#f97316"; // orange-500 — hot ember
const ACCENT_AMBER = "#fb923c";  // orange-400 — softer ember tone
const ACCENT_ORANGE_DIM = "rgba(249, 115, 22, 0.16)";
// Reusable yellow→orange gradient strings.
const FIRE_GRAD = `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_ORANGE} 100%)`;
const FIRE_GRAD_RADIAL = `radial-gradient(circle, ${ACCENT} 0%, ${ACCENT_ORANGE} 75%)`;
const INK = "#f8fafc";
const INK_SOFT = "rgba(255, 255, 255, 0.78)";
const INK_DIM = "rgba(255, 255, 255, 0.55)";

const FONT_HEAD = "'Space Grotesk', sans-serif";
const FONT_BODY = "'Inter', sans-serif";

/* ───────────────────────── ANIMATION ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 22 };
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
    <div className={`max-w-3xl ${alignClass} mb-8 sm:mb-10`}>
      {eyebrow && (
        <div
          className="inline-flex items-center gap-3 text-[11px] tracking-[0.28em] uppercase font-semibold mb-5"
          style={{ color: ACCENT, fontFamily: FONT_HEAD }}
        >
          <span className="inline-block w-8 h-px" style={{ background: ACCENT }} />
          {eyebrow}
          <span className="inline-block w-8 h-px" style={{ background: ACCENT }} />
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
            ...(align === "center" ? { marginLeft: "auto", marginRight: "auto" } : {}),
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
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
          background: "rgba(250, 204, 21, 0.10)",
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
  description,
  image,
  imageAlt,
  href,
  className = "",
  badge,
  visual,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  /** Real photo. Omit when passing `visual` instead. */
  image?: string;
  imageAlt?: string;
  href: string;
  /** Grid-span classes so the 5-card grid lays out cleanly. */
  className?: string;
  /** Small pill in the top-right of the media area (e.g. "New"). */
  badge?: string;
  /**
   * Branded SVG treatment rendered INSTEAD of a photo. Meyer only has
   * 5 unique real photos and CLAUDE.md bans duplicate images across a
   * site, so the Solar card gets the same gradient + grid + animated
   * icon language the Powerwall / Generac deep-dives use rather than a
   * recycled image. Doubles as visual emphasis on the new service.
   */
  visual?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={`group block overflow-hidden rounded-xl border transition-all hover:-translate-y-1 ${className}`}
      style={{
        background: BG_PANEL,
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {visual ? (
          visual
        ) : (
          <img
            src={image}
            alt={imageAlt}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        )}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,10,10,0) 40%, rgba(10,10,10,0.85) 100%)",
          }}
        />
        {badge && (
          <span
            className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] text-black"
            style={{ background: FIRE_GRAD, fontFamily: FONT_HEAD }}
          >
            {badge}
          </span>
        )}
        <span
          className="absolute bottom-4 left-4 flex items-center justify-center w-12 h-12 rounded-full shadow-lg"
          style={{
            background: ACCENT,
            color: "#0a0a0a",
            boxShadow: "0 4px 14px rgba(250, 204, 21, 0.45)",
          }}
        >
          {icon}
        </span>
      </div>
      <div className="p-6 sm:p-7">
        <h3
          className="text-[20px] sm:text-[22px] font-bold text-white tracking-tight mb-2 leading-snug"
          style={{ fontFamily: FONT_HEAD }}
        >
          {title}
        </h3>
        <p
          className="text-[14px] sm:text-[15px] leading-relaxed"
          style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
        >
          {description}
        </p>
        <div
          className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider transition-colors"
          style={{ color: ACCENT, fontFamily: FONT_HEAD }}
        >
          Learn more
          <ArrowRight size={13} weight="bold" />
        </div>
      </div>
    </a>
  );
}

/* ───────────────────────── QUIZ DATA ───────────────────────── */
// "What's your power problem?" — 4 expandable cards. Each maps a real
// SMB pain point to one of Meyer's actual services + drives to either
// a section anchor or the contact form. Click → reveals recommendation
// + targeted CTA. Highest-intent qualifier on the page.
type QuizOption = {
  label: string;
  icon: React.ReactNode;
  rec: string;
  ctaHref: string;
  ctaText: string;
  color: string;
};

/* ───────────────────────── COMPARISON DATA ───────────────────────── */
// 8-row "Meyer Electric vs the average electrician" table. Each row
// leans into a real Meyer differentiator: Tesla cert, Generac cert,
// upfront pricing, 15+ yr local, owner-operated, peninsula-wide.
const COMPARISON_ROWS: Array<{ label: string; meyer: string; avg: string }> = [
  { label: "Tesla Powerwall Certified Installer", meyer: "yes", avg: "Sometimes" },
  { label: "Generac Certified Installer", meyer: "yes", avg: "Rarely" },
  { label: "Solar, battery storage & generators under one license", meyer: "yes", avg: "Pick one" },
  { label: "Licensed, bonded & insured", meyer: "yes", avg: "Usually" },
  { label: "15+ years on the Olympic Peninsula", meyer: "yes", avg: "Varies" },
  { label: "Upfront pricing throughout any project", meyer: "yes", avg: "Time + materials" },
  { label: "Same-day estimates", meyer: "yes", avg: "3-5 days" },
  { label: "Owner-operated, code-first crew", meyer: "yes", avg: "Subcontracted" },
  { label: "Service across all 10 Peninsula cities", meyer: "yes", avg: "Sequim only" },
];

/* ───────────────────────── PAGE ───────────────────────── */

export default function MeyerElectricPage() {
  const [quizActive, setQuizActive] = useState<number | null>(null);

  const QUIZ_OPTIONS: QuizOption[] = [
    {
      label: "Power outages keep knocking us out",
      icon: <Lightning size={24} weight="fill" />,
      rec:
        "You want a Powerwall + Generac combo. Powerwall handles the short blips automatically — you'll never notice. Generac kicks on for the long ones, sized to your whole home.",
      ctaHref: "#contact",
      ctaText: "Get a Quote",
      color: ACCENT,
    },
    {
      label: "I want solar panels",
      icon: <Sun size={24} weight="fill" />,
      rec:
        "We install solar panels — and because we're a licensed electrical contractor first, the panel and breaker work behind them is ours too. Add a Tesla Powerwall and you're still running on what you generated once the sun goes down. One crew, one call, roof to breaker.",
      ctaHref: "#solar",
      ctaText: "See Solar Details",
      color: ACCENT_AMBER,
    },
    {
      label: "Need a backup generator",
      icon: <Plug size={24} weight="fill" />,
      rec:
        "Generac standby. Sized to your real load (not oversold), fueled by propane or natural gas, tested weekly without you lifting a finger. 5-year limited warranty from Generac (manufacturer).",
      ctaHref: "#generators",
      ctaText: "See Generator Details",
      color: ACCENT_ORANGE,
    },
    {
      label: "Service upgrade or panel issue",
      icon: <Wrench size={24} weight="fill" />,
      rec:
        "Panel replacements, service upgrades, sub-panels, EV chargers, troubleshooting. Code-compliant work, upfront pricing throughout any project.",
      ctaHref: BUSINESS.phoneHref,
      ctaText: `Call ${BUSINESS.phoneDisplay}`,
      color: ACCENT,
    },
  ];

  return (
    <MotionConfig
      // Force animations on regardless of OS accessibility prefs. iOS
      // ships with `prefers-reduced-motion: reduce` enabled by default
      // for some users, which silences every framer-motion `initial`
      // animation across this page (hero fade-in, section reveals, the
      // Powerwall + Generac diagram orchestrations). For a marketing
      // showcase this is the right trade — none of these animations
      // gate critical action; they're decorative branded motion. Set
      // here so any future <motion.*> added to the page picks it up.
      reducedMotion="never"
    >
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

      {/* ────────────────────────── HERO ────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: BG }}
      >
        {/* Background image — Tesla Powerwall on stormy night house. */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={PHOTOS.hero}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Heavy left-side gradient so the hero text reads on any
              viewport, plus a top-down vignette for nav legibility. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.82) 38%, rgba(10,10,10,0.45) 65%, rgba(10,10,10,0.25) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0) 28%, rgba(10,10,10,0) 70%, rgba(10,10,10,0.45) 100%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-10 sm:py-14 lg:py-20">
          <div className="max-w-2xl">
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] mb-5"
              style={{
                background:
                  "linear-gradient(90deg, rgba(250, 204, 21, 0.12) 0%, rgba(249, 115, 22, 0.10) 100%)",
                border: `1px solid ${ACCENT_DIM}`,
                color: ACCENT,
                fontFamily: FONT_HEAD,
              }}
            >
              <Lightning
                size={13}
                weight="fill"
                style={{ color: ACCENT_AMBER }}
              />
              Tesla Powerwall Certified Installer
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.05 }}
              className="text-[44px] sm:text-[64px] lg:text-[80px] font-bold leading-[0.98] tracking-tight text-white"
              style={{ fontFamily: FONT_HEAD }}
            >
              RELIABLE POWER.
              <br />
              <span style={{ color: ACCENT }}>NO COMPROMISES.</span>
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
              Power your home. Protect what matters. {BUSINESS.yearsInBusiness}+
              years installing Tesla Powerwall, Generac generators, and rock-solid
              electrical work across the Olympic Peninsula.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.25 }}
              className="mt-6 flex flex-wrap gap-x-6 gap-y-3"
            >
              <HeroPill icon={<Shield size={16} weight="fill" />} label="Whole Home Backup" />
              <HeroPill icon={<SpeakerHigh size={16} weight="fill" />} label="Silent" />
              <HeroPill icon={<WifiHigh size={16} weight="fill" />} label="Monitor From Anywhere" />
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.35 }}
              className="mt-7 flex flex-col sm:flex-row gap-3"
            >
              <a
                href="#powerwall"
                className="inline-flex items-center justify-center gap-2 px-7 h-14 rounded-md font-bold uppercase tracking-wide text-[14px] text-black transition-all hover:brightness-110 active:scale-[0.97] shadow-[0_4px_24px_rgba(249,115,22,0.45)]"
                style={{ background: FIRE_GRAD, fontFamily: FONT_HEAD }}
              >
                Learn About Powerwall
                <ArrowRight size={16} weight="bold" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-7 h-14 rounded-md font-bold uppercase tracking-wide text-[14px] text-white border-2 transition-all hover:bg-white/[0.06] active:scale-[0.97]"
                style={{ borderColor: "rgba(255, 255, 255, 0.2)", fontFamily: FONT_HEAD }}
              >
                Request a Consultation
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ────────────────────── TRUST STRIP ────────────────────── */}
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
              icon={<Lightning size={22} weight="fill" />}
              label="Tesla Powerwall"
              sublabel="Certified Installer"
            />
            <TrustBadge
              icon={<Plug size={22} weight="fill" />}
              label="Generac"
              sublabel="Certified Installer"
            />
            <TrustBadge
              icon={<ShieldCheck size={22} weight="fill" />}
              label="Licensed · Bonded · Insured"
              sublabel={`License ${BUSINESS.license}`}
            />
          </div>
        </div>
      </section>

      {/* ────────────────────── AWARDS STRIP ────────────────────── */}
      {/* Voted #1 Electrician in Clallam County — 2020, 2022, 2024, 2025.
          Kyle's office sent confirmation 2026-05-12 (4 awards across 6
          years). Position right under the cert badges so the "certified
          + voted #1" combo lands as one trust beat before the
          emergency-response urgency strip. */}
      <section
        className="border-b"
        style={{
          background: BG,
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-7 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full shrink-0"
                style={{
                  background: "rgba(249, 115, 22, 0.15)",
                  color: ACCENT,
                }}
              >
                <Trophy size={24} weight="fill" />
              </div>
              <div className="leading-tight">
                <div
                  className="text-[10px] uppercase tracking-[0.2em] font-bold"
                  style={{ color: ACCENT, fontFamily: FONT_HEAD }}
                >
                  Best of the Peninsula
                </div>
                <div
                  className="text-[15px] sm:text-[16px] font-bold text-white mt-0.5"
                  style={{ fontFamily: FONT_HEAD }}
                >
                  Voted #1 Electrician — Clallam County
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              {["2020", "2022", "2024", "2025"].map((yr) => (
                <span
                  key={yr}
                  className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[12px] font-bold tracking-wider transition-transform hover:-translate-y-0.5"
                  style={{
                    // Amber→orange diagonal gradient matches the FIRE_GRAD
                    // language used in the page's CTAs, so the badges read
                    // as part of the brand system instead of decoration.
                    background:
                      "linear-gradient(135deg, rgba(251, 191, 36, 0.18) 0%, rgba(249, 115, 22, 0.22) 100%)",
                    // Slightly inset highlight (top) + warm border for the
                    // medal-like "stamped metal" feel.
                    border: "1px solid rgba(249, 115, 22, 0.55)",
                    boxShadow:
                      "0 1px 0 rgba(255, 200, 120, 0.18) inset, 0 4px 12px rgba(249, 115, 22, 0.18)",
                    color: ACCENT_AMBER,
                    fontFamily: FONT_HEAD,
                  }}
                  aria-label={`Voted #1 Electrician — Clallam County — ${yr}`}
                >
                  <Star
                    size={13}
                    weight="fill"
                    style={{
                      color: ACCENT_AMBER,
                      filter: "drop-shadow(0 0 4px rgba(251, 191, 36, 0.6))",
                    }}
                  />
                  {yr}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────── EMERGENCY RESPONSE STRIP ────────────────────── */}
      {/* Sits between trust strip + services. Targets the high-intent
          visitor type ("freezer warming, no power, generator down").
          Pulsing yellow dot for urgency without breaking the brand
          palette (red would clash with yellow/orange). */}
      <section
        className="border-b"
        style={{
          background:
            "linear-gradient(90deg, rgba(250, 204, 21, 0.08) 0%, rgba(249, 115, 22, 0.05) 100%)",
          borderTopColor: "rgba(255, 255, 255, 0.04)",
          borderBottomColor: "rgba(255, 255, 255, 0.06)",
          borderTopWidth: 1,
        }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-3.5 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 text-center sm:text-left">
            {/* Pulsing dot */}
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className="me-emrg-pulse absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: ACCENT_ORANGE }}
                />
                <span
                  className="relative inline-flex h-2.5 w-2.5 rounded-full"
                  style={{
                    background: ACCENT,
                    boxShadow: `0 0 10px ${ACCENT}`,
                  }}
                />
              </span>
              <span
                className="text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.18em]"
                style={{ color: ACCENT, fontFamily: FONT_HEAD }}
              >
                No power? Generator down?
              </span>
            </div>

            <span
              className="hidden sm:inline-block text-[12px] uppercase tracking-[0.14em] text-white/60 font-medium"
              style={{ fontFamily: FONT_HEAD }}
            >
              Same-day service across the Olympic Peninsula
            </span>

            <a
              href={BUSINESS.phoneHref}
              className="inline-flex items-center gap-2 px-4 h-9 rounded-md font-bold uppercase tracking-wide text-[12px] text-black transition-all hover:brightness-110 active:scale-95"
              style={{ background: FIRE_GRAD, fontFamily: FONT_HEAD }}
            >
              <Phone size={13} weight="fill" />
              {BUSINESS.phoneDisplay}
            </a>
          </div>
        </div>

        <style jsx>{`
          .me-emrg-pulse {
            animation: meEmrgPulse 1.6s ease-out infinite;
          }
          @keyframes meEmrgPulse {
            0%   { transform: scale(1);   opacity: 0.8; }
            100% { transform: scale(2.6); opacity: 0; }
          }
          @media (prefers-reduced-motion: reduce) {
            .me-emrg-pulse { animation: none; opacity: 0.4; }
          }
        `}</style>
      </section>

      {/* ────────────────────── SERVICES ────────────────────── */}
      <section
        id="services"
        className="py-14 sm:py-16 lg:py-20"
        style={{ background: BG }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="What We Do"
            title="Complete Electrical &"
            highlight="Backup Power Solutions"
            subtitle={`Solar panels, whole-home Tesla Powerwall systems, standby Generac generators, underground power, and code-compliant electrical work — all by one licensed crew serving the Olympic Peninsula since ${BUSINESS.established}.`}
          />

          {/* 5-card grid on a 6-column track: three cards across on the
              first row (span-2 each), two wider cards on the second
              (span-3 each). Keeps the row edges flush instead of
              orphaning a 5th card in a 4-column grid. */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 sm:gap-6">
            <ServiceCard
              className="lg:col-span-2"
              icon={<Lightning size={22} weight="fill" />}
              title="Tesla Powerwall Installation"
              description="Store energy from any source — solar, grid, or generator. Power your home through outages. We're Tesla-certified Powerwall installers: permits, install, and Tesla app setup handled."
              image={PHOTOS.powerwall}
              imageAlt="Tesla Powerwall installed on a modern home"
              href="#powerwall"
            />
            <ServiceCard
              className="lg:col-span-2"
              icon={<Sun size={22} weight="fill" />}
              badge="New"
              title="Solar Panel Installation"
              description="Yes — we install solar panels. Licensed electrical contractor first, so the array and every bit of wiring behind it come from the same crew. Pair it with a Powerwall and you keep using what you generate after dark."
              visual={<SolarCardVisual />}
              href="#solar"
            />
            <ServiceCard
              className="lg:col-span-2"
              icon={<Plug size={22} weight="fill" />}
              title="Generators & Backup Power"
              description="Generac standby generators that kick on automatically when the grid drops. Sized to your home. Fueled by propane or natural gas. Certified installer."
              image={PHOTOS.generator}
              imageAlt="Generac automatic transfer switch and electrical panel installation"
              href="#generators"
            />
            <ServiceCard
              className="lg:col-span-3"
              icon={<Wrench size={22} weight="fill" />}
              title="Underground Power & In-House Excavation"
              description="We trench it ourselves with our Kubota U27 excavator — no waiting on a separate excavation contractor. Underground power runs conduit-correct, depth-compliant, built to last decades."
              image={PHOTOS.underground}
              imageAlt="In-house excavation work for underground electrical service"
              href="#contact"
            />
            <ServiceCard
              className="md:col-span-2 lg:col-span-3"
              icon={<Buildings size={22} weight="fill" />}
              title="Full-Service Electrical"
              description="Panel upgrades, service upgrades, lighting, EV chargers, saunas, hot tubs, heated floors, cook tops, wall ovens, greenhouse / shed / garage wiring, septic, troubleshooting. If it carries current, we can do it."
              image={PHOTOS.electrical}
              imageAlt="Modern home with exterior electrical lighting at twilight"
              href="#contact"
            />
          </div>
        </div>
      </section>

      {/* ────────────────────── SOLAR DEEP-DIVE ──────────────────────
          Added 2026-08-17 per Kyle. Meyer became a solar installer some
          time after the May 2026 build, when the page still said "we
          don't install solar panels" in five places. Every one of those
          disclaimers was reversed in the same pass — page copy, the
          quiz, the Powerwall feature list, the JSON-LD offer catalog,
          and both llms.txt routes.

          SCOPE IS DELIBERATELY GENERAL (locked with Ben 2026-08-17):
          states the capability, drives to a quote, and makes NO claim
          about system design, permitting, utility interconnection, or
          panel brands. Do not add those without Kyle confirming. Also
          intentionally makes NO incentive or tax-credit claim — the
          30% federal residential credit (26 USC 25D) terminated for
          systems placed in service after 2025-12-31, so any dollar
          figure here would be wrong on arrival.

          Placed between Services and Powerwall so the page reads
          generate → store → back up. Uses BG_PANEL rather than the
          usual BG/BG_ALT alternation so it doesn't collide with the
          Powerwall section directly below it. */}
      <section
        id="solar"
        className="py-14 sm:py-16 lg:py-20 relative overflow-hidden"
        style={{ background: BG_PANEL }}
      >
        {/* Warm sun glow — marks this as the new flagship service. */}
        <div
          className="absolute -top-52 -left-40 w-[560px] h-[560px] rounded-full opacity-25 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(251, 146, 60, 0.42) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] mb-4 text-black"
                style={{ background: FIRE_GRAD, fontFamily: FONT_HEAD }}
              >
                <Sun size={13} weight="fill" />
                New Service
              </div>
              <h2
                className="text-[34px] sm:text-[44px] lg:text-[52px] font-bold leading-[1.05] tracking-tight text-white"
                style={{ fontFamily: FONT_HEAD }}
              >
                Yes — we install{" "}
                <span style={{ color: ACCENT }}>solar panels</span>
              </h2>
              <p
                className="mt-4 text-[16px] sm:text-[17px] leading-relaxed"
                style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
              >
                Solar is now part of what we do. And because Meyer
                Electric is a licensed electrical contractor first, the
                array and every bit of wiring behind it come from the
                same crew — no coordinating between a solar company and
                an electrician, no finger-pointing when something needs
                a second look.
              </p>

              <ul className="mt-6 space-y-3">
                <PowerwallFeature
                  title="Solar, Storage &amp; Backup — One Crew"
                  body="Most homeowners end up juggling a solar company, an electrician, and a generator installer. We're all three. One point of contact from the roof to the breaker panel."
                />
                <PowerwallFeature
                  title="Better Paired With a Powerwall"
                  body="Panels only make power while the sun's up. Add Tesla Powerwall and the house keeps running on what you generated — through the evening, and through an outage."
                />
                <PowerwallFeature
                  title="Licensed, Bonded &amp; Insured"
                  body={`License ${BUSINESS.license}. The same code-first crew that's been wiring the Olympic Peninsula since ${BUSINESS.established} — voted Clallam County's #1 electrician four times.`}
                />
                <PowerwallFeature
                  title="A Real Conversation, Not a Sales Pitch"
                  body="Call us, we'll come look at your property, and you'll get a straight answer about whether solar makes sense for your roof and your power bill. Upfront pricing, no pressure."
                />
              </ul>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 px-7 h-13 py-3.5 rounded-md font-bold uppercase tracking-wide text-[13px] text-black transition-all hover:brightness-110 active:scale-[0.97]"
                  style={{ background: FIRE_GRAD, fontFamily: FONT_HEAD }}
                >
                  Get a Solar Quote
                  <ArrowRight size={14} weight="bold" />
                </a>
                <a
                  href={BUSINESS.phoneHref}
                  className="inline-flex items-center justify-center gap-2 px-7 h-13 py-3.5 rounded-md font-bold uppercase tracking-wide text-[13px] text-white border-2 transition-all hover:bg-white/[0.06]"
                  style={{
                    borderColor: "rgba(255,255,255,0.18)",
                    fontFamily: FONT_HEAD,
                  }}
                >
                  <Phone size={14} weight="fill" />
                  {BUSINESS.phoneDisplay}
                </a>
              </div>
            </div>

            {/* Visual side: animated sun → array → home diagram. Icon-led
                for the same reason the Powerwall and Generac diagrams
                are — the 5 unique real photos are spoken for by the
                hero + services grid, and CLAUDE.md bans duplicates. */}
            <div className="order-1 lg:order-2 relative">
              <div
                className="relative aspect-[4/5] sm:aspect-[5/6] rounded-2xl overflow-hidden flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 50% 22%, rgba(251, 146, 60, 0.22) 0%, rgba(10, 10, 10, 0) 62%), linear-gradient(180deg, ${BG_ALT} 0%, ${BG} 100%)`,
                  border: `1px solid rgba(250, 204, 21, 0.18)`,
                  boxShadow: "0 24px 70px rgba(0, 0, 0, 0.6)",
                }}
              >
                {/* Subtle grid pattern — matches the Powerwall panel. */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-[0.06]"
                  aria-hidden="true"
                >
                  <defs>
                    <pattern
                      id="meyer-sol-grid"
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
                  <rect width="100%" height="100%" fill="url(#meyer-sol-grid)" />
                </svg>

                <div className="relative flex flex-col items-center gap-5 px-8 w-full">
                  {/* Sun — slow-rotating ray halo behind a breathing
                      core, with two expanding warmth rings. */}
                  <div className="relative flex items-center justify-center h-[104px] w-[104px]">
                    <span
                      className="me-sol-ring me-sol-ring-1 absolute inset-0 rounded-full"
                      style={{ border: `1.5px solid ${ACCENT_AMBER}` }}
                    />
                    <span
                      className="me-sol-ring me-sol-ring-2 absolute inset-0 rounded-full"
                      style={{ border: `1.5px solid ${ACCENT}` }}
                    />
                    <svg
                      className="me-sol-rays absolute"
                      width="104"
                      height="104"
                      viewBox="0 0 104 104"
                      aria-hidden="true"
                    >
                      {Array.from({ length: 12 }).map((_, i) => (
                        <rect
                          key={i}
                          x="51"
                          y="4"
                          width="2"
                          height="13"
                          rx="1"
                          fill={i % 2 === 0 ? ACCENT : ACCENT_AMBER}
                          transform={`rotate(${i * 30} 52 52)`}
                        />
                      ))}
                    </svg>
                    <span
                      className="me-sol-core flex items-center justify-center w-[58px] h-[58px] rounded-full"
                      style={{
                        background: FIRE_GRAD_RADIAL,
                        boxShadow: `0 0 34px ${ACCENT_ORANGE_DIM}, 0 0 16px rgba(250,204,21,0.55)`,
                      }}
                    >
                      <Sun size={30} weight="fill" color="#0a0a0a" />
                    </span>
                  </div>

                  {/* Sunlight falling onto the array. */}
                  <div className="flex items-end gap-2 h-6">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`me-sol-beam me-sol-beam-${i + 1} block w-px h-6`}
                        style={{
                          background: `linear-gradient(180deg, ${ACCENT} 0%, rgba(250,204,21,0) 100%)`,
                        }}
                      />
                    ))}
                  </div>

                  {/* The array — 8 cells with a shimmer sweeping across,
                      tilted so it reads as a roof-mounted plane. */}
                  <div
                    className="relative w-full max-w-[236px]"
                    style={{ perspective: "620px" }}
                  >
                    <div
                      className="me-sol-array relative grid grid-cols-4 gap-[3px] p-[5px] rounded-[3px]"
                      style={{
                        transform: "rotateX(34deg)",
                        background: "rgba(148, 163, 184, 0.30)",
                        boxShadow: "0 16px 30px rgba(0,0,0,0.55)",
                      }}
                    >
                      {Array.from({ length: 8 }).map((_, i) => (
                        <span
                          key={i}
                          className="block aspect-[4/3] rounded-[1px]"
                          style={{
                            background:
                              "linear-gradient(150deg, #1e293b 0%, #0f172a 55%, #1e293b 100%)",
                            boxShadow: "inset 0 0 0 0.5px rgba(148,163,184,0.35)",
                          }}
                        />
                      ))}
                      <span className="me-sol-shimmer absolute inset-0 pointer-events-none rounded-[3px]" />
                    </div>
                  </div>

                  {/* Generated power flowing down to the house. */}
                  <div className="relative h-11 w-px" style={{ background: ACCENT_DIM }}>
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`me-sol-dot me-sol-dot-${i + 1} absolute left-1/2 w-[5px] h-[5px] rounded-full -ml-[2px]`}
                        style={{
                          background: ACCENT,
                          boxShadow: `0 0 8px ${ACCENT}`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Destination: the house, still lit. */}
                  <div
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg"
                    style={{
                      background: "rgba(250, 204, 21, 0.09)",
                      border: `1px solid ${ACCENT_DIM}`,
                    }}
                  >
                    {/* The animated class must sit on a host element,
                        not on the Phosphor component — styled-jsx only
                        adds its scoping class to real DOM tags, so a
                        className passed to <House> never matches the
                        scoped rule and the animation silently dies. */}
                    <span className="me-sol-house inline-flex">
                      <House size={20} weight="fill" style={{ color: ACCENT }} />
                    </span>
                    <span
                      className="text-[11px] font-bold uppercase tracking-[0.16em] text-white"
                      style={{ fontFamily: FONT_HEAD }}
                    >
                      Your Power, Your Roof
                    </span>
                  </div>
                </div>

                <style jsx>{`
                  /* Warmth rings expanding off the sun */
                  .me-sol-ring {
                    animation: meSolRing 3.6s ease-out infinite;
                    opacity: 0;
                  }
                  .me-sol-ring-1 { animation-delay: 0s; }
                  .me-sol-ring-2 { animation-delay: 1.8s; }
                  @keyframes meSolRing {
                    0%   { transform: scale(0.62); opacity: 0; }
                    22%  { opacity: 0.7; }
                    100% { transform: scale(1.55); opacity: 0; }
                  }

                  /* Ray halo turns slowly behind the core */
                  .me-sol-rays {
                    animation: meSolSpin 26s linear infinite;
                    transform-origin: 50% 50%;
                  }
                  @keyframes meSolSpin {
                    to { transform: rotate(360deg); }
                  }

                  /* Core breathes */
                  .me-sol-core {
                    animation: meSolCore 3.2s ease-in-out infinite;
                  }
                  @keyframes meSolCore {
                    0%, 100% { transform: scale(1); }
                    50%      { transform: scale(1.07); }
                  }

                  /* Sunlight striking the panels, staggered */
                  .me-sol-beam {
                    animation: meSolBeam 2.6s ease-in-out infinite;
                    transform-origin: top center;
                  }
                  .me-sol-beam-1 { animation-delay: 0s; }
                  .me-sol-beam-2 { animation-delay: 0.32s; }
                  .me-sol-beam-3 { animation-delay: 0.64s; }
                  @keyframes meSolBeam {
                    0%, 100% { opacity: 0.2; transform: scaleY(0.55); }
                    50%      { opacity: 1;   transform: scaleY(1); }
                  }

                  /* Array settles into its tilt, then holds */
                  .me-sol-array {
                    animation: meSolArray 7s ease-in-out infinite;
                  }
                  @keyframes meSolArray {
                    0%, 100% { transform: rotateX(34deg) translateY(0); }
                    50%      { transform: rotateX(31deg) translateY(-3px); }
                  }

                  /* Light sweeping across the cell faces */
                  .me-sol-shimmer {
                    background: linear-gradient(
                      115deg,
                      rgba(250, 204, 21, 0) 38%,
                      rgba(250, 204, 21, 0.42) 50%,
                      rgba(250, 204, 21, 0) 62%
                    );
                    background-size: 260% 100%;
                    animation: meSolShimmer 4.4s ease-in-out infinite;
                  }
                  @keyframes meSolShimmer {
                    0%       { background-position: 130% 0; }
                    55%, 100% { background-position: -130% 0; }
                  }

                  /* Generated power travelling down to the house */
                  .me-sol-dot {
                    animation: meSolDot 2.4s linear infinite;
                    opacity: 0;
                  }
                  .me-sol-dot-1 { animation-delay: 0s; }
                  .me-sol-dot-2 { animation-delay: 0.8s; }
                  .me-sol-dot-3 { animation-delay: 1.6s; }
                  @keyframes meSolDot {
                    0%   { top: 0;    opacity: 0; }
                    15%  { opacity: 1; }
                    85%  { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                  }

                  /* House glows as the power lands */
                  .me-sol-house {
                    animation: meSolHouse 2.4s ease-in-out infinite;
                  }
                  @keyframes meSolHouse {
                    0%, 100% { filter: drop-shadow(0 0 0 rgba(250,204,21,0)); }
                    50%      { filter: drop-shadow(0 0 7px rgba(250,204,21,0.85)); }
                  }
                `}</style>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────── POWERWALL DEEP-DIVE ────────────────────── */}
      <section
        id="powerwall"
        className="py-14 sm:py-16 lg:py-20"
        style={{ background: BG_ALT }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] mb-4"
                style={{
                  background: ACCENT_DIM,
                  color: ACCENT,
                  fontFamily: FONT_HEAD,
                }}
              >
                <Lightning size={13} weight="fill" />
                Tesla Powerwall Certified
              </div>
              <h2
                className="text-[34px] sm:text-[44px] lg:text-[52px] font-bold leading-[1.05] tracking-tight text-white"
                style={{ fontFamily: FONT_HEAD }}
              >
                Power your home with{" "}
                <span style={{ color: ACCENT }}>Tesla Powerwall</span>
              </h2>
              <p
                className="mt-4 text-[16px] sm:text-[17px] leading-relaxed"
                style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
              >
                Tesla Powerwall is a rechargeable home battery system that stores
                energy from solar or the grid. Power your home day or night,
                ride out outages, and monitor everything from your phone.
              </p>

              <ul className="mt-6 space-y-3">
                <PowerwallFeature
                  title="Whole Home Backup"
                  body="Keep lights, refrigerator, HVAC, and outlets running automatically when the grid goes down. No flashlights. No spoiled food."
                />
                <PowerwallFeature
                  title="Pairs with Solar"
                  body="Powerwall stores what your panels generate so you can use it after dark. Already have solar? We'll tie it in. Don't yet? We install the panels too — same crew, same call."
                />
                <PowerwallFeature
                  title="Silent &amp; Stackable"
                  body="No fuel. No fumes. No noise. Stack multiple Powerwalls for bigger homes or longer outage coverage."
                />
                <PowerwallFeature
                  title="App Control"
                  body="Monitor energy use, battery state, and grid status from anywhere. Tesla app handles it all."
                />
              </ul>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 px-7 h-13 py-3.5 rounded-md font-bold uppercase tracking-wide text-[13px] text-black transition-all hover:brightness-110 active:scale-[0.97]"
                  style={{ background: ACCENT, fontFamily: FONT_HEAD }}
                >
                  Get a Powerwall Quote
                  <ArrowRight size={14} weight="bold" />
                </a>
                <a
                  href={BUSINESS.phoneHref}
                  className="inline-flex items-center justify-center gap-2 px-7 h-13 py-3.5 rounded-md font-bold uppercase tracking-wide text-[13px] text-white border-2 transition-all hover:bg-white/[0.06]"
                  style={{
                    borderColor: "rgba(255,255,255,0.18)",
                    fontFamily: FONT_HEAD,
                  }}
                >
                  <Phone size={14} weight="fill" />
                  {BUSINESS.phoneDisplay}
                </a>
              </div>
            </div>

            {/* Visual side: stylized Powerwall + lightning storm SVG.
                Icon-led to keep our 5 unique real photos for the
                services grid + hero + why-us — no duplicates per
                CLAUDE.md Rule 1.5. */}
            <div className="order-1 lg:order-2 relative">
              <div
                className="relative aspect-[4/5] sm:aspect-[5/6] rounded-2xl overflow-hidden flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 50% 30%, rgba(250, 204, 21, 0.18) 0%, rgba(10, 10, 10, 0) 60%), linear-gradient(180deg, ${BG_PANEL} 0%, ${BG} 100%)`,
                  border: `1px solid rgba(250, 204, 21, 0.18)`,
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
                      id="meyer-pw-grid"
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
                  <rect width="100%" height="100%" fill="url(#meyer-pw-grid)" />
                </svg>

                {/* Stylized Powerwall illustration — animated:
                    - Lightning bolts strike one at a time (real-storm rhythm)
                    - Energy bar inside the Powerwall fills 0→100% then resets
                    - Three concentric rings expand outward from the bolt
                      icon (ripple effect — staggered delays)
                    - Status LED breathes
                    - The whole Powerwall box subtly levitates
                    All keyframes prefixed `mePw` so they don't collide
                    with Generac diagram animations below. */}
                <div className="relative flex flex-col items-center gap-7 px-8">
                  {/* Lightning storm cluster above — each bolt strikes
                      individually with stagger so it reads like a real
                      storm rolling through. */}
                  <div className="flex items-end gap-2">
                    <svg
                      width="36"
                      height="50"
                      viewBox="0 0 24 32"
                      fill={ACCENT}
                      className="me-pw-bolt me-pw-bolt-1"
                    >
                      <path d="M13 0 4 18h7l-1 14 9-22h-7l1-10z" />
                    </svg>
                    <svg
                      width="56"
                      height="76"
                      viewBox="0 0 24 32"
                      fill={ACCENT_AMBER}
                      className="me-pw-bolt me-pw-bolt-2"
                    >
                      <path d="M13 0 4 18h7l-1 14 9-22h-7l1-10z" />
                    </svg>
                    <svg
                      width="30"
                      height="42"
                      viewBox="0 0 24 32"
                      fill={ACCENT}
                      className="me-pw-bolt me-pw-bolt-3"
                    >
                      <path d="M13 0 4 18h7l-1 14 9-22h-7l1-10z" />
                    </svg>
                  </div>

                  {/* "Powerwall" stylized rectangle — gently levitates */}
                  <div
                    className="me-pw-box relative w-44 h-72 rounded-2xl overflow-hidden flex flex-col items-center justify-between p-5"
                    style={{
                      background:
                        "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
                      boxShadow:
                        "0 24px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    {/* Charge-level bar — vertical, fills bottom-to-top
                        on the left edge, 0→100% then resets. Live
                        "charging" indicator. */}
                    <div className="absolute left-0 top-0 bottom-0 w-[5px] flex flex-col-reverse">
                      <div
                        className="me-pw-charge w-full origin-bottom"
                        style={{
                          background: `linear-gradient(0deg, ${ACCENT} 0%, ${ACCENT_AMBER} 50%, ${ACCENT_ORANGE} 100%)`,
                          boxShadow: `0 0 8px ${ACCENT}`,
                        }}
                      />
                    </div>

                    {/* Tesla T mark (stylized) */}
                    <div className="relative text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 mt-1 z-10">
                      Powerwall
                    </div>

                    {/* Pulsing energy rings — 3 concentric, staggered */}
                    <div className="relative flex items-center justify-center">
                      <div
                        className="me-pw-ring me-pw-ring-1 absolute w-24 h-24 rounded-full"
                        style={{
                          background: `radial-gradient(circle, ${ACCENT}40 0%, transparent 70%)`,
                        }}
                      />
                      <div
                        className="me-pw-ring me-pw-ring-2 absolute w-24 h-24 rounded-full"
                        style={{
                          background: `radial-gradient(circle, ${ACCENT_ORANGE}30 0%, transparent 70%)`,
                        }}
                      />
                      <div
                        className="me-pw-ring me-pw-ring-3 absolute w-24 h-24 rounded-full"
                        style={{
                          background: `radial-gradient(circle, ${ACCENT}30 0%, transparent 70%)`,
                        }}
                      />
                      <div
                        className="me-pw-core relative w-14 h-14 rounded-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_ORANGE} 100%)`,
                          boxShadow: `0 0 28px ${ACCENT_DIM}`,
                        }}
                      >
                        <Lightning size={26} weight="fill" color="#0a0a0a" />
                      </div>
                    </div>

                    {/* Status LED row — breathing green dot */}
                    <div className="flex items-center gap-1.5 mb-1 z-10">
                      <span
                        className="me-pw-led w-1.5 h-1.5 rounded-full bg-emerald-500"
                      />
                      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-600">
                        Charged
                      </span>
                    </div>
                  </div>

                  {/* House silhouette — subtle "powered" pulse */}
                  <svg
                    width="100"
                    height="40"
                    viewBox="0 0 100 40"
                    className="me-pw-house opacity-40"
                    fill={INK_DIM}
                  >
                    <path d="M50 5 L10 28 L10 38 L40 38 L40 22 L60 22 L60 38 L90 38 L90 28 Z" />
                  </svg>
                </div>
              </div>

              {/* Floating cert badge */}
              <div
                className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 px-4 py-3 rounded-xl shadow-xl"
                style={{
                  background: BG,
                  border: `1px solid ${ACCENT}`,
                  fontFamily: FONT_HEAD,
                }}
              >
                <div className="flex items-center gap-2">
                  <Certificate size={20} weight="fill" style={{ color: ACCENT }} />
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-white/55 font-semibold">
                      Tesla
                    </div>
                    <div className="text-[14px] font-bold text-white">
                      Certified Installer
                    </div>
                  </div>
                </div>
              </div>

              <style jsx>{`
                /* Concentric pulsing rings around the bolt icon */
                .me-pw-ring {
                  animation: mePwRing 3s ease-out infinite;
                  opacity: 0;
                }
                .me-pw-ring-1 { animation-delay: 0s; }
                .me-pw-ring-2 { animation-delay: 1s; }
                .me-pw-ring-3 { animation-delay: 2s; }
                @keyframes mePwRing {
                  0%   { transform: scale(0.6); opacity: 0; }
                  20%  { opacity: 0.85; }
                  100% { transform: scale(1.9); opacity: 0; }
                }

                /* Inner core gentle breathing */
                .me-pw-core {
                  animation: mePwCore 2.4s ease-in-out infinite;
                }
                @keyframes mePwCore {
                  0%, 100% { transform: scale(1); }
                  50%      { transform: scale(1.06); }
                }

                /* Lightning bolts — each strikes individually with
                   stagger so the trio reads as a real rolling storm. */
                .me-pw-bolt {
                  filter: drop-shadow(0 0 6px rgba(250, 204, 21, 0.5));
                  animation: mePwStrike 4.5s ease-in-out infinite;
                }
                .me-pw-bolt-1 { animation-delay: 0s; }
                .me-pw-bolt-2 { animation-delay: 1.5s; }
                .me-pw-bolt-3 { animation-delay: 3s; }
                @keyframes mePwStrike {
                  0%, 8%, 18%, 100% { opacity: 0.25; transform: translateY(0) scale(1); }
                  4%                { opacity: 1;   transform: translateY(-2px) scale(1.04); filter: drop-shadow(0 0 12px rgba(250, 204, 21, 0.95)); }
                  6%                { opacity: 0.5; transform: translateY(0) scale(1); }
                  12%               { opacity: 1;   transform: translateY(0) scale(1.02); filter: drop-shadow(0 0 16px rgba(250, 204, 21, 1)); }
                  14%               { opacity: 0.4; transform: translateY(0) scale(1); }
                }

                /* Charge bar — fills bottom→top, then resets */
                .me-pw-charge {
                  animation: mePwCharge 6s ease-in-out infinite;
                  height: 0%;
                }
                @keyframes mePwCharge {
                  0%   { height: 12%;  opacity: 0.7; }
                  85%  { height: 100%; opacity: 1; }
                  92%  { height: 100%; opacity: 1; box-shadow: 0 0 16px ${ACCENT}; }
                  100% { height: 12%;  opacity: 0.7; }
                }

                /* Status LED breathing */
                .me-pw-led {
                  animation: mePwLed 1.6s ease-in-out infinite;
                  box-shadow: 0 0 6px rgba(16, 185, 129, 0.7);
                }
                @keyframes mePwLed {
                  0%, 100% { opacity: 0.55; transform: scale(0.9); }
                  50%      { opacity: 1;    transform: scale(1.2); box-shadow: 0 0 12px rgba(16, 185, 129, 1); }
                }

                /* Whole Powerwall box gently levitates */
                .me-pw-box {
                  animation: mePwLevitate 4s ease-in-out infinite;
                }
                @keyframes mePwLevitate {
                  0%, 100% { transform: translateY(0); }
                  50%      { transform: translateY(-4px); }
                }

                /* House silhouette pulses with the charge cycle */
                .me-pw-house {
                  animation: mePwHousePulse 6s ease-in-out infinite;
                }
                @keyframes mePwHousePulse {
                  0%, 92%, 100% { opacity: 0.35; filter: drop-shadow(0 0 0 rgba(250, 204, 21, 0)); }
                  88%           { opacity: 0.85; filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.6)); }
                }

                @media (prefers-reduced-motion: reduce) {
                  .me-pw-ring,
                  .me-pw-core,
                  .me-pw-bolt,
                  .me-pw-charge,
                  .me-pw-led,
                  .me-pw-box,
                  .me-pw-house {
                    animation: none;
                  }
                  .me-pw-charge { height: 100%; }
                }
              `}</style>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────── GENERATORS ────────────────────── */}
      <section
        id="generators"
        className="py-14 sm:py-16 lg:py-20 relative overflow-hidden"
        style={{ background: BG }}
      >
        {/* Faint yellow energy flourishes — soft radial orbs + scattered
            lightning bolts. Pure decoration, very low opacity so the
            section reads "powered" without competing with the headline.
            All elements are aria-hidden + pointer-events-none so they
            never break interaction or accessibility. */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {/* Soft energy orb top-right */}
          <div
            className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full opacity-[0.18]"
            style={{
              background:
                "radial-gradient(circle, rgba(250, 204, 21, 0.55) 0%, transparent 70%)",
              filter: "blur(8px)",
            }}
          />
          {/* Soft energy orb bottom-left — orange ember instead of
              yellow for color variation across the section. */}
          <div
            className="absolute -bottom-40 -left-32 w-[380px] h-[380px] rounded-full opacity-[0.14]"
            style={{
              background:
                "radial-gradient(circle, rgba(249, 115, 22, 0.55) 0%, transparent 70%)",
              filter: "blur(10px)",
            }}
          />
          {/* Floating lightning bolt accents */}
          <svg
            className="absolute top-[8%] left-[6%] w-12 h-12 sm:w-14 sm:h-14 opacity-[0.08]"
            viewBox="0 0 24 32"
            fill={ACCENT}
          >
            <path d="M13 0 4 18h7l-1 14 9-22h-7l1-10z" />
          </svg>
          <svg
            className="absolute top-[18%] right-[12%] w-8 h-8 sm:w-10 sm:h-10 opacity-[0.08]"
            viewBox="0 0 24 32"
            fill={ACCENT_ORANGE}
            style={{ transform: "rotate(15deg)" }}
          >
            <path d="M13 0 4 18h7l-1 14 9-22h-7l1-10z" />
          </svg>
          <svg
            className="absolute bottom-[20%] right-[6%] w-16 h-16 sm:w-20 sm:h-20 opacity-[0.07]"
            viewBox="0 0 24 32"
            fill={ACCENT}
            style={{ transform: "rotate(-12deg)" }}
          >
            <path d="M13 0 4 18h7l-1 14 9-22h-7l1-10z" />
          </svg>
          <svg
            className="absolute bottom-[12%] left-[18%] w-10 h-10 sm:w-12 sm:h-12 opacity-[0.08]"
            viewBox="0 0 24 32"
            fill={ACCENT_ORANGE}
            style={{ transform: "rotate(8deg)" }}
          >
            <path d="M13 0 4 18h7l-1 14 9-22h-7l1-10z" />
          </svg>
          {/* Small twinkle dots */}
          <div
            className="absolute top-[28%] left-[22%] w-1.5 h-1.5 rounded-full opacity-30"
            style={{ background: ACCENT, boxShadow: `0 0 12px ${ACCENT}` }}
          />
          <div
            className="absolute top-[60%] right-[28%] w-2 h-2 rounded-full opacity-25"
            style={{ background: ACCENT, boxShadow: `0 0 14px ${ACCENT}` }}
          />
          <div
            className="absolute bottom-[35%] left-[8%] w-1 h-1 rounded-full opacity-35"
            style={{ background: ACCENT, boxShadow: `0 0 10px ${ACCENT}` }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Visual side: stylized "Outage → Auto Restore" diagram.
                Icon-led to keep our 5 unique real photos for the
                services grid + hero — no duplicates per CLAUDE.md
                Rule 1.5. Communicates the auto-transfer switch
                concept visually without re-using the panel photo. */}
            <div className="relative order-2 lg:order-1">
              <div
                className="relative aspect-[4/3] rounded-2xl overflow-hidden p-7 sm:p-9 flex flex-col justify-center gap-5"
                style={{
                  background: `radial-gradient(circle at 80% 20%, rgba(250, 204, 21, 0.14) 0%, transparent 60%), linear-gradient(135deg, ${BG_PANEL} 0%, ${BG} 100%)`,
                  border: `1px solid rgba(255, 255, 255, 0.08)`,
                  boxShadow: "0 24px 70px rgba(0, 0, 0, 0.6)",
                }}
              >
                {/* Subtle grid */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-[0.05]"
                  aria-hidden="true"
                >
                  <defs>
                    <pattern
                      id="meyer-gen-grid"
                      width="32"
                      height="32"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 32 0 L 0 0 0 32"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#meyer-gen-grid)" />
                </svg>

                {/* Top: grid status row — Grid box flickers (failing
                    grid), arrow pulses (energy switching paths),
                    Generac box gets a pulsing emerald aura. */}
                <div className="relative flex items-center justify-between gap-4">
                  <div
                    className="me-gen-grid-box flex-1 rounded-lg p-3.5 border"
                    style={{
                      background: "rgba(220, 38, 38, 0.10)",
                      borderColor: "rgba(220, 38, 38, 0.35)",
                    }}
                  >
                    <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-rose-400">
                      Grid
                    </div>
                    <div
                      className="me-gen-offline text-[18px] font-bold text-white mt-0.5"
                      style={{ fontFamily: FONT_HEAD }}
                    >
                      OFFLINE
                    </div>
                  </div>
                  <div
                    className="me-gen-arrow text-2xl relative"
                    style={{ color: ACCENT }}
                    aria-hidden="true"
                  >
                    →
                  </div>
                  <div
                    className="me-gen-running-box flex-1 rounded-lg p-3.5 border"
                    style={{
                      background: "rgba(34, 197, 94, 0.10)",
                      borderColor: "rgba(34, 197, 94, 0.35)",
                    }}
                  >
                    <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-emerald-400">
                      Generac
                    </div>
                    <div
                      className="me-gen-running text-[18px] font-bold text-white mt-0.5"
                      style={{ fontFamily: FONT_HEAD }}
                    >
                      RUNNING
                    </div>
                  </div>
                </div>

                {/* Center: big auto-transfer switch icon — pulsing
                    "powered" glow + the icon gently rotates back-and-
                    forth like a switch flipping. */}
                <div className="relative flex flex-col items-center gap-3 my-2">
                  {/* Outer glow halo (separate element so it doesn't
                      compete with the icon's own transform). */}
                  <div
                    className="me-gen-halo absolute top-0 w-28 h-28 rounded-full"
                    style={{
                      background: `radial-gradient(circle, rgba(250, 204, 21, 0.45) 0%, transparent 70%)`,
                      filter: "blur(8px)",
                      transform: "translateY(-4px)",
                    }}
                  />
                  <div
                    className="me-gen-switch relative w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_ORANGE} 100%)`,
                      boxShadow: `0 0 32px ${ACCENT_DIM}`,
                    }}
                  >
                    <Plug size={40} weight="fill" color="#0a0a0a" />
                  </div>
                  <div
                    className="text-[11px] uppercase tracking-[0.2em] font-bold text-white/70"
                    style={{ fontFamily: FONT_HEAD }}
                  >
                    Auto-Transfer Switch
                  </div>
                </div>

                {/* Bottom: house powered indicator — emerald shimmer
                    sweeps left→right (signaling continuous power
                    flowing into the home). */}
                <div
                  className="me-gen-home relative flex items-center justify-center gap-3 px-5 py-3 rounded-lg overflow-hidden"
                  style={{
                    background: "rgba(34, 197, 94, 0.08)",
                    border: "1px solid rgba(34, 197, 94, 0.25)",
                  }}
                >
                  {/* Shimmer sweep */}
                  <div
                    className="me-gen-shimmer absolute inset-y-0 w-1/3 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.35) 50%, transparent 100%)",
                    }}
                  />
                  {/* The animated class must sit on a host element, not
                      on the Phosphor component. styled-jsx only stamps
                      its `jsx-<hash>` scoping class onto real DOM tags,
                      so a className handed to <House> renders as
                      `me-gen-house-icon` WITHOUT the hash and the scoped
                      rule `.me-gen-house-icon.jsx-<hash>` never matches —
                      the pulse silently never ran. Note the sibling
                      `.me-pw-house` works precisely because it's on a
                      raw <svg>. inline-flex so `transform: scale()` in
                      the keyframes applies; the icon inherits the
                      emerald via currentColor. */}
                  <span className="me-gen-house-icon relative inline-flex text-emerald-400">
                    <House size={18} weight="fill" />
                  </span>
                  <span
                    className="relative text-[12px] uppercase tracking-[0.2em] font-bold text-emerald-400"
                    style={{ fontFamily: FONT_HEAD }}
                  >
                    Home Powered · 8 sec
                  </span>
                </div>
              </div>

              <style jsx>{`
                /* Grid box flickering (real failing-grid feel) */
                .me-gen-grid-box {
                  animation: meGenFlicker 4s ease-in-out infinite;
                }
                @keyframes meGenFlicker {
                  0%, 100% { opacity: 1; }
                  62%, 64%, 68%, 72% { opacity: 0.55; }
                  63%, 67%, 70% { opacity: 1; }
                }
                /* OFFLINE label — same flicker but slightly offset */
                .me-gen-offline {
                  animation: meGenOfflineFlicker 4s ease-in-out infinite;
                  text-shadow: 0 0 8px rgba(220, 38, 38, 0.55);
                }
                @keyframes meGenOfflineFlicker {
                  0%, 100% { opacity: 1; }
                  60%, 64%, 68% { opacity: 0.4; }
                  62%, 66% { opacity: 1; }
                }

                /* Arrow energy pulse — color brightens + slight x-shift
                   showing power flowing from grid → generac side */
                .me-gen-arrow {
                  animation: meGenArrow 2s ease-in-out infinite;
                  filter: drop-shadow(0 0 6px rgba(250, 204, 21, 0.4));
                }
                @keyframes meGenArrow {
                  0%, 100% { opacity: 0.55; transform: translateX(0); filter: drop-shadow(0 0 4px rgba(250, 204, 21, 0.4)); }
                  50%      { opacity: 1;    transform: translateX(2px); filter: drop-shadow(0 0 14px rgba(250, 204, 21, 0.85)); }
                }

                /* Generac RUNNING — emerald box pulses confidently */
                .me-gen-running-box {
                  animation: meGenRunning 2s ease-in-out infinite;
                }
                @keyframes meGenRunning {
                  0%, 100% { box-shadow: 0 0 0 rgba(34, 197, 94, 0); border-color: rgba(34, 197, 94, 0.35); }
                  50%      { box-shadow: 0 0 18px rgba(34, 197, 94, 0.4); border-color: rgba(34, 197, 94, 0.7); }
                }
                .me-gen-running {
                  animation: meGenRunningText 2s ease-in-out infinite;
                }
                @keyframes meGenRunningText {
                  0%, 100% { text-shadow: 0 0 0 rgba(34, 197, 94, 0); }
                  50%      { text-shadow: 0 0 10px rgba(34, 197, 94, 0.7); }
                }

                /* Halo behind the auto-transfer switch — breathes  */
                .me-gen-halo {
                  animation: meGenHalo 2.4s ease-in-out infinite;
                }
                @keyframes meGenHalo {
                  0%, 100% { opacity: 0.55; transform: translateY(-4px) scale(0.92); }
                  50%      { opacity: 1;    transform: translateY(-4px) scale(1.08); }
                }

                /* Switch icon itself — gentle "tick" rotation like a
                   switch flipping back and forth */
                .me-gen-switch {
                  animation: meGenSwitch 4s ease-in-out infinite;
                }
                @keyframes meGenSwitch {
                  0%, 100% { transform: rotate(-2deg); }
                  50%      { transform: rotate(2deg); }
                }

                /* Home Powered shimmer sweep */
                .me-gen-shimmer {
                  animation: meGenShimmer 3.5s ease-in-out infinite;
                  left: -33%;
                }
                @keyframes meGenShimmer {
                  0%   { left: -33%; }
                  100% { left: 100%; }
                }

                /* House icon — subtle scale-in pulse */
                .me-gen-house-icon {
                  animation: meGenHouseIcon 2s ease-in-out infinite;
                  filter: drop-shadow(0 0 0 rgba(34, 197, 94, 0));
                }
                @keyframes meGenHouseIcon {
                  0%, 100% { transform: scale(1);    filter: drop-shadow(0 0 0 rgba(34, 197, 94, 0)); }
                  50%      { transform: scale(1.15); filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.85)); }
                }

                @media (prefers-reduced-motion: reduce) {
                  .me-gen-grid-box,
                  .me-gen-offline,
                  .me-gen-arrow,
                  .me-gen-running-box,
                  .me-gen-running,
                  .me-gen-halo,
                  .me-gen-switch,
                  .me-gen-shimmer,
                  .me-gen-house-icon {
                    animation: none;
                  }
                }
              `}</style>
            </div>
            <div className="order-1 lg:order-2">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] mb-4"
                style={{
                  background: ACCENT_DIM,
                  color: ACCENT,
                  fontFamily: FONT_HEAD,
                }}
              >
                <Plug size={13} weight="fill" />
                Generac Certified Installer
              </div>
              <h2
                className="text-[34px] sm:text-[44px] lg:text-[52px] font-bold leading-[1.05] tracking-tight text-white"
                style={{ fontFamily: FONT_HEAD }}
              >
                Standby power that{" "}
                <span style={{ color: ACCENT }}>turns itself on</span>
              </h2>
              <p
                className="mt-4 text-[16px] sm:text-[17px] leading-relaxed"
                style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
              >
                When the grid drops, your Generac standby generator kicks on
                within seconds. Sized to your home. Fueled by propane or natural
                gas. Tested weekly without you lifting a finger.
              </p>

              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                <FeatureBullet
                  icon={<Lifebuoy size={18} weight="fill" />}
                  text="Auto-start when grid fails"
                />
                <FeatureBullet
                  icon={<House size={18} weight="fill" />}
                  text="Whole-home or essential circuits"
                />
                <FeatureBullet
                  icon={<Sun size={18} weight="fill" />}
                  text="Sized to your actual load"
                />
                <FeatureBullet
                  icon={<Shield size={18} weight="fill" />}
                  text="5-year limited warranty from Generac (manufacturer)"
                />
              </div>

              <div className="mt-6">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 px-7 h-13 py-3.5 rounded-md font-bold uppercase tracking-wide text-[13px] text-black transition-all hover:brightness-110 active:scale-[0.97]"
                  style={{ background: ACCENT, fontFamily: FONT_HEAD }}
                >
                  Request a Quote
                  <ArrowRight size={14} weight="bold" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────── WHY US ────────────────────── */}
      <section
        id="why-us"
        className="py-14 sm:py-16 lg:py-20 relative overflow-hidden"
        style={{ background: BG_ALT }}
      >
        {/* Decorative gradient + grid (no photo — Rule 1.5 dedup;
            about-twilight-home.jpg is already used in the services
            grid for "Electrical Services & Upgrades"). */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30"
            style={{
              background:
                "radial-gradient(circle, rgba(250, 204, 21, 0.22) 0%, transparent 65%)",
            }}
          />
          <div
            className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-25"
            style={{
              background:
                "radial-gradient(circle, rgba(250, 204, 21, 0.18) 0%, transparent 65%)",
            }}
          />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" aria-hidden="true">
            <defs>
              <pattern
                id="meyer-why-grid"
                width="48"
                height="48"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 48 0 L 0 0 0 48"
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#meyer-why-grid)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <div
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase font-semibold mb-4"
                style={{ color: ACCENT, fontFamily: FONT_HEAD }}
              >
                <span className="inline-block w-8 h-px" style={{ background: ACCENT }} />
                Why Choose Meyer Electric
              </div>
              <h2
                className="text-[34px] sm:text-[44px] lg:text-[52px] font-bold leading-[1.05] tracking-tight text-white"
                style={{ fontFamily: FONT_HEAD }}
              >
                Fast, clean,{" "}
                <span style={{ color: ACCENT }}>code-compliant</span>{" "}
                electrical work.
              </h2>
              <p
                className="mt-4 text-[16px] sm:text-[17px] leading-relaxed max-w-xl"
                style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
              >
                We take great pride in installing a quality electrical
                installation every time. Our reputation remains rock solid
                because we take great care of our customers individual needs
                on their electrical jobs.
              </p>

              <ul className="mt-6 space-y-3 max-w-xl">
                <WhyBullet text={`${BUSINESS.yearsInBusiness}+ years on the Olympic Peninsula`} />
                <WhyBullet text="Licensed, bonded, and insured" />
                <WhyBullet text="Tesla Powerwall Certified Installer" />
                <WhyBullet text="Generac Certified Installer" />
                <WhyBullet text="Upfront pricing throughout any project" />
                <WhyBullet text="Local, owner-operated, code-first crew" />
              </ul>
            </div>

            {/* Stats */}
            <div className="lg:pl-8">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <StatCard value={`${BUSINESS.yearsInBusiness}+`} label="Years in Business" />
                <StatCard value="10" label="Cities Served" />
                <StatCard value="A+" label="Workmanship Standard" />
                <StatCard value="100%" label="Licensed &amp; Insured" />
              </div>

              <div
                className="mt-4 p-5 sm:p-6 rounded-xl border"
                style={{
                  background: "rgba(250, 204, 21, 0.06)",
                  borderColor: ACCENT_DIM,
                }}
              >
                <Quotes size={32} weight="fill" style={{ color: ACCENT }} />
                <p
                  className="mt-3 text-[16px] sm:text-[17px] leading-relaxed text-white"
                  style={{ fontFamily: FONT_BODY }}
                >
                  &ldquo;We take great pride in installing a quality electrical
                  installation every time. Our reputation remains rock solid
                  because we take great care of our customers.&rdquo;
                </p>
                <div
                  className="mt-4 text-[12px] uppercase tracking-[0.2em] font-semibold"
                  style={{ color: ACCENT, fontFamily: FONT_HEAD }}
                >
                  — The Meyer Electric Team
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────── COMPARISON TABLE ────────────────────── */}
      {/* Meyer Electric vs the average electrician — 8-row checkmark
          comparison. Concrete, defensible proof rows leaning into Tesla
          + Generac certs, upfront pricing, owner-operated, peninsula
          coverage. Sits after Why-Us (extending the trust narrative)
          and before the quiz (which qualifies the visitor's intent). */}
      <section
        // id added 2026-08-17: llms.txt + llms-full.txt have always
        // advertised /clients/meyer-electric#comparison as a key page,
        // but the anchor never existed — AI crawlers following it landed
        // at the top of the page instead.
        id="comparison"
        className="py-14 sm:py-16 lg:py-20"
        style={{ background: BG }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="Honest Comparison"
            title="Meyer Electric vs"
            highlight="the average electrician"
            subtitle="No buzzwords. No 'industry-leading' fluff. Just what you actually get when you hire us."
          />

          <div
            className="mx-auto max-w-4xl rounded-2xl border overflow-hidden"
            style={{
              background: BG_PANEL,
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* Header row */}
            <div
              className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 sm:gap-4 px-4 sm:px-6 py-4 border-b text-[11px] sm:text-[12px] uppercase tracking-[0.18em] font-bold"
              style={{
                borderBottomColor: "rgba(255, 255, 255, 0.08)",
                fontFamily: FONT_HEAD,
                background:
                  "linear-gradient(180deg, rgba(250, 204, 21, 0.04) 0%, transparent 100%)",
              }}
            >
              <div className="text-white/40">What you should expect</div>
              <div className="text-center" style={{ color: ACCENT }}>
                Meyer Electric
              </div>
              <div className="text-center text-white/40">Average</div>
            </div>

            {/* Rows */}
            {COMPARISON_ROWS.map((row, i) => (
              <div
                key={row.label}
                className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 sm:gap-4 px-4 sm:px-6 py-3.5 sm:py-4 border-b items-center"
                style={{
                  borderBottomColor:
                    i === COMPARISON_ROWS.length - 1
                      ? "transparent"
                      : "rgba(255, 255, 255, 0.05)",
                  background:
                    i % 2 === 0 ? "transparent" : "rgba(255, 255, 255, 0.015)",
                }}
              >
                <div
                  className="text-[13px] sm:text-[14px] text-white leading-snug"
                  style={{ fontFamily: FONT_BODY }}
                >
                  {row.label}
                </div>
                {/* Meyer column — always green check */}
                <div className="flex justify-center">
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full"
                    style={{
                      background: FIRE_GRAD,
                      color: "#0a0a0a",
                      boxShadow: `0 4px 12px rgba(250, 204, 21, 0.2)`,
                    }}
                  >
                    <CheckCircle size={16} weight="fill" />
                  </span>
                </div>
                {/* Average column — text or X */}
                <div className="flex justify-center text-center">
                  {row.avg === "X" ? (
                    <span
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full"
                      style={{
                        background: "rgba(127, 29, 29, 0.4)",
                        color: "#fca5a5",
                      }}
                    >
                      <XCircle size={16} weight="fill" />
                    </span>
                  ) : (
                    <span
                      className="text-[12px] sm:text-[13px] text-white/45 italic"
                      style={{ fontFamily: FONT_BODY }}
                    >
                      {row.avg}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p
            className="text-center text-[12px] mt-5 max-w-2xl mx-auto"
            style={{ color: INK_DIM, fontFamily: FONT_BODY }}
          >
            Most prospects don&rsquo;t know which questions to ask. That&rsquo;s
            our advantage — we earn the work by being the obvious choice on the
            stuff that actually matters.
          </p>
        </div>
      </section>

      {/* ────────────────────── QUIZ ────────────────────── */}
      {/* "What's your power problem?" — 4 expandable cards. Click reveals
          recommendation + targeted CTA (matching service anchor or
          phone). Highest-intent qualifier on the page; the click itself
          is a strong buying-signal we can act on. */}
      <section
        className="py-14 sm:py-16 lg:py-20 relative overflow-hidden"
        style={{ background: BG_ALT }}
      >
        {/* Subtle ambient glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-[0.08]"
            style={{
              background:
                "radial-gradient(ellipse, rgba(250, 204, 21, 0.55) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="60-Second Quiz"
            title="What's your"
            highlight="power problem?"
            subtitle="Pick the one that sounds most like you. We'll show you what we'd actually recommend — no calls required."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {QUIZ_OPTIONS.map((opt, i) => {
              const isActive = quizActive === i;
              return (
                <motion.div
                  key={opt.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  // amount: 0.1 — fire as soon as 10% of the element
                  // enters the viewport. Default (0.5) requires half
                  // the element on-screen, which never triggered on
                  // tall mobile cards.
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ delay: i * 0.06, ...spring }}
                >
                  <button
                    type="button"
                    onClick={() => setQuizActive(isActive ? null : i)}
                    className="w-full text-left rounded-2xl border transition-all duration-300 overflow-hidden"
                    style={{
                      borderColor: isActive
                        ? opt.color
                        : "rgba(255, 255, 255, 0.08)",
                      background: isActive
                        ? `${opt.color}10`
                        : "rgba(255, 255, 255, 0.03)",
                    }}
                  >
                    <div className="p-5 sm:p-6 flex items-center gap-4">
                      <span
                        className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                          background: isActive
                            ? `${opt.color}25`
                            : "rgba(250, 204, 21, 0.10)",
                          color: opt.color,
                          border: `1px solid ${isActive ? opt.color + "55" : ACCENT_DIM}`,
                          transition: "all 0.3s",
                        }}
                      >
                        {opt.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3
                          className="text-[15px] sm:text-[16px] font-bold text-white leading-snug"
                          style={{ fontFamily: FONT_HEAD }}
                        >
                          {opt.label}
                        </h3>
                        <div
                          className="text-[11px] mt-0.5 uppercase tracking-[0.16em] font-semibold"
                          style={{
                            color: isActive ? opt.color : INK_DIM,
                            fontFamily: FONT_HEAD,
                          }}
                        >
                          {isActive ? "Tap to close" : "Tap for our pick"}
                        </div>
                      </div>
                      <CaretDown
                        size={20}
                        weight="bold"
                        className="ml-auto shrink-0 transition-transform duration-300"
                        style={{
                          color: opt.color,
                          transform: isActive ? "rotate(180deg)" : "rotate(0)",
                        }}
                      />
                    </div>
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                            <div
                              className="h-px mb-4"
                              style={{ background: `${opt.color}30` }}
                            />
                            <p
                              className="text-[14px] sm:text-[15px] leading-relaxed mb-4"
                              style={{
                                color: INK_SOFT,
                                fontFamily: FONT_BODY,
                              }}
                            >
                              {opt.rec}
                            </p>
                            <a
                              href={opt.ctaHref}
                              className="inline-flex items-center gap-2 px-5 h-10 rounded-md text-[12px] font-bold uppercase tracking-wide transition-all hover:brightness-110 active:scale-95 shadow-[0_4px_14px_rgba(250,204,21,0.3)]"
                              style={{
                                background: FIRE_GRAD,
                                color: "#0a0a0a",
                                fontFamily: FONT_HEAD,
                              }}
                            >
                              {opt.ctaText}
                              <ArrowRight size={13} weight="bold" />
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              );
            })}
          </div>

          <p
            className="text-center text-[12px] mt-7 max-w-2xl mx-auto"
            style={{ color: INK_DIM, fontFamily: FONT_BODY }}
          >
            Not sure? Call{" "}
            <a
              href={BUSINESS.phoneHref}
              className="text-white hover:underline"
              style={{ color: ACCENT }}
            >
              {BUSINESS.phoneDisplay}
            </a>
            . We&rsquo;ll figure it out together — no pressure, no upsell.
          </p>
        </div>
      </section>

      {/* ────────────────────── SERVICE AREA ────────────────────── */}
      <section
        // id added 2026-08-17 — same reason as #comparison above: both
        // llms.txt routes linked to #service-area with no anchor here.
        id="service-area"
        className="py-14 sm:py-16 lg:py-20"
        style={{ background: BG }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            eyebrow="Service Area"
            title="Powering the entire"
            highlight="Olympic Peninsula"
            subtitle={`Based in Sequim, serving 10 cities across Clallam, Jefferson, and Kitsap counties. If you're between Forks and Poulsbo, we're your crew.`}
          />

          <div
            className="mx-auto max-w-4xl rounded-2xl border p-6 sm:p-8"
            style={{
              background: BG_PANEL,
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="flex items-start gap-4 mb-5">
              <span
                className="shrink-0 w-12 h-12 rounded-md flex items-center justify-center"
                style={{
                  background: "rgba(250, 204, 21, 0.10)",
                  border: `1px solid ${ACCENT_DIM}`,
                  color: ACCENT,
                }}
              >
                <MapPin size={22} weight="fill" />
              </span>
              <div>
                <div
                  className="text-[14px] uppercase tracking-[0.2em] font-semibold"
                  style={{ color: ACCENT, fontFamily: FONT_HEAD }}
                >
                  Headquartered in
                </div>
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[18px] sm:text-[20px] font-bold text-white mt-0.5 hover:underline"
                  style={{ fontFamily: FONT_HEAD }}
                >
                  {BUSINESS.address.full}
                </a>
              </div>
            </div>

            <div
              className="text-[12px] uppercase tracking-[0.2em] font-semibold mb-4"
              style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
            >
              Cities we serve
            </div>
            <div className="flex flex-wrap gap-2.5">
              {BUSINESS.serviceArea.map((city) => (
                <span
                  key={city}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-medium text-white border"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    borderColor: "rgba(255, 255, 255, 0.10)",
                    fontFamily: FONT_BODY,
                  }}
                >
                  <CaretRight size={11} weight="bold" style={{ color: ACCENT }} />
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────── HIGHLIGHT FILM ──────────────────────
          Sits directly above the Instagram band so the page closes on
          proof → follow → quote. Self-hides while HIGHLIGHT_FILM.src
          is empty (see the config block at the top of this file). */}
      <HighlightFilmSection />

      {/* ────────────────────── INSTAGRAM ──────────────────────
          Added 2026-08-17 per Kyle. Deliberately NOT an embedded feed:
          third-party IG embeds are a render-blocking script, they break
          whenever Meta rotates their embed API, and Kyle's social-media
          contractor hadn't sent any content yet as of this build. This
          is a follow CTA that costs nothing to maintain. When she does
          send photos, the natural upgrade is a 3-4 tile grid of real
          job shots inside this band linking out to the profile —
          self-hosted images, not an embed. */}
      <section
        className="py-10 sm:py-12 border-y"
        style={{
          // BG_PANEL so the strip reads as its own band between the
          // BG service-area section above and the BG_ALT contact
          // section below.
          background: BG_PANEL,
          borderColor: "rgba(255, 255, 255, 0.06)",
        }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <span
                className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl text-black"
                style={{ background: FIRE_GRAD }}
              >
                <InstagramLogo size={24} weight="fill" />
              </span>
              <div>
                <h2
                  className="text-[22px] sm:text-[26px] font-bold tracking-tight text-white leading-snug"
                  style={{ fontFamily: FONT_HEAD }}
                >
                  See the work in progress
                </h2>
                <p
                  className="mt-1.5 text-[14px] sm:text-[15px] leading-relaxed max-w-lg"
                  style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                >
                  Panel swaps, Powerwall installs, solar going up, and
                  the Kubota in the dirt — we post the real jobs on
                  Instagram.
                </p>
              </div>
            </div>

            <a
              href={BUSINESS.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              // Deliberately NOT `uppercase` like the page's other CTAs:
              // an IG handle is a literal identifier, and @MEYERELECTRIC360
              // reads as a different handle to anyone typing it by hand.
              className="shrink-0 inline-flex items-center gap-2 px-6 h-12 rounded-md font-bold tracking-wide text-[14px] text-black transition-all hover:brightness-110 active:scale-[0.97]"
              style={{ background: ACCENT, fontFamily: FONT_HEAD }}
            >
              <InstagramLogo size={17} weight="fill" />
              {BUSINESS.instagramHandle}
            </a>
          </div>
        </div>
      </section>

      {/* ────────────────────── CONTACT / CTA ────────────────────── */}
      <section
        id="contact"
        className="py-14 sm:py-16 lg:py-20 relative overflow-hidden"
        style={{ background: BG_ALT }}
      >
        {/* Subtle yellow glow accent */}
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(250, 204, 21, 0.4) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <div
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase font-semibold mb-4"
                style={{ color: ACCENT, fontFamily: FONT_HEAD }}
              >
                <span className="inline-block w-8 h-px" style={{ background: ACCENT }} />
                Get In Touch
              </div>
              <h2
                className="text-[34px] sm:text-[44px] lg:text-[54px] font-bold leading-[1.05] tracking-tight text-white"
                style={{ fontFamily: FONT_HEAD }}
              >
                Ready for{" "}
                <span style={{ color: ACCENT }}>reliable power?</span>
              </h2>
              <p
                className="mt-4 text-[16px] sm:text-[18px] leading-relaxed max-w-md"
                style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
              >
                Tell us about your project. We&rsquo;ll respond within the hour
                during business hours with a free estimate, no obligation.
              </p>

              <div className="mt-6 space-y-4 max-w-md">
                <ContactRow
                  icon={<Phone size={18} weight="fill" />}
                  label="Call us"
                  value={BUSINESS.phoneDisplay}
                  href={BUSINESS.phoneHref}
                />
                <ContactRow
                  icon={<MapPin size={18} weight="fill" />}
                  label="Visit us"
                  value={BUSINESS.address.full}
                  href={BUSINESS.mapsUrl}
                />
                <ContactRow
                  icon={<Calendar size={18} weight="fill" />}
                  label="Hours"
                  value="Mon-Fri · 7:15 AM to 3:15 PM"
                />
                <ContactRow
                  icon={<Certificate size={18} weight="fill" />}
                  label="License"
                  value={BUSINESS.license}
                />
              </div>
            </div>

            <div>
              <MeyerElectricContactForm
                prospectId={BUSINESS.prospectId}
                services={[
                  "Solar Panel Installation",
                  "Tesla Powerwall Installation",
                  "Generac Standby Generator",
                  "Service Upgrade / Panel Replacement",
                  "Underground Power",
                  "EV Charger Install",
                  "Lighting / Outlets",
                  "Commercial Electrical",
                  "New Construction",
                  "Other",
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────── FOOTER ────────────────────── */}
      <footer
        className="border-t"
        style={{
          background: "#050505",
          borderColor: "rgba(255, 255, 255, 0.05)",
        }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Logo column */}
            <div>
              <div
                className="flex items-center gap-3 mb-5"
                style={{ fontFamily: FONT_HEAD }}
              >
                <MeyerMark size={36} />
                <div className="flex flex-col leading-tight text-white">
                  <span className="text-[16px] font-bold tracking-wide">
                    MEYER ELECTRIC
                  </span>
                  <span className="text-[10px] tracking-[0.24em] uppercase font-medium text-white/55">
                    Licensed · Bonded · Insured
                  </span>
                </div>
              </div>
              <p
                className="text-[14px] leading-relaxed"
                style={{ color: INK_DIM, fontFamily: FONT_BODY }}
              >
                Olympic Peninsula&rsquo;s Tesla Powerwall Certified Installer
                and Generac Certified Installer. {BUSINESS.yearsInBusiness}+ years
                of clean, code-compliant electrical work.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <div
                className="text-[12px] uppercase tracking-[0.2em] font-semibold mb-4"
                style={{ color: ACCENT, fontFamily: FONT_HEAD }}
              >
                Quick Links
              </div>
              <ul className="space-y-2.5">
                <FooterLink href="#solar" label="Solar Panels" />
                <FooterLink href="#powerwall" label="Tesla Powerwall" />
                <FooterLink href="#generators" label="Generators" />
                <FooterLink href="#services" label="Underground Power" />
                <FooterLink href="#why-us" label="About" />
                <FooterLink href="#contact" label="Contact" />
              </ul>
            </div>

            {/* Service Area */}
            <div>
              <div
                className="text-[12px] uppercase tracking-[0.2em] font-semibold mb-4"
                style={{ color: ACCENT, fontFamily: FONT_HEAD }}
              >
                Service Area
              </div>
              <p
                className="text-[14px] leading-relaxed"
                style={{ color: INK_DIM, fontFamily: FONT_BODY }}
              >
                Sequim, Port Angeles, Port Townsend, Forks, Clallam Bay, Sekiu,
                Chimacum, Quilcene, Kingston, Poulsbo &amp; surrounding areas.
              </p>
            </div>

            {/* Contact */}
            <div>
              <div
                className="text-[12px] uppercase tracking-[0.2em] font-semibold mb-4"
                style={{ color: ACCENT, fontFamily: FONT_HEAD }}
              >
                Contact
              </div>
              <ul className="space-y-3">
                <li>
                  <a
                    href={BUSINESS.phoneHref}
                    className="text-[14px] text-white hover:text-yellow-400 inline-flex items-center gap-2"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    <Phone size={14} weight="fill" style={{ color: ACCENT }} />
                    {BUSINESS.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={BUSINESS.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] text-white/80 hover:text-white inline-flex items-start gap-2"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    <MapPin
                      size={14}
                      weight="fill"
                      style={{ color: ACCENT }}
                      className="mt-0.5 shrink-0"
                    />
                    <span>{BUSINESS.address.full}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={BUSINESS.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] text-white/80 hover:text-white inline-flex items-center gap-2"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    <InstagramLogo
                      size={14}
                      weight="fill"
                      style={{ color: ACCENT }}
                      className="shrink-0"
                    />
                    <span>{BUSINESS.instagramHandle}</span>
                  </a>
                </li>
                <li
                  className="text-[12px] uppercase tracking-wider"
                  style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
                >
                  License {BUSINESS.license}
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="mt-8 pt-5 border-t flex flex-col sm:flex-row gap-4 items-center justify-between"
            style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
          >
            <div
              className="text-[12px]"
              style={{ color: INK_DIM, fontFamily: FONT_BODY }}
            >
              © {new Date().getFullYear()} Meyer Electric LLC. All rights reserved.
            </div>
            {/* Lock — owner entry to the password-gated live backend
                (traffic + quote requests + domains). Replaced the
                "Built by BlueJays" credit + demo feather per Ben
                2026-07-15 (Meyer exception to the footer-credit rule,
                noted in CLAUDE.md tenant table). */}
            <Link
              href="/clients/meyer-electric/stats"
              aria-label="Owner backend access"
              title="Owner backend"
              className="inline-flex items-center justify-center w-7 h-7 rounded-full opacity-30 hover:opacity-100 transition-opacity"
              style={{ color: INK_DIM }}
            >
              <LockKey size={14} weight="bold" />
            </Link>
          </div>
        </div>
      </footer>
    </main>
    </MotionConfig>
  );
}

/* ───────────────────────── SUB COMPONENTS ───────────────────────── */

/**
 * HighlightFilmSection — vertical (9:16) reel of a real Meyer job.
 *
 * Renders NOTHING when HIGHLIGHT_FILM.src is empty, so the slot can sit
 * in the page waiting for footage without ever showing a live client a
 * "video coming soon" box.
 *
 * Bandwidth: preload="none" plus an IntersectionObserver means the
 * 3.3 MB file is only fetched once a visitor actually scrolls to it,
 * and playback pauses when it scrolls away. Meyer runs ~440 views a
 * month — eagerly loading this for every visitor (most of whom never
 * reach it) is exactly the /public bandwidth waste CLAUDE.md's Vercel
 * cost discipline warns about.
 *
 * Muted is REQUIRED for autoplay — every browser blocks autoplay with
 * sound. Controls stay on so anyone who wants the audio can unmute.
 */
function HighlightFilmSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (!HIGHLIGHT_FILM.autoPlay) return;
        if (entry.isIntersecting) {
          // play() rejects when the browser blocks autoplay — the
          // visible controls are the fallback, so swallow it.
          void el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!HIGHLIGHT_FILM.src) return null;

  return (
    <section
      id="our-work"
      className="py-14 sm:py-16 lg:py-20 relative overflow-hidden"
      style={{ background: BG_ALT }}
    >
      <div
        className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(250, 204, 21, 0.38) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
          {/* Phone-shaped 9:16 frame. Capped by height on desktop so a
              vertical video can't run away with the whole viewport. */}
          <div className="flex justify-center lg:justify-start">
            <div
              className="relative w-full max-w-[300px] sm:max-w-[330px] rounded-[26px] overflow-hidden"
              style={{
                aspectRatio: "9 / 16",
                border: `1px solid rgba(250, 204, 21, 0.22)`,
                boxShadow:
                  "0 30px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)",
                background: BG,
              }}
            >
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                src={HIGHLIGHT_FILM.src}
                poster={HIGHLIGHT_FILM.poster || undefined}
                preload="none"
                muted
                loop
                playsInline
                controls
                aria-label="Meyer Electric crew installing an EV charger circuit and outlet"
              />
              {/* Live dot — only once the reel is actually rolling. */}
              {inView && HIGHLIGHT_FILM.autoPlay && (
                <div
                  className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full pointer-events-none"
                  style={{ background: "rgba(10,10,10,0.62)" }}
                >
                  <span
                    className="me-film-dot block w-1.5 h-1.5 rounded-full"
                    style={{ background: ACCENT }}
                  />
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.18em] text-white"
                    style={{ fontFamily: FONT_HEAD }}
                  >
                    Real Job
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] mb-4"
              style={{
                background: ACCENT_DIM,
                color: ACCENT,
                fontFamily: FONT_HEAD,
              }}
            >
              <Lightning size={13} weight="fill" />
              {HIGHLIGHT_FILM.eyebrow}
            </div>
            <h2
              className="text-[32px] sm:text-[42px] lg:text-[50px] font-bold leading-[1.06] tracking-tight text-white"
              style={{ fontFamily: FONT_HEAD }}
            >
              {HIGHLIGHT_FILM.heading}{" "}
              <span style={{ color: ACCENT }}>
                {HIGHLIGHT_FILM.headingAccent}
              </span>
            </h2>
            <p
              className="mt-4 text-[16px] sm:text-[17px] leading-relaxed max-w-xl"
              style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
            >
              {HIGHLIGHT_FILM.body}
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-7 h-13 py-3.5 rounded-md font-bold uppercase tracking-wide text-[13px] text-black transition-all hover:brightness-110 active:scale-[0.97]"
                style={{ background: ACCENT, fontFamily: FONT_HEAD }}
              >
                Get a Quote
                <ArrowRight size={14} weight="bold" />
              </a>
              <a
                href={BUSINESS.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 h-13 py-3.5 rounded-md font-bold tracking-wide text-[14px] text-white border-2 transition-all hover:bg-white/[0.06]"
                style={{
                  borderColor: "rgba(255,255,255,0.18)",
                  fontFamily: FONT_HEAD,
                }}
              >
                <InstagramLogo size={16} weight="fill" />
                More on Instagram
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .me-film-dot {
          animation: meFilmDot 1.8s ease-in-out infinite;
        }
        @keyframes meFilmDot {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.25; }
        }
      `}</style>
    </section>
  );
}

/**
 * SolarCardVisual — media treatment for the Solar service card.
 *
 * Meyer has exactly 5 unique real photos and every one is already
 * spoken for (hero + the four other service cards). CLAUDE.md bans
 * duplicate images on a site, and no real photo of a Meyer solar job
 * exists yet — the capability is new as of Aug 2026. So rather than
 * recycle a photo or drop in stock, the Solar card gets the same
 * gradient + grid + animated-icon language the Powerwall and Generac
 * deep-dive diagrams use. Side benefit: it's the only non-photo card
 * in the grid, so the new service is the thing your eye lands on.
 *
 * Swap this for a real photo the moment Kyle's social-media contractor
 * sends one of an actual Meyer install.
 */
function SolarCardVisual() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{
        background: `radial-gradient(circle at 50% 26%, rgba(251, 146, 60, 0.26) 0%, rgba(10, 10, 10, 0) 64%), linear-gradient(180deg, ${BG_ALT} 0%, ${BG} 100%)`,
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="meyer-solcard-grid"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 28 0 L 0 0 0 28"
              fill="none"
              stroke={ACCENT}
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#meyer-solcard-grid)" />
      </svg>

      <div className="relative flex flex-col items-center gap-3.5 transition-transform duration-700 group-hover:scale-105">
        {/* Sun */}
        <span
          className="me-solcard-sun flex items-center justify-center w-12 h-12 rounded-full"
          style={{
            background: FIRE_GRAD_RADIAL,
            boxShadow: `0 0 26px ${ACCENT_ORANGE_DIM}, 0 0 12px rgba(250,204,21,0.5)`,
          }}
        >
          <Sun size={26} weight="fill" color="#0a0a0a" />
        </span>

        {/* Array */}
        <div style={{ perspective: "460px" }}>
          <div
            className="relative grid grid-cols-4 gap-[2px] p-[3px] rounded-[2px]"
            style={{
              transform: "rotateX(36deg)",
              background: "rgba(148, 163, 184, 0.30)",
              boxShadow: "0 12px 24px rgba(0,0,0,0.55)",
              width: "150px",
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="block aspect-[4/3] rounded-[1px]"
                style={{
                  background:
                    "linear-gradient(150deg, #1e293b 0%, #0f172a 55%, #1e293b 100%)",
                  boxShadow: "inset 0 0 0 0.5px rgba(148,163,184,0.35)",
                }}
              />
            ))}
            <span className="me-solcard-shimmer absolute inset-0 pointer-events-none rounded-[2px]" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .me-solcard-sun {
          animation: meSolCardSun 3.4s ease-in-out infinite;
        }
        @keyframes meSolCardSun {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.08); }
        }

        .me-solcard-shimmer {
          background: linear-gradient(
            115deg,
            rgba(250, 204, 21, 0) 38%,
            rgba(250, 204, 21, 0.4) 50%,
            rgba(250, 204, 21, 0) 62%
          );
          background-size: 260% 100%;
          animation: meSolCardShimmer 4.4s ease-in-out infinite;
        }
        @keyframes meSolCardShimmer {
          0%        { background-position: 130% 0; }
          55%, 100% { background-position: -130% 0; }
        }
      `}</style>
    </div>
  );
}

function HeroPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span style={{ color: ACCENT }}>{icon}</span>
      <span
        className="text-[13px] sm:text-[14px] font-semibold uppercase tracking-wide text-white"
        style={{ fontFamily: FONT_HEAD }}
      >
        {label}
      </span>
    </div>
  );
}

function PowerwallFeature({ title, body }: { title: string; body: string }) {
  return (
    <li className="flex items-start gap-4">
      <span
        className="shrink-0 mt-0.5 w-7 h-7 rounded-md flex items-center justify-center"
        style={{
          background: ACCENT_DIM,
          color: ACCENT,
        }}
      >
        <CheckCircle size={16} weight="fill" />
      </span>
      <div>
        <div
          className="text-[15px] sm:text-[16px] font-bold text-white tracking-tight"
          style={{ fontFamily: FONT_HEAD }}
        >
          {title}
        </div>
        <div
          className="mt-1 text-[14px] sm:text-[15px] leading-relaxed"
          style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
        >
          {body}
        </div>
      </div>
    </li>
  );
}

function FeatureBullet({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="shrink-0 mt-0.5 w-9 h-9 rounded-md flex items-center justify-center"
        style={{
          background: "rgba(250, 204, 21, 0.10)",
          color: ACCENT,
          border: `1px solid ${ACCENT_DIM}`,
        }}
      >
        {icon}
      </span>
      <span
        className="text-[14px] sm:text-[15px] leading-snug text-white pt-1.5"
        style={{ fontFamily: FONT_BODY }}
      >
        {text}
      </span>
    </div>
  );
}

function WhyBullet({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center"
        style={{ background: ACCENT, color: "#0a0a0a" }}
      >
        <CheckCircle size={14} weight="fill" />
      </span>
      <span
        className="text-[15px] sm:text-[16px] text-white leading-snug pt-0.5"
        style={{ fontFamily: FONT_BODY }}
      >
        {text}
      </span>
    </li>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="rounded-xl p-5 sm:p-6 border"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}
    >
      <div
        className="text-[36px] sm:text-[44px] font-bold leading-none tracking-tight"
        style={{ color: ACCENT, fontFamily: FONT_HEAD }}
      >
        {value}
      </div>
      <div
        className="mt-2 text-[11px] sm:text-[12px] uppercase tracking-[0.18em] font-semibold"
        style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
      >
        {label}
      </div>
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
      <span
        className="shrink-0 w-11 h-11 rounded-md flex items-center justify-center"
        style={{
          background: "rgba(250, 204, 21, 0.10)",
          color: ACCENT,
          border: `1px solid ${ACCENT_DIM}`,
        }}
      >
        {icon}
      </span>
      <div>
        <div
          className="text-[11px] uppercase tracking-[0.2em] font-semibold"
          style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
        >
          {label}
        </div>
        <div
          className="mt-0.5 text-[15px] sm:text-[16px] font-medium text-white"
          style={{ fontFamily: FONT_BODY }}
        >
          {value}
        </div>
      </div>
    </>
  );
  return href ? (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="flex items-start gap-4 hover:opacity-80 transition-opacity"
    >
      {inner}
    </a>
  ) : (
    <div className="flex items-start gap-4">{inner}</div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a
        href={href}
        className="text-[14px] text-white/70 hover:text-white transition-colors"
        style={{ fontFamily: FONT_BODY }}
      >
        {label}
      </a>
    </li>
  );
}
