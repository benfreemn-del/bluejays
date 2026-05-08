"use client";

/* eslint-disable @next/next/no-img-element -- Marketing showcase, hot-linking Shopify CDN. */

/**
 * /clients/nevarland-outpost — Christopher's bespoke marketing front
 * for nevarlandoutpost.com.
 *
 * Brand voice (locked from web audit 2026-05-07):
 *   "Created to express. Made to mean something."
 *   "Good vibes. Rough edges. Real people."
 *
 * Founder Christopher · father of three daughters · started the brand
 * working through his own mental-health journey · all apparel
 * handmade in the Outpost.
 *
 * Layout pattern:
 *   1. HERO — full-bleed black, oversized type, founder photo right
 *   2. STORY — cream parchment band, typewriter font for the personal
 *              founder letter
 *   3. ADULT COLLECTION — 3 hero tees, real Shopify CDN photos
 *   4. KIDS — Exploring Nature's Secret + custom design CTA
 *   5. CUSTOM SERVICE — DTF print explainer
 *   6. REVIEWS — the 3 real testimonials from the brand audit
 *   7. NEWSLETTER + CONTACT — mailto: pattern (Shopify owns checkout)
 *
 * Stack notes:
 *   - Pure React + Tailwind, no framer-motion (CSS-only animations)
 *   - Shopify CDN photos hot-linked (already public on their domain)
 *   - Newsletter signup mailto:s Christopher until Klaviyo wired
 *     (matches the Laser Lakes no-backend-for-checkout pattern)
 */

import Link from "next/link";
import EmberCanvas from "./EmberCanvas";
import FounderVideoSpot from "./FounderVideoSpot";

/* ───────────────────────── PALETTE ─────────────────────────
   Sampled directly from Christopher's grunge_border.png on the
   live site (2026-05-07). Replaces the candy-rust I had with
   his actual sepia/aged-warm-gray vintage palette so the bespoke
   build reads like an extension of his existing brand instead of
   a re-skin. */
const BG_BLACK = "#0a0a0a";
const BG_CHARCOAL = "#1c1815";          // warm-tinted charcoal (was #1a1a1a)
const BG_PAPER = "#e8dec8";             // warmer parchment (was #f4eee2)
const INK_PAPER = "#1a1812";
const INK_PAPER_SOFT = "#3d3a32";
const ACCENT_RUST = "#a06b3c";          // sepia burnt-sienna (was #c45836)
const ACCENT_RUST_LIGHT = "#b88860";    // lighter sepia tan (was #d97757)
const ACCENT_SAGE = "#7d7e5c";          // washed olive-gray
const METAL = "#8a7654";                // aged sepia gold (was #c4a570)

/* ───────────────────────── ASSETS ─────────────────────────
   Includes 3 brand-asset additions (2026-05-07):
     · stayRealPoster — the "Stay real. Keep growing." brand
       statement Christopher uses on his own site. New hero
       centerpiece (replaces the founder photo, which moves
       lower into the Story section where it belongs).
     · grungeBorder + grungeBorderCustomize — his existing
       grunge-frame PNGs, now used as section dividers across
       the page so the bespoke build inherits brand DNA from
       his Shopify front. */
const ASSETS = {
  founder:
    "https://www.nevarlandoutpost.com/cdn/shop/files/20260215_120213.jpg?v=1771735328&width=1500",
  logo:
    "https://www.nevarlandoutpost.com/cdn/shop/files/logo_icon_2.png?v=1778202492&width=600",
  stayRealPoster:
    "https://www.nevarlandoutpost.com/cdn/shop/files/Stay_real._Keep_growing..png?v=1771786570&width=1100",
  grungeBorder:
    "https://www.nevarlandoutpost.com/cdn/shop/files/grunge_border.png?v=1771731640&width=3200",
  grungeBorderCustomize:
    "https://www.nevarlandoutpost.com/cdn/shop/files/grunge_border_CUSTOMIZE.png?v=1771732610&width=3200",
  grungeBorderDtf:
    "https://www.nevarlandoutpost.com/cdn/shop/files/grunge_border_DTF.png?v=1771732365&width=3200",
  productDiscipline:
    "https://www.nevarlandoutpost.com/cdn/shop/files/DISCIPLINESHIRTLOGOMAINSILK2.jpg?v=1776362431&width=900",
  productLegacy:
    "https://www.nevarlandoutpost.com/cdn/shop/files/LEGACYBLK1.jpg?v=1776549667&width=900",
  productSmile:
    "https://www.nevarlandoutpost.com/cdn/shop/files/SMILE_BLK_SHIRT2_e958628f-a085-45b3-a7bc-e42a4c9dcdae.jpg?v=1776548823&width=900",
  productKids:
    "https://www.nevarlandoutpost.com/cdn/shop/files/1000020111.jpg?v=1777851899&width=900",
} as const;

