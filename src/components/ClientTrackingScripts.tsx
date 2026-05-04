/* eslint-disable @next/next/no-img-element */
import Script from "next/script";

/**
 * ClientTrackingScripts — drops the right Meta Pixel + GA4 + Google
 * Ads conversion tags for a specific AI-package client onto their
 * /clients/{slug}/* pages.
 *
 * Reads from per-client env vars:
 *   {SLUG_UPPER}_META_PIXEL_ID       — Meta Pixel ID (15-16 digits)
 *   {SLUG_UPPER}_GA_MEASUREMENT_ID   — GA4 Measurement ID (G-XXXXXXXXX)
 *   {SLUG_UPPER}_GOOGLE_ADS_CUSTOMER_ID — Google Ads (only used for
 *     conversion-tag setup; not loaded as a script directly)
 *
 * No env vars set = renders nothing. Safe to drop into every showcase
 * page without conditionals — the component self-gates.
 *
 * Includes an iframe noscript fallback for the Meta Pixel (per
 * Meta's recommended install).
 *
 * Why this exists at the client tracking level (not in the global
 * RetargetingPixels component): per-client tracking must be ISOLATED
 * to that client's pages. We don't want BlueJays' Meta Pixel firing on
 * Zenith's showcase or vice-versa — that pollutes both attribution
 * pictures.
 */

type Props = {
  slug: string;
};

function envFor(slug: string): {
  metaPixelId?: string;
  gaMeasurementId?: string;
} {
  const upper = slug.toUpperCase().replace(/-/g, "_");
  return {
    metaPixelId: process.env[`${upper}_META_PIXEL_ID`],
    gaMeasurementId: process.env[`${upper}_GA_MEASUREMENT_ID`],
  };
}

export default function ClientTrackingScripts({ slug }: Props) {
  const { metaPixelId, gaMeasurementId } = envFor(slug);

  if (!metaPixelId && !gaMeasurementId) return null;

  return (
    <>
      {metaPixelId && (
        <>
          <Script id={`meta-pixel-${slug}`} strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}

      {gaMeasurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id={`ga4-${slug}`} strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}', {
                send_page_view: true
              });
            `}
          </Script>
        </>
      )}
    </>
  );
}
