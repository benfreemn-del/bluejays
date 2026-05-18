"use client";

/**
 * /clients/thrive-church-sequim/portal-demo
 *
 * Password-gated staff-portal mockup for Thrive Church. Pure demo — no
 * live APIs, no real PII. Built to show on a sales call: "this is what
 * your back office could look like if you partner with us."
 *
 * Pattern: matches Meyer Electric + All In One Services portal-demos
 * (dark theme, horizontal tab nav, dense panels). Recolored to the
 * Thrive evergreen + amber palette so it feels like a natural extension
 * of the public site.
 *
 * 7 tabs:
 *   Overview · Inbox · Members · Groups · Preschool · Sermons · Giving
 *
 * Gate: thrive2026 (rotate to revoke).
 */

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  LockKey,
  House,
  Bell,
  EnvelopeSimple,
  Users,
  HandsPraying,
  HandHeart,
  BookBookmark,
  CurrencyDollar,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Phone,
  ChatCircleText,
  MagnifyingGlass,
  Funnel,
  CaretDown,
  CaretRight,
  Star,
  Plus,
  Eye,
  TrendUp,
  TrendDown,
  Sparkle,
  Heart,
  ChartBar,
  GearSix,
  DotsThreeVertical,
  PaintBrushHousehold,
  Coffee,
  Baby,
  Plant,
  Warning,
  CalendarBlank,
  Cross,
  YoutubeLogo,
} from "@phosphor-icons/react";
import ThriveMark from "../thrive-mark";
import {
  INBOX,
  MEMBERS,
  GROUPS,
  PRESCHOOL,
  SERMONS,
  RECENT_GIFTS,
  GIVING_STATS,
  WEEK_STATS,
  type InboxItem,
  type InboxType,
  type InboxStatus,
} from "./mock-data";

const PASSWORD = "thrive2026";

const TEAL = "#0d4f4a";
const TEAL_DEEP = "#0a3a36";
const TEAL_PANEL = "#0c413c";
const TEAL_BORDER = "rgba(251, 247, 238, 0.08)";
const AMBER = "#d97706";
const AMBER_LIGHT = "#fbbf24";
const CREAM = "#fbf7ee";
const INK_INVERTED = "#fbf7ee";
const ROSE = "#dc6b6b";
const VINE = "#3c8a5a";
const DOVE_BLUE = "#5b9cf6";

type Tab =
  | "overview"
  | "inbox"
  | "members"
  | "groups"
  | "preschool"
  | "sermons"
  | "giving";

const TABS: { id: Tab; label: string; Icon: typeof House; count?: number }[] = [
  { id: "overview", label: "Overview", Icon: House },
  { id: "inbox", label: "Inbox", Icon: EnvelopeSimple, count: INBOX.filter((i) => i.status === "new").length },
  { id: "members", label: "Members", Icon: Users },
  { id: "groups", label: "Thrive Groups", Icon: HandHeart },
  { id: "preschool", label: "Preschool", Icon: PaintBrushHousehold },
  { id: "sermons", label: "Sermons", Icon: BookBookmark },
  { id: "giving", label: "Giving", Icon: CurrencyDollar },
];

/* ════════════════════════ ROOT ════════════════════════ */

export default function ThrivePortalDemo() {
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");

  // Sticky unlock for the demo session
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.sessionStorage.getItem("thrive_portal_unlocked") === "1") {
        setUnlocked(true);
      }
    } catch {}
  }, []);

  function submitPw(e: React.FormEvent) {
    e.preventDefault();
    if (pwInput.trim() === PASSWORD) {
      setUnlocked(true);
      setPwError("");
      try {
        window.sessionStorage.setItem("thrive_portal_unlocked", "1");
      } catch {}
    } else {
      setPwError("Incorrect passcode.");
    }
  }

  if (!unlocked) {
    return (
      <GateScreen
        pwInput={pwInput}
        setPwInput={setPwInput}
        pwError={pwError}
        onSubmit={submitPw}
      />
    );
  }

  return (
    <main
      className="min-h-screen"
      style={{
        background: TEAL_DEEP,
        color: INK_INVERTED,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <TopBar />
      <TabNav tab={tab} setTab={setTab} />
      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10">
        {tab === "overview" && <OverviewTab setTab={setTab} />}
        {tab === "inbox" && <InboxTab />}
        {tab === "members" && <MembersTab />}
        {tab === "groups" && <GroupsTab />}
        {tab === "preschool" && <PreschoolTab />}
        {tab === "sermons" && <SermonsTab />}
        {tab === "giving" && <GivingTab />}
      </div>
      <BottomFooter />
    </main>
  );
}

/* ════════════════════════ GATE ════════════════════════ */

function GateScreen({
  pwInput,
  setPwInput,
  pwError,
  onSubmit,
}: {
  pwInput: string;
  setPwInput: (v: string) => void;
  pwError: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: TEAL_DEEP, color: INK_INVERTED, fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-8 sm:p-10"
        style={{ background: TEAL_PANEL, borderColor: TEAL_BORDER }}
      >
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 text-[#fbbf24]">
            <ThriveMark flat />
          </span>
          <div>
            <p
              className="font-[Fraunces] text-xl"
              style={{ color: CREAM, fontWeight: 600 }}
            >
              Thrive Church
            </p>
            <p
              className="text-[10px] uppercase tracking-[0.28em]"
              style={{ color: AMBER_LIGHT }}
            >
              Staff Portal — Demo
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-lg border p-4" style={{ borderColor: TEAL_BORDER, background: "rgba(217, 119, 6, 0.06)" }}>
          <Sparkle size={18} weight="duotone" className="mt-0.5 shrink-0" style={{ color: AMBER_LIGHT }} />
          <p className="text-[13px] leading-snug" style={{ color: "rgba(251, 247, 238, 0.78)" }}>
            This is a private demo of what a Thrive Church staff back-office could look like — built by BlueJays for review.
            No real data. No live notifications. Pure mockup.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-7">
          <label className="block">
            <span
              className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ color: AMBER_LIGHT }}
            >
              Enter demo passcode
            </span>
            <input
              type="text"
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              autoFocus
              autoComplete="off"
              className="w-full rounded-lg border bg-[#0a3a36]/60 px-4 py-3 text-base outline-none transition-colors focus:border-[#fbbf24]"
              style={{ borderColor: TEAL_BORDER, color: CREAM }}
              placeholder="e.g. thrive2026"
            />
          </label>
          {pwError && (
            <p className="mt-2 text-[13px]" style={{ color: ROSE }}>
              {pwError}
            </p>
          )}
          <button
            type="submit"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ background: AMBER, color: CREAM, boxShadow: "0 14px 36px -14px rgba(217, 119, 6, 0.55)" }}
          >
            <LockKey size={14} weight="fill" />
            Unlock Portal
          </button>
        </form>

        <Link
          href="/clients/thrive-church-sequim"
          className="mt-6 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] transition-colors hover:text-[#d97706]"
          style={{ color: "rgba(251, 247, 238, 0.6)" }}
        >
          <ArrowLeft size={12} weight="bold" />
          Back to Thrive home
        </Link>
      </div>
    </main>
  );
}

