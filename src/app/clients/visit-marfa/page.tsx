"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/purity */

/**
 * /clients/visit-marfa — bespoke premium showcase for the MARFA Visitor
 * Center / chamber-of-commerce-style destination marketing org.
 *
 * Real org: MARFA Visitor Center — 302 S. Highland Ave, Marfa TX 79843
 * (432) 729-4772 · contact@visitmarfa.com · IG @visitmarfatx
 *
 * Visual language: gallery-grade desert minimalism. Sun-bleached cream,
 * washed terracotta, deep oxblood ink. Editorial serif headlines, lots
 * of whitespace. The visual neighbours are El Cosmico, Hotel Saint
 * George, the Chinati Foundation — *not* corporate tourism boards or
 * kitschy-Texas. Marfa's tone is dry, confident, unembellished.
 *
 * To wire as preview after the prospect row is inserted:
 *   update prospects set
 *     pricing_tier = 'custom',
 *     custom_site_url = 'https://bluejayportfolio.com/clients/visit-marfa'
 *   where current_website ilike '%visitmarfa.com%';
 */

import { useRef } from "react";
import InquiryForm from "@/components/clients/InquiryForm";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  InstagramLogo,
  FacebookLogo,
  Phone,
  Envelope,
  MapPin,
} from "@phosphor-icons/react";

// ─── Real Visit Marfa imagery ──────────────────────────────────────
// All squarespace-cdn URLs below are pulled directly from visitmarfa.com
// — these are the org's own photography. Avoid swapping for stock.
const IMG_HERO_CUPOLA =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/0855170c-4600-49ea-9523-bee7d1cc6f52/cupolaview3.jpg";
const IMG_GIANT_MURAL =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/463c18c2-7b40-4938-b31d-eb3d17900504/Art_Giant+Mural_lowres.jpg";
const IMG_SKY_ISLAND =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/6b855feb-d4a6-4434-b3e0-75590d88e90b/Sky+Island.jpg";
const IMG_BALLROOM =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/bc3d400b-a986-49f3-9956-536975358e2c/4F5A0675+Ballroom+Marfa.jpg";
const IMG_CHINATI =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/61c2c138-d073-4dd9-bcd6-5afeef099004/chinati-foundation-inside-1-600x400.jpg";
const IMG_PRADA =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/382dd722-6e40-43b4-aa81-bc8a48a4d214/Culture_Prada_lowres.jpeg";
const IMG_STONE_CIRCLE =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/0ff1081e-b492-4bca-b68a-744a154fcb41/Stone+Circle+Activation.jpg";
const IMG_GREASEWOOD =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/bf65432f-0729-40f2-9a64-6b53888a7360/greasewood-gallery-1-600x400.jpg";
const IMG_HACIENDA =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/d8b5b1a1-5810-48f7-bda1-a3b33294db22/hacienda-1-600x400.jpg";
const IMG_FRIDA =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/4eddca20-2eb5-40f5-9d5d-5b9d164ddb0b/Art_FridaKahlo.jpg";
const IMG_RULE =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/691fc281-d55d-43d2-bb83-c9617b36810d/rulegallery-1-1-600x400.jpg";
const IMG_INDE =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/57bfff1e-0b78-4bea-8a6f-08df705b957e/inde-jacobs-1-600x400.jpg";
const IMG_LOGO =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/72165222-acd9-4e48-b97e-830ddbfd57d6/MARFA_primary+logo_300ppi.png";

// ─── Curated Unsplash supplements (verified URLs, on-tone) ─────────
// Kept to a strict minimum — only used where Visit Marfa's own library
// didn't supply a fitting photo for stay/eat/drink and night-sky.
const IMG_DESERT_NIGHT =
  "https://images.unsplash.com/photo-1532978879514-6cae1bbf16e2?w=1600&q=80"; // milky way over desert
const IMG_DESERT_ROAD =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=80"; // empty desert highway
const IMG_TACO =
  "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=80"; // taco / mexican plate
const IMG_COFFEE =
  "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&q=80"; // espresso & light
const IMG_BAR =
  "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=80"; // mezcal / dim bar
const IMG_GLAMP =
  "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200&q=80"; // bell tent at dusk
const IMG_HOTEL_INT =
  "https://images.unsplash.com/photo-1551776235-dde6d482980b?w=1200&q=80"; // minimal hotel room
const IMG_ADOBE =
  "https://images.unsplash.com/photo-1502786129293-79981df4e689?w=1200&q=80"; // adobe / west tx light

// ─── Desert palette ────────────────────────────────────────────────
const BG = "#faf6f0";          // warm sun-bleached cream
const BG_DEEP = "#f1ead9";     // pale apricot wash
const BG_SAND = "#ebe2cf";     // dust
const PANEL = "#ffffff";
const INK = "#1a1612";          // deep charcoal-oxblood
const INK_SOFT = "#5a4a42";    // warm muted brown
const INK_FAINT = "#8a7d72";   // mesquite
const RUST = "#b85a3e";         // washed terracotta accent
const RUST_DEEP = "#7d2a1b";    // oxblood
const APRICOT = "#d4836b";      // pale apricot
const HAIRLINE = "rgba(26, 22, 18, 0.10)";
const HAIRLINE_SOFT = "rgba(26, 22, 18, 0.06)";

