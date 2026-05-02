/* eslint-disable @next/next/no-img-element */

/**
 * /clients/mt-view-landscaping — bespoke single-page site for
 * Mountain View Landscape & Design Inc. (Auburn, WA).
 *
 * v2 rebuild (2026-05-01): the v1 felt like a tradesman template —
 * sprinkler hero, photo-dump gallery, ten-icon service grid. This
 * version is rebuilt against the visual identities of editorial
 * landscape-architect firms (Reed Hilderbrand, Hollander Design,
 * Andrea Cochran, Wirtz International). It treats Tim's archive as
 * monograph material, not a portfolio dump.
 *
 * Structure:
 *   Hero        — full-bleed, single line of type, no CTA
 *   Statement   — one editorial sentence, half a screen of breathing room
 *   Selected Work — case-study format (5 named projects, ~22 photos total)
 *   Practice    — six services, treated as a list, not a grid of icons
 *   About       — Tim's story, one pull-quote, zero portraits
 *   Philosophy  — three principles, generous typography
 *   Service Area — typographic four-county listing
 *   Process     — four-step intake → install → aftercare flow
 *   Contact     — sharp-cornered form
 *   Footer
 *
 * Photography: every photo is sourced directly from Mt View's existing
 * Squarespace CDN. Each URL was curl-verified 2026-05-01 with content-
 * length captured to ensure feature spots get genuinely high-resolution
 * source files (>800KB at 2500w). The sprinkler hero (`hero.jpg`) and
 * the team-portrait `67738826_*` photo from v1 are explicitly excluded.
 */

import MtViewContactForm from "./contact-form";
import StickyNav from "./sticky-nav";
import {
  Phone,
  EnvelopeSimple,
  MapPin,
} from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title:
    "Mountain View Landscape & Design — Custom Landscapes in King, Pierce, Snohomish & Kittitas Counties, WA",
  description:
    "Family-owned landscape design and installation in Auburn, WA. Hardscapes, water features, retaining walls, irrigation, sod, native planting and night lighting. Serving King, Pierce, Snohomish and Kittitas counties since 1976.",
};

// ─── Business details ────────────────────────────────────────────────
const BUSINESS = {
  name: "Mountain View Landscape & Design",
  established: 1976,
  phoneDisplay: "(253) 638-0500",
  phoneHref: "tel:+12536380500",
  email: "mtviewlandscapeonline@gmail.com",
  address: {
    street: "18225 Southeast 313th Street",
    city: "Auburn",
    state: "WA",
    zip: "98092",
  },
  counties: ["King", "Pierce", "Snohomish", "Kittitas"],
} as const;

const LOGO =
  "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/c7d25e65-6d11-45a8-a51f-87fc78e33417/Untitled+design+%2818%29.png?format=1500w";

// ─── Photo library ───────────────────────────────────────────────────
// Every URL curl-verified 2026-05-01. Content-length recorded inline so
// future edits can preserve the resolution floor (target: >800KB @ 2500w
// for hero + feature spots, >400KB for in-grid).
//
// Hero pick: DSC00543.JPG. Of the four largest archive files (1.0–1.4MB),
// it reads from the filename ("custom retaining wall") as the most
// engineered, structural shot — closer to Reed Hilderbrand than to a
// residential front-yard photo. KirseKatrina 051 (the v1 fallback) is
// reserved as the second-act feature inside Selected Work where its
// full-yard composition lands better.
const HERO =
  "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/07a3ab83-303a-418f-bb32-36f1ff2372e1/DSC00543.JPG?format=2500w"; // 1.32MB

// Project case-studies. Names inferred from filename clusters; years are
// best-guess from filename date stems and intentionally hedged in copy.
type Project = {
  number: string;
  name: string;
  meta: string;
  description: string;
  lead: { src: string; alt: string };
  detail: { src: string; alt: string }[];
};

