"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * /clients/peninsula-paving/portal-demo
 *
 * Dark comprehensive admin mockup for Cyril & Ella Frick. Built
 * 2026-05-18 to AIOS-equal quality per Ben's "make sure Peninsula
 * Paving has one of equal quality custom to their business" brief.
 *
 * Follows the bespoke-client-template playbook (8-tab dark admin
 * pattern) but every byte tailored to paving + excavating: tons
 * of asphalt poured, sealcoat gallons, weather-window scheduling,
 * fleet status, paving-specific KPIs, real Sequim/Olympic Peninsula
 * pain points.
 *
 * Gate: 1212 (rotate to revoke). Re-hydrates from sessionStorage
 * so a sales-call refresh doesn't kick out of the demo mid-pitch.
 *
 * Pattern reference: bluejays/docs/playbooks/bespoke-client-template.md
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  LockKey,
  Sparkle,
  Phone,
  CheckCircle,
  Clock,
  Warning,
  Star,
  Certificate,
  ShieldCheck,
  Calendar,
  Hourglass,
  CaretRight,
  PhoneIncoming,
  ChatTeardropText,
  EnvelopeSimple,
  PenNib,
  Truck,
  Path,
  Drop,
  Crosshair,
  Users,
  GearSix,
  Bell,
  FileText,
  CurrencyDollar,
  ListChecks,
  Funnel,
  Gauge,
  Plus,
  Eye,
  Download,
  Lightning,
  TrendUp,
  TrendDown,
  CircleDashed,
  CloudSun,
  Sun,
  Wrench,
} from "@phosphor-icons/react";

// Gate
const GATE_CODE = "1212";

/* ─────────────────────────  DARK ADMIN PALETTE  ──────────────────────── */
/* Same dark surface tokens as AIOS portal (BlueJays admin pattern).
 * Industry accent flipped from MOSS (GC) to ORANGE (paving): matches
 * the marketing-site orange/yellow brand. COPPER held as the upgrade
 * tier color for AI System "buy now" moments. */
const BG = "#0a0a0a";
const SURFACE = "#141414";
const SURFACE_RAISED = "#1c1c1c";
const SURFACE_HEADER = "#0f0f0f";
const BORDER = "#2a2a2a";
const BORDER_SOFT = "#1f1f1f";
const TEXT = "#fafafa";
const TEXT_SOFT = "rgba(250, 250, 250, 0.72)";
const TEXT_DIM = "rgba(250, 250, 250, 0.48)";
const TEXT_FAINT = "rgba(250, 250, 250, 0.30)";

// Industry accent: SUNSET ORANGE (matches Peninsula Paving marketing)
const ORANGE = "#fb923c";          // orange-400 bright on dark
const ORANGE_DEEP = "#ea580c";     // brand primary
const ORANGE_DIM = "rgba(251, 146, 60, 0.20)";
const ORANGE_GRAD = `linear-gradient(135deg, #fbbf24 0%, #fb923c 55%, #ea580c 100%)`;

// Upgrade tier: COPPER for "AI System" moments (same as AIOS)
const COPPER = "#d97706";
const COPPER_GOLD = "#fbbf24";
const COPPER_DIM = "rgba(217, 119, 6, 0.22)";
const COPPER_GRAD = `linear-gradient(135deg, ${COPPER_GOLD} 0%, ${COPPER} 100%)`;

// Status tones
const RED = "#ef4444";
const RED_DIM = "rgba(239, 68, 68, 0.18)";
const BLUE = "#3b82f6";
const BLUE_DIM = "rgba(59, 130, 246, 0.18)";
const GREEN = "#10b981";
const GREEN_DIM = "rgba(16, 185, 129, 0.18)";

const FONT_HEAD = "'Space Grotesk', sans-serif";
const FONT_BODY = "'Inter', sans-serif";

/* ─────────────────────────  MOCK DATA  ──────────────────────── */

type TabId =
  | "overview"
  | "jobs"
  | "leads"
  | "reviews"
  | "schedule"
  | "invoices"
  | "credentials"
  | "settings";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <Gauge size={14} weight="duotone" /> },
  { id: "jobs", label: "Jobs", icon: <Truck size={14} weight="duotone" /> },
  { id: "leads", label: "Leads", icon: <Funnel size={14} weight="duotone" /> },
  { id: "reviews", label: "Reviews", icon: <Star size={14} weight="duotone" /> },
  { id: "schedule", label: "Schedule", icon: <Calendar size={14} weight="duotone" /> },
  { id: "invoices", label: "Invoices", icon: <FileText size={14} weight="duotone" /> },
  { id: "credentials", label: "Credentials", icon: <Certificate size={14} weight="duotone" /> },
  { id: "settings", label: "Settings", icon: <GearSix size={14} weight="duotone" /> },
];

// Active jobs — real Peninsula Paving lead data (carried over from
// mock-data.ts where applicable, expanded with status + crew + material).
const JOBS = [
  { name: "Krause Driveway", location: "Sequim, WA", type: "Residential repave", status: "Scheduled · weather window Tue-Wed", statusKind: "in-progress" as const, crew: "Cyril · Roy · Demo crew", pct: 0, value: 8400, tons: 18, daysOut: 5, nextAction: "Tear-out Tuesday 7am · asphalt plant order placed" },
  { name: "Ortega Restaurant Lot", location: "Port Angeles, WA", type: "Seal coat + ADA stripe", status: "Estimating · walk-through Thursday", statusKind: "pending" as const, crew: "Cyril (estimating)", pct: 0, value: 14200, tons: 0, daysOut: 3, nextAction: "Bring stencil for ADA + measure stalls" },
  { name: "Halvorsen New Drive", location: "Port Townsend, WA", type: "Gravel-to-asphalt install", status: "Scheduled · late June window", statusKind: "pending" as const, crew: "Cyril · Roy", pct: 5, value: 11200, tons: 24, daysOut: 28, nextAction: "Sub-grade prep starts week of 6/22" },
  { name: "Sequim Self Storage", location: "Sequim, WA", type: "Phased lot repave", status: "Estimating · Phase 1 walk 5/24", statusKind: "warn" as const, crew: "Cyril (estimating)", pct: 0, value: 38000, tons: 88, daysOut: 4, nextAction: "Phased proposal due Friday" },
  { name: "Blyn Tribal Center", location: "Blyn, WA", type: "Public-RFP lot repave + stripe", status: "RFP submitted · bid due 6/1", statusKind: "warn" as const, crew: "Cyril (bid prep)", pct: 0, value: 52000, tons: 124, daysOut: 12, nextAction: "Follow up after 6/1 award announcement" },
  { name: "Henderson Drive · Repave", location: "Carlsborg, WA", type: "Residential tear-out + replace", status: "In progress · Day 2 of 3", statusKind: "in-progress" as const, crew: "Roy · Demo crew", pct: 65, value: 9800, tons: 21, daysOut: 0, nextAction: "Compact + roll today · seal-coat next week" },
  { name: "Whitt Drive · Seal", location: "Sequim, WA", type: "Driveway seal coat", status: "Awaiting weather window", statusKind: "blocked" as const, crew: "Roy (1 day)", pct: 0, value: 1100, tons: 0, daysOut: 2, nextAction: "Weather check tomorrow morning" },
];

// Lead inbox — paving-specific channels + stages
const LEADS = [
  { name: "Daniel Krause", phone: "(360) 555-0142", source: "Google Search", project: "Residential driveway repave · 1,200 sq ft", stage: "Scheduled", stageKind: "booked" as const, when: "Today", value: "$8,400", action: "Tuesday 7am tear-out · asphalt ordered" },
  { name: "Marisol Ortega", phone: "(360) 555-0871", source: "Google Maps", project: "Restaurant lot seal + stripe · ADA stalls", stage: "Estimating", stageKind: "progress" as const, when: "1 day ago", value: "~$14K", action: "Thursday walk-through · stencil + measure" },
  { name: "George Halvorsen", phone: "(360) 555-0233", source: "Word of Mouth", project: "Gravel-to-asphalt new drive", stage: "Booked", stageKind: "booked" as const, when: "2 days ago", value: "$11,200", action: "Late June window · sub-grade prep" },
  { name: "Wendell Crane", phone: "(360) 555-0299", source: "Word of Mouth", project: "New drive · long curved · sub-grade work", stage: "New", stageKind: "new" as const, when: "Today", value: "~$9K", action: "AI suggested reply ready · Locked → AI System" },
  { name: "Manny Toth", phone: "(360) 555-0712", source: "Facebook Ad", project: "New driveway · came from sunset paving ad", stage: "New", stageKind: "new" as const, when: "Today · 9:14am", value: "~$7K", action: "Auto-SMS sent with booking link · awaiting reply" },
  { name: "Sequim Self Storage", phone: "(360) 555-0840", source: "Google Search", project: "Phased lot repave · 18 stalls", stage: "Estimating", stageKind: "progress" as const, when: "3 days ago", value: "$38K quote drafted", action: "Owner walking lot 5/24 · proposal Friday" },
  { name: "Blyn Tribal Center", phone: "(360) 555-0220", source: "Public RFP", project: "Lot repave + stripe · public bid", stage: "Quoted", stageKind: "progress" as const, when: "4 days ago", value: "$52K bid", action: "Bid due 6/1 · award announcement after" },
  { name: "Dale Whitt", phone: "(360) 555-0061", source: "Google Maps", project: "5-yr-old drive · first seal coat", stage: "Contacted", stageKind: "progress" as const, when: "1 day ago", value: "$1,100", action: "Quoted Friday · awaiting weather window" },
];

