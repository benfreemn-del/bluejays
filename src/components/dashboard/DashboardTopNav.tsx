"use client";

/**
 * DashboardTopNav — full-width, 7-category hover/click-dropdown nav for
 * /dashboard. Replaces the flat single-row tab strip (2026-05-16 build)
 * which forced 15+ items into one horizontal scroll lane.
 *
 * Categories (left → right):
 *   1. Overview    — standalone (no dropdown)
 *   2. Leads       — top-of-funnel: Leads / Map / Funnels
 *   3. Sales       — Pipeline / Win-Loss / Sales Portal / Case Studies
 *   4. AI System   — AI Skills / AI Bots / Hyperloop / Diagnostic (NEW)
 *   5. Clients     — Client Jobs / Onboarding / Master To-Do / Customers / Partners
 *   6. Marketing   — Ads / Content / Blog / Cold Traffic / Social Leads
 *   7. Admin       — Numbers / Backend Audit / Team / Agency / Settings
 *
 * Dropdown UX:
 *   - Hover the category button → dropdown opens after a 100ms delay
 *   - Click the category button → dropdown toggles immediately
 *   - Move into the dropdown → stays open
 *   - Leave both the button AND the dropdown → closes after 150ms
 *   - Click an item → closes
 *   - Click outside / Esc → closes
 *
 * Active-state contract:
 *   - The category whose tab matches `activeTab` gets a blue underline
 *   - The item inside that category whose id matches `activeTab` gets
 *     a blue background tint so the dropdown shows what you're on
 *
 * Role gating:
 *   - When `role === "sales"`, items not in SALES_TOP_NAV_ALLOWED are
 *     filtered out before render. Categories that end up with zero
 *     items are hidden entirely.
 */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SALES_TOP_NAV_ALLOWED } from "@/lib/use-role";

/** Every tab id that can appear in the nav (subset of the dashboard Tab union). */
export type NavTabId =
  | "overview"
  | "leads"
  | "map"
  | "funnels"
  | "sales-pipeline"
  | "win-loss"
  | "sales-portal"
  | "case-studies"
  | "ai-skills"
  | "ai-bots"
  | "hyperloop"
  | "diagnostic"
  | "client-jobs"
  | "onboarding"
  | "todo"
  | "customers"
  | "partners"
  | "ads"
  | "content"
  | "blog"
  | "cold-traffic"
  | "social-leads"
  | "heatmap"
  | "hormozi"
  | "numbers"
  | "backend-audit"
  | "team"
  | "agency"
  | "settings";

type NavItem = {
  id: NavTabId;
  label: string;
  emoji: string;
  /** When set, renders as a Link (navigates away). When unset, fires
      onTabChange so the dashboard swaps content in place. */
  href?: string;
  /** Optional one-liner shown under the label in the dropdown. */
  hint?: string;
};

type NavCategory = {
  id:
    | "overview"
    | "leads"
    | "sales"
    | "ai-system"
    | "clients"
    | "marketing"
    | "admin";
  label: string;
  emoji: string;
  /** When set on a category, clicking the category button itself fires
      onTabChange (used for Overview which has no children). */
  directTabId?: NavTabId;
  items: NavItem[];
};

/**
 * The category contract. Order here = order in the nav.
 * Adding a new tab → add an entry under the right category. The
 * dashboard page's Tab union + in-place switch statement must also
 * be updated for in-place tabs (anything without href).
 */
