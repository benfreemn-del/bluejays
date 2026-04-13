import type { Category, Prospect, ScrapedData } from "./types";

export interface ResearchBrief {
  businessName: string;
  ownerName?: string;
  city?: string;
  state?: string;
  serviceAreas: string[];
  actualServices: string[];
  differentiators: string[];
  sourceFacts: string[];
  summary: string;
}

export interface PlaceholderLintIssue {
  section: "tagline" | "about" | "testimonials" | "services" | "general";
  message: string;
  severity: "critical" | "warning";
}

const GENERIC_TAGLINE_PATTERNS = [
  /trusted .* services for your community/i,
  /committed to delivering exceptional/i,
  /where artistry meets luxury/i,
  /modern .* care for the whole family/i,
  /your trusted .* partner/i,
  /professional .* services\.?$/i,
  /premium .* services\.?$/i,
  /call us today/i,
];

const GENERIC_ABOUT_PATTERNS = [
  /trusted .* provider committed to delivering exceptional quality and service/i,
  /years of experience serving the local community/i,
  /personalized service/i,
  /comfortable, modern setting/i,
  /latest technology and techniques/i,
  /dedicated legal representation with a personal touch/i,
  /transforms outdoor spaces into stunning landscapes/i,
  /premier salon offering expert hair and beauty services/i,
];

const PLACEHOLDER_TESTIMONIAL_NAMES = new Set([
  "happy customer",
  "customer",
  "client",
  "patient",
  "reviewer",
  "homeowner",
]);

const DIFFERENTIATOR_PATTERNS = [
  /family[- ]owned[^.\n]*/gi,
  /locally owned[^.\n]*/gi,
  /same[- ]day[^.\n]*/gi,
  /free consultation[^.\n]*/gi,
  /licensed and insured[^.\n]*/gi,
  /board certified[^.\n]*/gi,
  /emergency[^.\n]*/gi,
  /award[- ]winning[^.\n]*/gi,
  /eco[- ]friendly[^.\n]*/gi,
  /financing available[^.\n]*/gi,
  /accepting new patients[^.\n]*/gi,
  /satisfaction guaranteed[^.\n]*/gi,
];

function dedupe(items: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const clean = item?.replace(/\s+/g, " ").trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
  }

  return result;
}

function extractDifferentiators(text: string | undefined): string[] {
  if (!text) return [];

  const matches: string[] = [];
  for (const pattern of DIFFERENTIATOR_PATTERNS) {
    const found = text.match(pattern) || [];
    matches.push(...found.map((entry) => entry.replace(/[.,;:]+$/g, "").trim()));
  }

  return dedupe(matches).slice(0, 4);
}

function getPrimaryServiceAreas(prospect: Prospect, scrapedData?: Partial<ScrapedData>): string[] {
  const baseCity = prospect.city?.trim();
  const baseState = prospect.state?.trim();
  const address = scrapedData?.address?.trim();
  const city = scrapedData?.city?.trim() || baseCity;

  const areas = [
    city,
    city && baseState ? `${city}, ${baseState}` : undefined,
    address,
  ];

  return dedupe(areas).slice(0, 3);
}

function getActualServices(scrapedData?: Partial<ScrapedData>): string[] {
  return dedupe((scrapedData?.services || []).map((service) => service.name)).slice(0, 6);
}

function getSourceFacts(prospect: Prospect, scrapedData?: Partial<ScrapedData>): string[] {
  return dedupe([
    prospect.ownerName ? `Owner: ${prospect.ownerName}` : undefined,
    scrapedData?.phone || prospect.phone ? `Phone: ${scrapedData?.phone || prospect.phone}` : undefined,
    scrapedData?.hours ? `Hours: ${scrapedData.hours}` : undefined,
    scrapedData?.address ? `Address: ${scrapedData.address}` : undefined,
    scrapedData?.tagline ? `Existing tagline: ${scrapedData.tagline}` : undefined,
    scrapedData?.about ? `Existing about excerpt: ${scrapedData.about.slice(0, 220)}` : undefined,
  ]);
}

export function buildResearchBrief(prospect: Prospect, scrapedData?: Partial<ScrapedData>): ResearchBrief {
  const serviceAreas = getPrimaryServiceAreas(prospect, scrapedData);
  const actualServices = getActualServices(scrapedData);
  const differentiators = dedupe([
    ...extractDifferentiators(scrapedData?.tagline),
    ...extractDifferentiators(scrapedData?.about),
    ...extractDifferentiators(scrapedData?.hours),
    ...(scrapedData?.services || [])
      .map((service) => service.description)
      .filter((description): description is string => Boolean(description))
      .flatMap((description) => extractDifferentiators(description)),
  ]).slice(0, 5);

  const summaryParts = [
    `Business: ${prospect.businessName}`,
    prospect.ownerName ? `Owner: ${prospect.ownerName}` : undefined,
    serviceAreas.length ? `Service areas: ${serviceAreas.join(" | ")}` : undefined,
    actualServices.length ? `Actual services: ${actualServices.join(" | ")}` : undefined,
    differentiators.length ? `Differentiators: ${differentiators.join(" | ")}` : undefined,
  ];

  return {
    businessName: prospect.businessName,
    ownerName: prospect.ownerName,
    city: scrapedData?.city || prospect.city,
    state: prospect.state,
    serviceAreas,
    actualServices,
    differentiators,
    sourceFacts: getSourceFacts(prospect, scrapedData),
    summary: summaryParts.filter(Boolean).join("\n"),
  };
}

