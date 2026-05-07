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

import { motion } from "framer-motion";
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
  Medal,
  Certificate,
  WifiHigh,
  SpeakerHigh,
  Star,
  SealCheck,
} from "@phosphor-icons/react";

import StickyNav from "./sticky-nav";
import MeyerElectricContactForm from "./contact-form";
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
  // Real Meyer crew photos Ben sourced 2026-05-06. Use sparingly + only
  // where they earn their keep — these are the ONLY two photos with
  // actual humans in them so they're the trust-signal heavy hitters.
  teamCrewPanel: "/images/meyer-electric/team-crew-panel.jpg",   // 2 guys + electrical panel install (real Meyer hoodie + tools)
  teamAwardWinning: "/images/meyer-electric/team-award-2022.jpg", // Full crew + trucks + Best of Olympic Peninsula 2022 award
} as const;

/* ───────────────────────── COLORS ───────────────────────── */
// Yellow-on-black per Ben 2026-05-06 (matches the Tesla Powerwall
// installer template he sourced). Pure near-black BG with bright
// yellow lightning accent. Subtle warm tint on the alt panel so the
// page doesn't feel monolithic.
const BG = "#0a0a0a";
const BG_ALT = "#111111";
const BG_PANEL = "#161614";
const ACCENT = "#facc15";       // primary yellow — buttons, headlines, accent
const ACCENT_DARK = "#eab308";  // hover/gradient end
const ACCENT_DIM = "rgba(250, 204, 21, 0.18)";
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

/* ───────────────────────── PAGE ───────────────────────── */

