"use client";

/**
 * ClarityScript — Microsoft Clarity (free heatmaps + session recordings).
 *
 * WHY: Heatmaps + scroll depth + session replays are the fastest way
 * to see WHY conversion math is what it is. Audit-form CPA at $124
 * means nothing without knowing where on the page people drop off,
 * which CTAs they hover but don't click, where they get confused.
 * Clarity is free, GDPR-friendly, and doesn't slow page loads
 * (loads via afterInteractive after first paint).
 *
 * Project ID: wkot1apu92 (set in Microsoft Clarity dashboard for
 * https://bluejayportfolio.com). Public ID — safe to hardcode, but
 * we read NEXT_PUBLIC_CLARITY_PROJECT_ID first if Ben ever wants to
 * point dev/staging at a separate Clarity project.
 *
 * When `?embed=1` is in the URL → renders nothing. Same gate as the
 * retargeting pixels — postcard captures + claim-page before/after
 * iframes shouldn't pollute heatmap data with non-human visits.
 *
 * Privacy:
 *   Clarity masks all sensitive content by default (per their
 *   onboarding screen). PII in form fields is auto-redacted before
 *   it leaves the browser. No additional masking config required.
 *
 * Note: Clarity sessions can take up to 2 hours to start showing in
 * the dashboard after install — don't panic if it's empty after
 * deploy.
 */

import Script from "next/script";
import { useEffect, useState } from "react";

const CLARITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "wkot1apu92";

export default function ClarityScript() {
  const [isEmbedded, setIsEmbedded] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const embedded =
      new URLSearchParams(window.location.search).get("embed") === "1";
    setIsEmbedded(embedded);
  }, []);

  if (isEmbedded) return null;
  if (!CLARITY_PROJECT_ID) return null;

  return (
    <Script
      id="ms-clarity"
      strategy="afterInteractive"
      // Inline form of Clarity's snippet. Sets up the queueing
      // shim, injects the async tag-loader script. Identical to
      // copy-pasted Clarity install, just inline-rendered with the
      // project ID interpolated from env/fallback.
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
        `,
      }}
    />
  );
}
