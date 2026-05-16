"use client";

/**
 * Shared layout for every /dashboard/* route.
 *
 * Mounts the BlueJays brand strip + 7-category top nav so it persists
 * across every backend surface. Before this layout existed (pre-
 * 2026-05-12), the new DashboardTopNav only rendered on /dashboard
 * root — clicking any item navigated to a sub-page that had its own
 * bespoke header and the global nav vanished. Operators got lost
 * every time they navigated.
 *
 * The /dashboard root page itself still renders its own brand row +
 * nav (pre-existing); this layout detects that and renders ONLY the
 * children to avoid double-mount. Every other /dashboard/* surface
 * picks up the layout's nav. Sub-pages can shrink their own bespoke
 * headers over time as a follow-up cleanup.
 *
 * In-place tab clicks (overview / leads / map / funnels / ads /
 * ai-skills / settings) from a sub-page route back to
 * /dashboard?tab=<id> so the destination loads the right tab.
 */

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import RoleBadge from "@/components/dashboard/RoleBadge";
import DashboardTopNav, {
  type NavTabId,
} from "@/components/dashboard/DashboardTopNav";
import { useRole } from "@/lib/use-role";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const role = useRole();

  // The root /dashboard page renders its own brand row + nav already
  // (with full tab-state wiring for in-place tab switches). Don't
  // double-mount on that one route — let the page own its header.
  const isDashboardRoot =
    pathname === "/dashboard" || pathname === "/dashboard/";

  if (isDashboardRoot) {
    return <>{children}</>;
  }

  // Sub-page mode: render the global brand strip + nav, then the page
  // content below. Sub-pages can keep their existing in-page titles —
  // the nav just sits on top.
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center gap-3 px-4 sm:px-6 lg:px-8 py-3">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-electric to-blue-deep" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                BlueJays
              </p>
              <h1 className="truncate text-2xl font-bold sm:text-3xl">
                Dashboard
              </h1>
            </div>
          </Link>
          <div className="ml-auto">
            <RoleBadge />
          </div>
        </div>

        <DashboardTopNav
          activeTab={"overview" as NavTabId}
          onTabChange={(next) => {
            // In-place tabs from a sub-page → route back to /dashboard
            // with the tab pre-selected via query param.
            router.push(`/dashboard?tab=${encodeURIComponent(next)}`);
          }}
          role={role}
        />
      </header>
      {children}
    </div>
  );
}
