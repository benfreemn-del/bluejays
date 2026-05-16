"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole, SALES_CLIENT_TAB_ALLOWED } from "@/lib/use-role";
import { clientSiteFor } from "@/lib/client-site-urls";

/**
 * ClientTabsBar — unified tab bar that wraps every per-client
 * dashboard surface so /dashboard/clients/[slug]/* feels like ONE
 * tabbed application instead of 8 separate routes.
 *
 * Per the dashboard review (2026-05-08) #2: the per-client surface
 * was the most fragmented part of the operator dashboard. Tabs swap
 * the URL (preserves deep-links + bookmarks) but the visual chrome
 * stays consistent so it feels in-place.
 *
 * Tab visibility is tier-gated per the CLAUDE.md "Client Tenant
 * Status" table:
 *   - Tasks: always
 *   - Leads / Insights / Reports / Affiliates / Ads / AI Operator:
 *     AI Marketing System tier only (zenith-sports, itc-quick-attach)
 *   - Testimonials: any client with an Owner Portal
 *   - Camps / Drill of Week: Zenith-specific
 *
 * Active tab is highlighted via usePathname(). Mounts inside
 * [slug]/layout.tsx (covers most pages) AND inside the Zenith-
 * specific sibling pages (drill-of-week, ai-operator) so navigation
 * feels seamless even though the routing trees differ.
 */

const AI_SYSTEM_SLUGS = new Set(["zenith-sports", "itc-quick-attach"]);
const PORTAL_SLUGS = new Set([
  "zenith-sports",
  "itc-quick-attach",
  "laser-lakes",
]);

const SLUG_CATEGORY: Record<string, string> = {
  "zenith-sports": "soccer training",
  "itc-quick-attach": "tractor accessories",
  "laser-lakes": "marine / outdoor recreation",
  "hector-landscaping": "landscaping",
  "mt-view-landscaping": "landscaping",
  "olympic-inspections": "home inspection",
  "lewis-county-autism": "non-profit",
  "bloodlines": "indie author",
  "kr-ranches": "farm-direct meat",
  "masters-window-tinting": "window tint / auto detail",
  "meyer-electric": "electrician",
  "the-oregon-appraisers": "real estate appraisal",
  "nevarland-outpost": "outdoor / hunting",
  "elite-hardscapes-and-landscapes": "landscaping",
};

type TabDef = {
  id: string;
  label: string;
  emoji: string;
  /** Path relative to the client root, e.g. "" for tasks, "/leads"
   *  for leads. For Zenith-specific tabs that live at
   *  /dashboard/clients/zenith-sports/... we use a full path. */
  href: (slug: string) => string;
  /** When the URL matches this prefix, highlight this tab. Same
   *  function shape as href so test-by-pathname is one-liner. */
  matchPrefix: (slug: string) => string;
  visible: (slug: string) => boolean;
};

const TABS: TabDef[] = [
  {
    id: "tasks",
    label: "Tasks",
    emoji: "✅",
    href: (slug) => `/dashboard/clients/${slug}`,
    matchPrefix: (slug) => `/dashboard/clients/${slug}`,
    visible: () => true,
  },
  {
    id: "leads",
    label: "Leads",
    emoji: "📥",
    href: (slug) => `/dashboard/clients/${slug}/leads`,
    matchPrefix: (slug) => `/dashboard/clients/${slug}/leads`,
    visible: (slug) => AI_SYSTEM_SLUGS.has(slug),
  },
  {
    id: "insights",
    label: "Insights",
    emoji: "📊",
    href: (slug) => `/dashboard/clients/${slug}/insights`,
    matchPrefix: (slug) => `/dashboard/clients/${slug}/insights`,
    visible: (slug) => AI_SYSTEM_SLUGS.has(slug),
  },
  {
    id: "reports",
    label: "Reports",
    emoji: "📈",
    href: (slug) => `/dashboard/clients/${slug}/reports`,
    matchPrefix: (slug) => `/dashboard/clients/${slug}/reports`,
    visible: (slug) => AI_SYSTEM_SLUGS.has(slug),
  },
  {
    id: "ads",
    label: "Ads",
    emoji: "📢",
    href: (slug) => `/dashboard/clients/${slug}/ads`,
    matchPrefix: (slug) => `/dashboard/clients/${slug}/ads`,
    visible: (slug) => AI_SYSTEM_SLUGS.has(slug),
  },
  {
    id: "affiliates",
    label: "Affiliates",
    emoji: "🤝",
    href: (slug) => `/dashboard/clients/${slug}/affiliates`,
    matchPrefix: (slug) => `/dashboard/clients/${slug}/affiliates`,
    visible: (slug) => AI_SYSTEM_SLUGS.has(slug),
  },
  {
    id: "testimonials",
    label: "Testimonials",
    emoji: "⭐",
    href: (slug) => `/dashboard/clients/${slug}/testimonials`,
    matchPrefix: (slug) => `/dashboard/clients/${slug}/testimonials`,
    visible: (slug) => PORTAL_SLUGS.has(slug),
  },
  {
    // Docs — per-client password vault, signed acknowledgments, and
    // shareable onboarding doc index. Owner-only (sensitive creds).
    // Always visible for owners across every slug — every client has
    // SOME account credentials worth tracking, even leads-only ones.
    // See CLAUDE.md "Per-Client Docs + Credentials Pattern".
    id: "docs",
    label: "Docs",
    emoji: "🗂",
    href: (slug) => `/dashboard/clients/${slug}/docs`,
    matchPrefix: (slug) => `/dashboard/clients/${slug}/docs`,
    visible: () => true,
  },
  {
    id: "diagnostic",
    label: "Diagnostic",
    emoji: "🧠",
    href: (slug) => {
      const category = SLUG_CATEGORY[slug] ?? "";
      const params = new URLSearchParams({ slug });
      if (category) params.set("category", category);
      return `/dashboard/diagnostic?${params.toString()}`;
    },
    matchPrefix: () => `/dashboard/diagnostic`,
    visible: () => true,
  },
  {
    id: "camps",
    label: "Camps",
    emoji: "⚽",
    href: (slug) => `/dashboard/clients/${slug}/camps`,
    matchPrefix: (slug) => `/dashboard/clients/${slug}/camps`,
    visible: (slug) => slug === "zenith-sports",
  },
  // Zenith-specific siblings (sit at /dashboard/clients/zenith-sports/<x>
  // not /[slug]/<x>). The hrefs hard-code zenith-sports because these
  // routes don't accept any other slug. visible() guards against showing
  // them on other clients' pages even if they somehow navigated there.
  {
    id: "drill-of-week",
    label: "Drill of Week",
    emoji: "🎯",
    href: () => `/dashboard/clients/zenith-sports/drill-of-week`,
    matchPrefix: () => `/dashboard/clients/zenith-sports/drill-of-week`,
    visible: (slug) => slug === "zenith-sports",
  },
  {
    id: "ai-operator",
    label: "AI Operator",
    emoji: "🧠",
    href: () => `/dashboard/clients/zenith-sports/ai-operator`,
    matchPrefix: () => `/dashboard/clients/zenith-sports/ai-operator`,
    visible: (slug) => slug === "zenith-sports",
  },
];

