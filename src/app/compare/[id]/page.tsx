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
  city?: string;
  state?: string;
  scrapedData?: {
    services?: { name: string; description?: string }[];
    testimonials?: { name: string; text: string }[];
    accentColor?: string;
    brandColor?: string;
  };
}

interface WebsiteMetric {
  label: string;
  category: string;
  currentSite: { value: string; pass: boolean; detail?: string };
  bluejaySite: { value: string; pass: boolean; detail?: string };
}

interface ComparisonData {
  metrics: WebsiteMetric[];
  overallScore: { current: number; bluejay: number };
  headline: string;
  subheadline: string;
  painPoints: string[];
  hasCurrentWebsite: boolean;
}

interface EngagementData {
  score: number;
  level: string;
  triggers: {
    showSocialProof: boolean;
    showUrgency: boolean;
    showCompetitorComparison: boolean;
    showCountdown: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════
// COMPARE PAGE — Side-by-side current site vs new BlueJays site
//
// Loads via the PUBLIC `/api/claim/[id]` endpoint so unauthenticated
// prospects arriving from the preview/claim CTAs can view this page.
// (`/api/prospects/[id]` is auth-gated and used to 401 in incognito,
// leaving the page stuck on "Loading..." indefinitely — see CLAUDE.md
// rule "Public-Facing Surface Rules".)
//
// Renders BOTH sites as thum.io screenshots instead of iframes. Almost
// every real prospect site sets X-Frame-Options: DENY or a frame-
// ancestors CSP, which made the old iframe blank for ~95% of prospects.
// thum.io is HEAD-request-cached on first visit and caches at the
// service for ~1 hour, so subsequent loads are ~instant.
// ═══════════════════════════════════════════════════════════════

function getScreenshotUrl(url: string): string {
  // thum.io free-tier full-page PNG; no auth key required.
  // /noanimate avoids the loading-spinner flash if the site has heavy
  // animations on first paint.
  return `https://image.thum.io/get/width/1400/fullpage/noanimate/png/${encodeURIComponent(url)}`;
}

export default function ComparePage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<ProspectData | null>(null);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [expandedMetric, setExpandedMetric] = useState<number | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Use the PUBLIC claim endpoint — works for unauthenticated visitors
    // landing here from outreach links. Returns the same claim-safe
    // whitelist used by the claim page itself.
    fetch(`/api/claim/${id}`)
      .then((r) => {
        if (!r.ok) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        if (d.error) {
          setNotFound(true);
          return;
        }
        setData(d as ProspectData);
      })
      .catch(() => setNotFound(true));

    // Engagement triggers (public, sanitized — score + flags only).
    fetch(`/api/engagement/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setEngagement(d);
      })
      .catch(() => {});

    // Per-prospect comparison analysis (public — derived from public
    // signals like Google Lighthouse and basic site introspection).
    fetch(`/api/compare/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setComparison(d);
      })
      .catch(() => {});
  }, [id]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#050a14] text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-3">Comparison Not Available</h1>
          <p className="text-white/50 mb-6">
            This comparison link is no longer available. If you think this is an error, please contact us.
          </p>
          <a
            href="https://bluejayportfolio.com"
            className="inline-block h-10 px-6 leading-10 rounded-full bg-sky-500 text-white text-sm font-medium hover:bg-sky-400 transition-colors"
          >
            Visit BlueJays Portfolio
          </a>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#050a14] flex items-center justify-center text-white/50">
        Loading comparison...
      </div>
    );
  }

  const accentColor =
    data.scrapedData?.accentColor || data.scrapedData?.brandColor || "#0ea5e9";
  const metrics = comparison?.metrics || [];
  const overallScore = comparison?.overallScore || { current: 25, bluejay: 95 };
  const painPoints = comparison?.painPoints || [];
  const headline = comparison?.headline || `See the difference for ${data.businessName}`;
  const subheadline = comparison?.subheadline || "Your current website vs. the premium site we built";

  const reviewHeadline = data.googleRating && data.reviewCount && data.reviewCount > 5
    ? `${data.businessName} has ${data.googleRating} stars across ${data.reviewCount} reviews — but your website doesn't reflect that reputation.`
    : null;

  const previewScreenshotUrl = `https://bluejayportfolio.com/preview/${id}?embed=1`;
  const newSiteScreenshot = getScreenshotUrl(previewScreenshotUrl);
  const currentSiteScreenshot = data.currentWebsite ? getScreenshotUrl(data.currentWebsite) : null;

  return (
    <div className="min-h-screen bg-[#050a14] text-white">
      {/* Header */}
      <div className="text-center py-12 px-6">
        <p
          className="text-xs font-bold uppercase tracking-[0.25em] mb-3"
          style={{ color: accentColor }}
        >
          Side-by-Side Comparison
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          See the <span style={{ color: accentColor }}>difference</span>
        </h1>
        <p className="text-white/50 text-base md:text-lg max-w-xl mx-auto">{subheadline || headline}</p>

        {reviewHeadline && (
          <div className="mt-6 max-w-2xl mx-auto">
            <p className="text-amber-400/90 text-base md:text-lg font-medium italic px-4">
              &ldquo;{reviewHeadline}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Overall Score Cards */}
      <div className="max-w-4xl mx-auto px-6 mb-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 sm:p-6 text-center">
            <p className="text-[10px] sm:text-xs text-red-400 uppercase tracking-wider mb-2 font-bold">Current Site</p>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(239,68,68,0.1)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none" stroke="#ef4444" strokeWidth="8"
                  strokeDasharray={`${overallScore.current * 2.64} 264`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-bold text-red-400">
                {overallScore.current}
              </span>
            </div>
            <p className="text-white/40 text-xs sm:text-sm">out of 100</p>
          </div>
          <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4 sm:p-6 text-center">
            <p className="text-[10px] sm:text-xs text-green-400 uppercase tracking-wider mb-2 font-bold">BlueJays Site</p>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none" stroke="#22c55e" strokeWidth="8"
                  strokeDasharray={`${overallScore.bluejay * 2.64} 264`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-bold text-green-400">
                {overallScore.bluejay}
              </span>
            </div>
            <p className="text-white/40 text-xs sm:text-sm">out of 100</p>
          </div>
        </div>
      </div>

      {/* Visual Comparison — Before / After thum.io screenshots.
          Side-by-side on desktop (md+), stacked on mobile. */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Before */}
          <div className="rounded-2xl border border-red-500/20 overflow-hidden">
            <div className="bg-red-500/10 px-4 sm:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
                <span className="font-bold text-sm truncate">Current Website</span>
              </div>
              <span className="text-xs text-red-400 shrink-0 ml-2">BEFORE</span>
            </div>
            <div className="aspect-[4/5] sm:aspect-[16/10] bg-[#0a0a0a] relative overflow-hidden">
              {currentSiteScreenshot ? (
                <a
                  href={data.currentWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                  aria-label="Open current website"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentSiteScreenshot}
                    alt={`Screenshot of ${data.businessName}'s current website`}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                </a>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <div className="text-5xl mb-4 opacity-30">🚫</div>
                  <p className="text-white/40 text-lg font-semibold mb-2">No Website Found</p>
                  <p className="text-white/30 text-sm">
                    {data.businessName} doesn&apos;t have a website yet. Potential customers are going to competitors instead.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* After */}
          <div className="rounded-2xl border border-green-500/20 overflow-hidden">
            <div className="bg-green-500/10 px-4 sm:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
                <span className="font-bold text-sm truncate">Your New Website</span>
              </div>
              <span className="text-xs text-green-400 shrink-0 ml-2">AFTER</span>
            </div>
            <div className="aspect-[4/5] sm:aspect-[16/10] bg-[#0a0a0a] relative overflow-hidden">
              <a
                href={`/preview/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full"
                aria-label="Open new website preview"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={newSiteScreenshot}
                  alt={`Screenshot of the new website BlueJays built for ${data.businessName}`}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-white/30 mt-4">
          Tap either screenshot to open the full site
        </p>
      </div>

      {/* Detailed Metrics Comparison Table */}
      {metrics.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 pb-12">
          <h2 className="text-xl font-bold mb-6 text-center">
            Detailed Comparison — {metrics.length} Key Factors
          </h2>
          <div className="space-y-2">
            {metrics.map((metric, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:bg-white/[0.07] transition-colors"
                onClick={() => setExpandedMetric(expandedMetric === i ? null : i)}
              >
                <div className="px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="text-sm font-medium text-white/80 flex-1">{metric.label}</span>
                  <div className="flex items-center gap-3 sm:gap-6 text-sm">
                    <span className={`flex items-center gap-1.5 ${metric.currentSite.pass ? "text-green-400" : "text-red-400"}`}>
                      {metric.currentSite.pass ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                      <span className="truncate max-w-[110px] sm:max-w-none">{metric.currentSite.value}</span>
                    </span>
                    <span className="text-white/20">vs</span>
                    <span className={`flex items-center gap-1.5 ${metric.bluejaySite.pass ? "text-green-400" : "text-red-400"}`}>
                      {metric.bluejaySite.pass ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                      <span className="truncate max-w-[110px] sm:max-w-none">{metric.bluejaySite.value}</span>
                    </span>
                    <svg
                      className={`w-4 h-4 text-white/30 transition-transform shrink-0 ${expandedMetric === i ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {expandedMetric === i && (
                  <div className="px-4 sm:px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs border-t border-white/5 pt-3">
                    <div>
                      <p className="text-white/30 uppercase tracking-wider mb-1 font-medium">Current Site</p>
                      <p className="text-white/60">{metric.currentSite.detail}</p>
                    </div>
                    <div>
                      <p className="text-white/30 uppercase tracking-wider mb-1 font-medium">BlueJays Site</p>
                      <p className="text-white/60">{metric.bluejaySite.detail}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pain Points — Only shown for engaged prospects */}
      {painPoints.length > 0 && engagement && engagement.score >= 25 && (
        <div className="max-w-3xl mx-auto px-6 pb-12">
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>What This Means for {data.businessName}</span>
            </h3>
            <div className="space-y-3">
              {painPoints.map((point, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                  <p className="text-white/60">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="text-center mt-4">
          <a
            href={`/claim/${id}`}
            className="inline-flex items-center gap-3 h-14 px-6 sm:px-8 rounded-full text-white font-bold text-base sm:text-lg transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
              boxShadow: `0 0 0 rgba(0,0,0,0)`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 0 40px ${accentColor}66`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 0 0 rgba(0,0,0,0)`;
            }}
          >
            Claim — $997 · 100% money-back
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
          <p className="text-white/30 text-xs sm:text-sm mt-4 max-w-xl mx-auto px-2">
            $997 one-time includes custom website design, domain registration, and hosting setup. After year one, $100/year covers domain renewal, hosting, and ongoing support.
          </p>

          <div className="mt-6 pt-6 border-t border-white/10 max-w-md mx-auto">
            <p className="text-white/40 text-sm mb-3">
              Have questions? Not ready to commit just yet?
            </p>
            {/* /book/[id] is the in-app scheduling page (matches the rest
                of the funnel — claim page, voicemail follow-ups, etc).
                Replaces the hardcoded calendly.com/bluejays link that
                shipped here previously and bypassed our owned booking
                surface. */}
            <a
              href={`/book/${id}`}
              className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-semibold text-sm transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Book free walkthrough — no card required
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
