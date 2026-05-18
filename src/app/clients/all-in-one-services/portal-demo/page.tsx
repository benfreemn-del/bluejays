"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * /clients/all-in-one-services/portal-demo
 *
 * Dark comprehensive admin mockup for Kyle. Locked 2026-05-18 after
 * Ben's "make it dark + comprehensive like the BlueJays backend, but
 * for their business" brief. Visual language mirrors the actual
 * /dashboard admin app: top brand strip, horizontal tab nav, dense
 * data tables, stat strips, raised panels.
 *
 * 8 tabs, each with substantive mock content keyed to Kyle's real
 * business (named projects, real reviewer names, real WA L&I license,
 * real Sequim/Clallam pain points):
 *   1. Overview        — diagnostic stat strip + activity feed
 *   2. Projects        — full job board (5 named + 2 mock pipeline)
 *   3. Leads           — inbox unifying contact-form / missed calls /
 *                        manual entries with stage + next action
 *   4. Reviews         — review funnel with capture + reply queue +
 *                        negative-feedback private inbox
 *   5. Schedule        — week calendar with crew assignments +
 *                        permit inspections
 *   6. Invoices        — list + change-order signoff drill-down
 *   7. Credentials     — license / bond / insurance renewal vault
 *   8. Settings        — automations, integrations, team
 *
 * Gate: kyle2016 (rotate to revoke).
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
  Buildings,
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
  ChartBar,
  CircleDashed,
} from "@phosphor-icons/react";
import AIOSMark from "../aios-mark";

// Rotate to revoke
const GATE_CODE = "kyle2016";

/* ─────────────────────────  DARK ADMIN PALETTE  ──────────────────────── */
const BG = "#0a0a0a";              // page bg
const SURFACE = "#141414";          // panel bg
const SURFACE_RAISED = "#1c1c1c";   // raised card / table row hover
const SURFACE_HEADER = "#0f0f0f";   // sticky header
const BORDER = "#2a2a2a";
const BORDER_SOFT = "#1f1f1f";
const TEXT = "#fafafa";
const TEXT_SOFT = "rgba(250, 250, 250, 0.72)";
const TEXT_DIM = "rgba(250, 250, 250, 0.48)";
const TEXT_FAINT = "rgba(250, 250, 250, 0.30)";

const MOSS = "#4a8a5c";             // PNW evergreen — brighter on dark
const MOSS_DEEP = "#2d4a35";
const MOSS_DIM = "rgba(74, 138, 92, 0.22)";
const MOSS_GRAD = `linear-gradient(135deg, #6aa779 0%, #4a8a5c 55%, #2d4a35 100%)`;

const COPPER = "#d97706";           // upgrade/buy moments only
const COPPER_GOLD = "#fbbf24";
const COPPER_DIM = "rgba(217, 119, 6, 0.22)";
const COPPER_GRAD = `linear-gradient(135deg, ${COPPER_GOLD} 0%, ${COPPER} 100%)`;

const RED = "#ef4444";              // warnings / overdue
const RED_DIM = "rgba(239, 68, 68, 0.18)";
const BLUE = "#3b82f6";             // info / pending
const BLUE_DIM = "rgba(59, 130, 246, 0.18)";

const FONT_HEAD = "'Space Grotesk', sans-serif";
const FONT_BODY = "'Inter', sans-serif";

/* ─────────────────────────  MOCK DATA  ──────────────────────── */

type TabId =
  | "overview"
  | "projects"
  | "leads"
  | "reviews"
  | "schedule"
  | "invoices"
  | "credentials"
  | "settings";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <Gauge size={14} weight="duotone" /> },
  { id: "projects", label: "Projects", icon: <Hammer size={14} weight="duotone" /> },
  { id: "leads", label: "Leads", icon: <Funnel size={14} weight="duotone" /> },
  { id: "reviews", label: "Reviews", icon: <Star size={14} weight="duotone" /> },
  { id: "schedule", label: "Schedule", icon: <Calendar size={14} weight="duotone" /> },
  { id: "invoices", label: "Invoices", icon: <FileText size={14} weight="duotone" /> },
  { id: "credentials", label: "Credentials", icon: <Certificate size={14} weight="duotone" /> },
  { id: "settings", label: "Settings", icon: <GearSix size={14} weight="duotone" /> },
];

const PROJECTS = [
  { name: "Soldate Shower", location: "Sequim, WA", type: "Custom tile shower", status: "Complete · 5★ review captured", statusKind: "done" as const, crew: "Kyle · Mike · Dan", pct: 100, value: 32400, days: 28, nextAction: "Review captured from homeowner" },
  { name: "710 Del Guzzi Drive", location: "Sequim, WA", type: "Bathroom remodel", status: "Change order pending signature", statusKind: "warn" as const, crew: "Kyle · Mike · Sub: ProTile", pct: 65, value: 48900, days: 14, nextAction: "Auto-reminder fires tomorrow 9am" },
  { name: "Jay Sakas Addition", location: "Port Angeles, WA", type: "2-story addition", status: "Week 4 of 7 · framing inspection Tue 9am", statusKind: "in-progress" as const, crew: "Kyle · Dan · Sub: Roy Electric", pct: 55, value: 184200, days: 26, nextAction: "Inspection checklist + subs notified" },
  { name: "Brody Office Conversion", location: "Sequim, WA", type: "Commercial buildout", status: "Final walkthrough scheduled Fri 1pm", statusKind: "in-progress" as const, crew: "Kyle · Mike", pct: 92, value: 67800, days: 21, nextAction: "Punch list synced" },
  { name: "Vineyard Wine Cellar", location: "Sequim, WA", type: "Custom specialty", status: "Awaiting copper-tile delivery · ETA Monday", statusKind: "blocked" as const, crew: "Kyle · Dan", pct: 78, value: 56500, days: 18, nextAction: "Auto-text fires when delivery confirms" },
  { name: "Henderson Kitchen Gut", location: "Port Townsend, WA", type: "Kitchen remodel", status: "Permit filed · waiting on Jefferson County", statusKind: "pending" as const, crew: "Unassigned", pct: 5, value: 72500, days: 3, nextAction: "Demo starts when permit issues" },
  { name: "Eastman Deck Rebuild", location: "Sequim, WA", type: "Composite deck + pergola", status: "Estimate signed · materials ordered", statusKind: "pending" as const, crew: "Mike · Dan", pct: 12, value: 28900, days: 1, nextAction: "Demo Monday morning" },
];