/* ───────────────────────── DATA ───────────────────────── */
type Tee = {
  id: string;
  name: string;
  fabric: string;
  price: string;
  message: string;
  shopUrl: string;
  imgUrl: string;
};

const ADULT_TEES: Tee[] = [
  {
    id: "discipline",
    name: "DISCIPLINE > MOTIVATION",
    fabric: "CVC Premium Blend",
    price: "$21.99",
    message:
      "Motivation runs out. Discipline doesn't. Wear the reminder.",
    shopUrl: "https://nevarlandoutpost.com/products/discipline",
    imgUrl: ASSETS.productDiscipline,
  },
  {
    id: "legacy",
    name: "Legacy > Validation",
    fabric: "CVC Premium Blend · Long Game",
    price: "$21.99",
    message:
      "Build something your kids inherit, not something the algorithm rewards.",
    shopUrl: "https://nevarlandoutpost.com/products/legacy",
    imgUrl: ASSETS.productLegacy,
  },
  {
    id: "smile",
    name: "Smile. You Are Loved.",
    fabric: "CVC Premium Blend",
    price: "$21.99",
    message:
      "For the days you forget. Worn by introverts, creatives, and parents who carry a lot.",
    shopUrl: "https://nevarlandoutpost.com/products/smile",
    imgUrl: ASSETS.productSmile,
  },
];

const REVIEWS = [
  {
    name: "Jessica Green",
    date: "April 2026",
    text: "I absolutely love everything I have purchased from NevarLand Outpost!",
  },
  {
    name: "Haley Ford",
    date: "October 2025",
    text:
      "Love using NevarLand Outpost for our children's needs. Quick, responsive & a great service for kids' clothes & accessories.",
  },
  {
    name: "Verified buyer",
    date: "2025",
    text:
      "Handmade, real craftsmanship — the message on the tee actually means something.",
  },
];

const VALUES = [
  {
    emoji: "🧠",
    title: "Mental health first",
    desc: "Every design starts with: 'what would I want my kids to read on a hard day?'",
  },
  {
    emoji: "👨‍👧‍👧",
    title: "Family-built",
    desc: "Father of three daughters. The Outpost is a family workshop, not a factory.",
  },
  {
    emoji: "🪡",
    title: "Handmade in the Outpost",
    desc: "Heat-pressed in-house. DTF prints on premium-blend cotton, never poly.",
  },
  {
    emoji: "🌲",
    title: "Real people. Rough edges.",
    desc: "Made for parents, introverts, creatives, anyone who's done pretending.",
  },
];

const SHOP_URL = "https://nevarlandoutpost.com";
const CUSTOM_DESIGN_URL = "https://nevarlandoutpost.com/products/design-your-own";
const CONTACT_EMAIL = "hello@nevarlandoutpost.com";
const PHONE_DISPLAY = "(714) 366-0918";
const PHONE_HREF = "tel:+17143660918";

/* ───────────────────────── COMPONENTS ───────────────────────── */

