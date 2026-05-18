"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * /clients/all-in-one-services/portal-demo
 *
 * Owner-only closer-grade backend mockup for Kyle. Locked 2026-05-18
 * after Ben's "is this gonna close the owner?" pushback. The previous
 * version was a 4-card stub with generic descriptions; this version
 * uses Kyle's REAL projects, REAL reviewers, REAL license + bond +
 * insurance numbers, and REAL Sequim-county pain points so the demo
 * reads as "they get my business" rather than "they have a template."
 *
 * Six functional blocks that mirror what the AI System actually
 * delivers (per CLAUDE.md client-features doc):
 *   1. Stats strip — "what you're leaving on the table"
 *   2. Project status board — Soldate / Del Guzzi / Jay Sakas / Brody
 *   3. Review funnel — Hilary / Bill / Tom / Michael with capture state
 *   4. Missed-call recovery timeline
 *   5. License + bond + insurance countdowns (real ALLONOS841DJ etc.)
 *   6. Change-order signoff preview
 *
 * Three "Unlock with AI System" CTAs sprinkled inside cards so the
 * portal doubles as the $10k upsell pitch — show Kyle just enough
 * that he asks for the full thing.
 *
 * Same single-password gate (kyle2016 — rotate to revoke).
 */

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  LockKey,
  House,
  Sparkle,
  Quotes,
  Phone,
  ChatCircleText,
  CheckCircle,
  Clock,
  Warning,
  Star,
  Certificate,
  ShieldCheck,
  CurrencyDollar,
  Calendar,
  Hourglass,
  CaretRight,
  PhoneIncoming,
  ChatTeardropText,
  EnvelopeSimple,
  PenNib,
  Hammer,
  Wrench,
  MapPin,
} from "@phosphor-icons/react";
import AIOSMark from "../aios-mark";

// ── Rotate to revoke ────────────────────────────────────────────
const GATE_CODE = "kyle2016";

// ── PNW Heritage palette (matches main site) ────────────────────
const BG = "#f5ede0";          // Paper
const BG_ALT = "#ebe1d0";      // Stone (alt section bg)
const BG_PANEL = "#fbf6ec";    // Panel (cards)
const INK = "#1a1612";
const INK_SOFT = "rgba(26, 22, 18, 0.75)";
const INK_DIM = "rgba(26, 22, 18, 0.50)";
const RULE = "rgba(26, 22, 18, 0.12)";

const MOSS = "#2d4a35";
const MOSS_LIGHT = "#3d6b48";
const MOSS_DIM = "rgba(45, 74, 53, 0.18)";

const ACCENT = "#b45309";        // Copper — CTAs only
const ACCENT_GOLD = "#fbbf24";
const ACCENT_DIM = "rgba(180, 83, 9, 0.22)";
const COPPER_GRAD = `linear-gradient(135deg, ${ACCENT_GOLD} 0%, ${ACCENT} 100%)`;
const MOSS_GRAD = `linear-gradient(135deg, ${MOSS_LIGHT} 0%, ${MOSS} 100%)`;

const FONT_HEAD = "'Space Grotesk', sans-serif";
const FONT_BODY = "'Inter', sans-serif";

/* ─────────────────────────  MOCK DATA  ──────────────────────── */

const PROJECTS = [
  {
    name: "Soldate Shower",
    location: "Sequim, WA",
    type: "Custom tile shower",
    status: "Complete · 5★ review captured",
    statusKind: "done" as const,
    nextAction: "Customer review request fired 2 days after walkthrough",
    badge: "$32,400",
  },
  {
    name: "710 Del Guzzi Drive",
    location: "Sequim, WA",
    type: "Bathroom remodel",
    status: "Change order pending homeowner signature · 3 days",
    statusKind: "warn" as const,
    nextAction: "Auto-reminder fires tomorrow morning",
    badge: "$48,900",
  },
  {
    name: "Jay Sakas Addition",
    location: "Olympic Peninsula",
    type: "2-story addition",
    status: "Week 4 of 7 · framing inspection Tuesday 9am",
    statusKind: "in-progress" as const,
    nextAction: "Inspection checklist ready · subs notified",
    badge: "$184,200",
  },
  {
    name: "Brody Office Conversion",
    location: "Sequim, WA",
    type: "Commercial buildout",
    status: "Final walkthrough scheduled Friday 1pm",
    statusKind: "in-progress" as const,
    nextAction: "Punch list synced to job log",
    badge: "$67,800",
  },
  {
    name: "Wine Cellar / Lounge",
    location: "Sequim, WA",
    type: "Custom specialty",
    status: "Awaiting final tile delivery · ETA Monday",
    statusKind: "blocked" as const,
    nextAction: "Auto-text fires when delivery confirms",
    badge: "$56,500",
  },
];

