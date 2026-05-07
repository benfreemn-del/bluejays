import { redirect } from "next/navigation";

/**
 * /dashboard/funnel → /dashboard?tab=funnels
 *
 * Funnels was hoisted into the main `/dashboard` tab bar (in-place,
 * matching the Zenith owner-portal pattern Ben uses on every other
 * client portal). The standalone route stays as a server-side
 * redirect so deep links + bookmarks continue to land in the right
 * place.
 *
 * Real rendering lives in:
 *   src/components/dashboard/BluejaysFunnelsTab.tsx
 * which is mounted on /dashboard when tab === "funnels".
 */

export default function DashboardFunnelRedirect() {
  redirect("/dashboard?tab=funnels");
}