export default function MeyerElectricPage() {
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
                background: "rgba(250, 204, 21, 0.10)",
                border: `1px solid ${ACCENT_DIM}`,
                color: ACCENT,
                fontFamily: FONT_HEAD,
              }}
            >
              <Lightning size={13} weight="fill" />
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
                className="inline-flex items-center justify-center gap-2 px-7 h-14 rounded-md font-bold uppercase tracking-wide text-[14px] text-black transition-all hover:brightness-110 active:scale-[0.97] shadow-[0_4px_24px_rgba(250,204,21,0.4)]"
                style={{ background: ACCENT, fontFamily: FONT_HEAD }}
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

      {/* ────────────────────── AWARD / ACCOLADE ────────────────────── */}
      {/* Voted #1 Best Electrician on the Olympic Peninsula · 2022.
          Real award photo Ben sourced — Meyer crew + trucks + the actual
          "Best of Olympic Peninsula · Clallam County · 1st Place 2022"
          badge embedded in the image. Major trust signal, deserves a
          dedicated section right after the trust strip so cold visitors
          see it before they hit the services grid. */}
      <section
        id="award"
        className="py-12 sm:py-14 lg:py-16 relative overflow-hidden"
        style={{ background: BG }}
      >
        {/* Subtle yellow ambient glow behind */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full opacity-[0.10]"
            style={{
              background:
                "radial-gradient(ellipse, rgba(250, 204, 21, 0.55) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 items-center">
            {/* Copy side */}
            <div className="order-2 lg:order-1">
              <div
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase font-semibold mb-4"
                style={{ color: ACCENT, fontFamily: FONT_HEAD }}
              >
                <Medal size={14} weight="fill" />
                Recognized Locally
              </div>
              <h2
                className="text-[30px] sm:text-[40px] lg:text-[48px] font-bold leading-[1.05] tracking-tight text-white"
                style={{ fontFamily: FONT_HEAD }}
              >
                Voted{" "}
                <span style={{ color: ACCENT }}>#1 Best Electrician</span>{" "}
                on the Olympic Peninsula
              </h2>
              <p
                className="mt-4 text-[15px] sm:text-[16px] leading-relaxed max-w-md"
                style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
              >
                Best of Olympic Peninsula · Clallam County · 1st Place 2022.
                We earned this the way we earn every job — clean installs,
                upfront pricing, and crews that show up on time.
              </p>

              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                <AwardStat value={`${BUSINESS.yearsInBusiness}+`} label="Years Local" />
                <AwardStat value="#1" label="Best of 2022" />
                <AwardStat value={`${BUSINESS.serviceArea.length}`} label="Cities Served" />
              </div>
            </div>

            {/* Image side — the actual award photo with embedded badge */}
            <div className="order-1 lg:order-2 relative">
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  border: `1px solid rgba(250, 204, 21, 0.25)`,
                  boxShadow:
                    "0 24px 70px rgba(0, 0, 0, 0.5), 0 0 32px rgba(250, 204, 21, 0.08)",
                }}
              >
                <img
                  src={PHOTOS.teamAwardWinning}
                  alt="Meyer Electric crew in front of company trucks holding the Best of Olympic Peninsula 2022 #1 Electrician award"
                  className="block w-full h-auto"
                  loading="lazy"
                />
              </div>
              {/* Floating "Verified Local" stamp */}
              <div
                className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 px-3.5 py-2 rounded-full shadow-xl flex items-center gap-2"
                style={{
                  background: ACCENT,
                  color: "#0a0a0a",
                  fontFamily: FONT_HEAD,
                  boxShadow: "0 8px 24px rgba(250, 204, 21, 0.45)",
                }}
              >
                <SealCheck size={14} weight="fill" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Verified Local · 2022
                </span>
              </div>
            </div>
          </div>
        </div>
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

                {/* Stylized Powerwall illustration */}
                <div className="relative flex flex-col items-center gap-7 px-8">
                  {/* Lightning storm cluster above */}
                  <div className="flex items-end gap-2 opacity-70">
                    <svg width="36" height="50" viewBox="0 0 24 32" fill={ACCENT}>
                      <path d="M13 0 4 18h7l-1 14 9-22h-7l1-10z" />
                    </svg>
                    <svg width="56" height="76" viewBox="0 0 24 32" fill={ACCENT}>
                      <path d="M13 0 4 18h7l-1 14 9-22h-7l1-10z" />
                    </svg>
                    <svg width="30" height="42" viewBox="0 0 24 32" fill={ACCENT} className="opacity-60">
                      <path d="M13 0 4 18h7l-1 14 9-22h-7l1-10z" />
                    </svg>
                  </div>

                  {/* "Powerwall" stylized rectangle */}
                  <div
                    className="relative w-44 h-72 rounded-2xl overflow-hidden flex flex-col items-center justify-between p-5"
                    style={{
                      background:
                        "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
                      boxShadow:
                        "0 24px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    {/* Tesla T mark (stylized) */}
                    <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 mt-1">
                      Powerwall
                    </div>
                    {/* Pulsing energy ring */}
                    <div className="relative flex items-center justify-center">
                      <div
                        className="absolute w-24 h-24 rounded-full"
                        style={{
                          background: `radial-gradient(circle, ${ACCENT}40 0%, transparent 70%)`,
                          animation: "meyerPulse 2.4s ease-in-out infinite",
                        }}
                      />
                      <div
                        className="relative w-14 h-14 rounded-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
                          boxShadow: `0 0 28px ${ACCENT_DIM}`,
                        }}
                      >
                        <Lightning size={26} weight="fill" color="#0a0a0a" />
                      </div>
                    </div>
                    {/* Status LED row */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-600">
                        Charged
                      </span>
                    </div>
                  </div>

                  {/* House silhouette */}
                  <svg
                    width="100"
                    height="40"
                    viewBox="0 0 100 40"
                    className="opacity-40"
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
                @keyframes meyerPulse {
                  0%, 100% { transform: scale(1); opacity: 0.6; }
                  50% { transform: scale(1.18); opacity: 0.95; }
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
          {/* Soft energy orb bottom-left */}
          <div
            className="absolute -bottom-40 -left-32 w-[380px] h-[380px] rounded-full opacity-[0.12]"
            style={{
              background:
                "radial-gradient(circle, rgba(250, 204, 21, 0.5) 0%, transparent 70%)",
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
            className="absolute top-[18%] right-[12%] w-8 h-8 sm:w-10 sm:h-10 opacity-[0.06]"
            viewBox="0 0 24 32"
            fill={ACCENT}
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
            className="absolute bottom-[12%] left-[18%] w-10 h-10 sm:w-12 sm:h-12 opacity-[0.06]"
            viewBox="0 0 24 32"
            fill={ACCENT}
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

                {/* Top: grid status row */}
                <div className="relative flex items-center justify-between gap-4">
                  <div
                    className="flex-1 rounded-lg p-3.5 border"
                    style={{
                      background: "rgba(220, 38, 38, 0.10)",
                      borderColor: "rgba(220, 38, 38, 0.35)",
                    }}
                  >
                    <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-rose-400">
                      Grid
                    </div>
                    <div className="text-[18px] font-bold text-white mt-0.5" style={{ fontFamily: FONT_HEAD }}>
                      OFFLINE
                    </div>
                  </div>
                  <div
                    className="text-2xl"
                    style={{ color: ACCENT }}
                    aria-hidden="true"
                  >
                    →
                  </div>
                  <div
                    className="flex-1 rounded-lg p-3.5 border"
                    style={{
                      background: "rgba(34, 197, 94, 0.10)",
                      borderColor: "rgba(34, 197, 94, 0.35)",
                    }}
                  >
                    <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-emerald-400">
                      Generac
                    </div>
                    <div className="text-[18px] font-bold text-white mt-0.5" style={{ fontFamily: FONT_HEAD }}>
                      RUNNING
                    </div>
                  </div>
                </div>

                {/* Center: big auto-transfer switch icon */}
                <div className="relative flex flex-col items-center gap-3 my-2">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
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

                {/* Bottom: house powered indicator */}
                <div
                  className="relative flex items-center justify-center gap-3 px-5 py-3 rounded-lg"
                  style={{
                    background: "rgba(34, 197, 94, 0.08)",
                    border: "1px solid rgba(34, 197, 94, 0.25)",
                  }}
                >
                  <House size={18} weight="fill" className="text-emerald-400" />
                  <span
                    className="text-[12px] uppercase tracking-[0.2em] font-bold text-emerald-400"
                    style={{ fontFamily: FONT_HEAD }}
                  >
                    Home Powered · 8 sec
                  </span>
                </div>
              </div>
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

              {/* Real crew photo — Ben sourced 2026-05-06. Two of the
                  Meyer guys on a real job, panel install on plywood
                  framing, "Meyer Electric (360) 477-2202" hoodie + tool
                  belts. The most authentic trust signal on the page —
                  goes RIGHT under the quote per Ben's explicit ask. */}
              <div
                className="mt-4 relative rounded-xl overflow-hidden border"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
                }}
              >
                <img
                  src={PHOTOS.teamCrewPanel}
                  alt="Meyer Electric crew on a real install — two Meyer technicians next to a freshly mounted electrical panel, wearing Meyer Electric work hoodies and tool belts"
                  className="block w-full h-auto"
                  loading="lazy"
                />
                {/* Caption overlay */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center gap-2"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.85) 80%)",
                  }}
                >
                  <Lightning
                    size={14}
                    weight="fill"
                    style={{ color: ACCENT }}
                  />
                  <span
                    className="text-[11px] uppercase tracking-[0.18em] font-bold text-white"
                    style={{ fontFamily: FONT_HEAD }}
                  >
                    Real crew · Real install · Sequim, WA
                  </span>
                </div>
              </div>
            </div>
          </div>
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
                <span style={{ color: ACCENT }}>
                  <svg
                    viewBox="0 0 24 24"
                    width="32"
                    height="32"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
                  </svg>
                </span>
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

function AwardStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <div
        className="text-[24px] sm:text-[28px] font-bold leading-none tracking-tight"
        style={{ color: ACCENT, fontFamily: FONT_HEAD }}
      >
        {value}
      </div>
      <div
        className="mt-1 text-[10px] uppercase tracking-[0.2em] font-semibold"
        style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
      >
        {label}
      </div>
    </div>
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
