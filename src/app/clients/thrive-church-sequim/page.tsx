"use client";

/**
 * Thrive Church Sequim — Homepage
 * Concept: "Where Light Breaks" — a dawn-over-the-Olympics editorial.
 * Cream paper · Evergreen ink · Sunrise amber.
 *
 * Typography: Fraunces (display serif) + Instrument Sans (body).
 *   Tailwind classes assume font-display = Fraunces, font-sans = Instrument Sans.
 *   If unconfigured, the arbitrary `font-[Fraunces]` / `font-[Instrument_Sans]`
 *   classes below resolve via @next/font in the root layout.
 */

import { motion } from "framer-motion";
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
const AUDIT_URL = "https://bluejayportfolio.com/audit";

/* ---------- motion helpers ---------- */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

const reveal = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1.2, ease: "easeOut" } },
};

/* ============================================================== */
/*                            PAGE                                 */
/* ============================================================== */
export default function ThriveChurchSequimPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#fbf7ee] font-[Instrument_Sans] text-[#1a1a1a] antialiased selection:bg-[#0d4f4a] selection:text-[#fbf7ee]">
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
    <section className="relative isolate overflow-hidden pt-6 sm:pt-8 lg:pt-10">
      {/* Topographic background */}
      <TopoLines />

      <div className="relative z-10 mx-auto grid max-w-[1480px] grid-cols-1 gap-y-6 px-6 pb-6 sm:px-10 lg:grid-cols-12 lg:gap-x-10 lg:pb-6">
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
            className="mt-4 font-[Fraunces] text-[clamp(2.2rem,4.5vw,4.2rem)] leading-[1] tracking-[-0.02em] text-[#0d4f4a]"
            style={{ fontWeight: 500 }}
          >
            Hope, breaking{" "}
            <em className="italic" style={{ fontWeight: 400 }}>
              like dawn.
            </em>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-4 max-w-xl text-base leading-relaxed text-[#1a1a1a]/80"
          >
            A community church for imperfect people on the mission with Jesus,
            bringing hope and healing to the Olympic Peninsula — and beyond.
            <span className="mt-1.5 block font-[Fraunces] italic text-[#0d4f4a]" style={{ fontWeight: 500 }}>
              You&rsquo;re invited home. Sundays at 10:30.
            </span>
          </motion.p>

          {/* CTA cluster */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-6 flex flex-wrap items-center gap-4"
          >
            <Link
              href="#visit"
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
              className="group inline-flex items-center gap-3 text-sm font-medium uppercase tracking-[0.18em] text-[#0d4f4a] transition-colors hover:text-[#d97706]"
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
            custom={4}
            className="mt-5 inline-flex max-w-md flex-col gap-1 border-l-2 border-[#d97706] pl-4"
          >
            <span className="text-[12px] font-bold uppercase tracking-[0.28em] text-[#d97706]">
              Sunday Gathering
            </span>
            <span className="font-[Fraunces] text-xl text-[#0d4f4a] sm:text-2xl" style={{ fontWeight: 500 }}>
              10:30 a.m. — in person or livestream
            </span>
            <Link
              href={ADDRESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] text-[#1a1a1a]/80 underline-offset-4 hover:text-[#0d4f4a] hover:underline"
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
            <span className="absolute -top-4 left-6 bg-[#fbf7ee] px-2 font-[Fraunces] text-4xl leading-none text-[#d97706]">
              &ldquo;
            </span>
            <blockquote className="font-[Fraunces] text-xl italic leading-snug text-[#0d4f4a] sm:text-2xl" style={{ fontWeight: 500 }}>
              The light shines in the darkness, and the darkness has not
              overcome it.
            </blockquote>
            <figcaption className="mt-3 text-[12px] font-bold uppercase tracking-[0.24em] text-[#d97706]">
              John 1:5
            </figcaption>
          </motion.figure>
        </motion.div>
      </div>
    </section>
  );
}

/* Custom SVG: sunrise over Olympic ridgelines */
function SunriseIllustration() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-[#fdebbf]/40">
      <svg
        viewBox="0 0 600 750"
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#fbbf24" stopOpacity="0.55" />
            <stop offset="75%" stopColor="#d97706" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="55%" stopColor="#fdebbf" />
            <stop offset="100%" stopColor="#fbf7ee" />
          </linearGradient>
          <linearGradient id="mistGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fbf7ee" stopOpacity="0" />
            <stop offset="100%" stopColor="#fbf7ee" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="600" height="750" fill="url(#sky)" />

        {/* Sun halo + disk */}
        <circle cx="380" cy="320" r="260" fill="url(#sunGlow)" />
        <circle cx="380" cy="320" r="78" fill="#d97706" />
        {/* light flare */}
        <ellipse cx="380" cy="320" rx="180" ry="2" fill="#fde68a" opacity="0.5" />

        {/* Far ridge */}
        <path
          d="M0,460 Q90,420 180,440 T360,420 T540,408 L600,418 L600,750 L0,750 Z"
          fill="#0d4f4a"
          opacity="0.22"
        />
        {/* Mid-far ridge */}
        <path
          d="M0,510 L60,490 L130,505 L200,470 L280,485 L350,455 L430,475 L500,450 L570,470 L600,460 L600,750 L0,750 Z"
          fill="#0d4f4a"
          opacity="0.4"
        />

        {/* Mist band */}
        <rect x="0" y="430" width="600" height="160" fill="url(#mistGrad)" />

        {/* Mid ridge — the iconic Olympic profile */}
        <path
          d="M0,565 L40,545 L90,558 L140,520 L195,540 L240,495 L300,520 L355,485 L410,510 L470,478 L520,498 L575,485 L600,492 L600,750 L0,750 Z"
          fill="#0d4f4a"
          opacity="0.7"
        />

        {/* Front ridge — solid */}
        <path
          d="M0,640 L70,620 L150,635 L230,605 L320,625 L400,600 L480,620 L560,605 L600,612 L600,750 L0,750 Z"
          fill="#0d4f4a"
        />

        {/* Mist lines (drawn) */}
        <line
          x1="60"
          y1="490"
          x2="280"
          y2="485"
          stroke="#fbf7ee"
          strokeOpacity="0.7"
          strokeWidth="1.2"
        />
        <line
          x1="340"
          y1="505"
          x2="540"
          y2="498"
          stroke="#fbf7ee"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
        <line
          x1="120"
          y1="558"
          x2="380"
          y2="552"
          stroke="#fbf7ee"
          strokeOpacity="0.4"
          strokeWidth="1.2"
        />

        {/* Tiny birds */}
        <g
          fill="none"
          stroke="#0d4f4a"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
        >
          <path d="M200,220 q6,-8 12,0 q6,-8 12,0" />
          <path d="M250,180 q5,-7 10,0 q5,-7 10,0" />
          <path d="M170,260 q4,-6 8,0 q4,-6 8,0" />
        </g>

        {/* Hand label */}
        <g transform="translate(40,712)">
          <text
            fontFamily="Fraunces, serif"
            fontStyle="italic"
            fontSize="14"
            fill="#0d4f4a"
            opacity="0.75"
          >
            sunrise over the olympics
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
      className="relative overflow-hidden bg-[#fbf7ee] py-20 sm:py-28"
    >
      {/* Watermark mark */}
      <div className="pointer-events-none absolute -right-20 -top-20 opacity-[0.05] sm:-right-10 sm:-top-10">
        <div className="h-[420px] w-[420px]">
          <ThriveMark />
        </div>
      </div>

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
          className="mt-10 font-[Fraunces] text-[clamp(2.6rem,7vw,7.5rem)] font-light leading-[1.02] tracking-[-0.025em] text-[#0d4f4a]"
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
          <p className="font-[Fraunces] text-lg italic leading-relaxed text-[#0d4f4a]">
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
              className="mt-8 font-[Fraunces] text-[clamp(2.4rem,5.5vw,5rem)] font-light leading-[0.98] tracking-[-0.025em] text-[#0d4f4a]"
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
              className="mt-10 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-[#0d4f4a] underline decoration-[#d97706] decoration-2 underline-offset-[6px] transition-colors hover:text-[#d97706]"
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
                      <span className="font-[Fraunces] text-xl text-[#d97706]">
                        0{i + 1}
                      </span>
                      <Icon
                        size={32}
                        weight="duotone"
                        className="mt-0.5 text-[#0d4f4a] transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div>
                      <h3 className="font-[Fraunces] text-2xl text-[#0d4f4a] sm:text-3xl">
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
            <p className="mt-8 font-[Fraunces] text-sm uppercase tracking-[0.3em] text-[#fbf7ee]/75">
              Sunday — recent
            </p>
            <h2
              className="mt-3 font-[Fraunces] text-[clamp(2.6rem,5.8vw,5.5rem)] font-light leading-[0.95] tracking-[-0.025em]"
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
                className="text-sm uppercase tracking-[0.18em] text-[#fbf7ee]/70 underline-offset-4 hover:text-[#fbf7ee] hover:underline"
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
                <span className="font-[Fraunces] text-sm italic text-[#fbf7ee]/80">
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
    <section id="connect" className="relative bg-[#f5ede0] py-16 sm:py-22">
      <div className="mx-auto max-w-[1480px] px-6 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.26em] text-[#0a3a36]">
              <span className="inline-block h-px w-10 bg-[#d97706]" />
              Connect Card
            </div>
            <h2
              className="mt-8 font-[Fraunces] text-[clamp(2.4rem,5.4vw,5rem)] font-light leading-[0.98] tracking-[-0.025em] text-[#0d4f4a]"
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
            <ul className="mt-10 space-y-3 text-sm text-[#1a1a1a]/75">
              <li className="flex items-center gap-3">
                <Sparkle size={12} weight="fill" className="text-[#d97706]" />
                Real reply from a real person
              </li>
              <li className="flex items-center gap-3">
                <Sparkle size={12} weight="fill" className="text-[#d97706]" />
                Usually within a couple of days
              </li>
              <li className="flex items-center gap-3">
                <Sparkle size={12} weight="fill" className="text-[#d97706]" />
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
      href: "/clients/thrive-church-sequim/volunteer",
    },
    {
      tag: "02",
      name: "Next Wave Kids",
      tagline: "Infants through 5th grade.",
      body: "Sundays during the 10:30 service. Safe, fun, and built around helping kids actually love church. Secure check-in just inside the front doors.",
      icon: Baby,
      cta: "Kids ministry",
      accent: "from-[#fef3c7] to-[#fbf7ee]",
      href: "#connect",
    },
    {
      tag: "03",
      name: "Next Wave Youth",
      tagline: "Middle & high school.",
      body: "A space where teenagers can ask hard questions, find friends who get it, and grow into who God made them to be. Weekly hangouts + Sunday gatherings.",
      icon: HandHeart,
      cta: "Youth ministry",
      accent: "from-[#fdebbf] to-[#f5ede0]",
      href: "#connect",
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
    <section id="ministries" className="relative bg-[#fbf7ee] py-16 sm:py-22">
      <div className="mx-auto max-w-[1480px] px-6 sm:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.26em] text-[#0a3a36]">
              <span className="inline-block h-px w-10 bg-[#d97706]" />
              Ministries
            </div>
            <h2
              className="mt-6 font-[Fraunces] text-[clamp(2.4rem,5.5vw,5rem)] font-light leading-[0.98] tracking-[-0.025em] text-[#0d4f4a]"
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
                className={`group relative block h-full overflow-hidden bg-gradient-to-br ${m.accent} p-10 transition-all duration-500 hover:bg-[#0d4f4a] sm:p-12 lg:p-14`}
              >
                  {/* Tag */}
                  <div className="flex items-start justify-between">
                    <span className="font-[Fraunces] text-sm tracking-[0.2em] text-[#d97706] transition-colors duration-500 group-hover:text-[#fdebbf]">
                      {m.tag}
                    </span>
                    <Icon
                      size={36}
                      weight="duotone"
                      className="text-[#0d4f4a] transition-all duration-500 group-hover:scale-110 group-hover:text-[#d97706]"
                    />
                  </div>

                  <h3
                    className="mt-14 font-[Fraunces] text-3xl leading-tight tracking-tight text-[#0d4f4a] transition-colors duration-500 group-hover:text-[#fbf7ee] sm:text-4xl lg:text-5xl"
                    style={{ fontWeight: 500 }}
                  >
                    {m.name}
                  </h3>
                  <p className="mt-3 font-[Fraunces] text-lg italic text-[#0d4f4a]/70 transition-colors duration-500 group-hover:text-[#fdebbf]/85">
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
    <section className="relative overflow-hidden bg-[#1a1612] py-24 text-[#fbf7ee] sm:py-32">
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

      <div className="relative mx-auto max-w-[1480px] px-6 sm:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-[#fbbf24] bg-[#fdebbf] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#1a1612]">
              <span className="block h-1.5 w-1.5 rounded-full bg-[#d97706]" />
              Now Enrolling · 2026 / 2027
            </div>
            <h2
              className="mt-8 font-[Fraunces] text-[clamp(2.6rem,6vw,6rem)] font-light leading-[0.96] tracking-[-0.025em] text-[#fbf7ee]"
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
                className="text-sm uppercase tracking-[0.18em] text-[#fbf7ee]/70 underline-offset-4 hover:text-[#fbbf24] hover:underline"
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
                { stat: "M / W / F", label: "Three-day program" },
                { stat: "9 mo.", label: "School year" },
              ].map((s) => (
                <div
                  key={s.stat}
                  className="bg-[#1a1612] p-8 transition-colors duration-300 hover:bg-[#251e18]"
                >
                  <p
                    className="font-[Fraunces] text-3xl font-light leading-none text-[#fbbf24] sm:text-4xl"
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
      <ChristianMotifs variant="scatter" />
      <div className="relative mx-auto max-w-[1480px] px-6 sm:px-10">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.26em] text-[#0a3a36]">
              <span className="inline-block h-px w-10 bg-[#d97706]" />
              Beliefs
            </div>
            <h2
              className="mt-8 font-[Fraunces] text-[clamp(2.4rem,5.5vw,5rem)] font-light leading-[0.98] tracking-[-0.025em] text-[#0d4f4a]"
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
                  className="group grid grid-cols-[auto_1fr] gap-8 bg-[#fbf7ee] p-8 transition-colors duration-300 hover:bg-[#f5ede0] sm:p-12"
                >
                  <span
                    className="font-[Fraunces] text-[clamp(3rem,8vw,7rem)] font-light leading-none text-[#d97706] transition-transform duration-500 group-hover:-translate-y-1"
                    style={{ fontWeight: 500 }}
                  >
                    {t.numeral}
                  </span>
                  <div className="pt-2">
                    <h3
                      className="font-[Fraunces] text-3xl text-[#0d4f4a] sm:text-4xl"
                      style={{ fontWeight: 500 }}
                    >
                      {t.name}
                    </h3>
                    <p className="mt-2 font-[Fraunces] text-lg italic text-[#0d4f4a]/70">
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
  const fronts = [
    {
      bearing: "N",
      label: "Around the World",
      tagline: "Global mission partners.",
      body: "Supporting missionaries and indigenous leaders across continents — sharing the gospel, planting churches, and meeting practical needs in some of the hardest places.",
      icon: Globe,
    },
    {
      bearing: "E",
      label: "Across the Street",
      tagline: "Loving our neighbors first.",
      body: "Sequim is our parish. We partner with local schools, recovery ministries, food banks, and the Sequim community — because the gospel travels best on first-name terms.",
      icon: House,
    },
    {
      bearing: "S",
      label: "Table of Grace",
      tagline: "Community meals, no questions.",
      body: "A free hot meal served regularly to anyone who shows up — no signups, no sermons, no strings. Just food, warmth, and people who'll remember your name next time.",
      icon: ForkKnife,
    },
  ];
  return (
    <section
      id="outreach"
      className="relative overflow-hidden bg-[#0d4f4a] py-24 text-[#fbf7ee] sm:py-32"
    >
      {/* Compass watermark */}
      <svg
        aria-hidden
        viewBox="0 0 600 600"
        className="pointer-events-none absolute -right-32 top-1/2 hidden h-[520px] w-[520px] -translate-y-1/2 opacity-[0.06] lg:block"
      >
        <g
          fill="none"
          stroke="#fbf7ee"
          strokeWidth="1"
          transform="translate(300,300)"
        >
          <circle r="240" />
          <circle r="180" />
          <circle r="120" />
          <line x1="-260" y1="0" x2="260" y2="0" />
          <line x1="0" y1="-260" x2="0" y2="260" />
          <line x1="-184" y1="-184" x2="184" y2="184" />
          <line x1="-184" y1="184" x2="184" y2="-184" />
          <text
            fontFamily="Fraunces, serif"
            fontSize="20"
            fill="#fbf7ee"
            textAnchor="middle"
            y="-250"
          >
            N
          </text>
          <text
            fontFamily="Fraunces, serif"
            fontSize="20"
            fill="#fbf7ee"
            textAnchor="middle"
            y="270"
          >
            S
          </text>
          <text
            fontFamily="Fraunces, serif"
            fontSize="20"
            fill="#fbf7ee"
            textAnchor="middle"
            x="265"
            y="6"
          >
            E
          </text>
          <text
            fontFamily="Fraunces, serif"
            fontSize="20"
            fill="#fbf7ee"
            textAnchor="middle"
            x="-265"
            y="6"
          >
            W
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
              className="mt-8 font-[Fraunces] text-[clamp(2.4rem,5.5vw,5rem)] font-light leading-[0.98] tracking-[-0.025em]"
              style={{ fontWeight: 500 }}
            >
              Three <em className="italic">directions</em>.<br />
              One mission.
            </h2>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-[#fbf7ee]/85 sm:justify-self-end sm:text-xl">
            The mission isn&rsquo;t in here. It&rsquo;s out there — and our
            work fans out in three directions.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-sm bg-[#fbf7ee]/10 lg:grid-cols-3">
          {fronts.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.a
                key={f.label}
                href="#connect"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative block bg-[#0d4f4a] p-10 transition-colors duration-500 hover:bg-[#0a3d39] sm:p-12"
              >
                <div className="flex items-start justify-between border-b border-[#fbf7ee]/20 pb-6">
                  <span
                    className="font-[Fraunces] text-7xl font-light leading-none text-[#fbbf24]"
                    style={{ fontWeight: 500 }}
                  >
                    {f.bearing}
                  </span>
                  <Icon
                    size={36}
                    weight="duotone"
                    className="text-[#fbbf24]/80 transition-all duration-500 group-hover:scale-110 group-hover:text-[#d97706]"
                  />
                </div>
                <h3
                  className="mt-10 font-[Fraunces] text-3xl tracking-tight sm:text-4xl"
                  style={{ fontWeight: 500 }}
                >
                  {f.label}
                </h3>
                <p className="mt-3 font-[Fraunces] text-lg italic text-[#fbbf24] sm:text-xl">
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
      <div className="mx-auto max-w-[1480px] px-6 sm:px-10">
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
            className="mt-8 font-[Fraunces] text-[clamp(2.6rem,7vw,7rem)] font-light leading-[0.95] tracking-[-0.03em] text-[#0d4f4a]"
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

          <p className="mt-8 font-[Fraunces] text-base italic text-[#0d4f4a]/70">
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
    <section id="prayer" className="relative bg-[#f5ede0] py-16 sm:py-22">
      <div className="mx-auto max-w-[1480px] px-6 sm:px-10">
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
              className="mt-8 font-[Fraunces] text-[clamp(2.4rem,5.4vw,5rem)] font-light leading-[0.98] tracking-[-0.025em] text-[#0d4f4a]"
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
      <ChristianMotifs variant="left" />
      <div className="relative mx-auto max-w-[1480px] px-6 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Postcard-style info card */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.26em] text-[#0a3a36]">
              <span className="inline-block h-px w-10 bg-[#d97706]" />
              Visit Us
            </div>
            <h2
              className="mt-8 font-[Fraunces] text-[clamp(2.4rem,5.5vw,5rem)] font-light leading-[0.98] tracking-[-0.025em] text-[#0d4f4a]"
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
                  <p className="mt-1 font-[Fraunces] text-xl text-[#0d4f4a]">
                    640 N Sequim Ave
                  </p>
                  <p className="font-[Fraunces] text-xl text-[#0d4f4a]">
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
                  <p className="mt-1 font-[Fraunces] text-xl text-[#0d4f4a]">
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
                  <p className="mt-1 font-[Fraunces] text-xl text-[#0d4f4a]">
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
                  <p className="mt-1 font-[Fraunces] text-lg text-[#0d4f4a]">
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
            className="mt-10 font-[Fraunces] text-[clamp(3rem,9vw,10rem)] font-light leading-[0.92] tracking-[-0.035em]"
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
              className="group inline-flex items-center gap-3 text-sm font-medium uppercase tracking-[0.18em] text-[#fbf7ee]/80 transition-colors hover:text-[#d97706]"
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
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="h-12 w-12 text-[#fbbf24]">
                <ThriveMark flat />
              </span>
              <div className="leading-tight">
                <p className="font-[Fraunces] text-2xl text-[#fbf7ee]">
                  Thrive Church
                </p>
                <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#fbbf24]">
                  Sequim, Washington
                </p>
              </div>
            </Link>
            <p className="mt-6 max-w-sm font-[Fraunces] text-base italic leading-relaxed text-[#fbf7ee]/80">
              Imperfect people becoming the church, on the mission with Jesus,
              bringing hope and healing to the world.
            </p>
          </div>

          {/* Nav columns */}
          <div className="sm:col-span-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#fbbf24]">
              Sundays
            </p>
            <ul className="mt-5 space-y-3 text-sm text-[#fbf7ee]/85">
              <li>
                <Link href="#expect" className="transition-colors hover:text-[#d97706]">
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
            <ul className="mt-5 space-y-3 text-sm text-[#fbf7ee]/85">
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
          <p>
            © {new Date().getFullYear()} Thrive Church Sequim. All rights
            reserved.
          </p>
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
