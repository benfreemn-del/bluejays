/* eslint-disable @next/next/no-img-element -- Static marketing showcase uses plain img tags intentionally. */

/**
 * /clients/wholme-naturopathy — Wholme Naturopathic Clinic (Frenchs Forest, NSW).
 *
 * Bespoke premium showcase for inbound audit lead. Practitioner: Debbie Kaczor,
 * degree-qualified naturopath specialising in women's gut health, hormonal
 * balance, thyroid function, perimenopause + menopause. Clinic at 7/55 Sorlie
 * Rd Frenchs Forest, second location at 10D Ponderosa Pde Warriewood, plus
 * Australia-wide Zoom consultations.
 *
 * Visual language: warm cream parchment + deep forest sage + rust accent —
 * editorial wellness, NOT spa-luxe, NOT clinical-medical. Sharp corners +
 * hairline rules over rounded cards. Serif headlines, sans body. Motion
 * minimal — the page should feel grounded.
 *
 * Real Wholme Squarespace-CDN photography only. No Unsplash, no fabrication.
 * Testimonials section omitted because Wholme's live site has none surfaced —
 * a single editorial pull-quote stands in.
 *
 * To wire as the prospect's preview URL:
 *   update prospects set
 *     pricing_tier = 'custom',
 *     custom_site_url = '/clients/wholme-naturopathy'
 *   where slug-of-record matches Wholme.
 */

import {
  Phone,
  MapPin,
  Envelope,
  ArrowRight,
  ArrowUpRight,
  Leaf,
  Plant,
  Flower,
  FlowerLotus,
  Drop,
  Sun,
  Moon,
  Heartbeat,
  Brain,
  Thermometer,
  TestTube,
  Notebook,
  ClipboardText,
  ChatCircleText,
  CalendarBlank,
  CheckCircle,
  Sparkle,
  Quotes,
  Certificate,
  HandHeart,
  Stethoscope,
  Coffee,
  Cookie,
  Pill,
  Microphone,
  Tree,
} from "@phosphor-icons/react/dist/ssr";

import StickyNav from "./sticky-nav";
import InquiryForm from "@/components/clients/InquiryForm";
import BackToTopButton from "@/components/BackToTopButton";

/* ───────────────────────── BUSINESS ───────────────────────── */
const BUSINESS = {
  name: "Wholme Naturopathic Clinic",
  shortName: "Wholme",
  practitioner: "Debbie Kaczor",
  practitionerTitle: "Degree-qualified Naturopath",
  phoneDisplay: "0410 697 405",
  phoneHref: "tel:+61410697405",
  email: "debbie@wholmenaturopathy.com.au",
  emailHref: "mailto:debbie@wholmenaturopathy.com.au",
  abn: "55 626 284 172",
  bookingUrl: "https://wholme-naturopathy.simplecliniconline.com/diary",
  instagram: "https://www.instagram.com/wholmenaturopathy",
  locations: [
    {
      label: "Frenchs Forest",
      street: "Shop 7, 55 Sorlie Road",
      city: "Frenchs Forest, NSW 2086",
      area: "Northern Beaches, Sydney",
    },
    {
      label: "Warriewood",
      street: "10D Ponderosa Parade",
      city: "Warriewood, NSW 2102",
      area: "Northern Beaches, Sydney",
    },
  ],
  serviceArea: "Online consultations Australia-wide · in-clinic on Sydney's Northern Beaches",
} as const;

/* ───────────────────────── PHOTO LIBRARY (curl-verified) ─────────────────────────
   Every URL pulled from Wholme's Squarespace CDN. Hero/feature spots use
   ?format=2500w; gallery / supporting spots use ?format=1500w. */
const PHOTOS = {
  // Hero — herbalist's hand selecting dropper-bottle / book pairing
  hero:
    "https://images.squarespace-cdn.com/content/v1/63fc16b160fe316cefb2c3c4/0d96a7e3-f829-4e99-b7dd-3319fc89567a/2B7A4290.jpg?format=2500w",
  // Editorial — Debbie at desk with reference book
  editorial:
    "https://images.squarespace-cdn.com/content/v1/63fc16b160fe316cefb2c3c4/f57c9934-83e6-4b4d-b0e1-13280e665e1d/WebsiteEdit.jpg?format=2500w",
  // About — Debbie holding clinical reference
  aboutPortrait:
    "https://images.squarespace-cdn.com/content/v1/63fc16b160fe316cefb2c3c4/98e7c161-5d9d-40d3-86d4-6323fea9a862/Holding+bookjpg.jpg?format=1500w",
  // Treatment / consult feel
  consultDetail:
    "https://images.squarespace-cdn.com/content/v1/63fc16b160fe316cefb2c3c4/2e9b5e7b-8e92-4fdb-b4b8-8abc5e806265/IMG_4663.jpg?format=1500w",
  consultRoom:
    "https://images.squarespace-cdn.com/content/v1/63fc16b160fe316cefb2c3c4/27bc8f13-9a94-41bf-a4a9-c470fda2066b/2B7A3966.jpg?format=1500w",
  laptop:
    "https://images.squarespace-cdn.com/content/v1/63fc16b160fe316cefb2c3c4/71d867c5-9334-4c12-9cda-e0e936729ccf/Hands+on+laptop.jpg?format=1500w",
  herbs:
    "https://images.squarespace-cdn.com/content/v1/63fc16b160fe316cefb2c3c4/d19f390a-bbe3-4743-bde0-02555b5b5409/Stock_Herbs.jpg?format=1500w",
  detail:
    "https://images.squarespace-cdn.com/content/v1/63fc16b160fe316cefb2c3c4/57f3a7ad-def0-4371-b8bd-1e1a9c9e0087/2B7A4371.jpg?format=1500w",
  logo:
    "https://images.squarespace-cdn.com/content/v1/63fc16b160fe316cefb2c3c4/16b53423-9f29-4c9b-8419-ec7bdd319043/Wholme-logo-white.png?format=1500w",
} as const;