function joinList(items: string[], fallback: string): string {
  if (items.length === 0) return fallback;
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function getCategoryLabel(category: Category): string {
  return category.replace(/-/g, " ");
}

export function buildTaglineFromResearchBrief(brief: ResearchBrief, category: Category): string {
  const services = brief.actualServices.slice(0, 2);
  const area = brief.serviceAreas[0] || brief.city || "the local area";
  const differentiator = brief.differentiators[0];

  if (services.length > 0 && differentiator) {
    return `${brief.businessName} delivers ${joinList(services, getCategoryLabel(category))} in ${area} with ${differentiator.toLowerCase()}.`;
  }

  if (services.length > 0) {
    return `${brief.businessName} provides ${joinList(services, getCategoryLabel(category))} for clients in ${area}.`;
  }

  if (differentiator) {
    return `${brief.businessName} serves ${area} with ${differentiator.toLowerCase()}.`;
  }

  return `${brief.businessName} serves ${area} with real ${getCategoryLabel(category)} expertise.`;
}

export function buildAboutFromResearchBrief(brief: ResearchBrief, category: Category): string {
  const ownerClause = brief.ownerName
    ? `Led by ${brief.ownerName}, ${brief.businessName}`
    : `${brief.businessName}`;
  // Filter out street addresses from service areas — only use city/neighborhood names
  const cleanAreas = brief.serviceAreas
    .filter((a) => !/\d{3,}/.test(a) && !/suite|unit|ste|#/i.test(a) && a.length < 40)
    .slice(0, 2);
  const cityName = (brief.city || "").replace(/,\s*\w{2}$/, "").trim(); // "Seattle, WA" → "Seattle"
  const areaClause = cleanAreas.length
    ? `proudly serves ${joinList(cleanAreas, cityName || "the local community")}`
    : cityName
      ? `proudly serves the ${cityName} community`
      : "proudly serves the local community";
  const servicesClause = brief.actualServices.length
    ? `Our team specializes in ${joinList(brief.actualServices.slice(0, 4), getCategoryLabel(category))}.`
    : `We provide professional ${getCategoryLabel(category)} services tailored to each client.`;
  const differentiatorClause = brief.differentiators.length
    ? `Clients choose us for ${joinList(brief.differentiators.slice(0, 2).map((entry) => entry.toLowerCase()), "our strong reputation")}.`
    : "";

  return `${ownerClause} ${areaClause}. ${servicesClause}${differentiatorClause ? " " + differentiatorClause : ""}`;
}

export function lintPlaceholderContent(input: {
  businessName?: string;
  tagline?: string;
  about?: string;
  testimonials?: Array<{ name?: string; text?: string }>;
  services?: Array<{ name?: string; description?: string }>;
  city?: string;
}): PlaceholderLintIssue[] {
  const issues: PlaceholderLintIssue[] = [];
  const tagline = input.tagline?.trim() || "";
  const about = input.about?.trim() || "";
  const city = input.city?.trim();

  if (!tagline || GENERIC_TAGLINE_PATTERNS.some((pattern) => pattern.test(tagline))) {
    issues.push({
      section: "tagline",
      severity: "critical",
      message: `Tagline looks generic or placeholder-like: "${tagline || "missing"}".`,
    });
  }

  if (!about || GENERIC_ABOUT_PATTERNS.some((pattern) => pattern.test(about))) {
    issues.push({
      section: "about",
      severity: "critical",
      message: "About section appears to use generic template copy instead of business-specific research.",
    });
  }

  if (city && about && !about.toLowerCase().includes(city.toLowerCase())) {
    issues.push({
      section: "about",
      severity: "critical",
      message: `About section does not mention the prospect city "${city}".`,
    });
  }

  const placeholderTestimonials = (input.testimonials || []).filter((testimonial) => {
    const name = testimonial.name?.trim().toLowerCase() || "";
    const text = testimonial.text?.trim().toLowerCase() || "";
    return (
      PLACEHOLDER_TESTIMONIAL_NAMES.has(name) ||
      text.includes("placeholder") ||
      text.includes("lorem ipsum") ||
      text.length < 25
    );
  });

  if (placeholderTestimonials.length > 0) {
    issues.push({
      section: "testimonials",
      severity: "critical",
      message: `${placeholderTestimonials.length} testimonial(s) look fake, generic, or too short to use in production.`,
    });
  }

  const genericServices = (input.services || []).filter((service) => {
    const name = service.name?.trim().toLowerCase() || "";
    return ["quality service", "professional service", "consultation", "maintenance"].includes(name);
  });

  if ((input.services || []).length > 0 && genericServices.length === (input.services || []).length) {
    issues.push({
      section: "services",
      severity: "warning",
      message: "All listed services look generic rather than business-specific.",
    });
  }

  return issues;
}
