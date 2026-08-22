import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import FloatingAuditCTA from "@/components/FloatingAuditCTA";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import RetargetingPixels from "@/components/RetargetingPixels";
import AttributionCapture from "@/components/AttributionCapture";
import ClarityScript from "@/components/ClarityScript";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://bluejayportfolio.com";
const OG_IMAGE = `${BASE_URL}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "BlueJays | Premium Web Design for Local Businesses",
    template: "%s | BlueJays",
  },
  description:
    "We build stunning, high-converting websites for local businesses. See your new site before you pay. No obligation, no credit card required.",
  keywords: ["web design", "local business website", "small business website", "website builder"],
  openGraph: {
    type: "website",
    siteName: "BlueJays",
    title: "BlueJays | Premium Web Design for Local Businesses",
    description:
      "We build stunning, high-converting websites for local businesses. See your new site before you pay.",
    url: BASE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "BlueJays — Premium Web Design for Local Businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BlueJays | Premium Web Design for Local Businesses",
    description:
      "We build stunning, high-converting websites for local businesses. See your new site before you pay.",
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

// Google Fonts URL for all category typography pairings (see CLAUDE.md Typography Pairing Guide)
const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=DM+Serif+Display:wght@400;700",
    "family=DM+Sans:wght@300;400;500;600;700",
    "family=Nunito:wght@300;400;500;600;700;800",
    "family=Lato:wght@300;400;700;900",
    "family=Merriweather:wght@300;400;700;900",
    "family=Open+Sans:wght@300;400;500;600;700",
    "family=EB+Garamond:wght@400;500;600;700;800",
    "family=Source+Sans+3:wght@300;400;600;700",
    "family=Crimson+Pro:wght@400;500;600;700",
    "family=Inter:wght@300;400;500;600;700",
    "family=Libre+Baskerville:wght@400;700",
    "family=Cormorant+Garamond:wght@400;500;600;700",
    "family=Jost:wght@300;400;500;600;700",
    "family=Raleway:wght@300;400;500;600;700",
    "family=Montserrat:wght@300;400;500;600;700;800",
    "family=Playfair+Display:wght@400;600;700;800",
    "family=Bebas+Neue",
    "family=Oswald:wght@400;500;600;700",
    "family=Nunito+Sans:wght@300;400;600;700",
    "family=Archivo+Black",
    "family=Archivo:wght@400;500;600;700",
    "family=Space+Grotesk:wght@400;500;600;700",
    "family=Barlow+Condensed:wght@400;500;600;700;800",
    "family=Barlow:wght@300;400;500;600;700",
    "family=Poppins:wght@300;400;500;600;700",
  ].join("&") +
  "&display=swap";

/*
 * The BlueJays ProfessionalService JSON-LD that used to live here was
 * REMOVED 2026-08-17. Do not put a BlueJays business entity back in the
 * root layout.
 *
 * The root layout wraps EVERY route, including the client showcases we
 * serve on the clients' own domains via CLIENT_DOMAIN_MAP
 * (sequimelectrician.com, tekky.org, hectorlandscaping.com, …). So a
 * crawler on Kyle's electrician site was reading, on his domain:
 *
 *   "@type": "ProfessionalService", "name": "BlueJays",
 *   "priceRange": "$997",
 *   "offers": { "name": "Custom Website Design", "price": "997" }
 *
 * — a different company, with a price offer, on the client's own site.
 * Alongside their real LocalBusiness block, that muddies who the site
 * actually belongs to. Found while fixing the Meyer canonical bug where
 * bluejayportfolio.com was outranking the client for his own name.
 *
 * It was also redundant here: the homepage already renders the
 * canonical BlueJays entity via organizationLd() (src/lib/json-ld.ts),
 * so bluejayportfolio.com was declaring the same business twice with
 * two @types, two descriptions, and two different logos.
 *
 * Site-level Organization schema belongs on the homepage, declared
 * once — which is exactly where it now lives. Every other BlueJays
 * surface that needs structured data (/audit, /case-studies, /guides,
 * /tools) already ships its own page-appropriate block, and each
 * client layout ships its own LocalBusiness.
 *
 * NOTE: the old block also carried a $997 Offer that organizationLd()
 * does not. If that offer is wanted back, add `makesOffer` to
 * organizationLd() so it renders on the homepage ONLY — never here.
 * (Worth pricing-checking first: the homepage now leads with the
 * $10k AI System, so a bare $997 offer may be stale positioning.)
 *
 * Gating this by hostname instead was considered and rejected —
 * reading headers() in the root layout opts the ENTIRE site out of
 * static rendering, which is a real Vercel cost hit per the cost
 * discipline rules, for a tag that simply does not belong here.
 */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={GOOGLE_FONTS_URL} />
        {/* No JSON-LD here on purpose — see the note above the fonts
            block. Site-level schema lives on the homepage; per-page and
            per-client schema lives in those routes' own layouts. */}
      </head>
      <body>
        {/* Mounts gtag + Meta Pixel on every route so conversions fire from
            any page (audit form, claim flow, get-started, etc.) — not just
            the homepage. Self-gates on env vars + ?embed=1. */}
        <RetargetingPixels />
        {/* Microsoft Clarity — free heatmaps + session replays. Same
            ?embed=1 gate as RetargetingPixels so iframe captures don't
            pollute heatmap data. Loads via afterInteractive (no LCP impact). */}
        <ClarityScript />
        {/* Captures utm_*, gclid, fbclid, msclkid, ttclid + referrer to
            localStorage on every route so lead forms can read attribution
            even after internal navigation. First-touch wins, 30-day TTL.
            Suspense wrapper required because useSearchParams is async. */}
        <Suspense fallback={null}>
          <AttributionCapture />
        </Suspense>
        {/* Floating audit-CTA pill — appears top-right on homepage + V2
            showcases + /templates. Self-gates via usePathname(). Lead-
            magnet entry point for warm-but-not-ready portfolio visitors. */}
        <ScrollProgressBar />
        <FloatingAuditCTA />
        {children}
        {/* Vercel Web Analytics — page views + web vitals. No-op outside Vercel. */}
        <Analytics />
      </body>
    </html>
  );
}