const REVIEWS = [
  {
    name: "Hilary Rosen",
    project: "Residential remodel",
    state: "captured" as const,
    note: "5★ posted to Google · 3 weeks ago",
    quote:
      "Customer service, spectacular results, attention to detail, being flexible when necessary.",
  },
  {
    name: "Bill Bryant",
    project: "Custom residential",
    state: "captured" as const,
    note: "5★ posted to Google · 1 month ago",
    quote:
      "Code compliant, high level of craftsmanship and the ability to follow through to the end.",
  },
  {
    name: "Tom Sandy",
    project: "Multi-project client",
    state: "pending" as const,
    note: "Job finished 4 days ago · auto-text scheduled for tomorrow 10am",
    quote: null,
  },
  {
    name: "Michael Kurtze",
    project: "Custom build",
    state: "never-asked" as const,
    note: "Job finished 9 months ago · never asked · 1 tap to request",
    quote: null,
  },
];

const MISSED_CALLS = [
  {
    when: "Tuesday · 2:14 pm",
    number: "(360) ***-4892",
    duration: "47s no-answer",
    auto:
      "Auto-SMS sent: \"Hi! You just called All In One Services and we missed you. Need an estimate? Book here →\"",
    outcome: "Callback within 18 min · Saturday estimate booked",
    won: true,
  },
  {
    when: "Yesterday · 11:03 am",
    number: "(360) ***-7715",
    duration: "12s ring → voicemail",
    auto:
      "Auto-SMS sent + voicemail transcribed: \"Calling about a master bath remodel in Port Angeles.\"",
    outcome: "Replied with quote walkthrough link · awaiting response",
    won: false,
  },
  {
    when: "Today · 8:47 am",
    number: "(360) ***-2230",
    duration: "Busy signal",
    auto:
      "Auto-SMS sent: \"Sorry we missed you! Reply with project details and we'll text back same-day.\"",
    outcome: "Texted back with kitchen photo · estimate scheduled",
    won: true,
  },
];

const CREDENTIALS = [
  {
    label: "WA L&I License",
    value: "ALLONOS841DJ",
    renewedAt: "2026-03-18",
    nextRenewal: "2027-03-18",
    daysUntil: 304,
    issuer: "WA Department of Labor & Industries",
  },
  {
    label: "General Liability Insurance",
    value: "$1,000,000 policy",
    renewedAt: "2025-09-04",
    nextRenewal: "2026-09-04",
    daysUntil: 109,
    issuer: "Ohio Security Insurance Co",
  },
  {
    label: "Surety Bond",
    value: "$12,000 contractor bond",
    renewedAt: "2026-03-18",
    nextRenewal: "2027-03-18",
    daysUntil: 304,
    issuer: "Western Surety Co",
  },
  {
    label: "USDOT Authority",
    value: "USDOT 3515033",
    renewedAt: "2025-11-12",
    nextRenewal: "2026-11-12",
    daysUntil: 178,
    issuer: "Federal Motor Carrier Safety Admin",
  },
];

/* ─────────────────────────  PAGE  ──────────────────────── */