// Reviews — Peninsula Paving uses generic 5-star quotes since no
// real-name testimonials are documented yet. Demonstrates the 4
// funnel states including private-intercepted.
const REVIEWS = [
  { name: "Diana Reichert", state: "captured", stars: 5, when: "2 weeks ago", quote: "Best driveway crew on the Peninsula. Cyril walked me through every option, no upsell pressure. Drive looks better than the house." },
  { name: "Marcus Greene", state: "captured", stars: 5, when: "1 month ago", quote: "Sealcoat in the morning, dry by lunch, beautiful by sunset. Recurring customer for life." },
  { name: "Jennifer Park", state: "captured", stars: 5, when: "2 months ago", quote: "Hired Peninsula for our HOA shared drive. Honest bid, finished a day early. Will rehire." },
  { name: "Wendell Crane", state: "scheduled", stars: 0, when: "Job finishes Friday", quote: "Auto-text scheduled for Monday 10am · 3 days post-completion" },
  { name: "Marina Cole", state: "private", stars: 1, when: "2 weeks ago", quote: "PRIVATE — 1★ intercepted before reaching Google. Lost on price after competitor underbid by $1.2K. Loss-probe captured + routed to inbox." },
  { name: "Ginger Hartwell", state: "captured", stars: 5, when: "3 months ago", quote: "Recurring maintenance customer. 2nd visit this year. Roy and the crew are always on time, always clean." },
  { name: "Robert Marsh", state: "captured", stars: 4, when: "4 months ago", quote: "Excellent paving. One small delay waiting on the plant — but communicated well throughout." },
  { name: "Mira Foulkes", state: "scheduled", stars: 0, when: "Job finished today", quote: "Auto-text scheduled for Sunday 10am · 3 days post-completion" },
  { name: "Greg Olson", state: "never-asked", stars: 0, when: "Job finished 8 months ago", quote: "Never asked · 1 tap to request" },
];

const MISSED_CALLS = [
  { when: "Monday · 2:14pm", number: "(360) ***-4892", duration: "47s no-answer", outcome: "Tuesday 7am estimate booked", won: true },
  { when: "Yesterday · 11:03am", number: "(360) ***-7715", duration: "12s → voicemail", outcome: "Replied with walkthrough link · awaiting", won: false },
  { when: "Today · 9:14am", number: "(360) ***-2230", duration: "Ring 8s · hung up", outcome: "Auto-SMS sent · 'came from FB ad' reply", won: true },
];

// Week schedule — Mon-Fri with paving-specific events
const SCHEDULE = [
  { day: "Mon · May 19", events: [
    { time: "7:00am", title: "Henderson · finish compact + roll", crew: "Roy + demo crew", color: ORANGE_DEEP },
    { time: "11:00am", title: "Whitt drive · weather window check", crew: "Cyril", color: BLUE },
    { time: "2:00pm", title: "Ortega lot · stencil + measure prep", crew: "Cyril", color: ORANGE },
  ] },
  { day: "Tue · May 20", events: [
    { time: "6:30am", title: "Krause · asphalt plant pickup", crew: "Cyril + Roy", color: RED, important: true },
    { time: "8:00am", title: "Krause driveway · tear-out start", crew: "Demo crew", color: ORANGE_DEEP },
    { time: "2:00pm", title: "Halvorsen sub-grade · prep start", crew: "Roy", color: ORANGE },
  ] },
  { day: "Wed · May 21", events: [
    { time: "7:00am", title: "Krause · base + binder pour", crew: "Cyril + Roy + crew", color: RED, important: true },
    { time: "3:00pm", title: "Krause · surface course + finish", crew: "Cyril + Roy", color: ORANGE_DEEP },
  ] },
  { day: "Thu · May 22", events: [
    { time: "9:00am", title: "Ortega · walk-through + bid", crew: "Cyril", color: ORANGE },
    { time: "1:00pm", title: "Sequim Self Storage · Phase 1 walk", crew: "Cyril", color: COPPER },
  ] },
  { day: "Fri · May 23", events: [
    { time: "8:00am", title: "Sequim Self Storage · phased proposal due", crew: "Cyril", color: RED, important: true },
    { time: "11:00am", title: "Krause · final compact + project close", crew: "Roy", color: GREEN },
    { time: "2:00pm", title: "Blyn Tribal · bid documents review", crew: "Cyril + Ella", color: COPPER },
  ] },
];

const INVOICES = [
  { num: "INV-2026-051", project: "Henderson · driveway repave", amount: 9800, status: "Paid", statusKind: "paid" as const, date: "2026-05-12" },
  { num: "INV-2026-052", project: "Krause · 50% deposit", amount: 4200, status: "Paid", statusKind: "paid" as const, date: "2026-05-15" },
  { num: "INV-2026-053", project: "Ginger Hartwell · maintenance visit", amount: 1450, status: "Paid", statusKind: "paid" as const, date: "2026-05-10" },
  { num: "INV-2026-054", project: "Halvorsen · 25% deposit", amount: 2800, status: "Pending · 3 days", statusKind: "pending" as const, date: "2026-05-16" },
  { num: "INV-2026-055", project: "Mira Foulkes · crack seal", amount: 740, status: "Paid", statusKind: "paid" as const, date: "2026-05-18" },
  { num: "CO-2026-007", project: "Sequim Self Storage · phased proposal", amount: 38000, status: "Awaiting signature · 1 day", statusKind: "warn" as const, date: "2026-05-17" },
  { num: "INV-2026-056", project: "Krause · final 50%", amount: 4200, status: "Draft", statusKind: "draft" as const, date: "2026-05-18" },
];

// Real-style credentials (WA paving contractor + DOT + bond)
const CREDENTIALS = [
  { label: "WA L&I License", value: "PENINP*842BJ", renewedAt: "2026-02-12", nextRenewal: "2027-02-12", daysUntil: 270, issuer: "WA Department of Labor & Industries" },
  { label: "General Liability Insurance", value: "$2,000,000 policy", renewedAt: "2025-10-04", nextRenewal: "2026-10-04", daysUntil: 139, issuer: "Acuity Insurance" },
  { label: "Surety Bond", value: "$12,000 contractor bond", renewedAt: "2026-02-12", nextRenewal: "2027-02-12", daysUntil: 270, issuer: "Western Surety Co" },
  { label: "USDOT Authority", value: "USDOT 1842970", renewedAt: "2025-08-18", nextRenewal: "2026-08-18", daysUntil: 92, issuer: "Federal Motor Carrier Safety Admin" },
];

const TEAM = [
  { name: "Cyril Frick", role: "Owner · GC + estimator", phone: "(360) 477-7015", initials: "CF" },
  { name: "Ella Frick", role: "Co-owner · operations", phone: "(360) 477-7015", initials: "EF" },
  { name: "Roy Henderson", role: "Foreman · 18 years", phone: "(360) 555-1142", initials: "RH" },
  { name: "Demo Crew (3)", role: "Day-of paving crew", phone: "Rotational", initials: "DC" },
];

const FLEET = [
  { name: "Asphalt Paver — Cat AP555F", status: "Operational", statusKind: "ok" as const, last: "Last service 2 weeks ago · 142 hrs" },
  { name: "Double-Drum Roller — Hamm HD12", status: "Operational", statusKind: "ok" as const, last: "Last service 1 month ago · 87 hrs" },
  { name: "Skid Steer — Bobcat S590", status: "Operational", statusKind: "ok" as const, last: "Last service 3 weeks ago · 220 hrs" },
  { name: "Dump Truck #1 — Mack Granite", status: "Operational", statusKind: "ok" as const, last: "Inspection due in 22 days" },
  { name: "Dump Truck #2 — Pete 567", status: "Service due · scheduled Fri", statusKind: "warn" as const, last: "Brake inspection 5/23" },
  { name: "Sealcoat Spray Rig — SealMaster", status: "Operational", statusKind: "ok" as const, last: "Tank cleaned 1 week ago" },
];

