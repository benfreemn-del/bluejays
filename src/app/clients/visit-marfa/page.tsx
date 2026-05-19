/* eslint-disable @next/next/no-img-element */

/**
 * /clients/visit-marfa — bespoke premium showcase for the MARFA Visitor
 * Center / chamber-of-commerce-style destination marketing org.
 *
 * v3 — magazine-feature rebuild. v1 was structurally a tourism template
 * with Marfa decoration on top. v3 is Marfa-shaped from the bones up:
 *  - long-form editorial primer instead of a "why visit" pitch
 *  - The Judd Empire as a dedicated full-bleed feature
 *  - The Lights as its own quiet section
 *  - Galleries as a typographic list — no card grid
 *  - Restaurants as narrative paragraphs — no 3-up grid
 *  - Three lodgings each get a paragraph + image, not a 2x2 card grid
 *  - 12-cell month-by-month seasonal honesty
 *  - Practical "before you come" bullet table
 *  - Sharp-cornered InquiryForm via [&_.rounded-3xl]:rounded-none override
 *
 * Real org: MARFA Visitor Center — 302 S. Highland Ave, Marfa TX 79843
 * (432) 729-4772 · contact@visitmarfa.com · IG @visitmarfatx
 *
 * Server component. No motion library. No carousel. Quiet by design.
 */

import InquiryForm from "@/components/clients/InquiryForm";
import BackToTopButton from "@/components/BackToTopButton";
import {
  InstagramLogo,
  FacebookLogo,
  Phone,
  Envelope,
  MapPin,
} from "@phosphor-icons/react/dist/ssr";

// ─── Real Visit Marfa imagery (squarespace-cdn) ───────────────────
// All pulled directly from visitmarfa.com. Verified manually against
// their site DOM. Only fallback to Unsplash where the org's library
// has no equivalent.
const IMG_HERO_CUPOLA =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/0855170c-4600-49ea-9523-bee7d1cc6f52/cupolaview3.jpg";
const IMG_CHINATI =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/61c2c138-d073-4dd9-bcd6-5afeef099004/chinati-foundation-inside-1-600x400.jpg";
const IMG_PRADA =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/382dd722-6e40-43b4-aa81-bc8a48a4d214/Culture_Prada_lowres.jpeg";
const IMG_BORDO =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/fb322c04-3412-495d-92c5-6ca7d478402a/Bordo023.jpg";
const IMG_SAINT_GEORGE =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/ce45299d-9e24-4f53-8dd5-689165b72778/History_Saint+George_1_lowres.jpg";
const IMG_EL_COSMICO =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/d1691d06-88a0-4654-90e3-c181fb767a3b/el_cosmicohotel.jpg";
const IMG_THUNDERBIRD =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/5351fa98-c097-47ab-b5dd-2ad70b7a4539/thunderbird-sign-daylight-1-600x400.jpg";
const IMG_LOGO =
  "https://images.squarespace-cdn.com/content/v1/68360adf55bb667dc8c3e5f4/72165222-acd9-4e48-b97e-830ddbfd57d6/MARFA_primary+logo_300ppi.png";

// Last-resort fallbacks — curl-verified, used only where their library
// did not surface a fitting photo (the night sky and the open highway).
// Replaced 2026-05-02: photo-1532978879514 was returning 404 from
// Unsplash. Swapped to a verified Milky Way / starfield photo
// (curl-checked 200) — better fit anyway for the high-desert
// dark-sky context this section describes.
const IMG_NIGHT_SKY =
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1600&q=80";
const IMG_DESERT_ROAD =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=80";

// ─── Marfa palette ─────────────────────────────────────────────────
const BG = "#faf6f0";
const BG_DEEP = "#f1ead9";
const BG_SAND = "#ebe2cf";
const INK = "#1a1612";
const INK_SOFT = "#5a4a42";
const INK_FAINT = "#8a7d72";
const RUST = "#c46a4d";
const RUST_DEEP = "#7d2a1b";
const HAIRLINE = "rgba(26, 22, 18, 0.18)";
const HAIRLINE_SOFT = "rgba(26, 22, 18, 0.08)";

// Editorial serif (Source Serif via system fallback; no Google import).
const SERIF =
  '"Source Serif Pro", "Source Serif", "Iowan Old Style", "Apple Garamond", "Baskerville", Georgia, serif';

// ─── Tiny helpers ──────────────────────────────────────────────────
function Eyebrow({
  children,
  color = INK_FAINT,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span
      className="inline-block text-[11px] uppercase tracking-[0.32em] font-medium"
      style={{ color }}
    >
      {children}
    </span>
  );
}

// ─── The 14 named galleries — verified from visitmarfa.com/art ─────
const GALLERIES: { name: string; addr: string; line: string }[] = [
  {
    name: "The Chinati Foundation",
    addr: "1 Cavalry Row",
    line: "Donald Judd's 340-acre former army base. The reason the rest of this list exists.",
  },
  {
    name: "Judd Foundation",
    addr: "104 S. Highland Ave.",
    line: "Judd's downtown studios, residences, and library — preserved exactly as he left them.",
  },
  {
    name: "Ballroom Marfa",
    addr: "108 E. San Antonio St.",
    line: "Non-profit kunsthalle in a 1927 dance hall. Visual art, performance, film, music.",
  },
  {
    name: "RULE Gallery",
    addr: "204 E. San Antonio St.",
    line: "Founded 1991. Investigative practices from emerging and mid-career contemporary artists.",
  },
  {
    name: "Exhibitions 2D",
    addr: "400 S. Highland Ave.",
    line: "Painting, drawing, sculpture, installation — quietly programmed in a quiet building.",
  },
  {
    name: "Marfa Open",
    addr: "102 S. Plateau St.",
    line: "Non-profit running residencies, exhibitions, and the annual art festival.",
  },
  {
    name: "Greasewood Gallery",
    addr: "Inside Hotel Paisano",
    line: "Regional artists, multiple shows a year. Drop in while you wait for a Jett's table.",
  },
  {
    name: "Veldt Gallery",
    addr: "119 S. Highland St.",
    line: "Fine art and photography — Donald Judd, Carl Andre, post-1960s American work.",
  },
  {
    name: "Art Blackburn",
    addr: "120 E. El Paso St. · by appointment",
    line: "Forty years of fine tribal art from a single, very particular dealer.",
  },
  {
    name: "Art Blocks",
    addr: "109 W. San Antonio St.",
    line: "Contemporary generative art — the on-chain side of a town built on permanence.",
  },
  {
    name: "Hacienda del Arcón / Building 98",
    addr: "705 W. Bonnie St.",
    line: "International Woman's Foundation HQ. Murals painted by WWII German POWs.",
  },
  {
    name: "Marfa Studio of Arts",
    addr: "106 E. San Antonio St.",
    line: "Children's art education non-profit with a small gallery facing the street.",
  },
  {
    name: "Anne Marie Nafziger Studio",
    addr: "125 N. Highland St.",
    line: "Abstract painter's downtown studio. By appointment, scheduled online.",
  },
  {
    name: "Martin Maria Studio",
    addr: "1308 W. San Antonio St.",
    line: "Tom Barnes and Uta-Maria Krapf. Wed–Sun, 10–2, or by appointment.",
  },
];