const LEADS = [
  { name: "Sarah Mendelson", phone: "(360) 555-1042", source: "Contact form", project: "Kitchen remodel quote", stage: "New", stageKind: "new" as const, when: "Today · 11:42am", value: "~$55K", action: "Site walk scheduled · Saturday 10am" },
  { name: "Frank Wilson", phone: "(360) 555-7715", source: "Missed call", project: "Master bath remodel · Port Angeles", stage: "Reply sent", stageKind: "progress" as const, when: "Yesterday · 11:03am", value: "~$40K", action: "Auto-SMS sent with booking link · awaiting reply" },
  { name: "Linda Park", phone: "(360) 555-4892", source: "Missed call", project: "Estimate (unspecified)", stage: "Booked", stageKind: "booked" as const, when: "Tuesday · 2:14pm", value: "TBD", action: "Saturday 11am estimate" },
  { name: "Greg Olson", phone: "(360) 555-2230", source: "Missed call", project: "Kitchen photo sent in text", stage: "Booked", stageKind: "booked" as const, when: "Today · 8:47am", value: "~$30K", action: "Wednesday 2pm walkthrough" },
  { name: "Maria Vasquez", phone: "(360) 555-3318", source: "Contact form", project: "Addition + bath", stage: "Quoted", stageKind: "progress" as const, when: "3 days ago", value: "$110K quote sent", action: "Follow-up scheduled · Friday" },
  { name: "Tom Hartwell", phone: "(360) 555-9981", source: "Referral (Hilary Rosen)", project: "Whole-home refresh", stage: "Quoted", stageKind: "progress" as const, when: "5 days ago", value: "$220K quote sent", action: "Decision expected next week" },
  { name: "Ashley Bremerton", phone: "(360) 555-4404", source: "Facebook DM", project: "Pergola + outdoor kitchen", stage: "New", stageKind: "new" as const, when: "Today · 9:12am", value: "~$22K", action: "AI suggested reply ready · Locked → AI System" },
];

const REVIEWS = [
  { name: "Hilary Rosen", state: "captured", stars: 5, when: "3 weeks ago", quote: "Customer service, spectacular results, attention to detail, being flexible when necessary." },
  { name: "Bill Bryant", state: "captured", stars: 5, when: "1 month ago", quote: "Code compliant, high level of craftsmanship and the ability to follow through to the end." },
  { name: "Tom Sandy", state: "scheduled", stars: 0, when: "Job finished 4 days ago", quote: "Auto-text scheduled for tomorrow 10am" },
  { name: "Michael Kurtze", state: "never-asked", stars: 0, when: "Job finished 9 months ago", quote: "Never asked · 1 tap to request" },
  { name: "Vicki Walp", state: "private", stars: 1, when: "1 year ago", quote: "PRIVATE — Auto-filter intercepted before it reached Google. Sent to your inbox only." },
  { name: "Diana Cho", state: "captured", stars: 5, when: "2 months ago", quote: "Built our dream kitchen in 6 weeks. The crew was on time every single day." },
  { name: "Robert Pugh", state: "captured", stars: 5, when: "3 months ago", quote: "Honest estimate. No surprises. Will hire again." },
  { name: "Jenny McCallum", state: "captured", stars: 4, when: "4 months ago", quote: "Excellent finished product. One small delay on materials but communicated well." },
  { name: "Steven Pretty", state: "scheduled", stars: 0, when: "Job finished today", quote: "Auto-text scheduled for Sunday 10am · 3 days post-walkthrough" },
];

const MISSED_CALLS = [
  { when: "Tuesday · 2:14pm", number: "(360) ***-4892", duration: "47s no-answer", outcome: "Saturday estimate booked", won: true },
  { when: "Yesterday · 11:03am", number: "(360) ***-7715", duration: "12s → voicemail", outcome: "Replied with walkthrough link · awaiting", won: false },
  { when: "Today · 8:47am", number: "(360) ***-2230", duration: "Busy signal", outcome: "Wednesday 2pm walkthrough booked", won: true },
];