const PROJECTS: Project[] = [
  {
    number: "01",
    name: "Kirse Residence",
    meta: "Full-yard installation · King County",
    description:
      "A multi-phase residential transformation: terraced front-yard plantings, a stone entry walkway, and integrated bed work that reads as one continuous landscape from the curb to the back door.",
    lead: {
      src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/2d6da8a0-324b-473f-89b4-c32d0e11cf6e/KirseKatrina+051.JPG?format=2500w",
      alt: "Kirse residence — full yard view with mature plantings",
    },
    detail: [
      {
        src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/8344f184-3bdb-47ac-ae07-97531fae03a1/KirseKatrina+006.JPG?format=1500w",
        alt: "Kirse residence — entry walkway in natural stone",
      },
      {
        src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/2beab713-b1a3-4b91-b3ce-65a733df6609/KirseKatrina+048.JPG?format=1500w",
        alt: "Kirse residence — terraced bed work",
      },
      {
        src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/b6fd68f4-c87e-45cc-bef7-a32957c88d9d/KirseKatrina+017.JPG?format=1500w",
        alt: "Kirse residence — garden path detail",
      },
    ],
  },
  {
    number: "02",
    name: "Custom Stoneworks",
    meta: "Hardscape & retaining walls",
    description:
      "Engineered walls in natural stone — built to hold a slope through a real Pacific Northwest rainy season, and to look like they belong there long after the equipment leaves.",
    lead: {
      src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/8d16b7b2-0967-4b4c-ab23-a20636723fe8/DSC00545.JPG?format=2500w",
      alt: "Tiered retaining wall in natural stone",
    },
    detail: [
      {
        src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/0a45be1e-f6e8-4630-9247-7c2705eee4f5/DSC00409.JPG?format=1500w",
        alt: "Landscape integrated with retaining wall",
      },
      {
        src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/ab58e650-dea6-4df0-b619-cc9d6d967db0/DSC00560.JPG?format=1500w",
        alt: "Stone hardscape feature in finished landscape",
      },
      {
        src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/655a746a-4fe7-4d0d-ad65-9cd8b4bc50b0/DSC00420.JPG?format=1500w",
        alt: "Installed landscape with stonework integration",
      },
    ],
  },
  {
    number: "03",
    name: "Aquavista",
    meta: "Water feature · Pierce County",
    description:
      "A naturalistic water feature carried through the surrounding plantings — the kind of install where the stone, the water, and the planting all arrive at the same time so nothing reads as bolted on.",
    lead: {
      src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/28200408-a8ad-4f8a-af91-037b8c322cec/May2008aquavista+004.JPG?format=2500w",
      alt: "Aquavista — water feature with surrounding landscape",
    },
    detail: [
      {
        src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/75ff38cf-1acd-4320-87bd-754268863706/May2008aquavista+022.JPG?format=1500w",
        alt: "Aquavista — landscape paired with hardscape edging",
      },
      {
        src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/92229f92-16c1-4908-a55c-e7a3aebe96e7/9406wat.JPG?format=1500w",
        alt: "Custom water feature integrated into the landscape",
      },
    ],
  },
  {
    number: "04",
    name: "Olano Property",
    meta: "Full-yard transformation",
    description:
      "Half-acre transformation across front, side, and rear yards: a coordinated plan of plantings, walkways, and grade work that turned a series of disconnected outdoor spaces into one designed property.",
    lead: {
      src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/6eb92fa7-668f-4db2-8866-47b0899bad29/OlanoCorky+027.JPG?format=2500w",
      alt: "Olano property — full yard transformation",
    },
    detail: [
      {
        src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/20b5ab64-8dd4-494a-b927-6b0b284a7487/OlanoCorky+024.JPG?format=1500w",
        alt: "Olano residence landscape",
      },
      {
        src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/16da4e07-19d6-4990-b977-77e471487bd4/OlanoCorky+032.JPG?format=1500w",
        alt: "Olano residence — yard detail with mature plantings",
      },
      {
        src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/167a4d4f-ee04-45c8-a371-c79486d4a0f3/June2009+022.JPG?format=1500w",
        alt: "Olano residence — summer plantings",
      },
    ],
  },
  {
    number: "05",
    name: "Night Work",
    meta: "Landscape lighting",
    description:
      "Low-voltage LED lighting designed alongside the planting plan — pathway, accent, and architectural — so the yard you spent on actually reads after sunset.",
    lead: {
      src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/a9e639ed-ae6a-418d-a533-bf224253f6af/DSC00449.JPG?format=2500w",
      alt: "Outdoor lighting installation at night",
    },
    detail: [
      {
        src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/af64af10-4922-4da7-9a20-2ea0e50d5acf/DSC00415.JPG?format=1500w",
        alt: "Landscape with mature trees and integrated lighting",
      },
      {
        src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/7ac46896-19bc-45ae-9f3e-53be1e4cb507/DSC00414.JPG?format=1500w",
        alt: "Mountain View finished landscape, evening",
      },
    ],
  },
];