// ─── Type stack ────────────────────────────────────────────────────
// Editorial serif for headlines (Source Serif via Tailwind's font-serif
// fallback chain — no Google Font import needed; system-wide serifs
// look right for the dry, lo-fi tone we want anyway). Sans for body.
const SERIF =
  '"Source Serif Pro", "Source Serif", "Iowan Old Style", "Apple Garamond", "Baskerville", Georgia, serif';

// ─── Motion ────────────────────────────────────────────────────────
const spring = { type: "spring" as const, stiffness: 90, damping: 22 };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: spring },
};
const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9 } },
};

// ─── Reusable building blocks ──────────────────────────────────────
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
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={stagger}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  );
}

/** Editorial caption — small uppercase tracking-wide label. */
function Eyebrow({
  children,
  color = INK_FAINT,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span
      className="inline-block text-[11px] uppercase tracking-[0.22em] font-medium"
      style={{ color }}
    >
      {children}
    </span>
  );
}

/** Thin-rule divider. Marfa-style restraint — used between sections. */
function Rule({ width = "100%" }: { width?: string | number }) {
  return (
    <div
      style={{
        width,
        height: 1,
        background: HAIRLINE,
      }}
    />
  );
}

/** Quiet outlined link with optional arrow. No fills, no glow. */
function QuietLink({
  href,
  children,
  arrow = true,
  color = INK,
}: {
  href: string;
  children: React.ReactNode;
  arrow?: boolean;
  color?: string;
}) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
      style={{ color }}
    >
      <span className="border-b border-current pb-0.5">{children}</span>
      {arrow && (
        <ArrowUpRight
          size={14}
          weight="bold"
          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </a>
  );
}

/** Outlined button — quiet, gallery-grade. */
function OutlinedButton({
  href,
  children,
  variant = "ink",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "ink" | "rust" | "ghost";
}) {
  const colors =
    variant === "rust"
      ? { bg: RUST_DEEP, border: RUST_DEEP, fg: "#fff" }
      : variant === "ghost"
        ? { bg: "transparent", border: "rgba(255,255,255,0.6)", fg: "#fff" }
        : { bg: "transparent", border: INK, fg: INK };
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 px-6 py-3 text-[13px] uppercase tracking-[0.18em] font-medium transition-all hover:opacity-80"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.fg,
      }}
    >
      {children}
      <ArrowRight size={14} weight="regular" />
    </a>
  );
}

