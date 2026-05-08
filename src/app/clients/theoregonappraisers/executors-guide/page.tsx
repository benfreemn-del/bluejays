/**
 * Executor's Guide — lead magnet article for The Oregon Appraisers.
 *
 * What an executor needs to know about date-of-death appraisals,
 * IRS step-up basis, and avoiding the most common mistakes that cost
 * estates money and time.
 *
 * Written to be useful WITHOUT a sales pitch. The conversion is
 * implicit — by the end of the article, an executor knows what they
 * need + sees Bob is the right person to call. Per Hormozi's
 * lead-magnet principle: give value, the close happens on its own.
 *
 * Print-styled — opens cleanly in browser, prints to PDF cleanly,
 * shareable as a link.
 */

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Phone,
  ArrowLeft,
  CheckCircle,
  Warning,
  Clock,
  FileText,
  Bank,
  Scales,
  ListChecks,
  EnvelopeSimple,
  Buildings,
} from "@phosphor-icons/react/dist/ssr";

const SITE_URL = "https://bluejayportfolio.com";
const PAGE_PATH = "/clients/theoregonappraisers/executors-guide";

const TITLE =
  "What Executors Need to Know About Date-of-Death Appraisals | The Oregon Appraisers";
const DESCRIPTION =
  "A plain-English guide for executors and personal representatives in Oregon. Date-of-death appraisals, IRS step-up basis, the common mistakes that cost estates time and money — and how to avoid them. From Bob Rochefort, Salem-rooted appraiser since 2003.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "The Oregon Appraisers",
    images: [
      {
        url: `${SITE_URL}/images/oregon-appraisers/bush-house.jpg`,
        width: 1400,
        height: 933,
        alt: "Historic Salem residence — example of estate property requiring qualified appraisal",
      },
    ],
    type: "article",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${SITE_URL}/images/oregon-appraisers/bush-house.jpg`],
  },
};

const CREAM = "#faf7f1";
const CREAM_DEEP = "#f3ede0";
const FOREST = "#1f3a2d";
const AMBER = "#b8860b";
const AMBER_LIGHT = "#d4a043";
const SLATE = "#2d2a26";
const PARCHMENT = "#ede5d4";

const TOC = [
  { id: "what-is", title: "What is a date-of-death appraisal?" },
  { id: "why-it-matters", title: "Why it matters: the IRS step-up basis" },
  { id: "when", title: "When you need it (and when you don't)" },
  { id: "what-includes", title: "What's actually inside the report" },
  { id: "mistakes", title: "Five mistakes that cost estates money" },
  { id: "timeline", title: "How long it takes" },
  { id: "what-it-costs", title: "What it costs" },
  { id: "next", title: "What to do next" },
];

const MISTAKES = [
  {
    n: "01",
    title: "Using a Zillow estimate instead of an appraisal",
    body: "Online estimates aren't admissible to probate court and don't survive IRS audit. The IRS expects a qualified appraisal — a Zillow Zestimate is not one. Heirs who try to shortcut this routinely end up redoing the work later under deadline pressure.",
  },
  {
    n: "02",
    title: "Hiring a real-estate-agent BPO instead of a USPAP appraiser",
    body: "A broker price opinion (BPO) is not a USPAP-compliant appraisal. It's a marketing tool, not a legal document. Probate courts and the IRS expect the latter. If anyone tells you a BPO is 'good enough for probate' — get a second opinion before you rely on it.",
  },
  {
    n: "03",
    title: "Waiting until the IRS asks for it",
    body: "By the time the IRS sends a letter questioning the basis, the original date-of-death window is years gone. Retrospective appraisals are still possible — but they get harder, slower, and more expensive every year. Order the appraisal close to the date of death, not when audit pressure forces it.",
  },
  {
    n: "04",
    title: "Letting the appraiser pick comparables from after the date of death",
    body: "A retrospective appraisal must use only the comparable sales that were actually available as of the date of death. Comparables that closed after that date — even if they're more recent and 'better' — invalidate the report. Always confirm with the appraiser: 'You're using comparables from before the date of death, right?'",
  },
  {
    n: "05",
    title: "Not getting the report signed",
    body: "An unsigned draft is not a final report. The signed certification page is what makes the report admissible to probate court and the IRS. Always get a signed PDF — and always check the certification page before you file with the court.",
  },
];

const TIMELINE_PHASES = [
  {
    phase: "Day 1–2: Inquiry",
    body: "Quick call or email — describe the property, the date of death, and the use case (probate, IRS step-up, division among heirs). Most inquiries answered within 24 business hours.",
  },
  {
    phase: "Day 3–7: Inspection scheduled",
    body: "Onsite inspection with the executor or a designated representative. Most properties take 30–60 minutes onsite. Photos taken, measurements verified, condition documented.",
  },
  {
    phase: "Day 7–14: Comparable analysis",
    body: "Identifying the right comparable sales from before the date of death, adjusting for differences in size, condition, lot, and location. The bulk of the work happens here — not in the inspection.",
  },
  {
    phase: "Day 14–17: Report drafted + signed",
    body: "Full USPAP-compliant report drafted, reviewed, and signed. PDF delivered via email. Available for follow-up calls with the executor's attorney, the CPA, or the IRS as needed.",
  },
];

const SCHEMA_LD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: TITLE,
  description: DESCRIPTION,
  author: {
    "@type": "Person",
    name: "Robert Rochefort",
    jobTitle: "Certified Real Estate Appraiser",
  },
  publisher: {
    "@type": "Organization",
    name: "The Oregon Appraisers",
    url: `${SITE_URL}/clients/theoregonappraisers`,
  },
  mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`,
  image: `${SITE_URL}/images/oregon-appraisers/bush-house.jpg`,
  datePublished: "2026-05-07",
  inLanguage: "en-US",
};

