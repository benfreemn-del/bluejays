/* eslint-disable @next/next/no-img-element */

/**
 * /clients/mt-view-landscaping — bespoke single-page site for
 * Mountain View Landscape & Design Inc. (Auburn, WA).
 *
 * THIS IS THE PRODUCT, not a sales preview. Tim & team are paying clients
 * on the $100/year hosted tier. CTAs, forms, and copy are aimed at
 * THEIR customers (homeowners + property managers in King / Pierce /
 * Snohomish / Kittitas counties), not at us.
 *
 * Domain transfer from Squarespace (mtviewlandscaping.com) lands on
 * this route once Ben approves the build.
 *
 * Photography: every photo is sourced directly from Mt View's existing
 * Squarespace CDN — these are real photos of real Mt View jobs, pulled
 * from their gallery + service pages and reused so we honor the work
 * they've already documented.
 */

import MtViewContactForm from "./contact-form";
import {
  Phone,
  EnvelopeSimple,
  MapPin,
  ArrowRight,
  Tree,
  Drop,
  Wall,
  Cube,
  Plant,
  PaintBrush,
  Lightbulb,
  Wrench,
  Mountains,
  Compass,
  CaretRight,
} from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title:
    "Mountain View Landscape & Design — Custom Landscapes in King, Pierce, Snohomish & Kittitas Counties, WA",
  description:
    "Family-owned landscape design and installation in Auburn, WA. Hardscapes, water features, retaining walls, irrigation, sod, native planting and night lights. Serving King, Pierce, Snohomish and Kittitas counties since 1976.",
};