const SCHEDULE = [
  // Week of May 19-23, 2026 (Mon-Fri)
  { day: "Mon · May 19", events: [
    { time: "7:30am", title: "Soldate · final walk", crew: "Kyle", color: MOSS },
    { time: "9:00am", title: "Eastman Deck · demo start", crew: "Mike + Dan", color: COPPER },
    { time: "11:00am", title: "Jay Sakas · subfloor inspection prep", crew: "Kyle", color: MOSS },
  ] },
  { day: "Tue · May 20", events: [
    { time: "9:00am", title: "Jay Sakas · framing inspection", crew: "Kyle + Roy Electric", color: RED, important: true },
    { time: "1:00pm", title: "710 Del Guzzi · tile prep", crew: "Mike + ProTile", color: MOSS },
  ] },
  { day: "Wed · May 21", events: [
    { time: "8:00am", title: "Brody Office · punch list", crew: "Kyle + Mike", color: MOSS },
    { time: "2:00pm", title: "Greg Olson · estimate walkthrough", crew: "Kyle", color: COPPER },
  ] },
  { day: "Thu · May 22", events: [
    { time: "All day", title: "Wine Cellar · copper tile install", crew: "Kyle + Dan", color: MOSS },
  ] },
  { day: "Fri · May 23", events: [
    { time: "10:00am", title: "Maria Vasquez · follow-up call", crew: "Kyle", color: COPPER },
    { time: "1:00pm", title: "Brody Office · final walkthrough", crew: "Kyle + client", color: MOSS, important: true },
  ] },
];

const INVOICES = [
  { num: "INV-2026-041", project: "Soldate Shower", amount: 32400, status: "Paid", statusKind: "paid" as const, date: "2026-05-10" },
  { num: "INV-2026-042", project: "Brody Office · Milestone 3", amount: 16950, status: "Pending · 5 days", statusKind: "pending" as const, date: "2026-05-13" },
  { num: "INV-2026-043", project: "710 Del Guzzi · Milestone 2", amount: 24450, status: "Paid", statusKind: "paid" as const, date: "2026-05-08" },
  { num: "INV-2026-044", project: "Jay Sakas · Milestone 2", amount: 46050, status: "Pending · 2 days", statusKind: "pending" as const, date: "2026-05-16" },
  { num: "CO-2026-014", project: "710 Del Guzzi · Change order", amount: 7900, status: "Awaiting signature · 3 days", statusKind: "warn" as const, date: "2026-05-15" },
  { num: "INV-2026-045", project: "Wine Cellar · Milestone 3", amount: 19250, status: "Draft", statusKind: "draft" as const, date: "2026-05-18" },
];

const CREDENTIALS = [
  { label: "WA L&I License", value: "ALLONOS841DJ", renewedAt: "2026-03-18", nextRenewal: "2027-03-18", daysUntil: 304, issuer: "WA Department of Labor & Industries" },
  { label: "General Liability Insurance", value: "$1,000,000 policy", renewedAt: "2025-09-04", nextRenewal: "2026-09-04", daysUntil: 109, issuer: "Ohio Security Insurance Co" },
  { label: "Surety Bond", value: "$12,000 contractor bond", renewedAt: "2026-03-18", nextRenewal: "2027-03-18", daysUntil: 304, issuer: "Western Surety Co" },
  { label: "USDOT Authority", value: "USDOT 3515033", renewedAt: "2025-11-12", nextRenewal: "2026-11-12", daysUntil: 178, issuer: "Federal Motor Carrier Safety Admin" },
];

const TEAM = [
  { name: "Kyle B. Fritz", role: "Owner · GC", phone: "(360) 477-6859", initials: "KF" },
  { name: "Abi Fritz", role: "Operations · co-owner", phone: "(360) 477-6859", initials: "AF" },
  { name: "Mike Cordova", role: "Lead carpenter", phone: "(360) 555-2014", initials: "MC" },
  { name: "Dan Bremerton", role: "Finish carpentry", phone: "(360) 555-3387", initials: "DB" },
];

const INTEGRATIONS = [
  { name: "Twilio · SMS + voice", status: "connected" as const, detail: "(360) 477-6859 · 4 calls today" },
  { name: "Google Business Profile", status: "connected" as const, detail: "4.6★ · 18 reviews · synced 2h ago" },
  { name: "SendGrid · email", status: "connected" as const, detail: "from: bluejaycontactme@gmail.com" },
  { name: "Stripe · invoices", status: "ready" as const, detail: "Not yet activated · 1-click enable" },
  { name: "QuickBooks · accounting", status: "off" as const, detail: "Available with AI System tier" },
  { name: "Calendly · estimate booking", status: "off" as const, detail: "Available with AI System tier" },
];

/* ─────────────────────────  PAGE SHELL  ──────────────────────── */