// ─── Twelve-month honest calendar ──────────────────────────────────
const MONTHS: { m: string; line: string; badge?: string }[] = [
  { m: "January", line: "Cold. Quiet. The galleries are open. You'll have the burrito counter to yourself." },
  { m: "February", line: "Still cold, still quiet. Late-month wind is real. Bring more layers than you'd expect for Texas." },
  { m: "March", line: "The shoulder begins. Wildflowers if there's been winter rain. Reservations start to matter again." },
  { m: "April", line: "Mild days, cold nights. The single best month if you don't need a festival to organize the trip around." },
  { m: "May", line: "Warm, dry, golden. Last comfortable month before summer settles in." },
  { m: "June", line: "Hot. Skies still clear most days. Mornings and dusk redeem the middle of the day." },
  { m: "July", line: "Hot, real hot. Highs in the upper 90s, occasional monsoon thunder. Plan around 11–4." },
  { m: "August", line: "Marfa Lights Festival, last weekend. Otherwise the slowest month of the year — for reasons." },
  {
    m: "September",
    line: "Trans-Pecos foothills shake off the heat. Late month brings the festival; book three months out.",
    badge: "TRANS-PECOS",
  },
  {
    m: "October",
    line: "Chinati Weekend, second weekend. Days 65 and golden. If you can only come once, come now.",
    badge: "CHINATI WEEKEND",
  },
  { m: "November", line: "Slowest of the slow. Beautiful for the same reason. A few restaurants take winter breaks." },
  {
    m: "December",
    line: "The NYE party is the social event of the year. The week before is silent and bracing.",
    badge: "NYE",
  },
];