// ─── Real Mt View business details ─────────────────────────────────
// All sourced from mtviewlandscaping.com on 2026-05-01.
const BUSINESS = {
  name: "Mountain View Landscape & Design",
  tagline: "Good to Grow.",
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

// Logo on Mt View's current Squarespace site.
const LOGO =
  "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/c7d25e65-6d11-45a8-a51f-87fc78e33417/Untitled+design+%2818%29.png?format=1500w";

// ─── Photo library — every URL verified 200 OK 2026-05-01 ───────────
// Pulled from Mt View's existing Squarespace CDN. Grouped roughly by
// what's in the frame, so we can sequence the gallery editorially.
const HERO_PHOTO =
  "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/1719016043641-AKE4V9XVUZUQLGIANGKZ/hero.jpg";

const FEATURE_PHOTOS = {
  fullYard:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/10a27d43-8fd9-4288-ba12-8fb02a1dc14b/unnamed+%2814%29.jpg",
  pondScape:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/92229f92-16c1-4908-a55c-e7a3aebe96e7/9406wat.JPG",
  designConcept:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/b695ab5e-b543-4d94-acee-2acb6eb77b61/771466035.587875.jpg",
  customProject:
    "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/d860c6e9-9e79-48ea-b469-c1950db9a18e/DSC00412.JPG",
};

// Every other verified photo from their gallery + service pages.
// Order is intentional — visual variety, not strict job-type clusters.
const GALLERY: { src: string; alt: string }[] = [
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/6e04d717-a0b1-4c66-911f-80b145b2b6c8/DSCF0011+%282%29.JPG", alt: "Mountain View Landscape project — landscape installation" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/167a4d4f-ee04-45c8-a371-c79486d4a0f3/June2009+022.JPG", alt: "Residential landscape with mature plantings" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/28200408-a8ad-4f8a-af91-037b8c322cec/May2008aquavista+004.JPG", alt: "Aquavista project — water feature and surrounding landscape" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/51d34748-3813-44e2-b489-144215a9d50c/9406112.JPG", alt: "Custom outdoor stonework" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/7ea9ba37-c993-43d6-bc37-6250c89a9d1c/Blk+Dia+4.JPG", alt: "Black diamond hardscape detail" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/4e6524bc-4619-4a7a-8e2e-434307f561bf/DSCF0032.JPG", alt: "Front yard landscape design" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/08dc5da4-0245-434d-ad8b-02404e590c90/Hunsakerwa.JPG", alt: "Hunsaker residence landscape" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/bdb38054-a5e6-44ba-9ffa-454c178b6967/Sept+Oct+09+064.JPG", alt: "Fall planting and garden bed" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/528f9845-6951-41fa-a978-792befe15146/9406116.JPG", alt: "Stone walkway and plantings" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/2beab713-b1a3-4b91-b3ce-65a733df6609/KirseKatrina+048.JPG", alt: "Kirse / Katrina residence landscape" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/c5b284d4-6678-4cf0-9fd8-3d71144d6980/June2009+011.JPG", alt: "Summer landscape with mature plantings" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/567eb091-0930-42b4-86f0-1449bc72fd42/DSCF0023.JPG", alt: "Garden bed with seasonal color" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/e612e587-f74f-45b3-b48c-8b275ced3db0/DSCF0004.JPG", alt: "Backyard landscape installation" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/2d6da8a0-324b-473f-89b4-c32d0e11cf6e/KirseKatrina+051.JPG", alt: "Kirse / Katrina residence — full yard view" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/0bcce33f-728b-466f-8f85-c28dec1f8b9f/KirseKatrina+049.JPG", alt: "Kirse / Katrina residence — planting detail" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/0a45be1e-f6e8-4630-9247-7c2705eee4f5/DSC00409.JPG", alt: "Landscape with retaining wall" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/ab58e650-dea6-4df0-b619-cc9d6d967db0/DSC00560.JPG", alt: "Stone hardscape feature" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/b6fd68f4-c87e-45cc-bef7-a32957c88d9d/KirseKatrina+017.JPG", alt: "Kirse / Katrina residence — garden path" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/af64af10-4922-4da7-9a20-2ea0e50d5acf/DSC00415.JPG", alt: "Landscape installation with mature trees" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/8344f184-3bdb-47ac-ae07-97531fae03a1/KirseKatrina+006.JPG", alt: "Kirse / Katrina residence — entry walkway" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/20b5ab64-8dd4-494a-b927-6b0b284a7487/OlanoCorky+024.JPG", alt: "Olano residence landscape" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/4306200d-fd00-4555-b10c-372c73b3fd47/DSCF0009+%282%29.JPG", alt: "Detailed planting bed" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/16da4e07-19d6-4990-b977-77e471487bd4/OlanoCorky+032.JPG", alt: "Olano residence — yard detail" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/75ff38cf-1acd-4320-87bd-754268863706/May2008aquavista+022.JPG", alt: "Aquavista — landscape with hardscape" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/6eb92fa7-668f-4db2-8866-47b0899bad29/OlanoCorky+027.JPG", alt: "Olano residence — full yard transformation" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/7ac46896-19bc-45ae-9f3e-53be1e4cb507/DSC00414.JPG", alt: "Mountain View landscape project" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/ab1dd9ab-fdab-46dd-bdb3-43d98e507f36/DSC00573.JPG", alt: "Hardscape and planting integration" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/41ca85e6-54c3-49aa-b1d2-17d40df649eb/DSCF0005+%282%29.JPG", alt: "Garden plantings with seasonal interest" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/655a746a-4fe7-4d0d-ad65-9cd8b4bc50b0/DSC00420.JPG", alt: "Mountain View installed landscape" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/07a3ab83-303a-418f-bb32-36f1ff2372e1/DSC00543.JPG", alt: "Custom retaining wall" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/8d16b7b2-0967-4b4c-ab23-a20636723fe8/DSC00545.JPG", alt: "Tiered retaining wall installation" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/74b67bf1-87da-44af-8370-395bc3223f85/DSCF0022+%282%29.JPG", alt: "Fresh sod installation" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/a9e639ed-ae6a-418d-a533-bf224253f6af/DSC00449.JPG", alt: "Outdoor lighting installation at night" },
  { src: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/e76045ec-27bd-4d4c-8965-f7ad11e48498/67738826_10214781918849836_1751748217499811840_n.jpg", alt: "Mountain View team on a recent project" },
];

// Real services from their existing service pages.
const SERVICES = [
  {
    name: "Landscape Design",
    Icon: Compass,
    blurb:
      "Custom design that blends aesthetics with how you actually live outside. Consultation, concept, planting plan, and full installation.",
  },
  {
    name: "Hardscapes",
    Icon: Cube,
    blurb:
      "Patios, walkways, outdoor kitchens and fire features in natural stone, pavers, and brick — built to last in the Pacific Northwest.",
  },
  {
    name: "Retaining Walls",
    Icon: Wall,
    blurb:
      "Engineered walls in natural stone, concrete, brick, or timber. Solves drainage and slope, opens up usable yard.",
  },
  {
    name: "Water Features",
    Icon: Drop,
    blurb:
      "Ponds, waterfalls, fountains, water walls, and naturalistic stream beds — installed to integrate seamlessly with the existing terrain.",
  },
  {
    name: "Irrigation",
    Icon: Wrench,
    blurb:
      "Custom-designed systems with drip lines and smart controllers. Healthier plants, lower water bills, less time with a hose.",
  },
  {
    name: "Sod Installation",
    Icon: Plant,
    blurb:
      "Premium sod from local growers, installed for a mature lawn the day we leave. Full site prep and aftercare included.",
  },
  {
    name: "Yard Maintenance",
    Icon: Tree,
    blurb:
      "Ongoing care for the landscapes we — or someone else — installed. Pruning, bed maintenance, seasonal cleanup.",
  },
  {
    name: "Native Planting",
    Icon: Mountains,
    blurb:
      "Pacific Northwest natives — Douglas Fir, Oregon Grape, Salal, Red Flowering Currant — for low-water, low-maintenance landscapes that belong here.",
  },
  {
    name: "Night Lights",
    Icon: Lightbulb,
    blurb:
      "Low-voltage LED outdoor lighting — pathway, accent, and architectural — designed to make the yard you spent on look right after sunset.",
  },
  {
    name: "Custom Projects",
    Icon: PaintBrush,
    blurb:
      "Outdoor kitchens, zen gardens, sculpture integration, sustainable installations. If you can describe it, we can build it.",
  },
];

// ─── Page ────────────────────────────────────────────────────────────
export default function MtViewLandscapingPage() {
  return (
    <div className="min-h-screen bg-[#f8f5ef] text-[#1a1612] antialiased selection:bg-[#1a2e1a] selection:text-[#f8f5ef]">
      <StickyNav />
      <Hero />
      <ServicesSection />
      <WorkSection />
      <AboutSection />
      <ServiceAreaSection />
      <ContactSection />
      <Footer />
    </div>
  );
}

// ─── Sticky nav ──────────────────────────────────────────────────────
function StickyNav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f8f5ef]/85 border-b border-[#1a2e1a]/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-3 min-w-0">
          <img
            src={LOGO}
            alt={BUSINESS.name}
            className="h-9 sm:h-11 w-auto"
          />
          <span className="hidden md:block font-serif text-[15px] tracking-tight text-[#1a2e1a] leading-tight">
            Mountain View
            <br />
            <span className="text-[12px] tracking-[0.18em] uppercase text-[#5a6a4f]">
              Landscape &amp; Design
            </span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-8 text-[13px] tracking-wide text-[#1a1612]/80">
          <a href="#services" className="hover:text-[#1a2e1a] transition">Services</a>
          <a href="#work" className="hover:text-[#1a2e1a] transition">Work</a>
          <a href="#about" className="hover:text-[#1a2e1a] transition">About</a>
          <a href="#service-area" className="hover:text-[#1a2e1a] transition">Service Area</a>
          <a href="#contact" className="hover:text-[#1a2e1a] transition">Contact</a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={BUSINESS.phoneHref}
            className="hidden sm:inline-flex items-center gap-2 text-[13px] font-medium text-[#1a2e1a] hover:opacity-80"
          >
            <Phone size={16} weight="fill" />
            {BUSINESS.phoneDisplay}
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 bg-[#1a2e1a] text-[#f8f5ef] px-4 py-2 text-[13px] font-medium tracking-wide hover:bg-[#0d1a0d] transition"
          >
            Get an estimate
            <ArrowRight size={14} weight="bold" />
          </a>
        </div>
      </div>
    </header>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section id="top" className="relative">
      <div className="relative h-[78vh] min-h-[560px] max-h-[820px] w-full overflow-hidden">
        <img
          src={HERO_PHOTO}
          alt="A finished Mountain View landscape"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "saturate(0.97) contrast(1.03)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1408]/30 via-[#0a1408]/15 to-[#0a1408]/70" />

        <div className="relative z-10 mx-auto max-w-7xl h-full px-5 sm:px-8 flex flex-col justify-end pb-16 sm:pb-24">
          <div className="max-w-3xl">
            <p className="text-[#e8dfc8] text-[12px] sm:text-[13px] tracking-[0.28em] uppercase mb-5 sm:mb-6 font-medium">
              Auburn, WA &middot; Since {BUSINESS.established}
            </p>
            <h1 className="font-serif text-white text-[40px] leading-[1.05] sm:text-[64px] sm:leading-[1.02] lg:text-[80px] tracking-tight">
              Landscapes the
              <br />
              <em className="not-italic text-[#cfe0a8]">Pacific Northwest</em>
              <br />
              was made for.
            </h1>
            <p className="mt-7 text-white/85 text-[16px] sm:text-[18px] leading-relaxed max-w-xl">
              Family-owned design and installation across King, Pierce, Snohomish
              and Kittitas counties. Tim has been building outdoor spaces in
              Western Washington since 1976.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 bg-[#f8f5ef] text-[#1a2e1a] px-6 py-3.5 text-[14px] font-medium tracking-wide hover:bg-white transition"
              >
                Get a free estimate
                <ArrowRight size={16} weight="bold" />
              </a>
              <a
                href="#work"
                className="inline-flex items-center gap-2 border border-white/40 text-white px-6 py-3.5 text-[14px] font-medium tracking-wide hover:bg-white/10 transition"
              >
                See our work
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Services ────────────────────────────────────────────────────────
function ServicesSection() {
  return (
    <section id="services" className="py-24 sm:py-32 bg-[#f8f5ef]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          eyebrow="What we do"
          title={
            <>
              Ten disciplines, one
              <br className="hidden sm:block" /> cohesive landscape.
            </>
          }
          intro="From the design table to the last paver, we run every part of the project in-house. That keeps the vision consistent, the schedule honest, and the quality we put our name on."
        />

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1a2e1a]/10 border border-[#1a2e1a]/10">
          {SERVICES.map(({ name, Icon, blurb }) => (
            <div
              key={name}
              className="bg-[#f8f5ef] p-8 sm:p-10 group hover:bg-white transition-colors"
            >
              <Icon
                size={28}
                weight="duotone"
                className="text-[#1a2e1a] mb-5"
              />
              <h3 className="font-serif text-[22px] sm:text-[24px] text-[#1a1612] mb-3 tracking-tight">
                {name}
              </h3>
              <p className="text-[14.5px] leading-relaxed text-[#1a1612]/75">
                {blurb}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Work / gallery ──────────────────────────────────────────────────
function WorkSection() {
  // Editorial rhythm: feature photos break up the grid clusters.
  // 4 features + 34 grid photos sequenced for visual variety.
  const cluster1 = GALLERY.slice(0, 6);
  const cluster2 = GALLERY.slice(6, 14);
  const cluster3 = GALLERY.slice(14, 22);
  const cluster4 = GALLERY.slice(22, 30);
  const cluster5 = GALLERY.slice(30);

  return (
    <section id="work" className="bg-[#1a1612] text-[#f8f5ef] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          eyebrow="Selected work"
          inverted
          title={
            <>
              Real yards.
              <br className="hidden sm:block" /> Real Mt View clients.
            </>
          }
          intro="Photos pulled directly from our project archive — design installs, hardscape builds, water features, and full-yard transformations across our four-county service area."
        />
      </div>

      {/* Feature 1 — full bleed */}
      <FeaturePhoto
        src={FEATURE_PHOTOS.fullYard}
        alt="A full-yard Mountain View landscape transformation"
        caption="Full-yard transformation"
      />

      {/* Cluster 1 */}
      <GalleryGrid items={cluster1} />

      {/* Feature 2 */}
      <FeaturePhoto
        src={FEATURE_PHOTOS.pondScape}
        alt="Custom water feature integrated into the surrounding landscape"
        caption="Custom water feature install"
      />

      {/* Cluster 2 — denser */}
      <GalleryGrid items={cluster2} dense />

      {/* Feature 3 */}
      <FeaturePhoto
        src={FEATURE_PHOTOS.designConcept}
        alt="A landscape design concept by Mountain View"
        caption="From concept to install"
      />

      {/* Cluster 3 */}
      <GalleryGrid items={cluster3} dense />

      {/* Feature 4 */}
      <FeaturePhoto
        src={FEATURE_PHOTOS.customProject}
        alt="A custom Mountain View landscape project"
        caption="Custom project, designed for the site"
      />

      {/* Cluster 4 */}
      <GalleryGrid items={cluster4} dense />

      {/* Cluster 5 — final */}
      <GalleryGrid items={cluster5} />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 mt-16 sm:mt-24 text-center">
        <a
          href="#contact"
          className="inline-flex items-center gap-2 border border-[#f8f5ef]/40 text-[#f8f5ef] px-7 py-3.5 text-[14px] font-medium tracking-wide hover:bg-[#f8f5ef]/10 transition"
        >
          Start your project
          <ArrowRight size={16} weight="bold" />
        </a>
      </div>
    </section>
  );
}

function FeaturePhoto({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="relative my-12 sm:my-20">
      <img
        src={src}
        alt={alt}
        className="w-full h-[60vh] min-h-[400px] max-h-[720px] object-cover"
        style={{ filter: "saturate(0.97) contrast(1.02)" }}
      />
      <figcaption className="mx-auto max-w-7xl px-5 sm:px-8 mt-4 text-[12px] tracking-[0.22em] uppercase text-[#cfe0a8]/70">
        — {caption}
      </figcaption>
    </figure>
  );
}

function GalleryGrid({
  items,
  dense = false,
}: {
  items: { src: string; alt: string }[];
  dense?: boolean;
}) {
  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 mt-12 sm:mt-16">
      <div
        className={
          dense
            ? "grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
            : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5"
        }
      >
        {items.map((item) => (
          <div
            key={item.src}
            className="overflow-hidden bg-[#0d0d0d] aspect-[4/3]"
          >
            <img
              src={item.src}
              alt={item.alt}
              className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700"
              style={{ filter: "saturate(0.97) contrast(1.02)" }}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── About ───────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32 bg-[#f8f5ef]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <p className="text-[12px] tracking-[0.28em] uppercase text-[#5a6a4f] font-medium mb-5">
              Our story
            </p>
            <h2 className="font-serif text-[#1a1612] text-[40px] leading-[1.05] sm:text-[54px] sm:leading-[1.02] tracking-tight">
              Fifty years of
              <br />
              <em className="not-italic text-[#1a2e1a]">Pacific Northwest</em>
              <br />
              landscapes.
            </h2>
          </div>

          <div className="lg:col-span-7 space-y-5 text-[16px] sm:text-[17px] leading-[1.7] text-[#1a1612]/85">
            <p>
              Mountain View Landscape &amp; Design is a family-owned firm
              based in Auburn, Washington. Tim Hunsaker has been
              landscaping in the region since 1976 — first with Shamrock
              Landscaping, then under the Mountain View name.
            </p>
            <p>
              That kind of tenure means a few things. We&rsquo;ve seen which
              plants belong in this climate and which ones won&rsquo;t make it
              past their second winter. We know how to build a wall that holds
              up to a real PNW rainy season. We&rsquo;ve installed enough
              water features to know where they sing and where they don&rsquo;t.
            </p>
            <p>
              Most of all, we&rsquo;ve built relationships with people who
              come back every five, ten, fifteen years for the next phase of
              their yard. That&rsquo;s the work we&rsquo;re proudest of.
            </p>

            <div className="pt-6 mt-2 border-t border-[#1a2e1a]/15 grid grid-cols-3 gap-6">
              <Stat label="Years in the region" value={`${new Date().getFullYear() - BUSINESS.established}+`} />
              <Stat label="Counties served" value={String(BUSINESS.counties.length)} />
              <Stat label="Disciplines in-house" value={String(SERVICES.length)} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-serif text-[#1a2e1a] text-[36px] sm:text-[44px] leading-none tracking-tight">
        {value}
      </div>
      <div className="mt-2 text-[11px] tracking-[0.18em] uppercase text-[#5a6a4f]">
        {label}
      </div>
    </div>
  );
}

// ─── Service area ────────────────────────────────────────────────────
function ServiceAreaSection() {
  // Selected towns within their four-county footprint. Conservative —
  // only towns that are unambiguously inside one of these counties.
  const COUNTY_TOWNS: Record<string, string[]> = {
    King: ["Seattle", "Bellevue", "Renton", "Kent", "Auburn", "Federal Way", "Issaquah", "Sammamish", "Maple Valley", "Black Diamond", "Enumclaw"],
    Pierce: ["Tacoma", "Puyallup", "Sumner", "Bonney Lake", "Lakewood", "Gig Harbor", "Edgewood", "Orting"],
    Snohomish: ["Everett", "Lynnwood", "Bothell", "Mill Creek", "Mukilteo", "Snohomish", "Monroe"],
    Kittitas: ["Ellensburg", "Cle Elum", "Roslyn", "Kittitas", "Easton"],
  };
  return (
    <section id="service-area" className="py-24 sm:py-32 bg-[#1a2e1a] text-[#f8f5ef]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          eyebrow="Where we work"
          inverted
          title={
            <>
              Four counties.
              <br className="hidden sm:block" /> One crew that knows them.
            </>
          }
          intro="Based in Auburn, we serve homeowners and property managers across King, Pierce, Snohomish and Kittitas counties. If you&rsquo;re close to that footprint and not sure — ask. We&rsquo;ll tell you straight."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#f8f5ef]/15 border border-[#f8f5ef]/15">
          {BUSINESS.counties.map((county) => (
            <div key={county} className="bg-[#1a2e1a] p-7 sm:p-8">
              <div className="flex items-center gap-2 mb-5">
                <MapPin size={18} weight="duotone" className="text-[#cfe0a8]" />
                <h3 className="font-serif text-[24px] tracking-tight">
                  {county} County
                </h3>
              </div>
              <ul className="space-y-2 text-[14px] text-[#f8f5ef]/80">
                {COUNTY_TOWNS[county].map((town) => (
                  <li key={town} className="flex items-center gap-2">
                    <CaretRight size={11} weight="bold" className="text-[#cfe0a8]" />
                    {town}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 text-[14px] text-[#f8f5ef]/60 max-w-2xl">
          Town list is representative, not exhaustive. The simplest way to
          know if we cover your address: call{" "}
          <a href={BUSINESS.phoneHref} className="text-[#cfe0a8] underline underline-offset-4 hover:text-white">
            {BUSINESS.phoneDisplay}
          </a>{" "}
          or send a quick note via the form below.
        </p>
      </div>
    </section>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────
function ContactSection() {
  return (
    <section id="contact" className="py-24 sm:py-32 bg-[#f8f5ef]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="text-[12px] tracking-[0.28em] uppercase text-[#5a6a4f] font-medium mb-5">
              Free estimates
            </p>
            <h2 className="font-serif text-[#1a1612] text-[40px] leading-[1.05] sm:text-[54px] sm:leading-[1.02] tracking-tight">
              Tell us about
              <br />
              <em className="not-italic text-[#1a2e1a]">your project.</em>
            </h2>
            <p className="mt-6 text-[16px] leading-relaxed text-[#1a1612]/75 max-w-md">
              Send a few details and we&rsquo;ll get back to you within one
              business day, usually faster. We typically respond within 24 hours.
            </p>

            <dl className="mt-10 space-y-5 text-[15px]">
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

          <div className="lg:col-span-7">
            <MtViewContactForm services={SERVICES.map((s) => s.name)} />
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
    <div className="flex items-start gap-3">
      <Icon size={18} weight="duotone" className="text-[#1a2e1a] mt-0.5 shrink-0" />
      <div>
        <dt className="text-[11px] tracking-[0.18em] uppercase text-[#5a6a4f] mb-0.5">
          {label}
        </dt>
        <dd className="text-[#1a1612] font-medium">{value}</dd>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block hover:opacity-80 transition">
      {content}
    </a>
  ) : (
    content
  );
}

// ─── Footer ──────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#0d1a0d] text-[#f8f5ef]/85 pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <img src={LOGO} alt={BUSINESS.name} className="h-12 w-auto" />
              <div className="font-serif text-[18px] tracking-tight text-[#f8f5ef] leading-tight">
                Mountain View
                <br />
                <span className="text-[11px] tracking-[0.2em] uppercase text-[#cfe0a8]">
                  Landscape &amp; Design
                </span>
              </div>
            </div>
            <p className="mt-6 text-[14px] leading-relaxed max-w-sm">
              Family-owned landscape design and installation. Auburn, WA
              and the four surrounding counties since {BUSINESS.established}.
            </p>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-[11px] tracking-[0.22em] uppercase text-[#cfe0a8] mb-4">
              Contact
            </h4>
            <ul className="space-y-2 text-[14px]">
              <li>
                <a href={BUSINESS.phoneHref} className="hover:text-white">
                  {BUSINESS.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${BUSINESS.email}`} className="hover:text-white break-all">
                  {BUSINESS.email}
                </a>
              </li>
              <li className="text-[#f8f5ef]/70 pt-1">
                {BUSINESS.address.street}
                <br />
                {BUSINESS.address.city}, {BUSINESS.address.state} {BUSINESS.address.zip}
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-[11px] tracking-[0.22em] uppercase text-[#cfe0a8] mb-4">
              Service area
            </h4>
            <p className="text-[14px] leading-relaxed text-[#f8f5ef]/80">
              {BUSINESS.counties.join(", ")} counties — Western Washington and
              Central Cascades.
            </p>
            <h4 className="mt-7 text-[11px] tracking-[0.22em] uppercase text-[#cfe0a8] mb-4">
              On the page
            </h4>
            <ul className="grid grid-cols-2 gap-y-2 text-[14px]">
              <li><a href="#services" className="hover:text-white">Services</a></li>
              <li><a href="#work" className="hover:text-white">Work</a></li>
              <li><a href="#about" className="hover:text-white">About</a></li>
              <li><a href="#service-area" className="hover:text-white">Service area</a></li>
              <li><a href="#contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-[#f8f5ef]/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[12px] text-[#f8f5ef]/55">
          <span>
            &copy; {new Date().getFullYear()} Mountain View Landscape &amp; Design Inc. All rights reserved.
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

// ─── Shared section header ──────────────────────────────────────────
function SectionHeader({
  eyebrow,
  title,
  intro,
  inverted = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  inverted?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p
        className={`text-[12px] tracking-[0.28em] uppercase font-medium mb-5 ${
          inverted ? "text-[#cfe0a8]" : "text-[#5a6a4f]"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`font-serif text-[40px] leading-[1.05] sm:text-[54px] sm:leading-[1.02] tracking-tight ${
          inverted ? "text-[#f8f5ef]" : "text-[#1a1612]"
        }`}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={`mt-6 text-[16px] sm:text-[17px] leading-relaxed max-w-2xl ${
            inverted ? "text-[#f8f5ef]/80" : "text-[#1a1612]/75"
          }`}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
