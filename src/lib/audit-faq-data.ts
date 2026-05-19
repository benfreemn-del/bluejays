/**
 * Audit-page FAQ videos — top 5 objections that surface on Madie's
 * $10k AI System discovery calls. Embedded on `/audit/[id]` results
 * page below ProductAuditVideoBlock, before Top-5 fixes / scarcity
 * footer.
 *
 * Per 116-Funnels chunk 13a — confirmation/thank-you page 60-second
 * FAQ videos pre-handle objections BEFORE the prospect hits the
 * Calendly. "Up to 40% show-rate lift" when wired correctly.
 *
 * Wiring contract — see `docs/playbooks/audit-faq-videos.md` for the
 * full recording protocol + scripts:
 *   - `videoUrl: null` → component renders the script fallback
 *   - `videoUrl: <Loom or MP4 URL>` → component renders the embed
 *   - `transcript` is always rendered (read-aloud captions for SEO +
 *     a11y + the AI-bot crawlers that don't render video)
 *
 * To wire a video: replace `videoUrl: null` with the recorded URL.
 * No other changes needed — the component flips from script-mode to
 * video-mode the moment a URL lands.
 *
 * Framework attribution:
 *   - Brunson HSO at video altitude (recursive H/S/O —
 *     `reference_brunson_funnels_frameworks.md` chunk 9+10)
 *   - Brunson chunk 17 — belief-rewrite via TRUMP story
 *   - 116-Funnels chunk 13a — confirmation-page FAQ video methodology
 *   - Hormozi proof-replaces-guarantees (`reference_hormozi_offer_design.md`)
 */

export type AuditFaqEntry = {
  /** Unique id for keys + analytics — stable across video re-records. */
  id: string;
  /** The objection statement as a hook. Brunson HSO hook altitude —
   *  pattern-interrupt phrasing, must read as "yes that's a real
   *  question" not as marketing copy. */
  question: string;
  /** Optional shorter hook for the collapsed card header (defaults to
   *  question when omitted). Used to keep the strip scannable on
   *  mobile. */
  shortLabel?: string;
  /** Loom / Mux / self-hosted MP4 URL. NULL until Ben records the
   *  video — the component falls back to the script transcript when
   *  null. */
  videoUrl: string | null;
  /** Read-aloud script — always rendered (under the video when video
   *  exists, in place of the video when null). The transcript IS the
   *  Brunson Story (35s) + Offer (15s). Hook lives in `question`. */
  transcript: string;
  /** One-line summary visible on the collapsed card — surfaces the
   *  belief-rewrite TRUMP without making the prospect expand the
   *  card. ~10-15 words. */
  beliefRewrite: string;
};

