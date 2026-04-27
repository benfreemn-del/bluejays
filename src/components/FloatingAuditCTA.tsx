"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const ALLOW_PATTERNS: Array<RegExp> = [
  /^\/$/,
  /^\/v2(\/|$)/,
  /^\/templates(\/|$)/,
];

// How far the user must scroll before the pill appears (clears nav bar)
const SCROLL_THRESHOLD = 120;

export default function FloatingAuditCTA() {
  const pathname = usePathname() || "/";
  const allowed = ALLOW_PATTERNS.some((rx) => rx.test(pathname));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!allowed) return;
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [allowed]);

  if (!allowed) return null;

  return (
    <Link
      href="/audit"
      aria-label="Get a free audit of your current site"
      className={`fixed top-4 right-4 z-50 group inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-slate-950/85 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:border-emerald-400 hover:shadow-[0_0_28px_rgba(16,185,129,0.4)] transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      <span aria-hidden="true" className="text-base">🔍</span>
      <span className="hidden sm:inline">Free audit of your site</span>
      <span className="sm:hidden">Free audit</span>
      <span className="text-emerald-300 group-hover:translate-x-0.5 transition-transform">→</span>
    </Link>
  );
}
