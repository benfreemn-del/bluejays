/**
 * Pre-built SMS templates for Review Blast (Wave 1).
 *
 * Customer picks one at submission time. Each template is short
 * (under 160 chars to fit a single SMS segment), category-tuned,
 * and uses {businessName} + {reviewLink} tokens that get filled in
 * at dispatch.
 *
 * Per CLAUDE.md "Review Blast Wave 1" + Rule 14 (real-email/real-data
 * rule applies — no generic placeholder tone): every template should
 * sound like the BUSINESS texting their customer, not a third-party
 * marketing service.
 *
 * STOP compliance (TCPA / A2P 10DLC): every template ends with
 * " Reply STOP to opt out". This is mandatory — never remove it.
 */

import type { Category } from "./types";

export type TemplateKey =
  | "default"
  | "dental"
  | "veterinary"
  | "salon"
  | "electrician"
  | "plumber"
  | "hvac"
  | "roofing"
  | "auto_repair"
  | "landscaping"
  | "cleaning"
  | "fitness"
  | "real_estate"
  | "law_firm";

export interface Template {
  key: TemplateKey;
  label: string; // Human-readable label for the picker dropdown
  body: string; // Body with {businessName} + {reviewLink} tokens
}

/**
 * Default template — works for any category. Used when the customer's
 * specific category isn't in the list OR when they want the
 * generic-but-clean version.
 */
const DEFAULT_TEMPLATE: Template = {
  key: "default",
  label: "Generic — works for any business",
  body: "Hi! It's {businessName} — thank you for being a customer. If you have a sec, would you mind leaving us a quick review? It helps a ton: {reviewLink} Reply STOP to opt out",
};

export const TEMPLATES: Template[] = [
  DEFAULT_TEMPLATE,
  {
    key: "dental",
    label: "Dental — patient-friendly",
    body: "Hi from {businessName}! Thanks for trusting us with your smile. Would you take 30 sec to share your experience? It really helps our practice grow: {reviewLink} Reply STOP to opt out",
  },
  {
    key: "veterinary",
    label: "Veterinary — pet-friendly",
    body: "{businessName} here — thank you for trusting us with your pet's care! If you have a moment, would you share your experience? It means the world to us: {reviewLink} Reply STOP to opt out",
  },
  {
    key: "salon",
    label: "Salon — warm + brand-aware",
    body: "Hi! It's {businessName} — hope you're loving your new look! Would you take 30 sec to leave us a review? It helps us grow: {reviewLink} Reply STOP to opt out",
  },
  {
    key: "electrician",
    label: "Electrician — trade pro",
    body: "Hey, it's {businessName} — thanks for letting us handle your electrical work. Would you mind leaving us a quick review? It really helps: {reviewLink} Reply STOP to opt out",
  },
  {
    key: "plumber",
    label: "Plumber — trade pro",
    body: "Hi from {businessName}! Thanks for trusting us with your plumbing. If you have 30 sec, a quick review would mean a lot: {reviewLink} Reply STOP to opt out",
  },
  {
    key: "hvac",
    label: "HVAC — comfort-focused",
    body: "Hey! It's {businessName} — hope you're enjoying the comfort. Would you mind leaving us a review? Helps us a ton: {reviewLink} Reply STOP to opt out",
  },
  {
    key: "roofing",
    label: "Roofing — trade pro",
    body: "Hi from {businessName} — thanks for letting us take care of your roof. Would you share your experience in a quick review? {reviewLink} Reply STOP to opt out",
  },
  {
    key: "auto_repair",
    label: "Auto repair — friendly",
    body: "Hey, it's {businessName} — hope your car's running great! Would you take 30 sec to leave us a review? Helps a lot: {reviewLink} Reply STOP to opt out",
  },
  {
    key: "landscaping",
    label: "Landscaping — outdoor",
    body: "Hi from {businessName}! Hope you're enjoying your yard. Would you mind sharing your experience? It really helps us: {reviewLink} Reply STOP to opt out",
  },
  {
    key: "cleaning",
    label: "Cleaning — service-focused",
    body: "It's {businessName} — thanks for choosing us! Would you take a sec to share your experience? Reviews help us so much: {reviewLink} Reply STOP to opt out",
  },
  {
    key: "fitness",
    label: "Fitness — motivating",
    body: "Hey! It's {businessName} — proud of your hard work. If you have a sec, would you share your experience with others? {reviewLink} Reply STOP to opt out",
  },
  {
    key: "real_estate",
    label: "Real estate — relationship-led",
    body: "Hi from {businessName} — thank you for trusting me with your home journey. Would you share your experience in a review? {reviewLink} Reply STOP to opt out",
  },
  {
    key: "law_firm",
    label: "Law firm — professional",
    body: "Hi from {businessName} — thank you for trusting us with your case. Would you share your experience in a quick review? {reviewLink} Reply STOP to opt out",
  },
];

/**
 * Pick a default template key for a given prospect category. Used to
 * pre-select the right option in the dropdown when the customer first
 * loads the submission page.
 */
export function getDefaultTemplateForCategory(category: Category | string | undefined): TemplateKey {
  if (!category) return "default";
  const map: Record<string, TemplateKey> = {
    dental: "dental",
    veterinary: "veterinary",
    salon: "salon",
    electrician: "electrician",
    plumber: "plumber",
    hvac: "hvac",
    roofing: "roofing",
    "auto-repair": "auto_repair",
    landscaping: "landscaping",
    cleaning: "cleaning",
    fitness: "fitness",
    "martial-arts": "fitness",
    "real-estate": "real_estate",
    "law-firm": "law_firm",
    "med-spa": "salon",
    "interior-design": "default",
  };
  return map[category] ?? "default";
}

/**
 * Render a template body with the prospect's businessName + the
 * deterministic /review/[prospectId] link. Used at dispatch time —
 * one call per SMS in the batch.
 */
export function renderTemplate(
  templateKey: TemplateKey,
  businessName: string,
  reviewLink: string,
): string {
  const tpl = TEMPLATES.find((t) => t.key === templateKey) ?? DEFAULT_TEMPLATE;
  return tpl.body
    .replace(/\{businessName\}/g, businessName)
    .replace(/\{reviewLink\}/g, reviewLink);
}
