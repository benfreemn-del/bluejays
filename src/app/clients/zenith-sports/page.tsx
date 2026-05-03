/* eslint-disable @next/next/no-img-element -- Static marketing showcase uses plain img tags intentionally; photos are hosted on zenithsports.org's Shopify CDN. */

/**
 * /clients/zenith-sports — Zenith Sports / TEKKY Ball.
 *
 * Bespoke premium showcase for inbound audit lead. Youth soccer training
 * brand built around the TEKKY ball — a smaller-than-regulation training
 * ball that's been weighted to FIFA-size-5 spec. Founded by Philip Lund
 * and Paul Hanson (40+ years coaching).
 *
 * Visual language: athletic premium — deep electric navy + ivory + a
 * lime-green energy pop + warm-amber CTA highlights. Sharp corners,
 * hairline rules, sans-serif headlines tracked tight. Every photo is
 * Zenith's own work, pulled from zenithsports.org's Shopify CDN.
 *
 * Two-page architecture:
 *   - This page: Tekky-focused storytelling, founder duo, before/after,
 *     training drills, single inquiry funnel.
 *   - /clients/zenith-sports/shop: 3 real products with live "Buy on
 *     Zenith Sports" links to their existing Shopify checkout URLs.
 *
 * To wire as the prospect's preview URL:
 *   update prospects set
 *     pricing_tier = 'custom',
 *     custom_site_url = '/clients/zenith-sports'
 *   where slug-of-record matches Zenith Sports.
 */

import {
  ArrowRight,
  ArrowUpRight,
  Quotes,
  CheckCircle,
  Star,
  Lightning,
  ShoppingCart,
  Crosshair,
  Barbell,
  Brain,
  ChartLineUp,
  InstagramLogo,
  FacebookLogo,
  Envelope,
  UsersThree,
  Medal,
} from "@phosphor-icons/react/dist/ssr";

import StickyNav from "./sticky-nav";
import { PhotoZoom, ZoomTrigger } from "./photo-zoom";
import TrainingDrills from "./training-drills";
import VideoCta from "./video-cta";
import InquiryForm from "@/components/clients/InquiryForm";

/* ───────────────────────── BUSINESS ───────────────────────── */
const BUSINESS = {
  name: "Zenith Sports",
  tagline: "Building Better Players, One Touch at a Time",
  product: "TEKKY",
  hero: "Smaller Ball — Bigger Gains",
  email: "info@zenithsports.org",
  emailHref: "mailto:info@zenithsports.org",
  shopifyDomain: "zenithsports.org",
  founders: {
    philip: {
      name: "Philip Lund",
      role: "Co-Founder",
      quote:
        "To inspire kids to enjoy the process of improvement, build confidence, and fall in love with the game. This is not just about training — it is about building a culture.",
    },
    paul: {
      name: "Paul Hanson",
      role: "Co-Founder · 40+ years in the game",
      quote:
        "I've spent extensive years coaching, always with a clear focus on true player development — not just winning games. My approach remains rooted in long-term growth over short-term accolades.",
    },
  },
  socials: {
    instagram: "https://www.instagram.com/zenithsports.tekky",
    facebook: "https://www.facebook.com/zenithsports.tekky",
  },
} as const;

const LOGO =
  "https://zenithsports.org/cdn/shop/files/Zenith_Sports-02-removebg-preview.png";

/* ───────────────────────── PHOTOS (curl-verified 200 — 2026-05-01) ───────────────────────── */
const PHOTOS = {
  // Hero & feature spots
  heroBall: "https://zenithsports.org/cdn/shop/files/c2.jpg", // Tekky in front of soccer goal
  heroAlt: "https://zenithsports.org/cdn/shop/files/zee_ban.jpg",
  slide2: "https://zenithsports.org/cdn/shop/files/slide_2_f.jpg",
  hands: "https://zenithsports.org/cdn/shop/files/c1.jpg", // boy hands holding ball
  ages: "https://zenithsports.org/cdn/shop/files/box_3_img.jpg", // head/neck balance
  founderShot: "https://zenithsports.org/cdn/shop/files/img_554.jpg",
  untitledDesign: "https://zenithsports.org/cdn/shop/files/Untitled_design.jpg",
  after: "https://zenithsports.org/cdn/shop/files/af.jpg",
  before: "https://zenithsports.org/cdn/shop/files/scr.jpg",
  meet: "https://zenithsports.org/cdn/shop/files/meet.jpg",
  collect1: "https://zenithsports.org/cdn/shop/files/collect1.jpg",

  // Product photos — the TEKKY ball
  product01: "https://zenithsports.org/cdn/shop/files/ZENITHSPORTS-eComm00001.jpg",
  product02: "https://zenithsports.org/cdn/shop/files/ZENITHSPORTS-eComm00002.jpg",
  product03: "https://zenithsports.org/cdn/shop/files/ZENITHSPORTS-eComm00003.jpg",
  product04: "https://zenithsports.org/cdn/shop/files/ZENITHSPORTS-eComm00004.jpg",
  product05: "https://zenithsports.org/cdn/shop/files/ZENITHSPORTS-eComm00005.jpg",
  product06: "https://zenithsports.org/cdn/shop/files/ZENITHSPORTS-eComm00006.jpg",
  product07: "https://zenithsports.org/cdn/shop/files/ZENITHSPORTS-eComm00007.jpg",
  product08: "https://zenithsports.org/cdn/shop/files/ZENITHSPORTS-eComm00008.jpg",
  product09: "https://zenithsports.org/cdn/shop/files/ZENITHSPORTS-eComm00009.jpg",
  product10: "https://zenithsports.org/cdn/shop/files/ZENITHSPORTS-eComm00010.jpg",

  // Apparel
  socksWhite:
    "https://zenithsports.org/cdn/shop/files/Tekky_Socks_White_Web_eaa7877d-0611-4947-bf90-832db80b57b4.jpg",
  socksBlack: "https://zenithsports.org/cdn/shop/files/Tekky_Socks_Black_Web.jpg",
  shirtBlack:
    "https://zenithsports.org/cdn/shop/files/ZenithSports-Shirt-Black-00003_a47e1900-60a5-42bd-b6b4-cb2bb43e9a00.jpg",
  shirtGray:
    "https://zenithsports.org/cdn/shop/files/Performance_T-Shirt_Gray_Front_Web.jpg",
  bread: "https://zenithsports.org/cdn/shop/files/bread.jpg",

  // Founders
  philip: "https://zenithsports.org/cdn/shop/files/PhilipHeadShot.jpg",
  paul: "https://zenithsports.org/cdn/shop/files/PaulHeadShot.jpg",
} as const;

