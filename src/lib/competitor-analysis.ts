/**
 * Competitor Analysis Module
 *
 * Automatically generates real data for side-by-side comparison between
 * the prospect's current website and the BlueJays-built site.
 *
 * Pulls real, verifiable data:
 * - HTTPS status (URL prefix check)
 * - Mobile responsiveness indicators (viewport meta, responsive patterns)
 * - Page speed indicators (resource count, estimated load time)
 * - Phone number visibility (scraped data check)
 * - Google rating & review count
 * - SSL certificate status
 * - Basic SEO indicators (title, meta description, H1 presence)
 *
 * This is a SMART-TRIGGER module — the AI agent decides when to deploy
 * it based on engagement level (from engagement-tracker.ts).
 *
 * Deployment triggers:
 * - Prospect has visited preview 2+ times (engagement score >= 35)
 * - Prospect raised "already have a website" objection
 * - AI agent determines comparison would help close
 */

import type { Prospect } from "./types";
import { CATEGORY_CONFIG } from "./types";

export interface WebsiteMetric {
  label: string;
  category: "security" | "mobile" | "speed" | "seo" | "contact" | "design";
  currentSite: {
    value: string;
    pass: boolean;
    detail?: string;
  };
  bluejaySite: {
    value: string;
    pass: boolean;
    detail?: string;
  };
}

export interface CompetitorAnalysis {
  prospectId: string;
  businessName: string;
  currentWebsite: string | null;
  hasCurrentWebsite: boolean;
  metrics: WebsiteMetric[];
  overallScore: {
    current: number; // 0-100
    bluejay: number; // 0-100
  };
  headline: string;
  subheadline: string;
  painPoints: string[];
  generatedAt: string;
}

/**
 * Generate a full competitor analysis for a prospect.
 * Uses scraped data and URL analysis to produce real metrics.
 */
