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

export const GENERIC_TAGLINE_PATTERNS = [
  /trusted .* services for your community/i,
  /committed to delivering exceptional/i,
  /where artistry meets luxury/i,
  /modern .* care for the whole family/i,
  /your trusted .* partner/i,
  /professional .* services\.?$/i,
  /premium .* services\.?$/i,
  /call us today/i,
  // 2026-04-19: the bad fallback patterns this codebase itself was producing
  // before the CATEGORY_VOICE table existed. These are the only things the
  // bulk-refresh endpoint is allowed to overwrite — everything else is
  // either real human/scraped copy or a newer good fallback and must be
  // preserved.
  /serves .+ with real .+ expertise/i,
  /serves .+ area with real .+ expertise/i,
  /serves the .+ community with real .+ expertise/i,
];

export const GENERIC_ABOUT_PATTERNS = [
  /trusted .* provider committed to delivering exceptional quality and service/i,
  /years of experience serving the local community/i,
  /personalized service/i,
  /comfortable, modern setting/i,
  /latest technology and techniques/i,
  /dedicated legal representation with a personal touch/i,
  /transforms outdoor spaces into stunning landscapes/i,
  /premier salon offering expert hair and beauty services/i,
  // 2026-04-19: the bad about fallbacks this codebase itself produced
  /We provide professional .+ services tailored to each client/i,
  /provides? professional .+ services tailored to each client/i,
];

/**
 * Is the given tagline one of our previously-generated generic
 * fallbacks (or empty/missing)? If so it's safe to replace with the new
 * CATEGORY_VOICE output. Human/scraped real copy must NEVER trigger
 * true here — review the patterns above before adding new ones.
 */
export function isGenericTagline(tagline: string | undefined | null): boolean {
  if (!tagline || tagline.trim().length === 0) return true;
  return GENERIC_TAGLINE_PATTERNS.some((p) => p.test(tagline));
}

/**
 * Same logic for about text. Only true for copy the system itself
 * produced as a generic fallback. Real scraped/written content must
 * never match.
 */
export function isGenericAbout(about: string | undefined | null): boolean {
  if (!about || about.trim().length === 0) return true;
  return GENERIC_ABOUT_PATTERNS.some((p) => p.test(about));
}

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

/**
 * Category-specific voice table — Option A (observational / hook-y).
 *
 * Ben approved this tone on 2026-04-19. Every category gets unique,
 * on-brand copy that actually matches what the business DOES. Replaces
 * the old generic "{name} serves {area} with real {category} expertise"
 * fallback which produced garbage like "serves Snohomish area with
 * church expertise" — a phrase that means nothing.
 *
 * Each entry provides:
 *   - tagline:  Used as the final fallback when we can't build a
 *               services/differentiator-specific tagline. Full sentence.
 *   - aboutFill: Sentence inserted in place of the generic "We provide
 *                professional {category} services tailored to each client"
 *                when the scrape didn't surface a real services list.
 *                First-person ("We ...") — the caller stitches it into
 *                the about paragraph as a standalone sentence.
 *
 * When editing, respect the category's actual vibe:
 *   - Never say "expertise" (banned outside of trades/professional svc)
 *   - Never say "trusted provider committed to delivering exceptional
 *     quality and service" — that phrase is in GENERIC_ABOUT_PATTERNS
 *   - Keep it human. If the line could be swapped into any category, it
 *     is not specific enough. Rework until only one category fits.
 */
interface CategoryVoice {
  tagline: (businessName: string, area: string) => string;
  aboutFill: (area: string) => string;
}