type Props = {
  slug: string;
  /** Display name of the client — pulled by the parent layout from
   *  prospects/clients table. Falls back to the slug if not provided. */
  displayName?: string;
};

function FeatherIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3 h-3"
      aria-hidden
    >
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <line x1="17.5" y1="15" x2="9" y2="15" />
    </svg>
  );
}

export default function ClientTabsBar({ slug, displayName }: Props) {
  const pathname = usePathname();
  const role = useRole();
  // Per-slug visibility AND per-role visibility. Sales (Madie) sees
  // a curated subset (Tasks · Leads · Ads · Testimonials) per Q4=A.
  // Owner sees everything that passes the slug-tier gate.
  const visibleTabs = TABS.filter((t) => {
    if (!t.visible(slug)) return false;
    if (role === "sales" && !SALES_CLIENT_TAB_ALLOWED.has(t.id)) return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/85 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-3">
        <Link
          href="/dashboard/clients"
          className="text-slate-400 hover:text-white text-sm flex items-center gap-1 whitespace-nowrap"
        >
          ← Clients
        </Link>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight flex-1 truncate">
          {displayName || slug}
        </h1>
        {role === "owner" && (
          <a
            href={`/api/admin/impersonate-client?slug=${encodeURIComponent(slug)}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open this client's owner portal as them (no login required) — Routes, Tasks, Leads, all of it"
            className="text-[11px] tracking-wider uppercase font-bold text-emerald-300 hover:text-white border border-emerald-700/50 hover:border-emerald-500 px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1"
          >
            <FeatherIcon />
            Backend
          </a>
        )}
        {(() => {
          const site = clientSiteFor(slug);
          if (site.kind === "none") return null;
          return (
            <Link
              href={site.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] tracking-wider uppercase font-bold text-slate-300 hover:text-white border border-slate-700 px-2.5 py-1 rounded whitespace-nowrap"
              title={
                site.kind === "internal"
                  ? "Open the bespoke preview site"
                  : "Open the client's production site"
              }
            >
              Site ↗
            </Link>
          );
        })()}
      </div>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 flex gap-1 sm:gap-2 text-sm overflow-x-auto">
        {visibleTabs.map((t) => {
          // Diagnostic tab pre-fills businessName from displayName at render
          // time (displayName isn't in scope inside the static TABS const).
          let href = t.href(slug);
          if (t.id === "diagnostic" && displayName) {
            const url = new URL(href, "http://x");
            url.searchParams.set("businessName", displayName);
            href = url.pathname + url.search;
          }
          const matchPrefix = t.matchPrefix(slug);
          // Active when pathname matches the prefix exactly OR when
          // pathname is the slug root + matchPrefix is the tasks tab
          // (the tasks tab is the [slug] root with no suffix).
          const isTasksRoot =
            t.id === "tasks" &&
            (pathname === `/dashboard/clients/${slug}` ||
              pathname === `/dashboard/clients/${slug}/`);
          const isOtherTab =
            t.id !== "tasks" && pathname.startsWith(matchPrefix);
          const active = isTasksRoot || isOtherTab;
          return (
            <Link
              key={t.id}
              href={href}
              className={`py-2.5 px-3 sm:px-4 border-b-2 transition font-semibold flex items-center gap-1.5 whitespace-nowrap ${
                active
                  ? "border-blue-400 text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className="text-base">{t.emoji}</span>
              {t.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