// ─── Page ─────────────────────────────────────────────────────────
export default function VisitMarfaPage() {
  return (
    <>
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
        style={{
          background: "rgba(250, 246, 240, 0.88)",
          borderBottom: `1px solid ${HAIRLINE_SOFT}`,
        }}
      >
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <a href="#top" className="flex items-baseline gap-3">
            <span
              className="text-[15px] tracking-[0.42em] font-semibold"
              style={{ color: INK }}
            >
              MARFA
            </span>
            <span
              className="hidden sm:inline-block text-[10px] uppercase tracking-[0.28em]"
              style={{ color: INK_FAINT }}
            >
              A Visitor's Field Guide
            </span>
          </a>
          <div
            className="hidden md:flex items-center gap-9 text-[11px] uppercase tracking-[0.24em]"
            style={{ color: INK_SOFT }}
          >
            <a href="#primer" className="hover:opacity-60 transition-opacity">Primer</a>
            <a href="#judd" className="hover:opacity-60 transition-opacity">Judd</a>
            <a href="#lights" className="hover:opacity-60 transition-opacity">Lights</a>
            <a href="#galleries" className="hover:opacity-60 transition-opacity">Galleries</a>
            <a href="#eat" className="hover:opacity-60 transition-opacity">Eat</a>
            <a href="#stay" className="hover:opacity-60 transition-opacity">Stay</a>
            <a href="#calendar" className="hover:opacity-60 transition-opacity">Calendar</a>
          </div>
          <a
            href="#plan"
            className="text-[11px] uppercase tracking-[0.24em] font-medium border-b border-current pb-0.5"
            style={{ color: INK }}
          >
            Plan
          </a>
        </div>
      </nav>

      {/* ── A · HERO ─────────────────────────────────────────────── */}
      <section id="top" className="relative" style={{ background: BG }}>
        <div className="relative h-[92vh] min-h-[680px] max-h-[980px] overflow-hidden">
          <img
            src={IMG_HERO_CUPOLA}
            alt="A view from a cupola across the Chihuahuan Desert toward the Davis Mountains"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(26,22,18,0.18) 0%, rgba(26,22,18,0) 30%, rgba(26,22,18,0) 55%, rgba(26,22,18,0.62) 100%)",
            }}
          />
          {/* Bracket-corner restraint, top corners only */}
          <div
            style={{
              position: "absolute", top: 28, left: 28, width: 36, height: 36,
              borderTop: "1px solid rgba(255,255,255,0.55)",
              borderLeft: "1px solid rgba(255,255,255,0.55)",
            }}
          />
          <div
            style={{
              position: "absolute", top: 28, right: 28, width: 36, height: 36,
              borderTop: "1px solid rgba(255,255,255,0.55)",
              borderRight: "1px solid rgba(255,255,255,0.55)",
            }}
          />

          {/* Coordinate eyebrow */}
          <div className="absolute top-10 left-0 right-0 flex justify-center">
            <span
              className="text-[10px] uppercase tracking-[0.48em] font-medium"
              style={{ color: "rgba(255,255,255,0.82)" }}
            >
              30°18′N · 104°01′W · 4,688 ft
            </span>
          </div>

          {/* Bottom-aligned headline */}
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-[1320px] mx-auto w-full px-6 md:px-10 pb-20 md:pb-28">
              <div className="max-w-3xl">
                <span
                  className="block text-[11px] uppercase tracking-[0.36em] mb-7"
                  style={{ color: "rgba(255,255,255,0.78)" }}
                >
                  Marfa, Texas — A Visitor's Field Guide
                </span>
                <h1
                  className="text-[40px] md:text-[68px] lg:text-[84px] leading-[1.02] tracking-[-0.015em] font-light text-white"
                  style={{ fontFamily: SERIF }}
                >
                  A small town in the
                  <br />
                  high desert that
                  <br />
                  has, somehow,
                  <br />
                  <span className="italic" style={{ color: "#f3d9c8" }}>
                    become a verb.
                  </span>
                </h1>
                <div className="mt-12 flex flex-wrap items-center gap-6">
                  <a
                    href="#primer"
                    className="inline-flex items-center gap-3 px-7 py-3.5 text-[12px] uppercase tracking-[0.24em] font-medium transition-opacity hover:opacity-80"
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.7)",
                      color: "#fff",
                    }}
                  >
                    Read on
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── B · PRIMER (long-form editorial) ─────────────────────── */}
      <section id="primer" style={{ background: BG }}>
        <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-32 md:py-40">
          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-3">
              <Eyebrow>First time</Eyebrow>
              <p
                className="mt-6 text-[13px] leading-[1.7]"
                style={{ color: INK_FAINT, fontFamily: SERIF, fontStyle: "italic" }}
              >
                A short orientation, before
                you decide what to do
                with three days here.
              </p>
            </div>
            <div className="md:col-span-9">
              <h2
                className="text-[28px] md:text-[36px] font-light leading-[1.18] tracking-[-0.005em] mb-10 max-w-[34ch]"
                style={{ fontFamily: SERIF, color: INK }}
              >
                Marfa was a railroad town first. Then a cattle town.
                Then, briefly, a film set. Now it is the thing it is now.
              </h2>
              <div
                className="text-[18px] md:text-[19px] leading-[1.78] space-y-7"
                style={{ color: INK_SOFT, fontFamily: SERIF }}
              >
                <p>
                  The town was platted in 1883 as a water and freight stop on
                  the Galveston, Harrisburg & San Antonio Railway. Its name
                  is — depending on who you ask — pulled from a minor
                  character in <span style={{ fontStyle: "italic" }}>The Brothers Karamazov</span>,
                  proposed by a railroad executive's wife. For its first
                  half-century it was a dry, small, working ranching
                  community at four-thousand-six-hundred feet of elevation,
                  three hours from anywhere with a stoplight.
                </p>
                <p>
                  In 1955, the cast of George Stevens's <span style={{ fontStyle: "italic" }}>Giant</span> arrived
                  to film the Reata Ranch scenes. Rock Hudson, Elizabeth
                  Taylor, and the last performance of James Dean's career
                  were headquartered at the Hotel Paisano. The film didn't
                  change Marfa overnight, but it lodged the town's name in a
                  particular kind of American memory — the way a single
                  good photograph can.
                </p>
                <p>
                  The actual transformation came in 1971, when Donald Judd
                  began buying land. Judd was leaving the New York gallery
                  system because he hated it, and he wanted to install his
                  work — and the work of the artists he respected —
                  permanently, at a scale and in a setting the work
                  required. By 1979, the Chinati Foundation was operating
                  out of a decommissioned army base on the south edge of
                  town. Dan Flavin, John Chamberlain, Roni Horn, Robert
                  Irwin, Carl Andre, Richard Long, and Ilya Kabakov
                  followed.
                </p>
                <p>
                  What Marfa is now is the town that grew around that
                  decision: roughly eighteen-hundred people, fourteen
                  galleries, two Pulitzer winners, and a rotating cast of
                  visitors who are aware they are visitors and try, mostly,
                  to behave like it. The desert here is genuinely beautiful.
                  The light is the reason Judd came. The cattle still
                  outnumber the artists. None of these things contradict
                  each other.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── C · THE JUDD EMPIRE ──────────────────────────────────── */}
      <section id="judd" className="relative" style={{ background: INK, color: BG }}>
        <div className="relative w-full" style={{ aspectRatio: "21 / 9" }}>
          <img
            src={IMG_CHINATI}
            alt="Interior of one of the Chinati Foundation's converted artillery sheds — Donald Judd's milled-aluminum boxes"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "saturate(0.7) contrast(1.04)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(0deg, rgba(26,22,18,0.55) 0%, rgba(26,22,18,0.10) 60%, rgba(26,22,18,0.0) 100%)",
            }}
          />
          <div className="absolute bottom-0 left-0 right-0">
            <div className="max-w-[1320px] mx-auto px-6 md:px-10 pb-12 md:pb-16">
              <Eyebrow color="rgba(255,255,255,0.6)">Section II</Eyebrow>
              <p
                className="mt-3 text-[12px] uppercase tracking-[0.32em] font-medium"
                style={{ color: "rgba(255,255,255,0.78)" }}
              >
                The Judd Empire — Chinati & the Foundation
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-28 md:py-36 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-7">
            <h2
              className="text-[40px] md:text-[60px] font-light leading-[1.04] tracking-[-0.015em]"
              style={{ fontFamily: SERIF, color: BG }}
            >
              An aluminum box,
              <br />
              in a converted artillery shed,
              <br />
              <span style={{ color: "#d4836b", fontStyle: "italic" }}>
                in the late afternoon.
              </span>
            </h2>
          </div>
          <div className="md:col-span-5">
            <div
              className="text-[17px] leading-[1.78] space-y-6"
              style={{ color: "rgba(250, 246, 240, 0.78)" }}
            >
              <p>
                Donald Judd bought the former Fort D.A. Russell in 1979. He
                converted two artillery sheds to house his hundred milled
                aluminum boxes — each one identical in outside dimension,
                each one differently divided inside. The works are arranged
                in a single grid that runs the full length of both sheds.
                The east wall is glass. The light moves across the boxes
                from morning to evening and the work is, very deliberately,
                a different work at every hour of the day.
              </p>
              <p>
                That is one room of the collection. Outside, in a quarter
                mile of dry grass, are the fifteen untitled works in
                concrete — Judd's open boxes, cast on-site between 1980
                and 1984. Other buildings hold permanent installations by
                Dan Flavin, John Chamberlain, Roni Horn, Carl Andre. A
                separate downtown property — the Judd Foundation — preserves
                his studios, residences, and library exactly as he left
                them when he died in 1994.
              </p>
            </div>
          </div>
        </div>

        {/* Practical strip */}
        <div
          className="border-t border-b"
          style={{
            borderColor: "rgba(255,255,255,0.14)",
            background: "rgba(0,0,0,0.18)",
          }}
        >
          <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-10 grid md:grid-cols-4 gap-8">
            {[
              { k: "Full Collection Tour", v: "$35", n: "~5 hours, including a lunch break. The whole thing." },
              { k: "Selections Tour", v: "$25", n: "~3 hours. Judd, Flavin, Irwin, Chamberlain Building." },
              { k: "Focus Tour", v: "$15", n: "~1.5 hours. Judd's aluminum works plus the current exhibition." },
              { k: "All tours", v: "By reservation", n: "Free for tri-county residents, members, kids under 17." },
            ].map((s) => (
              <div key={s.k}>
                <Eyebrow color="rgba(255,255,255,0.55)">{s.k}</Eyebrow>
                <p
                  className="mt-3 text-[28px] font-light leading-none"
                  style={{ fontFamily: SERIF, color: BG }}
                >
                  {s.v}
                </p>
                <p
                  className="mt-2 text-[13px] leading-[1.6]"
                  style={{ color: "rgba(250, 246, 240, 0.65)" }}
                >
                  {s.n}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pull quote */}
        <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-28 md:py-36">
          <blockquote
            className="text-[26px] md:text-[36px] leading-[1.32] tracking-[-0.005em] font-light"
            style={{ fontFamily: SERIF, color: BG }}
          >
            <span aria-hidden style={{ color: "#d4836b" }}>“</span>
            A contemporary art museum based upon the ideas of its founder,
            Donald Judd.
            <span aria-hidden style={{ color: "#d4836b" }}>”</span>
          </blockquote>
          <p
            className="mt-6 text-[12px] uppercase tracking-[0.28em]"
            style={{ color: "rgba(250, 246, 240, 0.55)" }}
          >
            — The Chinati Foundation, on itself
          </p>
        </div>
      </section>

      {/* ── D · THE LIGHTS ──────────────────────────────────────── */}
      <section id="lights" className="relative" style={{ background: BG_DEEP }}>
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-32 md:py-40 grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5">
            <Eyebrow color={RUST_DEEP}>Section III</Eyebrow>
            <h2
              className="mt-5 text-[40px] md:text-[58px] font-light leading-[1.04] tracking-[-0.015em]"
              style={{ fontFamily: SERIF, color: INK }}
            >
              The Lights.
            </h2>
            <p
              className="mt-10 text-[18px] md:text-[19px] leading-[1.78]"
              style={{ color: INK_SOFT, fontFamily: SERIF }}
            >
              Ranchers, Native Americans, high-school sweethearts, and at
              least one published meteorologist have been reporting them
              since 1883. Red, blue, white. They appear, hold, drift,
              vanish. Sometimes they move, the witnesses say, at speeds
              that cannot be reconciled with anything else moving on the
              ground. Skeptics blame headlights and atmospheric layering.
              The skeptics, who have not stood out there, are welcome to
              their position.
            </p>

            <div
              className="mt-12 pt-8 border-t grid grid-cols-2 gap-x-6 gap-y-5"
              style={{ borderColor: HAIRLINE_SOFT }}
            >
              <div>
                <Eyebrow>Where</Eyebrow>
                <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: INK }}>
                  Marfa Lights Viewing Area
                </p>
                <p className="text-[13px]" style={{ color: INK_FAINT }}>
                  US-90, ~9 mi east of town
                </p>
              </div>
              <div>
                <Eyebrow>When</Eyebrow>
                <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: INK }}>
                  After dark, year-round
                </p>
                <p className="text-[13px]" style={{ color: INK_FAINT }}>
                  No facilities — bring water, jacket
                </p>
              </div>
              <div>
                <Eyebrow>Cost</Eyebrow>
                <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: INK }}>
                  Free
                </p>
              </div>
              <div>
                <Eyebrow>The festival</Eyebrow>
                <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: INK }}>
                  Last weekend of August
                </p>
                <p className="text-[13px]" style={{ color: INK_FAINT }}>
                  38 years and counting
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <div className="relative" style={{ aspectRatio: "4 / 5" }}>
              <img
                src={IMG_NIGHT_SKY}
                alt="The night sky over the West Texas high desert"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: "saturate(0.75) contrast(1.05) brightness(0.85)" }}
              />
              <div
                style={{
                  position: "absolute", top: 14, left: 14, width: 28, height: 28,
                  borderTop: "1px solid rgba(255,255,255,0.55)",
                  borderLeft: "1px solid rgba(255,255,255,0.55)",
                }}
              />
              <div
                style={{
                  position: "absolute", bottom: 14, right: 14, width: 28, height: 28,
                  borderBottom: "1px solid rgba(255,255,255,0.55)",
                  borderRight: "1px solid rgba(255,255,255,0.55)",
                }}
              />
            </div>
            <p
              className="mt-5 text-[12px] leading-[1.55] italic"
              style={{ color: INK_FAINT }}
            >
              The viewing area faces southeast. The lights, when they
              come, appear above the Chinati Mountains in the middle
              distance. There is no particular schedule.
            </p>
          </div>
        </div>
      </section>

      {/* ── E · THE GALLERIES (typographic list) ─────────────────── */}
      <section id="galleries" style={{ background: BG }}>
        <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-32 md:py-40">
          <div className="mb-16 md:mb-20">
            <Eyebrow color={RUST_DEEP}>Section IV</Eyebrow>
            <h2
              className="mt-5 text-[40px] md:text-[58px] font-light leading-[1.04] tracking-[-0.015em] max-w-[18ch]"
              style={{ fontFamily: SERIF, color: INK }}
            >
              The Galleries, in alphabetical order.
            </h2>
            <p
              className="mt-8 text-[16px] leading-[1.75] max-w-[60ch]"
              style={{ color: INK_SOFT }}
            >
              Most are within a four-block walk of the Presidio County
              Courthouse. An afternoon will cover the downtown set
              comfortably. Hours rotate; many are appointment-only;
              several close the day you'd expect them to be open. Call
              ahead, or stop by the Visitor Center on Highland and we
              will tell you which doors are unlocked.
            </p>
          </div>

          <ul
            className="border-t"
            style={{ borderColor: HAIRLINE }}
          >
            {GALLERIES.map((g) => (
              <li
                key={g.name}
                className="grid grid-cols-12 gap-4 py-7 md:py-9 border-b"
                style={{ borderColor: HAIRLINE }}
              >
                <div className="col-span-12 md:col-span-7">
                  <h3
                    className="text-[26px] md:text-[32px] font-light leading-[1.1]"
                    style={{ fontFamily: SERIF, color: INK }}
                  >
                    {g.name}
                  </h3>
                  <p
                    className="mt-2 text-[15px] leading-[1.65] italic"
                    style={{ color: INK_SOFT, fontFamily: SERIF }}
                  >
                    {g.line}
                  </p>
                </div>
                <div className="col-span-12 md:col-span-5 md:text-right md:self-end">
                  <p
                    className="text-[12px] uppercase tracking-[0.22em]"
                    style={{ color: INK_FAINT }}
                  >
                    {g.addr}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p
            className="mt-12 text-[13px] italic max-w-[55ch]"
            style={{ color: INK_FAINT }}
          >
            Also worth your time, scattered across the landscape:
            Elmgreen & Dragset's <span style={{ fontStyle: "normal", fontWeight: 500 }}>Prada Marfa</span> (37 mi NW
            on US-90), the <span style={{ fontStyle: "normal", fontWeight: 500 }}>Giant Marfa Mural</span> (5 mi W),
            the <span style={{ fontStyle: "normal", fontWeight: 500 }}>Frida Kahlo Mural</span> on West San Antonio,
            and Haroon Mirza's <span style={{ fontStyle: "normal", fontWeight: 500 }}>Stone Circle</span> (golf course
            road, best at full moon).
          </p>
        </div>
      </section>

      {/* ── E.5 · SECTION BREAK · Prada Marfa full-bleed ──────────
           Quiet visual rhythm-break between the typographic galleries
           list and the long Eat section. Prada Marfa is the most-
           photographed thing in the county; on the page it earns its
           own moment without a header or caption. */}
      <section
        aria-hidden
        style={{ background: BG_DEEP }}
        className="relative"
      >
        <div className="relative w-full" style={{ aspectRatio: "16 / 7" }}>
          <img
            src={IMG_PRADA}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "saturate(0.92) contrast(1.02)" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(13,9,7,0.18) 0%, rgba(13,9,7,0) 30%, rgba(13,9,7,0) 70%, rgba(13,9,7,0.55) 100%)",
            }}
          />
          <p
            className="absolute bottom-5 right-6 md:bottom-7 md:right-10 text-[11px] md:text-[12px] uppercase tracking-[0.3em]"
            style={{ color: "rgba(255,255,255,0.68)" }}
          >
            Prada Marfa · 37 mi NW on US-90 · 2005, Elmgreen & Dragset
          </p>
        </div>
      </section>

      {/* ── F · WHERE TO EAT (narrative) ─────────────────────────── */}
      <section id="eat" className="relative" style={{ background: BG_DEEP }}>
        <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-32 md:py-40">
          <div className="mb-14 grid md:grid-cols-12 gap-10">
            <div className="md:col-span-5">
              <Eyebrow color={RUST_DEEP}>Section V</Eyebrow>
              <h2
                className="mt-5 text-[40px] md:text-[56px] font-light leading-[1.04] tracking-[-0.015em]"
                style={{ fontFamily: SERIF, color: INK }}
              >
                Where to eat,
                <br />
                read Tuesday-first.
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p
                className="text-[16px] leading-[1.75]"
                style={{ color: INK_SOFT }}
              >
                The thing nobody tells you about Marfa restaurants is
                that they don't all open on the same days, and on any
                given night roughly a third of them aren't serving. This
                is a feature, not a bug. Plan around it.
              </p>
            </div>
          </div>

          <div className="md:hidden mb-10">
            <img
              src={IMG_BORDO}
              alt="Wood-fired bread and stone-milled pasta at Bordo"
              className="w-full aspect-[3/2] object-cover"
            />
          </div>

          <div className="grid md:grid-cols-12 gap-10 md:gap-14">
            <div
              className="md:col-span-7 text-[17px] md:text-[18px] leading-[1.85] space-y-7"
              style={{ color: INK_SOFT, fontFamily: SERIF }}
            >
              <p>
                If you arrive on a Tuesday, you have fewer choices than
                you think. <span style={{ color: INK, fontWeight: 500 }}>Cochineal</span> (107 W. San Antonio) does
                the closest thing the town offers to a fine-dining
                evening, and it is quietly excellent — but it is closed.{" "}
                <span style={{ color: INK, fontWeight: 500 }}>Bordo</span> (1210 W. San Antonio), the Italian deli
                pulling stone-milled pasta and wood-fired bread out of
                its kitchen Thursday through Sunday only, is also closed.
                What's reliable on a Tuesday: <span style={{ color: INK, fontWeight: 500 }}>Marfa Burrito</span>
                {" "}(515 S. Highland, open 7–2, Monday through Saturday,
                cash only, hand-rolled flour tortillas the size of a
                dinner plate, machaca that has not changed in forty
                years), <span style={{ color: INK, fontWeight: 500 }}>The Sentinel</span> (209 W. El Paso, open
                daily 7:30–3, the coffee-and-sandwich spot inside the
                old newspaper office), and the dining room at the Hotel
                Paisano, which serves breakfast at <span style={{ color: INK, fontWeight: 500 }}>Jett's Grill</span>
                {" "}from seven-thirty.
              </p>
              <p>
                For dinner that holds up to anything you'd find in a
                bigger city: <span style={{ color: INK, fontWeight: 500 }}>Margaret's in Marfa</span> (103 N.
                Highland, Wednesday–Saturday, 5–9, the most-talked-about
                opening in town), <span style={{ color: INK, fontWeight: 500 }}>Laventure</span> at the Hotel Saint
                George (105 S. Highland, daily, 5–10, the room with the
                wine list), and <span style={{ color: INK, fontWeight: 500 }}>Alta Marfa</span> (120 N. Austin,
                Friday through Sunday, 5–10, low-lit, strong pours). All
                three take reservations and all three need them on
                weekends.
              </p>
              <p>
                For coffee — and Marfa, in the morning, is mostly a
                coffee town — <span style={{ color: INK, fontWeight: 500 }}>Mutual Friends</span> shares an address
                with Alta Marfa and pulls the most-considered shot in
                town (Wednesday–Sunday, 7:30–2:30). <span style={{ color: INK, fontWeight: 500 }}>Coyote Coffee</span>
                {" "}on West San Antonio runs daily, 8–2, with house-made
                pastries before nine if you're early. <span style={{ color: INK, fontWeight: 500 }}>Big Bend Coffee Roasters</span>
                {" "}roasts everything you'll drink in town, and is worth
                a stop for that reason alone.
              </p>
              <p>
                For a drink after the sun is gone:{" "}
                <span style={{ color: INK, fontWeight: 500 }}>Planet Marfa</span> (200 S. Abbott, daily 1–11) is
                the outdoor backyard bar — string lights, a teepee, the
                town's best dive energy.{" "}
                <span style={{ color: INK, fontWeight: 500 }}>The Pony</span> (306 E. San Antonio, Tuesday–Sunday)
                is the cold-beer-and-good-tunes alternative.{" "}
                <span style={{ color: INK, fontWeight: 500 }}>Marfa Spirit Co.</span> (320 W. El Paso) is the local
                distillery — sotol cocktails, themed dinner nights, the
                bar nobody from out of town knows about for the first
                three hours of an evening.{" "}
                <span style={{ color: INK, fontWeight: 500 }}>Otherside</span> (110 El Paso, Thursday–Saturday, 8
                until late) is the speakeasy nobody from out of town
                knows about for the first six.
              </p>
              <p>
                Two more, briefly, before you go. <span style={{ color: INK, fontWeight: 500 }}>Angel's</span> on
                South Spring is the long-standing Mexican restaurant —
                chile rellenos, burritos, family-run, no website, the
                phone number works. <span style={{ color: INK, fontWeight: 500 }}>The Water Stop</span> on West San
                Antonio does an American-with-a-twist menu and won
                "best burger in Marfa" for 2021, which here means
                something specific.
              </p>
            </div>

            <div className="hidden md:block md:col-span-5">
              <div className="sticky top-28">
                <img
                  src={IMG_BORDO}
                  alt="Wood-fired bread and stone-milled pasta at Bordo"
                  className="w-full aspect-[4/5] object-cover"
                />
                <p
                  className="mt-4 text-[12px] uppercase tracking-[0.22em]"
                  style={{ color: INK_FAINT }}
                >
                  Bordo · 1210 W. San Antonio · Thu–Sun
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── G · WHERE TO STAY (3 paragraphs + coda) ─────────────── */}
      <section id="stay" style={{ background: BG }}>
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-32 md:py-40">
          <div className="mb-20 max-w-3xl">
            <Eyebrow color={RUST_DEEP}>Section VI</Eyebrow>
            <h2
              className="mt-5 text-[40px] md:text-[58px] font-light leading-[1.04] tracking-[-0.015em]"
              style={{ fontFamily: SERIF, color: INK }}
            >
              Where to sleep.
            </h2>
            <p
              className="mt-8 text-[17px] leading-[1.75]"
              style={{ color: INK_SOFT, fontFamily: SERIF }}
            >
              Three properties carry most of the conversation about
              Marfa lodging, and they each represent a different idea of
              what coming here is for. Pick the one that matches the
              version of the trip you want.
            </p>
          </div>

          <div className="space-y-32 md:space-y-40">
            {/* HOTEL SAINT GEORGE */}
            <article className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
              <div className="md:col-span-7">
                <img
                  src={IMG_SAINT_GEORGE}
                  alt="The Hotel Saint George — restored 1929 building on Highland Avenue"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
              <div className="md:col-span-5">
                <Eyebrow color={RUST_DEEP}>The anchor</Eyebrow>
                <h3
                  className="mt-4 text-[34px] md:text-[44px] font-light leading-[1.05]"
                  style={{ fontFamily: SERIF, color: INK }}
                >
                  Hotel Saint George
                </h3>
                <p
                  className="mt-6 text-[16px] leading-[1.78]"
                  style={{ color: INK_SOFT, fontFamily: SERIF }}
                >
                  Fifty-five rooms in a quietly elegant downtown hotel
                  that reopened in 2016 inside a 1929 shell on Highland
                  Avenue. The lobby holds a working bookshop and the
                  best bar in town. Laventure is on the ground floor,
                  the rooms are spare and considered, and the Sentinel
                  is a five-minute walk one direction while Marfa
                  Burrito is a six-minute walk the other. If you only
                  have one weekend and don't want to think about
                  logistics, this is the answer.
                </p>
                <p
                  className="mt-6 text-[12px] uppercase tracking-[0.22em]"
                  style={{ color: INK_FAINT }}
                >
                  105 S. Highland Ave · marfasaintgeorge.com
                </p>
              </div>
            </article>

            {/* EL COSMICO */}
            <article className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
              <div className="md:col-span-5 md:order-1 order-2">
                <Eyebrow color={RUST_DEEP}>The Marfa idea</Eyebrow>
                <h3
                  className="mt-4 text-[34px] md:text-[44px] font-light leading-[1.05]"
                  style={{ fontFamily: SERIF, color: INK }}
                >
                  El Cosmico
                </h3>
                <p
                  className="mt-6 text-[16px] leading-[1.78]"
                  style={{ color: INK_SOFT, fontFamily: SERIF }}
                >
                  Liz Lambert's eighteen-acre nomadic campground —
                  thirteen restored vintage trailers, twenty-one safari
                  tents, yurts, tepees, hammocks, a community kitchen,
                  outdoor wood-fired hot tubs under the sky. It is the
                  iconic photograph of Marfa, the host of the
                  Trans-Pecos Festival each September, and (as of 2025)
                  in the middle of an architect-led redesign. The
                  current era is a closing chapter; whatever it becomes
                  next will, knowing Lambert, be worth the wait.
                </p>
                <p
                  className="mt-6 text-[12px] uppercase tracking-[0.22em]"
                  style={{ color: INK_FAINT }}
                >
                  802 S. Highland Ave · elcosmico.com
                </p>
              </div>
              <div className="md:col-span-7 md:order-2 order-1">
                <img
                  src={IMG_EL_COSMICO}
                  alt="El Cosmico — vintage trailers, safari tents, and yurts on the south edge of town"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
            </article>

            {/* THUNDERBIRD */}
            <article className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
              <div className="md:col-span-7">
                <img
                  src={IMG_THUNDERBIRD}
                  alt="The Thunderbird Hotel — a restored 1959 horseshoe-plan motor lodge"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
              <div className="md:col-span-5">
                <Eyebrow color={RUST_DEEP}>The mid-century</Eyebrow>
                <h3
                  className="mt-4 text-[34px] md:text-[44px] font-light leading-[1.05]"
                  style={{ fontFamily: SERIF, color: INK }}
                >
                  The Thunderbird
                </h3>
                <p
                  className="mt-6 text-[16px] leading-[1.78]"
                  style={{ color: INK_SOFT, fontFamily: SERIF }}
                >
                  A 1959 motor lodge in classic horseshoe plan, restored
                  with the right amount of restraint — Frette linens,
                  Aesop in the bathrooms, a saltwater pool, a sign that
                  glows pink at dusk. Quieter than the Saint George and
                  more grown-up than El Cosmico. The aesthetic moves
                  here are the kind that show up later, attributed to
                  someone else, in a magazine.
                </p>
                <p
                  className="mt-6 text-[12px] uppercase tracking-[0.22em]"
                  style={{ color: INK_FAINT }}
                >
                  601 W. San Antonio St · thunderbirdmarfa.com
                </p>
              </div>
            </article>
          </div>

          {/* CODA */}
          <div
            className="mt-32 md:mt-40 pt-12 border-t max-w-[68ch]"
            style={{ borderColor: HAIRLINE }}
          >
            <Eyebrow>Also</Eyebrow>
            <p
              className="mt-5 text-[16px] leading-[1.85]"
              style={{ color: INK_SOFT, fontFamily: SERIF }}
            >
              Beyond those three: <span style={{ color: INK, fontWeight: 500 }}>The Sentinel</span> rents rooms
              above the bar and bookshop. <span style={{ color: INK, fontWeight: 500 }}>Hotel Paisano</span> —
              the Trost-designed 1930 hotel where the cast of <span style={{ fontStyle: "italic" }}>Giant</span> stayed —
              keeps a heated pool and a whole lot of James Dean ephemera.
              <span style={{ color: INK, fontWeight: 500 }}> Carmen's Boutique Hotel</span> is six self-service
              rooms in town. <span style={{ color: INK, fontWeight: 500 }}>The Lincoln</span> is a newer compound
              with five courtyard gardens. <span style={{ color: INK, fontWeight: 500 }}>Cibolo Creek Ranch</span>
              {" "}is thirty-three miles south, an actual nineteenth-century
              fortified ranch, and is where you go when you want
              something other than Marfa for a night. The vacation-rental
              scene fills in the gaps; on festival weekends, it is the
              first thing to disappear.
            </p>
          </div>
        </div>
      </section>

      {/* ── H · CALENDAR (12 cells) ──────────────────────────────── */}
      <section id="calendar" style={{ background: BG_SAND }}>
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-32 md:py-40">
          <div className="mb-16 max-w-3xl">
            <Eyebrow color={RUST_DEEP}>Section VII</Eyebrow>
            <h2
              className="mt-5 text-[40px] md:text-[58px] font-light leading-[1.04] tracking-[-0.015em]"
              style={{ fontFamily: SERIF, color: INK }}
            >
              The year, month by month.
            </h2>
            <p
              className="mt-8 text-[16px] leading-[1.75]"
              style={{ color: INK_SOFT }}
            >
              We'd rather tell you the truth than promise you August is
              fine. (It is not fine.)
            </p>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l"
            style={{ borderColor: HAIRLINE }}
          >
            {MONTHS.map((m, i) => (
              <div
                key={m.m}
                className="border-r border-b p-7 md:p-9"
                style={{ borderColor: HAIRLINE, background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.18)" }}
              >
                <div className="flex items-baseline justify-between gap-3 mb-4">
                  <h3
                    className="text-[26px] font-light leading-none"
                    style={{ fontFamily: SERIF, color: INK }}
                  >
                    {m.m}
                  </h3>
                  {m.badge && (
                    <span
                      className="text-[9px] uppercase tracking-[0.22em] font-semibold px-2 py-1 rounded-sm"
                      style={{
                        background: RUST_DEEP,
                        color: BG,
                      }}
                    >
                      {m.badge}
                    </span>
                  )}
                </div>
                <p
                  className="text-[14.5px] leading-[1.65]"
                  style={{ color: INK_SOFT, fontFamily: SERIF }}
                >
                  {m.line}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── I · BEFORE YOU COME (practical) ──────────────────────── */}
      <section style={{ background: BG }}>
        <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-32 md:py-40">
          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <Eyebrow color={RUST_DEEP}>Section VIII</Eyebrow>
              <h2
                className="mt-5 text-[36px] md:text-[44px] font-light leading-[1.05] tracking-[-0.01em]"
                style={{ fontFamily: SERIF, color: INK }}
              >
                Before you come.
              </h2>
              <p
                className="mt-8 text-[15px] leading-[1.7]"
                style={{ color: INK_SOFT }}
              >
                There is no airport. There is no Uber. There is, on
                most blocks, no cell service. The desert handles people
                who came prepared. It is less generous to the rest.
              </p>
              <div className="mt-10">
                <img
                  src={IMG_DESERT_ROAD}
                  alt="The empty highway through the West Texas high desert"
                  className="w-full aspect-[4/3] object-cover"
                  style={{ filter: "saturate(0.85)" }}
                />
              </div>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              <ul>
                {[
                  ["Nearest commercial airport", "Midland-Odessa (MAF), 170 mi · about 3 hrs. El Paso (ELP), 195 mi · also about 3 hrs, more flights."],
                  ["Nearest hospital", "Big Bend Regional Medical Center, Alpine — 26 mi east on US-90."],
                  ["Gas", "In town at Stripes / Town & Country. On long drives, top up in Alpine or Marathon — gaps between stations are real."],
                  ["Cell service", "Reliable downtown on most carriers. Spotty to non-existent within ten miles in any direction."],
                  ["Cash + ATMs", "Limited. Marfa Burrito and a few others are cash-only. Pull cash in Alpine if you're driving in."],
                  ["What to pack", "Layers. Desert temperature swings of 40°F day to night are normal. A sun hat. A real water bottle."],
                  ["Road advisories", "Mule deer at dusk on US-90 and US-67. Slow down between Alpine and Marfa after sunset."],
                  ["Time zone", "Central. Same as Houston, Austin, San Antonio."],
                  ["Drinking water", "The town water is hard but fine. Bottled is widely available. The desert is dry; drink more than you think you need."],
                ].map(([k, v]) => (
                  <li
                    key={k as string}
                    className="grid grid-cols-12 gap-4 py-6 border-b first:border-t"
                    style={{ borderColor: HAIRLINE }}
                  >
                    <p
                      className="col-span-12 md:col-span-4 text-[14px] uppercase tracking-[0.18em] font-medium"
                      style={{ color: INK }}
                    >
                      {k}
                    </p>
                    <p
                      className="col-span-12 md:col-span-8 text-[15px] leading-[1.7]"
                      style={{ color: INK_SOFT }}
                    >
                      {v}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── J · INQUIRY (sharp-cornered override) ────────────────── */}
      <section id="plan" style={{ background: BG_DEEP }}>
        <div className="max-w-[920px] mx-auto px-6 md:px-10 py-32 md:py-40">
          <div className="text-center mb-12">
            <Eyebrow color={RUST_DEEP}>Plan your visit</Eyebrow>
            <h2
              className="mt-5 text-[36px] md:text-[48px] font-light leading-[1.05] tracking-[-0.01em]"
              style={{ fontFamily: SERIF, color: INK }}
            >
              Tell us a little about
              <br />
              the trip you have in mind.
            </h2>
            <p
              className="mt-7 text-[15px] md:text-[16px] leading-[1.7] max-w-xl mx-auto"
              style={{ color: INK_SOFT }}
            >
              The Visitor Center can point you to lodging that hasn't
              filled, restaurants taking reservations the week you're
              here, and the events that won't show up on Eventbrite.
              Send us a note — a real person reads every one.
            </p>
          </div>

          {/* Sharp-corner override: collapse rounded-3xl on the form
              wrapper and on every input the form generates, so the
              form sits flush with the rest of the page's edge language. */}
          <div className="[&_.rounded-3xl]:rounded-none [&_.rounded-2xl]:rounded-none [&_.rounded-xl]:rounded-none [&_.rounded-lg]:rounded-none [&_.rounded-full]:rounded-none [&_.rounded-md]:rounded-sm [&_input]:rounded-none [&_textarea]:rounded-none [&_select]:rounded-none [&_button]:rounded-none">
            <InquiryForm
              slug="visit-marfa"
              accent={RUST_DEEP}
              accentDeep={RUST_DEEP}
              ink={INK}
              inkSoft={INK_SOFT}
              panelBg="#ffffff"
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
          </div>

          <div
            className="mt-14 grid sm:grid-cols-3 gap-7 text-[13px]"
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
          </div>
        </div>
      </section>

      {/* ── K · FOOTER ──────────────────────────────────────────── */}
      <footer
        className="border-t"
        style={{ borderColor: HAIRLINE, background: BG }}
      >
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-14 grid md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-5">
            <img
              src={IMG_LOGO}
              alt="Visit Marfa"
              className="h-10 w-auto mb-6 opacity-90"
            />
            <p
              className="text-[14px] leading-[1.7] max-w-md italic"
              style={{ color: INK_FAINT, fontFamily: SERIF }}
            >
              An oasis of culture in the Chihuahuan Desert. Operated by
              the MARFA Visitor Center, a community-led organization.
            </p>
          </div>

          <div className="md:col-span-3">
            <Eyebrow>Visit</Eyebrow>
            <ul
              className="mt-4 space-y-2 text-[13px]"
              style={{ color: INK_SOFT }}
            >
              <li><a href="#primer" className="hover:text-[#1a1612] transition-colors">First time</a></li>
              <li><a href="#judd" className="hover:text-[#1a1612] transition-colors">The Judd Empire</a></li>
              <li><a href="#lights" className="hover:text-[#1a1612] transition-colors">The Lights</a></li>
              <li><a href="#galleries" className="hover:text-[#1a1612] transition-colors">Galleries</a></li>
              <li><a href="#eat" className="hover:text-[#1a1612] transition-colors">Eat & drink</a></li>
              <li><a href="#stay" className="hover:text-[#1a1612] transition-colors">Stay</a></li>
              <li><a href="#calendar" className="hover:text-[#1a1612] transition-colors">Calendar</a></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <Eyebrow>Contact</Eyebrow>
            <p className="mt-4 text-[13px] leading-[1.75]" style={{ color: INK_SOFT }}>
              302 S. Highland Ave.<br />
              Marfa, TX 79843<br />
              <a href="tel:4327294772" className="hover:text-[#1a1612] transition-colors">(432) 729-4772</a><br />
              <a href="mailto:contact@visitmarfa.com" className="hover:text-[#1a1612] transition-colors">contact@visitmarfa.com</a>
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href="https://instagram.com/visitmarfatx"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 border flex items-center justify-center transition-colors hover:bg-[#1a1612] hover:text-white"
                style={{ borderColor: HAIRLINE, color: INK_SOFT }}
              >
                <InstagramLogo size={15} weight="regular" />
              </a>
              <a
                href="https://facebook.com/VisitMarfa"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 border flex items-center justify-center transition-colors hover:bg-[#1a1612] hover:text-white"
                style={{ borderColor: HAIRLINE, color: INK_SOFT }}
              >
                <FacebookLogo size={15} weight="regular" />
              </a>
            </div>
          </div>
        </div>

        <div
          className="px-6 md:px-10 py-6 border-t"
          style={{ borderColor: HAIRLINE_SOFT, color: INK_FAINT }}
        >
          <div className="max-w-[1320px] mx-auto flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.2em]">
            <span>© {new Date().getFullYear()} Marfa Visitor Center</span>
            <span>30°18′N · 104°01′W</span>
          </div>
        </div>
      </footer>

    </main>
    <BackToTopButton bg="#c46a4d" fg="#faf6f0" />
    </>
  );
}