const INTEGRATIONS = [
  { name: "Twilio · SMS + voice", status: "connected" as const, detail: "(360) 477-7015 · 3 calls today" },
  { name: "Google Business Profile", status: "connected" as const, detail: "4.7★ · 22 reviews · synced 1h ago" },
  { name: "SendGrid · email", status: "connected" as const, detail: "from: bluejaycontactme@gmail.com" },
  { name: "Stripe · invoices", status: "ready" as const, detail: "Not yet activated · 1-click enable" },
  { name: "QuickBooks · accounting", status: "off" as const, detail: "Available with AI System tier" },
  { name: "Asphalt plant API · auto-orders", status: "off" as const, detail: "Available with AI System tier" },
];

/* ─────────────────────────  PAGE SHELL  ──────────────────────── */

export default function PortalDemoPage() {
  const [input, setInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // Re-hydrate unlock so a mid-pitch refresh doesn't kick out
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem("pp_demo_unlocked") === "1") {
      setUnlocked(true);
    }
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (input.trim() === GATE_CODE) {
      setUnlocked(true);
      setError(false);
      try {
        window.sessionStorage.setItem("pp_demo_unlocked", "1");
      } catch {}
    } else {
      setError(true);
    }
  }

  return (
    <main
      className="min-h-screen"
      style={{ background: BG, color: TEXT, fontFamily: FONT_BODY }}
    >
      {!unlocked ? (
        <GatePanel
          input={input}
          setInput={setInput}
          error={error}
          setError={setError}
          handleSubmit={handleSubmit}
        />
      ) : (
        <>
          <DashboardHeader />
          <TabNav active={activeTab} onChange={setActiveTab} />
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "jobs" && <JobsTab />}
            {activeTab === "leads" && <LeadsTab />}
            {activeTab === "reviews" && <ReviewsTab />}
            {activeTab === "schedule" && <ScheduleTab />}
            {activeTab === "invoices" && <InvoicesTab />}
            {activeTab === "credentials" && <CredentialsTab />}
            {activeTab === "settings" && <SettingsTab />}
          </div>
          <DashboardFooter />
        </>
      )}
    </main>
  );
}

/* ─────────────────────────  GATE  ──────────────────────── */