const CATEGORIES: NavCategory[] = [
  {
    id: "overview",
    label: "Overview",
    emoji: "🏠",
    directTabId: "overview",
    items: [],
  },
  {
    id: "leads",
    label: "Leads",
    emoji: "📥",
    items: [
      { id: "leads", label: "Leads", emoji: "📥", hint: "All prospects, search + filter" },
      { id: "map", label: "Map", emoji: "🗺️", hint: "Lead geography" },
      { id: "funnels", label: "Funnels", emoji: "🎯", hint: "Outreach sequences in flight" },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    emoji: "🤝",
    items: [
      {
        id: "sales-pipeline",
        label: "Sales Pipeline",
        emoji: "📊",
        href: "/dashboard/sales-pipeline",
        hint: "Deals by stage + $ at risk",
      },
      {
        id: "win-loss",
        label: "Win-Loss",
        emoji: "📉",
        href: "/dashboard/win-loss",
        hint: "Why we won / lost — last 30d",
      },
      {
        id: "sales-portal",
        label: "Sales Portal",
        emoji: "🤝",
        href: "/dashboard/script",
        hint: "Madie's daily portal",
      },
      {
        id: "case-studies",
        label: "Case Studies",
        emoji: "📚",
        href: "/dashboard/case-studies",
        hint: "Closed wins, screenshots, metrics",
      },
    ],
  },
  {
    id: "ai-system",
    label: "AI System",
    emoji: "🧠",
    items: [
      { id: "ai-skills", label: "AI Skills", emoji: "🧠", hint: "Auto-replies, agents, classifiers" },
      {
        id: "ai-bots",
        label: "AI Bots",
        emoji: "🤖",
        href: "/dashboard/ai-bots",
        hint: "Per-client bot configs + logs",
      },
      {
        id: "hyperloop",
        label: "Hyperloop",
        emoji: "♻️",
        href: "/dashboard/hyperloop",
        hint: "Weekly auto-optimize loop",
      },
      {
        id: "diagnostic",
        label: "Diagnostic",
        emoji: "🩺",
        href: "/dashboard/diagnostic",
        hint: "Hormozi fit + 5-clog scoring",
      },
    ],
  },
  {
    id: "clients",
    label: "Clients",
    emoji: "💼",
    items: [
      {
        id: "client-jobs",
        label: "Client Jobs",
        emoji: "💼",
        href: "/dashboard/clients",
        hint: "Every active build, by stage",
      },
      {
        id: "onboarding",
        label: "Onboarding",
        emoji: "🛒",
        href: "/dashboard/onboarding",
        hint: "New-customer forms + status",
      },
      {
        id: "todo",
        label: "Master To-Do",
        emoji: "✅",
        href: "/dashboard/all-tasks",
        hint: "Every client_tasks row, filterable",
      },
      {
        id: "customers",
        label: "Customers",
        emoji: "👥",
        href: "/dashboard/customers",
        hint: "Paying customers + LTV",
      },
      {
        id: "partners",
        label: "Partners",
        emoji: "🤲",
        href: "/dashboard/partners",
        hint: "Commission partners + payouts",
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    emoji: "📢",
    items: [
      { id: "ads", label: "Ads", emoji: "📢", hint: "Active creatives + spend" },
      {
        id: "content",
        label: "Content",
        emoji: "🎙️",
        href: "/dashboard/content",
        hint: "Daily LinkedIn/IG/Shorts brief",
      },
      {
        id: "blog",
        label: "Blog",
        emoji: "📝",
        href: "/dashboard/blog",
        hint: "SEO posts published + drafts",
      },
      {
        id: "cold-traffic",
        label: "Cold Traffic",
        emoji: "❄️",
        href: "/dashboard/cold-traffic",
        hint: "Paid + cold-outreach conversion",
      },
      {
        id: "social-leads",
        label: "Social Leads",
        emoji: "📱",
        href: "/dashboard/social-leads",
        hint: "Inbound from IG / LinkedIn / TT",
      },
      {
        id: "heatmap",
        label: "Heat Map",
        emoji: "♨️",
        href: "/dashboard/heatmap",
        hint: "Leakage overlay on live site (Clarity-powered)",
      },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    emoji: "⚙️",
    items: [
      {
        id: "numbers",
        label: "Numbers",
        emoji: "🧮",
        href: "/dashboard/numbers",
        hint: "MRR / cost / cash / margin",
      },
      {
        id: "backend-audit",
        label: "Backend Audit",
        emoji: "🔍",
        href: "/dashboard/backend-audit",
        hint: "Cron heartbeats + system health",
      },
      {
        id: "hormozi",
        label: "Hormozi Scoreboard",
        emoji: "🐎",
        href: "/dashboard/hormozi",
        hint: "6-Horseman live state + critical-week + back-end fix",
      },
      {
        id: "team",
        label: "Team",
        emoji: "👤",
        href: "/dashboard/team",
        hint: "Roles + access",
      },
      {
        id: "agency",
        label: "Agency",
        emoji: "🏢",
        href: "/dashboard/agency",
        hint: "Sub-agency white-label config",
      },
      { id: "settings", label: "Settings", emoji: "⚙️", hint: "App-wide preferences" },
    ],
  },
];

type Props = {
  activeTab: NavTabId;
  onTabChange: (next: NavTabId) => void;
  role: "owner" | "sales" | string;
};

export default function DashboardTopNav({
  activeTab,
  onTabChange,
  role,
}: Props) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

  // Role-aware view: filter items the sales role can't see, drop
  // categories that end up empty (so Madie doesn't see hollow buttons).
  const visibleCategories = CATEGORIES.flatMap<NavCategory>((cat) => {
    if (role !== "sales") return [cat];
    const filtered = cat.items.filter((i) => SALES_TOP_NAV_ALLOWED.has(i.id));
    if (cat.id === "overview") return [cat]; // overview always visible
    if (filtered.length === 0) return [];
    return [{ ...cat, items: filtered }];
  });

  // Which category contains the active tab? Used for underline state.
  const activeCategoryId = (() => {
    for (const cat of CATEGORIES) {
      if (cat.directTabId === activeTab) return cat.id;
      if (cat.items.some((i) => i.id === activeTab)) return cat.id;
    }
    return null;
  })();

  const clearTimers = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(
    (catId: string) => {
      clearTimers();
      openTimer.current = setTimeout(() => setOpenCategory(catId), 100);
    },
    [clearTimers],
  );

  const scheduleClose = useCallback(() => {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpenCategory(null), 150);
  }, [clearTimers]);

  // Close on outside-click or Esc.
  useEffect(() => {
    if (!openCategory) return;
    const onDocClick = (e: MouseEvent) => {
      if (!navRef.current) return;
      if (e.target instanceof Node && !navRef.current.contains(e.target)) {
        setOpenCategory(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenCategory(null);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openCategory]);

  return (
    <div ref={navRef} className="w-full">
      <div className="mx-auto flex w-full max-w-screen-2xl items-stretch gap-1 px-3 sm:px-6 lg:px-8">
        {visibleCategories.map((cat) => {
          const isOpen = openCategory === cat.id;
          const isActive = activeCategoryId === cat.id;
          const hasDropdown = cat.items.length > 0;

          const buttonClass = `relative flex items-center gap-2 px-4 sm:px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
            isActive
              ? "border-blue-400 text-white"
              : "border-transparent text-slate-400 hover:text-white hover:border-slate-600"
          }`;

          const onButtonClick = () => {
            if (cat.directTabId) {
              onTabChange(cat.directTabId);
              setOpenCategory(null);
              return;
            }
            // For dropdown categories: click toggles the dropdown.
            clearTimers();
            setOpenCategory((prev) => (prev === cat.id ? null : cat.id));
          };

          return (
            <div
              key={cat.id}
              className="relative"
              onMouseEnter={() => hasDropdown && scheduleOpen(cat.id)}
              onMouseLeave={() => hasDropdown && scheduleClose()}
            >
              <button
                type="button"
                onClick={onButtonClick}
                className={buttonClass}
                aria-expanded={hasDropdown ? isOpen : undefined}
                aria-haspopup={hasDropdown ? "true" : undefined}
              >
                <span className="text-base">{cat.emoji}</span>
                <span>{cat.label}</span>
                {hasDropdown && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    aria-hidden
                    className={`opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  >
                    <path
                      d="M1 3 L5 7 L9 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>

              {hasDropdown && isOpen && (
                <div
                  className="absolute left-0 top-full z-50 mt-1 min-w-[260px] rounded-xl border border-slate-700/60 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur"
                  onMouseEnter={() => clearTimers()}
                  onMouseLeave={() => scheduleClose()}
                >
                  {cat.items.map((item) => {
                    const itemActive = activeTab === item.id;
                    const itemCls = `flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                      itemActive
                        ? "bg-blue-500/15 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`;
                    const inner = (
                      <>
                        <span className="text-lg leading-none mt-0.5">{item.emoji}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">
                            {item.label}
                          </span>
                          {item.hint && (
                            <span className="mt-0.5 block text-xs text-slate-500 leading-snug">
                              {item.hint}
                            </span>
                          )}
                        </span>
                        {itemActive && (
                          <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-400" />
                        )}
                      </>
                    );
                    if (item.href) {
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className={itemCls}
                          onClick={() => setOpenCategory(null)}
                        >
                          {inner}
                        </Link>
                      );
                    }
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onTabChange(item.id);
                          setOpenCategory(null);
                        }}
                        className={`${itemCls} w-full text-left`}
                      >
                        {inner}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