/* ════════════════════════ TOP BAR ════════════════════════ */

function TopBar() {
  return (
    <div
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{ background: "rgba(10, 58, 54, 0.88)", borderColor: TEAL_BORDER }}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-3 sm:px-8 sm:py-4">
        <div className="flex items-center gap-3">
          <span className="h-9 w-9 text-[#fbbf24]">
            <ThriveMark flat />
          </span>
          <div className="leading-tight">
            <p className="font-[Fraunces] text-[18px]" style={{ color: CREAM, fontWeight: 600 }}>
              Thrive
            </p>
            <p
              className="text-[10px] uppercase tracking-[0.24em]"
              style={{ color: AMBER_LIGHT }}
            >
              Staff Portal · Demo
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className="hidden items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] sm:flex"
            style={{ borderColor: TEAL_BORDER, color: "rgba(251, 247, 238, 0.7)" }}
          >
            <span className="block h-1.5 w-1.5 rounded-full" style={{ background: VINE }} />
            Live • Last sync 2m ago
          </span>
          <button
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border"
            style={{ borderColor: TEAL_BORDER, color: CREAM }}
            aria-label="Notifications"
          >
            <Bell size={16} weight="fill" />
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
              style={{ background: ROSE, color: CREAM }}
            >
              4
            </span>
          </button>
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold"
            style={{ background: AMBER, color: CREAM }}
          >
            DL
          </span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════ TAB NAV ════════════════════════ */

function TabNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="border-b" style={{ background: TEAL_DEEP, borderColor: TEAL_BORDER }}>
      <div className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-3 sm:px-6">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="group inline-flex items-center gap-2 whitespace-nowrap px-4 py-4 text-[13px] font-semibold transition-all"
              style={{
                color: active ? CREAM : "rgba(251, 247, 238, 0.55)",
                borderBottom: active ? `2px solid ${AMBER}` : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              <t.Icon size={16} weight={active ? "fill" : "regular"} />
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span
                  className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
                  style={{ background: active ? AMBER : "rgba(251, 247, 238, 0.12)", color: active ? CREAM : "rgba(251, 247, 238, 0.7)" }}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════ OVERVIEW TAB ════════════════════════ */

function OverviewTab({ setTab }: { setTab: (t: Tab) => void }) {
  const givingTrendUp = WEEK_STATS.givingThisWeek > WEEK_STATS.givingLastWeek;
  const givingPct = Math.round(
    ((WEEK_STATS.givingThisWeek - WEEK_STATS.givingLastWeek) / WEEK_STATS.givingLastWeek) * 100,
  );

  return (
    <>
      {/* Greeting */}
      <div className="mb-7">
        <p className="text-[12px] uppercase tracking-[0.22em] font-bold" style={{ color: AMBER_LIGHT }}>
          Monday Morning, May 18
        </p>
        <h1
          className="mt-2 font-[Fraunces] text-[clamp(2rem,3.5vw,2.6rem)] leading-tight"
          style={{ color: CREAM, fontWeight: 500 }}
        >
          Good morning, Pastor Dave.
        </h1>
        <p className="mt-2 text-[15px]" style={{ color: "rgba(251, 247, 238, 0.7)" }}>
          Yesterday&rsquo;s gathering had{" "}
          <strong style={{ color: CREAM }}>{WEEK_STATS.sundayAttendance}</strong> in person (
          {WEEK_STATS.attendanceTrend} vs. last week).{" "}
          <strong style={{ color: CREAM }}>{WEEK_STATS.newConnects} new connect cards</strong>{" "}
          came in overnight — start there.
        </p>
      </div>

      {/* Top stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          icon={<Users size={18} weight="fill" />}
          label="Sunday Attendance"
          value={WEEK_STATS.sundayAttendance.toString()}
          delta={WEEK_STATS.attendanceTrend}
          deltaUp
        />
        <StatCard
          icon={<HandHeart size={18} weight="fill" />}
          label="New Connects"
          value={WEEK_STATS.newConnects.toString()}
          sub="this week"
          accent="rose"
        />
        <StatCard
          icon={<HandsPraying size={18} weight="fill" />}
          label="Prayer Requests"
          value={WEEK_STATS.prayerRequests.toString()}
          sub="this week"
        />
        <StatCard
          icon={<Sparkle size={18} weight="fill" />}
          label="Volunteer Signups"
          value={WEEK_STATS.volunteerSignups.toString()}
          sub="this week"
        />
        <StatCard
          icon={<EnvelopeSimple size={18} weight="fill" />}
          label="Verse Subscribers"
          value={WEEK_STATS.totalVerseSubscribers.toString()}
          delta={`+${WEEK_STATS.verseSubscribers}`}
          deltaUp
        />
        <StatCard
          icon={<CurrencyDollar size={18} weight="fill" />}
          label="Giving This Week"
          value={`$${WEEK_STATS.givingThisWeek.toLocaleString()}`}
          delta={`${givingTrendUp ? "+" : ""}${givingPct}%`}
          deltaUp={givingTrendUp}
        />
      </div>

      {/* Main grid: inbox preview + week ahead */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Recent inbox */}
        <Panel
          title="Recent Activity"
          subtitle="Latest forms submissions across the site"
          action={
            <button
              onClick={() => setTab("inbox")}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: AMBER_LIGHT }}
            >
              Open full inbox <ArrowRight size={12} weight="bold" />
            </button>
          }
        >
          <ul className="divide-y" style={{ borderColor: TEAL_BORDER }}>
            {INBOX.slice(0, 6).map((item) => (
              <InboxRow key={item.id} item={item} compact />
            ))}
          </ul>
        </Panel>

        {/* Week ahead */}
        <Panel title="This Week" subtitle="Calendar + reminders">
          <ul className="space-y-3">
            <WeekItem
              icon={<HandsPraying size={16} weight="fill" />}
              day="Tue"
              label="Prayer Team Meet"
              time="10am · Room B"
            />
            <WeekItem
              icon={<HandHeart size={16} weight="fill" />}
              day="Wed"
              label="3 Thrive Groups meet"
              time="See Groups tab"
            />
            <WeekItem
              icon={<PaintBrushHousehold size={16} weight="fill" />}
              day="Wed"
              label="Petrillo family tour"
              time="10am · Preschool"
            />
            <WeekItem
              icon={<BookBookmark size={16} weight="fill" />}
              day="Thu"
              label="Sermon prep · Mother's Day"
              time="Pastor Dave"
            />
            <WeekItem
              icon={<Coffee size={16} weight="fill" />}
              day="Sat"
              label="Setup team — 8am"
              time="4 volunteers confirmed"
            />
            <WeekItem
              icon={<Users size={16} weight="fill" />}
              day="Sun"
              label="Mother's Day Service"
              time="10:30am · Special music + brunch"
              highlight
            />
          </ul>
        </Panel>
      </div>

      {/* Action items */}
      <div className="mt-6">
        <Panel title="Needs Your Attention" subtitle="Pastoral follow-ups + admin tasks">
          <ul className="grid gap-3 sm:grid-cols-2">
            <ActionItem
              urgent
              icon={<HandsPraying size={16} weight="fill" />}
              label="Pray for anonymous biopsy request"
              detail="Submitted today 8:42am — private"
            />
            <ActionItem
              icon={<HandHeart size={16} weight="fill" />}
              label="Welcome call: Sarah Whitlock"
              detail="First Sunday last week + asking for group"
            />
            <ActionItem
              icon={<PaintBrushHousehold size={16} weight="fill" />}
              label="Lily Bashioum deposit"
              detail="$200 pending — Emma toured 5/13"
            />
            <ActionItem
              icon={<Cross size={16} weight="fill" />}
              label="James & Carol McKinney baptism"
              detail="Pastor Dave to schedule conversation"
            />
          </ul>
        </Panel>
      </div>
    </>
  );
}

/* ════════════════════════ INBOX TAB ════════════════════════ */

function InboxTab() {
  const [filter, setFilter] = useState<"all" | InboxType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | InboxStatus>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<InboxItem | null>(null);

  const filtered = useMemo(() => {
    return INBOX.filter((i) => {
      if (filter !== "all" && i.type !== filter) return false;
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (search && !`${i.name} ${i.preview}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filter, statusFilter, search]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-[Fraunces] text-[clamp(1.8rem,3vw,2.4rem)]" style={{ color: CREAM, fontWeight: 500 }}>
            Inbox
          </h2>
          <p className="mt-1 text-[14px]" style={{ color: "rgba(251, 247, 238, 0.65)" }}>
            Every form submission across the public site lands here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[12px]" style={{ borderColor: TEAL_BORDER, color: CREAM }}>
            <Funnel size={14} weight="fill" /> Filters
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold" style={{ background: AMBER, color: CREAM }}>
            <Plus size={14} weight="bold" /> Add note
          </button>
        </div>
      </div>

      {/* Type filter chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "connect", "prayer", "volunteer", "verse", "preschool"] as const).map((t) => {
          const count = t === "all" ? INBOX.length : INBOX.filter((i) => i.type === t).length;
          const active = filter === t;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-all"
              style={{
                borderColor: active ? AMBER : TEAL_BORDER,
                background: active ? "rgba(217, 119, 6, 0.16)" : "transparent",
                color: active ? AMBER_LIGHT : "rgba(251, 247, 238, 0.7)",
              }}
            >
              {labelFor(t)}
              <span className="rounded-full px-1.5 text-[10px]" style={{ background: "rgba(251, 247, 238, 0.1)" }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + status */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div
          className="flex flex-1 items-center gap-2 rounded-lg border px-3 py-2"
          style={{ borderColor: TEAL_BORDER, background: TEAL_PANEL }}
        >
          <MagnifyingGlass size={14} weight="bold" style={{ color: "rgba(251,247,238,0.5)" }} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or content…"
            className="w-full bg-transparent text-[13px] outline-none"
            style={{ color: CREAM }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | InboxStatus)}
          className="rounded-lg border px-3 py-2 text-[13px]"
          style={{ borderColor: TEAL_BORDER, background: TEAL_PANEL, color: CREAM }}
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="in-progress">In progress</option>
          <option value="replied">Replied</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* List */}
        <Panel title={`${filtered.length} item${filtered.length === 1 ? "" : "s"}`}>
          <ul className="divide-y" style={{ borderColor: TEAL_BORDER }}>
            {filtered.length === 0 && (
              <li className="py-8 text-center text-[14px]" style={{ color: "rgba(251, 247, 238, 0.55)" }}>
                No items match those filters.
              </li>
            )}
            {filtered.map((item) => (
              <InboxRow
                key={item.id}
                item={item}
                onClick={() => setSelected(item)}
                active={selected?.id === item.id}
              />
            ))}
          </ul>
        </Panel>

        {/* Detail panel */}
        <Panel title={selected ? "Item Detail" : "Select an item"}>
          {!selected ? (
            <p className="text-[14px]" style={{ color: "rgba(251, 247, 238, 0.55)" }}>
              Pick a form submission on the left to see all fields, history, and reply options.
            </p>
          ) : (
            <InboxDetail item={selected} />
          )}
        </Panel>
      </div>
    </>
  );
}

function InboxRow({
  item,
  onClick,
  active,
  compact,
}: {
  item: InboxItem;
  onClick?: () => void;
  active?: boolean;
  compact?: boolean;
}) {
  return (
    <li
      onClick={onClick}
      className="group cursor-pointer py-3.5 transition-colors hover:bg-white/5"
      style={{
        background: active ? "rgba(217, 119, 6, 0.08)" : "transparent",
      }}
    >
      <div className="flex items-start gap-3 px-3">
        <TypeBadge type={item.type} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[14px] font-semibold" style={{ color: CREAM }}>
              {item.name}
            </p>
            <StatusPill status={item.status} />
          </div>
          {!compact && item.email && (
            <p className="mt-0.5 truncate text-[12px]" style={{ color: "rgba(251, 247, 238, 0.55)" }}>
              {item.email}
            </p>
          )}
          <p className="mt-1 truncate text-[13px]" style={{ color: "rgba(251, 247, 238, 0.72)" }}>
            {item.preview}
          </p>
        </div>
        <span className="shrink-0 text-[11px]" style={{ color: "rgba(251, 247, 238, 0.5)" }}>
          {item.receivedAt}
        </span>
      </div>
    </li>
  );
}

function InboxDetail({ item }: { item: InboxItem }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <TypeBadge type={item.type} large />
          <div>
            <p className="text-[15px] font-semibold" style={{ color: CREAM }}>
              {item.name}
            </p>
            <p className="text-[12px]" style={{ color: "rgba(251, 247, 238, 0.55)" }}>
              {item.receivedAt}
            </p>
          </div>
        </div>
        <StatusPill status={item.status} />
      </div>

      {(item.email || item.phone) && (
        <div className="flex flex-wrap gap-2">
          {item.email && (
            <a
              href={`mailto:${item.email}`}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px]"
              style={{ borderColor: TEAL_BORDER, color: CREAM }}
            >
              <EnvelopeSimple size={12} weight="fill" /> {item.email}
            </a>
          )}
          {item.phone && (
            <a
              href={`tel:${item.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px]"
              style={{ borderColor: TEAL_BORDER, color: CREAM }}
            >
              <Phone size={12} weight="fill" /> {item.phone}
            </a>
          )}
        </div>
      )}

      <div className="rounded-lg border p-4" style={{ borderColor: TEAL_BORDER, background: "rgba(10, 58, 54, 0.4)" }}>
        <p className="text-[14px] leading-relaxed" style={{ color: CREAM }}>
          &ldquo;{item.preview}&rdquo;
        </p>
      </div>

      {item.meta && Object.keys(item.meta).length > 0 && (
        <dl className="space-y-2">
          {Object.entries(item.meta).map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt
                className="w-32 shrink-0 text-[11px] font-bold uppercase tracking-[0.18em]"
                style={{ color: AMBER_LIGHT }}
              >
                {k}
              </dt>
              <dd className="text-[13px]" style={{ color: "rgba(251, 247, 238, 0.85)" }}>
                {v}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <button className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em]" style={{ background: AMBER, color: CREAM }}>
          <ChatCircleText size={12} weight="fill" /> Reply
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em]" style={{ borderColor: TEAL_BORDER, color: CREAM }}>
          <CheckCircle size={12} weight="fill" /> Mark replied
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[12px]" style={{ borderColor: TEAL_BORDER, color: "rgba(251,247,238,0.65)" }}>
          Assign to team…
        </button>
      </div>
    </div>
  );
}

function TypeBadge({ type, large }: { type: InboxType; large?: boolean }) {
  const map: Record<InboxType, { icon: React.ReactNode; color: string; label: string }> = {
    connect: { icon: <HandHeart size={large ? 18 : 14} weight="fill" />, color: TEAL, label: "Connect" },
    prayer: { icon: <HandsPraying size={large ? 18 : 14} weight="fill" />, color: ROSE, label: "Prayer" },
    volunteer: { icon: <Sparkle size={large ? 18 : 14} weight="fill" />, color: AMBER, label: "Volunteer" },
    verse: { icon: <BookBookmark size={large ? 18 : 14} weight="fill" />, color: DOVE_BLUE, label: "Verse" },
    preschool: { icon: <PaintBrushHousehold size={large ? 18 : 14} weight="fill" />, color: VINE, label: "Preschool" },
  };
  const m = map[type];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full ${large ? "px-3 py-1.5" : "h-7 w-7 justify-center"}`}
      style={{ background: `${m.color}22`, color: m.color }}
      title={m.label}
    >
      {m.icon}
      {large && <span className="text-[11px] font-bold uppercase tracking-[0.18em]">{m.label}</span>}
    </span>
  );
}

function StatusPill({ status }: { status: InboxStatus }) {
  const map: Record<InboxStatus, { label: string; color: string }> = {
    new: { label: "NEW", color: AMBER_LIGHT },
    "in-progress": { label: "IN PROGRESS", color: DOVE_BLUE },
    replied: { label: "REPLIED", color: VINE },
    closed: { label: "CLOSED", color: "rgba(251, 247, 238, 0.4)" },
  };
  const m = map[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em]"
      style={{ background: `${m.color}1f`, color: m.color }}
    >
      {m.label}
    </span>
  );
}

function labelFor(t: string) {
  if (t === "all") return "All";
  if (t === "connect") return "Connect Cards";
  if (t === "prayer") return "Prayer";
  if (t === "volunteer") return "Volunteer";
  if (t === "verse") return "Verse Subs";
  if (t === "preschool") return "Preschool";
  return t;
}

/* ════════════════════════ MEMBERS TAB ════════════════════════ */

function MembersTab() {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      MEMBERS.filter((m) => !search || `${m.name} ${m.role} ${m.groups.join(" ")}`.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-[Fraunces] text-[clamp(1.8rem,3vw,2.4rem)]" style={{ color: CREAM, fontWeight: 500 }}>
            Members
          </h2>
          <p className="mt-1 text-[14px]" style={{ color: "rgba(251, 247, 238, 0.65)" }}>
            {MEMBERS.length} families · {MEMBERS.filter((m) => m.serving && m.serving.length > 0).length} serving on a team
          </p>
        </div>
        <div className="flex flex-1 items-center gap-2 sm:max-w-md">
          <div
            className="flex flex-1 items-center gap-2 rounded-lg border px-3 py-2"
            style={{ borderColor: TEAL_BORDER, background: TEAL_PANEL }}
          >
            <MagnifyingGlass size={14} weight="bold" style={{ color: "rgba(251,247,238,0.5)" }} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members, roles, groups…"
              className="w-full bg-transparent text-[13px] outline-none"
              style={{ color: CREAM }}
            />
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold" style={{ background: AMBER, color: CREAM }}>
            <Plus size={14} weight="bold" /> Add
          </button>
        </div>
      </div>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: TEAL_BORDER, color: "rgba(251, 247, 238, 0.55)" }}>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.16em]">Member</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.16em]">Role</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.16em]">Group(s)</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.16em]">Serving</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.16em]">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr
                  key={m.id}
                  className="border-b transition-colors hover:bg-white/5"
                  style={{ borderColor: TEAL_BORDER }}
                >
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold"
                        style={{ background: `${TEAL}aa`, color: AMBER_LIGHT }}
                      >
                        {initials(m.name)}
                      </span>
                      <div>
                        <p className="font-semibold" style={{ color: CREAM }}>
                          {m.name}
                        </p>
                        <p className="text-[11px]" style={{ color: "rgba(251, 247, 238, 0.5)" }}>
                          {m.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3" style={{ color: "rgba(251, 247, 238, 0.85)" }}>
                    {m.role}
                  </td>
                  <td className="px-3 py-3" style={{ color: "rgba(251, 247, 238, 0.75)" }}>
                    {m.groups.length ? m.groups.join(", ") : <em style={{ color: "rgba(251, 247, 238, 0.4)" }}>None yet</em>}
                  </td>
                  <td className="px-3 py-3" style={{ color: "rgba(251, 247, 238, 0.75)" }}>
                    {m.serving?.join(" · ") || <em style={{ color: "rgba(251, 247, 238, 0.4)" }}>—</em>}
                  </td>
                  <td className="px-3 py-3" style={{ color: "rgba(251, 247, 238, 0.6)" }}>
                    {m.joined}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter((p) => /^[A-Z]/.test(p))
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

/* ════════════════════════ GROUPS TAB ════════════════════════ */

function GroupsTab() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-[Fraunces] text-[clamp(1.8rem,3vw,2.4rem)]" style={{ color: CREAM, fontWeight: 500 }}>
            Thrive Groups
          </h2>
          <p className="mt-1 text-[14px]" style={{ color: "rgba(251, 247, 238, 0.65)" }}>
            {GROUPS.length} active groups · {GROUPS.reduce((s, g) => s + g.current, 0)} people connected
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold" style={{ background: AMBER, color: CREAM }}>
          <Plus size={14} weight="bold" /> Start a new group
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {GROUPS.map((g) => {
          const full = g.current >= g.capacity;
          const pct = (g.current / g.capacity) * 100;
          return (
            <div
              key={g.id}
              className="rounded-xl border p-5"
              style={{ borderColor: TEAL_BORDER, background: TEAL_PANEL }}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h3 className="font-[Fraunces] text-[18px] leading-tight" style={{ color: CREAM, fontWeight: 600 }}>
                    {g.name}
                  </h3>
                  <p className="mt-1 text-[12px]" style={{ color: AMBER_LIGHT }}>
                    {g.leaders}
                  </p>
                </div>
                <StatusBadge status={g.status} />
              </div>
              <dl className="mt-4 space-y-1.5 text-[13px]">
                <div className="flex gap-2">
                  <CalendarBlank size={14} weight="fill" style={{ color: "rgba(251, 247, 238, 0.5)", marginTop: 2 }} />
                  <dd style={{ color: "rgba(251, 247, 238, 0.85)" }}>{g.day} · {g.time}</dd>
                </div>
                <div className="flex gap-2">
                  <House size={14} weight="fill" style={{ color: "rgba(251, 247, 238, 0.5)", marginTop: 2 }} />
                  <dd style={{ color: "rgba(251, 247, 238, 0.85)" }}>{g.location}</dd>
                </div>
                <div className="flex gap-2">
                  <Users size={14} weight="fill" style={{ color: "rgba(251, 247, 238, 0.5)", marginTop: 2 }} />
                  <dd style={{ color: "rgba(251, 247, 238, 0.85)" }}>{g.audience}</dd>
                </div>
              </dl>
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-[11px]" style={{ color: "rgba(251, 247, 238, 0.6)" }}>
                  <span>{g.current} / {g.capacity} spots</span>
                  {full && <span style={{ color: ROSE }}>FULL</span>}
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(251, 247, 238, 0.08)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(pct, 100)}%`, background: full ? ROSE : AMBER }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: "open" | "closed" | "waitlist" }) {
  const map = {
    open: { label: "Open", color: VINE },
    closed: { label: "Full", color: ROSE },
    waitlist: { label: "Waitlist", color: AMBER_LIGHT },
  };
  const m = map[status];
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em]"
      style={{ background: `${m.color}1f`, color: m.color }}
    >
      {m.label}
    </span>
  );
}