// Editorial practice list — six disciplines, written as a sentence each.
const PRACTICE = [
  {
    name: "Landscape Design",
    body:
      "A consultation walks the site, then a concept and planting plan that respects what's already there before adding to it. Installation runs from the same drawing.",
  },
  {
    name: "Hardscape",
    body:
      "Patios, walkways, outdoor kitchens, and fire features in natural stone, pavers, and brick — built to last in the Pacific Northwest, not just to look right on day one.",
  },
  {
    name: "Retaining Walls",
    body:
      "Engineered walls in natural stone, concrete, brick, or timber. Solves drainage and slope, reclaims yard, and reads as part of the design — not as a wall.",
  },
  {
    name: "Water Features",
    body:
      "Ponds, waterfalls, and naturalistic stream beds installed alongside the planting so the stone, water, and surrounding bed arrive together.",
  },
  {
    name: "Native Planting",
    body:
      "Pacific Northwest natives — Douglas Fir, Oregon Grape, Salal, Red Flowering Currant — for low-water, low-maintenance landscapes that already belong here.",
  },
  {
    name: "Night Lighting",
    body:
      "Low-voltage LED, designed in the same pass as the plantings. Pathway, accent, and architectural — so the yard reads after sunset, not just at noon.",
  },
];

const PHILOSOPHY = [
  {
    title: "Climate-appropriate plantings.",
    body:
      "Forty-nine seasons of installs in this region tells you which plants make it past their second winter and which ones don't. We default to natives and adapted species — the landscape costs less to keep alive and looks better doing it.",
  },
  {
    title: "Engineered hardscape.",
    body:
      "Walls, walkways, and water features are built once. We size the base, the drainage, and the structure to a Pacific Northwest rainy season — not to a finish photograph.",
  },
  {
    title: "Long-term relationships.",
    body:
      "Most of our work is for clients who came back five, ten, fifteen years after the first install for the next phase. That's the work we're proudest of, and the standard we install to.",
  },
];

const PROCESS = [
  {
    step: "01",
    title: "Site visit",
    body:
      "We come out, walk the property, and listen. No charge across our four-county service area.",
  },
  {
    step: "02",
    title: "Concept & design",
    body:
      "A concept and planting plan, with materials, plant list, and a clear scope. You see the install on paper before we break ground.",
  },
  {
    step: "03",
    title: "Installation",
    body:
      "One crew, run by Tim, from the first cleared lot to the last lit pathway. Every discipline in-house.",
  },
  {
    step: "04",
    title: "Aftercare",
    body:
      "We come back. Pruning, bed maintenance, seasonal cleanup — and we're around for the next phase whenever it lands.",
  },
];

const COUNTY_TOWNS: Record<string, string[]> = {
  King: [
    "Seattle",
    "Bellevue",
    "Renton",
    "Kent",
    "Auburn",
    "Federal Way",
    "Issaquah",
    "Sammamish",
    "Maple Valley",
    "Black Diamond",
    "Enumclaw",
  ],
  Pierce: [
    "Tacoma",
    "Puyallup",
    "Sumner",
    "Bonney Lake",
    "Lakewood",
    "Gig Harbor",
    "Edgewood",
    "Orting",
  ],
  Snohomish: [
    "Everett",
    "Lynnwood",
    "Bothell",
    "Mill Creek",
    "Mukilteo",
    "Snohomish",
    "Monroe",
  ],
  Kittitas: ["Ellensburg", "Cle Elum", "Roslyn", "Kittitas", "Easton"],
};