export default function PortalDemoPage() {
  const [input, setInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (input.trim().toLowerCase() === GATE_CODE) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  return (
    <main
      className="min-h-screen"
      style={{ background: BG, color: INK, fontFamily: FONT_BODY }}
    >
      {/* ── HEADER ── */}
      <header
        className="border-b sticky top-0 z-50 backdrop-blur-md"
        style={{
          background: "rgba(245, 237, 224, 0.92)",
          borderColor: RULE,
        }}
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
          <Link
            href="/clients/all-in-one-services"
            className="inline-flex items-center gap-3 group"
          >
            <AIOSMark size={36} flat />
            <span
              className="flex flex-col leading-tight"
              style={{ fontFamily: FONT_HEAD }}
            >
              <span
                className="text-[14px] sm:text-[16px] font-bold tracking-wide"
                style={{ color: INK }}
              >
                ALL IN ONE SERVICES
              </span>
              <span
                className="text-[10px] tracking-[0.22em] uppercase font-medium"
                style={{ color: MOSS }}
              >
                Owner Portal · Private
              </span>
            </span>
          </Link>
          <Link
            href="/clients/all-in-one-services"
            className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.16em] font-semibold transition-opacity hover:opacity-70"
            style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
          >
            <ArrowLeft size={14} weight="bold" />
            <span className="hidden sm:inline">Back to site</span>
          </Link>
        </div>
      </header>

      {!unlocked ? (
        /* ────────────────────  PASSWORD GATE  ──────────────────── */
        <section className="mx-auto max-w-md px-5 sm:px-8 py-16 sm:py-24">
          <div
            className="rounded-2xl border p-8 sm:p-10"
            style={{ background: BG_PANEL, borderColor: RULE }}
          >
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-5"
              style={{ background: COPPER_GRAD, color: "#1a1612" }}
            >
              <LockKey size={22} weight="duotone" />
            </div>
            <h1
              className="text-[28px] sm:text-[34px] font-bold tracking-tight leading-[1.05] mb-3"
              style={{ color: INK, fontFamily: FONT_HEAD }}
            >
              Kyle&apos;s owner portal.
            </h1>
            <p
              className="text-[15px] leading-relaxed mb-7"
              style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
            >
              Private access for the owner of All In One Service&apos;s LLC.
              Enter your access code to see what your AI System dashboard
              looks like with your real data.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <label className="block mb-5">
                <span
                  className="block text-[10px] tracking-[0.22em] uppercase mb-2 font-semibold"
                  style={{ color: MOSS, fontFamily: FONT_HEAD }}
                >
                  Access code
                </span>
                <input
                  type="password"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setError(false);
                  }}
                  autoComplete="off"
                  autoFocus
                  className="w-full bg-transparent border-b outline-none py-2.5 text-[18px] font-mono transition-colors focus:border-current"
                  style={{ borderColor: error ? "#b91c1c" : RULE, color: INK }}
                />
              </label>

              {error && (
                <p
                  className="text-[13px] mb-5"
                  style={{ color: "#b91c1c", fontFamily: FONT_BODY }}
                >
                  Wrong code. Try again — or text Ben at BlueJays if you lost it.
                </p>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 h-12 rounded-md font-bold text-[13px] uppercase tracking-[0.16em] text-black transition-all hover:brightness-110 active:scale-95"
                style={{
                  background: COPPER_GRAD,
                  fontFamily: FONT_HEAD,
                  boxShadow: "0 6px 18px rgba(180, 83, 9, 0.30)",
                }}
              >
                Unlock portal
                <ArrowRight size={14} weight="bold" />
              </button>
            </form>
          </div>

          <p
            className="text-center text-[12px] mt-6"
            style={{ color: INK_DIM, fontFamily: FONT_BODY }}
          >
            Need access?{" "}
            <a
              href="mailto:bluejaycontactme@gmail.com?subject=All%20In%20One%20Services%20portal%20access"
              className="font-semibold transition-opacity hover:opacity-70"
              style={{ color: MOSS }}
            >
              Email Ben at BlueJays
            </a>
          </p>
        </section>
      ) : (
        /* ────────────────────  UNLOCKED DASHBOARD  ──────────────────── */
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-14">
          {/* ── Greeting + 1-line diagnostic ── */}
          <section className="mb-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.22em] mb-5"
              style={{
                background: "rgba(45, 74, 53, 0.10)",
                border: `1px solid ${MOSS_DIM}`,
                color: MOSS,
                fontFamily: FONT_HEAD,
              }}
            >
              <Sparkle size={12} weight="fill" />
              Preview · Your real data, the system that runs it
            </div>
            <h1
              className="font-bold tracking-tight leading-[0.98] mb-4"
              style={{
                fontFamily: FONT_HEAD,
                fontSize: "clamp(32px, 5vw, 52px)",
                color: INK,
              }}
            >
              Good morning, Kyle.
            </h1>
            <p
              className="text-[17px] sm:text-[19px] leading-relaxed max-w-2xl"
              style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
            >
              Here&apos;s what you missed yesterday, what your crew is on
              today, what reviews you should have asked for, and when your
              license renews. The whole shop, one page.
            </p>
          </section>

          {/* ── BLOCK 1 — Diagnostic stats strip ── */}
          <section className="mb-12">
            <SectionTitle n="01" label="What you're leaving on the table" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <DiagStat
                tone="warn"
                value="4"
                unit="missed calls"
                sub="this month — 0 recovered"
                icon={<PhoneIncoming size={18} weight="duotone" />}
              />
              <DiagStat
                tone="warn"
                value="3 / 12"
                unit="reviews requested"
                sub="9 finished jobs went un-asked last quarter"
                icon={<Star size={18} weight="duotone" />}
              />
              <DiagStat
                tone="warn"
                value="1"
                unit="unsigned change order"
                sub="$8,400 exposed · 710 Del Guzzi · 3 days"
                icon={<Warning size={18} weight="duotone" />}
              />
              <DiagStat
                tone="ok"
                value="304"
                unit="days"
                sub="WA L&I license renewal · auto-reminder set"
                icon={<Certificate size={18} weight="duotone" />}
              />
            </div>
            <UnlockCTA
              label="Auto-recover every missed call + auto-text every finished job for a review"
              caption="Lives on the $10k AI System tier"
            />
          </section>

          {/* ── BLOCK 2 — Project status board ── */}
          <section className="mb-12">
            <SectionTitle n="02" label="Active projects" />
            <div className="space-y-3">
              {PROJECTS.map((p) => (
                <ProjectRow key={p.name} project={p} />
              ))}
            </div>
          </section>

          {/* ── BLOCK 3 — Review funnel ── */}
          <section className="mb-12">
            <SectionTitle n="03" label="Review funnel" />
            <div
              className="rounded-xl border overflow-hidden"
              style={{ background: BG_PANEL, borderColor: RULE }}
            >
              <div
                className="grid grid-cols-[1fr_auto] gap-4 px-5 sm:px-6 py-4 border-b"
                style={{ borderColor: RULE }}
              >
                <div>
                  <div
                    className="text-[16px] font-bold mb-0.5"
                    style={{ color: INK, fontFamily: FONT_HEAD }}
                  >
                    4.6★ across 18 verified reviews
                  </div>
                  <div
                    className="text-[13px]"
                    style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                  >
                    Every finished job auto-texts the customer 3 days
                    later. 5★ routes to Google. Anything less routes
                    privately to you so it never goes public.
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 h-10 rounded-md font-bold text-[12px] uppercase tracking-[0.14em] transition-all hover:brightness-105 self-start"
                  style={{
                    background: MOSS_GRAD,
                    color: "#fef6e8",
                    fontFamily: FONT_HEAD,
                  }}
                >
                  Request 4 reviews
                  <ArrowRight size={12} weight="bold" />
                </button>
              </div>
              <div className="divide-y" style={{ borderColor: RULE }}>
                {REVIEWS.map((r) => (
                  <ReviewRow key={r.name} review={r} />
                ))}
              </div>
            </div>
            <UnlockCTA
              label="The 5-star filter + private negative feedback inbox unlocks with AI System"
              caption="Wipes out the Vicki Walp pattern — bad reviews never go public again"
            />
          </section>

          {/* ── BLOCK 4 — Missed-call recovery feed ── */}
          <section className="mb-12">
            <SectionTitle n="04" label="Missed-call recovery" />
            <div className="space-y-3">
              {MISSED_CALLS.map((c, i) => (
                <MissedCallRow key={i} call={c} />
              ))}
            </div>
            <UnlockCTA
              label="AI replies to every text follow-up in your voice + books the estimate"
              caption="Drops your response time from 4 hours to 60 seconds"
            />
          </section>

          {/* ── BLOCK 5 — License + bond + insurance countdowns ── */}
          <section className="mb-12">
            <SectionTitle n="05" label="Credentials + renewal countdowns" />
            <div className="grid sm:grid-cols-2 gap-4">
              {CREDENTIALS.map((c) => (
                <CredentialCard key={c.label} cred={c} />
              ))}
            </div>
          </section>

          {/* ── BLOCK 6 — Change-order signoff demo ── */}
          <section className="mb-12">
            <SectionTitle n="06" label="Digital change-order signoff" />
            <ChangeOrderCard />
          </section>

          {/* ── CLOSING CTA ── */}
          <section
            className="rounded-2xl p-7 sm:p-10 relative overflow-hidden"
            style={{
              background: MOSS_GRAD,
              color: "#fef6e8",
            }}
          >
            <div
              className="absolute -right-20 -top-20 w-80 h-80 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(252, 211, 77, 0.25) 0%, transparent 70%)",
              }}
            />
            <div className="relative max-w-2xl">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.22em] mb-4"
                style={{
                  background: "rgba(254, 246, 232, 0.15)",
                  border: "1px solid rgba(254, 246, 232, 0.25)",
                  color: ACCENT_GOLD,
                  fontFamily: FONT_HEAD,
                }}
              >
                <Sparkle size={12} weight="fill" />
                Unlock the full system
              </div>
              <h2
                className="font-bold tracking-tight leading-[1.05] mb-4"
                style={{
                  fontFamily: FONT_HEAD,
                  fontSize: "clamp(26px, 4vw, 40px)",
                }}
              >
                The site sells you.
                <br />
                <span style={{ color: ACCENT_GOLD }}>
                  The portal runs you.
                </span>
              </h2>
              <p
                className="text-[16px] sm:text-[17px] leading-relaxed mb-7"
                style={{
                  color: "rgba(254, 246, 232, 0.88)",
                  fontFamily: FONT_BODY,
                }}
              >
                Everything on this dashboard runs without you sitting at a
                screen. AI replies to inbound leads in your voice. Missed
                calls get auto-texted within 30 seconds. Reviews get asked
                3 days after every walkthrough. Change orders signed
                digitally before the bill goes out. License renewals
                auto-flagged 60 days out. One $10,000 install — and your
                back-office runs while your crew swings hammers.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/clients/all-in-one-services#estimate"
                  className="inline-flex items-center gap-2 px-6 h-12 rounded-md font-bold text-[13px] uppercase tracking-[0.14em] transition-all hover:brightness-105 active:scale-95"
                  style={{
                    background: COPPER_GRAD,
                    color: "#1a1612",
                    fontFamily: FONT_HEAD,
                    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.20)",
                  }}
                >
                  Talk to Ben about the AI System
                  <ArrowRight size={14} weight="bold" />
                </Link>
                <a
                  href="tel:+13604776859"
                  className="inline-flex items-center gap-2 text-[14px] font-semibold transition-opacity hover:opacity-80"
                  style={{
                    color: "rgba(254, 246, 232, 0.92)",
                    fontFamily: FONT_HEAD,
                  }}
                >
                  Or call (360) 477-6859
                </a>
              </div>
            </div>
          </section>

          {/* Footer attribution */}
          <div
            className="mt-12 pt-7 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px]"
            style={{ borderColor: RULE, color: INK_DIM }}
          >
            <span className="inline-flex items-center gap-2">
              <Lock size={12} weight="fill" />
              Owner-only · Private preview · Mock data
            </span>
            <a
              href="https://bluejayportfolio.com/audit"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold transition-opacity hover:opacity-70"
              style={{ color: MOSS }}
            >
              Built by BlueJays — get your free site audit
            </a>
          </div>
        </div>
      )}
    </main>
  );
}

