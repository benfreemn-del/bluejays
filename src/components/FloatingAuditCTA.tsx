"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Floating "Free audit →" pill pinned top-right of the page. Plays the
 * role of a nav-bar CTA on routes that don't have a real nav (homepage,
 * V2 showcase pages). Lead-magnet entry point for warm-but-not-ready
 * visitors browsing the portfolio (Q5A).
 *
 * Visibility rules — show ONLY where the audit pitch makes sense:
 *  - Homepage `/`
 *  - V2 showcase pages `/v2/*`
 *  - Templates index `/templates*`
 * Hide on:
 *  - The audit funnel itself (`/audit*`) — already pitching
 *  - Funnel surfaces (`/preview/*`, `/claim/*`, `/compare/*`,
 *    `/onboarding/*`, `/upsells/*`, `/welcome/*`, `/client/*`) —
 *    these have their own primary CTA
 *  - Public NPS/review-blast/short-link routes — context mismatch
 *  - Operator surfaces (`/dashboard*`, `/lead*`, `/image-mapper*`,
 *    `/preview-device*`, etc.) — distraction
 *  - Any route the user is unauthenticated to see (handled implicitly
 *    since this component never renders on those paths anyway)
 *
 * Mounted in the root layout so it appears across the site without
 * needing to be wired into every page individually.
 */

const ALLOW_PATTERNS: Array<RegExp> = [
  /^\/$/,
  /^\/v2(\/|$)/,
  /^\/templates(\/|$)/,
];

export default function FloatingAuditCTA() {
  const pathname = usePathname() || "/";
  const allowed = ALLOW_PATTERNS.some((rx) => rx.test(pathname));
  if (!allowed) return null;

  return (
    <Link
      href="/audit"
      aria-label="Get a free audit of your current site"
      className="fixed top-4 right-4 z-50 group inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-slate-950/85 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:border-emerald-400 hover:shadow-[0_0_28px_rgba(16,185,129,0.4)] transition-all"
    >
      <span aria-hidden="true" className="text-base">🔍</span>
      <span className="hidden sm:inline">Free audit of your site</span>
      <span className="sm:hidden">Free audit</span>
      <span className="text-emerald-300 group-hover:translate-x-0.5 transition-transform">→</span>
    </Link>
  );
}