/* ───────────────────────── PALETTE ─────────────────────────
   Warm cream parchment base. Deep forest sage as primary ink. Rust
   terracotta accent for headlines / focal moments. Charcoal for body. */
const BG = "#f7f1e8";
const BG_DEEP = "#efe6d4";
const BG_INK = "#1f2a1c";        // very dark sage — used as alt section bg
const PANEL = "#fdfaf3";
const INK = "#2a2520";           // deep charcoal-brown body type
const INK_SOFT = "#5a5048";      // muted body
const SAGE = "#3d4f3a";          // deep forest sage — primary
const SAGE_DEEP = "#2a3a28";
const SAGE_SOFT = "#6a7a5f";     // muted sage for labels/eyebrows
const RUST = "#a85a3c";          // terracotta accent
const ROSE = "#c98876";          // dusty rose secondary

/* ───────────────────────── COPY BLOCKS ───────────────────────── */
const SERVICES = [
  {
    title: "Free Discovery Call",
    duration: "15 minutes · complimentary",
    icon: ChatCircleText,
    body:
      "An introductory conversation, no commitment. We talk through what's been going on, what you've already tried, and whether naturopathic care is the right next step for you.",
    cta: "Book a discovery call",
  },
  {
    title: "Initial Consultation",
    duration: "60–75 minutes · $220",
    icon: ClipboardText,
    body:
      "A thorough review of your medical history, lifestyle, current symptoms and existing pathology. You leave with a written, personalised treatment plan — herbal, nutritional, lifestyle — that addresses root causes, not just symptoms.",
    cta: "Book initial consult",
  },
  {
    title: "Blood Pathology Review",
    duration: "Written report · $99",
    icon: TestTube,
    body:
      "Send through your most recent blood work. You receive a written functional analysis interpreting your results against optimal — not just 'normal' — ranges, with practical next steps. No appointment required.",
    cta: "Request a review",
  },
  {
    title: "Acute Consultation",
    duration: "15 minutes · $55",
    icon: Heartbeat,
    body:
      "Short, focused care for sudden issues — colds and flu, headaches, mild infections, minor injuries. For existing clients and new ones who need something practical, fast.",
    cta: "Book acute consult",
  },
] as const;

const FOCUS_AREAS = [
  {
    title: "Gut Health",
    icon: Leaf,
    blurb:
      "IBS, bloating, reflux, dysbiosis, constipation, food sensitivities. Comprehensive testing, microbiome support, root-cause work.",
  },
  {
    title: "Thyroid Function",
    icon: Sun,
    blurb:
      "Hashimoto's, sub-clinical hypothyroidism, fatigue, weight changes, cold intolerance, hair loss — beyond TSH alone.",
  },
  {
    title: "Hormonal Imbalance",
    icon: Flower,
    blurb:
      "Cycle irregularities, PMS, PCOS support, oestrogen dominance, progesterone insufficiency — nutritional and herbal pathways.",
  },
  {
    title: "Perimenopause & Menopause",
    icon: Moon,
    blurb:
      "Hot flushes, sleep disruption, mood shifts, libido, brain fog. Steady, evidence-aligned support through the transition.",
  },
  {
    title: "Stress, Burnout & Energy",
    icon: Brain,
    blurb:
      "HPA-axis imbalance, adrenal fatigue patterns, chronic exhaustion. Practical, restorative protocols for women who can't stop.",
  },
  {
    title: "Skin Health",
    icon: Drop,
    blurb:
      "Hormonal acne, eczema, rosacea — addressed at the gut, liver and hormonal level rather than topically alone.",
  },
] as const;

const PROCESS = [
  {
    n: "01",
    title: "Discovery call",
    body:
      "A complimentary 15-minute Zoom or phone call. You share what's been happening; I share how I'd approach it. No pressure to book on.",
    icon: ChatCircleText,
  },
  {
    n: "02",
    title: "Initial consultation",
    body:
      "60–75 minutes, in-clinic on the Northern Beaches or via Zoom. Detailed history, lifestyle, symptom timeline, review of any prior pathology — everything on the table.",
    icon: Notebook,
  },
  {
    n: "03",
    title: "Functional testing (where indicated)",
    body:
      "Targeted pathology, microbiome, hormone or thyroid panels — only the testing that will change your treatment plan, never a kitchen-sink approach.",
    icon: TestTube,
  },
  {
    n: "04",
    title: "Personalised plan",
    body:
      "A written protocol delivered after your consultation: practitioner-grade herbal formulas, nutritional guidance, lifestyle scaffolding. Tailored to your life, not a template.",
    icon: ClipboardText,
  },
  {
    n: "05",
    title: "Steady follow-through",
    body:
      "Most women see meaningful change across three to four follow-ups. We refine, retest where it helps, and build something that holds long after we stop working together.",
    icon: CheckCircle,
  },
] as const;

