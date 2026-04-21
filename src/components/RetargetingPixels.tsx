"use client";

/**
 * RetargetingPixels — Meta Pixel + Google Ads tag for prospect retargeting.
 *
 * WHY: Every prospect who opens their preview/claim page enters a 30-day
 * retargeting window. Running $50-100/mo in FB + Google display ads against
 * those audiences gives ambient repeat exposure that warms every subsequent
 * email and postcard touch. Prospects stop seeing BlueJays as a cold pitch
 * and start seeing us as "oh yeah, I've been hearing about these guys."
 *
 * Env vars (set on Vercel):
 *   NEXT_PUBLIC_META_PIXEL_ID     — e.g. "1234567890123456"
 *   NEXT_PUBLIC_GOOGLE_ADS_ID     — e.g. "AW-11223344556" (must include the
 *                                   AW- prefix; it's a Google Ads account ID
 *                                   not a GA4 measurement ID)
 *
 * When neither is set → renders nothing (safe no-op during dev / pre-launch).
 * When `?embed=1` is in the URL → renders nothing (postcard captures + the
 * claim-page before/after iframe shouldn't count as real visitor impressions).
 *
 * ZERO PII flows through these pixels — just the standard `PageView` event.
 * Conversion events (`ViewContent` with category, `InitiateCheckout` on the
 * claim page, `Purchase` on checkout success) can be added later without
 * changing this mount point; use `window.fbq` / `window.gtag` directly from
 * wherever the action fires.
 *
 * Privacy-policy impact:
 *   - Mentions Meta Pixel + Google Ads retargeting
 *   - Discloses "Cookies and similar tracking technologies may be used"
 *   - See src/app/privacy/page.tsx for the exact wording
 */

import Script from "next/script";
import { useEffect, useState } from "react";

// Read env vars at module load time. NEXT_PUBLIC_* are inlined at build
// so these values are safe in client code.
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export default function RetargetingPixels() {
  // Embed-mode check happens on the client since we read window.location.
  // Start assumed-not-embedded; useEffect corrects if needed before any
  // script mounts (Script uses `afterInteractive` so we have time).
  const [isEmbedded, setIsEmbedded] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const embedded =
      new URLSearchParams(window.location.search).get("embed") === "1";
    setIsEmbedded(embedded);
  }, []);

  // No-op if no pixel configured OR if we're inside an embed/iframe/screenshot.
  if (isEmbedded) return null;
  if (!META_PIXEL_ID && !GOOGLE_ADS_ID) return null;

  return (
    <>
      {META_PIXEL_ID && (
        <>
          {/* Meta Pixel base code. Fires PageView on mount; additional events
              (ViewContent, InitiateCheckout, Purchase) can be fired later
              via window.fbq("track", "EventName", {...}). */}
          <Script
            id="meta-pixel-base"
            strategy="afterInteractive"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
              `.trim(),
            }}
          />
          {/* No-script fallback for users with JS disabled — gives Meta the
              PageView impression via a 1x1 tracking pixel. */}
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}

      {GOOGLE_ADS_ID && (
        <>
          {/* Google Ads retargeting tag (gtag.js). AW- prefix required.
              Additional conversion events fire via window.gtag("event", ...). */}
          <Script
            id="google-ads-gtag-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          />
          <Script
            id="google-ads-gtag-init"
            strategy="afterInteractive"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');
              `.trim(),
            }}
          />
        </>
      )}
    </>
  );
}

/**
 * Type-safe helper to fire a Meta Pixel conversion event from anywhere
 * in the codebase. Silently no-ops if the pixel isn't installed.
 *
 * Example — fire on checkout-session-created:
 *   trackMetaEvent("InitiateCheckout", { value: 997, currency: "USD" });
 */
export function trackMetaEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq !== "function") return;
  try {
    if (params) {
      fbq("track", eventName, params);
    } else {
      fbq("track", eventName);
    }
  } catch {
    // Never let analytics throw into user code
  }
}

/**
 * Fire a Google Ads conversion event. Pair with a specific conversion label
 * from Google Ads dashboard:
 *   trackGoogleAdsConversion("AW-XXXX/abcDEF123", 997);
 */
export function trackGoogleAdsConversion(
  sendTo: string,
  value?: number,
  currency: string = "USD"
): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== "function") return;
  try {
    gtag("event", "conversion", {
      send_to: sendTo,
      value,
      currency,
    });
  } catch {
    // Never let analytics throw into user code
  }
}