/* ───────────────────────── COLORS ───────────────────────── */
const NAVY = "#0a1832";          // deep electric navy — primary dark base
const NAVY_DEEP = "#050d1f";     // even deeper navy for layered sections
const NAVY_INK = "#0f172a";      // type on light bg
const IVORY = "#f5f3ee";         // clean ivory — primary light base
const IVORY_SOFT = "#ebe7dd";    // band variant
const ELECTRIC = "#1d4ed8";      // electric blue — brand
const LIME = "#a3e635";          // energy pop
const INK_SOFT_LIGHT = "#475569";
const INK_SOFT_DARK = "rgba(255,255,255,0.65)";

/* Real Shopify product URLs live in /shop/page.tsx — this page funnels
 * to /clients/zenith-sports/shop where the BUY NOW buttons exist. */

/* ───────────────────────── PROMO MARQUEE ───────────────────────── */
const PROMO_TEXT =
  "TEKKY HIGH PERFORMANCE TEES — 30% OFF · BUY 2 SHIRTS FOR $30 · TEKKY GRIP SOCKS — GET $5 OFF YOUR 2ND PAIR · DISCOUNTS APPLIED AT CHECKOUT";

function PromoMarquee() {
  // Pure-CSS marquee with @keyframes defined inline. Doubled content +
  // 50% translate keeps the loop seamless. Pause on hover lets users
  // actually read it. Reduced-motion respected via media query in the
  // <style> block.
  return (
    <div
      className="relative overflow-hidden border-b border-white/10"
      style={{ background: NAVY_DEEP, color: LIME }}
    >
      <div className="flex whitespace-nowrap py-2 animate-zenith-marquee group hover:[animation-play-state:paused]">
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className="flex-shrink-0 px-8 text-[11px] tracking-[0.22em] uppercase font-bold"
          >
            {PROMO_TEXT}
            <span className="mx-6 text-white/40">·</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes zenith-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-zenith-marquee {
          animation: zenith-marquee 38s linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-zenith-marquee { animation: none; }
        }
      `}</style>
    </div>
  );
}

/* ───────────────────────── REUSABLE BITS ───────────────────────── */
function Eyebrow({
  children,
  color = LIME,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.32em]"
      style={{ color }}
    >
      <span className="inline-block w-6 h-px" style={{ background: color }} />
      {children}
    </div>
  );
}

function StatBlock({
  value,
  label,
  ink = "#fff",
  inkSoft = INK_SOFT_DARK,
}: {
  value: string;
  label: string;
  ink?: string;
  inkSoft?: string;
}) {
  return (
    <div className="flex flex-col">
      <div
        className="text-3xl md:text-5xl font-black tracking-tight tabular-nums"
        style={{ color: ink }}
      >
        {value}
      </div>
      <div
        className="mt-1 text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-semibold"
        style={{ color: inkSoft }}
      >
        {label}
      </div>
    </div>
  );
}

/* ───────────────────────── PAGE ───────────────────────── */
export default function ZenithSportsPage() {
  return (
    <div
      id="top"
      className="min-h-screen"
      style={{
        background: IVORY,
        color: NAVY_INK,
        fontFamily:
          "ui-sans-serif, system-ui, 'Inter', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* ─────────────── PROMO BAR ─────────────── */}
      <PromoMarquee />

      {/* ─────────────── STICKY NAV ─────────────── */}
      <StickyNav
        businessName="Zenith Sports"
        logoSrc={LOGO}
        activePath="main"
      />

      {/* ─────────────── HERO ─────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: NAVY }}
      >
        {/* Background photo, full-bleed, dramatically overlaid */}
        <div className="absolute inset-0">
          <img
            src={PHOTOS.heroBall}
            alt="The TEKKY ball positioned in front of a soccer goal"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "saturate(1.08) contrast(1.06)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(95deg, rgba(10,24,50,0.92) 0%, rgba(10,24,50,0.75) 38%, rgba(10,24,50,0.45) 70%, rgba(5,13,31,0.55) 100%)",
            }}
          />
          {/* Subtle vignette at bottom for text legibility */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3"
            style={{
              background:
                "linear-gradient(to top, rgba(5,13,31,0.85), transparent)",
            }}
          />
        </div>

        {/* Diagonal slash decor — pure CSS, no JS */}
        <div className="absolute -left-32 top-1/3 w-[480px] h-[2px] bg-[#a3e635]/30 rotate-[-22deg] hidden md:block" />
        <div className="absolute -left-20 top-1/3 mt-4 w-[260px] h-[1px] bg-white/15 rotate-[-22deg] hidden md:block" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pt-20 sm:pt-28 lg:pt-36 pb-24 sm:pb-32 lg:pb-44 min-h-[88vh] flex flex-col justify-end">
          <div className="max-w-4xl">
            {/* Eyebrow + H1 + subhead all rewritten per the
                TEKKY Unified Brand Voice Guide (2025-05). The doc
                specifies the EXACT copy for these three lines — they
                are the anchor of the brand voice framework. */}
            <Eyebrow color={LIME}>
              Patent-pending technical training accelerator
            </Eyebrow>

            <h1
              className="mt-7 text-[44px] sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7.5rem] font-black uppercase leading-[0.9] tracking-tighter text-white"
              style={{
                fontFeatureSettings: '"ss01", "cv11"',
              }}
            >
              Building better players.
              <br />
              <span style={{ color: LIME }}>One touch at a time.</span>
            </h1>

            <p
              className="mt-8 max-w-2xl text-base md:text-xl leading-relaxed"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              TEKKY<sup className="text-[0.55em] align-top">®</sup> is a
              specialized, patent-pending technical tool designed to
              accelerate development. Use it alongside your standard ball
              to build precision, confidence, and strength that transfers
              directly to match day.
            </p>

            <div className="mt-10 flex flex-wrap gap-4 items-center">
              <a
                href="/clients/zenith-sports/shop"
                className="inline-flex items-center gap-2 bg-[#a3e635] text-[#0a1832] px-7 py-4 text-[13px] font-extrabold tracking-[0.2em] uppercase hover:bg-white transition group"
              >
                <ShoppingCart size={16} weight="bold" />
                Shop the TEKKY
                <ArrowRight
                  size={16}
                  weight="bold"
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
              {/* Was an anchor to #meet (just scrolled to product copy).
                  Now opens an actual TEKKY drill video in a modal. */}
              <VideoCta />
            </div>
          </div>

          {/* Bottom strip — ambient stats. Updated per brand voice guide:
              the differentiator is "Size 3 control + Size 5 weight" not just
              "FIFA regulation weight". That dual-spec is the BAE proof. */}
          <div className="mt-16 sm:mt-20 grid grid-cols-3 gap-6 sm:gap-12 max-w-3xl border-t border-white/15 pt-8">
            <StatBlock value="Size 3" label="Control · feel" />
            <StatBlock value="Size 5" label="Match-day weight" />
            <StatBlock value="5.0★" label="From verified buyers" />
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/50 text-[10px] tracking-[0.32em] uppercase">
          Scroll
          <span className="block w-px h-10 bg-white/30" />
        </div>
      </section>

      {/* ─────────────── WHY TEKKY · 3 PILLARS ─────────────── */}
      <section
        id="about"
        className="relative py-28 sm:py-36 lg:py-44"
        style={{ background: NAVY_DEEP }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <Eyebrow>Why TEKKY</Eyebrow>
            <h2 className="mt-6 text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-[0.92]">
              Built for the
              <br />
              <span style={{ color: LIME }}>technical player.</span>
            </h2>
            <p
              className="mt-8 text-base md:text-lg leading-relaxed max-w-xl"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Zenith Sports doesn&apos;t sell another ball. We sell the foundation
              — three pillars every TEKKY® rep is engineered around.
            </p>
          </div>

          <div className="mt-16 sm:mt-20 grid md:grid-cols-3 gap-6 lg:gap-10">
            {[
              {
                no: "01",
                title: "Skill-first approach",
                photo: PHOTOS.hands,
                icon: Crosshair,
                body: "We believe technical skill is the foundation of greatness. Our training tools and philosophy focus on developing touch, control, and decision-making — helping players rise above a kick-and-run mentality.",
              },
              {
                no: "02",
                title: "The Before & After Effect",
                // Was PHOTOS.product03 — a white-background eComm shot that
                // visually broke cohesion next to the action shots in cards
                // 1 & 3. Swapped to slide2 (in-context training photo).
                photo: PHOTOS.slide2,
                icon: Barbell,
                // Body rewritten per brand voice guide — the BAE is one of
                // the 5 required key messages. Train with TEKKY → switch
                // back → feel the difference.
                body: "Train with TEKKY®. Switch back to your standard ball. Feel the difference. Players notice their touch is sharper, their first step is faster, their confidence is higher — that's the product proving itself, every session.",
              },
              {
                no: "03",
                title: "Made for all ages",
                photo: PHOTOS.ages,
                icon: UsersThree,
                body: "Whether you're coaching five-year-olds or training high school athletes, our products adapt to every stage. TEKKY® bridges the gap between fun and performance — ideal for any level of youth soccer.",
              },
            ].map((p) => {
              const Icon = p.icon;
              return (
                <article
                  key={p.no}
                  className="group relative bg-white/[0.04] border border-white/10 hover:border-[#a3e635]/40 transition flex flex-col"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={p.photo}
                      alt={p.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      style={{ filter: "saturate(1.05) contrast(1.04)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050d1f]/85 via-transparent to-transparent" />
                    <div
                      className="absolute top-5 left-5 text-[11px] tracking-[0.28em] uppercase font-extrabold"
                      style={{ color: LIME }}
                    >
                      {p.no}
                    </div>
                    <div
                      className="absolute bottom-5 left-5 right-5 flex items-center gap-3 text-white"
                    >
                      <span className="inline-flex items-center justify-center w-10 h-10 bg-[#a3e635] text-[#0a1832]">
                        <Icon size={18} weight="bold" />
                      </span>
                    </div>
                  </div>

                  <div className="p-7 lg:p-9 flex-1 flex flex-col">
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                      {p.title}
                    </h3>
                    <p
                      className="mt-4 text-sm md:text-[15px] leading-relaxed flex-1"
                      style={{ color: "rgba(255,255,255,0.7)" }}
                    >
                      {p.body}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────── FOUNDER DUO ─────────────── */}
      <section
        className="relative py-28 sm:py-36 lg:py-44"
        style={{ background: IVORY }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <Eyebrow color={ELECTRIC}>The people behind TEKKY</Eyebrow>
            <h2
              className="mt-6 text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.92]"
              style={{ color: NAVY_INK }}
            >
              Two coaches.
              <br />
              <span style={{ color: ELECTRIC }}>One belief.</span>
            </h2>
            <p
              className="mt-8 text-base md:text-lg leading-relaxed max-w-xl"
              style={{ color: INK_SOFT_LIGHT }}
            >
              Zenith Sports was founded by two people who&apos;d watched American
              youth soccer optimize for the wrong things for too long. The
              TEKKY® is what they built to change that.
            </p>
          </div>

          <div className="mt-16 sm:mt-20 grid lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Philip */}
            <article
              className="bg-white border border-slate-200 flex flex-col hover:border-[#1d4ed8]/40 transition"
            >
              {/* Native aspect of source photo is 1024x1535 (~2:3 portrait).
                  Was aspect-[5/4] (landscape) + object-cover, which cropped
                  the top of Philip's head. Switched to aspect-[4/5] with
                  object-position top so the framing keeps the full head and
                  any minor crop comes from the bottom of the chest. */}
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                <img
                  src={PHOTOS.philip}
                  alt="Philip Lund, co-founder of Zenith Sports"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: "center top" }}
                />
              </div>
              <div className="p-8 lg:p-10 flex-1 flex flex-col">
                <Eyebrow color={ELECTRIC}>Co-Founder</Eyebrow>
                <h3
                  className="mt-4 text-3xl md:text-4xl font-black tracking-tight"
                  style={{ color: NAVY_INK }}
                >
                  Philip Lund
                </h3>
                <div className="mt-6 relative pl-6 border-l-2 border-[#1d4ed8]">
                  <Quotes
                    size={24}
                    weight="fill"
                    className="absolute -left-3 -top-1 text-[#1d4ed8] bg-white"
                  />
                  <p
                    className="text-lg md:text-xl leading-relaxed italic"
                    style={{
                      color: NAVY_INK,
                      fontFamily:
                        "ui-serif, Georgia, Cambria, 'Times New Roman', serif",
                    }}
                  >
                    {BUSINESS.founders.philip.quote}
                  </p>
                </div>
              </div>
            </article>

            {/* Paul */}
            <article
              className="bg-white border border-slate-200 flex flex-col hover:border-[#1d4ed8]/40 transition"
            >
              {/* See Philip card above — same aspect/position fix to keep
                  Paul's head fully in frame. */}
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                <img
                  src={PHOTOS.paul}
                  alt="Paul Hanson, co-founder of Zenith Sports, with 40+ years in the game"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: "center top" }}
                />
              </div>
              <div className="p-8 lg:p-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-4">
                  <Eyebrow color={ELECTRIC}>Co-Founder</Eyebrow>
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-bold text-[#0a1832] bg-[#a3e635] px-2.5 py-1">
                    <Medal size={11} weight="bold" />
                    40+ Years
                  </span>
                </div>
                <h3
                  className="mt-4 text-3xl md:text-4xl font-black tracking-tight"
                  style={{ color: NAVY_INK }}
                >
                  Paul Hanson
                </h3>
                <div className="mt-6 relative pl-6 border-l-2 border-[#1d4ed8]">
                  <Quotes
                    size={24}
                    weight="fill"
                    className="absolute -left-3 -top-1 text-[#1d4ed8] bg-white"
                  />
                  <p
                    className="text-lg md:text-xl leading-relaxed italic"
                    style={{
                      color: NAVY_INK,
                      fontFamily:
                        "ui-serif, Georgia, Cambria, 'Times New Roman', serif",
                    }}
                  >
                    With over 40 years in the game — collegiate play through
                    post-collegiate competition — {BUSINESS.founders.paul.quote.toLowerCase()}
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ─────────────── BEFORE / AFTER ─────────────── */}
      <section
        className="relative py-28 sm:py-36 lg:py-44 overflow-hidden"
        style={{ background: NAVY }}
      >
        {/* Diagonal accent */}
        <div className="absolute top-1/2 right-0 w-[60%] h-px bg-[#a3e635]/20" />

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Eyebrow>The transformation</Eyebrow>
            <h2 className="mt-6 text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.92] text-white">
              From <span style={{ color: "#94a3b8" }}>average</span>
              <br />
              to <span style={{ color: LIME }}>advanced.</span>
            </h2>
            <p
              className="mt-8 text-base md:text-lg leading-relaxed"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              See the difference TEKKY® makes in just weeks of consistent reps.
            </p>
          </div>

          <div className="mt-20 grid md:grid-cols-2 gap-6 lg:gap-10">
            {/* BEFORE */}
            <article className="relative bg-[#050d1f] border border-white/10 overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={PHOTOS.before}
                  alt="Before TEKKY training — unrefined touches"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: "saturate(0.5) contrast(0.95) brightness(0.85)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050d1f]/80 via-[#050d1f]/30 to-transparent" />
                <div className="absolute top-6 left-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2">
                  <span className="text-[10px] tracking-[0.28em] uppercase font-extrabold text-white/70">
                    Before
                  </span>
                </div>
              </div>
              <div className="p-8 lg:p-10">
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white/90 leading-tight">
                  Unrefined touches.
                </h3>
                <ul className="mt-6 space-y-3 text-base" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 inline-block w-2 h-2 bg-white/40 flex-shrink-0" />
                    Rushed passes that lose possession
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 inline-block w-2 h-2 bg-white/40 flex-shrink-0" />
                    Heavy first touch — the ball runs away from the foot
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 inline-block w-2 h-2 bg-white/40 flex-shrink-0" />
                    Default to &ldquo;kick it long and chase&rdquo;
                  </li>
                </ul>
              </div>
            </article>

            {/* AFTER */}
            <article className="relative border-2 overflow-hidden" style={{ borderColor: LIME, background: NAVY_DEEP }}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={PHOTOS.after}
                  alt="After TEKKY training — sharp footwork and confident control"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: "saturate(1.15) contrast(1.08)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1832]/70 via-transparent to-transparent" />
                <div className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2" style={{ background: LIME, color: NAVY_INK }}>
                  <Lightning size={14} weight="fill" />
                  <span className="text-[10px] tracking-[0.28em] uppercase font-extrabold">
                    After TEKKY
                  </span>
                </div>
              </div>
              <div className="p-8 lg:p-10">
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                  Sharp footwork. Confident control.
                </h3>
                <ul className="mt-6 space-y-3 text-base text-white/80">
                  <li className="flex items-start gap-3">
                    <CheckCircle size={18} weight="fill" className="mt-1 flex-shrink-0" style={{ color: LIME }} />
                    Crisp, weighted passes — every time
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle size={18} weight="fill" className="mt-1 flex-shrink-0" style={{ color: LIME }} />
                    First touch settles the ball under the foot
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle size={18} weight="fill" className="mt-1 flex-shrink-0" style={{ color: LIME }} />
                    Composed decision-making under pressure
                  </li>
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ─────────────── EUROPEAN-STYLE DEVELOPMENT — REQUIRED on site ───────────────
          Added per the TEKKY Unified Brand Voice Guide (Section 2, Message
          3 — explicitly flagged as MISSING from the prior site and REQUIRED
          on launch). "Technique before tactics. Street football principles.
          Elite European training methodology brought to your driveway." */}
      <section
        className="relative py-28 sm:py-36 lg:py-44 overflow-hidden"
        style={{ background: IVORY }}
      >
        {/* Soft texture — diagonal mint stripe */}
        <div
          aria-hidden
          className="absolute -right-32 top-0 bottom-0 w-[60%] opacity-[0.04] pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(135deg, transparent 0 22px, #0a1832 22px 23px)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              <Eyebrow color={ELECTRIC}>Inspired by European-style development</Eyebrow>
              <h2
                className="mt-6 text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.92]"
                style={{ color: NAVY_INK }}
              >
                Technique
                <br />
                <span style={{ color: ELECTRIC }}>before tactics.</span>
              </h2>
              <p
                className="mt-8 max-w-2xl text-lg md:text-2xl leading-relaxed"
                style={{
                  color: NAVY_INK,
                  fontFamily:
                    "ui-serif, Georgia, Cambria, 'Times New Roman', serif",
                }}
              >
                The best youth academies in Europe don&apos;t start with
                tactics. They start with touch.
              </p>
              <p
                className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed"
                style={{ color: INK_SOFT_LIGHT }}
              >
                TEKKY® brings that methodology to your driveway — built on
                street football principles and elite European training, where
                technique is the foundation before tactics. The same approach
                that produced Iniesta, Modrić, and a generation of players
                who could solve any moment with their feet.
              </p>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
                {[
                  { tag: "01", label: "Street football roots" },
                  { tag: "02", label: "Touch before tactics" },
                  { tag: "03", label: "Driveway, daily" },
                ].map((p) => (
                  <div
                    key={p.tag}
                    className="border-l-2 pl-4 py-1"
                    style={{ borderColor: ELECTRIC }}
                  >
                    <div
                      className="text-[10px] tracking-[0.28em] uppercase font-extrabold"
                      style={{ color: ELECTRIC }}
                    >
                      {p.tag}
                    </div>
                    <div
                      className="mt-1 text-[15px] font-bold tracking-tight"
                      style={{ color: NAVY_INK }}
                    >
                      {p.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual — Tekky in action photo, framed editorially */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                <img
                  src={PHOTOS.bread}
                  alt="TEKKY in real training — street football discipline brought home"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: "saturate(1.05) contrast(1.04)" }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 55%, rgba(10,24,50,0.7) 100%)",
                  }}
                />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="text-[10px] tracking-[0.28em] uppercase font-extrabold text-[#a3e635]">
                    The European way
                  </div>
                  <p className="mt-2 text-base font-medium leading-snug">
                    Train the touch. The game follows.
                  </p>
                </div>
              </div>
              {/* Decorative rule */}
              <div
                aria-hidden
                className="hidden lg:block absolute -left-6 top-12 bottom-12 w-px"
                style={{ background: `${ELECTRIC}40` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── BUILT FOR BETTER TRAINING — banner band ─────────────── */}
      <section
        className="relative py-28 sm:py-36 lg:py-44 overflow-hidden"
        style={{ background: ELECTRIC }}
      >
        {/* Background photo, low opacity */}
        <div className="absolute inset-0">
          <img
            src={PHOTOS.meet}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-25"
            style={{ filter: "saturate(0.9)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, rgba(29,78,216,0.92) 0%, rgba(10,24,50,0.85) 100%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <Eyebrow color={LIME}>Built for better training</Eyebrow>
              <h2 className="mt-6 text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-white">
                Real-game
                <br />
                <span style={{ color: LIME }}>feel.</span>
              </h2>
              {/* Subhead rewritten with the brand voice guide's dual-spec
                  one-liner: Size 3 control. Size 5 match-day weight. That's
                  the differentiator — not just "smaller and weighted". */}
              <p
                className="mt-8 max-w-xl text-base md:text-xl leading-relaxed"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                FIFA Size 3 control. FIFA Size 5 match-day weight. Real
                movement that transfers directly to game day. TEKKY®
                challenges young players to focus, adjust, and improve faster
                than traditional methods.
              </p>
            </div>

            <div className="lg:col-span-5 grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {[
                {
                  icon: Brain,
                  title: "Forces focus",
                  body: "Smaller surface = no margin for sloppy touches.",
                },
                {
                  icon: Barbell,
                  title: "Builds strength",
                  body: "Size 5 match-day weight. Size 3 control surface.",
                },
                {
                  icon: ChartLineUp,
                  title: "Confidence starts early",
                  body: "Master the hard ball, the regulation ball feels easy.",
                },
              ].map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.title}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 p-5 lg:p-6 flex items-start gap-4 hover:bg-white/15 transition"
                  >
                    <span className="inline-flex flex-shrink-0 items-center justify-center w-11 h-11 bg-[#a3e635] text-[#0a1832]">
                      <Icon size={20} weight="bold" />
                    </span>
                    <div>
                      <div className="text-[11px] tracking-[0.22em] uppercase font-extrabold text-[#a3e635]">
                        Why it works
                      </div>
                      <h3 className="mt-1 text-xl font-black tracking-tight text-white">
                        {b.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/80">
                        {b.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── MEET THE TEKKY — product spotlight ─────────────── */}
      <section
        id="tekky"
        className="relative py-28 sm:py-36 lg:py-48"
        style={{ background: IVORY }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center" id="meet">
            {/* Photo — click any of the 3 to zoom into the gallery */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <PhotoZoom
                images={[
                  { src: PHOTOS.product01, alt: "The TEKKY Advanced Training Ball" },
                  { src: PHOTOS.product05, alt: "TEKKY ball — angled view" },
                  { src: PHOTOS.product07, alt: "TEKKY ball — side panel detail" },
                ]}
              >
                <div className="relative">
                  {/* Big primary photo */}
                  <ZoomTrigger
                    index={0}
                    ariaLabel="Zoom in on the TEKKY ball"
                    className="block w-full aspect-square bg-slate-100 overflow-hidden"
                  >
                    <img
                      src={PHOTOS.product01}
                      alt="The TEKKY Advanced Training Ball"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      style={{ filter: "saturate(1.06) contrast(1.04)" }}
                    />
                  </ZoomTrigger>
                  {/* Floating thumbnail badge */}
                  <ZoomTrigger
                    index={1}
                    ariaLabel="Zoom in on TEKKY angled view"
                    className="absolute -bottom-6 -right-6 sm:-bottom-10 sm:-right-10 w-32 sm:w-44 aspect-square bg-white shadow-xl border border-slate-200 overflow-hidden"
                  >
                    <img
                      src={PHOTOS.product05}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </ZoomTrigger>
                  {/* Floating thumbnail badge 2 */}
                  <ZoomTrigger
                    index={2}
                    ariaLabel="Zoom in on TEKKY side panel"
                    className="hidden sm:block absolute -top-8 -left-8 w-32 aspect-square bg-white shadow-xl border border-slate-200 overflow-hidden"
                  >
                    <img
                      src={PHOTOS.product07}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </ZoomTrigger>
                </div>
              </PhotoZoom>
            </div>

            {/* Copy */}
            <div className="lg:col-span-5 order-1 lg:order-2">
              <Eyebrow color={ELECTRIC}>Patent-pending · Built by Zenith</Eyebrow>
              <h2
                className="mt-6 text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]"
                style={{ color: NAVY_INK }}
              >
                Meet the
                <br />
                <span style={{ color: ELECTRIC }}>
                  TEKKY<sup className="text-[0.45em] align-top">®</sup>.
                </span>
              </h2>

              {/* Copy refresh — leads with the dual-spec differentiator
                  (Size 3 control / Size 5 weight) per the brand voice guide. */}
              <p
                className="mt-8 text-base md:text-lg leading-relaxed"
                style={{ color: INK_SOFT_LIGHT }}
              >
                FIFA Size 3 control. FIFA Size 5 match-day weight. The
                TEKKY® is a specialized, patent-pending technical tool
                designed to accelerate development — sharper technique,
                stronger touch, real results that transfer directly to
                game day.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-6">
                <div>
                  <div className="text-[10px] tracking-[0.28em] uppercase font-extrabold text-[#1d4ed8]">
                    Price
                  </div>
                  <div className="mt-1 text-5xl font-black tracking-tight" style={{ color: NAVY_INK }}>
                    $59.95
                  </div>
                </div>
                <div>
                  <div className="text-[10px] tracking-[0.28em] uppercase font-extrabold text-[#1d4ed8]">
                    Rated
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} size={20} weight="fill" className="text-[#f59e0b]" />
                    ))}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wider font-semibold" style={{ color: INK_SOFT_LIGHT }}>
                    5.0 from buyers
                  </div>
                </div>
              </div>

              <div className="mt-10 space-y-3">
                {[
                  "Pinpoint accuracy and precision",
                  "Sharper focus and consistency",
                  "Strength and control through touch",
                ].map((b) => (
                  <div key={b} className="flex items-start gap-3">
                    <CheckCircle size={20} weight="fill" className="mt-0.5 flex-shrink-0" style={{ color: ELECTRIC }} />
                    <span className="text-base" style={{ color: NAVY_INK }}>
                      {b}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href="/clients/zenith-sports/shop"
                  className="inline-flex items-center gap-2 bg-[#0a1832] text-white px-7 py-4 text-[13px] font-extrabold tracking-[0.2em] uppercase hover:bg-[#1d4ed8] transition group"
                >
                  <ShoppingCart size={16} weight="bold" />
                  Shop the TEKKY® · $59.95
                  <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── COACH-CREDIBLE (COACH-07) ───────────────
          Added per the brand voice guide (Section 6 Copy Vault — COACH-07).
          B2B trust block targeted at coaches, clubs, DOCs. The doc
          specifically calls out Rec / ECNL / MLS Next as the credibility
          ladder. Primary CTA for this audience: "Request a Club Demo." */}
      <section
        id="coaches"
        className="relative py-28 sm:py-36 lg:py-40 overflow-hidden"
        style={{ background: NAVY }}
      >
        {/* Subtle grid — credibility / serious tool feel */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              <Eyebrow color={LIME}>For coaches, clubs &amp; DOCs</Eyebrow>
              <h2 className="mt-6 text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.92] text-white">
                Coach-credible.
                <br />
                <span style={{ color: LIME }}>Not influencer-first.</span>
              </h2>
              <p
                className="mt-8 max-w-2xl text-base md:text-lg leading-relaxed"
                style={{ color: "rgba(255,255,255,0.78)" }}
              >
                TEKKY® was developed by professionals for professionals.
                Trusted by coaches, clubs, and Directors of Coaching focused
                on individual technical outcomes — at every level, from Rec
                to ECNL and MLS Next.
              </p>

              {/* Tier ladder — the credibility chain coaches recognize */}
              <div className="mt-10 flex flex-wrap items-center gap-2 sm:gap-3">
                {["Rec", "Travel", "ECNL", "MLS Next", "College", "Pro pathway"].map((tier) => (
                  <span
                    key={tier}
                    className="inline-flex items-center px-3 py-1.5 text-[11px] tracking-[0.18em] uppercase font-bold border border-white/15 text-white/85 bg-white/[0.04]"
                  >
                    {tier}
                  </span>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 bg-[#a3e635] text-[#0a1832] px-7 py-4 text-[13px] font-extrabold tracking-[0.2em] uppercase hover:bg-white transition group"
                >
                  Request a club demo
                  <ArrowRight
                    size={16}
                    weight="bold"
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </a>
                <a
                  href="#training"
                  className="inline-flex items-center gap-2 border border-white/30 text-white px-7 py-4 text-[13px] font-extrabold tracking-[0.2em] uppercase hover:bg-white/5 transition"
                >
                  See the drills
                </a>
              </div>
            </div>

            {/* Right column — 3 outcome stat tiles + testimonial-shaped quote */}
            <div className="lg:col-span-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { v: "10–15", l: "Min / session" },
                  { v: "Daily", l: "Reps that count" },
                  { v: "Match-day", l: "Transfer" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="border border-white/10 bg-white/[0.03] p-4 text-center"
                  >
                    <div className="text-3xl font-black tracking-tighter text-white">
                      {s.v}
                    </div>
                    <div className="mt-1 text-[9px] tracking-[0.22em] uppercase font-bold text-white/55">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-5 border-l-2 pl-6 py-2"
                style={{ borderColor: LIME }}
              >
                <Quotes
                  size={22}
                  weight="fill"
                  className="-ml-1 mb-2"
                  style={{ color: LIME }}
                />
                <p
                  className="text-lg md:text-xl leading-snug italic"
                  style={{
                    color: "rgba(255,255,255,0.92)",
                    fontFamily:
                      "ui-serif, Georgia, Cambria, 'Times New Roman', serif",
                  }}
                >
                  Designed by professionals. Trusted by families. Built for
                  your future star.
                </p>
                <p className="mt-3 text-[11px] tracking-[0.22em] uppercase font-bold text-[#a3e635]">
                  The Zenith Sports promise
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── ORIGIN / MISSION ─────────────── */}
      <section
        className="relative py-28 sm:py-36 lg:py-44 overflow-hidden"
        style={{ background: NAVY_DEEP }}
      >
        <div className="absolute inset-0 opacity-15">
          <img
            src={PHOTOS.untitledDesign}
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,13,31,0.85), rgba(5,13,31,0.96))",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-5 sm:px-8 text-center">
          <Eyebrow>The bigger picture</Eyebrow>
          <h2 className="mt-6 text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.92] text-white">
            Transforming
            <br />
            <span style={{ color: LIME }}>US Soccer.</span>
          </h2>

          <p
            className="mt-12 text-xl md:text-3xl leading-relaxed font-light max-w-3xl mx-auto"
            style={{
              color: "rgba(255,255,255,0.85)",
              fontFamily:
                "ui-serif, Georgia, Cambria, 'Times New Roman', serif",
            }}
          >
            For years, US Soccer has been celebrated for its physicality and
            speed — yet often critiqued for lacking elite-level technical
            skill.
          </p>

          <p
            className="mt-6 text-xl md:text-3xl leading-relaxed font-light max-w-3xl mx-auto"
            style={{
              color: LIME,
              fontFamily:
                "ui-serif, Georgia, Cambria, 'Times New Roman', serif",
            }}
          >
            TEKKY® is how we change that.
          </p>

          <p
            className="mt-12 text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            An innovative training tool designed to reshape the future of US
            Soccer by building a stronger technical foundation for the next
            generation of players. Goodbye, kick-it-long-and-sprint. Hello,
            finesse.
          </p>
        </div>
      </section>

      {/* ─────────────── TRAINING PREVIEW ─────────────── */}
      <section
        id="training"
        className="relative py-28 sm:py-36 lg:py-44"
        style={{ background: IVORY_SOFT }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-end mb-16">
            <div className="lg:col-span-7">
              <Eyebrow color={ELECTRIC}>#TEKKYTouch · Tuesday hub</Eyebrow>
              <h2
                className="mt-6 text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.92]"
                style={{ color: NAVY_INK }}
              >
                Drills that
                <br />
                <span style={{ color: ELECTRIC }}>actually work.</span>
              </h2>
            </div>
            <div className="lg:col-span-5">
              {/* Copy reframed as the recurring training destination per
                  brand voice guide PRIORITY 2 — VID-08 hub fed by Touch
                  Tuesday social posts. New drill weekly = new reason to
                  return. */}
              <p
                className="text-base md:text-lg leading-relaxed"
                style={{ color: INK_SOFT_LIGHT }}
              >
                A growing library of TEKKY®-specific drills, built by Philip
                and Paul. New drill every Touch Tuesday — run them solo in
                the driveway, or fold them into team sessions. Tag us with{" "}
                <span className="font-bold" style={{ color: NAVY_INK }}>
                  #TEKKYTouch
                </span>{" "}
                and you might land in next week&apos;s feature.
              </p>
            </div>
          </div>

          {/* Full drill library — 26 videos across 3 tiers, each card opens
              its YouTube watch URL in a new tab. See training-drills.tsx for
              the complete list (scraped from zenithsports.org/pages/training). */}
          <TrainingDrills />

          <div className="mt-16 text-center">
            <a
              href="https://www.youtube.com/@zenithsports.tekky"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-[#0a1832] text-[#0a1832] px-7 py-4 text-[13px] font-extrabold tracking-[0.2em] uppercase hover:bg-[#0a1832] hover:text-white transition group"
            >
              See more on the TEKKY® YouTube channel
              <ArrowUpRight size={16} weight="bold" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────── EDITORIAL PHOTO BREAK ─────────────── */}
      <section className="relative" style={{ background: NAVY }}>
        <div className="grid md:grid-cols-3 gap-1">
          <div className="relative aspect-square overflow-hidden">
            <img
              src={PHOTOS.collect1}
              alt="Zenith Sports training session"
              className="absolute inset-0 w-full h-full object-cover hover:scale-[1.04] transition-transform duration-700"
              style={{ filter: "saturate(1.06)" }}
            />
          </div>
          <div className="relative aspect-square overflow-hidden">
            <img
              src={PHOTOS.slide2}
              alt="Player training with the TEKKY"
              className="absolute inset-0 w-full h-full object-cover hover:scale-[1.04] transition-transform duration-700"
              style={{ filter: "saturate(1.06)" }}
            />
          </div>
          <div className="relative aspect-square overflow-hidden">
            <img
              src={PHOTOS.product08}
              alt="The TEKKY ball detail"
              className="absolute inset-0 w-full h-full object-cover hover:scale-[1.04] transition-transform duration-700"
              style={{ filter: "saturate(1.06)" }}
            />
          </div>
        </div>
      </section>

      {/* ─────────────── REVIEWS / SOCIAL PROOF ─────────────── */}
      <section className="relative py-28 sm:py-36 lg:py-44" style={{ background: IVORY }}>
        <div className="mx-auto max-w-5xl px-5 sm:px-8 text-center">
          <Eyebrow color={ELECTRIC}>Verified buyers</Eyebrow>
          <h2
            className="mt-6 text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.92]"
            style={{ color: NAVY_INK }}
          >
            5.0 stars
            <br />
            <span style={{ color: ELECTRIC }}>across the line.</span>
          </h2>

          <div className="mt-10 inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} size={28} weight="fill" className="text-[#f59e0b]" />
            ))}
            <span className="ml-3 text-sm font-bold tracking-wide uppercase" style={{ color: NAVY_INK }}>
              5.0 / 5.0
            </span>
          </div>

          <p
            className="mt-10 max-w-2xl mx-auto text-base md:text-lg leading-relaxed"
            style={{ color: INK_SOFT_LIGHT }}
          >
            Every Zenith Sports product carries a perfect 5.0 from verified
            Zenith Sports buyers. Read the full reviews on each product
            listing.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto">
            {[
              { label: "The TEKKY® Ball", reviews: "5.0", count: "5 reviews" },
              { label: "TEKKY® Grip Socks", reviews: "5.0", count: "Verified" },
              { label: "Performance Tee", reviews: "5.0", count: "Verified" },
            ].map((p) => (
              <div key={p.label} className="border border-slate-200 bg-white py-6 px-3">
                <div className="text-3xl font-black tracking-tight" style={{ color: NAVY_INK }}>
                  {p.reviews}★
                </div>
                <div className="mt-2 text-[10px] tracking-[0.22em] uppercase font-semibold" style={{ color: INK_SOFT_LIGHT }}>
                  {p.label}
                </div>
                <div className="text-[10px] tracking-[0.22em] uppercase font-semibold mt-1" style={{ color: ELECTRIC }}>
                  {p.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── FINAL CTA — "Welcome to TEKKY" ─────────────── */}
      <section className="relative overflow-hidden" style={{ background: NAVY }}>
        {/* Backdrop */}
        <div className="absolute inset-0">
          <img
            src={PHOTOS.heroAlt}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            style={{ filter: "saturate(1.05) contrast(1.04)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(10,24,50,0.92) 0%, rgba(29,78,216,0.6) 100%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-5xl px-5 sm:px-8 py-32 sm:py-44 lg:py-56 text-center">
          <Eyebrow>Welcome to TEKKY</Eyebrow>
          <h2 className="mt-6 text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.88] text-white">
            Get your
            <br />
            <span style={{ color: LIME }}>TEKKY.</span>
          </h2>
          <p
            className="mt-10 max-w-2xl mx-auto text-base md:text-xl leading-relaxed"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            Whether you&apos;re a budding player starting at age 5 or a high
            school athlete striving to elevate your technical abilities, TEKKY
            is designed to unlock your full potential. Develop the finesse and
            skill required to excel at every level of the game.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/clients/zenith-sports/shop"
              className="inline-flex items-center gap-3 bg-[#a3e635] text-[#0a1832] px-10 py-5 text-[14px] font-extrabold tracking-[0.22em] uppercase hover:bg-white transition group"
            >
              <ShoppingCart size={18} weight="bold" />
              Get Your TEKKY
              <ArrowRight
                size={18}
                weight="bold"
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-3 border-2 border-white text-white px-10 py-5 text-[14px] font-extrabold tracking-[0.22em] uppercase hover:bg-white/10 transition"
            >
              Talk to a coach
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────── INQUIRY FORM ─────────────── */}
      <section id="contact" className="relative py-28 sm:py-36 lg:py-44" style={{ background: IVORY }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
            {/* Left rail */}
            <div className="lg:col-span-5">
              <Eyebrow color={ELECTRIC}>Talk to Zenith</Eyebrow>
              <h2
                className="mt-6 text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.92]"
                style={{ color: NAVY_INK }}
              >
                Coach,
                <br />
                parent,
                <br />
                <span style={{ color: ELECTRIC }}>or club?</span>
              </h2>
              <p
                className="mt-8 text-base md:text-lg leading-relaxed"
                style={{ color: INK_SOFT_LIGHT }}
              >
                Tell us a bit about who you&apos;re buying for. Philip and Paul
                personally read every inquiry — usual reply window is one
                business day.
              </p>

              <div className="mt-10 space-y-5">
                <a
                  href={BUSINESS.emailHref}
                  className="flex items-start gap-4 group"
                >
                  <span className="inline-flex flex-shrink-0 items-center justify-center w-11 h-11 bg-[#0a1832] text-white group-hover:bg-[#1d4ed8] transition">
                    <Envelope size={18} weight="bold" />
                  </span>
                  <div>
                    <div className="text-[10px] tracking-[0.22em] uppercase font-bold" style={{ color: INK_SOFT_LIGHT }}>
                      Email
                    </div>
                    <div className="text-base font-bold" style={{ color: NAVY_INK }}>
                      {BUSINESS.email}
                    </div>
                  </div>
                </a>
                <a
                  href={BUSINESS.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <span className="inline-flex flex-shrink-0 items-center justify-center w-11 h-11 bg-[#0a1832] text-white group-hover:bg-[#1d4ed8] transition">
                    <InstagramLogo size={18} weight="bold" />
                  </span>
                  <div>
                    <div className="text-[10px] tracking-[0.22em] uppercase font-bold" style={{ color: INK_SOFT_LIGHT }}>
                      Follow the build
                    </div>
                    <div className="text-base font-bold" style={{ color: NAVY_INK }}>
                      @zenithsports
                    </div>
                  </div>
                </a>
                <a
                  href="/clients/zenith-sports/shop"
                  className="flex items-start gap-4 group"
                >
                  <span className="inline-flex flex-shrink-0 items-center justify-center w-11 h-11 bg-[#a3e635] text-[#0a1832] group-hover:bg-white transition">
                    <ShoppingCart size={18} weight="bold" />
                  </span>
                  <div>
                    <div className="text-[10px] tracking-[0.22em] uppercase font-bold" style={{ color: INK_SOFT_LIGHT }}>
                      Skip the form
                    </div>
                    <div className="text-base font-bold" style={{ color: NAVY_INK }}>
                      Shop the TEKKY® now →
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-7">
              <InquiryForm
                slug="zenith-sports"
                accent={ELECTRIC}
                accentDeep={NAVY}
                ink={NAVY_INK}
                inkSoft={INK_SOFT_LIGHT}
                panelBg="#ffffff"
                submitLabel="Send my inquiry"
                successHeading="Got it — Philip and Paul will be in touch."
                successBody="You'll hear back within one business day. In the meantime, the shop is open at /clients/zenith-sports/shop."
                fields={[
                  {
                    type: "text",
                    name: "name",
                    label: "Your name *",
                    placeholder: "First and last",
                    required: true,
                  },
                  {
                    type: "email",
                    name: "email",
                    label: "Email *",
                    placeholder: "you@example.com",
                    required: true,
                  },
                  {
                    type: "tel",
                    name: "phone",
                    label: "Phone (optional)",
                    placeholder: "(___) ___-____",
                  },
                  {
                    type: "select",
                    name: "role",
                    label: "Your role",
                    options: [
                      { value: "parent", label: "Parent of a player" },
                      { value: "coach", label: "Coach" },
                      { value: "club", label: "Club director" },
                      { value: "player", label: "Player myself" },
                      { value: "other", label: "Other" },
                    ],
                  },
                  {
                    type: "select",
                    name: "age_group",
                    label: "Player age group",
                    options: [
                      { value: "5-8", label: "5 – 8 years" },
                      { value: "9-12", label: "9 – 12 years" },
                      { value: "13-15", label: "13 – 15 years" },
                      { value: "16-18", label: "16 – 18 / high school" },
                      { value: "mixed", label: "Mixed age team" },
                    ],
                  },
                  {
                    type: "radio",
                    name: "interest",
                    label: "What's brought you to Zenith?",
                    options: [
                      { value: "tekky-ball", label: "The TEKKY® Ball", description: "Individual training ball purchase" },
                      { value: "team-order", label: "Team / club order", description: "Bulk for a roster, club, or program" },
                      { value: "apparel", label: "Apparel & gear", description: "Tees, grip socks" },
                      { value: "drills", label: "Training drills & curriculum", description: "Coaching resources" },
                    ],
                  },
                  {
                    type: "select",
                    name: "found_us",
                    label: "How did you find us?",
                    options: [
                      { value: "search", label: "Google search" },
                      { value: "social", label: "Instagram or Facebook" },
                      { value: "coach", label: "Another coach / club" },
                      { value: "friend", label: "Word of mouth" },
                      { value: "other", label: "Somewhere else" },
                    ],
                  },
                  {
                    type: "textarea",
                    name: "message",
                    label: "Anything else?",
                    placeholder: "Roster size, training context, specific questions about TEKKY® for your age group — whatever's helpful.",
                    rows: 5,
                    full: true,
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer style={{ background: NAVY_DEEP, color: "rgba(255,255,255,0.75)" }} className="pt-24 pb-10 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Brand block */}
            <div className="lg:col-span-5">
              <a href="#top" className="inline-flex items-center gap-3">
                <img src={LOGO} alt="Zenith Sports" className="h-14 w-auto" />
                <div>
                  <div className="text-[18px] font-extrabold uppercase tracking-tight text-white">
                    Zenith Sports
                  </div>
                  <div className="text-[10px] tracking-[0.28em] uppercase font-semibold" style={{ color: LIME }}>
                    Home of the TEKKY
                  </div>
                </div>
              </a>
              <p className="mt-7 max-w-md text-sm leading-relaxed">
                Building Better Players, One Touch at a Time. The TEKKY® is an
                innovative training tool designed to reshape the future of US
                Soccer by building a stronger technical foundation for the next
                generation of players.
              </p>

              {/* Newsletter — sends to inquiry email as a mailto fallback */}
              <form
                className="mt-8 flex max-w-md border border-white/15 bg-white/[0.04]"
                action={BUSINESS.emailHref}
                method="get"
              >
                <input
                  type="email"
                  name="body"
                  placeholder="Email for TEKKY® drops + drills"
                  className="flex-1 px-4 py-3 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 bg-[#a3e635] text-[#0a1832] text-[11px] font-extrabold uppercase tracking-[0.2em] hover:bg-white transition"
                >
                  Join
                </button>
              </form>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-3">
              <div className="text-[10px] tracking-[0.28em] uppercase font-extrabold text-[#a3e635]">
                Quick Links
              </div>
              <ul className="mt-5 space-y-3 text-sm">
                {[
                  { href: "/clients/zenith-sports", label: "Home" },
                  { href: "/clients/zenith-sports#about", label: "About" },
                  { href: "/clients/zenith-sports#tekky", label: "The TEKKY®" },
                  { href: "/clients/zenith-sports/shop", label: "Apparel & Shop" },
                  { href: "/clients/zenith-sports#training", label: "Trainings" },
                  { href: "/clients/zenith-sports#contact", label: "Contact" },
                ].map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="hover:text-white transition">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Get in touch */}
            <div className="lg:col-span-4">
              <div className="text-[10px] tracking-[0.28em] uppercase font-extrabold text-[#a3e635]">
                Get in touch
              </div>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Envelope size={16} weight="bold" className="mt-0.5 flex-shrink-0" />
                  <a href={BUSINESS.emailHref} className="hover:text-white transition">
                    {BUSINESS.email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <InstagramLogo size={16} weight="bold" className="mt-0.5 flex-shrink-0" />
                  <a
                    href={BUSINESS.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition"
                  >
                    Instagram
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <FacebookLogo size={16} weight="bold" className="mt-0.5 flex-shrink-0" />
                  <a
                    href={BUSINESS.socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition"
                  >
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Updated copyright + trademark line per brand voice guide
              legal notes. Once the patent is granted, swap "Patent Pending"
              for "Patented." */}
          <div className="mt-16 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-[11px] tracking-[0.18em] uppercase font-semibold text-white/40">
            <div>
              © 2025 Zenith Sports, LLC · TEKKY<sup className="text-[0.7em] align-top">®</sup>{" "}
              is a registered trademark · Patent Pending
            </div>
            <div>
              Site by{" "}
              <a
                href="https://bluejaywebdesign.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-[#a3e635] transition"
              >
                BlueJays
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