const PHILOSOPHY_PRINCIPLES = [
  {
    title: "Root cause, not symptom suppression",
    body:
      "Why is your gut inflamed? Why is your thyroid struggling? Treating the downstream issue without asking the upstream question rarely holds.",
    icon: Tree,
  },
  {
    title: "The body is wired to heal",
    body:
      "Given the right inputs and the right space, restoration is the default. My job is to remove obstacles and offer support — not to override your physiology.",
    icon: Plant,
  },
  {
    title: "Evidence-aligned, not dogmatic",
    body:
      "Herbal medicine and clinical nutrition where they belong. Pathology testing that earns its place. Referral to your GP when that's the right call.",
    icon: Certificate,
  },
  {
    title: "Care that fits your life",
    body:
      "Protocols built around real schedules, real budgets, real fatigue. The most beautiful plan in the world fails if you can't actually live it.",
    icon: HandHeart,
  },
] as const;

const READING = [
  {
    category: "Perimenopause",
    title: "Perimenopause at 40? The early signs most women miss",
    blurb:
      "Cycle changes, sleep disruption, sudden anxiety — the under-recognised hallmarks that often arrive a decade before menopause itself.",
  },
  {
    category: "Gut Health",
    title: "The gut–hormone connection",
    blurb:
      "How your microbiome metabolises oestrogen, why constipation drives PMS, and the testing that actually moves the needle.",
  },
  {
    category: "Thyroid",
    title: "When 'normal' isn't optimal — a thyroid case study",
    blurb:
      "A real-world example of why standard reference ranges miss the women who feel anything but well.",
  },
] as const;

/* ───────────────────────── PRIMITIVES ───────────────────────── */
function Eyebrow({
  children,
  color = SAGE_SOFT,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      className="text-[11px] tracking-[0.28em] uppercase font-medium"
      style={{ color }}
    >
      {children}
    </div>
  );
}

function HairlineRule({ color = SAGE }: { color?: string }) {
  return <div className="h-px w-full" style={{ background: `${color}26` }} />;
}