/* ─────────────────────────  COMPONENTS  ──────────────────────── */

function SectionTitle({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-5">
      <span
        className="font-bold tabular-nums"
        style={{
          fontFamily: FONT_HEAD,
          fontSize: 28,
          background: MOSS_GRAD,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {n}
      </span>
      <h2
        className="font-bold tracking-tight"
        style={{
          fontFamily: FONT_HEAD,
          fontSize: "clamp(20px, 2.5vw, 26px)",
          color: INK,
        }}
      >
        {label}
      </h2>
    </div>
  );
}

function DiagStat({
  tone,
  value,
  unit,
  sub,
  icon,
}: {
  tone: "ok" | "warn";
  value: string;
  unit: string;
  sub: string;
  icon: React.ReactNode;
}) {
  const accentColor = tone === "warn" ? "#b45309" : MOSS;
  const accentBg =
    tone === "warn" ? "rgba(180, 83, 9, 0.10)" : "rgba(45, 74, 53, 0.10)";
  return (
    <div
      className="p-4 sm:p-5 rounded-xl border"
      style={{ background: BG_PANEL, borderColor: RULE }}
    >
      <div
        className="inline-flex items-center justify-center w-9 h-9 rounded-md mb-3"
        style={{ background: accentBg, color: accentColor }}
      >
        {icon}
      </div>
      <div
        className="text-[28px] sm:text-[32px] font-bold leading-none tabular-nums mb-1"
        style={{ color: INK, fontFamily: FONT_HEAD }}
      >
        {value}
      </div>
      <div
        className="text-[11px] uppercase tracking-[0.18em] font-semibold mb-1.5"
        style={{ color: accentColor, fontFamily: FONT_HEAD }}
      >
        {unit}
      </div>
      <div
        className="text-[12px] leading-snug"
        style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
      >
        {sub}
      </div>
    </div>
  );
}

function UnlockCTA({ label, caption }: { label: string; caption: string }) {
  return (
    <div
      className="mt-4 flex items-center gap-3 px-4 py-3 rounded-lg border"
      style={{
        background: "rgba(180, 83, 9, 0.06)",
        borderColor: ACCENT_DIM,
      }}
    >
      <span
        className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md"
        style={{ background: COPPER_GRAD, color: "#1a1612" }}
      >
        <Sparkle size={14} weight="fill" />
      </span>
      <div className="flex-1 min-w-0">
        <div
          className="text-[13px] font-bold leading-tight"
          style={{ color: INK, fontFamily: FONT_HEAD }}
        >
          {label}
        </div>
        <div
          className="text-[11px] mt-0.5"
          style={{ color: ACCENT, fontFamily: FONT_BODY }}
        >
          {caption}
        </div>
      </div>
    </div>
  );
}

function ProjectRow({ project }: { project: (typeof PROJECTS)[number] }) {
  const statusBg = {
    done: "rgba(45, 74, 53, 0.10)",
    "in-progress": "rgba(180, 83, 9, 0.10)",
    warn: "rgba(217, 119, 6, 0.14)",
    blocked: "rgba(26, 22, 18, 0.06)",
  }[project.statusKind];
  const statusColor = {
    done: MOSS,
    "in-progress": ACCENT,
    warn: "#92400e",
    blocked: INK_DIM,
  }[project.statusKind];
  const statusIcon = {
    done: <CheckCircle size={15} weight="fill" />,
    "in-progress": <Hammer size={15} weight="fill" />,
    warn: <Warning size={15} weight="fill" />,
    blocked: <Hourglass size={15} weight="fill" />,
  }[project.statusKind];

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-[1.4fr_auto] gap-4 p-5 rounded-xl border"
      style={{ background: BG_PANEL, borderColor: RULE }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3
            className="text-[17px] sm:text-[18px] font-bold tracking-tight"
            style={{ color: INK, fontFamily: FONT_HEAD }}
          >
            {project.name}
          </h3>
          <span
            className="text-[10px] uppercase tracking-[0.18em] font-bold inline-flex items-center gap-1.5 px-2 py-0.5 rounded"
            style={{
              background: "rgba(45, 74, 53, 0.08)",
              color: MOSS,
              fontFamily: FONT_HEAD,
            }}
          >
            <MapPin size={9} weight="fill" />
            {project.location}
          </span>
        </div>
        <div
          className="text-[12px] uppercase tracking-[0.16em] font-semibold mb-2"
          style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
        >
          {project.type}
        </div>
        <div
          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[12px] font-semibold mb-2"
          style={{
            background: statusBg,
            color: statusColor,
            fontFamily: FONT_HEAD,
          }}
        >
          {statusIcon}
          {project.status}
        </div>
        <div
          className="text-[12px] leading-snug"
          style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
        >
          <span style={{ color: MOSS, fontWeight: 600 }}>→ Next:</span>{" "}
          {project.nextAction}
        </div>
      </div>
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 sm:text-right">
        <div
          className="text-[10px] uppercase tracking-[0.18em] font-semibold"
          style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
        >
          Contract value
        </div>
        <div
          className="text-[20px] sm:text-[22px] font-bold tabular-nums"
          style={{ color: INK, fontFamily: FONT_HEAD }}
        >
          {project.badge}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ review }: { review: (typeof REVIEWS)[number] }) {
  const stateConfig = {
    captured: {
      label: "Captured",
      color: MOSS,
      bg: "rgba(45, 74, 53, 0.10)",
      icon: <CheckCircle size={14} weight="fill" />,
    },
    pending: {
      label: "Scheduled",
      color: ACCENT,
      bg: "rgba(180, 83, 9, 0.10)",
      icon: <Clock size={14} weight="fill" />,
    },
    "never-asked": {
      label: "Never asked",
      color: "#7f1d1d",
      bg: "rgba(127, 29, 29, 0.08)",
      icon: <Warning size={14} weight="fill" />,
    },
  }[review.state];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 px-5 sm:px-6 py-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span
            className="text-[15px] font-bold"
            style={{ color: INK, fontFamily: FONT_HEAD }}
          >
            {review.name}
          </span>
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase tracking-[0.16em] font-bold"
            style={{
              background: stateConfig.bg,
              color: stateConfig.color,
              fontFamily: FONT_HEAD,
            }}
          >
            {stateConfig.icon}
            {stateConfig.label}
          </span>
        </div>
        <div
          className="text-[11px] uppercase tracking-[0.18em] font-semibold mb-1"
          style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
        >
          {review.project}
        </div>
        {review.quote && (
          <p
            className="text-[13px] italic leading-snug mb-1"
            style={{ color: INK, fontFamily: FONT_BODY }}
          >
            &ldquo;{review.quote}&rdquo;
          </p>
        )}
        <div
          className="text-[12px] leading-snug"
          style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
        >
          {review.note}
        </div>
      </div>
      <div className="self-start sm:self-center">
        {review.state === "captured" ? (
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={13}
                weight="fill"
                style={{ color: ACCENT_GOLD }}
              />
            ))}
          </div>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-[11px] uppercase tracking-[0.14em] font-bold transition-opacity hover:opacity-90"
            style={{
              background: MOSS_GRAD,
              color: "#fef6e8",
              fontFamily: FONT_HEAD,
            }}
          >
            {review.state === "pending" ? "Reschedule" : "Send now"}
            <ArrowRight size={11} weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
}

function MissedCallRow({ call }: { call: (typeof MISSED_CALLS)[number] }) {
  return (
    <div
      className="p-5 rounded-xl border relative overflow-hidden"
      style={{
        background: BG_PANEL,
        borderColor: call.won ? MOSS_DIM : RULE,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center justify-center w-9 h-9 rounded-md"
            style={{
              background: call.won
                ? "rgba(45, 74, 53, 0.10)"
                : "rgba(180, 83, 9, 0.10)",
              color: call.won ? MOSS : ACCENT,
            }}
          >
            <PhoneIncoming size={16} weight="duotone" />
          </span>
          <div>
            <div
              className="text-[13px] font-bold"
              style={{ color: INK, fontFamily: FONT_HEAD }}
            >
              {call.number}
            </div>
            <div
              className="text-[11px] uppercase tracking-[0.18em] font-semibold"
              style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
            >
              {call.when} · {call.duration}
            </div>
          </div>
        </div>
        {call.won && (
          <span
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] uppercase tracking-[0.16em] font-bold shrink-0"
            style={{
              background: "rgba(45, 74, 53, 0.10)",
              color: MOSS,
              fontFamily: FONT_HEAD,
            }}
          >
            <CheckCircle size={11} weight="fill" />
            Recovered
          </span>
        )}
      </div>
      {/* Auto-SMS thread mock */}
      <div className="space-y-2 pl-12">
        <div
          className="rounded-lg px-3 py-2 text-[13px] leading-snug"
          style={{
            background: "rgba(45, 74, 53, 0.08)",
            color: INK,
            fontFamily: FONT_BODY,
            maxWidth: "fit-content",
          }}
        >
          <div
            className="text-[10px] uppercase tracking-[0.18em] font-bold mb-1"
            style={{ color: MOSS, fontFamily: FONT_HEAD }}
          >
            <ChatTeardropText size={10} weight="fill" className="inline mr-1" />
            All In One Services
          </div>
          {call.auto}
        </div>
        <div
          className="text-[12px]"
          style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
        >
          <span style={{ color: MOSS, fontWeight: 600 }}>→ Outcome:</span>{" "}
          {call.outcome}
        </div>
      </div>
    </div>
  );
}

function CredentialCard({ cred }: { cred: (typeof CREDENTIALS)[number] }) {
  const urgent = cred.daysUntil < 60;
  const ringPct = Math.max(
    0,
    Math.min(100, ((365 - cred.daysUntil) / 365) * 100)
  );
  return (
    <div
      className="p-5 sm:p-6 rounded-xl border"
      style={{ background: BG_PANEL, borderColor: RULE }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div
            className="text-[10px] uppercase tracking-[0.20em] font-semibold mb-1"
            style={{ color: MOSS, fontFamily: FONT_HEAD }}
          >
            {cred.label}
          </div>
          <div
            className="text-[16px] sm:text-[18px] font-bold tracking-tight font-mono"
            style={{ color: INK, fontFamily: FONT_HEAD }}
          >
            {cred.value}
          </div>
        </div>
        <div
          className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full relative"
          style={{
            background: "conic-gradient(" + MOSS + " " + ringPct + "%, rgba(45, 74, 53, 0.12) " + ringPct + "%)",
          }}
          aria-hidden="true"
        >
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full"
            style={{ background: BG_PANEL, color: MOSS }}
          >
            <ShieldCheck size={14} weight="duotone" />
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div
            className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-1"
            style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
          >
            Last renewed
          </div>
          <div
            className="text-[13px] font-semibold tabular-nums"
            style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
          >
            {cred.renewedAt}
          </div>
        </div>
        <div>
          <div
            className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-1"
            style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
          >
            Next renewal
          </div>
          <div
            className="text-[13px] font-bold tabular-nums"
            style={{
              color: urgent ? ACCENT : INK,
              fontFamily: FONT_HEAD,
            }}
          >
            {cred.nextRenewal} ({cred.daysUntil}d)
          </div>
        </div>
      </div>
      <div
        className="text-[11px] pt-3 border-t"
        style={{
          color: INK_DIM,
          fontFamily: FONT_BODY,
          borderColor: RULE,
        }}
      >
        <span style={{ color: MOSS, fontWeight: 600 }}>Auto-reminder:</span>{" "}
        60 / 30 / 7 days before renewal · {cred.issuer}
      </div>
    </div>
  );
}

function ChangeOrderCard() {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: BG_PANEL, borderColor: RULE }}
    >
      {/* Header bar */}
      <div
        className="px-5 sm:px-6 py-4 border-b flex items-center justify-between gap-3"
        style={{
          borderColor: RULE,
          background: "rgba(45, 74, 53, 0.04)",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center justify-center w-9 h-9 rounded-md"
            style={{ background: "rgba(45, 74, 53, 0.12)", color: MOSS }}
          >
            <PenNib size={16} weight="duotone" />
          </span>
          <div>
            <div
              className="text-[14px] font-bold"
              style={{ color: INK, fontFamily: FONT_HEAD }}
            >
              CO-2026-014 · 710 Del Guzzi Drive
            </div>
            <div
              className="text-[11px] uppercase tracking-[0.16em] font-semibold"
              style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
            >
              Sent to homeowner · 3 days ago
            </div>
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] uppercase tracking-[0.16em] font-bold"
          style={{
            background: "rgba(180, 83, 9, 0.14)",
            color: "#92400e",
            fontFamily: FONT_HEAD,
          }}
        >
          <Clock size={11} weight="fill" />
          Awaiting signature
        </span>
      </div>

      {/* Body — line items + total */}
      <div className="px-5 sm:px-6 py-5">
        <div
          className="text-[11px] uppercase tracking-[0.18em] font-semibold mb-3"
          style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
        >
          Scope addition
        </div>
        <ul
          className="space-y-2 text-[13px] leading-snug mb-5"
          style={{ color: INK, fontFamily: FONT_BODY }}
        >
          <li className="flex items-start gap-2">
            <CaretRight size={12} weight="bold" style={{ color: MOSS, marginTop: 4 }} />
            <span>
              <strong>Heated tile floor</strong> — Schluter Ditra-Heat
              system, full bath footprint (52 sq ft) ·{" "}
              <span className="tabular-nums">$3,200</span>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CaretRight size={12} weight="bold" style={{ color: MOSS, marginTop: 4 }} />
            <span>
              <strong>Frameless glass shower upgrade</strong> — swap
              sliding doors for ½&apos; tempered glass + matte-black
              hardware · <span className="tabular-nums">$3,850</span>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CaretRight size={12} weight="bold" style={{ color: MOSS, marginTop: 4 }} />
            <span>
              <strong>Electrical sub re-route</strong> for heated floor
              dedicated circuit · 4 labor-hours ·{" "}
              <span className="tabular-nums">$680</span>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CaretRight size={12} weight="bold" style={{ color: MOSS, marginTop: 4 }} />
            <span>
              <strong>Permit amendment fee</strong> (Clallam County) ·{" "}
              <span className="tabular-nums">$170</span>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CaretRight size={12} weight="bold" style={{ color: MOSS, marginTop: 4 }} />
            <span>
              <strong>Timeline impact</strong>: +5 working days
            </span>
          </li>
        </ul>
        <div
          className="flex items-center justify-between pt-4 border-t"
          style={{ borderColor: RULE }}
        >
          <div
            className="text-[12px] uppercase tracking-[0.18em] font-semibold"
            style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
          >
            Change-order total
          </div>
          <div
            className="text-[22px] sm:text-[24px] font-bold tabular-nums"
            style={{ color: INK, fontFamily: FONT_HEAD }}
          >
            $7,900.00
          </div>
        </div>
      </div>

      {/* Footer — homeowner action mock */}
      <div
        className="px-5 sm:px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3"
        style={{
          background: "rgba(45, 74, 53, 0.04)",
          borderColor: RULE,
        }}
      >
        <div
          className="text-[12px] inline-flex items-center gap-2"
          style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
        >
          <EnvelopeSimple size={13} weight="fill" style={{ color: MOSS }} />
          Auto-reminder tomorrow at 9 a.m. · then again Friday
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-[12px] uppercase tracking-[0.14em] font-semibold transition-opacity hover:opacity-70"
            style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
          >
            View PDF
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-md text-[11px] uppercase tracking-[0.14em] font-bold transition-opacity hover:opacity-90"
            style={{
              background: MOSS_GRAD,
              color: "#fef6e8",
              fontFamily: FONT_HEAD,
            }}
          >
            Send reminder now
            <ArrowRight size={11} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