const CATEGORY_VOICE: Record<Category, CategoryVoice> = {
  "real-estate": {
    tagline: (b, a) => `${b} helps ${a} buyers and sellers close with confidence.`,
    aboutFill: (a) => `We guide ${a} buyers and sellers through every step of the real estate journey.`,
  },
  dental: {
    tagline: (b, a) => `${b} keeps ${a} smiles healthy and bright.`,
    aboutFill: (a) => `We deliver gentle, comprehensive dental care to ${a} families.`,
  },
  "law-firm": {
    tagline: (b, a) => `${b} fights for ${a} clients when it matters most.`,
    aboutFill: (a) => `We represent ${a} clients with dedication, experience, and results that hold up in court.`,
  },
  landscaping: {
    tagline: (b, a) => `${b} transforms ${a} yards into outdoor spaces you'll actually want to live in.`,
    aboutFill: (a) => `We design, build, and maintain beautiful outdoor spaces across ${a}.`,
  },
  salon: {
    tagline: (b, a) => `${b} is where ${a} comes to look and feel their best.`,
    aboutFill: (a) => `We offer personalized hair, color, and styling services for ${a} — tailored to each guest.`,
  },
  electrician: {
    tagline: (b, a) => `${b} wires ${a} homes and businesses safely.`,
    aboutFill: (a) => `We handle everything from small repairs to full installs across ${a} — licensed, insured, and code-compliant.`,
  },
  plumber: {
    tagline: (b, a) => `${b} fixes ${a} plumbing fast, with no guesswork.`,
    aboutFill: (a) => `We keep ${a} water running clean and pipes flowing clear — drains, leaks, water heaters, and repipes.`,
  },
  hvac: {
    tagline: (b, a) => `${b} keeps ${a} homes comfortable year-round.`,
    aboutFill: (a) => `We install, service, and repair HVAC systems across ${a} — heat waves, cold snaps, and everything in between.`,
  },
  roofing: {
    tagline: (b, a) => `${b} protects ${a} homes from the top down.`,
    aboutFill: (a) => `We install, repair, and maintain roofs that stand up to ${a} weather year after year.`,
  },
  "general-contractor": {
    tagline: (b, a) => `${b} builds ${a} homes and renovations with real craftsmanship.`,
    aboutFill: (a) => `We handle custom home builds, additions, and full remodels across ${a} — licensed, bonded, and on budget.`,
  },
  "auto-repair": {
    tagline: (b, a) => `${b} keeps ${a} cars on the road and running right.`,
    aboutFill: (a) => `We diagnose, maintain, and repair vehicles across ${a} — honest pricing, straight answers.`,
  },
  chiropractic: {
    tagline: (b, a) => `${b} helps ${a} move better and feel better.`,
    aboutFill: (a) => `We provide personalized chiropractic care for ${a} residents — back pain, neck pain, injuries, and wellness.`,
  },
  accounting: {
    tagline: (b, a) => `${b} keeps ${a} businesses compliant and profitable.`,
    aboutFill: (a) => `We handle bookkeeping, tax prep, and financial strategy for ${a} businesses and families.`,
  },
  insurance: {
    tagline: (b, a) => `${b} protects what matters for ${a} families and businesses.`,
    aboutFill: (a) => `We help ${a} clients find the right coverage at the right price — auto, home, life, and commercial.`,
  },
  photography: {
    tagline: (b, a) => `${b} captures ${a} moments worth remembering.`,
    aboutFill: (a) => `We photograph weddings, portraits, families, and events across ${a}.`,
  },
  "interior-design": {
    tagline: (b, a) => `${b} designs ${a} homes that actually feel like you.`,
    aboutFill: (a) => `We turn ${a} houses into homes with thoughtful, personal design — from single rooms to whole-home transformations.`,
  },
  cleaning: {
    tagline: (b, a) => `${b} keeps ${a} homes and offices spotless.`,
    aboutFill: (a) => `We provide reliable, thorough residential and commercial cleaning across ${a}.`,
  },
  "pest-control": {
    tagline: (b, a) => `${b} keeps ${a} homes and businesses pest-free.`,
    aboutFill: (a) => `We handle prevention, extermination, and ongoing protection for ${a} — safe for pets, kids, and peace of mind.`,
  },
  moving: {
    tagline: (b, a) => `${b} helps ${a} move without the headache.`,
    aboutFill: (a) => `We handle residential and commercial moves across ${a} — packed, loaded, delivered, and treated like your own.`,
  },
  veterinary: {
    tagline: (b, a) => `${b} cares for ${a} pets like family.`,
    aboutFill: (a) => `We provide wellness, preventive, and urgent care for ${a} pets — from kittens and puppies to seniors.`,
  },
  fitness: {
    tagline: (b, a) => `${b} helps ${a} get stronger, healthier, and more confident.`,
    aboutFill: (a) => `We offer training, classes, and coaching for ${a} members at every fitness level.`,
  },
  tattoo: {
    tagline: (b, a) => `${b} creates ${a} art that lasts a lifetime.`,
    aboutFill: (a) => `We specialize in custom tattoo work for ${a} clients — fine line, color, traditional, and coverups.`,
  },
  florist: {
    tagline: (b, a) => `${b} brings beauty to ${a} weddings, events, and everyday moments.`,
    aboutFill: (a) => `We design custom floral arrangements for ${a} — weddings, funerals, corporate events, and "just because" flowers.`,
  },
  catering: {
    tagline: (b, a) => `${b} feeds ${a} events with food worth remembering.`,
    aboutFill: (a) => `We cater weddings, corporate events, and private parties across ${a}.`,
  },
  daycare: {
    tagline: (b, a) => `${b} cares for ${a} kids like they're our own.`,
    aboutFill: (a) => `We provide safe, nurturing, full-day childcare for ${a} families.`,
  },
  "pet-services": {
    tagline: (b, a) => `${b} loves ${a} pets like family.`,
    aboutFill: (a) => `We offer grooming, boarding, walking, and day care for pets across ${a}.`,
  },
  "martial-arts": {
    tagline: (b, a) => `${b} teaches ${a} discipline, confidence, and strength.`,
    aboutFill: (a) => `We train ${a} students of all ages — kids programs, adult classes, and competition-track athletes.`,
  },
  "physical-therapy": {
    tagline: (b, a) => `${b} helps ${a} recover and get back to life.`,
    aboutFill: (a) => `We treat injuries, chronic pain, and post-surgery recovery across ${a}.`,
  },
  tutoring: {
    tagline: (b, a) => `${b} helps ${a} students reach their potential.`,
    aboutFill: (a) => `We provide personalized academic tutoring for ${a} students — grades K-12 through college prep.`,
  },
  "pool-spa": {
    tagline: (b, a) => `${b} keeps ${a} pools and spas crystal clear.`,
    aboutFill: (a) => `We handle pool maintenance, repairs, and installations across ${a}.`,
  },
  church: {
    tagline: (b, a) => `${b} welcomes ${a} into a community of faith, fellowship, and service.`,
    aboutFill: (a) => `We gather ${a} in worship, community, and purpose — Sundays, small groups, and everything in between.`,
  },
  restaurant: {
    tagline: (b, a) => `${b} serves ${a} food that brings people back.`,
    aboutFill: (a) => `We craft fresh, locally-inspired meals for ${a} — lunch, dinner, and the reason you'll come back next week.`,
  },
  medical: {
    tagline: (b, a) => `${b} cares for ${a} families at every stage of life.`,
    aboutFill: (a) => `We provide comprehensive medical care to patients across ${a}.`,
  },
  painting: {
    tagline: (b, a) => `${b} paints ${a} homes beautifully, inside and out.`,
    aboutFill: (a) => `We handle interior and exterior painting for ${a} homes and businesses — prep done right, finish done clean.`,
  },
  fencing: {
    tagline: (b, a) => `${b} builds ${a} fences that last.`,
    aboutFill: (a) => `We design and install wood, vinyl, chain-link, and custom fencing across ${a}.`,
  },
  "tree-service": {
    tagline: (b, a) => `${b} keeps ${a} trees healthy and safe.`,
    aboutFill: (a) => `We handle pruning, removal, stump grinding, and tree care across ${a} — licensed arborists, insured crews.`,
  },
  "pressure-washing": {
    tagline: (b, a) => `${b} restores ${a} surfaces to like-new.`,
    aboutFill: (a) => `We pressure-wash homes, driveways, decks, and commercial exteriors across ${a}.`,
  },
  "garage-door": {
    tagline: (b, a) => `${b} keeps ${a} garages working smoothly.`,
    aboutFill: (a) => `We install, repair, and service garage doors and openers across ${a}.`,
  },
  locksmith: {
    tagline: (b, a) => `${b} unlocks ${a}, day or night.`,
    aboutFill: (a) => `We provide emergency locksmith services across ${a} — lockouts, rekeys, and security upgrades.`,
  },
  towing: {
    tagline: (b, a) => `${b} helps ${a} drivers when they need it most.`,
    aboutFill: (a) => `We provide fast, reliable towing and roadside assistance across ${a} — day or night.`,
  },
  construction: {
    tagline: (b, a) => `${b} builds ${a} with craftsmanship and integrity.`,
    aboutFill: (a) => `We handle residential and commercial construction across ${a} — new builds, additions, and major renovations.`,
  },
  "med-spa": {
    tagline: (b, a) => `${b} helps ${a} look and feel their best.`,
    aboutFill: (a) => `We offer facials, injectables, laser, and wellness treatments to ${a} clients.`,
  },
  "appliance-repair": {
    tagline: (b, a) => `${b} fixes ${a} appliances fast.`,
    aboutFill: (a) => `We repair refrigerators, washers, dryers, ovens, and dishwashers across ${a} — same-day service on most jobs.`,
  },
  "junk-removal": {
    tagline: (b, a) => `${b} clears ${a} clutter fast and responsibly.`,
    aboutFill: (a) => `We handle junk removal, donation pickup, and full-property cleanouts across ${a}.`,
  },
  "carpet-cleaning": {
    tagline: (b, a) => `${b} deep-cleans ${a} carpets, rugs, and upholstery.`,
    aboutFill: (a) => `We provide professional carpet, rug, and upholstery cleaning across ${a}.`,
  },
  "event-planning": {
    tagline: (b, a) => `${b} makes ${a} events unforgettable.`,
    aboutFill: (a) => `We plan weddings, corporate events, and private gatherings across ${a} — design, logistics, and day-of coordination.`,
  },
  "non-profit": {
    tagline: (b, a) => `${b} is building a stronger ${a} community.`,
    aboutFill: (a) => `We serve ${a} families through advocacy, resources, and community programs.`,
  },
};

function getCategoryVoice(category: Category): CategoryVoice {
  return CATEGORY_VOICE[category] || {
    tagline: (b, a) => `${b} proudly serves ${a}.`,
    aboutFill: (a) => `We proudly serve the ${a} community.`,
  };
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

  // Terminal fallback: category-specific voice instead of generic
  // "serves X area with Y expertise". See CATEGORY_VOICE above.
  return getCategoryVoice(category).tagline(brief.businessName, area);
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
  const aboutArea = cityName || cleanAreas[0] || "the local community";
  const servicesClause = brief.actualServices.length
    ? `Our team specializes in ${joinList(brief.actualServices.slice(0, 4), getCategoryLabel(category))}.`
    : getCategoryVoice(category).aboutFill(aboutArea);
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
