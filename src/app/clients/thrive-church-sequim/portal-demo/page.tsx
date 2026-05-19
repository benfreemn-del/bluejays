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
  type Member,
  type Group,
  type Sermon,
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

function buildTabs(
  inbox: InboxItem[],
): { id: Tab; label: string; Icon: typeof House; count?: number }[] {
  return [
    { id: "overview", label: "Overview", Icon: House },
    {
      id: "inbox",
      label: "Inbox",
      Icon: EnvelopeSimple,
      count: inbox.filter((i) => i.status === "new").length,
    },
    { id: "members", label: "Members", Icon: Users },
    { id: "groups", label: "Thrive Groups", Icon: HandHeart },
    { id: "preschool", label: "Preschool", Icon: PaintBrushHousehold },
    { id: "sermons", label: "Sermons", Icon: BookBookmark },
    { id: "giving", label: "Giving", Icon: CurrencyDollar },
  ];
}

/* ════════════════════════ ROOT ════════════════════════ */

export default function ThrivePortalDemo() {
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  // Inbox is the only LIVE-DATA surface in v1 — every other tab is still
  // mock seed data. Defaults to the bundled mock so the sales-call demo
  // looks rich on first paint; once the API resolves we swap to real
  // submissions if any exist, otherwise keep the mock + flag usingDemoData
  // so the UI can show a small "demo data" pill.
  const [inboxItems, setInboxItems] = useState<InboxItem[]>(INBOX);
  const [usingDemoData, setUsingDemoData] = useState<boolean>(true);

  // Sticky unlock for the demo session
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.sessionStorage.getItem("thrive_portal_unlocked") === "1") {
        setUnlocked(true);
      }
    } catch {}
  }, []);

  // Fetch real client_leads after unlock. Falls back to mock if API
  // returns empty (no real submissions yet) or errors out.
  useEffect(() => {
    if (!unlocked) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/clients/thrive-church-sequim/inbox?gate=${encodeURIComponent(PASSWORD)}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          ok?: boolean;
          items?: InboxItem[];
          usingDemoData?: boolean;
        };
        if (cancelled) return;
        if (data.ok && Array.isArray(data.items) && data.items.length > 0) {
          setInboxItems(data.items);
          setUsingDemoData(false);
        } else {
          // No real submissions yet — keep the mock data visible.
          setUsingDemoData(true);
        }
      } catch (err) {
        console.error("[thrive portal] inbox fetch failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [unlocked]);

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
        fontFamily: "var(--font-thrive-body), sans-serif",
      }}
    >
      <TopBar
        inbox={inboxItems}
        onJumpToInbox={() => setTab("inbox")}
        onSignOut={() => {
          setUnlocked(false);
          try {
            window.sessionStorage.removeItem("thrive_portal_unlocked");
          } catch {}
        }}
      />
      <TabNav tab={tab} setTab={setTab} inbox={inboxItems} />
      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10">
        {tab === "overview" && (
          <OverviewTab
            setTab={setTab}
            inbox={inboxItems}
            usingDemoData={usingDemoData}
          />
        )}
        {tab === "inbox" && (
          <InboxTab
            inbox={inboxItems}
            usingDemoData={usingDemoData}
            onItemUpdate={(updated) =>
              setInboxItems((prev) =>
                prev.map((i) => (i.id === updated.id ? updated : i)),
              )
            }
          />
        )}
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
      style={{ background: TEAL_DEEP, color: INK_INVERTED, fontFamily: "var(--font-thrive-body), sans-serif" }}
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
              className="font-[family-name:var(--font-thrive-display)] text-xl"
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

