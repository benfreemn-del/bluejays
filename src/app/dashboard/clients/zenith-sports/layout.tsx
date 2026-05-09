import ClientTabsBar from "@/components/dashboard/ClientTabsBar";

/**
 * /dashboard/clients/zenith-sports/layout — wraps the Zenith-specific
 * sibling routes (ads, ai-operator, drill-of-week) with the same tab
 * bar that the dynamic [slug]/layout provides for the generic per-
 * client pages.
 *
 * Why this duplicate exists: Next.js static route segments
 * (/zenith-sports/) don't inherit layouts from sibling dynamic
 * segments (/[slug]/). Without this layout, Zenith-specific pages
 * would render bare while every other client got the unified tab
 * bar. So we mirror it here.
 *
 * When ITC adds its own Zenith-style siblings (e.g. an ITC-specific
 * configurator dashboard), copy this file to
 * /dashboard/clients/itc-quick-attach/layout.tsx and adjust slug.
 */

export default function ZenithLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <ClientTabsBar slug="zenith-sports" displayName="Zenith / Tekky" />
      {children}
    </div>
  );
}