/* ───────────────────────── PAGE ───────────────────────── */
export default function WholmePage() {
  return (
    <>
    <main
      id="top"
      className="min-h-screen font-sans"
      style={{ background: BG, color: INK }}
    >
      <StickyNav
        businessName={BUSINESS.name}
        logoSrc={PHOTOS.logo}
        phoneDisplay={BUSINESS.phoneDisplay}
        phoneHref={BUSINESS.phoneHref}
      />

      {/* ─────────────── HERO ─────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: BG }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-24 pb-20 sm:pb-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-end">
            {/* Left — copy */}
            <div className="lg:col-span-6 xl:col-span-5 space-y-8">
              <Eyebrow>Naturopathic clinic · est. Sydney · since 2018</Eyebrow>
              <h1
                className="font-serif text-[44px] sm:text-[58px] lg:text-[64px] leading-[1.04] tracking-[-0.02em]"
                style={{ color: SAGE_DEEP }}
              >
                Considered, root-cause care for{" "}
                <span style={{ color: RUST, fontStyle: "italic" }}>
                  women&rsquo;s health
                </span>{" "}
                that&rsquo;s been overlooked.
              </h1>
              <p
                className="text-[17px] sm:text-[18px] leading-[1.65] max-w-[44ch]"
                style={{ color: INK_SOFT }}
              >
                Gut, hormones, thyroid, perimenopause, energy. Personalised
                naturopathic care from {BUSINESS.practitioner} — in-clinic on
                Sydney&rsquo;s Northern Beaches or online, anywhere in
                Australia.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href={BUSINESS.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-4 text-[14px] font-medium tracking-wide transition"
                  style={{
                    background: SAGE,
                    color: BG,
                  }}
                >
                  Book a free discovery call
                  <ArrowRight size={16} weight="bold" />
                </a>
                <a
                  href="#about"
                  className="inline-flex items-center gap-2 text-[14px] font-medium tracking-wide pb-1 border-b transition"
                  style={{ color: SAGE_DEEP, borderColor: `${SAGE}55` }}
                >
                  Meet Debbie
                </a>
              </div>

              <div className="pt-8 grid grid-cols-3 gap-6 max-w-md">
                <div>
                  <div
                    className="font-serif text-[28px] leading-none"
                    style={{ color: RUST }}
                  >
                    7+
                  </div>
                  <div
                    className="mt-2 text-[11px] tracking-[0.18em] uppercase"
                    style={{ color: SAGE_SOFT }}
                  >
                    Years in practice
                  </div>
                </div>
                <div>
                  <div
                    className="font-serif text-[28px] leading-none"
                    style={{ color: RUST }}
                  >
                    2
                  </div>
                  <div
                    className="mt-2 text-[11px] tracking-[0.18em] uppercase"
                    style={{ color: SAGE_SOFT }}
                  >
                    Sydney clinics
                  </div>
                </div>
                <div>
                  <div
                    className="font-serif text-[28px] leading-none"
                    style={{ color: RUST }}
                  >
                    AU
                  </div>
                  <div
                    className="mt-2 text-[11px] tracking-[0.18em] uppercase"
                    style={{ color: SAGE_SOFT }}
                  >
                    Australia-wide online
                  </div>
                </div>
              </div>
            </div>

            {/* Right — overlapping image card */}
            <div className="lg:col-span-6 xl:col-span-7 relative">
              <div className="relative aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5] overflow-hidden">
                <img
                  src={PHOTOS.hero}
                  alt="Naturopathic herbal medicine — dropper bottles and reference text"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              {/* Overlap meta card */}
              <div
                className="hidden sm:block absolute -bottom-10 -left-6 lg:-left-10 max-w-[300px] p-6 border"
                style={{
                  background: PANEL,
                  borderColor: `${SAGE}22`,
                  boxShadow: "0 18px 60px rgba(31, 42, 28, 0.10)",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Quotes size={18} weight="fill" style={{ color: RUST }} />
                  <Eyebrow>Practitioner&rsquo;s note</Eyebrow>
                </div>
                <p
                  className="font-serif text-[16px] leading-[1.5]"
                  style={{ color: SAGE_DEEP }}
                >
                  &ldquo;Rather than alleviating symptoms, my work is to
                  uncover the root cause of the imbalance — and then help
                  the body do what it&rsquo;s wired to do.&rdquo;
                </p>
                <div
                  className="mt-3 text-[12px] tracking-[0.18em] uppercase"
                  style={{ color: SAGE_SOFT }}
                >
                  — Debbie Kaczor
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* hairline divider closing the hero */}
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <HairlineRule />
        </div>
      </section>

      {/* ─────────────── TRUST RAIL ─────────────── */}
      <section className="py-10" style={{ background: BG }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-5">
            <Eyebrow>Areas of clinical focus</Eyebrow>
            <div
              className="flex flex-wrap gap-x-8 gap-y-3 text-[13px] font-medium"
              style={{ color: SAGE_DEEP }}
            >
              <span className="inline-flex items-center gap-2">
                <Leaf size={14} weight="fill" style={{ color: SAGE }} />
                Gut health
              </span>
              <span className="inline-flex items-center gap-2">
                <Sun size={14} weight="fill" style={{ color: SAGE }} />
                Thyroid
              </span>
              <span className="inline-flex items-center gap-2">
                <Flower size={14} weight="fill" style={{ color: SAGE }} />
                Hormones
              </span>
              <span className="inline-flex items-center gap-2">
                <Moon size={14} weight="fill" style={{ color: SAGE }} />
                Perimenopause
              </span>
              <span className="inline-flex items-center gap-2">
                <Brain size={14} weight="fill" style={{ color: SAGE }} />
                Energy &amp; burnout
              </span>
              <span className="inline-flex items-center gap-2">
                <Drop size={14} weight="fill" style={{ color: SAGE }} />
                Skin
              </span>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 mt-10">
          <HairlineRule />
        </div>
      </section>

      {/* ─────────────── ABOUT ─────────────── */}
      <section id="about" className="py-24 sm:py-32" style={{ background: BG }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={PHOTOS.aboutPortrait}
                alt={`${BUSINESS.practitioner}, naturopath — at her clinic on Sydney's Northern Beaches`}
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="hidden lg:block absolute -bottom-8 -right-8 p-5 border max-w-[220px]"
              style={{
                background: PANEL,
                borderColor: `${SAGE}22`,
              }}
            >
              <Eyebrow>Practitioner</Eyebrow>
              <div
                className="mt-2 font-serif text-[22px] leading-tight"
                style={{ color: SAGE_DEEP }}
              >
                {BUSINESS.practitioner}
              </div>
              <div
                className="mt-1 text-[12px] tracking-wide"
                style={{ color: INK_SOFT }}
              >
                Degree-qualified Naturopath
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-7">
            <Eyebrow>About the practitioner</Eyebrow>
            <h2
              className="font-serif text-[36px] sm:text-[48px] leading-[1.06] tracking-[-0.015em]"
              style={{ color: SAGE_DEEP }}
            >
              A clinical practice built on listening,
              <br className="hidden sm:block" />
              testing where it matters, and treating the
              <br className="hidden sm:block" />
              whole person.
            </h2>
            <p
              className="text-[16px] sm:text-[17px] leading-[1.7] max-w-[60ch]"
              style={{ color: INK_SOFT }}
            >
              Wholme is led by {BUSINESS.practitioner}, a degree-qualified
              naturopath whose practice has, over years of clinical work,
              quietly become a destination for women carrying overlooked or
              dismissed health concerns — the bloating that won&rsquo;t
              settle, the thyroid panel that reads &ldquo;normal&rdquo;
              while you feel nothing of the kind, the perimenopausal shift
              no-one quite warned you about.
            </p>
            <p
              className="text-[16px] sm:text-[17px] leading-[1.7] max-w-[60ch]"
              style={{ color: INK_SOFT }}
            >
              Care here is naturopathic in the original sense of the word:
              clinical nutrition, herbal medicine, evidence-aligned
              functional testing, and an unhurried look at the upstream
              drivers behind the symptoms you arrived with. Always
              individual, never templated.
            </p>

            <div className="pt-4 grid sm:grid-cols-2 gap-x-8 gap-y-5">
              {PHILOSOPHY_PRINCIPLES.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.title} className="flex gap-4">
                    <div
                      className="flex-shrink-0 w-10 h-10 inline-flex items-center justify-center"
                      style={{
                        background: `${SAGE}10`,
                        color: SAGE,
                      }}
                    >
                      <Icon size={18} weight="duotone" />
                    </div>
                    <div>
                      <div
                        className="text-[14px] font-semibold"
                        style={{ color: SAGE_DEEP }}
                      >
                        {p.title}
                      </div>
                      <div
                        className="mt-1 text-[13.5px] leading-[1.6]"
                        style={{ color: INK_SOFT }}
                      >
                        {p.body}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 flex flex-wrap items-center gap-5">
              <a
                href={BUSINESS.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-[13px] font-medium tracking-wide transition"
                style={{ background: SAGE, color: BG }}
              >
                Book with Debbie
                <ArrowRight size={14} weight="bold" />
              </a>
              <a
                href="#contact"
                className="text-[13px] font-medium tracking-wide pb-1 border-b transition"
                style={{ color: SAGE_DEEP, borderColor: `${SAGE}55` }}
              >
                Send a question first
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── EDITORIAL PULL QUOTE BAND ─────────────── */}
      <section
        className="py-24 sm:py-32 relative overflow-hidden"
        style={{ background: BG_INK, color: BG }}
      >
        <div className="mx-auto max-w-5xl px-5 sm:px-8 text-center relative">
          <Quotes
            size={42}
            weight="fill"
            style={{ color: ROSE, opacity: 0.7 }}
            className="mx-auto mb-8"
          />
          <p
            className="font-serif text-[28px] sm:text-[40px] lg:text-[46px] leading-[1.18] tracking-[-0.01em]"
            style={{ color: BG }}
          >
            &ldquo;The body is wired to heal. My work is to clear the path
            in front of it &mdash; with the right inputs, the right tests,
            and the patience to let restoration happen on its own
            timeline.&rdquo;
          </p>
          <div
            className="mt-10 text-[12px] tracking-[0.28em] uppercase"
            style={{ color: ROSE }}
          >
            Practitioner&rsquo;s philosophy &mdash; {BUSINESS.practitioner}
          </div>
        </div>
      </section>

      {/* ─────────────── SERVICES ─────────────── */}
      <section
        id="services"
        className="py-24 sm:py-32"
        style={{ background: BG }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 mb-16">
            <div className="lg:col-span-5">
              <Eyebrow>How we work together</Eyebrow>
              <h2
                className="mt-4 font-serif text-[36px] sm:text-[48px] leading-[1.06] tracking-[-0.015em]"
                style={{ color: SAGE_DEEP }}
              >
                Four ways into the work.
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <p
                className="text-[16px] sm:text-[17px] leading-[1.7]"
                style={{ color: INK_SOFT }}
              >
                Whether you&rsquo;re ready for full naturopathic care or
                want to start with a single set of blood results, there&rsquo;s
                a doorway in. Every consultation can run face-to-face on the
                Northern Beaches or online via Zoom.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-px" style={{ background: `${SAGE}22` }}>
            {SERVICES.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="p-8 sm:p-10 group transition"
                  style={{ background: BG }}
                >
                  <div className="flex items-start justify-between gap-6 mb-6">
                    <div
                      className="w-12 h-12 inline-flex items-center justify-center"
                      style={{ background: `${SAGE}10`, color: SAGE }}
                    >
                      <Icon size={22} weight="duotone" />
                    </div>
                    <div
                      className="text-[11px] tracking-[0.22em] uppercase pt-2"
                      style={{ color: RUST }}
                    >
                      {s.duration}
                    </div>
                  </div>
                  <h3
                    className="font-serif text-[26px] sm:text-[30px] leading-tight mb-4"
                    style={{ color: SAGE_DEEP }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="text-[15px] leading-[1.7] mb-6"
                    style={{ color: INK_SOFT }}
                  >
                    {s.body}
                  </p>
                  <a
                    href={BUSINESS.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[13px] font-medium tracking-wide pb-1 border-b transition"
                    style={{ color: SAGE_DEEP, borderColor: `${SAGE}55` }}
                  >
                    {s.cta}
                    <ArrowUpRight size={14} weight="bold" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────── FOCUS AREAS ─────────────── */}
      <section
        id="focus"
        className="py-24 sm:py-32"
        style={{ background: BG_DEEP }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 mb-14">
            <div className="lg:col-span-6">
              <Eyebrow>What I treat</Eyebrow>
              <h2
                className="mt-4 font-serif text-[36px] sm:text-[48px] leading-[1.06] tracking-[-0.015em]"
                style={{ color: SAGE_DEEP }}
              >
                The concerns that fill the
                <br className="hidden sm:block" />
                consult-room calendar.
              </h2>
            </div>
            <div className="lg:col-span-5 lg:col-start-8 self-end">
              <p
                className="text-[16px] leading-[1.7]"
                style={{ color: INK_SOFT }}
              >
                These six areas account for the majority of what walks
                through the door &mdash; almost always interconnected, rarely
                isolated. Treating one usually means understanding the
                others.
              </p>
            </div>
          </div>

          <div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ background: `${SAGE}22` }}
          >
            {FOCUS_AREAS.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="p-8 sm:p-10"
                  style={{ background: BG_DEEP }}
                >
                  <Icon
                    size={28}
                    weight="duotone"
                    style={{ color: RUST }}
                    className="mb-6"
                  />
                  <h3
                    className="font-serif text-[22px] mb-3"
                    style={{ color: SAGE_DEEP }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-[14.5px] leading-[1.65]"
                    style={{ color: INK_SOFT }}
                  >
                    {f.blurb}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-14 grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p
                className="font-serif text-[22px] sm:text-[26px] leading-[1.4]"
                style={{ color: SAGE_DEEP }}
              >
                Don&rsquo;t see your concern listed?{" "}
                <span style={{ color: RUST }}>
                  Book a free 15-minute discovery call
                </span>{" "}
                and we&rsquo;ll talk through whether naturopathic care is
                the right fit.
              </p>
            </div>
            <div className="lg:col-span-5 lg:text-right">
              <a
                href={BUSINESS.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-[13px] font-medium tracking-wide transition"
                style={{ background: SAGE, color: BG }}
              >
                Book a discovery call
                <ArrowRight size={14} weight="bold" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── EDITORIAL IMAGE BREAK ─────────────── */}
      <section className="relative" style={{ background: BG }}>
        <div className="aspect-[16/7] sm:aspect-[21/8] overflow-hidden">
          <img
            src={PHOTOS.editorial}
            alt="Wholme — naturopathic clinical work"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* ─────────────── PROCESS — WHAT TO EXPECT ─────────────── */}
      <section
        id="process"
        className="py-24 sm:py-32"
        style={{ background: BG }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 mb-16">
            <div className="lg:col-span-5">
              <Eyebrow>Your visit, step by step</Eyebrow>
              <h2
                className="mt-4 font-serif text-[36px] sm:text-[48px] leading-[1.06] tracking-[-0.015em]"
                style={{ color: SAGE_DEEP }}
              >
                What to expect, from
                <br className="hidden sm:block" />
                first call to follow-through.
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <p
                className="text-[16px] sm:text-[17px] leading-[1.7]"
                style={{ color: INK_SOFT }}
              >
                Most women arriving here have been to other practitioners,
                tried other protocols, and want to know exactly what
                they&rsquo;re walking into. Here&rsquo;s the shape of it,
                from the very first conversation to where we land together.
              </p>
            </div>
          </div>

          <div className="space-y-px" style={{ background: `${SAGE}22` }}>
            {PROCESS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.n}
                  className="grid lg:grid-cols-12 gap-6 p-8 sm:p-10 items-start"
                  style={{ background: BG }}
                >
                  <div className="lg:col-span-2">
                    <div
                      className="font-serif text-[44px] leading-none"
                      style={{ color: RUST }}
                    >
                      {step.n}
                    </div>
                  </div>
                  <div className="lg:col-span-2 flex lg:justify-start">
                    <div
                      className="w-12 h-12 inline-flex items-center justify-center"
                      style={{ background: `${SAGE}10`, color: SAGE }}
                    >
                      <Icon size={22} weight="duotone" />
                    </div>
                  </div>
                  <div className="lg:col-span-8">
                    <h3
                      className="font-serif text-[24px] sm:text-[28px] mb-3"
                      style={{ color: SAGE_DEEP }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-[15.5px] leading-[1.7] max-w-[64ch]"
                      style={{ color: INK_SOFT }}
                    >
                      {step.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────── DEEP-SAGE BAND : WRITING ─────────────── */}
      <section
        className="py-24 sm:py-32"
        style={{ background: BG_INK, color: BG }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 mb-14">
            <div className="lg:col-span-6">
              <div
                className="text-[11px] tracking-[0.28em] uppercase font-medium"
                style={{ color: ROSE }}
              >
                Reading from the practice
              </div>
              <h2
                className="mt-4 font-serif text-[36px] sm:text-[48px] leading-[1.06] tracking-[-0.015em]"
                style={{ color: BG }}
              >
                Field notes on the
                <br className="hidden sm:block" />
                concerns I see most.
              </h2>
            </div>
            <div className="lg:col-span-5 lg:col-start-8 self-end">
              <p
                className="text-[16px] leading-[1.7]"
                style={{ color: "#d6cfc1" }}
              >
                Long-form writing for the women I work with — what
                perimenopause really looks like at 40, the gut–hormone axis,
                why &ldquo;normal&rdquo; pathology often isn&rsquo;t.
              </p>
            </div>
          </div>

          <div
            className="grid md:grid-cols-3 gap-px"
            style={{ background: "#3a4a36" }}
          >
            {READING.map((r) => (
              <article
                key={r.title}
                className="p-8 sm:p-10 flex flex-col"
                style={{ background: BG_INK }}
              >
                <div
                  className="text-[11px] tracking-[0.22em] uppercase mb-6"
                  style={{ color: ROSE }}
                >
                  {r.category}
                </div>
                <h3
                  className="font-serif text-[22px] sm:text-[24px] leading-[1.25] mb-4"
                  style={{ color: BG }}
                >
                  {r.title}
                </h3>
                <p
                  className="text-[14.5px] leading-[1.65] mb-6 flex-grow"
                  style={{ color: "#c4bdae" }}
                >
                  {r.blurb}
                </p>
                <div
                  className="inline-flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase pb-1 border-b w-fit"
                  style={{ color: ROSE, borderColor: `${ROSE}55` }}
                >
                  Read on the journal
                  <ArrowUpRight size={12} weight="bold" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── CLINIC + LOCATIONS ─────────────── */}
      <section className="py-24 sm:py-32" style={{ background: BG }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-6">
            <Eyebrow>The clinic</Eyebrow>
            <h2
              className="mt-4 font-serif text-[36px] sm:text-[44px] leading-[1.08] tracking-[-0.015em]"
              style={{ color: SAGE_DEEP }}
            >
              Two rooms on the Northern Beaches.
              <br />
              And one on Zoom, anywhere in Australia.
            </h2>
            <p
              className="mt-6 text-[16px] leading-[1.7] max-w-[58ch]"
              style={{ color: INK_SOFT }}
            >
              Most clients work with Wholme remotely &mdash; consultations
              run by video, herbal formulas and supplements posted directly,
              follow-ups by Zoom. For those who&rsquo;d rather meet in
              person, the practice runs from two clinic rooms on Sydney&rsquo;s
              Northern Beaches.
            </p>

            <div className="mt-10 space-y-px" style={{ background: `${SAGE}22` }}>
              {BUSINESS.locations.map((loc) => (
                <div
                  key={loc.label}
                  className="p-6 sm:p-7 flex items-start gap-5"
                  style={{ background: BG }}
                >
                  <MapPin
                    size={22}
                    weight="duotone"
                    style={{ color: RUST }}
                    className="flex-shrink-0 mt-1"
                  />
                  <div>
                    <div
                      className="text-[11px] tracking-[0.22em] uppercase mb-1"
                      style={{ color: SAGE_SOFT }}
                    >
                      {loc.label} clinic
                    </div>
                    <div
                      className="font-serif text-[20px] leading-tight"
                      style={{ color: SAGE_DEEP }}
                    >
                      {loc.street}
                    </div>
                    <div
                      className="mt-1 text-[14px]"
                      style={{ color: INK_SOFT }}
                    >
                      {loc.city} &middot; {loc.area}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={PHOTOS.consultRoom}
                  alt="Inside Wholme clinic"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[3/4] overflow-hidden mt-10">
                <img
                  src={PHOTOS.herbs}
                  alt="Practitioner-grade herbal medicine"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[3/4] overflow-hidden -mt-10">
                <img
                  src={PHOTOS.detail}
                  alt="Clinical detail — Wholme"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={PHOTOS.laptop}
                  alt="Online naturopathy consultation"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── BOOKING / CONTACT ─────────────── */}
      <section
        id="contact"
        className="py-24 sm:py-32"
        style={{ background: BG_DEEP }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5 space-y-7">
            <Eyebrow>Get in touch</Eyebrow>
            <h2
              className="font-serif text-[36px] sm:text-[48px] leading-[1.06] tracking-[-0.015em]"
              style={{ color: SAGE_DEEP }}
            >
              Ready to start?
              <br />
              Or want to ask first.
            </h2>
            <p
              className="text-[16px] leading-[1.7] max-w-[44ch]"
              style={{ color: INK_SOFT }}
            >
              Use the form for a considered reply within one business day.
              For booking directly, jump straight into the online diary &mdash;
              the free 15-minute discovery call is always a good first step.
            </p>

            <div className="pt-2 space-y-4">
              <a
                href={BUSINESS.phoneHref}
                className="flex items-center gap-4 group"
              >
                <div
                  className="w-11 h-11 inline-flex items-center justify-center"
                  style={{ background: `${SAGE}10`, color: SAGE }}
                >
                  <Phone size={18} weight="fill" />
                </div>
                <div>
                  <div
                    className="text-[11px] tracking-[0.22em] uppercase"
                    style={{ color: SAGE_SOFT }}
                  >
                    Call the clinic
                  </div>
                  <div
                    className="font-serif text-[20px] leading-tight"
                    style={{ color: SAGE_DEEP }}
                  >
                    {BUSINESS.phoneDisplay}
                  </div>
                </div>
              </a>
              <a
                href={BUSINESS.emailHref}
                className="flex items-center gap-4 group"
              >
                <div
                  className="w-11 h-11 inline-flex items-center justify-center"
                  style={{ background: `${SAGE}10`, color: SAGE }}
                >
                  <Envelope size={18} weight="fill" />
                </div>
                <div>
                  <div
                    className="text-[11px] tracking-[0.22em] uppercase"
                    style={{ color: SAGE_SOFT }}
                  >
                    Email Debbie directly
                  </div>
                  <div
                    className="font-serif text-[18px] leading-tight break-all"
                    style={{ color: SAGE_DEEP }}
                  >
                    {BUSINESS.email}
                  </div>
                </div>
              </a>
              <a
                href={BUSINESS.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <div
                  className="w-11 h-11 inline-flex items-center justify-center"
                  style={{ background: `${SAGE}10`, color: SAGE }}
                >
                  <CalendarBlank size={18} weight="fill" />
                </div>
                <div>
                  <div
                    className="text-[11px] tracking-[0.22em] uppercase"
                    style={{ color: SAGE_SOFT }}
                  >
                    Book online
                  </div>
                  <div
                    className="font-serif text-[18px] leading-tight"
                    style={{ color: SAGE_DEEP }}
                  >
                    Open the diary
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <InquiryForm
              slug="wholme-naturopathy"
              accent={SAGE}
              accentDeep={SAGE_DEEP}
              ink={INK}
              inkSoft={INK_SOFT}
              panelBg={PANEL}
              serif="ui-serif, Georgia, Cambria, 'Times New Roman', serif"
              submitLabel="Send my enquiry"
              successHeading="Thank you — your enquiry is with Debbie."
              successBody="You'll hear back within one business day with the next step. For anything urgent, please call the clinic on 0410 697 405."
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
                  placeholder: "04xx xxx xxx",
                },
                {
                  type: "select",
                  name: "preferred_contact",
                  label: "Preferred way to reach you",
                  options: [
                    { value: "email", label: "Email" },
                    { value: "phone", label: "Phone call" },
                    { value: "either", label: "Either is fine" },
                  ],
                },
                {
                  type: "select",
                  name: "consultation_mode",
                  label: "Consultation preference",
                  options: [
                    { value: "in-clinic-frenchs-forest", label: "In-clinic — Frenchs Forest" },
                    { value: "in-clinic-warriewood", label: "In-clinic — Warriewood" },
                    { value: "online", label: "Online via Zoom" },
                    { value: "unsure", label: "Not sure yet" },
                  ],
                },
                {
                  type: "radio",
                  name: "primary_concern",
                  label: "What brings you in?",
                  options: [
                    { value: "gut", label: "Gut health", description: "Bloating, IBS, reflux, constipation" },
                    { value: "thyroid", label: "Thyroid", description: "Fatigue, weight, Hashimoto's, cold" },
                    { value: "hormones", label: "Hormones", description: "Cycle, PMS, PCOS, fertility" },
                    { value: "perimenopause", label: "Perimenopause / menopause", description: "Sleep, mood, hot flushes, energy" },
                    { value: "energy", label: "Energy / burnout", description: "Chronic fatigue, stress recovery" },
                    { value: "other", label: "Something else", description: "Tell me more in the message" },
                  ],
                },
                {
                  type: "select",
                  name: "urgency",
                  label: "How urgent is this for you?",
                  options: [
                    { value: "exploring", label: "Just exploring options" },
                    { value: "soon", label: "Within the next few weeks" },
                    { value: "asap", label: "As soon as you can fit me in" },
                  ],
                },
                {
                  type: "textarea",
                  name: "message",
                  label: "What would help me to know?",
                  placeholder: "Symptoms, history, what you've already tried, what you're hoping for. As much or as little as feels right.",
                  rows: 5,
                  full: true,
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer style={{ background: BG_INK, color: BG }} className="pt-20 pb-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-12 mb-16">
            <div className="lg:col-span-5 space-y-6">
              <img
                src={PHOTOS.logo}
                alt="Wholme Naturopathic Clinic"
                className="h-10 w-auto"
              />
              <p
                className="font-serif text-[20px] leading-[1.45] max-w-[36ch]"
                style={{ color: BG }}
              >
                Considered, root-cause naturopathic care for women&rsquo;s
                gut, hormones, thyroid &amp; energy.
              </p>
              <div className="text-[13px]" style={{ color: "#bdb5a4" }}>
                ABN {BUSINESS.abn}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div
                className="text-[11px] tracking-[0.22em] uppercase mb-5"
                style={{ color: ROSE }}
              >
                Practice
              </div>
              <ul className="space-y-3 text-[14px]" style={{ color: "#d6cfc1" }}>
                <li>
                  <a href="#about" className="hover:text-white transition">About Debbie</a>
                </li>
                <li>
                  <a href="#services" className="hover:text-white transition">Services</a>
                </li>
                <li>
                  <a href="#focus" className="hover:text-white transition">What I treat</a>
                </li>
                <li>
                  <a href="#process" className="hover:text-white transition">Your visit</a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition">Contact</a>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <div
                className="text-[11px] tracking-[0.22em] uppercase mb-5"
                style={{ color: ROSE }}
              >
                Visit
              </div>
              <ul className="space-y-4 text-[14px]" style={{ color: "#d6cfc1" }}>
                {BUSINESS.locations.map((loc) => (
                  <li key={loc.label}>
                    <div style={{ color: BG }}>{loc.street}</div>
                    <div className="mt-0.5">{loc.city}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3">
              <div
                className="text-[11px] tracking-[0.22em] uppercase mb-5"
                style={{ color: ROSE }}
              >
                Connect
              </div>
              <ul className="space-y-3 text-[14px]" style={{ color: "#d6cfc1" }}>
                <li>
                  <a href={BUSINESS.phoneHref} className="hover:text-white transition">
                    {BUSINESS.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={BUSINESS.emailHref}
                    className="hover:text-white transition break-all"
                  >
                    {BUSINESS.email}
                  </a>
                </li>
                <li>
                  <a
                    href={BUSINESS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition inline-flex items-center gap-2"
                  >
                    @wholmenaturopathy
                    <ArrowUpRight size={12} weight="bold" />
                  </a>
                </li>
                <li className="pt-2">
                  <a
                    href={BUSINESS.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-medium tracking-wide transition"
                    style={{ background: ROSE, color: BG_INK }}
                  >
                    Book a consultation
                    <ArrowRight size={12} weight="bold" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[12px]"
            style={{ borderTop: `1px solid #3a4a36`, color: "#9c9382" }}
          >
            <div>
              &copy; {new Date().getFullYear()} {BUSINESS.name}. All
              rights reserved.
            </div>
            <div>
              Naturopathic care &middot; Frenchs Forest &middot; Warriewood
              &middot; Online Australia-wide
            </div>
          </div>
        </div>
      </footer>
    </main>
    <BackToTopButton bg="#3d4f3a" fg="#f7f1e8" />
    </>
  );
}
