/**
 * Typography Pairing System
 * Maps each business category to its designated Google Fonts pairing.
 * See CLAUDE.md "Typography Pairing Guide" for the full rationale.
 */

import type { Category } from "./types";

export interface FontPairing {
  heading: string;
  body: string;
  googleUrl: string;
  headingClass: string;
  bodyClass: string;
}

const FONT_PAIRINGS: Record<string, { heading: string; body: string }> = {
  // Warm / Friendly (dental, vet, restaurant)
  dental: { heading: "DM Serif Display", body: "DM Sans" },
  veterinary: { heading: "DM Serif Display", body: "DM Sans" },
  restaurant: { heading: "DM Serif Display", body: "DM Sans" },

  // Soft / Playful (daycare, pet-services)
  daycare: { heading: "Nunito", body: "Lato" },
  "pet-services": { heading: "Nunito", body: "Nunito Sans" },

  // Classic / Trustworthy (church, tutoring, PT, medical)
  church: { heading: "Merriweather", body: "Lato" },
  tutoring: { heading: "Merriweather", body: "Open Sans" },
  "physical-therapy": { heading: "Merriweather", body: "Lato" },
  medical: { heading: "Libre Baskerville", body: "Open Sans" },

  // Professional / Corporate (law, accounting, insurance)
  "law-firm": { heading: "EB Garamond", body: "Source Sans Pro" },
  accounting: { heading: "Crimson Pro", body: "Inter" },
  insurance: { heading: "Libre Baskerville", body: "Open Sans" },

  // Luxury / Elegant (med-spa, salon, interior-design, event-planning, florist, photography)
  "med-spa": { heading: "Cormorant Garamond", body: "Jost" },
  salon: { heading: "Cormorant Garamond", body: "Raleway" },
  "interior-design": { heading: "Cormorant Garamond", body: "Montserrat" },
  "event-planning": { heading: "Cormorant Garamond", body: "Raleway" },
  florist: { heading: "Playfair Display", body: "Raleway" },
  photography: { heading: "Playfair Display", body: "Raleway" },
  catering: { heading: "Playfair Display", body: "Lato" },

  // Real Estate
  "real-estate": { heading: "DM Serif Display", body: "DM Sans" },

  // Bold / Energy (fitness, martial-arts, tattoo)
  fitness: { heading: "Bebas Neue", body: "Open Sans" },
  "martial-arts": { heading: "Oswald", body: "Nunito Sans" },
  tattoo: { heading: "Archivo Black", body: "Archivo" },
  towing: { heading: "Oswald", body: "Nunito Sans" },

  // Tech / Modern Trades (electrician, plumber, hvac, pest-control, garage-door, locksmith, appliance-repair)
  electrician: { heading: "Space Grotesk", body: "Inter" },
  plumber: { heading: "Space Grotesk", body: "Inter" },
  hvac: { heading: "Space Grotesk", body: "Inter" },
  "pest-control": { heading: "Space Grotesk", body: "Inter" },
  "garage-door": { heading: "Space Grotesk", body: "Inter" },
  locksmith: { heading: "Space Grotesk", body: "Inter" },
  "appliance-repair": { heading: "Space Grotesk", body: "Inter" },

  // Industrial / Construction Trades
  roofing: { heading: "Barlow Condensed", body: "Barlow" },
  "auto-repair": { heading: "Barlow Condensed", body: "Barlow" },
  "general-contractor": { heading: "Barlow Condensed", body: "Barlow" },
  "pressure-washing": { heading: "Barlow Condensed", body: "Barlow" },
  moving: { heading: "Barlow Condensed", body: "Barlow" },
  "junk-removal": { heading: "Barlow Condensed", body: "Barlow" },
  "tree-service": { heading: "Barlow Condensed", body: "Barlow" },
  fencing: { heading: "Barlow Condensed", body: "Barlow" },
  construction: { heading: "Barlow Condensed", body: "Barlow" },

  // Clean / Modern (cleaning, carpet-cleaning)
  cleaning: { heading: "Poppins", body: "Poppins" },
  "carpet-cleaning": { heading: "Poppins", body: "Poppins" },

  // Outdoor / Nature
  landscaping: { heading: "Raleway", body: "Lato" },
  painting: { heading: "Raleway", body: "Lato" },
  "pool-spa": { heading: "Raleway", body: "Lato" },

  // Chiropractic (wellness)
  chiropractic: { heading: "DM Serif Text", body: "DM Sans" },
};

// Default fallback
const DEFAULT_PAIRING = { heading: "Inter", body: "Inter" };

/**
 * Get the font pairing for a given category.
 */
export function getFontPairing(category: string): FontPairing {
  const pair = FONT_PAIRINGS[category] || DEFAULT_PAIRING;

  const headingEncoded = pair.heading.replace(/ /g, "+");
  const bodyEncoded = pair.body.replace(/ /g, "+");

  // Build Google Fonts URL (dedup if heading === body)
  const families =
    pair.heading === pair.body
      ? `family=${headingEncoded}:wght@300;400;500;600;700;800`
      : `family=${headingEncoded}:wght@400;600;700;800&family=${bodyEncoded}:wght@300;400;500;600`;

  return {
    heading: pair.heading,
    body: pair.body,
    googleUrl: `https://fonts.googleapis.com/css2?${families}&display=swap`,
    headingClass: `font-['${pair.heading.replace(/ /g, "_")}']`,
    bodyClass: `font-['${pair.body.replace(/ /g, "_")}']`,
  };
}

/**
 * Get the Google Fonts <link> tag HTML for a category.
 */
export function getFontLinkTag(category: string): string {
  const { googleUrl } = getFontPairing(category);
  return `<link href="${googleUrl}" rel="stylesheet" />`;
}

/**
 * Get inline style objects for heading and body fonts.
 */
export function getFontStyles(category: string): { heading: React.CSSProperties; body: React.CSSProperties } {
  const { heading, body } = getFontPairing(category);
  return {
    heading: { fontFamily: `'${heading}', serif` },
    body: { fontFamily: `'${body}', sans-serif` },
  };
}
