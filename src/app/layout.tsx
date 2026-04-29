import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FloatingAuditCTA from "@/components/FloatingAuditCTA";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import RetargetingPixels from "@/components/RetargetingPixels";

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

const SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "BlueJays",
  "url": BASE_URL,
  "logo": OG_IMAGE,
  "description": "Custom website design for local businesses. $997 one-time includes domain registration and hosting setup.",
  "areaServed": "United States",
  "priceRange": "$997",
  "offers": {
    "@type": "Offer",
    "name": "Custom Website Design",
    "price": "997",
    "priceCurrency": "USD",
    "description": "Custom website design, domain registration, and hosting setup. See your site before you pay.",
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "bluejaycontactme@gmail.com",
    "contactType": "customer service",
  },
});

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: SCHEMA }}
        />
      </head>
      <body>
        {/* Mounts gtag + Meta Pixel on every route so conversions fire from
            any page (audit form, claim flow, get-started, etc.) — not just
            the homepage. Self-gates on env vars + ?embed=1. */}
        <RetargetingPixels />
        {/* Floating audit-CTA pill — appears top-right on homepage + V2
            showcases + /templates. Self-gates via usePathname(). Lead-
            magnet entry point for warm-but-not-ready portfolio visitors. */}
        <ScrollProgressBar />
        <FloatingAuditCTA />
        {children}
      </body>
    </html>
  );
}
