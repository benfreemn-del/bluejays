/* eslint-disable @next/next/no-img-element -- Static marketing page; only photo we use is the open-graph hero, served from a CDN. */

/**
 * /clients/riv-inc — RIV Inc. / CibusCloud (B2B food-supply-chain SaaS).
 *
 * Bespoke premium showcase for inbound audit lead. Founded by Ikkei
 * Uemura (CEO) and Arjun Sharma (COO) — Tokyo-based, building
 * CibusCloud, a SaaS platform that auto-collects food traceability
 * data from SAP / QuickBooks / Google Forms.
 *
 * Visual language: SaaS-premium, modeled after Linear / Stripe /
 * Vercel — dark navy-charcoal base, electric mint accent (#7af0d4),
 * grid background, dashboard mockups rendered as pure CSS (no real
 * dashboard photos exist on the live site — they ship lazy-loaded
 * placeholders only). Big tracked-tight headlines.
 *
 * To wire as the prospect's preview URL:
 *   update prospects set
 *     pricing_tier = 'custom',
 *     custom_site_url = '/clients/riv-inc'
 *   where current_website ilike '%riv-inc.jp%'
 *      or email ilike 'ikkei@riv-inc.jp';
 */

import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  Sparkle,
  Plugs,
  Stack,
  Globe,
  ShieldCheck,
  Lightning,
  Database,
  Eye,
  ArrowsClockwise,
  Cpu,
  Buildings,
  Translate,
  Code,
  CaretRight,
} from "@phosphor-icons/react/dist/ssr";

import StickyNav from "./sticky-nav";
import InquiryForm from "@/components/clients/InquiryForm";

/* ───────────────────────── BUSINESS ───────────────────────── */
const BUSINESS = {
  name: "RIV Inc.",
  product: "CibusCloud",
  legalName: "株式会社RIV",
  tagline: "The most connected platform in food supply chain",
  email: "info@riv-inc.jp",
  emailHref: "mailto:info@riv-inc.jp",
  hq: "Tokyo, Japan",
  founders: {
    ikkei: {
      name: "Ikkei Uemura",
      role: "CEO & Co-founder",
      bio: "Ex-engineer with 3 years operating inside the F&B industry. Started CibusCloud after watching food safety teams hand-key the same lot data into four different systems every week.",
      initials: "IU",
    },
    arjun: {
      name: "Arjun Sharma",
      role: "COO & Co-founder",
      bio: "Speaks three languages and runs international operations. Bridges Japanese suppliers, US distributors, and EU compliance frameworks under one trace standard.",
      initials: "AS",
    },
  },
  integrations: ["SAP", "QuickBooks", "Google Forms", "Salesforce", "NetSuite", "Excel"],
} as const;

/* ───────────────────────── PALETTE ─────────────────────────
 * INK         — base background, near-black with a violet undertone
 * INK_SOFT    — second-tier surface (cards, mockups)
 * INK_HAIRLINE— hairline borders (white/[0.06] equivalent)
 * MINT        — primary accent, calm-electric
 * MINT_DEEP   — accent shadow / hover state
 * IVORY       — ivory copy on dark
 */
const INK = "#070a13";
const INK_SOFT = "#0e1322";
const INK_CARD = "#10182b";
const MINT = "#7af0d4";
const MINT_DEEP = "#3aa890";
const IVORY = "#f5f5f0";

/* ───────────────────────── GRID BACKDROP ─────────────────────────
 * Pure CSS faint grid lines. Used as the hero / pricing backdrop. */
function GridBackdrop({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={"absolute inset-0 opacity-[0.18] " + className}
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        maskImage:
          "radial-gradient(ellipse at top, rgba(0,0,0,0.7) 0%, transparent 70%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at top, rgba(0,0,0,0.7) 0%, transparent 70%)",
      }}
    />
  );
}