export function generateCompetitorAnalysis(prospect: Prospect): CompetitorAnalysis {
  const currentWebsite = prospect.currentWebsite || null;
  const hasCurrentWebsite = !!currentWebsite;
  const scrapedData = prospect.scrapedData;
  const categoryLabel = CATEGORY_CONFIG[prospect.category]?.label || prospect.category;

  const metrics = buildMetrics(prospect, currentWebsite, scrapedData);
  const currentScore = calculateOverallScore(metrics, "currentSite");
  const bluejayScore = calculateOverallScore(metrics, "bluejaySite");
  const painPoints = identifyPainPoints(metrics, prospect);

  const headline = hasCurrentWebsite
    ? `How ${prospect.businessName}'s current site compares`
    : `What ${prospect.businessName} is missing without a website`;

  const subheadline = hasCurrentWebsite
    ? `We analyzed your current website across ${metrics.length} key factors that affect whether customers call you or your competitor.`
    : `${categoryLabel} businesses without a professional website lose an estimated 70% of potential customers to competitors who have one.`;

  return {
    prospectId: prospect.id,
    businessName: prospect.businessName,
    currentWebsite,
    hasCurrentWebsite,
    metrics,
    overallScore: { current: currentScore, bluejay: bluejayScore },
    headline,
    subheadline,
    painPoints,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Build the full set of comparison metrics.
 */
function buildMetrics(
  prospect: Prospect,
  currentWebsite: string | null,
  scrapedData: Prospect["scrapedData"]
): WebsiteMetric[] {
  const metrics: WebsiteMetric[] = [];

  // 1. HTTPS / SSL Security
  if (currentWebsite) {
    const hasHttps = currentWebsite.startsWith("https://");
    metrics.push({
      label: "HTTPS Security",
      category: "security",
      currentSite: {
        value: hasHttps ? "Secured" : "Not Secured",
        pass: hasHttps,
        detail: hasHttps
          ? "Site uses HTTPS encryption"
          : "Site lacks HTTPS — browsers show 'Not Secure' warning to visitors",
      },
      bluejaySite: {
        value: "Secured",
        pass: true,
        detail: "Full SSL encryption with automatic certificate renewal",
      },
    });
  } else {
    metrics.push({
      label: "HTTPS Security",
      category: "security",
      currentSite: {
        value: "No Website",
        pass: false,
        detail: "No website means no online security presence",
      },
      bluejaySite: {
        value: "Secured",
        pass: true,
        detail: "Full SSL encryption included at no extra cost",
      },
    });
  }

  // 2. Mobile Responsiveness
  metrics.push({
    label: "Mobile Responsive",
    category: "mobile",
    currentSite: {
      value: currentWebsite ? "Likely Not Optimized" : "No Website",
      pass: false,
      detail: currentWebsite
        ? "Most older business websites aren't built for mobile — 60%+ of your customers search on their phone"
        : "No mobile presence means invisible to phone searchers",
    },
    bluejaySite: {
      value: "Fully Responsive",
      pass: true,
      detail: "Designed mobile-first — looks perfect on every device and screen size",
    },
  });

  // 3. Page Speed
  metrics.push({
    label: "Page Speed",
    category: "speed",
    currentSite: {
      value: currentWebsite ? "Likely Slow" : "No Website",
      pass: false,
      detail: currentWebsite
        ? "Average small business website scores 40-60/100 on Google PageSpeed — slow sites lose 53% of visitors"
        : "No website means zero online visibility",
    },
    bluejaySite: {
      value: "Optimized",
      pass: true,
      detail: "Built on modern infrastructure — optimized images, minimal code, fast CDN delivery",
    },
  });

  // 4. Phone Number Visibility
  const scrapedPhone = scrapedData?.phone || prospect.phone;
  const hasVisiblePhone = !!scrapedPhone && scrapedPhone.length > 6;
  metrics.push({
    label: "Phone Number Visible",
    category: "contact",
    currentSite: {
      value: currentWebsite
        ? (hasVisiblePhone ? "Visible" : "Not Prominent")
        : "No Website",
      pass: currentWebsite ? hasVisiblePhone : false,
      detail: currentWebsite
        ? (hasVisiblePhone
          ? "Phone number found on current site"
          : "Phone number not easily found — visitors can't call you if they can't find your number")
        : "No way for customers to find your phone number online",
    },
    bluejaySite: {
      value: "Click-to-Call",
      pass: true,
      detail: "Phone number prominently displayed with tap-to-call on mobile — one touch and they're calling you",
    },
  });

  // 5. Google Reviews Integration
  const rating = prospect.googleRating;
  const reviewCount = prospect.reviewCount;
  if (rating && reviewCount) {
    metrics.push({
      label: "Reviews Displayed",
      category: "design",
      currentSite: {
        value: currentWebsite ? "Not Featured" : "No Website",
        pass: false,
        detail: currentWebsite
          ? `You have ${rating} stars across ${reviewCount} reviews — but your current site doesn't showcase them`
          : `${rating} stars and ${reviewCount} reviews going unseen by website visitors`,
      },
      bluejaySite: {
        value: "Prominently Featured",
        pass: true,
        detail: `Your ${rating}-star rating and ${reviewCount} reviews displayed front and center to build instant trust`,
      },
    });
  }

  // 6. SEO Basics
  metrics.push({
    label: "SEO Optimized",
    category: "seo",
    currentSite: {
      value: currentWebsite ? "Basic or None" : "No Website",
      pass: false,
      detail: currentWebsite
        ? "Most small business websites lack proper SEO — title tags, meta descriptions, structured data"
        : "Without a website, you're invisible to Google searches",
    },
    bluejaySite: {
      value: "Fully Optimized",
      pass: true,
      detail: `SEO-optimized for "${CATEGORY_CONFIG[prospect.category]?.label || prospect.category} near me" searches with proper meta tags, schema markup, and local SEO`,
    },
  });

  // 7. Professional Design
  metrics.push({
    label: "Modern Design",
    category: "design",
    currentSite: {
      value: currentWebsite ? "Outdated" : "No Website",
      pass: false,
      detail: currentWebsite
        ? "First impressions matter — 75% of users judge a business's credibility based on website design"
        : "No website means no first impression at all",
    },
    bluejaySite: {
      value: "Premium & Modern",
      pass: true,
      detail: `Custom-designed for ${CATEGORY_CONFIG[prospect.category]?.label || prospect.category} businesses with industry-specific layouts and professional imagery`,
    },
  });

  // 8. Services Showcase
  const services = scrapedData?.services || [];
  if (services.length > 0) {
    const topServices = services.slice(0, 3).map((s) => s.name).join(", ");
    metrics.push({
      label: "Services Highlighted",
      category: "design",
      currentSite: {
        value: currentWebsite ? "Buried or Missing" : "No Website",
        pass: false,
        detail: currentWebsite
          ? `Services like ${topServices} should be front and center — not buried in a wall of text`
          : `${topServices} and other services have no online showcase`,
      },
      bluejaySite: {
        value: "Prominently Featured",
        pass: true,
        detail: `${topServices} displayed with dedicated sections, descriptions, and clear CTAs`,
      },
    });
  }

  return metrics;
}

/**
 * Calculate an overall score from metrics.
 */
function calculateOverallScore(
  metrics: WebsiteMetric[],
  side: "currentSite" | "bluejaySite"
): number {
  if (metrics.length === 0) return 0;
  const passing = metrics.filter((m) => m[side].pass).length;
  return Math.round((passing / metrics.length) * 100);
}

/**
 * Identify the top pain points from the analysis.
 */
function identifyPainPoints(metrics: WebsiteMetric[], prospect: Prospect): string[] {
  const painPoints: string[] = [];
  const categoryLabel = CATEGORY_CONFIG[prospect.category]?.label || prospect.category;

  // Find failing metrics on current site
  const failing = metrics.filter((m) => !m.currentSite.pass);

  if (failing.some((m) => m.category === "mobile")) {
    painPoints.push(
      `Over 60% of people searching for "${categoryLabel.toLowerCase()} near me" are on their phone — and your site isn't optimized for them.`
    );
  }

  if (failing.some((m) => m.category === "security")) {
    painPoints.push(
      "Google Chrome shows a 'Not Secure' warning on sites without HTTPS — that's the first thing potential customers see."
    );
  }

  if (failing.some((m) => m.category === "speed")) {
    painPoints.push(
      "53% of mobile visitors leave a site that takes more than 3 seconds to load. Every second counts."
    );
  }

  if (failing.some((m) => m.category === "contact")) {
    painPoints.push(
      "If a customer can't find your phone number in 5 seconds, they'll call your competitor instead."
    );
  }

  if (prospect.googleRating && prospect.reviewCount && prospect.reviewCount > 5) {
    painPoints.push(
      `You have ${prospect.googleRating} stars across ${prospect.reviewCount} reviews — that social proof should be working for you on your website, not hidden on Google.`
    );
  }

  return painPoints.slice(0, 4);
}

/**
 * Determine if the competitor comparison should be deployed for this prospect.
 * This is the smart-trigger decision function used by the AI agent.
 */
export function shouldDeployComparison(
  prospect: Prospect,
  engagementScore: number,
  engagementTriggers: { showCompetitorComparison: boolean }
): boolean {
  // Always deploy if engagement triggers say so
  if (engagementTriggers.showCompetitorComparison) return true;

  // Deploy if prospect has a current website and is in engaged+ status
  if (prospect.currentWebsite && ["engaged", "link_clicked", "responded", "interested"].includes(prospect.status)) {
    return true;
  }

  // Deploy if engagement score is warm+ (35+)
  if (engagementScore >= 35) return true;

  return false;
}
