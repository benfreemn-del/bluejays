"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureFromUrl } from "@/lib/attribution";

/**
 * Mounts in layout.tsx so attribution capture runs on every page —
 * including soft route changes inside the Next App Router. Without
 * the pathname/searchParams effect, captureFromUrl() would only fire
 * on hard page loads, missing client-side navigations from a tagged
 * landing page to a deep page (e.g. /audit?utm_source=google → click
 * "How it works" → form on /audit fires too late).
 *
 * No DOM output. Self-gates: silent no-op on the server.
 */
export default function AttributionCapture() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureFromUrl();
    // pathname + searchParams in deps so it re-runs on every soft nav
    // that changes either. Stringifying searchParams to avoid the
    // ReadonlyURLSearchParams identity-changes-every-render trap.
  }, [pathname, searchParams]);

  return null;
}