function TopBar({
  inbox,
  onJumpToInbox,
  onSignOut,
}: {
  inbox: InboxItem[];
  onJumpToInbox: () => void;
  onSignOut: () => void;
}) {
  const [bellOpen, setBellOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const newItems = inbox.filter((i) => i.status === "new");

  // Click outside to close any open popover.
  useEffect(() => {
    if (!bellOpen && !avatarOpen) return;
    function onDocClick() {
      setBellOpen(false);
      setAvatarOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [bellOpen, avatarOpen]);

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
            <p className="font-[family-name:var(--font-thrive-display)] text-[18px]" style={{ color: CREAM, fontWeight: 600 }}>
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
          {/* Bell — popover shows recent new submissions, click any to
              jump to the Inbox tab. */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBellOpen((v) => !v);
                setAvatarOpen(false);
              }}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-white/[0.06]"
              style={{ borderColor: TEAL_BORDER, color: CREAM }}
              aria-label={`${newItems.length} new notifications`}
              aria-expanded={bellOpen}
            >
              <Bell size={16} weight="fill" />
              {newItems.length > 0 && (
                <span
                  className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                  style={{ background: ROSE, color: CREAM }}
                >
                  {newItems.length > 9 ? "9+" : newItems.length}
                </span>
              )}
            </button>
            {bellOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-12 z-50 w-80 rounded-xl border shadow-2xl"
                style={{ background: TEAL_PANEL, borderColor: TEAL_BORDER }}
              >
                <div
                  className="flex items-center justify-between border-b px-4 py-3"
                  style={{ borderColor: TEAL_BORDER }}
                >
                  <p className="text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: AMBER_LIGHT }}>
                    Notifications
                  </p>
                  <span className="text-[11px]" style={{ color: "rgba(251,247,238,0.55)" }}>
                    {newItems.length} new
                  </span>
                </div>
                <ul
                  className="max-h-72 divide-y overflow-y-auto"
                  style={{ borderColor: TEAL_BORDER }}
                >
                  {newItems.length === 0 ? (
                    <li className="px-4 py-6 text-center text-[13px]" style={{ color: "rgba(251,247,238,0.55)" }}>
                      All caught up — no new submissions.
                    </li>
                  ) : (
                    newItems.slice(0, 6).map((item) => (
                      <li
                        key={item.id}
                        className="cursor-pointer px-4 py-3 transition-colors hover:bg-white/[0.04]"
                        onClick={() => {
                          setBellOpen(false);
                          onJumpToInbox();
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[13px] font-semibold" style={{ color: CREAM }}>
                            {item.name}
                          </p>
                          <span className="shrink-0 text-[10px]" style={{ color: "rgba(251,247,238,0.5)" }}>
                            {item.receivedAt}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[12px]" style={{ color: "rgba(251,247,238,0.65)" }}>
                          {item.preview}
                        </p>
                      </li>
                    ))
                  )}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    setBellOpen(false);
                    onJumpToInbox();
                  }}
                  className="block w-full border-t px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-white/[0.04]"
                  style={{ borderColor: TEAL_BORDER, color: AMBER_LIGHT }}
                >
                  Open full inbox →
                </button>
              </div>
            )}
          </div>

          {/* Avatar — dropdown with sign-out. */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAvatarOpen((v) => !v);
                setBellOpen(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold transition-all hover:brightness-110"
              style={{ background: AMBER, color: CREAM }}
              aria-label="Account menu"
              aria-expanded={avatarOpen}
            >
              DL
            </button>
            {avatarOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-12 z-50 w-56 rounded-xl border shadow-2xl"
                style={{ background: TEAL_PANEL, borderColor: TEAL_BORDER }}
              >
                <div className="border-b px-4 py-3" style={{ borderColor: TEAL_BORDER }}>
                  <p className="text-[13px] font-semibold" style={{ color: CREAM }}>
                    Pastor Dave Lyke
                  </p>
                  <p className="text-[11px]" style={{ color: "rgba(251,247,238,0.55)" }}>
                    Lead Pastor · Demo session
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAvatarOpen(false);
                    onSignOut();
                  }}
                  className="block w-full px-4 py-3 text-left text-[13px] transition-colors hover:bg-white/[0.04]"
                  style={{ color: CREAM }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════ TAB NAV ════════════════════════ */

function TabNav({
  tab,
  setTab,
  inbox,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  inbox: InboxItem[];
}) {
  const tabs = buildTabs(inbox);
  return (
    <div className="border-b" style={{ background: TEAL_DEEP, borderColor: TEAL_BORDER }}>
      <div className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-3 sm:px-6">
        {tabs.map((t) => {
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

function OverviewTab({
  setTab,
  inbox,
  usingDemoData,
}: {
  setTab: (t: Tab) => void;
  inbox: InboxItem[];
  usingDemoData: boolean;
}) {
  void usingDemoData; // Reserved for future "demo data" badge here.
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
          className="mt-2 font-[family-name:var(--font-thrive-display)] text-[clamp(2rem,3.5vw,2.6rem)] leading-tight"
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
            {inbox.slice(0, 6).map((item) => (
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

function InboxTab({
  inbox,
  usingDemoData,
  onItemUpdate,
}: {
  inbox: InboxItem[];
  usingDemoData: boolean;
  onItemUpdate: (updated: InboxItem) => void;
}) {
  const [filter, setFilter] = useState<"all" | InboxType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | InboxStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Track selected by ID (not snapshot) so it always reflects the latest
  // state after mutations.
  const selected = selectedId
    ? (inbox.find((i) => i.id === selectedId) ?? null)
    : null;

  const filtered = useMemo(() => {
    return inbox.filter((i) => {
      if (filter !== "all" && i.type !== filter) return false;
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (search && !`${i.name} ${i.preview}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [inbox, filter, statusFilter, search]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-thrive-display)] text-[clamp(1.8rem,3vw,2.4rem)]" style={{ color: CREAM, fontWeight: 500 }}>
            Inbox
          </h2>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-[14px]" style={{ color: "rgba(251, 247, 238, 0.65)" }}>
            Every form submission across the public site lands here.
            {usingDemoData ? (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ background: "rgba(217, 119, 6, 0.16)", color: AMBER_LIGHT }}
              >
                <Sparkle size={10} weight="fill" /> Demo data
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ background: "rgba(60, 138, 90, 0.18)", color: VINE }}
              >
                <CheckCircle size={10} weight="fill" /> Live
              </span>
            )}
          </p>
        </div>
        {/* Header action buttons removed — filter chips below cover
            filtering, and notes attach per-item (via the detail panel),
            not at the tab level. Avoids dead-button UX. */}
      </div>

      {/* Type filter chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "connect", "prayer", "volunteer", "verse", "preschool"] as const).map((t) => {
          const count = t === "all" ? inbox.length : inbox.filter((i) => i.type === t).length;
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
                onClick={() => setSelectedId(item.id)}
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
            <InboxDetail
              item={selected}
              usingDemoData={usingDemoData}
              onUpdate={onItemUpdate}
            />
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

function InboxDetail({
  item,
  usingDemoData,
  onUpdate,
}: {
  item: InboxItem;
  usingDemoData: boolean;
  onUpdate: (updated: InboxItem) => void;
}) {
  const [noteDraft, setNoteDraft] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [pending, setPending] = useState<null | "status" | "note">(null);
  const [error, setError] = useState<string | null>(null);

  // Re-open the note draft to the current item's notes when switching items.
  useEffect(() => {
    setNoteDraft(item.notes ?? "");
    setNoteOpen(false);
    setError(null);
  }, [item.id, item.notes]);

  async function patch(body: Record<string, unknown>): Promise<boolean> {
    if (usingDemoData) {
      // Demo mode: skip the API entirely, mutation is purely local so
      // the sales-call demo still feels live.
      return true;
    }
    try {
      const res = await fetch(
        `/api/clients/thrive-church-sequim/inbox/${item.id}?gate=${encodeURIComponent("thrive2026")}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || data.ok === false) {
        setError(data.error || "Update failed");
        return false;
      }
      return true;
    } catch {
      setError("Network error");
      return false;
    }
  }

  async function handleMarkReplied() {
    if (item.status === "replied") return;
    setPending("status");
    setError(null);
    const ok = await patch({ funnel_status: "replied" });
    setPending(null);
    if (ok) onUpdate({ ...item, status: "replied" });
  }

  async function handleSaveNote() {
    const next = noteDraft.trim();
    setPending("note");
    setError(null);
    const ok = await patch({ notes: next });
    setPending(null);
    if (ok) {
      onUpdate({ ...item, notes: next });
      setNoteOpen(false);
    }
  }

  const replyHref = item.email
    ? `mailto:${item.email}?subject=${encodeURIComponent(`Re: your ${item.type === "prayer" ? "prayer request" : "note"} to Thrive Church`)}`
    : item.phone
      ? `tel:${item.phone.replace(/\D/g, "")}`
      : null;

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

      {/* Notes — saved verbatim to client_leads.notes. Shows existing
          notes; "Add note" opens an inline textarea to append/replace. */}
      {item.notes && !noteOpen && (
        <div
          className="rounded-lg border px-4 py-3"
          style={{
            borderColor: "rgba(251, 191, 36, 0.25)",
            background: "rgba(251, 191, 36, 0.06)",
          }}
        >
          <p
            className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: AMBER_LIGHT }}
          >
            Pastoral notes
          </p>
          <p
            className="whitespace-pre-wrap text-[13px] leading-relaxed"
            style={{ color: "rgba(251, 247, 238, 0.88)" }}
          >
            {item.notes}
          </p>
        </div>
      )}

      {noteOpen && (
        <div
          className="space-y-2 rounded-lg border p-3"
          style={{ borderColor: TEAL_BORDER, background: "rgba(10, 58, 54, 0.6)" }}
        >
          <label
            className="block text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: AMBER_LIGHT }}
          >
            {item.notes ? "Edit note" : "Add a note"}
          </label>
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            rows={3}
            placeholder="e.g. Called Tue — voicemail. Trying again Thu."
            className="w-full resize-y rounded-md border bg-transparent px-3 py-2 text-[13px] leading-relaxed outline-none"
            style={{ borderColor: TEAL_BORDER, color: CREAM }}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveNote}
              disabled={pending !== null}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] transition-all disabled:opacity-50"
              style={{ background: AMBER, color: CREAM }}
            >
              {pending === "note" ? "Saving…" : "Save note"}
            </button>
            <button
              type="button"
              onClick={() => {
                setNoteOpen(false);
                setNoteDraft(item.notes ?? "");
                setError(null);
              }}
              disabled={pending !== null}
              className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] disabled:opacity-50"
              style={{ borderColor: TEAL_BORDER, color: CREAM }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <p
          className="rounded-md border px-3 py-2 text-[12px]"
          style={{
            borderColor: "rgba(220, 107, 107, 0.4)",
            background: "rgba(220, 107, 107, 0.1)",
            color: ROSE,
          }}
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        {replyHref ? (
          <a
            href={replyHref}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] transition-all hover:brightness-110"
            style={{ background: AMBER, color: CREAM }}
          >
            <ChatCircleText size={12} weight="fill" />
            Reply{item.email ? " by email" : " by phone"}
          </a>
        ) : (
          <button
            type="button"
            disabled
            title="No contact info — reply directly via the prayer team channel."
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] opacity-50"
            style={{ background: AMBER, color: CREAM }}
          >
            <ChatCircleText size={12} weight="fill" /> No contact info
          </button>
        )}
        <button
          type="button"
          onClick={handleMarkReplied}
          disabled={pending !== null || item.status === "replied"}
          className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] transition-colors disabled:opacity-50"
          style={{ borderColor: TEAL_BORDER, color: CREAM }}
        >
          <CheckCircle size={12} weight="fill" />
          {pending === "status"
            ? "Saving…"
            : item.status === "replied"
              ? "Marked replied"
              : "Mark replied"}
        </button>
        <button
          type="button"
          onClick={() => {
            setNoteOpen(true);
            setError(null);
          }}
          disabled={pending !== null}
          className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] disabled:opacity-50"
          style={{ borderColor: TEAL_BORDER, color: CREAM }}
        >
          <Plus size={12} weight="bold" /> {item.notes ? "Edit note" : "Add note"}
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

/* ════════════════════════ INLINE ADD FORM (shared) ════════════════════════ */

type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  wide?: boolean;
};

function InlineAddForm({
  title,
  fields,
  onSave,
  onCancel,
  submitLabel = "Add",
}: {
  title: string;
  fields: FieldDef[];
  onSave: (values: Record<string, string>) => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of fields) init[f.key] = f.options?.[0] ?? "";
    return init;
  });
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && !values[f.key]?.trim()) {
        setError(`${f.label} is required.`);
        return;
      }
    }
    setError(null);
    onSave(values);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-5 rounded-xl border p-4 sm:p-5"
      style={{
        background: TEAL_PANEL,
        borderColor: "rgba(217, 119, 6, 0.35)",
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <Plus size={14} weight="bold" style={{ color: AMBER_LIGHT }} />
        <p
          className="text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{ color: AMBER_LIGHT }}
        >
          {title}
        </p>
        <span
          className="ml-auto text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "rgba(251, 247, 238, 0.45)" }}
        >
          Demo — not persisted
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <label
            key={f.key}
            className={f.wide || f.type === "textarea" ? "sm:col-span-2" : ""}
          >
            <span
              className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em]"
              style={{ color: "rgba(251, 247, 238, 0.55)" }}
            >
              {f.label}
              {f.required && (
                <span style={{ color: ROSE }} className="ml-1">
                  *
                </span>
              )}
            </span>
            {f.type === "textarea" ? (
              <textarea
                value={values[f.key] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.key]: e.target.value }))
                }
                rows={3}
                placeholder={f.placeholder}
                className="w-full rounded-md border bg-transparent px-3 py-2 text-[13px] outline-none"
                style={{ borderColor: TEAL_BORDER, color: CREAM }}
              />
            ) : f.type === "select" ? (
              <select
                value={values[f.key] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.key]: e.target.value }))
                }
                className="w-full rounded-md border bg-transparent px-3 py-2 text-[13px] outline-none"
                style={{ borderColor: TEAL_BORDER, color: CREAM }}
              >
                {f.options?.map((o) => (
                  <option key={o} value={o} style={{ color: "#000" }}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={values[f.key] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.key]: e.target.value }))
                }
                placeholder={f.placeholder}
                className="w-full rounded-md border bg-transparent px-3 py-2 text-[13px] outline-none"
                style={{ borderColor: TEAL_BORDER, color: CREAM }}
              />
            )}
          </label>
        ))}
      </div>
      {error && (
        <p
          className="mt-3 rounded-md border px-3 py-2 text-[12px]"
          style={{
            borderColor: "rgba(220, 107, 107, 0.4)",
            background: "rgba(220, 107, 107, 0.1)",
            color: ROSE,
          }}
        >
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] transition-all hover:brightness-110"
          style={{ background: AMBER, color: CREAM }}
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em]"
          style={{ borderColor: TEAL_BORDER, color: CREAM }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function AddMemberForm({
  onSave,
  onCancel,
}: {
  onSave: (m: Omit<Member, "id">) => void;
  onCancel: () => void;
}) {
  return (
    <InlineAddForm
      title="Add a new member"
      submitLabel="Add member"
      fields={[
        { key: "name", label: "Name", required: true, placeholder: "Jane Smith" },
        { key: "email", label: "Email", placeholder: "jane@example.com" },
        { key: "phone", label: "Phone", placeholder: "(360) 555-0100" },
        { key: "role", label: "Role", required: true, placeholder: "Member · Group Leader · Elder" },
        { key: "household", label: "Household / family name", placeholder: "Smith" },
        { key: "joined", label: "Joined (yr or yyyy-mm)", placeholder: "2026" },
      ]}
      onSave={(v) =>
        onSave({
          name: v.name,
          email: v.email || "",
          phone: v.phone || undefined,
          household: v.household || v.name.split(" ").slice(-1)[0] || "",
          role: v.role || "Member",
          groups: [],
          joined: v.joined || String(new Date().getFullYear()),
        })
      }
      onCancel={onCancel}
    />
  );
}

/* ════════════════════════ MEMBERS TAB ════════════════════════ */

function MembersTab() {
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const filtered = useMemo(
    () =>
      members.filter(
        (m) =>
          !search ||
          `${m.name} ${m.role} ${m.groups.join(" ")}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [members, search],
  );

  function handleAdd(draft: Omit<Member, "id">) {
    const id = `m_local_${Date.now()}`;
    setMembers((prev) => [{ id, ...draft }, ...prev]);
    setAddOpen(false);
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-thrive-display)] text-[clamp(1.8rem,3vw,2.4rem)]" style={{ color: CREAM, fontWeight: 500 }}>
            Members
          </h2>
          <p className="mt-1 text-[14px]" style={{ color: "rgba(251, 247, 238, 0.65)" }}>
            {members.length} families · {members.filter((m) => m.serving && m.serving.length > 0).length} serving on a team
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
          <button
            type="button"
            onClick={() => setAddOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold transition-all hover:brightness-110"
            style={{ background: AMBER, color: CREAM }}
          >
            <Plus size={14} weight="bold" /> Add member
          </button>
        </div>
      </div>

      {addOpen && <AddMemberForm onSave={handleAdd} onCancel={() => setAddOpen(false)} />}

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
  const [groups, setGroups] = useState<Group[]>(GROUPS);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-thrive-display)] text-[clamp(1.8rem,3vw,2.4rem)]" style={{ color: CREAM, fontWeight: 500 }}>
            Thrive Groups
          </h2>
          <p className="mt-1 text-[14px]" style={{ color: "rgba(251, 247, 238, 0.65)" }}>
            {groups.length} active groups · {groups.reduce((s, g) => s + g.current, 0)} people connected
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-all hover:brightness-110"
          style={{ background: AMBER, color: CREAM }}
        >
          <Plus size={14} weight="bold" /> Start a new group
        </button>
      </div>

      {addOpen && (
        <InlineAddForm
          title="Start a new Thrive Group"
          submitLabel="Add group"
          fields={[
            { key: "name", label: "Group name", required: true, placeholder: "Wednesday Young Adults" },
            { key: "leaders", label: "Leader(s)", required: true, placeholder: "Naomi Greaves" },
            {
              key: "day",
              label: "Meeting day",
              type: "select",
              options: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            },
            { key: "time", label: "Time", placeholder: "7:00 pm" },
            { key: "location", label: "Location", placeholder: "Sequim — N 5th Ave" },
            { key: "audience", label: "Audience", placeholder: "Couples · Men · 20s/30s" },
            { key: "capacity", label: "Capacity", placeholder: "12" },
          ]}
          onSave={(v) => {
            const cap = Math.max(1, parseInt(v.capacity, 10) || 12);
            setGroups((prev) => [
              {
                id: `g_local_${Date.now()}`,
                name: v.name,
                leaders: v.leaders,
                day: v.day || "Wednesday",
                time: v.time || "7:00 pm",
                location: v.location || "TBD",
                audience: v.audience || "Mixed adults",
                capacity: cap,
                current: 0,
                status: "open",
              },
              ...prev,
            ]);
            setAddOpen(false);
          }}
          onCancel={() => setAddOpen(false)}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((g) => {
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
                  <h3 className="font-[family-name:var(--font-thrive-display)] text-[18px] leading-tight" style={{ color: CREAM, fontWeight: 600 }}>
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
        <h2 className="font-[family-name:var(--font-thrive-display)] text-[clamp(1.8rem,3vw,2.4rem)]" style={{ color: CREAM, fontWeight: 500 }}>
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
  const [sermons, setSermons] = useState<Sermon[]>(SERMONS);
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-thrive-display)] text-[clamp(1.8rem,3vw,2.4rem)]" style={{ color: CREAM, fontWeight: 500 }}>
            Sermon Archive
          </h2>
          <p className="mt-1 text-[14px]" style={{ color: "rgba(251, 247, 238, 0.65)" }}>
            {sermons.filter((s) => s.status === "archived" || s.status === "live").length} published · {sermons.filter((s) => s.status === "draft").length} in draft
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-all hover:brightness-110"
          style={{ background: AMBER, color: CREAM }}
        >
          <Plus size={14} weight="bold" /> New sermon entry
        </button>
      </div>

      {addOpen && (
        <InlineAddForm
          title="New sermon entry"
          submitLabel="Add sermon"
          fields={[
            { key: "title", label: "Title", required: true, placeholder: "The Garden + The Cross" },
            { key: "series", label: "Series", placeholder: "We Are Thrive" },
            { key: "scripture", label: "Scripture", placeholder: "Luke 22:39-46" },
            { key: "speaker", label: "Speaker", placeholder: "Pastor Dave Lyke" },
            { key: "date", label: "Date", placeholder: "May 26, 2026" },
            { key: "durationMin", label: "Duration (min)", placeholder: "35" },
            { key: "status", label: "Status", type: "select", options: ["draft", "live", "archived"] },
          ]}
          onSave={(v) => {
            setSermons((prev) => [
              {
                id: `s_local_${Date.now()}`,
                title: v.title,
                series: v.series || "—",
                scripture: v.scripture || "—",
                speaker: v.speaker || "Pastor Dave Lyke",
                date: v.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                durationMin: Math.max(1, parseInt(v.durationMin, 10) || 35),
                youtubeViews: 0,
                status: (v.status as Sermon["status"]) || "draft",
              },
              ...prev,
            ]);
            setAddOpen(false);
          }}
          onCancel={() => setAddOpen(false)}
        />
      )}

      <Panel>
        <ul className="divide-y" style={{ borderColor: TEAL_BORDER }}>
          {sermons.map((s) =>
            editingId === s.id ? (
              <li key={s.id} className="px-3 py-4">
                <InlineAddForm
                  title={`Edit · ${s.title}`}
                  submitLabel="Save"
                  fields={[
                    { key: "title", label: "Title", required: true },
                    { key: "series", label: "Series" },
                    { key: "scripture", label: "Scripture" },
                    { key: "speaker", label: "Speaker" },
                    { key: "date", label: "Date" },
                    { key: "durationMin", label: "Duration (min)" },
                    { key: "status", label: "Status", type: "select", options: ["draft", "live", "archived"] },
                  ]}
                  onSave={(v) => {
                    setSermons((prev) =>
                      prev.map((row) =>
                        row.id === s.id
                          ? {
                              ...row,
                              title: v.title || row.title,
                              series: v.series || row.series,
                              scripture: v.scripture || row.scripture,
                              speaker: v.speaker || row.speaker,
                              date: v.date || row.date,
                              durationMin: parseInt(v.durationMin, 10) || row.durationMin,
                              status: (v.status as Sermon["status"]) || row.status,
                            }
                          : row,
                      ),
                    );
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li key={s.id} className="flex flex-col gap-3 px-3 py-4 sm:flex-row sm:items-center sm:gap-5">
                <span
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${TEAL}aa`, color: AMBER_LIGHT }}
                >
                  <BookBookmark size={20} weight="fill" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <h3 className="font-[family-name:var(--font-thrive-display)] text-[16px]" style={{ color: CREAM, fontWeight: 600 }}>
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
                <button
                  type="button"
                  onClick={() => setEditingId(s.id)}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors hover:text-white"
                  style={{ color: AMBER_LIGHT }}
                >
                  Edit <CaretRight size={12} weight="bold" />
                </button>
              </li>
            ),
          )}
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
        <h2 className="font-[family-name:var(--font-thrive-display)] text-[clamp(1.8rem,3vw,2.4rem)]" style={{ color: CREAM, fontWeight: 500 }}>
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
              <span className="font-[family-name:var(--font-thrive-display)] text-[28px]" style={{ color: AMBER_LIGHT, fontWeight: 600 }}>
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
        className="mt-3 font-[family-name:var(--font-thrive-display)] text-[clamp(1.4rem,2.2vw,1.9rem)] leading-none"
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
  const [done, setDone] = useState(false);
  if (done) return null;
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
      <button
        type="button"
        onClick={() => setDone(true)}
        title="Mark this action done"
        className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:text-white"
        style={{ color: AMBER_LIGHT }}
      >
        <CheckCircle size={12} weight="fill" /> Done
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
