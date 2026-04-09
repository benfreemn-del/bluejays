import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
