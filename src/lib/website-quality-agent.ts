import type { Category } from "./types";

export interface IndustryInsight {
  category: Category;
  mustHaveFeatures: string[];
  uniqueSections: string[];
  psychologyTips: string[];
  colorNotes: string;
  ctaStyle: string;
  commonMistakes: string[];
}

// Research-backed insights for what makes great websites in each industry
export const INDUSTRY_INSIGHTS: Partial<Record<Category, IndustryInsight>> = {
  "real-estate": {
    category: "real-estate",
    mustHaveFeatures: [
      "Property search/listings with filters (beds, baths, price range)",
      "Agent bio with professional photo and credentials",
      "Neighborhood guides with school ratings and amenities",
      "Mortgage calculator widget",
      "Virtual tour / video walkthrough links",
      "Recently sold section (social proof of success)",
      "Market stats dashboard (median price, days on market)",
    ],
    uniqueSections: [
      "Featured Listings Grid with hover details",
      "Neighborhood Spotlight with lifestyle photos",
      "Recently Sold ticker (creates urgency)",
      "Client Success Stories with before/after",
      "Free Home Valuation CTA",
    ],
    psychologyTips: [
      "Use gold/navy for luxury feel — never cheap-looking colors",
      "Show dollar amounts prominently (homes sold, sales volume)",
      "Agent photo builds trust — make it large and professional",
      "Use 'your dream home' language, not 'our listings'",
    ],
    colorNotes: "Gold (#c8a45e) conveys luxury. Navy backgrounds feel premium. Avoid bright/neon.",
    ctaStyle: "\"Find Your Dream Home\" or \"Get a Free Home Valuation\" — always value-first",
    commonMistakes: ["No agent photo", "Generic stock photos instead of local areas", "Missing neighborhood info"],
  },
  "dental": {
    category: "dental",
    mustHaveFeatures: [
      "Online appointment booking button (prominent, above fold)",
      "Insurance accepted list with logos",
      "Before/after smile gallery",
      "New patient special offer banner",
      "Emergency dental hotline number (large, clickable)",
      "Patient comfort features (sedation, TV, music)",
      "Office tour photos showing modern equipment",
    ],
    uniqueSections: [
      "Smile Gallery (before/after slider)",
      "Meet the Team with individual bios",
      "Patient Comfort section (reduces anxiety)",
      "Insurance & Financing FAQ",
      "New Patient Welcome package details",
    ],
    psychologyTips: [
      "Address fear directly — 'Gentle, pain-free dentistry'",
      "Show the office interior — modern = trustworthy",
      "Emphasize 'accepting new patients' prominently",
      "Use calming greens and whites, avoid clinical blues",
    ],
    colorNotes: "Green (#10b981) = health, calm, growth. White accents = clean. Avoid red (anxiety).",
    ctaStyle: "\"Book Your Appointment\" or \"Schedule Your Visit\" — never \"Contact Us\"",
    commonMistakes: ["No online booking", "Scary dental imagery", "No insurance info upfront"],
  },
  "law-firm": {
    category: "law-firm",
    mustHaveFeatures: [
      "Free consultation CTA (above fold, repeated)",
      "Practice areas with detailed descriptions",
      "Case results / settlements with dollar amounts",
      "Attorney bios with credentials and bar numbers",
      "Client testimonials with specific outcomes",
      "FAQ section addressing common legal concerns",
      "24/7 availability for emergencies",
    ],
    uniqueSections: [
      "Case Results ticker with settlement amounts",
      "Practice Areas hub with individual detail pages",
      "Why Choose Us with numbered differentiators",
      "Legal FAQ that addresses fear and uncertainty",
      "Confidential Case Review form",
    ],
    psychologyTips: [
      "Lead with 'free consultation' — removes financial barrier",
      "Show exact dollar amounts recovered — social proof",
      "Use authoritative language but accessible tone",
      "Dark purple/navy conveys authority without being cold",
      "Include 'No fee unless we win' prominently",
    ],
    colorNotes: "Purple (#8b5cf6) = authority, wisdom. Deep navy alternatives work. Avoid casual colors.",
    ctaStyle: "\"Get Your Free Consultation\" or \"Review My Case\" — reduce commitment anxiety",
    commonMistakes: ["No case results shown", "Too much legal jargon", "No free consultation offer"],
  },
  "landscaping": {
    category: "landscaping",
    mustHaveFeatures: [
      "Before/after project gallery (slider format)",
      "Free estimate CTA with project type selector",
      "Seasonal services calendar",
      "Service area map",
      "Project portfolio organized by type",
      "Licensed & insured badges prominently displayed",
      "Maintenance plan options with pricing",
    ],
    uniqueSections: [
      "Project Gallery with category filters",
      "Before/After slider for transformations",
      "Seasonal Tips blog section",
      "Free Estimate calculator",
      "Service Area coverage map",
    ],
    psychologyTips: [
      "Before/after photos are THE most persuasive element",
      "Show the transformation, not just the result",
      "Use natural greens — but vibrant, not muted",
      "Emphasize 'licensed and insured' for trust",
      "Include project timelines to set expectations",
    ],
    colorNotes: "Vibrant green (#22c55e) = growth, nature. Earth tones for warmth. Avoid dull olive.",
    ctaStyle: "\"Get a Free Estimate\" or \"Start Your Transformation\" — focus on the outcome",
    commonMistakes: ["No before/after photos", "Missing service area", "No pricing guidance"],
  },
  "salon": {
    category: "salon",
    mustHaveFeatures: [
      "Online booking integration (or booking link)",
      "Service menu with transparent pricing",
      "Stylist/team gallery with specialties",
      "Instagram feed integration (shows recent work)",
      "New client special offer",
      "Hair/beauty portfolio gallery",
      "Reviews prominently displayed (star ratings)",
    ],
    uniqueSections: [
      "Style Gallery / Portfolio grid",
      "Meet Your Stylists with specialties",
      "Service Menu with full pricing",
      "New Client Welcome offer",
      "Instagram integration",
    ],
    psychologyTips: [
      "Pricing transparency builds trust — show all prices",
      "Stylist photos with personality, not corporate headshots",
      "Gallery should show diverse hair types and styles",
      "Pink/rose tones feel luxurious for beauty brands",
      "Include 'Book Now' on every section",
    ],
    colorNotes: "Pink (#ec4899) = luxury beauty. Rose gold alternatives. Avoid generic purple.",
    ctaStyle: "\"Book Your Appointment\" or \"Find Your Stylist\" — personal and inviting",
    commonMistakes: ["No prices shown", "No stylist profiles", "Poor quality portfolio photos"],
  },
};

export function getInsights(category: Category): IndustryInsight | null {
  return INDUSTRY_INSIGHTS[category] || null;
}

export function generateQualityReport(category: Category): string {
  const insight = INDUSTRY_INSIGHTS[category];
  if (!insight) return `No specific insights for ${category} yet. Using general best practices.`;

  let report = `## ${category.replace("-", " ").toUpperCase()} Website Quality Report\n\n`;
  report += `### Must-Have Features:\n`;
  insight.mustHaveFeatures.forEach((f) => { report += `- ${f}\n`; });
  report += `\n### Unique Sections to Add:\n`;
  insight.uniqueSections.forEach((s) => { report += `- ${s}\n`; });
  report += `\n### Psychology Tips:\n`;
  insight.psychologyTips.forEach((t) => { report += `- ${t}\n`; });
  report += `\n### Color: ${insight.colorNotes}`;
  report += `\n### CTA Style: ${insight.ctaStyle}`;
  report += `\n### Common Mistakes to Avoid:\n`;
  insight.commonMistakes.forEach((m) => { report += `- ${m}\n`; });

  return report;
}
