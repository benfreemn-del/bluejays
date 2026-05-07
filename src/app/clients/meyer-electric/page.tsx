"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase. */

/**
 * /clients/meyer-electric — Meyer Electric LLC, Sequim WA
 *
 * Custom-tier bespoke premium showcase for the Olympic Peninsula's
 * Tesla Powerwall Certified Installer + Generac Authorized Dealer +
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

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "@phosphor-icons/react";

import StickyNav from "./sticky-nav";
import MeyerElectricContactForm from "./contact-form";
import MeyerMark from "./meyer-mark";
import BluejayLogo from "@/components/BluejayLogo";

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
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group block overflow-hidden rounded-xl border transition-all hover:-translate-y-1"
      style={{
        background: BG_PANEL,
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={imageAlt}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,10,10,0) 40%, rgba(10,10,10,0.85) 100%)",
          }}
        />
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
  { label: "Generac Authorized Dealer", meyer: "yes", avg: "Rarely" },
  { label: "Licensed, bonded & insured", meyer: "yes", avg: "Usually" },
  { label: "15+ years on the Olympic Peninsula", meyer: "yes", avg: "Varies" },
  { label: "Upfront pricing — no surprise change orders", meyer: "yes", avg: "Time + materials" },
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
      label: "I want solar + storage",
      icon: <Sun size={24} weight="fill" />,
      rec:
        "Tesla Powerwall + solar tie-in. Store the sunshine you generate, use it after dark, sell back the rest. We're certified to design + install the whole system.",
      ctaHref: "#powerwall",
      ctaText: "See Powerwall Details",
      color: ACCENT_AMBER,
    },
    {
      label: "Need a backup generator",
      icon: <Plug size={24} weight="fill" />,
      rec:
        "Generac standby. Sized to your real load (not oversold), fueled by propane or natural gas, tested weekly without you lifting a finger. 5-year warranty.",
      ctaHref: "#generators",
      ctaText: "See Generator Details",
      color: ACCENT_ORANGE,
    },
    {
      label: "Service upgrade or panel issue",
      icon: <Wrench size={24} weight="fill" />,
      rec:
        "Panel replacements, service upgrades, sub-panels, EV chargers, troubleshooting. Code-compliant work, upfront pricing, no surprise change orders.",
      ctaHref: BUSINESS.phoneHref,
      ctaText: `Call ${BUSINESS.phoneDisplay}`,
      color: ACCENT,
    },
  ];

  return (
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
              <HeroPill icon={<SpeakerHigh size={16} weight="fill" />} label="Quiet & Silent" />
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
              sublabel="Authorized Dealer"
            />
            <TrustBadge
              icon={<ShieldCheck size={22} weight="fill" />}
              label="Licensed · Bonded · Insured"
              sublabel={`License ${BUSINESS.license}`}
            />
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
            subtitle={`From whole-home Tesla Powerwall systems to standby Generac generators, underground power, and code-compliant electrical work — all by one licensed crew serving the Olympic Peninsula since ${BUSINESS.established}.`}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            <ServiceCard
              icon={<Lightning size={22} weight="fill" />}
              title="Tesla Powerwall Installation"
              description="Store solar energy. Power your home through outages. Reduce your reliance on the grid. We're certified installers — we handle permits, install, and Tesla app setup."
              image={PHOTOS.powerwall}
              imageAlt="Tesla Powerwall and solar panels installed on a modern home"
              href="#powerwall"
            />
            <ServiceCard
              icon={<Plug size={22} weight="fill" />}
              title="Generators & Backup Power"
              description="Generac standby generators that kick on automatically when the grid drops. Sized to your home. Fueled by propane or natural gas. Authorized dealer."
              image={PHOTOS.generator}
              imageAlt="Generac automatic transfer switch and electrical panel installation"
              href="#generators"
            />
            <ServiceCard
              icon={<Wrench size={22} weight="fill" />}
              title="Underground Power Installation"
              description="From trenching to final hookup, we install underground power the right way — properly conduited, depth-compliant, and built to last decades."
              image={PHOTOS.underground}
              imageAlt="Tesla Wall Connector installed in a residential garage"
              href="#contact"
            />
            <ServiceCard
              icon={<Buildings size={22} weight="fill" />}
              title="Electrical Services & Upgrades"
              description="Service upgrades, panel replacements, lighting, EV chargers, troubleshooting. Residential, commercial, and new construction across Sequim and beyond."
              image={PHOTOS.electrical}
              imageAlt="Modern home with exterior electrical lighting at twilight"
              href="#contact"
            />
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
                  title="Solar-Ready"
                  body="Pair with new or existing solar to store the sunshine you generate. Use it at night. Sell back the rest."
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
                  <House
                    size={18}
                    weight="fill"
                    className="me-gen-house-icon relative text-emerald-400"
                  />
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
                Generac Authorized Dealer
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
                  text="5-year limited warranty"
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
                <WhyBullet text="Generac Authorized Dealer" />
                <WhyBullet text="Upfront pricing — no surprise change orders" />
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
                  viewport={{ once: true }}
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
                  value="Mon-Fri · 8 AM to 5 PM"
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
                and Generac Authorized Dealer. {BUSINESS.yearsInBusiness}+ years
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
            <a
              href="https://bluejayportfolio.com/audit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] hover:text-white transition-colors"
              style={{ color: INK_DIM, fontFamily: FONT_BODY }}
            >
              <BluejayLogo size={14} className="text-sky-500" />
              <span>
                Built by{" "}
                <span className="underline decoration-dotted underline-offset-2">
                  BlueJays
                </span>{" "}
                — get your free site audit
              </span>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ───────────────────────── SUB COMPONENTS ───────────────────────── */

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
