/**
 * Per-category pain points for the audit prompt.
 *
 * Pre-fix the audit prompt was a single generic template with `{category}`
 * substitution — the AI saw the vertical name but no industry-specific
 * instincts, so dental and plumber audits read interchangeably.
 *
 * This file flips that. Each category gets:
 *   - 5 Hormozi-tone hero pain points (money-leak forward, "you" voice,
 *     3rd-grade reading level per Rule 61)
 *   - 1-2 category-specific tech-side findings (optional)
 *
 * Lookup is pure — no DB call. The pain points are SUGGESTIONS, not a
 * forced checklist (Q3B locked design): the AI picks the 2-3 most
 * relevant to what it actually sees on the prospect's site, and falls
 * back to its general instincts when none apply.
 *
 * "general" catch-all (Q5B locked design) reuses plumber pain points —
 * trades/service-business pain (urgency, transparency, after-hours) is
 * the broadest universal-SMB pattern. When scout volume data emerges
 * showing a different most-scouted vertical, swap the alias.
 */

export interface CategoryPainPoints {
  /** 5 Hormozi-tone hero pain points. AI picks 2-3 most relevant per audit. */
  heroPainPoints: string[];
  /** 1-2 category-specific tech-side findings to check. Optional. */
  techPainPoints?: string[];
}

// ─── Per-category pain points (5 verticals shipped in this commit) ───
// Remaining 41 categories filled in the follow-up commit.

const PLUMBER_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No after-hours / 24-7 number on the hero. The 2am burst pipe is your highest-margin job. Whoever shows up first wins it. You don't.",
    "No service-area map or city list. Caller asks 'do you come to Tacoma?' Site doesn't say. They hang up and try the next plumber.",
    "No upfront pricing — not even a 'service call $99'. Homeowners hate 'we'll give you a quote'. They bounce to whoever shows the number.",
    "License + bond number not visible anywhere. Every plumber claims 'licensed and insured'. Show the actual number — it closes the trust.",
    "Hero photo is a stock wrench. Your truck, your guy in a uniform, the actual job site = real. Stock = fake. Fake loses the call.",
  ],
  techPainPoints: [
    "No LocalBusiness or Plumber schema markup. Google's local pack picks the plumber it can parse first. You're invisible.",
    "Phone number isn't a tap-to-call link. On mobile that's an extra 3 taps. Most people don't bother.",
  ],
};

const DENTAL_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'Accepting New Patients' badge on the hero. Phone rings but the chair sits empty because nobody knows you have room.",
    "Insurance carriers not visible. Every visitor's first question is 'do you take my plan?' If they have to call to ask, half hang up.",
    "No emergency / same-day callout. The broken tooth at 8am goes to whoever shows it on the homepage. Right now that's not you.",
    "Google reviews + star count buried below the fold. 4.9 stars across 240 reviews is your closer. Hide it, lose half the new patients.",
    "No before/after smile gallery. Your work IS the proof. People scroll Instagram before they call. Give them something to land on first.",
  ],
  techPainPoints: [
    "No Dentist or LocalBusiness schema. Google can't tell you're a dentist; you don't show in 'dentist near me'.",
    "No HIPAA-compliant contact form. If you're collecting patient info via a generic form, you're one OCR audit away from a fine.",
  ],
};

const SALON_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'Book Now' button on the hero. Phone tag kills bookings. Every chain salon has a calendar. You don't.",
    "No stylist profiles. Clients pick a stylist before a salon. Without faces + specialties, every visitor is a coin flip.",
    "No price menu. 'Call for pricing' makes them call. Calling makes them not. Most don't.",
    "Hair gallery is stock photos, not your actual work. They Instagram-check you in 3 seconds. They find nothing. They scroll past.",
    "No new-client special. The wavering shopper needs a hook. '20% off your first visit' closes the deal before they second-guess.",
  ],
  techPainPoints: [
    "Instagram embed loading at top kills mobile speed. Push it down or lazy-load — every second past 2 = 20% bounce.",
    "No HairSalon schema markup. You're a beauty salon to Google's eyes only if the markup says so.",
  ],
};