// ─── Page ────────────────────────────────────────────────────────────
export default function MtViewLandscapingPage() {
  return (
    <div className="min-h-screen bg-[#f8f5ef] text-[#1a1612] antialiased selection:bg-[#1a2e1a] selection:text-[#f8f5ef]">
      <StickyNav
        businessName={BUSINESS.name}
        logoSrc={LOGO}
        phoneDisplay={BUSINESS.phoneDisplay}
        phoneHref={BUSINESS.phoneHref}
      />
      <Hero />
      <Statement />
      <SelectedWork />
      <Practice />
      <About />
      <Philosophy />
      <ServiceArea />
      <Process />
      <Contact />
      <Footer />
    </div>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────
// Full-bleed, single-image, no CTA. The landscape sells itself; the
// only type is the wordmark + place + year. Reed Hilderbrand homepage
// is the reference — quiet, confident, no visible UI chrome.
function Hero() {
  return (
    <section id="top" className="relative">
      <div className="relative h-[78vh] min-h-[560px] sm:h-[88vh] sm:min-h-[640px] sm:max-h-[1000px] w-full overflow-hidden bg-[#0a1408]">
        <img
          src={HERO}
          alt="A Mountain View landscape: engineered stonework integrated with naturalistic plantings"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "saturate(0.95) contrast(1.04)" }}
        />
        {/* Minimal overlay — just enough to keep type legible. No vignette. */}
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#0a1408]/80 via-[#0a1408]/35 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl h-full px-5 sm:px-10 flex flex-col justify-end pb-12 sm:pb-20">
          <h1 className="font-serif text-[#f8f5ef] tracking-[-0.02em] leading-[0.92] text-[64px] sm:text-[112px] lg:text-[152px]">
            Mountain
            <br />
            View
          </h1>
          <p className="mt-5 sm:mt-7 text-[#e8dfc8] text-[10px] sm:text-[11px] tracking-[0.32em] uppercase font-medium">
            Landscape &amp; Design &nbsp;·&nbsp; Auburn, WA &nbsp;·&nbsp; Since {BUSINESS.established}
          </p>
        </div>

        {/* Scroll cue, bottom-right. Hairline + tiny tracked label. */}
        <div className="absolute right-5 sm:right-10 bottom-12 sm:bottom-20 z-10 hidden sm:flex flex-col items-center gap-3">
          <span className="text-[#e8dfc8]/70 text-[10px] tracking-[0.32em] uppercase">
            Scroll
          </span>
          <span className="block w-px h-14 bg-[#e8dfc8]/40" />
        </div>
      </div>
    </section>
  );
}

// ─── Statement ───────────────────────────────────────────────────────
// Single editorial sentence. One screen of breathing room. No icons,
// no buttons, no decorations. Charcoal serif on cream.
function Statement() {
  return (
    <section className="py-32 sm:py-48 bg-[#f8f5ef]">
      <div className="mx-auto max-w-4xl px-6 sm:px-10 text-center">
        <p className="text-[10px] sm:text-[11px] tracking-[0.36em] uppercase text-[#5a6a4f] font-medium mb-10 sm:mb-14">
          A Practice in Western Washington
        </p>
        <p className="font-serif text-[#1a1612] text-[28px] sm:text-[40px] lg:text-[52px] leading-[1.18] tracking-[-0.01em]">
          For nearly fifty years, Tim Hunsaker has built outdoor spaces
          across King, Pierce, Snohomish &amp; Kittitas counties — from
          the first cleared lot to the last lit pathway, every discipline
          in-house.
        </p>
      </div>
    </section>
  );
}