/* ───────────────────────── EYEBROW ───────────────────────── */
function Eyebrow({
  children,
  color = MINT,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.32em]"
      style={{ color }}
    >
      <span className="inline-block w-6 h-px" style={{ background: color }} />
      {children}
    </div>
  );
}

/* ───────────────────────── DASHBOARD MOCKUP ─────────────────────────
 * Pure-CSS rendering of CibusCloud's pitched-but-not-yet-shippable
 * traceability dashboard. Used in place of a real product screenshot.
 * Shows: live status row, 3 KPI tiles, lot trace strip, and a small
 * activity log. */
function TraceDashboardMockup() {
  return (
    <div
      className="relative rounded-xl overflow-hidden border shadow-2xl"
      style={{ background: INK_CARD, borderColor: "rgba(255,255,255,0.06)" }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b text-[11px] text-white/55 font-medium tracking-tight"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
        </span>
        <span className="ml-2 font-mono text-[10px] tracking-tight text-white/40">
          cibuscloud · Trace Dashboard
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] text-emerald-300/90">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live · sync 12s ago
        </span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3 p-4">
        {[
          { label: "Lots traced", value: "12,847", trend: "+8.2%", icon: Database },
          { label: "Compliance", value: "99.4%", trend: "+0.6%", icon: ShieldCheck },
          { label: "Avg trace time", value: "1.8s", trend: "-22%", icon: Lightning },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="rounded-lg p-3 border"
              style={{
                background: "rgba(255,255,255,0.025)",
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] tracking-[0.22em] uppercase text-white/45 font-semibold">
                  {k.label}
                </span>
                <Icon size={12} weight="bold" className="text-[#7af0d4]" />
              </div>
              <div className="text-[18px] font-bold tabular-nums tracking-tight text-white">
                {k.value}
              </div>
              <div className="text-[10px] font-bold text-emerald-300 mt-0.5">
                {k.trend}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lot trace path */}
      <div className="px-4 pb-3">
        <div className="text-[9px] tracking-[0.22em] uppercase text-white/45 font-semibold mb-2">
          Lot · LT-2025-08-117
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-white/70">
          {[
            { label: "Farm 04", color: "#7af0d4" },
            { label: "Pack", color: "#7af0d4" },
            { label: "Cold-chain", color: "#7af0d4" },
            { label: "Distrib", color: "#7af0d4" },
            { label: "Retailer", color: "rgba(255,255,255,0.35)" },
          ].map((s, i, arr) => (
            <div key={s.label} className="flex items-center gap-1 flex-1">
              <span
                className="px-2 py-1 rounded font-bold text-[9px] flex-1 text-center truncate"
                style={{
                  background:
                    s.color === "#7af0d4"
                      ? "rgba(122,240,212,0.12)"
                      : "rgba(255,255,255,0.04)",
                  color: s.color,
                  border:
                    s.color === "#7af0d4"
                      ? "1px solid rgba(122,240,212,0.25)"
                      : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {s.label}
              </span>
              {i < arr.length - 1 && (
                <CaretRight size={10} weight="bold" className="text-white/30" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Activity log */}
      <div
        className="px-4 py-3 border-t text-[10px] font-mono space-y-1"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        {[
          { time: "12:04:08", src: "SAP", msg: "Lot LT-117 received from Farm 04", ok: true },
          { time: "12:03:51", src: "QuickBooks", msg: "Invoice #88410 reconciled", ok: true },
          { time: "12:03:22", src: "Google Forms", msg: "Cold-chain temp log submitted", ok: true },
        ].map((row) => (
          <div key={row.time} className="flex items-center gap-3 text-white/55">
            <span className="text-white/30 w-16 shrink-0">{row.time}</span>
            <span
              className="px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase shrink-0"
              style={{
                background: "rgba(122,240,212,0.1)",
                color: "#7af0d4",
              }}
            >
              {row.src}
            </span>
            <span className="truncate">{row.msg}</span>
            <CheckCircle
              size={11}
              weight="fill"
              className="ml-auto text-emerald-400/80 shrink-0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── INTEGRATION GLYPH ─────────────────────────
 * Stylized monogram tiles for SAP / QuickBooks / etc. Lets the
 * "connect your favorite tools" section feel concrete without us
 * shipping unauthorized brand logos. */
function IntegrationTile({
  name,
  initials,
}: {
  name: string;
  initials: string;
}) {
  return (
    <div
      className="group relative aspect-[4/3] rounded-xl border flex flex-col items-center justify-center gap-2 hover:border-[#7af0d4]/40 transition"
      style={{
        background: "rgba(255,255,255,0.02)",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="w-10 h-10 rounded-md flex items-center justify-center text-[14px] font-black tracking-tight transition group-hover:scale-110"
        style={{
          background: "linear-gradient(135deg, #1a2236 0%, #0e1322 100%)",
          color: "#7af0d4",
          border: "1px solid rgba(122,240,212,0.18)",
        }}
      >
        {initials}
      </div>
      <span className="text-[11px] tracking-tight font-medium text-white/65">
        {name}
      </span>
    </div>
  );
}

/* ───────────────────────── PRICING TIER ───────────────────────── */
type PricingTier = {
  name: string;
  blurb: string;
  features: string[];
  cta: string;
  featured?: boolean;
};
function PricingCard({ tier }: { tier: PricingTier }) {
  return (
    <article
      className={
        "relative rounded-xl p-7 lg:p-8 flex flex-col border transition " +
        (tier.featured ? "shadow-[0_0_60px_rgba(122,240,212,0.12)]" : "")
      }
      style={{
        background: tier.featured
          ? "linear-gradient(180deg, rgba(122,240,212,0.04) 0%, rgba(255,255,255,0.02) 100%)"
          : "rgba(255,255,255,0.02)",
        borderColor: tier.featured
          ? "rgba(122,240,212,0.25)"
          : "rgba(255,255,255,0.07)",
      }}
    >
      {tier.featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 bg-[#7af0d4] text-[#070a13] text-[9px] font-extrabold tracking-[0.22em] uppercase px-3 py-1 rounded-full">
          <Sparkle size={10} weight="fill" />
          Most popular
        </div>
      )}
      <h3 className="text-[20px] font-bold tracking-tight text-white">
        {tier.name}
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-white/55">
        {tier.blurb}
      </p>
      <div className="mt-6 mb-6 flex items-baseline gap-2">
        <span className="text-[34px] font-black tracking-tighter text-white">
          —
        </span>
        <span className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#7af0d4]">
          Coming soon
        </span>
      </div>
      <ul className="space-y-2.5 flex-1 mb-7">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[13px] text-white/75">
            <CheckCircle
              size={14}
              weight="fill"
              className="mt-0.5 shrink-0 text-[#7af0d4]"
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <a
        href="#contact"
        className={
          "mt-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-[12px] font-bold tracking-tight rounded-md transition cursor-pointer " +
          (tier.featured
            ? "bg-[#7af0d4] text-[#070a13] hover:bg-white"
            : "border border-white/15 text-white hover:bg-white/5")
        }
      >
        {tier.cta}
        <ArrowRight size={13} weight="bold" />
      </a>
    </article>
  );
}

/* ───────────────────────── PAGE ───────────────────────── */
export default function RivIncPage() {
  return (
    <main
      id="top"
      className="min-h-screen text-white antialiased"
      style={{ background: INK }}
    >
      <StickyNav businessName={BUSINESS.legalName} />

      {/* ─────────────── HERO ─────────────── */}
      <section className="relative overflow-hidden">
        <GridBackdrop />
        {/* Mint glow bottom-left */}
        <div
          aria-hidden
          className="absolute -bottom-32 -left-32 w-[640px] h-[640px] rounded-full opacity-25 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(122,240,212,0.55) 0%, transparent 70%)",
          }}
        />
        {/* Violet glow top-right */}
        <div
          aria-hidden
          className="absolute -top-32 -right-32 w-[560px] h-[560px] rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(110,90,255,0.5) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              <Eyebrow>Scale your business with CibusCloud</Eyebrow>
              <h1 className="mt-7 text-[44px] sm:text-6xl lg:text-[80px] font-black uppercase leading-[0.95] tracking-tighter">
                The most connected
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #7af0d4 0%, #5fd6c0 50%, #b48bff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  platform in
                </span>{" "}
                food supply chain.
              </h1>
              <p className="mt-8 max-w-2xl text-base lg:text-lg leading-relaxed text-white/65">
                CibusCloud brings trust and transparency to food transactions
                worldwide. Real-time traceability, lot-level history, and
                native integrations with SAP, QuickBooks, and the tools your
                team already runs on — so you stay compliant without the
                spreadsheet sprawl.
              </p>
              <div className="mt-10 flex flex-wrap gap-3 items-center">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 bg-[#7af0d4] text-[#070a13] px-6 py-3.5 text-[13px] font-bold tracking-tight rounded-md hover:bg-white transition group"
                >
                  Contact sales
                  <ArrowRight
                    size={14}
                    weight="bold"
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </a>
                <a
                  href="#product"
                  className="inline-flex items-center gap-2 border border-white/15 text-white px-6 py-3.5 text-[13px] font-bold tracking-tight rounded-md hover:bg-white/5 transition"
                >
                  How it works
                </a>
              </div>

              {/* Stat row */}
              <div className="mt-14 grid grid-cols-3 gap-6 max-w-2xl border-t border-white/10 pt-7">
                <div>
                  <div className="text-2xl lg:text-3xl font-black tracking-tighter text-white">
                    Real-time
                  </div>
                  <div className="text-[10px] tracking-[0.22em] uppercase text-white/45 font-semibold mt-1">
                    Trace data
                  </div>
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-black tracking-tighter text-white">
                    Lot-level
                  </div>
                  <div className="text-[10px] tracking-[0.22em] uppercase text-white/45 font-semibold mt-1">
                    Granularity
                  </div>
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-black tracking-tighter text-white">
                    Tokyo · Global
                  </div>
                  <div className="text-[10px] tracking-[0.22em] uppercase text-white/45 font-semibold mt-1">
                    HQ · Reach
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <TraceDashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── PRODUCT STORY ─────────────── */}
      <section
        id="product"
        className="relative py-24 lg:py-32 border-t"
        style={{
          borderColor: "rgba(255,255,255,0.05)",
          background: INK_SOFT,
        }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end mb-14">
            <div className="lg:col-span-7">
              <Eyebrow>Product story</Eyebrow>
              <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.96]">
                Streamline food safety operations
                <br />
                <span style={{ color: MINT }}>
                  no more manual traceability work.
                </span>
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-base lg:text-lg leading-relaxed text-white/65">
                CibusCloud connects tools like SAP, QuickBooks, and Google
                Forms to automatically collect and centralize food
                traceability data. By integrating upstream and downstream
                information in real time, it helps you stay compliant, reduce
                errors, and eliminate time-consuming manual work — all in
                one place.
              </p>
            </div>
          </div>

          {/* Before / After contrast strip */}
          <div className="grid md:grid-cols-2 gap-5">
            <div
              className="rounded-2xl p-7 lg:p-9 border"
              style={{
                background: "rgba(220,80,80,0.03)",
                borderColor: "rgba(220,80,80,0.18)",
              }}
            >
              <div className="text-[10px] tracking-[0.32em] uppercase font-bold text-rose-300/80 mb-4">
                Without CibusCloud
              </div>
              <ul className="space-y-3 text-[14px] leading-relaxed text-white/70">
                {[
                  "Trace data scattered across 4–6 disconnected systems",
                  "Compliance teams hand-key the same lot info weekly",
                  "Audits take days to assemble — paper, PDFs, spreadsheets",
                  "Recalls drag on for hours while you trace lot ancestry",
                ].map((s) => (
                  <li key={s} className="flex items-start gap-2.5">
                    <span
                      className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: "rgb(252,165,165)" }}
                    />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-2xl p-7 lg:p-9 border"
              style={{
                background: "rgba(122,240,212,0.04)",
                borderColor: "rgba(122,240,212,0.25)",
              }}
            >
              <div className="text-[10px] tracking-[0.32em] uppercase font-bold text-[#7af0d4] mb-4">
                With CibusCloud
              </div>
              <ul className="space-y-3 text-[14px] leading-relaxed text-white">
                {[
                  "One dashboard. Every lot. Live.",
                  "Auto-sync from SAP, QuickBooks, Forms — no double entry",
                  "Audit-ready exports in seconds, not days",
                  "Recall-trace finishes before you finish the email",
                ].map((s) => (
                  <li key={s} className="flex items-start gap-2.5">
                    <CheckCircle
                      size={14}
                      weight="fill"
                      className="mt-1 shrink-0 text-[#7af0d4]"
                    />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── 3 FEATURE PILLARS ─────────────── */}
      <section id="features" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-3xl mb-16">
            <Eyebrow>Features</Eyebrow>
            <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.96]">
              Built for the realities of
              <br />
              <span style={{ color: MINT }}>food traceability.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                tag: "Visibility",
                title: "Real-time traceability insights",
                body: "Track compliance, performance, and traceability completeness across all operations with an intuitive, centralized dashboard.",
                icon: Eye,
              },
              {
                tag: "Integration",
                title: "Connect your favorite tools instantly",
                body: "CibusCloud plugs into the systems your team already runs — SAP, QuickBooks, Google Forms, Salesforce, NetSuite — with no rip-and-replace.",
                icon: Plugs,
              },
              {
                tag: "Lot history",
                title: "Lot-level trace history at a glance",
                body: "Pull the full ancestry of any lot — farm of origin, pack date, cold-chain handoffs, distributor, retailer — in seconds, not days.",
                icon: Stack,
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <article
                  id={i === 1 ? "integrations" : undefined}
                  key={f.tag}
                  className="group relative rounded-2xl p-7 lg:p-8 border flex flex-col"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center mb-6"
                    style={{
                      background: "rgba(122,240,212,0.1)",
                      border: "1px solid rgba(122,240,212,0.25)",
                    }}
                  >
                    <Icon size={20} weight="bold" className="text-[#7af0d4]" />
                  </div>
                  <div className="text-[10px] tracking-[0.28em] uppercase font-bold text-[#7af0d4] mb-3">
                    {f.tag}
                  </div>
                  <h3 className="text-[20px] font-bold tracking-tight leading-snug text-white mb-3">
                    {f.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-white/60">
                    {f.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────── INTEGRATIONS SECTION ─────────────── */}
      <section
        className="relative py-24 lg:py-32 border-t border-b"
        style={{
          borderColor: "rgba(255,255,255,0.05)",
          background: INK_SOFT,
        }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center mb-16">
            <div className="lg:col-span-6">
              <Eyebrow>Native integrations</Eyebrow>
              <h2 className="mt-6 text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-[0.96]">
                Plug in once.
                <br />
                <span style={{ color: MINT }}>Trace forever.</span>
              </h2>
            </div>
            <div className="lg:col-span-6">
              <p className="text-base lg:text-lg leading-relaxed text-white/65">
                CibusCloud was built to live alongside the stack your team
                already trusts — not replace it. Connect your ERP, your
                accounting suite, your shop-floor forms, and we'll keep the
                trace data flowing in real time, automatically.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
            {[
              { name: "SAP", initials: "SAP" },
              { name: "QuickBooks", initials: "QB" },
              { name: "Google Forms", initials: "GF" },
              { name: "Salesforce", initials: "SF" },
              { name: "NetSuite", initials: "NS" },
              { name: "Excel", initials: "XL" },
            ].map((tile) => (
              <IntegrationTile key={tile.name} {...tile} />
            ))}
          </div>

          {/* Inline architecture diagram */}
          <div
            className="mt-14 rounded-2xl p-7 lg:p-10 border"
            style={{
              background: "rgba(255,255,255,0.02)",
              borderColor: "rgba(255,255,255,0.07)",
            }}
          >
            <div className="grid lg:grid-cols-3 gap-8 items-center">
              <div className="text-center">
                <div className="text-[10px] tracking-[0.28em] uppercase text-white/45 font-bold mb-3">
                  Source systems
                </div>
                <div className="space-y-2">
                  {["SAP", "QuickBooks", "Google Forms"].map((s) => (
                    <div
                      key={s}
                      className="rounded-lg px-3 py-2 text-[12px] font-bold text-white/75 border"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        borderColor: "rgba(255,255,255,0.07)",
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <ArrowsClockwise
                  size={28}
                  weight="bold"
                  className="text-[#7af0d4] mb-2"
                />
                <div
                  className="rounded-lg px-5 py-3 font-bold text-[13px] tracking-tight"
                  style={{
                    background: "linear-gradient(135deg, rgba(122,240,212,0.15) 0%, rgba(180,139,255,0.1) 100%)",
                    border: "1px solid rgba(122,240,212,0.3)",
                    color: "#7af0d4",
                  }}
                >
                  CibusCloud · Sync engine
                </div>
                <div className="mt-2 text-[10px] text-white/40 tracking-tight">
                  Real-time · bi-directional
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] tracking-[0.28em] uppercase text-white/45 font-bold mb-3">
                  Outputs
                </div>
                <div className="space-y-2">
                  {["Trace dashboard", "Compliance exports", "Recall lookups"].map((s) => (
                    <div
                      key={s}
                      className="rounded-lg px-3 py-2 text-[12px] font-bold text-white border"
                      style={{
                        background: "rgba(122,240,212,0.05)",
                        borderColor: "rgba(122,240,212,0.2)",
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── PRICING ─────────────── */}
      <section id="pricing" className="relative py-24 lg:py-32 overflow-hidden">
        <GridBackdrop className="!opacity-[0.1]" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.96]">
              Simple plans.
              <br />
              <span style={{ color: MINT }}>Built to scale with you.</span>
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-white/60">
              CibusCloud launches publicly soon. Reach out via the demo form
              below to lock early-adopter pricing for your facility.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                blurb: "For single-facility producers ready to ditch spreadsheet traceability.",
                features: [
                  "Up to 1,000 traced lots / month",
                  "2 source-system integrations",
                  "Real-time trace dashboard",
                  "Audit-ready exports",
                ],
                cta: "Get on the list",
              },
              {
                name: "Sponsor",
                blurb: "For growing F&B brands integrating across multiple sites.",
                features: [
                  "Up to 25,000 traced lots / month",
                  "Unlimited integrations",
                  "Compliance + recall workspace",
                  "AI chat — natural-language trace queries",
                  "Priority onboarding",
                ],
                cta: "Talk to sales",
                featured: true,
              },
              {
                name: "Cost",
                blurb: "Custom-priced for distributors, networks, and enterprise food groups.",
                features: [
                  "Unlimited lots & sites",
                  "SSO + role-based permissions",
                  "Dedicated success engineer",
                  "Custom integrations & SLAs",
                  "On-prem option available",
                ],
                cta: "Custom quote",
              },
            ].map((t) => (
              <PricingCard key={t.name} tier={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── TEAM ─────────────── */}
      <section
        id="team"
        className="relative py-24 lg:py-32 border-t"
        style={{
          borderColor: "rgba(255,255,255,0.05)",
          background: INK_SOFT,
        }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-3xl mb-14">
            <Eyebrow>Our team</Eyebrow>
            <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.96]">
              Engineers who lived
              <br />
              <span style={{ color: MINT }}>the trace problem.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                ...BUSINESS.founders.ikkei,
                accent: "linear-gradient(135deg, #7af0d4 0%, #5fd6c0 100%)",
                tagIcon: Cpu,
                tagLabel: "F&B + Engineering",
              },
              {
                ...BUSINESS.founders.arjun,
                accent: "linear-gradient(135deg, #b48bff 0%, #8d6cd9 100%)",
                tagIcon: Translate,
                tagLabel: "International ops",
              },
            ].map((f) => {
              const TagIcon = f.tagIcon;
              return (
                <article
                  key={f.name}
                  className="group rounded-2xl p-7 lg:p-9 border flex flex-col"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex items-start gap-5">
                    {/* Initials avatar — no real headshot exists in the
                        riv-inc CDN; the live site uses placeholder SVGs. */}
                    <div
                      aria-hidden
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-[20px] font-black tracking-tight text-[#070a13] shrink-0"
                      style={{ background: f.accent }}
                    >
                      {f.initials}
                    </div>
                    <div>
                      <div className="text-[11px] tracking-[0.28em] uppercase font-bold text-[#7af0d4]">
                        {f.role}
                      </div>
                      <h3 className="mt-1 text-2xl lg:text-3xl font-black tracking-tight text-white">
                        {f.name}
                      </h3>
                      <div
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-tight border"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          borderColor: "rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.7)",
                        }}
                      >
                        <TagIcon size={10} weight="bold" />
                        {f.tagLabel}
                      </div>
                    </div>
                  </div>
                  <p className="mt-6 text-[14px] leading-relaxed text-white/65">
                    {f.bio}
                  </p>
                </article>
              );
            })}
          </div>

          {/* Trust strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Globe, label: "Global supply networks" },
              { icon: ShieldCheck, label: "Compliance-first" },
              { icon: Buildings, label: "Tokyo HQ" },
              { icon: Code, label: "API-native" },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.label}
                  className="rounded-xl p-4 border flex items-center gap-3"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  <Icon size={16} weight="bold" className="text-[#7af0d4] shrink-0" />
                  <span className="text-[12px] font-medium text-white/70">
                    {t.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────── DEMO REQUEST FORM ─────────────── */}
      <section
        id="contact"
        className="relative py-24 lg:py-32 overflow-hidden"
      >
        <GridBackdrop className="!opacity-[0.08]" />
        {/* Mint glow */}
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(122,240,212,0.5) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow>Talk to sales</Eyebrow>
              <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.95]">
                Request a
                <br />
                <span style={{ color: MINT }}>free demo.</span>
              </h2>
              <p className="mt-7 text-[15px] leading-relaxed text-white/65 max-w-md">
                If you&apos;re considering implementing our service, feel free
                to contact us. Ikkei or Arjun will personally walk you through
                CibusCloud and how it fits with your existing stack.
              </p>

              <div className="mt-10 space-y-4 max-w-sm">
                <a
                  href={BUSINESS.emailHref}
                  className="flex items-center gap-3 rounded-xl border p-4 hover:border-[#7af0d4]/40 transition group"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: "rgba(122,240,212,0.1)",
                      border: "1px solid rgba(122,240,212,0.25)",
                    }}
                  >
                    <Globe size={16} weight="bold" className="text-[#7af0d4]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] tracking-[0.22em] uppercase text-white/45 font-bold">
                      Email
                    </div>
                    <div className="text-[14px] font-bold text-white truncate">
                      {BUSINESS.email}
                    </div>
                  </div>
                  <ArrowUpRight
                    size={14}
                    weight="bold"
                    className="ml-auto text-white/40 group-hover:text-[#7af0d4] transition"
                  />
                </a>
                <div
                  className="flex items-center gap-3 rounded-xl border p-4"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: "rgba(180,139,255,0.1)",
                      border: "1px solid rgba(180,139,255,0.25)",
                    }}
                  >
                    <Buildings
                      size={16}
                      weight="bold"
                      className="text-[#b48bff]"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.22em] uppercase text-white/45 font-bold">
                      HQ
                    </div>
                    <div className="text-[14px] font-bold text-white">
                      {BUSINESS.legalName} · {BUSINESS.hq}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div
                className="rounded-2xl border p-6 sm:p-9"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                <InquiryForm
                  slug="riv-inc"
                  accent={MINT}
                  accentDeep={MINT_DEEP}
                  panelBg="transparent"
                  ink={IVORY}
                  inkSoft="rgba(245,245,240,0.55)"
                  fields={[
                    {
                      type: "text",
                      name: "name",
                      label: "Your name",
                      placeholder: "First and last",
                      required: true,
                    },
                    {
                      type: "email",
                      name: "email",
                      label: "Work email",
                      placeholder: "you@company.com",
                      required: true,
                    },
                    {
                      type: "text",
                      name: "company",
                      label: "Company name",
                      placeholder: "Your company / facility",
                      required: true,
                    },
                    {
                      type: "tel",
                      name: "phone",
                      label: "Phone (optional)",
                      placeholder: "+81 (0) 90-0000-0000",
                    },
                    {
                      type: "select",
                      name: "role",
                      label: "Your role",
                      options: [
                        { value: "", label: "— Select —" },
                        { value: "ops", label: "Operations / Compliance" },
                        { value: "engineering", label: "Engineering / IT" },
                        { value: "executive", label: "Executive / Founder" },
                        { value: "supply-chain", label: "Supply chain" },
                        { value: "other", label: "Other" },
                      ],
                    },
                    {
                      type: "radio",
                      name: "intent",
                      label: "What's bringing you to RIV?",
                      full: true,
                      options: [
                        {
                          value: "trial",
                          label: "Free demo",
                          description: "See CibusCloud live with a member of the team",
                        },
                        {
                          value: "evaluation",
                          label: "Evaluation for our facility",
                          description: "We're shortlisting traceability platforms",
                        },
                        {
                          value: "integration",
                          label: "Integration question",
                          description: "Curious if CibusCloud talks to our stack",
                        },
                        {
                          value: "partner",
                          label: "Partnership",
                          description: "Distributor, integrator, or co-sell",
                        },
                      ],
                    },
                    {
                      type: "textarea",
                      name: "message",
                      label: "Anything we should know?",
                      placeholder:
                        "Facility size, current systems, pain points, timeline — whatever's helpful.",
                      full: true,
                    },
                  ]}
                  submitLabel="Submit"
                  successHeading="Got it — we'll be in touch."
                  successBody="Thanks for reaching out to RIV Inc. Ikkei or Arjun will personally reply within one business day."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer
        className="relative py-12 border-t"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          background: INK,
        }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid sm:grid-cols-3 gap-8 items-center">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-flex items-center justify-center w-9 h-9 rounded-md font-black text-[14px] text-[#070a13]"
              style={{
                background:
                  "linear-gradient(135deg, #7af0d4 0%, #5fd6c0 50%, #3aa890 100%)",
              }}
            >
              R
            </span>
            <div className="leading-tight">
              <div className="text-[14px] font-bold text-white">
                {BUSINESS.legalName}
              </div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-white/40 font-semibold">
                {BUSINESS.product}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 text-[12px] text-white/55">
            <a href="#product" className="hover:text-white transition">
              Product
            </a>
            <a href="#features" className="hover:text-white transition">
              Features
            </a>
            <a href="#pricing" className="hover:text-white transition">
              Pricing
            </a>
            <a href="#team" className="hover:text-white transition">
              Team
            </a>
          </div>

          <div className="text-[11px] text-white/40 sm:text-right">
            ©︎ 2026 {BUSINESS.legalName} · All rights reserved
          </div>
        </div>
      </footer>
    </main>
  );
}