function GatePanel({
  input,
  setInput,
  error,
  setError,
  handleSubmit,
}: {
  input: string;
  setInput: (s: string) => void;
  error: boolean;
  setError: (b: boolean) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="mx-auto max-w-md px-5 sm:px-8 py-16 sm:py-24">
      <Link
        href="/clients/peninsula-paving"
        className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.16em] font-semibold mb-8 transition-opacity hover:opacity-70"
        style={{ color: TEXT_DIM, fontFamily: FONT_HEAD }}
      >
        <ArrowLeft size={14} weight="bold" />
        Back to site
      </Link>
      <div
        className="rounded-2xl border p-8 sm:p-10"
        style={{ background: SURFACE, borderColor: BORDER }}
      >
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-5"
          style={{ background: ORANGE_GRAD, color: "#1a1612" }}
        >
          <LockKey size={22} weight="duotone" />
        </div>
        <h1
          className="text-[28px] sm:text-[34px] font-bold tracking-tight leading-[1.05] mb-3"
          style={{ color: TEXT, fontFamily: FONT_HEAD }}
        >
          Peninsula Paving · owner portal.
        </h1>
        <p
          className="text-[15px] leading-relaxed mb-7"
          style={{ color: TEXT_SOFT, fontFamily: FONT_BODY }}
        >
          Private access for Cyril &amp; Ella Frick. Enter your access
          code to see the dashboard the AI System would build for
          Peninsula Paving &amp; Excavating, with your real customer
          flow and job data.
        </p>
        <form onSubmit={handleSubmit} noValidate>
          <label className="block mb-5">
            <span
              className="block text-[10px] tracking-[0.22em] uppercase mb-2 font-semibold"
              style={{ color: ORANGE, fontFamily: FONT_HEAD }}
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
              className="w-full bg-transparent border-b outline-none py-2.5 text-[18px] font-mono transition-colors"
              style={{
                borderColor: error ? RED : BORDER,
                color: TEXT,
                caretColor: ORANGE,
              }}
            />
          </label>
          {error && (
            <p
              className="text-[13px] mb-5"
              style={{ color: RED, fontFamily: FONT_BODY }}
            >
              Incorrect code. Try again — or call Ben at BlueJays.
            </p>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 h-12 rounded-md font-bold text-[13px] uppercase tracking-[0.16em] transition-all hover:brightness-110 active:scale-95"
            style={{
              background: ORANGE_GRAD,
              color: "#1a1612",
              fontFamily: FONT_HEAD,
              boxShadow: "0 6px 18px rgba(234, 88, 12, 0.35)",
            }}
          >
            Unlock dashboard
            <ArrowRight size={14} weight="bold" />
          </button>
        </form>
      </div>
      <p
        className="text-center text-[12px] mt-6"
        style={{ color: TEXT_DIM, fontFamily: FONT_BODY }}
      >
        Need access?{" "}
        <a
          href="mailto:bluejaycontactme@gmail.com?subject=Peninsula%20Paving%20portal%20access"
          className="font-semibold transition-opacity hover:opacity-70"
          style={{ color: ORANGE }}
        >
          Email Ben at BlueJays
        </a>
      </p>
    </section>
  );
}

/* ─────────────────────────  HEADER  ──────────────────────── */

function DashboardHeader() {
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{ background: `${SURFACE_HEADER}f5`, borderColor: BORDER }}
    >
      <div className="mx-auto flex w-full max-w-screen-2xl items-center gap-3 px-4 sm:px-6 lg:px-8 py-3">
        <Link
          href="/clients/peninsula-paving"
          className="flex min-w-0 items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <span
            className="inline-flex items-center justify-center w-9 h-9 rounded-md"
            style={{
              background: ORANGE_GRAD,
              color: "#1a1612",
              fontFamily: FONT_HEAD,
              fontWeight: 800,
            }}
            aria-hidden="true"
          >
            PP
          </span>
          <div className="min-w-0">
            <p
              className="text-[10px] uppercase tracking-[0.20em] font-semibold"
              style={{ color: ORANGE, fontFamily: FONT_HEAD }}
            >
              Peninsula Paving &amp; Excavating
            </p>
            <h1
              className="truncate text-[18px] sm:text-[22px] font-bold"
              style={{ color: TEXT, fontFamily: FONT_HEAD }}
            >
              Owner Dashboard
            </h1>
          </div>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold"
            style={{
              background: "rgba(251, 146, 60, 0.12)",
              border: `1px solid ${ORANGE_DIM}`,
              color: ORANGE,
              fontFamily: FONT_HEAD,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: ORANGE, boxShadow: `0 0 8px ${ORANGE}` }}
            />
            Live · Mock Data
          </div>
          <button
            type="button"
            className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-md transition-colors hover:bg-white/5"
            style={{ color: TEXT_SOFT, border: `1px solid ${BORDER}` }}
            aria-label="Notifications"
          >
            <Bell size={16} weight="duotone" />
          </button>
          <div
            className="flex items-center gap-2.5 pl-3 sm:pl-4 ml-1 border-l"
            style={{ borderColor: BORDER }}
          >
            <div
              className="inline-flex items-center justify-center w-9 h-9 rounded-full text-[12px] font-bold"
              style={{
                background: ORANGE_GRAD,
                color: "#1a1612",
                fontFamily: FONT_HEAD,
              }}
            >
              CF
            </div>
            <div className="hidden sm:block leading-tight">
              <div
                className="text-[13px] font-bold"
                style={{ color: TEXT, fontFamily: FONT_HEAD }}
              >
                Cyril Frick
              </div>
              <div
                className="text-[10px] uppercase tracking-[0.16em]"
                style={{ color: TEXT_DIM, fontFamily: FONT_HEAD }}
              >
                Owner · GC
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────  TAB NAV  ──────────────────────── */

function TabNav({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <div
      className="sticky top-[68px] z-40 border-b"
      style={{ background: BG, borderColor: BORDER }}
    >
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <nav
          className="flex items-center gap-1 overflow-x-auto -mb-px"
          style={{ scrollbarWidth: "none" }}
        >
          {TABS.map((t) => {
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onChange(t.id)}
                className="relative inline-flex items-center gap-2 px-4 py-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors"
                style={{
                  color: isActive ? TEXT : TEXT_SOFT,
                  fontFamily: FONT_HEAD,
                }}
              >
                <span style={{ color: isActive ? ORANGE : TEXT_DIM }}>
                  {t.icon}
                </span>
                {t.label}
                {isActive && (
                  <span
                    className="absolute left-3 right-3 -bottom-px h-[2px]"
                    style={{ background: ORANGE_GRAD }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

/* ─────────────────────────  TAB: OVERVIEW  ──────────────────────── */

function OverviewTab() {
  return (
    <div className="space-y-8">
      <div>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.22em] mb-4"
          style={{
            background: "rgba(251, 146, 60, 0.10)",
            border: `1px solid ${ORANGE_DIM}`,
            color: ORANGE,
            fontFamily: FONT_HEAD,
          }}
        >
          <Sparkle size={11} weight="fill" />
          AI System Preview · Your real data
        </div>
        <h2
          className="font-bold tracking-tight leading-[1] mb-2"
          style={{
            fontFamily: FONT_HEAD,
            fontSize: "clamp(28px, 4vw, 40px)",
            color: TEXT,
          }}
        >
          Morning, Cyril.
        </h2>
        <p
          className="text-[15px] sm:text-[17px] leading-relaxed max-w-2xl"
          style={{ color: TEXT_SOFT }}
        >
          The yard, one page. Krause is the Tuesday-Wednesday window. Henderson wraps Friday. Sequim Self Storage proposal due 5pm. Click around the tabs for the deeper view.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Active job value"
          value="$134,700"
          trend="+$48K"
          trendKind="up"
          sub="7 jobs in flight · 124 tons of asphalt scheduled"
          icon={<CurrencyDollar size={18} weight="duotone" />}
          accent={ORANGE}
        />
        <StatCard
          label="New leads this week"
          value="8"
          trend="+5 vs last"
          trendKind="up"
          sub="2 from FB ad creative #4 (sunset paving)"
          icon={<Funnel size={18} weight="duotone" />}
          accent={ORANGE}
        />
        <StatCard
          label="Asphalt poured (week)"
          value="42 tons"
          trend="+18%"
          trendKind="up"
          sub="Henderson 21t · Krause 18t scheduled · plant on-time"
          icon={<Truck size={18} weight="duotone" />}
          accent={ORANGE}
        />
        <StatCard
          label="Weather window (next 3d)"
          value="2 of 3"
          trend="Tue-Wed dry"
          trendKind="up"
          sub="Krause locked-in · Whitt seal awaits Mon"
          icon={<CloudSun size={18} weight="duotone" />}
          accent={ORANGE}
        />
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <Panel title="Recent activity" icon={<Lightning size={14} weight="fill" />}>
          <ActivityRow
            when="11:42am"
            actor="Manny Toth"
            action="submitted contact form"
            detail="From FB ad creative #4 (sunset paving) · auto-SMS sent with booking link · saved to Leads"
            tone="info"
          />
          <ActivityRow
            when="10:18am"
            actor="Krause Drive"
            action="asphalt plant confirmed Tuesday 6:30am"
            detail="18 tons hot-mix · pickup Cyril + Roy · weather window Tue-Wed locked"
            tone="ok"
          />
          <ActivityRow
            when="9:14am"
            actor="Greg Olson"
            action="recovered from missed call"
            detail="Auto-SMS replied within 22 min → Wednesday 2pm walkthrough booked"
            tone="ok"
          />
          <ActivityRow
            when="Yesterday 4:12pm"
            actor="Henderson Drive"
            action="5★ review captured to Google"
            detail="Marcus Greene · 3-day post-completion auto-text · reposted to your site"
            tone="ok"
          />
          <ActivityRow
            when="Yesterday 11:03am"
            actor="Frank Wilson"
            action="missed call recovered with SMS"
            detail="Master bath in Port Angeles · awaiting reply on walkthrough link"
            tone="info"
          />
          <ActivityRow
            when="Yesterday 9:00am"
            actor="Blyn Tribal RFP"
            action="bid documents submitted"
            detail="$52K · 124 tons · award announcement after 6/1 · auto-follow-up calendared"
            tone="info"
          />
        </Panel>

        <Panel title="Today's punch list" icon={<ListChecks size={14} weight="fill" />}>
          <ChecklistRow done text="Confirm Tuesday Krause asphalt pickup" />
          <ChecklistRow done text="Check Wednesday weather window" />
          <ChecklistRow text="Finalize Sequim Self Storage phased proposal" tone="warn" />
          <ChecklistRow text="Reply to Manny Toth FB ad lead (AI draft ready)" tone="upgrade" />
          <ChecklistRow text="Tap to request 1 review ask (Greg Olson · 8 mo)" tone="upgrade" />
          <ChecklistRow text="Schedule brake inspection for Dump #2" />
          <ChecklistRow text="Sign off CO-2026-007 for Self Storage" tone="warn" />
          <UpgradeRow
            label="Unlock AI auto-replies + auto-review-asks + plant-order automation"
            caption="AI System tier · 1-click enable"
          />
        </Panel>
      </div>
    </div>
  );
}

/* ─────────────────────────  TAB: JOBS  ──────────────────────── */

function JobsTab() {
  return (
    <div className="space-y-8">
      <TabHeader
        title="Jobs"
        sub="Every active driveway, lot, seal-coat, and bid in flight. Sortable by next action."
        action="+ New job"
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Active value" value="$134,700" trend="7 jobs" trendKind="neutral" sub="" icon={<CurrencyDollar size={16} weight="duotone" />} accent={ORANGE} />
        <StatCard label="Tons scheduled" value="275" trend="Next 30d" trendKind="up" sub="" icon={<Truck size={16} weight="duotone" />} accent={ORANGE} />
        <StatCard label="Sealcoat gallons" value="180" trend="3 jobs" trendKind="neutral" sub="" icon={<Drop size={16} weight="duotone" />} accent={ORANGE} />
        <StatCard label="Linear ft striping" value="2,840" trend="2 jobs" trendKind="neutral" sub="" icon={<Crosshair size={16} weight="duotone" />} accent={ORANGE} />
      </div>
      <Panel title="Active jobs" icon={<Truck size={14} weight="fill" />}>
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ color: TEXT_DIM, borderBottom: `1px solid ${BORDER}` }}>
                <Th>Job</Th>
                <Th>Status</Th>
                <Th>Crew</Th>
                <Th>Tons</Th>
                <Th align="right">Value</Th>
              </tr>
            </thead>
            <tbody>
              {JOBS.map((j) => (
                <tr
                  key={j.name}
                  className="transition-colors hover:bg-white/[0.03] cursor-pointer"
                  style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}
                >
                  <Td>
                    <div
                      className="font-bold mb-0.5"
                      style={{ color: TEXT, fontFamily: FONT_HEAD }}
                    >
                      {j.name}
                    </div>
                    <div
                      className="text-[11px] uppercase tracking-[0.16em]"
                      style={{ color: TEXT_DIM, fontFamily: FONT_HEAD }}
                    >
                      {j.location} · {j.type}
                    </div>
                  </Td>
                  <Td>
                    <StatusPill kind={j.statusKind} label={j.status} />
                  </Td>
                  <Td>
                    <span style={{ color: TEXT_SOFT }}>{j.crew}</span>
                  </Td>
                  <Td>
                    {j.tons > 0 ? (
                      <span
                        className="inline-flex items-center gap-1 font-bold tabular-nums"
                        style={{ color: ORANGE, fontFamily: FONT_HEAD }}
                      >
                        <Truck size={12} weight="duotone" />
                        {j.tons}t
                      </span>
                    ) : (
                      <span style={{ color: TEXT_DIM }}>—</span>
                    )}
                  </Td>
                  <Td align="right">
                    <span
                      className="font-bold tabular-nums"
                      style={{ color: TEXT, fontFamily: FONT_HEAD }}
                    >
                      ${j.value.toLocaleString()}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Fleet status" icon={<Wrench size={14} weight="fill" />}>
        <div className="grid sm:grid-cols-2 gap-3">
          {FLEET.map((f) => (
            <div
              key={f.name}
              className="p-4 rounded-lg flex items-center justify-between gap-3"
              style={{
                background: SURFACE_RAISED,
                border: `1px solid ${f.statusKind === "warn" ? COPPER_DIM : BORDER}`,
              }}
            >
              <div className="min-w-0">
                <div className="font-bold text-[13px]" style={{ color: TEXT, fontFamily: FONT_HEAD }}>
                  {f.name}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: TEXT_DIM }}>
                  {f.last}
                </div>
              </div>
              <span
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] uppercase tracking-[0.16em] font-bold shrink-0"
                style={{
                  background: f.statusKind === "ok" ? GREEN_DIM : COPPER_DIM,
                  color: f.statusKind === "ok" ? GREEN : COPPER,
                  fontFamily: FONT_HEAD,
                }}
              >
                {f.statusKind === "ok" ? (
                  <CheckCircle size={10} weight="fill" />
                ) : (
                  <Wrench size={10} weight="fill" />
                )}
                {f.status}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ─────────────────────────  TAB: LEADS  ──────────────────────── */

function LeadsTab() {
  return (
    <div className="space-y-8">
      <TabHeader
        title="Leads"
        sub="Every channel · contact form, missed-call recovery, Facebook ads, Google Maps, repeat customers, public RFPs."
        action="+ Add lead"
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="New this week" value="8" trend="+5" trendKind="up" sub="3 form · 3 missed call · 1 FB · 1 RFP" icon={<Funnel size={16} weight="duotone" />} accent={ORANGE} />
        <StatCard label="Estimates booked" value="3" trend="+1" trendKind="up" sub="" icon={<Calendar size={16} weight="duotone" />} accent={ORANGE} />
        <StatCard label="Outstanding bids" value="$90K" trend="2 quotes" trendKind="neutral" sub="SSS $38K · Blyn $52K" icon={<CurrencyDollar size={16} weight="duotone" />} accent={ORANGE} />
        <StatCard label="Avg response" value="22m" trend="auto" trendKind="up" sub="industry: 4-6h" icon={<Lightning size={16} weight="duotone" />} accent={ORANGE} />
      </div>
      <Panel title="Lead inbox" icon={<Funnel size={14} weight="fill" />}>
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ color: TEXT_DIM, borderBottom: `1px solid ${BORDER}` }}>
                <Th>Lead</Th>
                <Th>Source</Th>
                <Th>Project</Th>
                <Th>Stage</Th>
                <Th>Next action</Th>
                <Th align="right">Value</Th>
              </tr>
            </thead>
            <tbody>
              {LEADS.map((l) => (
                <tr
                  key={l.name}
                  className="transition-colors hover:bg-white/[0.03]"
                  style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}
                >
                  <Td>
                    <div className="font-bold" style={{ color: TEXT, fontFamily: FONT_HEAD }}>
                      {l.name}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: TEXT_DIM }}>
                      {l.phone}
                    </div>
                  </Td>
                  <Td>
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold"
                      style={{
                        background: SURFACE_RAISED,
                        color: TEXT_SOFT,
                        fontFamily: FONT_HEAD,
                      }}
                    >
                      {l.source}
                    </span>
                  </Td>
                  <Td>
                    <span style={{ color: TEXT_SOFT }}>{l.project}</span>
                  </Td>
                  <Td>
                    <StageBadge kind={l.stageKind} label={l.stage} />
                  </Td>
                  <Td>
                    <div className="text-[12px]" style={{ color: TEXT_SOFT }}>
                      {l.action}
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: TEXT_FAINT }}>
                      {l.when}
                    </div>
                  </Td>
                  <Td align="right">
                    <span className="font-bold tabular-nums" style={{ color: TEXT, fontFamily: FONT_HEAD }}>
                      {l.value}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <UpgradePanel
        title="AI Reply Drafter — Locked"
        caption="AI System tier · drafts replies in your voice for every inbound lead. You read it, tap send, move on. Drops response time from 4-6h industry standard to 60 seconds."
      />
      <Panel title="Missed-call recovery feed" icon={<PhoneIncoming size={14} weight="fill" />}>
        <div className="space-y-3">
          {MISSED_CALLS.map((c, i) => (
            <div
              key={i}
              className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 p-4 rounded-lg border"
              style={{
                background: SURFACE_RAISED,
                borderColor: c.won ? ORANGE_DIM : BORDER,
              }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[14px]" style={{ color: TEXT, fontFamily: FONT_HEAD }}>
                    {c.number}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.16em] font-semibold" style={{ color: TEXT_DIM, fontFamily: FONT_HEAD }}>
                    {c.when} · {c.duration}
                  </span>
                </div>
                <div className="text-[12px]" style={{ color: TEXT_SOFT }}>
                  <span style={{ color: ORANGE, fontWeight: 600 }}>→ Outcome:</span> {c.outcome}
                </div>
              </div>
              {c.won && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] uppercase tracking-[0.16em] font-bold self-start"
                  style={{ background: ORANGE_DIM, color: ORANGE, fontFamily: FONT_HEAD }}
                >
                  <CheckCircle size={11} weight="fill" />
                  Recovered
                </span>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ─────────────────────────  TAB: REVIEWS  ──────────────────────── */

function ReviewsTab() {
  return (
    <div className="space-y-8">
      <TabHeader
        title="Reviews"
        sub="5-star routes to Google. <5★ stays private to you. Auto-text fires 3 days after every completion."
        action="Request 1 review →"
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Aggregate rating" value="4.7★" trend="" trendKind="neutral" sub="22 verified reviews" icon={<Star size={16} weight="duotone" />} accent={ORANGE} />
        <StatCard label="Captured (90d)" value="5" trend="+2" trendKind="up" sub="all 5★ to Google" icon={<CheckCircle size={16} weight="duotone" />} accent={ORANGE} />
        <StatCard label="Auto-scheduled" value="2" trend="next 7d" trendKind="neutral" sub="Wendell · Mira" icon={<Clock size={16} weight="duotone" />} accent={ORANGE} />
        <StatCard label="Negatives intercepted" value="1" trend="kept private" trendKind="up" sub="Marina Cole 1★ · loss-probe captured" icon={<ShieldCheck size={16} weight="duotone" />} accent={ORANGE} />
      </div>
      <Panel title="All reviews" icon={<Star size={14} weight="fill" />}>
        <div className="divide-y" style={{ borderColor: BORDER }}>
          {REVIEWS.map((r, i) => (
            <ReviewItem key={i} review={r} />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function ReviewItem({ review }: { review: typeof REVIEWS[number] }) {
  const config = {
    captured: { label: "Posted to Google", color: ORANGE, bg: ORANGE_DIM, icon: <CheckCircle size={12} weight="fill" /> },
    scheduled: { label: "Auto-text scheduled", color: BLUE, bg: BLUE_DIM, icon: <Clock size={12} weight="fill" /> },
    "never-asked": { label: "Never asked", color: RED, bg: RED_DIM, icon: <Warning size={12} weight="fill" /> },
    private: { label: "Private · intercepted", color: COPPER_GOLD, bg: "rgba(251, 191, 36, 0.15)", icon: <ShieldCheck size={12} weight="fill" /> },
  }[review.state as "captured" | "scheduled" | "never-asked" | "private"];
  return (
    <div className="py-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-bold" style={{ color: TEXT, fontFamily: FONT_HEAD }}>
            {review.name}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase tracking-[0.16em] font-bold"
            style={{ background: config.bg, color: config.color, fontFamily: FONT_HEAD }}
          >
            {config.icon}
            {config.label}
          </span>
          <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color: TEXT_DIM, fontFamily: FONT_HEAD }}>
            {review.when}
          </span>
        </div>
        <p
          className="text-[13px] italic leading-snug"
          style={{ color: review.state === "private" ? COPPER_GOLD : TEXT_SOFT }}
        >
          {review.state === "private" ? review.quote : <>&ldquo;{review.quote}&rdquo;</>}
        </p>
      </div>
      <div className="self-center flex items-center gap-2">
        {review.stars > 0 ? (
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={13}
                weight="fill"
                style={{
                  color: i <= review.stars ? (review.state === "private" ? RED : COPPER_GOLD) : "rgba(255,255,255,0.12)",
                }}
              />
            ))}
          </div>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-[11px] uppercase tracking-[0.14em] font-bold transition-opacity hover:opacity-90"
            style={{
              background: review.state === "never-asked" ? COPPER_GRAD : ORANGE_GRAD,
              color: "#1a1612",
              fontFamily: FONT_HEAD,
            }}
          >
            {review.state === "never-asked" ? "Send now" : "Reschedule"}
            <ArrowRight size={11} weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────  TAB: SCHEDULE  ──────────────────────── */

function ScheduleTab() {
  return (
    <div className="space-y-8">
      <TabHeader
        title="Schedule"
        sub="Week of May 19. Color-coded by crew. Red = inspection or hard deadline. Weather-dependent jobs flagged."
        action="+ Add event"
      />
      <Panel title="This week" icon={<Calendar size={14} weight="fill" />}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {SCHEDULE.map((d) => (
            <div
              key={d.day}
              className="rounded-lg border p-3"
              style={{ background: SURFACE_RAISED, borderColor: BORDER }}
            >
              <div
                className="text-[11px] uppercase tracking-[0.18em] font-bold mb-3"
                style={{ color: ORANGE, fontFamily: FONT_HEAD }}
              >
                {d.day}
              </div>
              <div className="space-y-2">
                {d.events.map((e, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-md border-l-2"
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      borderColor: e.color,
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="text-[10px] uppercase tracking-[0.16em] font-bold tabular-nums"
                        style={{ color: TEXT_DIM, fontFamily: FONT_HEAD }}
                      >
                        {e.time}
                      </span>
                      {e.important && (
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-[0.18em] font-bold"
                          style={{ background: RED_DIM, color: RED, fontFamily: FONT_HEAD }}
                        >
                          Critical
                        </span>
                      )}
                    </div>
                    <div
                      className="text-[13px] font-bold leading-tight mb-0.5"
                      style={{ color: TEXT, fontFamily: FONT_HEAD }}
                    >
                      {e.title}
                    </div>
                    <div className="text-[11px]" style={{ color: TEXT_DIM }}>
                      {e.crew}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="7-day weather window" icon={<CloudSun size={14} weight="fill" />}>
        <div className="grid grid-cols-7 gap-2">
          {[
            { d: "Mon", icon: "🌤️", ok: true, note: "Dry · 62°F" },
            { d: "Tue", icon: "☀️", ok: true, note: "Clear · 68°F" },
            { d: "Wed", icon: "☀️", ok: true, note: "Clear · 70°F" },
            { d: "Thu", icon: "🌤️", ok: true, note: "Dry · 65°F" },
            { d: "Fri", icon: "🌦️", ok: false, note: "Showers · 58°F" },
            { d: "Sat", icon: "🌧️", ok: false, note: "Rain · 55°F" },
            { d: "Sun", icon: "🌦️", ok: false, note: "Showers · 57°F" },
          ].map((w) => (
            <div
              key={w.d}
              className="p-3 rounded-lg text-center"
              style={{
                background: SURFACE_RAISED,
                border: `1px solid ${w.ok ? ORANGE_DIM : BORDER}`,
              }}
            >
              <div className="text-[10px] uppercase tracking-[0.18em] font-bold mb-1" style={{ color: TEXT_DIM, fontFamily: FONT_HEAD }}>
                {w.d}
              </div>
              <div className="text-[22px] mb-1">{w.icon}</div>
              <div className="text-[10px]" style={{ color: w.ok ? ORANGE : TEXT_DIM, fontFamily: FONT_HEAD }}>
                {w.note}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ─────────────────────────  TAB: INVOICES  ──────────────────────── */

function InvoicesTab() {
  return (
    <div className="space-y-8">
      <TabHeader
        title="Invoices &amp; change orders"
        sub="Auto-generated from accepted bids. Digital signoff. Stripe payment in 2 taps."
        action="+ New invoice"
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Paid (90d)" value="$67,420" trend="+22%" trendKind="up" sub="" icon={<CurrencyDollar size={16} weight="duotone" />} accent={ORANGE} />
        <StatCard label="Pending" value="$2,800" trend="1" trendKind="neutral" sub="Halvorsen deposit · 3 days" icon={<Clock size={16} weight="duotone" />} accent={ORANGE} />
        <StatCard label="Awaiting signoff" value="$38,000" trend="1 day old" trendKind="down" sub="Sequim Self Storage phased CO" icon={<Warning size={16} weight="duotone" />} accent={ORANGE} />
        <StatCard label="Draft" value="$4,200" trend="1" trendKind="neutral" sub="Krause final · sends Friday" icon={<FileText size={16} weight="duotone" />} accent={ORANGE} />
      </div>
      <Panel title="All invoices" icon={<FileText size={14} weight="fill" />}>
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ color: TEXT_DIM, borderBottom: `1px solid ${BORDER}` }}>
                <Th>Number</Th>
                <Th>Job · milestone</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th align="right">Amount</Th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => (
                <tr
                  key={inv.num}
                  className="transition-colors hover:bg-white/[0.03] cursor-pointer"
                  style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}
                >
                  <Td>
                    <span className="font-bold font-mono text-[12px]" style={{ color: TEXT, fontFamily: FONT_HEAD }}>
                      {inv.num}
                    </span>
                  </Td>
                  <Td>
                    <span style={{ color: TEXT_SOFT }}>{inv.project}</span>
                  </Td>
                  <Td>
                    <InvoiceStatus kind={inv.statusKind} label={inv.status} />
                  </Td>
                  <Td>
                    <span className="font-mono text-[12px]" style={{ color: TEXT_DIM }}>
                      {inv.date}
                    </span>
                  </Td>
                  <Td align="right">
                    <span className="font-bold tabular-nums" style={{ color: TEXT, fontFamily: FONT_HEAD }}>
                      ${inv.amount.toLocaleString()}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Phased proposal detail · CO-2026-007" icon={<PenNib size={14} weight="fill" />}>
        <div className="grid sm:grid-cols-[2fr_1fr] gap-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] font-semibold mb-3" style={{ color: TEXT_DIM, fontFamily: FONT_HEAD }}>
              Sequim Self Storage · phased lot repave
            </div>
            <ul className="space-y-2 text-[13px] leading-snug" style={{ color: TEXT_SOFT }}>
              <COLine label="Phase 1 · half-lot tear-out + repave" detail="44 tons hot-mix · 6,200 sq ft" amount="$19,200" />
              <COLine label="Phase 2 · second half (next season)" detail="44 tons · scheduled summer 2027" amount="$18,800" />
              <COLine label="Sealcoat both halves (Phase 1 + Phase 2)" detail="100 gal sealcoat · within 90 days of each phase" amount="Included" />
              <COLine label="Restripe full lot with ADA stalls" detail="18 stalls · 2 ADA · fire lane · directional arrows" amount="Included" />
              <COLine label="Timeline" detail="Phase 1 starts week of 6/15 · 5 working days" amount="—" />
            </ul>
          </div>
          <div className="rounded-lg p-5 self-start" style={{ background: SURFACE_RAISED, border: `1px solid ${BORDER}` }}>
            <div className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-2" style={{ color: TEXT_DIM, fontFamily: FONT_HEAD }}>
              Total
            </div>
            <div className="text-[28px] font-bold tabular-nums mb-3" style={{ color: TEXT, fontFamily: FONT_HEAD }}>
              $38,000.00
            </div>
            <div className="text-[11px] uppercase tracking-[0.16em] font-semibold mb-3" style={{ color: COPPER, fontFamily: FONT_HEAD }}>
              Awaiting signature · 1 day
            </div>
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-md text-[11px] uppercase tracking-[0.14em] font-bold transition-opacity hover:opacity-90"
              style={{ background: ORANGE_GRAD, color: "#1a1612", fontFamily: FONT_HEAD }}
            >
              Send reminder now
              <ArrowRight size={11} weight="bold" />
            </button>
            <button
              type="button"
              className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-md text-[11px] uppercase tracking-[0.14em] font-bold border transition-colors hover:bg-white/[0.04]"
              style={{ color: TEXT_SOFT, borderColor: BORDER, fontFamily: FONT_HEAD }}
            >
              View PDF
              <Download size={11} weight="bold" />
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function COLine({ label, detail, amount }: { label: string; detail: string; amount: string }) {
  return (
    <li className="flex items-start justify-between gap-3 pb-2 border-b" style={{ borderColor: BORDER_SOFT }}>
      <div className="min-w-0 flex items-start gap-2">
        <CaretRight size={12} weight="bold" style={{ color: ORANGE, marginTop: 4 }} />
        <div>
          <div className="font-bold" style={{ color: TEXT }}>{label}</div>
          <div className="text-[12px]" style={{ color: TEXT_DIM }}>{detail}</div>
        </div>
      </div>
      <div className="font-bold tabular-nums shrink-0" style={{ color: TEXT, fontFamily: FONT_HEAD }}>
        {amount}
      </div>
    </li>
  );
}

/* ─────────────────────────  TAB: CREDENTIALS  ──────────────────────── */

function CredentialsTab() {
  return (
    <div className="space-y-8">
      <TabHeader
        title="Credentials &amp; renewals"
        sub="WA L&I, bond, insurance, USDOT. Auto-reminders 60 / 30 / 7 days before each renewal."
        action="Upload document"
      />
      <div className="grid sm:grid-cols-2 gap-4">
        {CREDENTIALS.map((c) => (
          <CredCard key={c.label} cred={c} />
        ))}
      </div>
      <Panel title="Document vault" icon={<FileText size={14} weight="fill" />}>
        <DocumentRow name="WA L&I License — current.pdf" size="412 KB" updated="2026-02-13" />
        <DocumentRow name="Acuity GL Certificate — 2025-2026.pdf" size="287 KB" updated="2025-10-05" />
        <DocumentRow name="Western Surety Bond — current.pdf" size="198 KB" updated="2026-02-13" />
        <DocumentRow name="USDOT 1842970 — registration.pdf" size="156 KB" updated="2025-08-19" />
        <DocumentRow name="Asphalt Plant Customer Agreement — 2026.pdf" size="94 KB" updated="2026-01-08" />
      </Panel>
    </div>
  );
}

function CredCard({ cred }: { cred: typeof CREDENTIALS[number] }) {
  const urgent = cred.daysUntil < 100;
  const ringPct = Math.max(0, Math.min(100, ((365 - cred.daysUntil) / 365) * 100));
  return (
    <div className="p-5 sm:p-6 rounded-xl border" style={{ background: SURFACE, borderColor: BORDER }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.20em] font-semibold mb-1" style={{ color: ORANGE, fontFamily: FONT_HEAD }}>
            {cred.label}
          </div>
          <div className="text-[16px] font-bold tracking-tight font-mono" style={{ color: TEXT, fontFamily: FONT_HEAD }}>
            {cred.value}
          </div>
        </div>
        <div
          className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full relative"
          style={{
            background: "conic-gradient(" + ORANGE_DEEP + " " + ringPct + "%, rgba(251, 146, 60, 0.12) " + ringPct + "%)",
          }}
        >
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full"
            style={{ background: SURFACE, color: ORANGE }}
          >
            <ShieldCheck size={14} weight="duotone" />
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-1" style={{ color: TEXT_DIM }}>
            Last renewed
          </div>
          <div className="text-[13px] font-semibold tabular-nums font-mono" style={{ color: TEXT_SOFT }}>
            {cred.renewedAt}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-1" style={{ color: TEXT_DIM }}>
            Next renewal
          </div>
          <div className="text-[13px] font-bold tabular-nums font-mono" style={{ color: urgent ? COPPER : TEXT, fontFamily: FONT_HEAD }}>
            {cred.nextRenewal} ({cred.daysUntil}d)
          </div>
        </div>
      </div>
      <div className="text-[11px] pt-3 border-t" style={{ color: TEXT_DIM, borderColor: BORDER }}>
        <span style={{ color: ORANGE, fontWeight: 600 }}>Auto-reminder:</span> 60 / 30 / 7 days · {cred.issuer}
      </div>
    </div>
  );
}

function DocumentRow({ name, size, updated }: { name: string; size: string; updated: string }) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-white/[0.02] -mx-5 sm:mx-0 px-5 sm:px-0"
      style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <FileText size={16} weight="duotone" style={{ color: ORANGE }} />
        <div className="min-w-0">
          <div className="font-bold text-[13px] truncate" style={{ color: TEXT, fontFamily: FONT_HEAD }}>
            {name}
          </div>
          <div className="text-[11px]" style={{ color: TEXT_DIM }}>
            {size} · updated {updated}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-white/5" style={{ color: TEXT_SOFT }} aria-label="View">
          <Eye size={14} weight="duotone" />
        </button>
        <button type="button" className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-white/5" style={{ color: TEXT_SOFT }} aria-label="Download">
          <Download size={14} weight="duotone" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────  TAB: SETTINGS  ──────────────────────── */

function SettingsTab() {
  return (
    <div className="space-y-8">
      <TabHeader
        title="Settings"
        sub="Team, automation preferences, integrations, notification routing."
      />
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Team" icon={<Users size={14} weight="fill" />}>
          <div className="space-y-3">
            {TEAM.map((t) => (
              <div
                key={t.name}
                className="flex items-center justify-between gap-3 p-3 rounded-lg"
                style={{ background: SURFACE_RAISED, border: `1px solid ${BORDER}` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full text-[11px] font-bold"
                    style={{ background: ORANGE_GRAD, color: "#1a1612", fontFamily: FONT_HEAD }}
                  >
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[14px]" style={{ color: TEXT, fontFamily: FONT_HEAD }}>
                      {t.name}
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.16em]" style={{ color: TEXT_DIM, fontFamily: FONT_HEAD }}>
                      {t.role}
                    </div>
                  </div>
                </div>
                <span className="text-[12px] font-mono" style={{ color: TEXT_SOFT }}>
                  {t.phone}
                </span>
              </div>
            ))}
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-md text-[11px] uppercase tracking-[0.14em] font-bold border transition-colors hover:bg-white/[0.04]"
              style={{ color: TEXT_SOFT, borderColor: BORDER, fontFamily: FONT_HEAD }}
            >
              <Plus size={11} weight="bold" />
              Add team member
            </button>
          </div>
        </Panel>

        <Panel title="Integrations" icon={<Lightning size={14} weight="fill" />}>
          <div className="space-y-3">
            {INTEGRATIONS.map((i) => (
              <div
                key={i.name}
                className="flex items-center justify-between gap-3 p-3 rounded-lg"
                style={{ background: SURFACE_RAISED, border: `1px solid ${BORDER}` }}
              >
                <div className="min-w-0">
                  <div className="font-bold text-[13px]" style={{ color: TEXT, fontFamily: FONT_HEAD }}>
                    {i.name}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: TEXT_DIM }}>
                    {i.detail}
                  </div>
                </div>
                <IntegrationStatus kind={i.status} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Automation rules" icon={<Sparkle size={14} weight="fill" />}>
          <RuleRow on label="Auto-text past customers 3 days after job completion" />
          <RuleRow on label="Recover missed calls with auto-SMS within 30 seconds" />
          <RuleRow on label="Weather-window alerts 3 days out for outdoor jobs" />
          <RuleRow on label="License + bond + DOT renewals at 60 / 30 / 7 days" />
          <RuleRow upgrade label="AI replies to inbound leads in your voice" />
          <RuleRow upgrade label="Auto-order asphalt + sealcoat at plant API" />
          <RuleRow upgrade label="Hyperloop self-learning ads on Facebook + Google" />
        </Panel>

        <Panel title="Notification routing" icon={<Bell size={14} weight="fill" />}>
          <NotifRow icon={<Phone size={14} weight="duotone" />} label="Missed-call SMS sent" via="SMS to Cyril" />
          <NotifRow icon={<EnvelopeSimple size={14} weight="duotone" />} label="Contact form submitted" via="Email + SMS to Cyril + Ella" />
          <NotifRow icon={<Star size={14} weight="duotone" />} label="5★ review captured" via="SMS to Cyril (silent)" />
          <NotifRow icon={<Warning size={14} weight="duotone" />} label="<5★ private feedback received" via="Email to Cyril + SMS Ben" />
          <NotifRow icon={<CloudSun size={14} weight="duotone" />} label="Weather window updated" via="SMS to Cyril + Roy" />
          <NotifRow icon={<Certificate size={14} weight="duotone" />} label="Credential renewal due" via="Email at 60 / 30 / 7 days" />
        </Panel>
      </div>
    </div>
  );
}

/* ─────────────────────────  PRIMITIVES  ──────────────────────── */

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-xl border"
      style={{ background: SURFACE, borderColor: BORDER }}
    >
      <header
        className="px-5 sm:px-6 py-3.5 border-b flex items-center gap-2"
        style={{ borderColor: BORDER }}
      >
        {icon && <span style={{ color: ORANGE }}>{icon}</span>}
        <h3
          className="text-[13px] uppercase tracking-[0.18em] font-bold"
          style={{ color: TEXT, fontFamily: FONT_HEAD }}
        >
          {title}
        </h3>
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function TabHeader({ title, sub, action }: { title: string; sub: string; action?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2
          className="font-bold tracking-tight mb-1.5"
          style={{ fontFamily: FONT_HEAD, fontSize: "clamp(24px, 3.5vw, 32px)", color: TEXT }}
        >
          {title}
        </h2>
        <p className="text-[14px] max-w-2xl" style={{ color: TEXT_SOFT }}>
          {sub}
        </p>
      </div>
      {action && (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 h-10 rounded-md text-[12px] uppercase tracking-[0.14em] font-bold transition-opacity hover:opacity-90"
          style={{ background: ORANGE_GRAD, color: "#1a1612", fontFamily: FONT_HEAD }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  trend,
  trendKind,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  trend: string;
  trendKind: "up" | "down" | "neutral";
  sub: string;
  icon: React.ReactNode;
  accent: string;
}) {
  const trendColor = trendKind === "up" ? accent : trendKind === "down" ? COPPER : TEXT_DIM;
  const trendIcon =
    trendKind === "up" ? <TrendUp size={11} weight="bold" /> : trendKind === "down" ? <TrendDown size={11} weight="bold" /> : null;
  const trendBg = trendKind === "up" ? ORANGE_DIM : trendKind === "down" ? RED_DIM : "rgba(255,255,255,0.05)";
  return (
    <div className="p-4 sm:p-5 rounded-xl border" style={{ background: SURFACE, borderColor: BORDER }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div
          className="inline-flex items-center justify-center w-9 h-9 rounded-md"
          style={{ background: ORANGE_DIM, color: ORANGE }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase tracking-[0.16em] font-bold"
            style={{ background: trendBg, color: trendColor, fontFamily: FONT_HEAD }}
          >
            {trendIcon}
            {trend}
          </span>
        )}
      </div>
      <div className="text-[24px] sm:text-[28px] font-bold leading-none mb-1.5 tabular-nums" style={{ color: TEXT, fontFamily: FONT_HEAD }}>
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-[0.18em] font-semibold mb-1.5" style={{ color: accent, fontFamily: FONT_HEAD }}>
        {label}
      </div>
      {sub && (
        <div className="text-[11px] leading-snug" style={{ color: TEXT_DIM }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className="px-5 sm:px-6 py-3 text-[10px] uppercase tracking-[0.18em] font-bold"
      style={{ textAlign: align, color: TEXT_DIM, fontFamily: FONT_HEAD }}
    >
      {children}
    </th>
  );
}

function Td({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <td className="px-5 sm:px-6 py-4 align-top" style={{ textAlign: align }}>
      {children}
    </td>
  );
}

function StatusPill({
  kind,
  label,
}: {
  kind: "in-progress" | "warn" | "blocked" | "pending";
  label: string;
}) {
  const cfg = {
    "in-progress": { bg: ORANGE_DIM, color: ORANGE, icon: <Truck size={11} weight="fill" /> },
    warn: { bg: COPPER_DIM, color: COPPER, icon: <Warning size={11} weight="fill" /> },
    blocked: { bg: "rgba(255,255,255,0.06)", color: TEXT_DIM, icon: <Hourglass size={11} weight="fill" /> },
    pending: { bg: BLUE_DIM, color: BLUE, icon: <CircleDashed size={11} weight="fill" /> },
  }[kind];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold leading-none"
      style={{ background: cfg.bg, color: cfg.color, fontFamily: FONT_HEAD }}
    >
      {cfg.icon}
      {label}
    </span>
  );
}

function StageBadge({
  kind,
  label,
}: {
  kind: "new" | "progress" | "booked";
  label: string;
}) {
  const cfg = {
    new: { bg: COPPER_DIM, color: COPPER_GOLD },
    progress: { bg: BLUE_DIM, color: BLUE },
    booked: { bg: ORANGE_DIM, color: ORANGE },
  }[kind];
  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded text-[10px] uppercase tracking-[0.14em] font-bold"
      style={{ background: cfg.bg, color: cfg.color, fontFamily: FONT_HEAD }}
    >
      {label}
    </span>
  );
}

function InvoiceStatus({
  kind,
  label,
}: {
  kind: "paid" | "pending" | "warn" | "draft";
  label: string;
}) {
  const cfg = {
    paid: { bg: ORANGE_DIM, color: ORANGE, icon: <CheckCircle size={11} weight="fill" /> },
    pending: { bg: BLUE_DIM, color: BLUE, icon: <Clock size={11} weight="fill" /> },
    warn: { bg: COPPER_DIM, color: COPPER, icon: <Warning size={11} weight="fill" /> },
    draft: { bg: "rgba(255,255,255,0.06)", color: TEXT_DIM, icon: <FileText size={11} weight="fill" /> },
  }[kind];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold leading-none"
      style={{ background: cfg.bg, color: cfg.color, fontFamily: FONT_HEAD }}
    >
      {cfg.icon}
      {label}
    </span>
  );
}

function ActivityRow({
  when,
  actor,
  action,
  detail,
  tone,
}: {
  when: string;
  actor: string;
  action: string;
  detail: string;
  tone: "ok" | "warn" | "info";
}) {
  const cfg = { ok: ORANGE, warn: COPPER, info: BLUE }[tone];
  return (
    <div
      className="grid grid-cols-[80px_1fr] gap-4 py-3 first:pt-0 last:pb-0"
      style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}
    >
      <div className="text-[11px] uppercase tracking-[0.16em] font-semibold pt-0.5" style={{ color: TEXT_DIM, fontFamily: FONT_HEAD }}>
        {when}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="font-bold text-[13px]" style={{ color: TEXT, fontFamily: FONT_HEAD }}>
            {actor}
          </span>
          <span className="text-[12px]" style={{ color: cfg }}>{action}</span>
        </div>
        <div className="text-[12px] leading-snug" style={{ color: TEXT_SOFT }}>
          {detail}
        </div>
      </div>
    </div>
  );
}

function ChecklistRow({ done, text, tone }: { done?: boolean; text: string; tone?: "warn" | "upgrade" }) {
  const icon = done ? (
    <CheckCircle size={14} weight="fill" style={{ color: ORANGE }} />
  ) : tone === "warn" ? (
    <Warning size={14} weight="fill" style={{ color: COPPER }} />
  ) : tone === "upgrade" ? (
    <Sparkle size={14} weight="fill" style={{ color: COPPER_GOLD }} />
  ) : (
    <CircleDashed size={14} weight="duotone" style={{ color: TEXT_DIM }} />
  );
  return (
    <div className="flex items-start gap-2.5 py-2" style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}>
      <span className="pt-0.5">{icon}</span>
      <span
        className="text-[13px] leading-snug"
        style={{ color: done ? TEXT_DIM : TEXT, textDecoration: done ? "line-through" : "none" }}
      >
        {text}
      </span>
    </div>
  );
}

function UpgradeRow({ label, caption }: { label: string; caption: string }) {
  return (
    <div
      className="mt-3 flex items-start gap-2.5 px-3 py-3 rounded-md border"
      style={{ background: COPPER_DIM, borderColor: "rgba(217, 119, 6, 0.30)" }}
    >
      <span
        className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md mt-0.5"
        style={{ background: COPPER_GRAD, color: "#1a1612" }}
      >
        <Sparkle size={12} weight="fill" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold" style={{ color: TEXT, fontFamily: FONT_HEAD }}>
          {label}
        </div>
        <div className="text-[10.5px] mt-0.5" style={{ color: COPPER_GOLD }}>
          {caption}
        </div>
      </div>
    </div>
  );
}

function UpgradePanel({ title, caption }: { title: string; caption: string }) {
  return (
    <section
      className="rounded-xl border p-5 sm:p-6 flex items-start gap-4"
      style={{ background: COPPER_DIM, borderColor: "rgba(217, 119, 6, 0.34)" }}
    >
      <span
        className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-md"
        style={{ background: COPPER_GRAD, color: "#1a1612" }}
      >
        <Sparkle size={16} weight="fill" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-bold mb-0.5" style={{ color: TEXT, fontFamily: FONT_HEAD }}>
          {title}
        </div>
        <div className="text-[13px]" style={{ color: COPPER_GOLD }}>
          {caption}
        </div>
      </div>
      <Link
        href="/clients/peninsula-paving#contact"
        className="self-center inline-flex items-center gap-1.5 px-4 h-10 rounded-md text-[11px] uppercase tracking-[0.14em] font-bold transition-opacity hover:opacity-90 whitespace-nowrap"
        style={{ background: COPPER_GRAD, color: "#1a1612", fontFamily: FONT_HEAD }}
      >
        Unlock
        <ArrowRight size={11} weight="bold" />
      </Link>
    </section>
  );
}

function RuleRow({ on, upgrade, label }: { on?: boolean; upgrade?: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0" style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}>
      <span className="text-[13px]" style={{ color: TEXT }}>{label}</span>
      {upgrade ? (
        <span
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] uppercase tracking-[0.16em] font-bold"
          style={{ background: COPPER_DIM, color: COPPER_GOLD, fontFamily: FONT_HEAD }}
        >
          <Sparkle size={10} weight="fill" />
          AI System
        </span>
      ) : (
        <span
          className="inline-flex items-center w-9 h-5 rounded-full"
          style={{ background: on ? ORANGE_GRAD : "rgba(255,255,255,0.10)" }}
        >
          <span
            className="block w-4 h-4 rounded-full bg-white transition-transform ml-0.5"
            style={{ transform: on ? "translateX(16px)" : "translateX(0)" }}
          />
        </span>
      )}
    </div>
  );
}

function NotifRow({ icon, label, via }: { icon: React.ReactNode; label: string; via: string }) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0" style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}>
      <span style={{ color: ORANGE }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold" style={{ color: TEXT }}>{label}</div>
        <div className="text-[11px]" style={{ color: TEXT_DIM }}>→ {via}</div>
      </div>
    </div>
  );
}

function IntegrationStatus({ kind }: { kind: "connected" | "ready" | "off" }) {
  const cfg = {
    connected: { color: ORANGE, bg: ORANGE_DIM, label: "Connected", icon: <CheckCircle size={10} weight="fill" /> },
    ready: { color: BLUE, bg: BLUE_DIM, label: "Ready", icon: <CircleDashed size={10} weight="fill" /> },
    off: { color: COPPER_GOLD, bg: COPPER_DIM, label: "AI System", icon: <Sparkle size={10} weight="fill" /> },
  }[kind];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] uppercase tracking-[0.16em] font-bold"
      style={{ background: cfg.bg, color: cfg.color, fontFamily: FONT_HEAD }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

/* ─────────────────────────  FOOTER  ──────────────────────── */

function DashboardFooter() {
  return (
    <footer className="border-t mt-6" style={{ background: SURFACE_HEADER, borderColor: BORDER }}>
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px]">
        <span className="inline-flex items-center gap-2" style={{ color: TEXT_DIM }}>
          <Lock size={12} weight="fill" />
          Owner-only · Private preview · Mock data
        </span>
        <Link
          href="/clients/peninsula-paving#contact"
          className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
          style={{ color: COPPER_GOLD, fontFamily: FONT_HEAD }}
        >
          <Sparkle size={12} weight="fill" />
          <span className="font-semibold">Unlock the full system →</span>
        </Link>
        <a
          href="https://bluejayportfolio.com/audit"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold transition-opacity hover:opacity-70"
          style={{ color: ORANGE }}
        >
          Built by BlueJays
        </a>
      </div>
    </footer>
  );
}