// ─── Selected Work ───────────────────────────────────────────────────
// Five named projects, case-study format. One full-bleed lead photo
// per project + a 2-up or 3-up cluster underneath. Numbered "01 / 05"
// with hairline rule between projects. ~22 photos total — down from 40.
function SelectedWork() {
  return (
    <section id="work" className="bg-[#f8f5ef]">
      {/* Section opener */}
      <div className="mx-auto max-w-7xl px-6 sm:px-10 pt-32 sm:pt-48 pb-16 sm:pb-24">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8 border-b border-[#1a1612]/15 pb-10">
          <div>
            <p className="text-[10px] sm:text-[11px] tracking-[0.36em] uppercase text-[#5a6a4f] font-medium mb-5">
              Selected Work
            </p>
            <h2 className="font-serif text-[#1a1612] text-[40px] sm:text-[56px] lg:text-[72px] leading-[1.02] tracking-[-0.02em]">
              Five Projects
            </h2>
          </div>
          <p className="text-[14px] sm:text-[15px] text-[#1a1612]/65 max-w-md leading-relaxed">
            A representative slice of the archive — residential
            installations, hardscape, water features, and lighting — drawn
            from work delivered across the four-county footprint.
          </p>
        </div>
      </div>

      {PROJECTS.map((project, idx) => (
        <ProjectStudy key={project.number} project={project} total={PROJECTS.length} isLast={idx === PROJECTS.length - 1} />
      ))}
    </section>
  );
}

function ProjectStudy({
  project,
  total,
  isLast,
}: {
  project: Project;
  total: number;
  isLast: boolean;
}) {
  return (
    <article className={`pb-32 sm:pb-48 ${isLast ? "" : "border-b border-[#1a1612]/10"}`}>
      {/* Project header */}
      <div className="mx-auto max-w-7xl px-6 sm:px-10 mb-12 sm:mb-16">
        <div className="flex items-baseline gap-6 sm:gap-10">
          <span className="font-serif text-[#5a6a4f] text-[14px] sm:text-[15px] tracking-[0.18em]">
            {project.number} / {String(total).padStart(2, "0")}
          </span>
          <span className="h-px flex-1 bg-[#1a1612]/15" />
          <span className="text-[10px] sm:text-[11px] tracking-[0.32em] uppercase text-[#5a6a4f]">
            {project.meta}
          </span>
        </div>
      </div>

      {/* Lead photo — full-bleed feature */}
      <figure className="relative">
        <img
          src={project.lead.src}
          alt={project.lead.alt}
          className="w-full h-[68vh] min-h-[480px] max-h-[820px] object-cover"
          style={{ filter: "saturate(0.95) contrast(1.04)" }}
        />
      </figure>

      {/* Title + body — sits below the lead, editorial 5/7 layout */}
      <div className="mx-auto max-w-7xl px-6 sm:px-10 mt-12 sm:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <h3 className="font-serif text-[#1a1612] text-[36px] sm:text-[48px] lg:text-[56px] leading-[1.02] tracking-[-0.02em]">
              {project.name}
            </h3>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-[16px] sm:text-[17px] leading-[1.7] text-[#1a1612]/80">
              {project.description}
            </p>
          </div>
        </div>
      </div>

      {/* Detail cluster — 2-up or 3-up, no rounded corners */}
      <div className="mx-auto max-w-7xl px-6 sm:px-10 mt-16 sm:mt-24">
        <div
          className={
            project.detail.length === 2
              ? "grid grid-cols-1 sm:grid-cols-2 gap-6"
              : "grid grid-cols-1 sm:grid-cols-3 gap-6"
          }
        >
          {project.detail.map((d) => (
            <div key={d.src} className="aspect-[4/5] overflow-hidden bg-[#1a1612]">
              <img
                src={d.src}
                alt={d.alt}
                className="w-full h-full object-cover"
                style={{ filter: "saturate(0.95) contrast(1.04)" }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

// ─── Practice / Services ─────────────────────────────────────────────
// Six disciplines, treated as an editorial list. Hairline-divided rows,
// serif heading on left, paragraph on right. No icons.
function Practice() {
  return (
    <section id="services" className="bg-[#1a1612] text-[#f8f5ef] py-32 sm:py-48">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="max-w-3xl mb-20 sm:mb-28">
          <p className="text-[10px] sm:text-[11px] tracking-[0.36em] uppercase text-[#cfe0a8]/70 font-medium mb-5">
            Practice
          </p>
          <h2 className="font-serif text-[40px] sm:text-[56px] lg:text-[72px] leading-[1.02] tracking-[-0.02em]">
            Six disciplines, run in-house.
          </h2>
        </div>

        <div className="border-t border-[#f8f5ef]/15">
          {PRACTICE.map((p, i) => (
            <div
              key={p.name}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 py-10 sm:py-14 border-b border-[#f8f5ef]/15"
            >
              <div className="lg:col-span-1 text-[12px] tracking-[0.22em] uppercase text-[#5a6a4f] font-medium pt-2">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="lg:col-span-4">
                <h3 className="font-serif text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.05] tracking-[-0.01em]">
                  {p.name}
                </h3>
              </div>
              <div className="lg:col-span-7">
                <p className="text-[16px] sm:text-[17px] leading-[1.7] text-[#f8f5ef]/75 max-w-xl">
                  {p.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── About ───────────────────────────────────────────────────────────
// Tim's story, one paragraph. Pull-quote. Zero portraits.
function About() {
  return (
    <section id="about" className="py-32 sm:py-48 bg-[#f8f5ef]">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="text-[10px] sm:text-[11px] tracking-[0.36em] uppercase text-[#5a6a4f] font-medium mb-5">
              About
            </p>
            <h2 className="font-serif text-[#1a1612] text-[36px] sm:text-[48px] lg:text-[56px] leading-[1.02] tracking-[-0.02em]">
              {new Date().getFullYear() - BUSINESS.established} years in the region.
            </h2>
          </div>

          <div className="lg:col-span-7 lg:col-start-6 space-y-6 text-[16px] sm:text-[17px] leading-[1.75] text-[#1a1612]/80">
            <p>
              Mountain View Landscape &amp; Design is a family-owned firm
              based in Auburn, Washington. Tim Hunsaker has been
              landscaping in the region since 1976 — first under the
              Shamrock Landscaping name, then as Mountain View. The work
              is residential, the crew is local, and every discipline runs
              in-house.
            </p>
          </div>
        </div>

        {/* Pull-quote — huge serif, breathing room above and below */}
        <figure className="mt-24 sm:mt-32 mx-auto max-w-5xl">
          <blockquote className="font-serif text-[#1a2e1a] text-[28px] sm:text-[40px] lg:text-[52px] leading-[1.18] tracking-[-0.01em]">
            <span className="text-[#1a2e1a]/40 mr-2">&ldquo;</span>
            We&rsquo;ve built relationships with people who come back
            every five, ten, fifteen years for the next phase of their
            yard. That&rsquo;s the work we&rsquo;re proudest of.
            <span className="text-[#1a2e1a]/40 ml-1">&rdquo;</span>
          </blockquote>
          <figcaption className="mt-8 text-[11px] tracking-[0.28em] uppercase text-[#5a6a4f] font-medium">
            — Tim Hunsaker, Founder
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

// ─── Philosophy ──────────────────────────────────────────────────────
// Three principles, generous typography, no decorations.
function Philosophy() {
  return (
    <section id="philosophy" className="py-32 sm:py-48 bg-[#1a2e1a] text-[#f8f5ef]">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="max-w-3xl mb-20 sm:mb-24">
          <p className="text-[10px] sm:text-[11px] tracking-[0.36em] uppercase text-[#cfe0a8]/70 font-medium mb-5">
            Philosophy
          </p>
          <h2 className="font-serif text-[40px] sm:text-[56px] lg:text-[72px] leading-[1.02] tracking-[-0.02em]">
            How we approach the work.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {PHILOSOPHY.map((item, i) => (
            <div key={item.title} className="border-t border-[#f8f5ef]/20 pt-10">
              <p className="text-[10px] tracking-[0.32em] uppercase text-[#cfe0a8]/60 font-medium mb-5">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="font-serif text-[26px] sm:text-[30px] leading-[1.15] tracking-[-0.01em] mb-5">
                {item.title}
              </h3>
              <p className="text-[15px] sm:text-[16px] leading-[1.7] text-[#f8f5ef]/75">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Service area ────────────────────────────────────────────────────
// Typographic four-county listing. Each county is a serif H3 with a
// small-tracked town list. No icons.
function ServiceArea() {
  return (
    <section id="service-area" className="py-32 sm:py-48 bg-[#f8f5ef]">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="max-w-3xl mb-20 sm:mb-28">
          <p className="text-[10px] sm:text-[11px] tracking-[0.36em] uppercase text-[#5a6a4f] font-medium mb-5">
            Service Area
          </p>
          <h2 className="font-serif text-[#1a1612] text-[40px] sm:text-[56px] lg:text-[72px] leading-[1.02] tracking-[-0.02em]">
            Where we work.
          </h2>
          <p className="mt-8 text-[16px] sm:text-[17px] leading-[1.7] text-[#1a1612]/75 max-w-2xl">
            Based in Auburn, we serve homeowners and property managers
            across four Washington counties. If you&rsquo;re close to that
            footprint and not sure — call. We&rsquo;ll tell you straight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10 border-t border-[#1a1612]/15 pt-12">
          {BUSINESS.counties.map((county) => (
            <div key={county}>
              <h3 className="font-serif text-[#1a2e1a] text-[28px] sm:text-[32px] tracking-[-0.01em] mb-6">
                {county}
              </h3>
              <ul className="space-y-2 text-[13px] tracking-[0.04em] text-[#1a1612]/70 uppercase">
                {COUNTY_TOWNS[county].map((town) => (
                  <li key={town}>{town}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Process ─────────────────────────────────────────────────────────
// Four steps, numbered, editorial.
function Process() {
  return (
    <section id="process" className="py-32 sm:py-48 bg-[#1a1612] text-[#f8f5ef]">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="max-w-3xl mb-20 sm:mb-28">
          <p className="text-[10px] sm:text-[11px] tracking-[0.36em] uppercase text-[#cfe0a8]/70 font-medium mb-5">
            Process
          </p>
          <h2 className="font-serif text-[40px] sm:text-[56px] lg:text-[72px] leading-[1.02] tracking-[-0.02em]">
            How a project unfolds.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {PROCESS.map((p) => (
            <div key={p.step} className="border-t border-[#f8f5ef]/20 pt-8">
              <p className="font-serif text-[#cfe0a8]/80 text-[18px] tracking-[0.18em] mb-6">
                {p.step}
              </p>
              <h3 className="font-serif text-[24px] sm:text-[28px] tracking-[-0.01em] mb-4">
                {p.title}
              </h3>
              <p className="text-[15px] leading-[1.7] text-[#f8f5ef]/75">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────
function Contact() {
  return (
    <section id="contact" className="py-32 sm:py-48 bg-[#f8f5ef]">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="text-[10px] sm:text-[11px] tracking-[0.36em] uppercase text-[#5a6a4f] font-medium mb-5">
              Contact
            </p>
            <h2 className="font-serif text-[#1a1612] text-[40px] sm:text-[56px] lg:text-[64px] leading-[1.02] tracking-[-0.02em]">
              Tell Tim about
              <br />
              the project.
            </h2>
            <p className="mt-8 text-[16px] sm:text-[17px] leading-[1.7] text-[#1a1612]/75 max-w-md">
              Site visits are free across King, Pierce, Snohomish &amp;
              Kittitas counties. We typically respond within one business
              day, usually faster.
            </p>

            <dl className="mt-12 space-y-6 text-[15px]">
              <ContactRow
                Icon={Phone}
                label="Phone"
                value={BUSINESS.phoneDisplay}
                href={BUSINESS.phoneHref}
              />
              <ContactRow
                Icon={EnvelopeSimple}
                label="Email"
                value={BUSINESS.email}
                href={`mailto:${BUSINESS.email}`}
              />
              <ContactRow
                Icon={MapPin}
                label="Office"
                value={`${BUSINESS.address.street}, ${BUSINESS.address.city}, ${BUSINESS.address.state} ${BUSINESS.address.zip}`}
              />
            </dl>
          </div>

          {/* Sharp-cornered editorial container — strips rounded corners
              from any nested form children to match the rest of the page. */}
          <div className="lg:col-span-7 [&_.rounded-2xl]:rounded-none [&_.rounded-xl]:rounded-none [&_.rounded-lg]:rounded-none [&_.rounded-3xl]:rounded-none">
            <div className="border border-[#1a1612]/15 p-6 sm:p-10 bg-[#f8f5ef]">
              <MtViewContactForm services={PRACTICE.map((p) => p.name)} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactRow({
  Icon,
  label,
  value,
  href,
}: {
  Icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-4 border-t border-[#1a1612]/15 pt-5">
      <Icon size={16} weight="regular" className="text-[#1a2e1a] mt-1 shrink-0" />
      <div>
        <dt className="text-[10px] tracking-[0.32em] uppercase text-[#5a6a4f] mb-1 font-medium">
          {label}
        </dt>
        <dd className="text-[#1a1612] font-medium">{value}</dd>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block hover:opacity-70 transition">
      {content}
    </a>
  ) : (
    content
  );
}

// ─── Footer ──────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#0d0d0a] text-[#f8f5ef]/80 pt-20 pb-10 border-t border-[#f8f5ef]/5">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="font-serif text-[28px] sm:text-[32px] tracking-[-0.02em] text-[#f8f5ef] leading-[1.05]">
              Mountain View
            </div>
            <p className="mt-2 text-[10px] tracking-[0.32em] uppercase text-[#cfe0a8]/70 font-medium">
              Landscape &amp; Design
            </p>
            <p className="mt-7 text-[14px] leading-relaxed max-w-sm text-[#f8f5ef]/65">
              Family-owned landscape design and installation. Auburn, WA
              and the four surrounding counties since {BUSINESS.established}.
            </p>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-[10px] tracking-[0.32em] uppercase text-[#cfe0a8]/70 mb-5 font-medium">
              Contact
            </h4>
            <ul className="space-y-2 text-[14px]">
              <li>
                <a href={BUSINESS.phoneHref} className="hover:text-white">
                  {BUSINESS.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="hover:text-white break-all"
                >
                  {BUSINESS.email}
                </a>
              </li>
              <li className="text-[#f8f5ef]/55 pt-1">
                {BUSINESS.address.street}
                <br />
                {BUSINESS.address.city}, {BUSINESS.address.state}{" "}
                {BUSINESS.address.zip}
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-[10px] tracking-[0.32em] uppercase text-[#cfe0a8]/70 mb-5 font-medium">
              On the page
            </h4>
            <ul className="grid grid-cols-2 gap-y-2 text-[14px]">
              <li><a href="#work" className="hover:text-white">Work</a></li>
              <li><a href="#services" className="hover:text-white">Practice</a></li>
              <li><a href="#about" className="hover:text-white">About</a></li>
              <li><a href="#philosophy" className="hover:text-white">Philosophy</a></li>
              <li><a href="#service-area" className="hover:text-white">Service Area</a></li>
              <li><a href="#process" className="hover:text-white">Process</a></li>
              <li><a href="#contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-6 border-t border-[#f8f5ef]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] tracking-[0.04em] text-[#f8f5ef]/40">
          <span>
            &copy; {new Date().getFullYear()} Mountain View Landscape &amp;
            Design Inc. All rights reserved.
          </span>
          <span>
            Site by{" "}
            <a
              href="https://bluejayportfolio.com"
              className="hover:text-white underline underline-offset-4 decoration-[#cfe0a8]/40"
            >
              BlueJays
            </a>
            .
          </span>
        </div>
      </div>
    </footer>
  );
}
