/* eslint-disable @next/next/no-img-element */

/**
 * /clients/zenith-sports/camps — Camp Finder
 *
 * Lead-magnet page for the parent audience. Per the brand voice doc:
 * "Camp finder (parents)" is one of three priority email-capture funnels.
 *
 * Behaviour:
 *   - Renders the catalog from camps-data.ts grouped by region
 *   - When the catalog is empty, shows a clean "coming soon" state with a
 *     prominent email capture so we still collect parent leads
 *   - Submit posts to /api/clients/inquire with intent="Camp finder" and
 *     source="email-capture" — auto-detected as parent audience and
 *     enrolled in the Parents funnel by the Sprint-2 runner.
 *
 * To populate: edit src/app/clients/zenith-sports/camps/camps-data.ts.
 * No code changes needed — the page reactively shows the grid.
 */

import Link from "next/link";
import StickyNav from "../sticky-nav";
import EmailCapture from "../email-capture";
import { CAMPS, type Camp } from "./camps-data";
import {
  CalendarBlank,
  MapPin,
  Users,
  Ticket,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";

const NAVY = "#0a1832";
const NAVY_DEEP = "#050d1f";
const LIME = "#a3e635";
const ELECTRIC = "#1d4ed8";
const IVORY = "#f5f3ee";

const REGION_ORDER: Camp["region"][] = [
  "Pacific NW",
  "West",
  "Mountain",
  "Midwest",
  "South",
  "Northeast",
];

const LOGO =
  "https://zenithsports.org/cdn/shop/files/Zenith_Sports-02-removebg-preview.png";

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "Rolling enrollment";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function dateRange(camp: Camp): string {
  if (!camp.startDate) return "Rolling enrollment";
  if (!camp.endDate) return fmtDate(camp.startDate);
  return `${fmtDate(camp.startDate)} → ${fmtDate(camp.endDate)}`;
}

export default function CampFinderPage() {
  const grouped = REGION_ORDER.map((region) => ({
    region,
    camps: CAMPS.filter((c) => c.region === region),
  })).filter((g) => g.camps.length > 0);

  return (
    <main className="min-h-screen text-white" style={{ background: NAVY }}>
      <StickyNav
        businessName="Zenith Sports"
        logoSrc={LOGO}
        activePath="main"
      />

      {/* HERO */}
      <section
        className="relative py-24 lg:py-32 border-b border-white/10"
        style={{ background: NAVY_DEEP }}
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.32em] text-[#a3e635] mb-4 flex items-center gap-2">
            <span className="inline-block w-6 h-px bg-[#a3e635]" />
            For parents · Find a camp near you
          </div>
          <h1 className="text-5xl sm:text-7xl font-black uppercase leading-[0.92] tracking-tighter">
            Train with TEKKY<sup className="text-[0.4em] -ml-1 top-[-0.6em]">®</sup>.
            <br />
            <span style={{ color: LIME }}>In your zip code.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base lg:text-lg leading-relaxed text-white/70">
            Day camps, residential weeks, and clinics where every player
            trains with the patent-pending TEKKY® ball. Scroll for camps
            near you — or drop your email and we&apos;ll text you the
            second a camp opens nearby.
          </p>
        </div>
      </section>

      {/* CATALOG OR EMPTY STATE */}
      {grouped.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="relative py-20 lg:py-24" style={{ background: IVORY, color: NAVY }}>
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            {grouped.map((group, i) => (
              <div key={group.region} className={i > 0 ? "mt-16" : ""}>
                <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b-2 border-[#0a1832]/15">
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                    {group.region}
                  </h2>
                  <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500">
                    {group.camps.length} camp{group.camps.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.camps.map((c) => (
                    <CampCard key={c.id} camp={c} />
                  ))}
                </div>
              </div>
            ))}

            {/* Always-on capture below the catalog so even browsers with
                no nearby camp leave with something. */}
            <div className="mt-20 pt-10 border-t border-[#0a1832]/15">
              <BottomCapture />
            </div>
          </div>
        </section>
      )}

      <FooterStrip />
    </main>
  );
}

function EmptyState() {
  return (
    <section className="relative py-24 lg:py-32" style={{ background: IVORY, color: NAVY }}>
      <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
        <div className="text-[10px] tracking-[0.32em] uppercase font-bold text-[#1d4ed8] mb-3">
          Catalog opening soon
        </div>
        <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-[0.95]">
          Camps + clinics
          <br />
          <span style={{ color: ELECTRIC }}>launching this season.</span>
        </h2>
        <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-700 max-w-xl mx-auto">
          We&apos;re finalizing the partner clubs and host venues. Drop
          your email and we&apos;ll let you know the moment a camp opens
          in your region — TEKKY® included in every fee.
        </p>
        <div className="mt-10 max-w-xl mx-auto text-left">
          <EmailCapture
            variant="white"
            intent="Camp finder"
            badge="Get notified"
            headline="Tell me when a camp opens near me."
            body="One email when we have a camp in your region. No spam, no upsell drip — just the alert."
            cta="Notify me"
            successHeadline="You're on the list."
            successBody="As soon as we line up a camp near you, you'll be the first to know."
          />
        </div>
      </div>
    </section>
  );
}

function CampCard({ camp }: { camp: Camp }) {
  return (
    <article className="bg-white border border-slate-200 hover:border-[#1d4ed8]/40 transition rounded p-5 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span
          className="text-[10px] tracking-[0.22em] uppercase font-extrabold px-2 py-0.5 rounded"
          style={{ background: "#1d4ed815", color: ELECTRIC }}
        >
          {camp.format}
        </span>
        {camp.ballIncluded && (
          <span
            className="text-[10px] tracking-[0.22em] uppercase font-extrabold px-2 py-0.5 rounded"
            style={{ background: "#a3e63525", color: NAVY }}
          >
            TEKKY® included
          </span>
        )}
      </div>
      <h3 className="text-xl font-black uppercase tracking-tight" style={{ color: NAVY }}>
        {camp.name}
      </h3>
      <div className="mt-1 text-[12px] text-slate-500">{camp.org}</div>

      <ul className="mt-4 space-y-1.5 text-[13px] text-slate-700">
        <li className="flex items-start gap-2">
          <MapPin size={14} weight="bold" className="mt-0.5 text-[#1d4ed8]" />
          {camp.city}, {camp.state}
        </li>
        <li className="flex items-start gap-2">
          <CalendarBlank size={14} weight="bold" className="mt-0.5 text-[#1d4ed8]" />
          {dateRange(camp)}
        </li>
        <li className="flex items-start gap-2">
          <Users size={14} weight="bold" className="mt-0.5 text-[#1d4ed8]" />
          {camp.ageRange}
        </li>
      </ul>

      {camp.blurb && (
        <p className="mt-4 text-[13px] text-slate-600 leading-relaxed flex-1">
          {camp.blurb}
        </p>
      )}

      {camp.url && (
        <a
          href={camp.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center justify-center gap-2 bg-[#0a1832] text-white px-4 py-2.5 text-[12px] font-extrabold tracking-[0.18em] uppercase hover:bg-[#1d4ed8] transition rounded"
        >
          <Ticket size={14} weight="bold" />
          Sign up
          <ArrowUpRight size={12} weight="bold" />
        </a>
      )}
    </article>
  );
}

function BottomCapture() {
  return (
    <div className="max-w-2xl mx-auto">
      <EmailCapture
        variant="navy"
        intent="Camp finder"
        badge="Don't see a camp near you?"
        headline="Get notified when one opens in your region."
        body="One email when we line up a camp in your area. We don't share your email; we don't blast it."
        cta="Notify me"
        successHeadline="You're in."
        successBody="As soon as a camp opens near you, you'll be the first to know."
      />
    </div>
  );
}

function FooterStrip() {
  return (
    <footer
      className="py-10 border-t border-white/10 text-center"
      style={{ background: NAVY_DEEP }}
    >
      <div className="text-[11px] tracking-[0.2em] uppercase text-white/40">
        © 2025 Zenith Sports, LLC · TEKKY® is a registered trademark · Patent Pending
      </div>
      <div className="mt-3 text-[11px] text-white/55">
        <Link href="/clients/zenith-sports" className="hover:text-white">
          ← Back to TEKKY®
        </Link>
      </div>
    </footer>
  );
}