export default function ExecutorsGuidePage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: CREAM,
        color: SLATE,
        fontFamily: "'Source Sans Pro', system-ui, sans-serif",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_LD) }}
      />
      {/* Fonts loaded by parent layout.tsx; styled-jsx bypassed —
          see comment in page.tsx. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .article-prose {
          font-family: "Source Sans Pro", system-ui, sans-serif;
          line-height: 1.7;
          color: ${SLATE};
        }
        .article-prose h2 {
          font-family: "EB Garamond", Georgia, serif;
          color: ${FOREST};
          font-size: 2rem;
          font-weight: 700;
          margin-top: 3rem;
          margin-bottom: 1rem;
          line-height: 1.2;
        }
        .article-prose h3 {
          font-family: "EB Garamond", Georgia, serif;
          color: ${FOREST};
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        .article-prose p {
          font-size: 1.0625rem;
          margin-bottom: 1.25rem;
          color: ${SLATE};
        }
        .article-prose ul {
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .article-prose li {
          margin-bottom: 0.5rem;
          color: ${SLATE};
        }
        .article-prose strong {
          color: ${FOREST};
        }
        @media print {
          .no-print {
            display: none !important;
          }
          .article-prose {
            font-size: 11pt;
          }
        }
      `,
        }}
      />

      {/* Top bar — back to main */}
      <nav
        className="no-print sticky top-0 z-40 border-b backdrop-blur-md"
        style={{ background: `${CREAM}f0`, borderColor: `${FOREST}20` }}
      >
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <Link
            href="/clients/theoregonappraisers"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80"
            style={{ color: FOREST }}
          >
            <ArrowLeft size={14} weight="bold" />
            Back to The Oregon Appraisers
          </Link>
          <a
            href="tel:+15039101514"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold text-white shadow-sm"
            style={{ background: FOREST }}
          >
            <Phone size={14} weight="bold" />
            <span className="hidden sm:inline">503-910-1514</span>
            <span className="sm:hidden">Call</span>
          </a>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-5 py-12 md:py-20 article-prose">
        {/* Header */}
        <header className="mb-12">
          <span
            className="inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.16em] font-bold mb-5"
            style={{
              background: `${AMBER}15`,
              color: AMBER,
              border: `1px solid ${AMBER}40`,
            }}
          >
            Executor's Guide · Free to share
          </span>
          <h1
            className="text-4xl md:text-5xl font-bold leading-[1.1] mb-5"
            style={{ color: FOREST, fontFamily: "'EB Garamond', serif" }}
          >
            What Executors Need to Know About Date-of-Death Appraisals
          </h1>
          <p
            className="text-lg md:text-xl leading-relaxed"
            style={{ color: `${SLATE}cc` }}
          >
            A plain-English guide for executors, personal representatives, and
            attorneys handling Oregon estates. The pieces that matter, the
            mistakes that cost money, and the timeline you can actually plan
            around.
          </p>
          <div
            className="flex items-center gap-3 mt-6 pt-6 border-t"
            style={{ borderColor: `${FOREST}20` }}
          >
            <div
              className="relative w-12 h-12 rounded-full overflow-hidden shrink-0"
              style={{ border: `1px solid ${FOREST}30` }}
            >
              <Image
                src="/images/oregon-appraisers/bob-rochefort.jpg"
                alt="Bob Rochefort"
                fill
                className="object-cover object-top"
                sizes="48px"
              />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: FOREST }}>
                Bob Rochefort
              </div>
              <div
                className="text-xs uppercase tracking-[0.14em]"
                style={{ color: `${SLATE}99` }}
              >
                Certified Appraiser · Salem, OR · Since 2003
              </div>
            </div>
          </div>
        </header>

        {/* Hero image */}
        <div
          className="aspect-[16/10] rounded-xl overflow-hidden mb-12 relative"
          style={{ border: `1px solid ${FOREST}25` }}
        >
          <Image
            src="/images/oregon-appraisers/bush-house.jpg"
            alt="Historic Salem residence — illustrative of property requiring estate appraisal"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 768px"
            priority
          />
        </div>

        {/* TOC */}
        <div
          className="no-print p-6 rounded-xl mb-12"
          style={{
            background: PARCHMENT,
            border: `1px solid ${AMBER}30`,
          }}
        >
          <div
            className="text-[10px] uppercase tracking-[0.18em] font-bold mb-3"
            style={{ color: AMBER }}
          >
            What's in this guide
          </div>
          <ol className="space-y-2 list-none p-0 m-0">
            {TOC.map((item, i) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-sm font-semibold hover:opacity-80 transition-opacity flex items-baseline gap-3"
                  style={{ color: FOREST }}
                >
                  <span style={{ color: AMBER }}>{String(i + 1).padStart(2, "0")}</span>
                  {item.title}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Body */}
        <h2 id="what-is">What is a date-of-death appraisal?</h2>
        <p>
          A <strong>date-of-death appraisal</strong> (sometimes called a{" "}
          <strong>retrospective appraisal</strong>) values a property as of a
          specific date in the past — usually the day the owner died. It's not
          a current-market appraisal. It's a legally-binding statement of what
          the property was worth at a moment in time, written by a qualified
          appraiser using only the comparable sales that were actually
          available then.
        </p>
        <p>
          For Oregon estates, that valuation drives almost every dollar of tax
          treatment, every dollar of distribution among heirs, and every line
          on the probate inventory. Get the appraisal right and the estate
          closes cleanly. Get it wrong — or skip it — and you spend the next
          two years cleaning up.
        </p>

        <h2 id="why-it-matters">Why it matters: the IRS step-up basis</h2>
        <p>
          When someone dies and a property passes to heirs, the IRS{" "}
          <strong>steps up</strong> the cost basis of that property to its
          fair-market value as of the date of death. That stepped-up basis
          becomes the heir's new starting point for capital-gains tax when they
          eventually sell.
        </p>
        <p>
          Suppose mom bought the house in 1985 for $80,000. By the time she
          died in 2025, the house was worth $620,000. Without the step-up, her
          son inherits her original $80,000 basis — and if he sells next year
          for $640,000, he owes capital gains on $560,000 of appreciation.
          With the step-up to $620,000, he owes capital gains only on
          $20,000.
        </p>
        <p>
          That step-up is real money. But the IRS doesn't take your word for
          the date-of-death value. They expect a{" "}
          <strong>qualified appraisal</strong> from a USPAP-compliant
          appraiser, written close to the date of death, with the
          documentation depth that survives audit follow-up. A Zillow estimate
          doesn't cut it. A real-estate agent's BPO doesn't cut it. The
          appraisal does.
        </p>

        <h2 id="when">When you need it (and when you don't)</h2>
        <p>
          You need a date-of-death appraisal when:
        </p>
        <ul>
          <li>You're settling an estate that includes real property</li>
          <li>You're claiming the IRS step-up basis (almost everyone)</li>
          <li>The estate is large enough to file Form 706 (federal estate tax)</li>
          <li>Heirs are dividing property or buying each other out</li>
          <li>The property will be sold and the basis matters for capital gains</li>
          <li>The IRS is asking — or might ask</li>
        </ul>
        <p>
          You probably don't need one if the property is jointly owned with
          right of survivorship and the surviving owner has no plans to sell.
          Even then — most estate attorneys recommend the appraisal anyway,
          because circumstances change and it's much cheaper to get the report
          now than to reconstruct the date-of-death value years later.
        </p>

        <h2 id="what-includes">What's actually inside the report</h2>
        <p>
          A USPAP-compliant date-of-death appraisal includes:
        </p>
        <ul>
          <li>
            <strong>Subject property analysis</strong> — full description of
            the property as it existed on the date of death, with photos and
            measurements
          </li>
          <li>
            <strong>Three to five comparable sales</strong> — recent sales of
            similar properties from <em>before</em> the date of death, not
            after
          </li>
          <li>
            <strong>Adjustment grid</strong> — line-item adjustments for
            differences in size, condition, lot, location, age, and features.
            Every adjustment supportable.
          </li>
          <li>
            <strong>Reconciled value</strong> — the appraiser's reasoned
            opinion of fair-market value as of the date of death
          </li>
          <li>
            <strong>Methodology disclosure</strong> — how the appraiser
            arrived at the value, what was considered, what was excluded
          </li>
          <li>
            <strong>Signed certification page</strong> — the legal anchor that
            makes the report admissible
          </li>
        </ul>
        <p>
          Most reports run 25–40 pages. The bulk of the value isn't the
          number on the front page — it's the reasoning behind the number that
          can hold up under cross-examination or IRS audit follow-up.
        </p>

        <h2 id="mistakes">Five mistakes that cost estates money</h2>
        <p>
          Most of the work I do for executors involves cleaning up — or
          working around — one of these five mistakes. They're avoidable.
        </p>
        <div className="space-y-5 not-prose mb-8">
          {MISTAKES.map((m) => (
            <div
              key={m.n}
              className="p-6 rounded-lg flex gap-5"
              style={{
                background: "white",
                border: `1px solid ${FOREST}20`,
              }}
            >
              <div
                className="text-3xl font-bold shrink-0"
                style={{
                  color: AMBER,
                  fontFamily: "'EB Garamond', serif",
                  lineHeight: 1,
                }}
              >
                {m.n}
              </div>
              <div>
                <h3
                  style={{
                    color: FOREST,
                    fontFamily: "'EB Garamond', serif",
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    marginTop: 0,
                    marginBottom: "0.5rem",
                  }}
                >
                  {m.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: SLATE, marginBottom: 0 }}
                >
                  {m.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <h2 id="timeline">How long it takes</h2>
        <p>
          A typical date-of-death appraisal takes <strong>two to three weeks</strong>{" "}
          from initial inquiry to signed PDF. Rush turnarounds are sometimes
          possible depending on workload and inspection access. Here's what
          actually happens during those weeks:
        </p>
        <div className="not-prose space-y-3 mb-8">
          {TIMELINE_PHASES.map((p) => (
            <div
              key={p.phase}
              className="flex gap-4 p-4 rounded-lg"
              style={{ background: CREAM_DEEP, border: `1px solid ${FOREST}20` }}
            >
              <div
                className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: FOREST }}
              >
                <Clock size={18} weight="bold" style={{ color: AMBER_LIGHT }} />
              </div>
              <div>
                <div
                  className="text-sm font-bold mb-1"
                  style={{ color: FOREST, fontFamily: "'EB Garamond', serif" }}
                >
                  {p.phase}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: SLATE, margin: 0 }}>
                  {p.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <h2 id="what-it-costs">What it costs</h2>
        <p>
          For a single-family residence in Marion, Polk, or Linn counties,
          most date-of-death appraisals fall in the{" "}
          <strong>$800 to $1,500</strong> range — what The Oregon Appraisers
          calls the Estate-Grade tier. The fee depends on:
        </p>
        <ul>
          <li>Property size and complexity</li>
          <li>How far back the date of value is</li>
          <li>Whether the report needs to be litigation-ready</li>
          <li>Travel time outside Salem-area</li>
        </ul>
        <p>
          Compare that to the alternative: an estate that loses the step-up
          basis on a $620,000 property pays capital-gains tax on hundreds of
          thousands of dollars of phantom gains. The appraisal is one of the
          highest-leverage purchases an executor makes.
        </p>

        <h2 id="next">What to do next</h2>
        <p>
          If you're settling an Oregon estate and you need a date-of-death
          appraisal, the next step is a five-minute phone call. Describe the
          property, the date of death, and the deadline pressure (if any).
          You'll get a clear quote, a turnaround estimate, and an honest read
          on whether your situation is straightforward or complicated.
        </p>
        <p>
          No pressure, no hard sell. Just an appraiser who's been doing this
          work in Salem since 2003, talking through your case.
        </p>

        {/* Final CTA */}
        <div
          className="not-prose mt-12 p-8 rounded-xl text-center"
          style={{
            background: FOREST,
            color: CREAM,
            border: `1px solid ${AMBER}40`,
          }}
        >
          <h3
            style={{
              color: CREAM,
              fontFamily: "'EB Garamond', serif",
              fontSize: "1.75rem",
              fontWeight: 700,
              marginTop: 0,
              marginBottom: "0.5rem",
            }}
          >
            Ready to talk through your estate?
          </h3>
          <p
            className="text-base leading-relaxed mb-6"
            style={{ color: `${CREAM}cc`, marginBottom: "1.5rem" }}
          >
            Most inquiries answered within 24 business hours. Free initial
            consultation by phone.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center no-print">
            <a
              href="tel:+15039101514"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-base font-bold transition-all hover:opacity-95"
              style={{ background: AMBER, color: SLATE }}
            >
              <Phone size={18} weight="bold" />
              Call Bob: 503-910-1514
            </a>
            <a
              href="mailto:Admin@theoregonappraisers.com?subject=Estate%20Appraisal%20Inquiry"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-base font-bold transition-all hover:opacity-95"
              style={{
                background: "transparent",
                border: `2px solid ${AMBER}`,
                color: AMBER_LIGHT,
              }}
            >
              <EnvelopeSimple size={18} weight="bold" />
              Email Bob
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div
          className="mt-10 p-5 rounded-lg text-xs leading-relaxed"
          style={{
            background: PARCHMENT,
            border: `1px solid ${SLATE}20`,
            color: `${SLATE}aa`,
          }}
        >
          <strong style={{ color: SLATE }}>A note on this guide:</strong> This
          is general information for Oregon executors, not legal or tax
          advice. Every estate is different. Specific questions about your
          estate should go to your probate attorney, your CPA, and a qualified
          appraiser. The Oregon Appraisers is not a law firm, does not provide
          legal advice, and does not substitute for the advice of your
          attorney or tax advisor.
        </div>
      </article>

      {/* Footer (network credit) */}
      <footer
        className="no-print py-10 mt-12"
        style={{ background: SLATE, color: `${CREAM}99` }}
      >
        <div className="max-w-3xl mx-auto px-5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ background: FOREST }}
            >
              <Buildings size={14} weight="bold" style={{ color: AMBER_LIGHT }} />
            </div>
            <span>
              © {new Date().getFullYear()} The Oregon Appraisers. Bob
              Rochefort, Salem OR.
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 32 32" style={{ color: "#0ea5e9" }} aria-hidden>
              <circle cx="16" cy="16" r="14" fill="currentColor" opacity="0.15" />
              <circle cx="16" cy="16" r="6" fill="currentColor" />
            </svg>
            <span>
              Built by{" "}
              <a
                href="https://bluejayportfolio.com/audit"
                className="font-bold hover:opacity-100"
                style={{ color: "#0ea5e9" }}
              >
                BlueJays
              </a>{" "}
              — get your free site audit
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
