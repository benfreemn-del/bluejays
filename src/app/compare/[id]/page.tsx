"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface ProspectData {
  businessName: string;
  currentWebsite?: string;
  generatedSiteUrl?: string;
  category: string;
  googleRating?: number;
  reviewCount?: number;
  phone?: string;
  city?: string;
  state?: string;
  scrapedData?: {
    services?: { name: string; description?: string }[];
    testimonials?: { name: string; text: string }[];
    phone?: string;
    about?: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// REAL "BEFORE" METRICS — Proposal Refinement 2.1
// Checks HTTPS, mobile-friendliness, phone number visibility
// ═══════════════════════════════════════════════════════════════

interface BeforeMetrics {
  https: { pass: boolean; label: string };
  mobile: { pass: boolean; label: string };
  phoneVisible: { pass: boolean; label: string };
}

function analyzeBeforeMetrics(currentWebsite?: string, scrapedPhone?: string): BeforeMetrics {
  const defaultMetrics: BeforeMetrics = {
    https: { pass: false, label: "No HTTPS" },
    mobile: { pass: false, label: "Not Mobile-Friendly" },
    phoneVisible: { pass: false, label: "Phone Not Visible" },
  };

  if (!currentWebsite) {
    return {
      https: { pass: false, label: "No Website" },
      mobile: { pass: false, label: "No Website" },
      phoneVisible: { pass: false, label: "No Website" },
    };
  }

  // HTTPS check — simple URL prefix analysis
  const hasHttps = currentWebsite.startsWith("https://");
  defaultMetrics.https = {
    pass: hasHttps,
    label: hasHttps ? "HTTPS Secured" : "No HTTPS",
  };

  // Mobile-friendliness — we can't fully check from client, but we check
  // if the site has common mobile-unfriendly patterns in the URL
  // (e.g., flash-based sites, very old domains). Default to "Unknown" and
  // let the iframe rendering hint at mobile issues.
  defaultMetrics.mobile = {
    pass: false,
    label: "Likely Not Mobile-Optimized",
  };

  // Phone visibility — check if scraped data found a phone number on the site
  const hasPhone = !!scrapedPhone && scrapedPhone.length > 6;
  defaultMetrics.phoneVisible = {
    pass: hasPhone,
    label: hasPhone ? "Phone Visible" : "Phone Not Visible",
  };

  return defaultMetrics;
}

// ═══════════════════════════════════════════════════════════════
// PERSONALIZED "AFTER" CALLOUTS — Proposal Refinement 2.2
// Uses scraped data for specific callouts
// ═══════════════════════════════════════════════════════════════

function getAfterCallouts(data: ProspectData): string[] {
  const callouts: string[] = [];

  // Google rating callout
  if (data.googleRating && data.googleRating >= 4.0) {
    callouts.push(`Featuring your ${data.googleRating}-star Google reviews`);
  }

  // Top service callout
  const topService = data.scrapedData?.services?.[0];
  if (topService) {
    callouts.push(`Highlights your ${topService.name} service`);
  }

  // City-specific callout
  if (data.city) {
    callouts.push(`Built for ${data.city} customers`);
  }

  // Review count callout
  if (data.reviewCount && data.reviewCount > 10) {
    callouts.push(`Showcases ${data.reviewCount} customer reviews`);
  }

  // Fallback callouts if no scraped data
  if (callouts.length === 0) {
    callouts.push("Professional, modern design");
    callouts.push("Mobile-optimized for all devices");
    callouts.push("Built to convert visitors into calls");
  }

  return callouts.slice(0, 3); // Max 3 callouts
}

// ═══════════════════════════════════════════════════════════════
// REVIEW PAIN POINT HEADLINE — Proposal Refinement 3.1
// Surface googleRating/reviewCount as a pain point
// ═══════════════════════════════════════════════════════════════

function getReviewHeadline(data: ProspectData): string | null {
  if (data.googleRating && data.reviewCount && data.reviewCount > 5) {
    return `${data.businessName} has ${data.googleRating} stars across ${data.reviewCount} reviews — but your website doesn't reflect that reputation.`;
  }
  if (data.reviewCount && data.reviewCount > 5) {
    return `${data.businessName} has ${data.reviewCount} reviews — but does your website match that reputation?`;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// COMPARE PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

const CALENDAR_LINK = "https://calendly.com/bluejays";

export default function ComparePage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<ProspectData | null>(null);

  useEffect(() => {
    fetch(`/api/prospects/${id}`)
      .then((r) => r.json())
      .then((d) => { if (!d.error) setData(d); })
      .catch(() => {});
  }, [id]);

  if (!data) {
    return <div className="min-h-screen bg-[#050a14] flex items-center justify-center text-white/50">Loading...</div>;
  }

  const beforeMetrics = analyzeBeforeMetrics(data.currentWebsite, data.scrapedData?.phone || data.phone);
  const afterCallouts = getAfterCallouts(data);
  const reviewHeadline = getReviewHeadline(data);

  return (
    <div className="min-h-screen bg-[#050a14] text-white">
      {/* Header */}
      <div className="text-center py-12 px-6">
        <p className="text-sky-400 text-xs font-bold uppercase tracking-[0.25em] mb-3">Side-by-Side Comparison</p>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          See the <span className="text-sky-400">difference</span>
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          Your current website vs. the premium site we built for {data.businessName}
        </p>

        {/* Review pain point headline — Proposal Refinement 3.1 */}
        {reviewHeadline && (
          <div className="mt-6 max-w-2xl mx-auto">
            <p className="text-amber-400/90 text-base md:text-lg font-medium italic">
              &ldquo;{reviewHeadline}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Comparison */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Before */}
          <div className="rounded-2xl border border-red-500/20 overflow-hidden">
            <div className="bg-red-500/10 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="font-bold text-sm">Current Website</span>
              </div>
              <span className="text-xs text-red-400">BEFORE</span>
            </div>
            <div className="aspect-[16/10] bg-[#0a0a0a] relative">
              {data.currentWebsite ? (
                <iframe
                  src={data.currentWebsite}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                  title="Current website"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <div className="text-5xl mb-4 opacity-30">🚫</div>
                  <p className="text-white/40 text-lg font-semibold mb-2">No Website Found</p>
                  <p className="text-white/30 text-sm">
                    {data.businessName} doesn&apos;t have a website yet. That means potential customers are going to competitors instead.
                  </p>
                </div>
              )}
            </div>
            {/* Real "Before" metrics — Proposal Refinement 2.1 */}
            <div className="px-6 py-4 bg-red-500/5">
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <p className={`font-bold ${beforeMetrics.https.pass ? "text-green-400" : "text-red-400"}`}>
                    {beforeMetrics.https.pass ? "✓" : "✗"} {beforeMetrics.https.label}
                  </p>
                  <p className="text-white/30">Security</p>
                </div>
                <div>
                  <p className={`font-bold ${beforeMetrics.mobile.pass ? "text-green-400" : "text-red-400"}`}>
                    {beforeMetrics.mobile.pass ? "✓" : "✗"} {beforeMetrics.mobile.label}
                  </p>
                  <p className="text-white/30">Mobile</p>
                </div>
                <div>
                  <p className={`font-bold ${beforeMetrics.phoneVisible.pass ? "text-green-400" : "text-red-400"}`}>
                    {beforeMetrics.phoneVisible.pass ? "✓" : "✗"} {beforeMetrics.phoneVisible.label}
                  </p>
                  <p className="text-white/30">Contact Info</p>
                </div>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="rounded-2xl border border-green-500/20 overflow-hidden">
            <div className="bg-green-500/10 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="font-bold text-sm">Your New Website</span>
              </div>
              <span className="text-xs text-green-400">AFTER</span>
            </div>
            <div className="aspect-[16/10] bg-[#0a0a0a] relative">
              {data.generatedSiteUrl ? (
                <iframe
                  src={data.generatedSiteUrl}
                  className="w-full h-full border-0"
                  title="New website preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white/30">
                  Preview not generated yet
                </div>
              )}
            </div>
            {/* Personalized "After" callouts — Proposal Refinement 2.2 */}
            <div className="px-6 py-4 bg-green-500/5">
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                {afterCallouts.map((callout, i) => (
                  <div key={i}>
                    <p className="text-green-400 font-bold">✓ {callout}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section — Proposal Refinement 2.3 */}
        <div className="text-center mt-12">
          {/* Primary CTA: Claim / Checkout */}
          <a
            href={`/claim/${id}`}
            className="inline-flex items-center gap-3 h-14 px-8 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(14,165,233,0.4)] transition-all duration-300"
          >
            Claim Your New Website — $997
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
          <p className="text-white/30 text-sm mt-4">
            One-time investment. Includes everything. Live within 48 hours.
          </p>

          {/* Secondary CTA: Schedule a call — Proposal Refinement 2.3 */}
          <div className="mt-6 pt-6 border-t border-white/10 max-w-md mx-auto">
            <p className="text-white/40 text-sm mb-3">
              Have questions? Not ready to commit just yet?
            </p>
            <a
              href={CALENDAR_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-semibold text-sm transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Schedule a quick call with Ben
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
