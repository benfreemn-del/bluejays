import Script from "next/script";
import { getTrackingConfig } from "@/lib/client-tracking";

/**
 * <ClientTrackingScripts slug="zenith-sports" /> — drops in the
 * client's analytics stack (Clarity, Meta Pixel, GA4, Google Ads) based
 * on which env vars are set for that slug. Each script is independent,
 * so a client can have just Clarity wired and the rest stays silent.
 *
 * Loads with strategy="afterInteractive" so the page is usable before
 * the trackers fire. Microsoft Clarity in particular is async — does
 * not block first paint.
 *
 * Usage: drop one of these inside the per-client layout.tsx (above
 * children) and that's it.
 */
export function ClientTrackingScripts({ slug }: { slug: string }) {
  const cfg = getTrackingConfig(slug);
  return (
    <>
      {/* Microsoft Clarity — free heatmaps + session recordings.
          Identifier is the project id from clarity.microsoft.com. */}
      {cfg.clarityId && (
        <Script id={`clarity-${slug}`} strategy="afterInteractive">{`
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${cfg.clarityId}");
        `}</Script>
      )}

      {/* Meta Pixel — ad attribution + retargeting. */}
      {cfg.metaPixelId && (
        <>
          <Script id={`fbpx-${slug}`} strategy="afterInteractive">{`
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${cfg.metaPixelId}');
fbq('track', 'PageView');
          `}</Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${cfg.metaPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}

      {/* GA4 — page views + conversions. */}
      {cfg.gaMeasurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${cfg.gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id={`ga4-${slug}`} strategy="afterInteractive">{`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${cfg.gaMeasurementId}');
${cfg.googleAdsId ? `gtag('config', '${cfg.googleAdsId}');` : ""}
          `}</Script>
        </>
      )}
    </>
  );
}