export const AUDIT_FAQ_ENTRIES: readonly AuditFaqEntry[] = [
  {
    id: "price-10k-website",
    question: "$10k for a website? That's insane.",
    shortLabel: "Is $10k just a website?",
    videoUrl: null,
    beliefRewrite:
      "The website is one of 21 modules — the AI System is the engine.",
    transcript:
      "Yeah — $10k for a website would be insane. But that's not what this is. " +
      "This is an AI System. The website is one of 21 modules. The math: 17 universal modules — " +
      "custom site + AI inbound responder + customer-portal backend + missed-call auto-texter + " +
      "review funnel + lead-scoring + content engine — each $2k-$5k standalone. " +
      "Manufacturers like Jake at ITC Quick Attach or Philip at Tekky get 4 bonus modules on top: " +
      "distributor portal, B2B quote system, custom-order intake, inventory sync. " +
      "That's ~$50k of value at $10k. " +
      "Most agencies sell you a $10k brochure. We sell you a $10k machine that keeps making your money back. " +
      "Click 'Schedule a call' below and I'll walk you through your specific 21-module stack. " +
      "15 minutes, no pitch — just the math.",
  },
  {
    id: "already-have-website",
    question: "I already have a website.",
    shortLabel: "I already have a website",
    videoUrl: null,
    beliefRewrite:
      "Your site is the brochure. The AI System is the layer that catches everyone it can't.",
    transcript:
      "If you already have a website, perfect — keep it. This isn't a website replacement. " +
      "Your website is the brochure. The AI System is everything that should be happening AROUND " +
      "your website that probably isn't right now. " +
      "When a visitor lands and doesn't convert — where do they go? Nowhere. " +
      "When they call after hours — what happens? Voicemail nobody checks. " +
      "When they fill out your contact form — who follows up in 2 minutes? Nobody. " +
      "When a five-star customer wants to leave a review — where do you send them? You don't. " +
      "The AI System is the layer that catches everyone your current site already touched but " +
      "couldn't capitalize on. It plugs into your existing site. " +
      "Schedule a call. I'll show you the backend tour — what the AI System looks like pointed " +
      "at your existing site — before you commit to anything.",
  },
  {
    id: "how-fast-roi",
    question: "How fast can I expect to make my money back?",
    shortLabel: "How fast does it pay back?",
    videoUrl: null,
    beliefRewrite:
      "Optimum Works went $2.5M → $3.6M in 12 months. Tekky's inbound doubled month 1.",
    transcript:
      "Fastest case I can point you at — Optimum Works went from $2.5M to $3.6M in 12 months. " +
      "44% revenue growth year-over-year, +41% profit. That's a documented case study, " +
      "not me promising you a number. Different industry, same mechanics. " +
      "For BlueJays specifically: Tekky paid $10,000 in February. " +
      "First month with the AI System running, their inbound inquiries doubled. " +
      "That's not a guarantee — guarantees are dead. That's a documented result. " +
      "The system either pays for itself in the first quarter, or it doesn't — and you'd " +
      "know within 90 days. If your business does $300k/yr, a 30% lift is $90k. " +
      "If you do $1M/yr, the math gets stupid fast. " +
      "Click 'Schedule a call.' First thing I'll do is run YOUR numbers — current revenue, " +
      "inbound, close rate — and math out what 30% looks like in your bank account.",
  },
  {
    id: "will-it-work-my-industry",
    question: "Will this even work in my industry?",
    shortLabel: "Will it work in my niche?",
    videoUrl: null,
    beliefRewrite:
      "Product manufacturers + authors + B2B — yes. Service businesses route to $997 instead.",
    transcript:
      "If you're a product manufacturer — yes. If you're a service business — maybe not, " +
      "and I'll tell you that straight on the call. " +
      "The AI System has a 3-anchor ICP: niche manufacturers, indie authors, B2B product companies. " +
      "ITC Quick Attach builds tractor accessories — works there. " +
      "Tekky / Zenith Sports does soccer training equipment — works there. " +
      "Bloodlines is a fantasy series by an indie author — works there. " +
      "Three radically different industries, same mechanics. " +
      "What it doesn't work for: pure local service — landscaping, HVAC, electricians. " +
      "Those get a $997 site instead. Different product, different price. " +
      "If you're in a service vertical, we'll route you to $997 on the call — no upsell pressure. " +
      "Schedule a call. First question I ask is 'what do you sell?' " +
      "Product → AI System. Service → $997. Either way you leave with a clear next step.",
  },
  {
    id: "why-trust-you",
    question: "Why should I trust you over an established agency?",
    shortLabel: "Why trust you over an agency?",
    videoUrl: null,
    beliefRewrite:
      "$10k in 30-60 days vs $40k in 6 months. See the live backend before you pay.",
    transcript:
      "Honestly? You probably shouldn't — if you can afford to wait 6 months and pay $40k. " +
      "Established agencies will charge you $25k-$50k, take 4-6 months, hand you a brochure site. " +
      "I know — I priced quotes from 4 of them before I started BlueJays. " +
      "What you get with me instead: $10k, live in 30-60 days, with a working AI System backend " +
      "you can actually SEE on a demo call BEFORE you pay. Not slides — the actual backend, " +
      "live, with real mock data, that becomes yours after purchase. " +
      "12 months ago I was a beginner dev who saw the pattern: small businesses getting " +
      "overcharged for underbuilt websites by agencies that treated them as side-clients. " +
      "I built BlueJays for the businesses agencies don't actually care about. " +
      "Tekky's running it. ITC signed for it. Hector's site is live. The work speaks. " +
      "If you want a 50-person agency — go get one. If you want it built right by someone " +
      "who'll actually answer the phone, schedule a call. Worst case you waste 15 minutes. " +
      "Best case you save $30k and 5 months of agency-onboarding hell.",
  },
];

/** How many of the 5 FAQ videos have been recorded.
 *  Used by the dashboard ship-gate row + by the FAQ component's
 *  "0 of 5 videos recorded so far" inline banner when in script-only
 *  mode. */
export function countRecordedFaqVideos(
  entries: readonly AuditFaqEntry[] = AUDIT_FAQ_ENTRIES,
): number {
  return entries.filter((e) => e.videoUrl !== null).length;
}