/** Bracket-corner frame — a quiet visual quote-mark. */
function BracketCorners({
  color = "rgba(255,255,255,0.7)",
  inset = 18,
  length = 28,
}: {
  color?: string;
  inset?: number;
  length?: number;
}) {
  const stroke = `1px solid ${color}`;
  return (
    <>
      <div style={{ position: "absolute", top: inset, left: inset, width: length, height: length, borderTop: stroke, borderLeft: stroke }} />
      <div style={{ position: "absolute", top: inset, right: inset, width: length, height: length, borderTop: stroke, borderRight: stroke }} />
      <div style={{ position: "absolute", bottom: inset, left: inset, width: length, height: length, borderBottom: stroke, borderLeft: stroke }} />
      <div style={{ position: "absolute", bottom: inset, right: inset, width: length, height: length, borderBottom: stroke, borderRight: stroke }} />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function VisitMarfaPage() {
  return (
    <main
      style={{
        background: BG,
        color: INK,
        fontFamily:
          '"Inter", "Geist", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
      }}
      className="min-h-screen overflow-x-hidden antialiased"
    >
      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{ background: "rgba(250, 246, 240, 0.85)", borderBottom: `1px solid ${HAIRLINE_SOFT}` }}
      >
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3">
            <span
              className="text-[15px] tracking-[0.32em] font-semibold"
              style={{ color: INK }}
            >
              MARFA
            </span>
            <span
              className="hidden sm:inline-block text-[10px] uppercase tracking-[0.24em]"
              style={{ color: INK_FAINT }}
            >
              Visitor Center · est. circa 1883
            </span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-[12px] uppercase tracking-[0.2em]" style={{ color: INK_SOFT }}>
            <a href="#about" className="hover:opacity-60 transition-opacity">About</a>
            <a href="#do" className="hover:opacity-60 transition-opacity">Do</a>
            <a href="#eat" className="hover:opacity-60 transition-opacity">Eat</a>
            <a href="#stay" className="hover:opacity-60 transition-opacity">Stay</a>
            <a href="#when" className="hover:opacity-60 transition-opacity">When</a>
            <a href="#getting-here" className="hover:opacity-60 transition-opacity">Getting here</a>
          </div>
          <a
            href="#plan"
            className="text-[12px] uppercase tracking-[0.2em] font-medium border-b border-current pb-0.5"
            style={{ color: INK }}
          >
            Plan your visit
          </a>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section id="top" className="relative" style={{ background: BG }}>
        <div className="relative h-[88vh] min-h-[640px] max-h-[920px] overflow-hidden">
          <motion.img
            initial={{ scale: 1.06, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            src={IMG_HERO_CUPOLA}
            alt="View from a cupola in Marfa across the Chihuahuan Desert"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(26,22,18,0.10) 0%, rgba(26,22,18,0.0) 35%, rgba(26,22,18,0.0) 60%, rgba(26,22,18,0.55) 100%)",
            }}
          />
          <BracketCorners color="rgba(255,255,255,0.55)" inset={28} length={32} />

          {/* Top eyebrow */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="show"
            className="absolute top-10 left-0 right-0 flex justify-center"
          >
            <span
              className="text-[10px] uppercase tracking-[0.42em] font-medium"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              30°18′N · 104°01′W · 4,688 ft
            </span>
          </motion.div>

          {/* Hero copy */}
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-[1320px] mx-auto w-full px-6 md:px-10 pb-20 md:pb-24">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 0.3, ease: "easeOut" }}
                className="max-w-3xl"
              >
                <span
                  className="block text-[11px] uppercase tracking-[0.32em] mb-6"
                  style={{ color: "rgba(255,255,255,0.78)" }}
                >
                  Marfa, Texas — A Visitor's Field Guide
                </span>
                <h1
                  className="text-[40px] md:text-[64px] lg:text-[78px] leading-[1.04] tracking-[-0.01em] font-light text-white"
                  style={{ fontFamily: SERIF }}
                >
                  A small town in the
                  <br />
                  high desert that
                  <br />
                  punches{" "}
                  <span className="italic" style={{ color: "#f3d9c8" }}>
                    far above
                  </span>{" "}
                  its weight.
                </h1>
                <p
                  className="mt-8 max-w-xl text-[15px] md:text-[16px] leading-[1.7]"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  1,827 people. Thirty-five galleries. Two Pulitzer winners.
                  One prairie-dog colony. The world's largest dark-sky
                  preserve overhead. Marfa is genuinely strange, quietly
                  elegant, and worth the drive.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <OutlinedButton href="#plan" variant="ghost">
                    Plan your visit
                  </OutlinedButton>
                  <a
                    href="#about"
                    className="text-[12px] uppercase tracking-[0.22em] font-medium border-b border-white/60 pb-0.5 text-white/90 hover:text-white transition-colors"
                  >
                    Or read on first
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ORIENTATION STRIP ──────────────────────────────────── */}
      <SectionReveal className="border-t border-b" style={{ borderColor: HAIRLINE_SOFT, background: BG }}>
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {[
            { k: "Population", v: "1,827", note: "give or take a few artists" },
            { k: "Elevation", v: "4,688 ft", note: "high desert; thin, dry air" },
            { k: "Nearest airport", v: "3 hrs", note: "El Paso (ELP) or Midland (MAF)" },
            { k: "Nearest Whole Foods", v: "—", note: "honestly, don't worry about it" },
          ].map((s) => (
            <motion.div key={s.k} variants={fadeUp}>
              <Eyebrow>{s.k}</Eyebrow>
              <p
                className="mt-3 text-3xl md:text-4xl font-light leading-none"
                style={{ fontFamily: SERIF, color: INK }}
              >
                {s.v}
              </p>
              <p className="mt-2 text-[13px] italic" style={{ color: INK_FAINT }}>
                {s.note}
              </p>
            </motion.div>
          ))}
        </div>
      </SectionReveal>

      {/* ── ABOUT — what marfa is ─────────────────────────────── */}
      <SectionReveal id="about" className="relative" style={{ background: BG }}>
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-28 md:py-36 grid md:grid-cols-12 gap-12">
          <motion.div variants={fadeUp} className="md:col-span-4">
            <Eyebrow>Why people come</Eyebrow>
            <h2
              className="mt-6 text-3xl md:text-4xl font-light leading-[1.1]"
              style={{ fontFamily: SERIF, color: INK }}
            >
              What you're walking into.
            </h2>
          </motion.div>
          <motion.div variants={fadeUp} className="md:col-span-7 md:col-start-6">
            <div
              className="text-[17px] md:text-[19px] leading-[1.7] space-y-6"
              style={{ color: INK_SOFT, fontFamily: SERIF }}
            >
              <p>
                Marfa is a railroad town that became an art town that
                became, somehow, a verb. <span style={{ color: INK }}>People come here for the quiet.</span>{" "}
                For Donald Judd's permanent installations at the Chinati
                Foundation. For the way the late-afternoon light bends
                across an aluminum box sitting in a converted artillery
                shed. For the lights that nobody can quite explain.
              </p>
              <p>
                It's a working ranching community of roughly eighteen
                hundred people, three hours from anywhere, that happens
                to support a year-round contemporary art program, a
                handful of remarkable restaurants, and a small constellation
                of bars and bookstores you'd expect in a city ten times
                its size. The contradictions are part of it. So is the
                drive.
              </p>
            </div>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ── THINGS TO DO ────────────────────────────────────────── */}
      <SectionReveal id="do" style={{ background: BG_DEEP }}>
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-28 md:py-36">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-16">
            <div>
              <Eyebrow color={RUST_DEEP}>I. Things to do</Eyebrow>
              <h2
                className="mt-4 text-4xl md:text-5xl font-light leading-[1.05] max-w-2xl"
                style={{ fontFamily: SERIF, color: INK }}
              >
                A short, opinionated list of the things actually worth your time.
              </h2>
            </div>
            <p className="text-[14px] max-w-sm" style={{ color: INK_SOFT }}>
              Marfa rewards slowness. Pick three of these. Don't try to do
              all eight in a weekend — you won't, and you'll resent us for
              suggesting it.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-x-6 gap-y-16">
            {/* Chinati — large feature */}
            <motion.div variants={fadeUp} className="md:col-span-7 md:row-span-2">
              <ThingCard
                image={IMG_CHINATI}
                eyebrow="Permanent collection"
                title="The Chinati Foundation"
                copy="Donald Judd's masterwork — a former army base whose hangars and barracks now house his fifteen untitled works in concrete, his hundred milled-aluminum boxes, plus permanent installations by Dan Flavin, Robert Irwin, and others. The full tour is six hours, by reservation, and is the single most important reason to come to Marfa."
                meta="By reservation · ~6 hrs full tour"
                href="https://chinati.org"
                tall
              />
            </motion.div>

            {/* Prada Marfa */}
            <motion.div variants={fadeUp} className="md:col-span-5">
              <ThingCard
                image={IMG_PRADA}
                eyebrow="Roadside installation"
                title="Prada Marfa"
                copy="Elmgreen & Dragset's permanent sculpture sits in the dust thirty-seven miles northwest of town. It is not a store. It has never been a store. It is, somehow, exactly worth the drive."
                meta="Free · 24/7 · US-90, Valentine TX"
              />
            </motion.div>

            {/* Marfa Lights */}
            <motion.div variants={fadeUp} className="md:col-span-5">
              <ThingCard
                image={IMG_SKY_ISLAND}
                eyebrow="Unexplained phenomena"
                title="The Marfa Lights"
                copy="Mysterious orbs that have been showing up on the horizon east of town since at least 1883. The official viewing area is nine miles out on US-90. Bring a jacket — desert nights drop fifty degrees, and the lights are happier when you wait."
                meta="Free · After dark · US-90 viewing area"
              />
            </motion.div>

            {/* Ballroom Marfa */}
            <motion.div variants={fadeUp} className="md:col-span-6">
              <ThingCard
                image={IMG_BALLROOM}
                eyebrow="Contemporary art"
                title="Ballroom Marfa"
                copy="Non-profit kunsthalle in a 1927 dance hall on Highland Avenue, programming exhibitions, film screenings, and the kind of music acts you don't expect to find in a town of two thousand. Free admission, always."
                meta="108 E San Antonio St · Free"
                href="https://ballroommarfa.org"
              />
            </motion.div>

            {/* Stargazing — McDonald */}
            <motion.div variants={fadeUp} className="md:col-span-6">
              <ThingCard
                image={IMG_DESERT_NIGHT}
                eyebrow="Dark-sky preserve"
                title="McDonald Observatory · Star Parties"
                copy="Forty-five minutes north on the Davis Mountains. The sky here is genuinely as dark as anywhere in the lower forty-eight. Tuesday/Friday/Saturday star parties run year-round. Reserve weeks ahead — they fill."
                meta="Davis Mountains · ~45 min N"
                href="https://mcdonaldobservatory.org"
              />
            </motion.div>

            {/* Galleries strip */}
            <motion.div variants={fadeUp} className="md:col-span-6">
              <ThingCard
                image={IMG_RULE}
                eyebrow="Independent galleries"
                title="The gallery walk"
                copy="Greasewood, RULE, Inde/Jacobs, Marfa Open, Hacienda del Arcón, the Marfa Studio of Arts. Most cluster in a four-block grid downtown. An afternoon's worth, comfortably. None of them feel like New York. That's the point."
                meta="Walking distance · Downtown"
              />
            </motion.div>

            {/* Marfa Book Co + Stone Circle */}
            <motion.div variants={fadeUp} className="md:col-span-6">
              <ThingCard
                image={IMG_STONE_CIRCLE}
                eyebrow="On the way out of town"
                title="Haroon Mirza's Stone Circle"
                copy="A solar-powered, lunar-cycle-activated ring of Marfa stone, about a mile out into the grasslands. Best at full moon, when it does its thing. Bring water; the walk in is short but exposed."
                meta="Free · Off Antelope Hills Rd"
              />
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ── EAT & DRINK ────────────────────────────────────────── */}
      <SectionReveal id="eat" style={{ background: BG }}>
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-28 md:py-36">
          <div className="grid md:grid-cols-12 gap-12 mb-20">
            <div className="md:col-span-5">
              <Eyebrow color={RUST_DEEP}>II. Eat & Drink</Eyebrow>
              <h2
                className="mt-4 text-4xl md:text-5xl font-light leading-[1.05]"
                style={{ fontFamily: SERIF, color: INK }}
              >
                A food scene
                <br />
                disproportionate to
                <br />
                its zip code.
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p
                className="text-[16px] md:text-[18px] leading-[1.75]"
                style={{ color: INK_SOFT, fontFamily: SERIF }}
              >
                A few caveats: most kitchens are closed Tuesdays and
                Wednesdays. Reservations are non-negotiable on weekends.
                And the best meal in town might still be a foil-wrapped
                burrito eaten standing on a sidewalk at ten in the morning.
                That's just how it is here.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-x-6 gap-y-12">
            <EatCard
              image={IMG_TACO}
              name="Marfa Burrito"
              kind="Sonoran · breakfast"
              copy="Ramona's place. Hand-rolled flour tortillas the size of a dinner plate, machaca that has not changed since the 1980s. Cash. Counter only. Closed unpredictably. Worth every minute of that uncertainty."
            />
            <EatCard
              image={IMG_HACIENDA}
              name="Cochineal"
              kind="Modern · dinner only"
              copy="Tom Rapp's quiet, ingredient-driven menu in a low-slung adobe. White tablecloths, dim light, perfect bread. The closest thing Marfa has to a special-occasion restaurant — and it deserves the title."
            />
            <EatCard
              image={IMG_FRIDA}
              name="Stellina"
              kind="Italian · seasonal"
              copy="A wood-fired oven, a tight wine list, and pasta that would hold its own in Brooklyn. Tucked into a small storefront on Highland. Book ahead."
            />
            <EatCard
              image={IMG_GREASEWOOD}
              name="Convenience West BBQ"
              kind="Texas BBQ · weekends"
              copy="Brisket and house-made hot links from a converted gas station. Open Friday through Sunday until they sell out, which is often by 2 p.m. Show up early or don't bother."
            />
            <EatCard
              image={IMG_COFFEE}
              name="Frama"
              kind="Coffee + ice cream"
              copy="Inside the laundromat. Yes, really. Espresso pulled by people who care, paired with house-made ice cream. The Marfa morning ritual for nearly everyone in town."
            />
            <EatCard
              image={IMG_BAR}
              name="Lost Horse Saloon"
              kind="Dive · late"
              copy="Ty Mitchell's saloon. Pool table, live country, mounted heads, no irony whatsoever. The truest dive in West Texas, and the place every visitor secretly hopes Marfa is when they show up."
            />
          </div>

          <div className="mt-20 pt-10 border-t" style={{ borderColor: HAIRLINE }}>
            <p className="text-[14px] italic max-w-2xl" style={{ color: INK_FAINT }}>
              Also worth your time, in no particular order: Bordo for
              natural wine and small plates, Para Llevar for tortas, the
              bar at Hotel Saint George for a quiet cocktail, Marfa Spirit
              Co. for gin distilled within walking distance.
            </p>
          </div>
        </div>
      </SectionReveal>

      {/* ── STAY ────────────────────────────────────────────────── */}
      <SectionReveal id="stay" style={{ background: BG_SAND }}>
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-28 md:py-36">
          <div className="mb-16 max-w-3xl">
            <Eyebrow color={RUST_DEEP}>III. Where to stay</Eyebrow>
            <h2
              className="mt-4 text-4xl md:text-5xl font-light leading-[1.05]"
              style={{ fontFamily: SERIF, color: INK }}
            >
              Sleep in a vintage trailer, a 1930 hotel, or a yurt under the milky way.
            </h2>
            <p
              className="mt-8 text-[16px] md:text-[17px] leading-[1.7]"
              style={{ color: INK_SOFT }}
            >
              Marfa's lodging is small in number and outsized in personality.
              Book six to ten weeks ahead of any festival weekend. Off-season
              midweek, you can usually walk in.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-x-10 gap-y-16">
            <StayCard
              image={IMG_HOTEL_INT}
              eyebrow="Restored 1930 Hotel"
              name="Hotel Saint George"
              copy="Fifty-five rooms in a quietly elegant downtown hotel — Marfa's anchor since 2016. The lobby bar is a destination of its own, and Lala's restaurant on the ground floor is one of the best in town. Walking distance to nearly everything."
              meta="105 S Highland Ave · marfasaintgeorge.com"
            />
            <StayCard
              image={IMG_GLAMP}
              eyebrow="Glamping · since 2009"
              name="El Cosmico"
              copy="Liz Lambert's eighteen-acre nomadic hotel campground. Vintage trailers, safari tents, yurts, Sioux-style tipis. A community kitchen, hammock grove, and outdoor wood-fired hot tubs. The platonic ideal of a Marfa stay."
              meta="802 S Highland Ave · elcosmico.com"
            />
            <StayCard
              image={IMG_ADOBE}
              eyebrow="Mid-century · 41 rooms"
              name="The Thunderbird"
              copy="Mid-century motor lodge reimagined: Frette linens, Aesop amenities, a saltwater pool. The aesthetic moves people make their wallpaper for the next ten years happen here."
              meta="601 W San Antonio St · thunderbirdmarfa.com"
            />
            <StayCard
              image={IMG_GIANT_MURAL}
              eyebrow="Architect-designed bungalows"
              name="The Sentinel · Hotel Paisano · Casa Marfa"
              copy="The Sentinel is a converted 1925 newspaper office with a bar and bookshop downstairs. The Paisano is the historic 1930 Trost-designed property where the cast of Giant stayed in 1955. Casa Marfa and the Airbnb scene round out the rest."
              meta="Various · downtown footprint"
            />
          </div>
        </div>
      </SectionReveal>

      {/* ── WHEN TO COME ────────────────────────────────────────── */}
      <SectionReveal id="when" style={{ background: BG }}>
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-28 md:py-36 grid md:grid-cols-12 gap-12">
          <motion.div variants={fadeUp} className="md:col-span-4">
            <Eyebrow color={RUST_DEEP}>IV. When to come</Eyebrow>
            <h2
              className="mt-4 text-4xl md:text-5xl font-light leading-[1.05]"
              style={{ fontFamily: SERIF, color: INK }}
            >
              The honest seasonal guide.
            </h2>
            <p
              className="mt-8 text-[15px] leading-[1.7]"
              style={{ color: INK_SOFT }}
            >
              Marfa is open year-round, but not every month is created
              equal. We'd rather tell you the truth than promise you that
              August is fine. (It is not fine.)
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="md:col-span-7 md:col-start-6">
            <ul className="divide-y" style={{ borderColor: HAIRLINE }}>
              {[
                {
                  m: "March – May",
                  h: "Peak shoulder",
                  c: "Wildflowers in late March, mild days, cool nights. The single best window of the year. Book early.",
                },
                {
                  m: "June – August",
                  h: "Hot, real hot",
                  c: "Highs in the upper nineties; thin shade. July days are long but heavy. Avoid bringing a camper in August. Mornings and dusk redeem it.",
                },
                {
                  m: "September",
                  h: "Trans-Pecos Festival",
                  c: "Late-September brings the Trans-Pecos Festival of Music & Love at El Cosmico — the town's biggest weekend. Book three months out.",
                },
                {
                  m: "October",
                  h: "Chinati Weekend · the perfect month",
                  c: "Chinati Weekend (early October) is the art-world's annual pilgrimage. Days are sixty-five and golden. If you can only come once, come now.",
                },
                {
                  m: "November – February",
                  h: "Quiet, occasionally cold",
                  c: "Slowest months — beautiful for the same reason. Some restaurants take winter breaks. Pack layers; the desert is colder at night than people expect.",
                },
              ].map((row) => (
                <li
                  key={row.m}
                  className="grid grid-cols-12 gap-4 py-6 first:pt-0"
                  style={{ borderBottom: `1px solid ${HAIRLINE}` }}
                >
                  <div className="col-span-12 md:col-span-4">
                    <p
                      className="text-[15px] font-medium"
                      style={{ fontFamily: SERIF, color: INK }}
                    >
                      {row.m}
                    </p>
                    <p
                      className="mt-1 text-[12px] uppercase tracking-[0.18em]"
                      style={{ color: RUST_DEEP }}
                    >
                      {row.h}
                    </p>
                  </div>
                  <p
                    className="col-span-12 md:col-span-8 text-[15px] leading-[1.65]"
                    style={{ color: INK_SOFT }}
                  >
                    {row.c}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ── GETTING HERE ─────────────────────────────────────── */}
      <SectionReveal id="getting-here" className="relative" style={{ background: BG_DEEP }}>
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-28 md:py-36 grid md:grid-cols-12 gap-12 items-start">
          <motion.div variants={fadeUp} className="md:col-span-5 md:sticky md:top-24">
            <Eyebrow color={RUST_DEEP}>V. Getting here</Eyebrow>
            <h2
              className="mt-4 text-4xl md:text-5xl font-light leading-[1.05]"
              style={{ fontFamily: SERIF, color: INK }}
            >
              It's far. That's part of it.
            </h2>
            <p
              className="mt-8 text-[16px] leading-[1.75]"
              style={{ color: INK_SOFT, fontFamily: SERIF }}
            >
              Marfa has no commercial airport. The nearest runway with a
              regular flight is three hours away. There is no rideshare
              once you arrive. The drive in — through nothing, then
              suddenly through something — is genuinely part of why this
              place keeps its character. Plan around it.
            </p>
            <div className="mt-10">
              <img
                src={IMG_DESERT_ROAD}
                alt="Empty highway through the West Texas high desert"
                className="w-full aspect-[4/3] object-cover"
                style={{ filter: "saturate(0.85) contrast(1.02)" }}
              />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="md:col-span-6 md:col-start-7">
            <div className="space-y-10">
              <DriveRow city="El Paso (ELP)" hours="3 hrs" miles="195 mi" note="The most reliable airport. American + Southwest service. Rent a car at the airport." />
              <DriveRow city="Midland-Odessa (MAF)" hours="3 hrs" miles="170 mi" note="Smaller airport, fewer connections, but closer if you're flying United from a hub." />
              <DriveRow city="San Antonio" hours="6 hrs" miles="395 mi" note="Long but scenic — through the Hill Country and onto US-90 W. Doable in a day with stops." />
              <DriveRow city="Austin" hours="7 hrs" miles="445 mi" note="Add 90 minutes vs. SAT. Best broken into two days with a Big Bend or Alpine overnight." />
              <DriveRow city="Big Bend National Park" hours="1.5 hrs" miles="80 mi" note="If you're already coming this far, give Big Bend two extra days. You won't regret it." />

              <div className="pt-6" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
                <Eyebrow>Inside town</Eyebrow>
                <p className="mt-4 text-[15px] leading-[1.7]" style={{ color: INK_SOFT }}>
                  Marfa is twelve square blocks. You'll walk most of it.
                  No Uber. Local cabs exist but are not a system. If
                  you're going out to Prada Marfa, the Lights viewing
                  area, or the McDonald Observatory, you'll need your
                  car.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ── INQUIRY ─────────────────────────────────────────────── */}
      <SectionReveal id="plan" style={{ background: BG }}>
        <div className="max-w-[920px] mx-auto px-6 md:px-10 py-28 md:py-36">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <Eyebrow color={RUST_DEEP}>Plan your visit</Eyebrow>
            <h2
              className="mt-4 text-4xl md:text-5xl font-light leading-[1.05]"
              style={{ fontFamily: SERIF, color: INK }}
            >
              Tell us a little about
              <br />
              the trip you have in mind.
            </h2>
            <p
              className="mt-6 text-[15px] md:text-[16px] leading-[1.7] max-w-xl mx-auto"
              style={{ color: INK_SOFT }}
            >
              The Visitor Center can point you to lodging that hasn't
              filled, restaurants taking reservations the week you're
              here, and the events that won't show up on Eventbrite. Send
              us a note — a real person reads every one.
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <InquiryForm
              slug="visit-marfa"
              accent={RUST_DEEP}
              accentDeep={RUST_DEEP}
              ink={INK}
              inkSoft={INK_SOFT}
              panelBg={PANEL}
              serif={SERIF}
              submitLabel="Send"
              successHeading="Thank you. We'll be in touch."
              successBody="Someone at the Marfa Visitor Center will get back to you within one business day with recommendations tailored to the dates you sent. For anything time-sensitive, call (432) 729-4772 — we answer the phone."
              fields={[
                { type: "text", name: "name", label: "Your name *", placeholder: "First and last", required: true },
                { type: "email", name: "email", label: "Email *", placeholder: "you@example.com", required: true },
                { type: "text", name: "visit_window", label: "When are you thinking?", placeholder: "e.g. mid-October 2026, or 'flexible'" },
                { type: "text", name: "party_size", label: "Party size", placeholder: "e.g. 2 adults, or family of 4" },
                {
                  type: "select",
                  name: "primary_interest",
                  label: "Primary interest",
                  options: [
                    { value: "art", label: "Art & galleries (Chinati, Ballroom, etc.)" },
                    { value: "food", label: "Food & drink" },
                    { value: "stay", label: "Lodging recommendations" },
                    { value: "events", label: "A specific event or festival" },
                    { value: "stargazing", label: "Stargazing / dark-sky" },
                    { value: "first-time", label: "First-time visitor — open to anything" },
                    { value: "other", label: "Something else / not sure yet" },
                  ],
                },
                {
                  type: "textarea",
                  name: "message",
                  label: "Anything we should know?",
                  placeholder: "Mobility, dietary, anniversary, you've been here three times before — anything that helps us point you somewhere good.",
                  rows: 4,
                },
              ]}
            />
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-12 grid sm:grid-cols-3 gap-6 text-[13px]"
            style={{ color: INK_SOFT }}
          >
            <div className="flex items-start gap-3">
              <MapPin size={18} weight="regular" style={{ color: RUST_DEEP, flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="font-medium" style={{ color: INK }}>Visitor Center</p>
                <p className="leading-[1.6]">302 S. Highland Ave.<br />Marfa, TX 79843</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={18} weight="regular" style={{ color: RUST_DEEP, flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="font-medium" style={{ color: INK }}>Phone</p>
                <a href="tel:4327294772" className="leading-[1.6] hover:opacity-70 transition-opacity">
                  (432) 729-4772
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Envelope size={18} weight="regular" style={{ color: RUST_DEEP, flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="font-medium" style={{ color: INK }}>Email</p>
                <a href="mailto:contact@visitmarfa.com" className="leading-[1.6] hover:opacity-70 transition-opacity">
                  contact@visitmarfa.com
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer
        className="border-t"
        style={{ borderColor: HAIRLINE, background: BG_DEEP }}
      >
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-14 grid md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-5">
            <img
              src={IMG_LOGO}
              alt="Visit Marfa logo"
              className="h-12 w-auto mb-6 opacity-90"
              style={{ filter: "grayscale(0.2)" }}
            />
            <p
              className="text-[15px] leading-[1.7] max-w-md"
              style={{ color: INK_SOFT, fontFamily: SERIF }}
            >
              An oasis of culture in the Chihuahuan Desert. Run by the
              MARFA Visitor Center, a community-led organization.
            </p>
          </div>

          <div className="md:col-span-3">
            <Eyebrow>Visit</Eyebrow>
            <ul className="mt-4 space-y-2.5 text-[14px]" style={{ color: INK_SOFT }}>
              <li><a href="#do" className="hover:text-[#1a1612] transition-colors">Things to do</a></li>
              <li><a href="#eat" className="hover:text-[#1a1612] transition-colors">Eat & drink</a></li>
              <li><a href="#stay" className="hover:text-[#1a1612] transition-colors">Where to stay</a></li>
              <li><a href="#when" className="hover:text-[#1a1612] transition-colors">When to come</a></li>
              <li><a href="#getting-here" className="hover:text-[#1a1612] transition-colors">Getting here</a></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <Eyebrow>Contact</Eyebrow>
            <p className="mt-4 text-[14px] leading-[1.7]" style={{ color: INK_SOFT }}>
              302 S. Highland Ave.<br />
              Marfa, TX 79843<br />
              <a href="tel:4327294772" className="hover:text-[#1a1612] transition-colors">(432) 729-4772</a><br />
              <a href="mailto:contact@visitmarfa.com" className="hover:text-[#1a1612] transition-colors">contact@visitmarfa.com</a>
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://instagram.com/visitmarfatx"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:bg-[#1a1612] hover:text-white"
                style={{ borderColor: HAIRLINE, color: INK_SOFT }}
              >
                <InstagramLogo size={16} weight="regular" />
              </a>
              <a
                href="https://facebook.com/VisitMarfa"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:bg-[#1a1612] hover:text-white"
                style={{ borderColor: HAIRLINE, color: INK_SOFT }}
              >
                <FacebookLogo size={16} weight="regular" />
              </a>
            </div>
          </div>
        </div>

        <div
          className="px-6 md:px-10 py-6 border-t flex flex-col md:flex-row items-center justify-between gap-3 text-[12px]"
          style={{ borderColor: HAIRLINE_SOFT, color: INK_FAINT }}
        >
          <p className="max-w-[1320px] mx-auto w-full flex flex-wrap items-center justify-between gap-3">
            <span>© {new Date().getFullYear()} Marfa Visitor Center · Marfa, Texas</span>
            <span className="italic">"An oasis of culture in West Texas's Chihuahuan Desert."</span>
          </p>
        </div>
      </footer>
    </main>
  );
}

// ─── Card components ──────────────────────────────────────────────

function ThingCard({
  image,
  eyebrow,
  title,
  copy,
  meta,
  href,
  tall = false,
}: {
  image: string;
  eyebrow: string;
  title: string;
  copy: string;
  meta?: string;
  href?: string;
  tall?: boolean;
}) {
  return (
    <article className="group">
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: tall ? "4 / 5" : "4 / 3" }}
      >
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]"
        />
      </div>
      <div className="pt-6">
        <Eyebrow color={RUST_DEEP}>{eyebrow}</Eyebrow>
        <h3
          className="mt-3 text-2xl md:text-[28px] font-light leading-[1.15]"
          style={{ fontFamily: SERIF, color: INK }}
        >
          {title}
        </h3>
        <p
          className="mt-4 text-[15px] leading-[1.7] max-w-prose"
          style={{ color: INK_SOFT }}
        >
          {copy}
        </p>
        {(meta || href) && (
          <div className="mt-5 flex items-center justify-between gap-4 flex-wrap">
            {meta && (
              <p className="text-[12px] uppercase tracking-[0.16em]" style={{ color: INK_FAINT }}>
                {meta}
              </p>
            )}
            {href && <QuietLink href={href}>Learn more</QuietLink>}
          </div>
        )}
      </div>
    </article>
  );
}

function EatCard({
  image,
  name,
  kind,
  copy,
}: {
  image: string;
  name: string;
  kind: string;
  copy: string;
}) {
  return (
    <article className="group">
      <div className="relative overflow-hidden" style={{ aspectRatio: "5 / 4" }}>
        <img
          src={image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]"
          style={{ filter: "saturate(0.95)" }}
        />
      </div>
      <div className="pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className="text-[22px] font-light"
            style={{ fontFamily: SERIF, color: INK }}
          >
            {name}
          </h3>
          <span className="text-[11px] uppercase tracking-[0.18em]" style={{ color: RUST_DEEP }}>
            {kind}
          </span>
        </div>
        <Rule />
        <p
          className="mt-4 text-[14px] leading-[1.7]"
          style={{ color: INK_SOFT }}
        >
          {copy}
        </p>
      </div>
    </article>
  );
}

function StayCard({
  image,
  eyebrow,
  name,
  copy,
  meta,
}: {
  image: string;
  eyebrow: string;
  name: string;
  copy: string;
  meta: string;
}) {
  return (
    <article className="group">
      <div className="relative overflow-hidden" style={{ aspectRatio: "3 / 2" }}>
        <img
          src={image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]"
        />
      </div>
      <div className="pt-6">
        <Eyebrow color={RUST_DEEP}>{eyebrow}</Eyebrow>
        <h3
          className="mt-3 text-3xl font-light leading-[1.1]"
          style={{ fontFamily: SERIF, color: INK }}
        >
          {name}
        </h3>
        <p className="mt-4 text-[15px] leading-[1.7] max-w-prose" style={{ color: INK_SOFT }}>
          {copy}
        </p>
        <p className="mt-5 text-[12px] uppercase tracking-[0.16em]" style={{ color: INK_FAINT }}>
          {meta}
        </p>
      </div>
    </article>
  );
}

function DriveRow({
  city,
  hours,
  miles,
  note,
}: {
  city: string;
  hours: string;
  miles: string;
  note: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h3
          className="text-2xl font-light"
          style={{ fontFamily: SERIF, color: INK }}
        >
          {city}
        </h3>
        <div className="flex items-baseline gap-3">
          <span
            className="text-[20px] font-light"
            style={{ fontFamily: SERIF, color: RUST_DEEP }}
          >
            {hours}
          </span>
          <span className="text-[12px] uppercase tracking-[0.16em]" style={{ color: INK_FAINT }}>
            {miles}
          </span>
        </div>
      </div>
      <Rule />
      <p className="mt-3 text-[14px] leading-[1.7]" style={{ color: INK_SOFT }}>
        {note}
      </p>
    </div>
  );
}
