import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "TEKKY® Coaching Guide — Technical Training Curriculum · Zenith Sports",
  description:
    "The TEKKY® coaching guide for youth soccer DOCs and coaches. European-style methodology, full drill library, and a 4-week starter session plan.",
  // Lead-magnet PDF — coaches who fill out the email-capture get the link.
  // Don't index until Philip approves public visibility.
  robots: { index: false, follow: false },
};

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
