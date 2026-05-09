import ClientTabsBar from "@/components/dashboard/ClientTabsBar";

/**
 * /dashboard/clients/[slug]/layout — wraps every per-client surface
 * (tasks, leads, insights, reports, ads, affiliates, testimonials,
 * camps) with a unified tab bar so they feel like ONE tabbed app
 * instead of 8 separate routes.
 *
 * Per dashboard review (2026-05-08) #2 — biggest UX leverage move
 * across the operator dashboard.
 *
 * Each child page should render content-only (no duplicate header
 * with back button + title) — the layout supplies that chrome.
 *
 * Zenith-specific siblings (/dashboard/clients/zenith-sports/{ai-operator,
 * drill-of-week}) are NOT wrapped by this layout (they live at
 * a different routing depth) but still embed <ClientTabsBar /> in
 * their own pages so navigation feels seamless. usePathname() in
 * ClientTabsBar handles active-tab highlighting from any URL.
 */

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <ClientTabsBar slug={slug} displayName={prettyName(slug)} />
      {children}
    </div>
  );
}

/**
 * Slug → display name. Hard-coded for the active client roster
 * because pulling from Supabase per layout-render is overkill and
 * the slug→name map only changes when we onboard a new client (low
 * frequency).
 */
function prettyName(slug: string): string {
  const map: Record<string, string> = {
    "zenith-sports": "Zenith / Tekky",
    "itc-quick-attach": "ITC Quick Attach",
    "laser-lakes": "Laser Lakes",
    "hector-landscaping": "Hector Landscaping",
    "olympic-inspections": "Olympic Inspections",
    "mt-view-landscaping": "Mountain View Landscape",
    "lewis-county-autism": "Lewis County Autism Coalition",
    "bloodlines": "Bloodlines · Preston Hunsaker",
    "kr-ranches": "KR Ranches",
    "masters-window-tinting": "Masters Window Tinting",
    "meyer-electric": "Meyer Electric",
    "the-oregon-appraisers": "The Oregon Appraisers",
    "nevarland-outpost": "Nevarland Outpost",
  };
  return map[slug] || slug;
}