function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        background: "rgba(10,10,10,0.86)",
        borderColor: "rgba(160,107,60,0.18)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
        <a
          href="#top"
          className="flex items-center gap-3 min-w-0"
          aria-label="NevarLand Outpost"
        >
          <img
            src={ASSETS.logo}
            alt=""
            className="w-8 h-8 object-contain shrink-0"
          />
          <span
            className="flex flex-col leading-tight text-white"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            <span className="text-[15px] sm:text-[17px] font-extrabold tracking-wide">
              NEVARLAND OUTPOST
            </span>
            <span
              className="hidden sm:block text-[10px] tracking-[0.24em] uppercase font-medium"
              style={{ color: ACCENT_RUST_LIGHT }}
            >
              Handmade · Father-Founded
            </span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-white/80">
          <a href="#story" className="hover:text-white transition-colors">
            Story
          </a>
          <a href="#tees" className="hover:text-white transition-colors">
            The Tees
          </a>
          <a href="#kids" className="hover:text-white transition-colors">
            Kids
          </a>
          <a href="#custom" className="hover:text-white transition-colors">
            Custom
          </a>
        </nav>

        <a
          href={SHOP_URL}
          className="inline-flex items-center gap-2 px-5 h-10 rounded-md font-bold text-[12px] uppercase tracking-wide text-white transition-all hover:brightness-110 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${ACCENT_RUST} 0%, ${ACCENT_RUST_LIGHT} 100%)`,
            fontFamily: "'Sora', sans-serif",
            boxShadow: `0 0 20px ${ACCENT_RUST}40`,
          }}
        >
          Shop the Outpost →
        </a>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section
      id="top"
      className="relative overflow-hidden"
      style={{ background: BG_BLACK }}
    >
      {/* ambient grunge wash */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(160,107,60,0.18) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(125,126,92,0.12) 0%, transparent 60%)",
        }}
      />
      {/* film grain */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22/></filter><rect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22/></svg>')",
        }}
      />
      {/* Pointer-reactive embers — drift up like sparks off the heat-
          press; mouse/touch creates a wind that pushes them sideways.
          Sits over grain but below the content. */}
      <EmberCanvas />
      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-24 md:py-32 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        {/* LEFT — copy */}
        <div>
          <p
            className="text-xs uppercase tracking-[0.32em] mb-5 inline-block px-3 py-1 rounded-full border"
            style={{
              color: ACCENT_RUST_LIGHT,
              borderColor: `${ACCENT_RUST}55`,
              background: `${ACCENT_RUST}15`,
              fontFamily: "'Sora', sans-serif",
            }}
          >
            Father-founded · Handmade
          </p>
          <h1
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white leading-[0.95] mb-6"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Created to express.
            <br />
            <span style={{ color: ACCENT_RUST_LIGHT }}>
              Made to mean something.
            </span>
          </h1>
          <p
            className="text-base sm:text-lg leading-relaxed mb-6 max-w-lg"
            style={{ color: "rgba(255,255,255,0.72)", fontFamily: "'Inter', sans-serif" }}
          >
            Handmade tees and custom apparel inspired by family, mental health,
            and real-life adventures. A welcoming space for every kind of human.
          </p>
          <p
            className="text-sm tracking-wide mb-8 italic"
            style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Special Elite', monospace" }}
          >
            Good vibes. Rough edges. Real people.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={SHOP_URL}
              className="inline-flex items-center gap-2 px-7 h-12 rounded-md font-bold text-sm uppercase tracking-wider text-white transition-all hover:brightness-110 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${ACCENT_RUST} 0%, ${ACCENT_RUST_LIGHT} 100%)`,
                boxShadow: `0 4px 20px ${ACCENT_RUST}40`,
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Shop the collection
            </a>
            <a
              href="#story"
              className="inline-flex items-center gap-2 px-7 h-12 rounded-md font-bold text-sm uppercase tracking-wider transition-colors"
              style={{
                color: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(255,255,255,0.18)",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Why we exist →
            </a>
          </div>
          <div className="flex items-center gap-5 mt-10 text-[11px] uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.45)" }}>
            <span className="flex items-center gap-2">
              <span className="inline-block w-1 h-1 rounded-full" style={{ background: ACCENT_SAGE }} />
              Free shipping over $70
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block w-1 h-1 rounded-full" style={{ background: METAL }} />
              Heat-pressed in the Outpost
            </span>
          </div>
        </div>

        {/* RIGHT — Stay Real poster centerpiece. Christopher's own brand
            statement asset, transparent PNG, sits over a sepia glow that
            picks up the embers drifting up from below. */}
        <div className="relative flex items-center justify-center">
          {/* sepia halo behind the poster */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${ACCENT_RUST}38 0%, ${ACCENT_RUST}12 38%, transparent 70%)`,
            }}
          />
          <img
            src={ASSETS.stayRealPoster}
            alt="Stay real. Keep growing."
            className="relative w-full max-w-[520px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)]"
            style={{ animation: "outpost-poster-float 8s ease-in-out infinite" }}
          />
          {/* corner stamp */}
          <div
            aria-hidden="true"
            className="absolute top-2 -left-2 sm:-left-1 w-12 h-12 rounded-md rotate-[-6deg] flex items-center justify-center text-[10px] font-black uppercase tracking-wider"
            style={{
              background: ACCENT_RUST,
              color: BG_BLACK,
              fontFamily: "'Sora', sans-serif",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
          >
            EST.
          </div>
          <style>{`
            @keyframes outpost-poster-float {
              0%, 100% { transform: translateY(0) rotate(-0.4deg); }
              50% { transform: translateY(-10px) rotate(0.4deg); }
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <section
      id="story"
      className="relative py-20 sm:py-28"
      style={{ background: BG_PAPER, color: INK_PAPER }}
    >
      {/* aged-paper grain */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(58,40,23,0.08) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(127,29,29,0.04) 0%, transparent 25%), radial-gradient(circle at 50% 50%, rgba(160,107,60,0.06) 0%, transparent 40%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <p
          className="text-xs uppercase tracking-[0.32em] mb-4 text-center"
          style={{ color: ACCENT_RUST, fontFamily: "'Sora', sans-serif" }}
        >
          A letter from the Outpost
        </p>
        <h2
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-12 text-center"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Why this exists.
        </h2>

        {/* Two-column: Christopher's polaroid on the left, the letter on
            the right. Photo lives HERE — out of the hero, into the personal
            story where it belongs. */}
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-14 items-start">
          {/* polaroid */}
          <div className="relative mx-auto max-w-sm w-full lg:sticky lg:top-24">
            <div
              className="relative p-3 pb-12 rotate-[-2.5deg] shadow-[0_20px_40px_rgba(0,0,0,0.18)]"
              style={{
                background: "#fbf6ea",
                border: `1px solid ${ACCENT_RUST}22`,
              }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={ASSETS.founder}
                  alt="Christopher · founder, NevarLand Outpost"
                  className="w-full h-full object-cover"
                  style={{ filter: "sepia(0.18) saturate(0.92)" }}
                />
              </div>
              <p
                className="absolute bottom-3 left-0 right-0 text-center text-sm italic"
                style={{
                  color: INK_PAPER_SOFT,
                  fontFamily: "'Special Elite', monospace",
                }}
              >
                Christopher · the Outpost
              </p>
              {/* tape */}
              <div
                aria-hidden="true"
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 rotate-[-3deg]"
                style={{
                  background: "rgba(184,136,96,0.35)",
                  borderLeft: "1px dashed rgba(0,0,0,0.08)",
                  borderRight: "1px dashed rgba(0,0,0,0.08)",
                }}
              />
            </div>
            <p
              className="mt-6 text-center text-[11px] uppercase tracking-[0.28em]"
              style={{ color: ACCENT_RUST, fontFamily: "'Sora', sans-serif" }}
            >
              Father of three · Father of the Outpost
            </p>
          </div>

          {/* the letter */}
          <div
            className="space-y-5 text-lg leading-relaxed"
            style={{ color: INK_PAPER_SOFT, fontFamily: "'Special Elite', monospace" }}
          >
          <p>
            <span
              className="float-left mr-2 text-6xl leading-none -mt-1"
              style={{
                color: ACCENT_RUST,
                fontFamily: "'Sora', sans-serif",
                fontWeight: 800,
              }}
            >
              I
            </span>
            started this in the most personal way possible — I wanted to make
            clothes for my kids. Something fun. Something expressive. Something
            that felt like them.
          </p>
          <p>
            As I worked through my own mental-health journey, this small idea
            grew into something bigger. The Outpost became a way to say what I
            couldn't always say out loud — to my daughters, to other parents
            carrying a lot, to the introverts and the creatives and the people
            who quietly hold the line.
          </p>
          <p>
            Every tee is heat-pressed by hand. Every design starts with a
            question: <em style={{ color: ACCENT_RUST }}>what would I want my kids to read on a hard day?</em> The
            messages aren't slogans. They're reminders.
          </p>
          <p>
            You don't have to pretend here. Your story matters. None of us
            should have to walk it alone.
          </p>
          <p
            className="pt-4 italic"
            style={{ color: ACCENT_RUST }}
          >
            — Christopher, the Outpost
          </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AdultTeesSection() {
  return (
    <section
      id="tees"
      className="relative py-20 sm:py-28"
      style={{ background: BG_BLACK }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
          <p
            className="text-xs uppercase tracking-[0.32em] mb-3"
            style={{ color: ACCENT_RUST_LIGHT, fontFamily: "'Sora', sans-serif" }}
          >
            The collection
          </p>
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.05]"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Three tees.
            <br />
            <span style={{ color: ACCENT_RUST_LIGHT }}>
              Each one means something.
            </span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ADULT_TEES.map((tee) => (
            <article
              key={tee.id}
              className="group relative rounded-2xl overflow-hidden border border-white/10"
              style={{ background: BG_CHARCOAL }}
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={tee.imgUrl}
                  alt={`${tee.name} tee`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 60%, rgba(10,10,10,0.6) 100%)",
                  }}
                />
              </div>
              <div className="p-5">
                <h3
                  className="text-lg font-extrabold text-white tracking-tight mb-1"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  {tee.name}
                </h3>
                <p
                  className="text-[11px] uppercase tracking-[0.18em] mb-3"
                  style={{ color: ACCENT_RUST_LIGHT, fontFamily: "'Sora', sans-serif" }}
                >
                  {tee.fabric}
                </p>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>
                  {tee.message}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="text-2xl font-black text-white tabular-nums"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    {tee.price}
                  </span>
                  <a
                    href={tee.shopUrl}
                    className="inline-flex items-center gap-1 text-sm font-bold uppercase tracking-wider transition-colors"
                    style={{ color: ACCENT_RUST_LIGHT }}
                  >
                    Shop →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function KidsSection() {
  return (
    <section
      id="kids"
      className="relative py-20 sm:py-28 overflow-hidden"
      style={{ background: BG_BLACK }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 70% 30%, rgba(125,126,92,0.18) 0%, transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
        <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10">
          <img
            src={ASSETS.productKids}
            alt="Exploring Nature's Secret youth tee"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p
            className="text-xs uppercase tracking-[0.32em] mb-3"
            style={{ color: ACCENT_SAGE, fontFamily: "'Sora', sans-serif" }}
          >
            For the kids
          </p>
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.05] mb-5"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Built for the ones still
            <br />
            <span style={{ color: ACCENT_SAGE }}>discovering everything.</span>
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed mb-6"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            <strong style={{ color: "white" }}>Exploring Nature's Secret</strong>{" "}
            youth adventure tee. 100% cotton jersey, soft enough to live in,
            tough enough for the trail. Designed by a dad of three for kids who
            climb things and ask why.
          </p>
          <div
            className="flex items-baseline gap-4 mb-6"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            <span className="text-3xl font-black text-white tabular-nums">
              $15.99
            </span>
            <span className="text-xs uppercase tracking-[0.18em] text-white/50">
              100% Cotton Jersey
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={SHOP_URL}
              className="inline-flex items-center gap-2 px-7 h-12 rounded-md font-bold text-sm uppercase tracking-wider text-white transition-all hover:brightness-110 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${ACCENT_RUST} 0%, ${ACCENT_RUST_LIGHT} 100%)`,
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Shop kids' tees
            </a>
            <a
              href={CUSTOM_DESIGN_URL}
              className="inline-flex items-center gap-2 px-7 h-12 rounded-md font-bold text-sm uppercase tracking-wider transition-colors"
              style={{
                color: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(255,255,255,0.18)",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Design your own →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function CustomServiceSection() {
  return (
    <section
      id="custom"
      className="relative py-20 sm:py-28"
      style={{ background: BG_PAPER, color: INK_PAPER }}
    >
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p
          className="text-xs uppercase tracking-[0.32em] mb-4"
          style={{ color: ACCENT_RUST, fontFamily: "'Sora', sans-serif" }}
        >
          Design your own
        </p>
        <h2
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] mb-6"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Heat-pressed onto anything
          <br />
          <span style={{ color: ACCENT_RUST }}>
            you put in front of us.
          </span>
        </h2>
        <p
          className="text-lg leading-relaxed max-w-2xl mx-auto mb-10"
          style={{ color: INK_PAPER_SOFT }}
        >
          Send us a sketch, a phrase, a memory. We DTF-print on premium-blend
          cotton, then heat-press in the Outpost. One-of-a-kind drops — no
          minimum, no factory polish, no copy-paste.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mb-10 text-left">
          {[
            { step: "01", title: "Send the idea", body: "A photo, a quote, a kid's drawing — whatever it is." },
            { step: "02", title: "We design + proof", body: "You see the mockup before we touch the press." },
            { step: "03", title: "Heat-press + ship", body: "Made by hand. Shipped from the Outpost." },
          ].map((s) => (
            <div
              key={s.step}
              className="rounded-xl p-5 border"
              style={{
                background: "rgba(255,255,255,0.6)",
                borderColor: `${ACCENT_RUST}33`,
              }}
            >
              <p
                className="text-3xl font-black mb-2"
                style={{ color: ACCENT_RUST, fontFamily: "'Sora', sans-serif" }}
              >
                {s.step}
              </p>
              <h3
                className="text-base font-extrabold mb-2"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: INK_PAPER_SOFT }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
        <a
          href={CUSTOM_DESIGN_URL}
          className="inline-flex items-center gap-2 px-7 h-12 rounded-md font-bold text-sm uppercase tracking-wider text-white transition-all hover:brightness-110 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${ACCENT_RUST} 0%, ${ACCENT_RUST_LIGHT} 100%)`,
            fontFamily: "'Sora', sans-serif",
            boxShadow: `0 4px 20px ${ACCENT_RUST}40`,
          }}
        >
          Start a custom drop →
        </a>
      </div>
    </section>
  );
}

function ValuesSection() {
  return (
    <section
      className="relative py-16 sm:py-20"
      style={{ background: BG_BLACK }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="rounded-xl p-5 border"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div className="text-3xl mb-3">{v.emoji}</div>
              <h3
                className="text-base font-extrabold text-white mb-1"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {v.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  return (
    <section
      className="relative py-20 sm:py-24"
      style={{ background: BG_CHARCOAL }}
    >
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p
          className="text-xs uppercase tracking-[0.32em] mb-3"
          style={{ color: METAL, fontFamily: "'Sora', sans-serif" }}
        >
          Real people · real reviews
        </p>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-12"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          What the Outpost family says.
        </h2>
        <div className="grid sm:grid-cols-3 gap-5 text-left">
          {REVIEWS.map((r) => (
            <article
              key={r.name}
              className="rounded-xl p-6 border"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(138,118,84,0.28)",
              }}
            >
              <p className="text-2xl mb-3" style={{ color: METAL }}>
                ★★★★★
              </p>
              <p
                className="text-sm leading-relaxed mb-5 italic"
                style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'Special Elite', monospace" }}
              >
                "{r.text}"
              </p>
              <p
                className="text-[11px] uppercase tracking-[0.2em] font-bold"
                style={{ color: ACCENT_RUST_LIGHT, fontFamily: "'Sora', sans-serif" }}
              >
                {r.name}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-white/40 mt-1">
                {r.date}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section
      className="relative py-20 sm:py-24 overflow-hidden"
      style={{ background: BG_BLACK }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(160,107,60,0.16) 0%, transparent 65%)",
        }}
      />
      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <p
          className="text-xs uppercase tracking-[0.32em] mb-3"
          style={{ color: ACCENT_RUST_LIGHT, fontFamily: "'Sora', sans-serif" }}
        >
          The Outpost dispatch
        </p>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.05] mb-4"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Slow-burn updates.
          <br />
          <span style={{ color: ACCENT_RUST_LIGHT }}>No spam, ever.</span>
        </h2>
        <p
          className="text-base leading-relaxed mb-8"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          New drops, custom-design slots opening up, and the occasional letter
          from the Outpost. Two emails a month, max.
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=Subscribe%20me%20to%20the%20Outpost%20dispatch&body=Add%20this%20email%20to%20the%20newsletter%20list.%20Thanks!`}
          className="inline-flex items-center gap-2 px-7 h-12 rounded-md font-bold text-sm uppercase tracking-wider text-white transition-all hover:brightness-110 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${ACCENT_RUST} 0%, ${ACCENT_RUST_LIGHT} 100%)`,
            fontFamily: "'Sora', sans-serif",
            boxShadow: `0 4px 20px ${ACCENT_RUST}40`,
          }}
        >
          Sign me up →
        </a>
        <p
          className="text-[11px] uppercase tracking-[0.2em] mt-6"
          style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Sora', sans-serif" }}
        >
          Or text the Outpost · {PHONE_DISPLAY}
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      className="relative py-12 border-t"
      style={{
        background: BG_BLACK,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 grid sm:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <img src={ASSETS.logo} alt="" className="w-8 h-8 object-contain" />
            <span
              className="text-base font-extrabold text-white tracking-wide"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              NEVARLAND OUTPOST
            </span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.55)" }}>
            Handmade apparel · Father-founded · Heat-pressed in the Outpost.
          </p>
        </div>
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.24em] mb-3 font-bold"
            style={{ color: ACCENT_RUST_LIGHT, fontFamily: "'Sora', sans-serif" }}
          >
            Shop
          </p>
          <ul className="space-y-2" style={{ color: "rgba(255,255,255,0.7)" }}>
            <li>
              <a href={SHOP_URL} className="hover:text-white transition-colors">
                All collections
              </a>
            </li>
            <li>
              <a href="#tees" className="hover:text-white transition-colors">
                Adult tees
              </a>
            </li>
            <li>
              <a href="#kids" className="hover:text-white transition-colors">
                Kids
              </a>
            </li>
            <li>
              <a
                href={CUSTOM_DESIGN_URL}
                className="hover:text-white transition-colors"
              >
                Design your own
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.24em] mb-3 font-bold"
            style={{ color: ACCENT_RUST_LIGHT, fontFamily: "'Sora', sans-serif" }}
          >
            Reach the Outpost
          </p>
          <ul className="space-y-2" style={{ color: "rgba(255,255,255,0.7)" }}>
            <li>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="hover:text-white transition-colors"
              >
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              <a href={PHONE_HREF} className="hover:text-white transition-colors">
                {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <Link
                href="/clients/nevarland-outpost/login"
                className="text-[11px] uppercase tracking-wider hover:text-white transition-colors"
              >
                Owner portal →
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 mt-10 pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-3 text-[11px] uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.4)" }}>
        <span>© NevarLand Outpost · All made right here in the Outpost.</span>
        <span style={{ fontFamily: "'Special Elite', monospace", textTransform: "none", letterSpacing: 0 }}>
          Good vibes. Rough edges. Real people.
        </span>
      </div>
    </footer>
  );
}

/* ───────────────────────── PAGE ───────────────────────── */

export default function NevarlandOutpostPage() {
  return (
    <main
      className="min-h-screen"
      style={{
        background: BG_BLACK,
        color: "white",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Header />
      <HeroSection />
      <StorySection />
      <FounderVideoSpot />
      <AdultTeesSection />
      <KidsSection />
      <CustomServiceSection />
      <ValuesSection />
      <ReviewsSection />
      <NewsletterSection />
      <Footer />
    </main>
  );
}