/* ════════════════════════ PRESCHOOL TAB ════════════════════════ */

function PreschoolTab() {
  const stats = {
    enrolled: PRESCHOOL.filter((p) => p.status === "enrolled").length,
    pending: PRESCHOOL.filter((p) => p.status === "deposit-pending" || p.status === "tour-scheduled").length,
    waitlist: PRESCHOOL.filter((p) => p.status === "waitlist").length,
    inquiries: PRESCHOOL.filter((p) => p.status === "inquired").length,
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="font-[Fraunces] text-[clamp(1.8rem,3vw,2.4rem)]" style={{ color: CREAM, fontWeight: 500 }}>
          Thrive Preschool
        </h2>
        <p className="mt-1 text-[14px]" style={{ color: "rgba(251, 247, 238, 0.65)" }}>
          2026/2027 enrollment · {stats.enrolled} enrolled · {stats.waitlist} on waitlist
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<CheckCircle size={18} weight="fill" />} label="Enrolled" value={stats.enrolled.toString()} accent="vine" />
        <StatCard icon={<Clock size={18} weight="fill" />} label="In Pipeline" value={stats.pending.toString()} sub="tour + deposit" />
        <StatCard icon={<Hourglass size={18} />} label="Waitlist" value={stats.waitlist.toString()} accent="amber" />
        <StatCard icon={<Sparkle size={18} weight="fill" />} label="New Inquiries" value={stats.inquiries.toString()} sub="this week" />
      </div>

      <Panel title="Roster + Pipeline">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: TEAL_BORDER, color: "rgba(251, 247, 238, 0.55)" }}>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.16em]">Child</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.16em]">Age</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.16em]">Parent</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.16em]">Status</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.16em]">Schedule</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.16em]">Note</th>
              </tr>
            </thead>
            <tbody>
              {PRESCHOOL.map((p) => (
                <tr key={p.id} className="border-b transition-colors hover:bg-white/5" style={{ borderColor: TEAL_BORDER }}>
                  <td className="px-3 py-3 font-semibold" style={{ color: CREAM }}>{p.childName}</td>
                  <td className="px-3 py-3" style={{ color: "rgba(251, 247, 238, 0.75)" }}>{p.age}</td>
                  <td className="px-3 py-3" style={{ color: "rgba(251, 247, 238, 0.75)" }}>{p.parent}</td>
                  <td className="px-3 py-3"><PreschoolStatusPill status={p.status} /></td>
                  <td className="px-3 py-3" style={{ color: "rgba(251, 247, 238, 0.75)" }}>{p.schedule}</td>
                  <td className="px-3 py-3 text-[12px]" style={{ color: p.tuitionPaid ? VINE : "rgba(251, 247, 238, 0.65)" }}>
                    {p.tuitionPaid ? `Paid ${p.tuitionPaid}` : p.notes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function PreschoolStatusPill({ status }: { status: "enrolled" | "tour-scheduled" | "waitlist" | "deposit-pending" | "inquired" }) {
  const map = {
    enrolled: { label: "Enrolled", color: VINE },
    "tour-scheduled": { label: "Tour scheduled", color: DOVE_BLUE },
    "deposit-pending": { label: "Deposit pending", color: AMBER_LIGHT },
    waitlist: { label: "Waitlist", color: AMBER },
    inquired: { label: "Inquiry", color: "rgba(251, 247, 238, 0.55)" },
  };
  const m = map[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]"
      style={{ background: `${m.color}1f`, color: m.color }}
    >
      {m.label}
    </span>
  );
}

function Hourglass({ size = 16 }: { size?: number; weight?: string }) {
  // Simple inline since Phosphor's name differs across versions
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M6 2h12v2l-4 6 4 6v2H6v-2l4-6-4-6V2zm2 2.5L11 9h2l3-4.5H8z" />
    </svg>
  );
}

/* ════════════════════════ SERMONS TAB ════════════════════════ */

function SermonsTab() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-[Fraunces] text-[clamp(1.8rem,3vw,2.4rem)]" style={{ color: CREAM, fontWeight: 500 }}>
            Sermon Archive
          </h2>
          <p className="mt-1 text-[14px]" style={{ color: "rgba(251, 247, 238, 0.65)" }}>
            {SERMONS.filter((s) => s.status === "archived" || s.status === "live").length} published · {SERMONS.filter((s) => s.status === "draft").length} in draft
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold" style={{ background: AMBER, color: CREAM }}>
          <Plus size={14} weight="bold" /> New sermon entry
        </button>
      </div>

      <Panel>
        <ul className="divide-y" style={{ borderColor: TEAL_BORDER }}>
          {SERMONS.map((s) => (
            <li key={s.id} className="flex flex-col gap-3 px-3 py-4 sm:flex-row sm:items-center sm:gap-5">
              <span
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${TEAL}aa`, color: AMBER_LIGHT }}
              >
                <BookBookmark size={20} weight="fill" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <h3 className="font-[Fraunces] text-[16px]" style={{ color: CREAM, fontWeight: 600 }}>
                    {s.title}
                  </h3>
                  {s.status === "draft" && (
                    <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]" style={{ background: `${AMBER_LIGHT}1f`, color: AMBER_LIGHT }}>
                      Draft
                    </span>
                  )}
                  {s.status === "live" && (
                    <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]" style={{ background: `${VINE}1f`, color: VINE }}>
                      Newest
                    </span>
                  )}
                </div>
                <p className="text-[12px]" style={{ color: AMBER_LIGHT }}>
                  {s.series} · {s.scripture}
                </p>
                <p className="mt-1 text-[12px]" style={{ color: "rgba(251, 247, 238, 0.55)" }}>
                  {s.speaker} · {s.date} · {s.durationMin} min
                </p>
              </div>
              <div className="flex items-center gap-3 text-[12px]" style={{ color: "rgba(251, 247, 238, 0.65)" }}>
                <div className="flex items-center gap-1">
                  <YoutubeLogo size={14} weight="fill" />
                  {s.youtubeViews.toLocaleString()}
                </div>
              </div>
              <button className="inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: AMBER_LIGHT }}>
                Edit <CaretRight size={12} weight="bold" />
              </button>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}

/* ════════════════════════ GIVING TAB ════════════════════════ */

function GivingTab() {
  const yearPct = Math.round((GIVING_STATS.thisYear / GIVING_STATS.yearGoal) * 100);

  return (
    <>
      <div className="mb-6">
        <h2 className="font-[Fraunces] text-[clamp(1.8rem,3vw,2.4rem)]" style={{ color: CREAM, fontWeight: 500 }}>
          Giving
        </h2>
        <p className="mt-1 text-[14px]" style={{ color: "rgba(251, 247, 238, 0.65)" }}>
          {GIVING_STATS.recurringDonors} recurring donors · ${GIVING_STATS.averageGift} avg gift · {GIVING_STATS.newDonorsThisMonth} new this month
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<CurrencyDollar size={18} weight="fill" />}
          label="This Week"
          value={`$${GIVING_STATS.thisWeek.toLocaleString()}`}
        />
        <StatCard
          icon={<CurrencyDollar size={18} weight="fill" />}
          label="This Month"
          value={`$${GIVING_STATS.thisMonth.toLocaleString()}`}
        />
        <StatCard
          icon={<CurrencyDollar size={18} weight="fill" />}
          label="This Year"
          value={`$${(GIVING_STATS.thisYear / 1000).toFixed(0)}K`}
          sub={`of $${(GIVING_STATS.yearGoal / 1000).toFixed(0)}K goal`}
        />
        <StatCard
          icon={<TrendUp size={18} weight="fill" />}
          label="Largest This Month"
          value={`$${GIVING_STATS.largestGift.amount.toLocaleString()}`}
          sub={GIVING_STATS.largestGift.fund}
        />
      </div>

      <div className="mb-6">
        <Panel title="Year-To-Goal Progress">
          <div>
            <div className="mb-2 flex items-end justify-between">
              <span className="font-[Fraunces] text-[28px]" style={{ color: AMBER_LIGHT, fontWeight: 600 }}>
                {yearPct}%
              </span>
              <span className="text-[12px]" style={{ color: "rgba(251, 247, 238, 0.6)" }}>
                ${GIVING_STATS.thisYear.toLocaleString()} of ${GIVING_STATS.yearGoal.toLocaleString()}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(251, 247, 238, 0.08)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${yearPct}%`, background: `linear-gradient(90deg, ${AMBER}, ${AMBER_LIGHT})` }}
              />
            </div>
            <p className="mt-3 text-[12px]" style={{ color: "rgba(251, 247, 238, 0.6)" }}>
              On track. To hit the year-end goal, average ${Math.round((GIVING_STATS.yearGoal - GIVING_STATS.thisYear) / 32).toLocaleString()}/week through Dec.
            </p>
          </div>
        </Panel>
      </div>

      <Panel title="Recent Gifts">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: TEAL_BORDER, color: "rgba(251, 247, 238, 0.55)" }}>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.16em]">Date</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.16em]">Donor</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.16em]">Fund</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.16em]">Method</th>
                <th className="px-3 py-3 text-right text-[11px] font-bold uppercase tracking-[0.16em]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_GIFTS.map((g) => (
                <tr key={g.id} className="border-b transition-colors hover:bg-white/5" style={{ borderColor: TEAL_BORDER }}>
                  <td className="px-3 py-3" style={{ color: "rgba(251, 247, 238, 0.7)" }}>{g.date}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span style={{ color: CREAM, fontWeight: g.donor === "Anonymous" ? 400 : 600 }}>{g.donor}</span>
                      {g.recurring && (
                        <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ background: `${VINE}1f`, color: VINE }}>
                          Recurring
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3" style={{ color: "rgba(251, 247, 238, 0.75)" }}>{g.fund}</td>
                  <td className="px-3 py-3" style={{ color: "rgba(251, 247, 238, 0.65)" }}>{g.method}</td>
                  <td className="px-3 py-3 text-right font-bold" style={{ color: CREAM }}>${g.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

/* ════════════════════════ SHARED COMPONENTS ════════════════════════ */

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-xl border"
      style={{ background: TEAL_PANEL, borderColor: TEAL_BORDER }}
    >
      {(title || action) && (
        <header
          className="flex items-start justify-between gap-4 border-b px-5 py-4"
          style={{ borderColor: TEAL_BORDER }}
        >
          <div>
            {title && (
              <h3 className="text-[15px] font-bold" style={{ color: CREAM }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-[12px]" style={{ color: "rgba(251, 247, 238, 0.55)" }}>
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className="px-3 py-3 sm:px-4 sm:py-4">{children}</div>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  delta,
  deltaUp,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  delta?: string;
  deltaUp?: boolean;
  accent?: "rose" | "vine" | "amber" | "blue";
}) {
  const accentColor =
    accent === "rose"
      ? ROSE
      : accent === "vine"
        ? VINE
        : accent === "amber"
          ? AMBER_LIGHT
          : accent === "blue"
            ? DOVE_BLUE
            : AMBER_LIGHT;
  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: TEAL_PANEL, borderColor: TEAL_BORDER }}
    >
      <div className="flex items-center justify-between">
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: `${accentColor}22`, color: accentColor }}
        >
          {icon}
        </span>
        {delta && (
          <span
            className="inline-flex items-center gap-0.5 text-[11px] font-bold"
            style={{ color: deltaUp ? VINE : ROSE }}
          >
            {deltaUp ? <TrendUp size={11} weight="bold" /> : <TrendDown size={11} weight="bold" />}
            {delta}
          </span>
        )}
      </div>
      <p
        className="mt-3 font-[Fraunces] text-[clamp(1.4rem,2.2vw,1.9rem)] leading-none"
        style={{ color: CREAM, fontWeight: 600 }}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "rgba(251, 247, 238, 0.55)" }}>
        {label}
      </p>
      {sub && (
        <p className="mt-0.5 text-[11px]" style={{ color: "rgba(251, 247, 238, 0.45)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function WeekItem({
  icon,
  day,
  label,
  time,
  highlight,
}: {
  icon: React.ReactNode;
  day: string;
  label: string;
  time: string;
  highlight?: boolean;
}) {
  return (
    <li
      className="flex items-start gap-3 rounded-lg border p-3"
      style={{
        borderColor: highlight ? AMBER : TEAL_BORDER,
        background: highlight ? "rgba(217, 119, 6, 0.08)" : "transparent",
      }}
    >
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-full"
        style={{ background: highlight ? `${AMBER}33` : `${TEAL}aa`, color: highlight ? AMBER_LIGHT : "rgba(251, 247, 238, 0.78)" }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: AMBER_LIGHT }}>{day}</span>
          <span className="text-[13px] font-semibold" style={{ color: CREAM }}>{label}</span>
        </div>
        <p className="text-[12px]" style={{ color: "rgba(251, 247, 238, 0.6)" }}>{time}</p>
      </div>
    </li>
  );
}

function ActionItem({
  icon,
  label,
  detail,
  urgent,
}: {
  icon: React.ReactNode;
  label: string;
  detail: string;
  urgent?: boolean;
}) {
  return (
    <li
      className="flex items-start gap-3 rounded-lg border p-4"
      style={{
        borderColor: urgent ? ROSE : TEAL_BORDER,
        background: urgent ? "rgba(220, 107, 107, 0.05)" : "transparent",
      }}
    >
      <span
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{
          background: urgent ? `${ROSE}33` : `${TEAL}aa`,
          color: urgent ? ROSE : AMBER_LIGHT,
        }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold" style={{ color: CREAM }}>
          {label}
        </p>
        <p className="mt-0.5 text-[12px]" style={{ color: "rgba(251, 247, 238, 0.62)" }}>
          {detail}
        </p>
      </div>
      <button className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: AMBER_LIGHT }}>
        Take action
      </button>
    </li>
  );
}

function BottomFooter() {
  return (
    <footer
      className="border-t py-6 text-center"
      style={{ borderColor: TEAL_BORDER, background: TEAL_DEEP }}
    >
      <p className="text-[11px] uppercase tracking-[0.24em]" style={{ color: "rgba(251, 247, 238, 0.4)" }}>
        Thrive Portal · Mock Demo · Built by{" "}
        <Link href="/" className="hover:text-[#fbbf24]" style={{ color: AMBER_LIGHT }}>BlueJays</Link>
      </p>
    </footer>
  );
}