const REAL_ESTATE_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No featured listings on the hero. Visitor wants houses. You're showing 'About Us'. They go to Zillow.",
    "Phone number not pinned in the nav. Every other agent on the SERP has it pinned. They tap that, not yours.",
    "No 'What's my home worth?' tool. The seller capture hook of the decade. You don't have it. Sellers go to Redfin.",
    "Agent bio reads like a brokerage page. Buyers pick a person, not a brokerage. Show the human or lose to whoever does.",
    "No neighborhood pages. Local SEO dies without them. Buyer trust dies without them. Both at the same time.",
  ],
  techPainPoints: [
    "IDX feed not loading or slow. No listings = no SEO. No SEO = no organic buyer traffic.",
    "No RealEstateAgent schema. Google's knowledge panel can't show your specialty + service area without it.",
  ],
};

const RESTAURANT_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "Menu is hidden behind a PDF. Google can't read PDFs. Phone users don't click them. You lose both.",
    "No reservation button. 'Call to book' loses every visitor under 35. They go to the place with the OpenTable button.",
    "Hours of operation not on the hero. 'Are you open right now?' is the #1 question. No answer = they pick somewhere else.",
    "No food photography — your dishes look like stock soup. The menu is your sales pitch. Make it real, make it yours.",
    "No address + map link. They pick the next restaurant whose address is one tap from a Google Maps direction.",
  ],
  techPainPoints: [
    "No Restaurant schema with cuisine type + price range. Google's restaurant knowledge panel skips you entirely.",
    "Menu PDF kills SEO. Convert to HTML — every dish becomes a search-able page that ranks for '{dish} near me'.",
  ],
};

// "general" catch-all — reuses plumber per Q5B locked design.
const GENERAL_PAIN_POINTS: CategoryPainPoints = PLUMBER_PAIN_POINTS;

// ─── The lookup table ────────────────────────────────────────────────

const CATEGORY_PAIN_POINTS: Record<string, CategoryPainPoints> = {
  plumber: PLUMBER_PAIN_POINTS,
  dental: DENTAL_PAIN_POINTS,
  salon: SALON_PAIN_POINTS,
  "real-estate": REAL_ESTATE_PAIN_POINTS,
  restaurant: RESTAURANT_PAIN_POINTS,
  general: GENERAL_PAIN_POINTS,
  // 41 categories follow in the next commit.
};

/**
 * Look up pain points for a category. Falls back to "general" (plumber-
 * pattern) when the category isn't filled in yet. Pure — no DB call.
 */
export function getCategoryPainPoints(category: string): CategoryPainPoints {
  return CATEGORY_PAIN_POINTS[category] || CATEGORY_PAIN_POINTS.general;
}

/**
 * Format the pain points as a prompt block for the hero AI prompt.
 * Returns "" if the category has no entry (lets the prompt skip the
 * section entirely instead of injecting empty bullets).
 */
export function formatHeroPainPointsBlock(category: string): string {
  const entry = getCategoryPainPoints(category);
  if (!entry.heroPainPoints.length) return "";
  const bullets = entry.heroPainPoints.map((p) => `- ${p}`).join("\n");
  return `CATEGORY-SPECIFIC PAIN POINTS — INSPIRATION (not a checklist):
The list below captures what tends to lose ${category.replace("-", " ")} businesses customers. Pick the 2-3 that actually match what you see on THIS prospect's site, lead with those, and add your own observations from the actual content. If none apply, fall back to your general instincts.

${bullets}`;
}

/**
 * Format the tech pain points as a prompt block for the technical AI
 * prompt. Returns "" if the category has no tech entries.
 */
export function formatTechPainPointsBlock(category: string): string {
  const entry = getCategoryPainPoints(category);
  if (!entry.techPainPoints?.length) return "";
  const bullets = entry.techPainPoints.map((p) => `- ${p}`).join("\n");
  return `CATEGORY-SPECIFIC TECH SIGNALS — check these if relevant:
${bullets}`;
}