export default function PortalDemoPage() {
  const [input, setInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

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
            {activeTab === "projects" && <ProjectsTab />}
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
        href="/clients/all-in-one-services"
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
          style={{ background: COPPER_GRAD, color: "#1a1612" }}
        >
          <LockKey size={22} weight="duotone" />
        </div>
        <h1
          className="text-[28px] sm:text-[34px] font-bold tracking-tight leading-[1.05] mb-3"
          style={{ color: TEXT, fontFamily: FONT_HEAD }}
        >
          Kyle&apos;s owner portal.
        </h1>
        <p
          className="text-[15px] leading-relaxed mb-7"
          style={{ color: TEXT_SOFT, fontFamily: FONT_BODY }}
        >
          Private access for the owner of All In One Service&apos;s LLC.
          Enter your access code to see the dashboard the AI System
          would build for you, with your real data.
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
              className="w-full bg-transparent border-b outline-none py-2.5 text-[18px] font-mono transition-colors"
              style={{
                borderColor: error ? RED : BORDER,
                color: TEXT,
                caretColor: MOSS,
              }}
            />
          </label>
          {error && (
            <p
              className="text-[13px] mb-5"
              style={{ color: RED, fontFamily: FONT_BODY }}
            >
              Wrong code. Try again — or text Ben at BlueJays if you lost it.
            </p>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 h-12 rounded-md font-bold text-[13px] uppercase tracking-[0.16em] transition-all hover:brightness-110 active:scale-95"
            style={{
              background: COPPER_GRAD,
              color: "#1a1612",
              fontFamily: FONT_HEAD,
              boxShadow: "0 6px 18px rgba(217, 119, 6, 0.35)",
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
          href="mailto:bluejaycontactme@gmail.com?subject=All%20In%20One%20Services%20portal%20access"
          className="font-semibold transition-opacity hover:opacity-70"
          style={{ color: MOSS }}
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
          href="/clients/all-in-one-services"
          className="flex min-w-0 items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <AIOSMark size={36} flat />
          <div className="min-w-0">
            <p
              className="text-[10px] uppercase tracking-[0.20em] font-semibold"
              style={{ color: MOSS, fontFamily: FONT_HEAD }}
            >
              All In One Services
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
              background: "rgba(74, 138, 92, 0.12)",
              border: `1px solid ${MOSS_DIM}`,
              color: MOSS,
              fontFamily: FONT_HEAD,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: MOSS, boxShadow: `0 0 8px ${MOSS}` }}
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
                background: MOSS_GRAD,
                color: "#fafafa",
                fontFamily: FONT_HEAD,
              }}
            >
              KF
            </div>
            <div className="hidden sm:block leading-tight">
              <div
                className="text-[13px] font-bold"
                style={{ color: TEXT, fontFamily: FONT_HEAD }}
              >
                Kyle Fritz
              </div>
              <div
                className="text-[10px] uppercase tracking-[0.16em]"
                style={{ color: TEXT_DIM, fontFamily: FONT_HEAD }}
              >
                Owner
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
                <span style={{ color: isActive ? MOSS : TEXT_DIM }}>
                  {t.icon}
                </span>
                {t.label}
                {isActive && (
                  <span
                    className="absolute left-3 right-3 -bottom-px h-[2px]"
                    style={{ background: MOSS_GRAD }}
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
      {/* Greeting */}
      <div>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.22em] mb-4"
          style={{
            background: "rgba(74, 138, 92, 0.10)",
            border: `1px solid ${MOSS_DIM}`,
            color: MOSS,
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
          Good morning, Kyle.
        </h2>
        <p
          className="text-[15px] sm:text-[17px] leading-relaxed max-w-2xl"
          style={{ color: TEXT_SOFT }}
        >
          The shop, one page. Last 24 hours of activity at the top. Everything else lives under its own tab — click around.
        </p>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Active job value"
          value="$389,800"
          trend="+$72K"
          trendKind="up"
          sub="6 projects in flight · ~$65K avg"
          icon={<CurrencyDollar size={18} weight="duotone" />}
        />
        <StatCard
          label="New leads this week"
          value="7"
          trend="+3 vs last"
          trendKind="up"
          sub="2 from missed-call recovery · 3 from form"
          icon={<Funnel size={18} weight="duotone" />}
        />
        <StatCard
          label="Reviews captured"
          value="3 / 12"
          trend="9 un-asked"
          trendKind="down"
          sub="last 90 days · auto-text rollout would lift to 9/12"
          icon={<Star size={18} weight="duotone" />}
        />
        <StatCard
          label="Days to L&I renewal"
          value="304"
          trend="auto-set"
          trendKind="neutral"
          sub="reminder at 60 / 30 / 7 days"
          icon={<Certificate size={18} weight="duotone" />}
        />
      </div>

      {/* Two-column: Activity feed + Quick actions */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <Panel title="Recent activity" icon={<Lightning size={14} weight="fill" />}>
          <ActivityRow
            when="11:42am"
            actor="Sarah Mendelson"
            action="submitted contact form"
            detail="Kitchen remodel quote · auto-SMS sent with booking link · saved to Leads"
            tone="info"
          />
          <ActivityRow
            when="9:30am"
            actor="710 Del Guzzi"
            action="change order auto-reminder fired"
            detail="Homeowner texted: 'Reviewing tonight, will sign tomorrow.' · captured to project notes"
            tone="warn"
          />
          <ActivityRow
            when="8:47am"
            actor="Greg Olson"
            action="recovered from missed call"
            detail="Auto-SMS replied within 18 min → Wednesday 2pm walkthrough booked"
            tone="ok"
          />
          <ActivityRow
            when="Yesterday 4:12pm"
            actor="Soldate Shower"
            action="5★ review captured to Google"
            detail="Hilary Rosen · 3-day post-walkthrough auto-text · reposted to your site"
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
            actor="Jay Sakas Addition"
            action="framing inspection scheduled Tue 9am"
            detail="Inspection checklist auto-generated · Roy Electric notified for tie-in"
            tone="info"
          />
        </Panel>

        <Panel title="Today's punch list" icon={<ListChecks size={14} weight="fill" />}>
          <ChecklistRow done text="Send walkthrough video to Maria Vasquez" />
          <ChecklistRow done text="Confirm tile delivery ETA · Wine Cellar" />
          <ChecklistRow text="Review change order CO-2026-014" tone="warn" />
          <ChecklistRow text="Reply to Ashley's pergola DM (AI draft ready)" tone="upgrade" />
          <ChecklistRow text="Tap to request 9 review asks" tone="upgrade" />
          <ChecklistRow text="Confirm Friday Brody walkthrough invitees" />
          <UpgradeRow
            label="Unlock AI auto-replies + auto-review-asks"
            caption="AI System tier · 1-click enable"
          />
        </Panel>
      </div>
    </div>
  );
}

/* ─────────────────────────  TAB: PROJECTS  ──────────────────────── */

function ProjectsTab() {
  return (
    <div className="space-y-8">
      <TabHeader
        title="Projects"
        sub="Every active job, ordered by next action. Click a row to expand the full project file."
        action="+ New project"
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Active value" value="$389,800" trend="6 jobs" trendKind="neutral" sub="" icon={<CurrencyDollar size={16} weight="duotone" />} />
        <StatCard label="Permits open" value="3" trend="2 Clallam · 1 Jefferson" trendKind="neutral" sub="" icon={<Certificate size={16} weight="duotone" />} />
        <StatCard label="Avg job duration" value="42d" trend="-4 vs Q1" trendKind="up" sub="" icon={<Calendar size={16} weight="duotone" />} />
        <StatCard label="Crew utilization" value="91%" trend="3 booked thru Jun" trendKind="up" sub="" icon={<Users size={16} weight="duotone" />} />
      </div>
      <Panel title="Active jobs" icon={<Hammer size={14} weight="fill" />}>
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ color: TEXT_DIM, borderBottom: `1px solid ${BORDER}` }}>
                <Th>Project</Th>
                <Th>Status</Th>
                <Th>Crew</Th>
                <Th>Progress</Th>
                <Th align="right">Value</Th>
              </tr>
            </thead>
            <tbody>
              {PROJECTS.map((p) => (
                <tr
                  key={p.name}
                  className="transition-colors hover:bg-white/[0.03] cursor-pointer"
                  style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}
                >
                  <Td>
                    <div
                      className="font-bold mb-0.5"
                      style={{ color: TEXT, fontFamily: FONT_HEAD }}
                    >
                      {p.name}
                    </div>
                    <div
                      className="text-[11px] uppercase tracking-[0.16em]"
                      style={{ color: TEXT_DIM, fontFamily: FONT_HEAD }}
                    >
                      {p.location} · {p.type}
                    </div>
                  </Td>
                  <Td>
                    <StatusPill kind={p.statusKind} label={p.status} />
                  </Td>
                  <Td>
                    <span style={{ color: TEXT_SOFT }}>{p.crew}</span>
                  </Td>
                  <Td>
                    <ProgressBar pct={p.pct} />
                  </Td>
                  <Td align="right">
                    <span
                      className="font-bold tabular-nums"
                      style={{ color: TEXT, fontFamily: FONT_HEAD }}
                    >
                      ${p.value.toLocaleString()}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
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
        sub="One inbox for every channel — contact form, missed-call recovery, manual entries, Facebook DMs."
        action="+ Add lead"
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="New this week" value="7" trend="+3" trendKind="up" sub="3 form · 3 missed call · 1 DM" icon={<Funnel size={16} weight="duotone" />} />
        <StatCard label="Estimates booked" value="2" trend="+1" trendKind="up" sub="" icon={<Calendar size={16} weight="duotone" />} />
        <StatCard label="Quotes outstanding" value="$330K" trend="2 quotes" trendKind="neutral" sub="Maria $110K · Tom $220K" icon={<CurrencyDollar size={16} weight="duotone" />} />
        <StatCard label="Avg response time" value="18m" trend="auto" trendKind="up" sub="industry benchmark: 4h" icon={<Lightning size={16} weight="duotone" />} />
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
                    <div
                      className="font-bold"
                      style={{ color: TEXT, fontFamily: FONT_HEAD }}
                    >
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
                    <span
                      className="font-bold tabular-nums"
                      style={{ color: TEXT, fontFamily: FONT_HEAD }}
                    >
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
        caption="AI System tier · drafts replies in your voice for every inbound lead. You read it, tap send, move on. Drops your response time from 4h to 60 seconds."
      />
      <Panel title="Missed-call recovery feed" icon={<PhoneIncoming size={14} weight="fill" />}>
        <div className="space-y-3">
          {MISSED_CALLS.map((c, i) => (
            <div
              key={i}
              className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 p-4 rounded-lg border"
              style={{
                background: SURFACE_RAISED,
                borderColor: c.won ? MOSS_DIM : BORDER,
              }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-bold text-[14px]"
                    style={{ color: TEXT, fontFamily: FONT_HEAD }}
                  >
                    {c.number}
                  </span>
                  <span
                    className="text-[10px] uppercase tracking-[0.16em] font-semibold"
                    style={{ color: TEXT_DIM, fontFamily: FONT_HEAD }}
                  >
                    {c.when} · {c.duration}
                  </span>
                </div>
                <div className="text-[12px]" style={{ color: TEXT_SOFT }}>
                  <span style={{ color: MOSS, fontWeight: 600 }}>→ Outcome:</span>{" "}
                  {c.outcome}
                </div>
              </div>
              {c.won && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] uppercase tracking-[0.16em] font-bold self-start"
                  style={{
                    background: MOSS_DIM,
                    color: MOSS,
                    fontFamily: FONT_HEAD,
                  }}
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
        sub="5-star routes to Google. Anything less stays private to you. Auto-text fires 3 days after every walkthrough."
        action="Request 9 reviews →"
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Aggregate rating" value="4.6★" trend="" trendKind="neutral" sub="18 verified reviews" icon={<Star size={16} weight="duotone" />} />
        <StatCard label="Captured (90 days)" value="6" trend="+2" trendKind="up" sub="all 5★ to Google" icon={<CheckCircle size={16} weight="duotone" />} />
        <StatCard label="Auto-scheduled" value="2" trend="next 7 days" trendKind="neutral" sub="Tom Sandy · Steven Pretty" icon={<Clock size={16} weight="duotone" />} />
        <StatCard label="Negatives intercepted" value="1" trend="kept private" trendKind="up" sub="Vicki Walp (1★) routed to inbox" icon={<ShieldCheck size={16} weight="duotone" />} />
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
    captured: { label: "Posted to Google", color: MOSS, bg: MOSS_DIM, icon: <CheckCircle size={12} weight="fill" /> },
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
          {review.state === "private" ? null : <>&ldquo;{review.quote}&rdquo;</>}
          {review.state === "private" && review.quote}
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
              background: review.state === "never-asked" ? COPPER_GRAD : MOSS_GRAD,
              color: review.state === "never-asked" ? "#1a1612" : "#fafafa",
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
        sub="Week of May 19 · drag jobs between days · crew columns sync to project files."
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
                style={{ color: MOSS, fontFamily: FONT_HEAD }}
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
                          style={{
                            background: RED_DIM,
                            color: RED,
                            fontFamily: FONT_HEAD,
                          }}
                        >
                          Inspection
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
    </div>
  );
}

/* ─────────────────────────  TAB: INVOICES  ──────────────────────── */

function InvoicesTab() {
  return (
    <div className="space-y-8">
      <TabHeader
        title="Invoices &amp; change orders"
        sub="Itemized invoices auto-generated from approved estimates. Digital signoff. Stripe-paid in two taps."
        action="+ New invoice"
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Paid (90 days)" value="$104,850" trend="+18%" trendKind="up" sub="" icon={<CurrencyDollar size={16} weight="duotone" />} />
        <StatCard label="Pending" value="$41,400" trend="2 invoices" trendKind="neutral" sub="" icon={<Clock size={16} weight="duotone" />} />
        <StatCard label="Awaiting signoff" value="$7,900" trend="3 days old" trendKind="down" sub="710 Del Guzzi · CO-2026-014" icon={<Warning size={16} weight="duotone" />} />
        <StatCard label="Draft" value="$19,250" trend="1" trendKind="neutral" sub="ready to send" icon={<FileText size={16} weight="duotone" />} />
      </div>
      <Panel title="All invoices" icon={<FileText size={14} weight="fill" />}>
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ color: TEXT_DIM, borderBottom: `1px solid ${BORDER}` }}>
                <Th>Number</Th>
                <Th>Project / milestone</Th>
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
                    <span
                      className="font-bold font-mono text-[12px]"
                      style={{ color: TEXT, fontFamily: FONT_HEAD }}
                    >
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
                    <span
                      className="font-bold tabular-nums"
                      style={{ color: TEXT, fontFamily: FONT_HEAD }}
                    >
                      ${inv.amount.toLocaleString()}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Drilled-in change order */}
      <Panel title="Change order detail · CO-2026-014" icon={<PenNib size={14} weight="fill" />}>
        <div className="grid sm:grid-cols-[2fr_1fr] gap-6">
          <div>
            <div
              className="text-[11px] uppercase tracking-[0.18em] font-semibold mb-3"
              style={{ color: TEXT_DIM, fontFamily: FONT_HEAD }}
            >
              Scope addition · 710 Del Guzzi Drive
            </div>
            <ul className="space-y-2 text-[13px] leading-snug" style={{ color: TEXT_SOFT }}>
              <COLine label="Heated tile floor" detail="Schluter Ditra-Heat · 52 sq ft" amount="$3,200" />
              <COLine label="Frameless glass shower upgrade" detail="½' tempered glass + matte-black hardware" amount="$3,850" />
              <COLine label="Electrical sub re-route" detail="4 labor-hours · dedicated heated-floor circuit" amount="$680" />
              <COLine label="Permit amendment fee" detail="Clallam County" amount="$170" />
              <COLine label="Timeline impact" detail="+5 working days" amount="—" />
            </ul>
          </div>
          <div
            className="rounded-lg p-5 self-start"
            style={{ background: SURFACE_RAISED, border: `1px solid ${BORDER}` }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-2"
              style={{ color: TEXT_DIM, fontFamily: FONT_HEAD }}
            >
              Total
            </div>
            <div
              className="text-[28px] font-bold tabular-nums mb-3"
              style={{ color: TEXT, fontFamily: FONT_HEAD }}
            >
              $7,900.00
            </div>
            <div
              className="text-[11px] uppercase tracking-[0.16em] font-semibold mb-3"
              style={{ color: COPPER, fontFamily: FONT_HEAD }}
            >
              Awaiting signature · 3 days
            </div>
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-md text-[11px] uppercase tracking-[0.14em] font-bold transition-opacity hover:opacity-90"
              style={{ background: MOSS_GRAD, color: "#fafafa", fontFamily: FONT_HEAD }}
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
        <CaretRight size={12} weight="bold" style={{ color: MOSS, marginTop: 4 }} />
        <div>
          <div className="font-bold" style={{ color: TEXT }}>
            {label}
          </div>
          <div className="text-[12px]" style={{ color: TEXT_DIM }}>
            {detail}
          </div>
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
        sub="License, bond, insurance, DOT. Auto-reminders 60 / 30 / 7 days before each renewal."
        action="Upload document"
      />
      <div className="grid sm:grid-cols-2 gap-4">
        {CREDENTIALS.map((c) => (
          <CredCard key={c.label} cred={c} />
        ))}
      </div>
      <Panel title="Document vault" icon={<FileText size={14} weight="fill" />}>
        <DocumentRow name="WA L&I License — current.pdf" size="412 KB" updated="2026-03-19" />
        <DocumentRow name="Ohio Security GL Certificate — 2025-2026.pdf" size="284 KB" updated="2025-09-05" />
        <DocumentRow name="Western Surety Bond — current.pdf" size="198 KB" updated="2026-03-19" />
        <DocumentRow name="USDOT 3515033 — registration.pdf" size="156 KB" updated="2025-11-13" />
        <DocumentRow name="BBB A+ rating confirmation — 2026.pdf" size="89 KB" updated="2026-01-04" />
      </Panel>
    </div>
  );
}

function CredCard({ cred }: { cred: typeof CREDENTIALS[number] }) {
  const urgent = cred.daysUntil < 60;
  const ringPct = Math.max(0, Math.min(100, ((365 - cred.daysUntil) / 365) * 100));
  return (
    <div
      className="p-5 sm:p-6 rounded-xl border"
      style={{ background: SURFACE, borderColor: BORDER }}
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
            className="text-[16px] font-bold tracking-tight font-mono"
            style={{ color: TEXT, fontFamily: FONT_HEAD }}
          >
            {cred.value}
          </div>
        </div>
        <div
          className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full relative"
          style={{
            background: "conic-gradient(" + MOSS + " " + ringPct + "%, rgba(74, 138, 92, 0.12) " + ringPct + "%)",
          }}
        >
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full"
            style={{ background: SURFACE, color: MOSS }}
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
          <div
            className="text-[13px] font-bold tabular-nums font-mono"
            style={{ color: urgent ? COPPER : TEXT, fontFamily: FONT_HEAD }}
          >
            {cred.nextRenewal} ({cred.daysUntil}d)
          </div>
        </div>
      </div>
      <div
        className="text-[11px] pt-3 border-t"
        style={{ color: TEXT_DIM, borderColor: BORDER }}
      >
        <span style={{ color: MOSS, fontWeight: 600 }}>Auto-reminder:</span>{" "}
        60 / 30 / 7 days · {cred.issuer}
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
        <FileText size={16} weight="duotone" style={{ color: MOSS }} />
        <div className="min-w-0">
          <div
            className="font-bold text-[13px] truncate"
            style={{ color: TEXT, fontFamily: FONT_HEAD }}
          >
            {name}
          </div>
          <div className="text-[11px]" style={{ color: TEXT_DIM }}>
            {size} · updated {updated}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-white/5"
          style={{ color: TEXT_SOFT }}
          aria-label="View"
        >
          <Eye size={14} weight="duotone" />
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-white/5"
          style={{ color: TEXT_SOFT }}
          aria-label="Download"
        >
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
        sub="Team members, automation preferences, integrations, notification routing."
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
                    style={{ background: MOSS_GRAD, color: "#fafafa", fontFamily: FONT_HEAD }}
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
          <RuleRow on label="Auto-text past customers 3 days after walkthrough" />
          <RuleRow on label="Recover missed calls with auto-SMS within 30 seconds" />
          <RuleRow on label="Auto-remind unsigned change orders every 24h" />
          <RuleRow on label="License + bond renewals at 60 / 30 / 7 days" />
          <RuleRow upgrade label="AI replies to inbound leads in your voice" />
          <RuleRow upgrade label="Database reactivation campaign every 90 days" />
          <RuleRow upgrade label="Hyperloop self-learning ads on Facebook + Google" />
        </Panel>

        <Panel title="Notification routing" icon={<Bell size={14} weight="fill" />}>
          <NotifRow icon={<Phone size={14} weight="duotone" />} label="Missed-call SMS sent" via="SMS to Kyle" />
          <NotifRow icon={<EnvelopeSimple size={14} weight="duotone" />} label="Contact form submitted" via="Email + SMS to Kyle + Abi" />
          <NotifRow icon={<Star size={14} weight="duotone" />} label="5★ review captured" via="SMS to Kyle (silent)" />
          <NotifRow icon={<Warning size={14} weight="duotone" />} label="<5★ private feedback received" via="Email to Kyle + SMS Ben" />
          <NotifRow icon={<Certificate size={14} weight="duotone" />} label="Credential renewal due" via="Email at 60 / 30 / 7 days" />
          <NotifRow icon={<CurrencyDollar size={14} weight="duotone" />} label="Invoice paid" via="Email receipt to Kyle" />
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
        {icon && <span style={{ color: MOSS }}>{icon}</span>}
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
          style={{ background: MOSS_GRAD, color: "#fafafa", fontFamily: FONT_HEAD }}
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
}: {
  label: string;
  value: string;
  trend: string;
  trendKind: "up" | "down" | "neutral";
  sub: string;
  icon: React.ReactNode;
}) {
  const trendColor = trendKind === "up" ? MOSS : trendKind === "down" ? COPPER : TEXT_DIM;
  const trendIcon =
    trendKind === "up" ? <TrendUp size={11} weight="bold" /> : trendKind === "down" ? <TrendDown size={11} weight="bold" /> : null;
  return (
    <div
      className="p-4 sm:p-5 rounded-xl border"
      style={{ background: SURFACE, borderColor: BORDER }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div
          className="inline-flex items-center justify-center w-9 h-9 rounded-md"
          style={{ background: MOSS_DIM, color: MOSS }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase tracking-[0.16em] font-bold"
            style={{
              background: trendKind === "up" ? MOSS_DIM : trendKind === "down" ? RED_DIM : "rgba(255,255,255,0.05)",
              color: trendColor,
              fontFamily: FONT_HEAD,
            }}
          >
            {trendIcon}
            {trend}
          </span>
        )}
      </div>
      <div
        className="text-[24px] sm:text-[28px] font-bold leading-none mb-1.5 tabular-nums"
        style={{ color: TEXT, fontFamily: FONT_HEAD }}
      >
        {value}
      </div>
      <div
        className="text-[11px] uppercase tracking-[0.18em] font-semibold mb-1.5"
        style={{ color: MOSS, fontFamily: FONT_HEAD }}
      >
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
      style={{
        textAlign: align,
        color: TEXT_DIM,
        fontFamily: FONT_HEAD,
      }}
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
  kind: "done" | "in-progress" | "warn" | "blocked" | "pending";
  label: string;
}) {
  const cfg = {
    done: { bg: MOSS_DIM, color: MOSS, icon: <CheckCircle size={11} weight="fill" /> },
    "in-progress": { bg: BLUE_DIM, color: BLUE, icon: <Hammer size={11} weight="fill" /> },
    warn: { bg: "rgba(217, 119, 6, 0.18)", color: COPPER, icon: <Warning size={11} weight="fill" /> },
    blocked: { bg: "rgba(255,255,255,0.06)", color: TEXT_DIM, icon: <Hourglass size={11} weight="fill" /> },
    pending: { bg: "rgba(59, 130, 246, 0.10)", color: BLUE, icon: <CircleDashed size={11} weight="fill" /> },
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
    booked: { bg: MOSS_DIM, color: MOSS },
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
    paid: { bg: MOSS_DIM, color: MOSS, icon: <CheckCircle size={11} weight="fill" /> },
    pending: { bg: BLUE_DIM, color: BLUE, icon: <Clock size={11} weight="fill" /> },
    warn: { bg: "rgba(217, 119, 6, 0.18)", color: COPPER, icon: <Warning size={11} weight="fill" /> },
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

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)", maxWidth: 120 }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: pct === 100 ? MOSS : MOSS_GRAD,
          }}
        />
      </div>
      <span
        className="text-[11px] font-bold tabular-nums"
        style={{ color: pct === 100 ? MOSS : TEXT_SOFT, fontFamily: FONT_HEAD, minWidth: 32 }}
      >
        {pct}%
      </span>
    </div>
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
  const cfg = { ok: MOSS, warn: COPPER, info: BLUE }[tone];
  return (
    <div
      className="grid grid-cols-[80px_1fr] gap-4 py-3 first:pt-0 last:pb-0"
      style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}
    >
      <div
        className="text-[11px] uppercase tracking-[0.16em] font-semibold pt-0.5"
        style={{ color: TEXT_DIM, fontFamily: FONT_HEAD }}
      >
        {when}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="font-bold text-[13px]" style={{ color: TEXT, fontFamily: FONT_HEAD }}>
            {actor}
          </span>
          <span className="text-[12px]" style={{ color: cfg }}>
            {action}
          </span>
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
    <CheckCircle size={14} weight="fill" style={{ color: MOSS }} />
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
        style={{
          color: done ? TEXT_DIM : TEXT,
          textDecoration: done ? "line-through" : "none",
        }}
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
        <div
          className="text-[15px] font-bold mb-0.5"
          style={{ color: TEXT, fontFamily: FONT_HEAD }}
        >
          {title}
        </div>
        <div className="text-[13px]" style={{ color: COPPER_GOLD }}>
          {caption}
        </div>
      </div>
      <Link
        href="/clients/all-in-one-services#estimate"
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
    <div
      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
      style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}
    >
      <span className="text-[13px]" style={{ color: TEXT }}>
        {label}
      </span>
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
          style={{ background: on ? MOSS_GRAD : "rgba(255,255,255,0.10)" }}
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
      <span style={{ color: MOSS }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold" style={{ color: TEXT }}>
          {label}
        </div>
        <div className="text-[11px]" style={{ color: TEXT_DIM }}>
          → {via}
        </div>
      </div>
    </div>
  );
}

function IntegrationStatus({ kind }: { kind: "connected" | "ready" | "off" }) {
  const cfg = {
    connected: { color: MOSS, bg: MOSS_DIM, label: "Connected", icon: <CheckCircle size={10} weight="fill" /> },
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
    <footer
      className="border-t mt-6"
      style={{ background: SURFACE_HEADER, borderColor: BORDER }}
    >
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px]">
        <span className="inline-flex items-center gap-2" style={{ color: TEXT_DIM }}>
          <Lock size={12} weight="fill" />
          Owner-only · Private preview · Mock data
        </span>
        <Link
          href="/clients/all-in-one-services#estimate"
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
          style={{ color: MOSS }}
        >
          Built by BlueJays
        </a>
      </div>
    </footer>
  );
}
