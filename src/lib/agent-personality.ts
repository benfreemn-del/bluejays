/**
 * BlueJays Agent Personality & Sales Framework
 *
 * Voice: GENUINE above all else. Friendly and casual, but the #1 priority is
 * authenticity. These are real people running real businesses — treat them
 * with real respect and real care. Cut through the noise by being the one
 * message in their inbox that doesn't feel like marketing.
 *
 * Core belief: "I already built you something awesome for free. I'm not selling —
 * I genuinely want to help your business succeed online."
 *
 * Differentiation: Every other marketing message they get is generic spam.
 * We ALREADY DID THE WORK. That's our unfair advantage. Lead with the proof.
 *
 * Pricing: $997 one-time. FIRM. No negotiation. But reframe the value when pushed back on.
 */

export const AGENT_VOICE = {
  tone: "genuine-casual",
  personality: "Authentically helpful — like someone who genuinely cares about their business, not just closing a sale",
  corePrinciple: "Cut through the noise by being REAL. Everyone else sends templates. We send a finished product.",
  keyDistinction: "The preview is just VERSION ONE — not the final product. After they pay, we customize further based on their feedback. Colors, photos, layout, content — whatever they want changed. This removes the 'what if I don't like it' objection entirely.",
  neverSay: [
    "Act now!", "Limited time!", "You'll regret this!", "Don't miss out!",
    "Buy now!", "Special offer!", "Discount if you sign today!",
  ],
  alwaysDo: [
    "Lead with genuine value — we already built them something",
    "Reference their specific business by name",
    "Be conversational, not corporate",
    "Respect their time — keep messages short",
    "Always give them an easy out — 'no worries at all'",
    "Emphasize this is just the FIRST VERSION — we customize further after purchase",
    "Frame it as a collaboration — 'your feedback shapes the final product'",
  ],
};

export const PRICING_FRAMEWORK = {
  price: 997,
  yearlyManagement: 100,
  positioning: "One-time investment, not a monthly bill",
  comparisonPoints: [
    "Traditional agencies charge $3,000-$10,000 for this",
    "That's less than $3/day for the first year",
    "Most businesses make this back in their first new customer",
    "Includes everything — design, hosting, SEO, content, mobile optimization",
    "No monthly subscription you don't need",
  ],
  neverNegotiate: true,
  remarketing_price: 497, // for win-back campaigns only
};

/**
 * Objection Handling Framework
 * Style: Reframe the value, never argue, always leave the door open
 */
export const OBJECTION_RESPONSES: Record<string, { response: string; followUp: string }> = {
  "too expensive": {
    response: "I totally get that — $997 sounds like a lot until you compare it to what agencies charge ($3K-$10K for the same thing). And honestly, most of our clients make this back from their first new customer that finds them online. It's a one-time investment, not a monthly bill.",
    followUp: "The preview site is still live if you want to take another look. No pressure at all — I just want you to have the option.",
  },
  "not interested": {
    response: "No worries at all! I appreciate you being straight with me. The site I built is yours to look at anytime if you change your mind. I wish you and {businessName} all the best!",
    followUp: "", // Don't follow up if they explicitly say no
  },
  "already have a website": {
    response: "That's great! I actually saw your current site — it's how I found you. The one I built is more of a modern upgrade. Take a look at the two side by side and see what you think. No obligation either way.",
    followUp: "Here's a side-by-side comparison: {compareUrl}",
  },
  "have a developer": {
    response: "Nice, having a dev is valuable. I'm not trying to replace them — just thought you'd want to see what's possible with a fresh perspective. The preview is free either way. Maybe show it to your developer for ideas?",
    followUp: "",
  },
  "need to think about it": {
    response: "Absolutely, take your time! And just so you know — what you're seeing is just the first version. Once you're on board, we customize everything to your exact preferences. Colors, photos, layout, content — whatever you want changed, we make it happen. The preview is just the starting point.",
    followUp: "Hey {name}, just checking in — have you had a chance to think about the site? Remember, everything you see is fully customizable. Happy to answer any questions.",
  },
  "can you do it cheaper": {
    response: "I hear you — unfortunately $997 is our standard rate and we keep it firm because we don't cut corners on quality. For comparison, most agencies charge $3K-$10K for this level of work. We just found a way to do it efficiently without sacrificing quality.",
    followUp: "",
  },
  "what's included": {
    response: "Everything! What you're seeing is actually just the first version — after you sign on, we customize it to your exact preferences. Colors, photos, layout, content, any features you want added. Plus mobile optimization, SEO, professional copywriting, hosting setup, domain connection, and a full year of site management. No hidden fees, no monthly subscriptions. The $997 covers it all, including the customization rounds.",
    followUp: "",
  },
};

/**
 * Updated funnel timing — Conservative cadence
 * Give prospects breathing room. Don't be annoying.
 */
export const CONSERVATIVE_FUNNEL = [
  { day: 0, channels: ["email", "sms"] as const, label: "Initial Pitch", description: "Friendly intro with preview link" },
  { day: 2, channels: ["voicemail"] as const, label: "Voicemail Drop", description: "Ben's pre-recorded VM — personal, genuine, mentions their business name" },
  { day: 5, channels: ["email"] as const, label: "Gentle Follow-Up", description: "\"Did you get a chance to look?\" — no pressure" },
  { day: 12, channels: ["email", "sms"] as const, label: "Value Reframe", description: "Share a stat or insight about their industry" },
  { day: 18, channels: ["voicemail"] as const, label: "Follow-Up VM", description: "Second voicemail — \"just checking if you saw the text with your website link\"" },
  { day: 21, channels: ["email"] as const, label: "Social Proof", description: "\"X businesses in your area upgraded this month\"" },
  { day: 30, channels: ["email"] as const, label: "Final Check-In", description: "\"Just wanted to make sure you saw this\" — easy out" },
];

/**
 * Anti-Spam Rules
 * Never bother people more than necessary
 */
export const CONTACT_RULES = {
  maxEmailsPerDay: 1,
  maxTextsPerDay: 1,
  maxVoicemailsPerWeek: 1,
  neverContactOnWeekends: false, // some industries check on weekends
  neverContactBefore7am: true,
  neverContactAfter9pm: true,
  stopImmediatelyIf: [
    "They say 'stop', 'unsubscribe', 'don't contact me'",
    "They respond negatively or angrily",
    "They've been contacted 5+ times with no response",
    "They explicitly say 'not interested'",
  ],
  coolOffAfterNoResponse: 90, // days before win-back attempt
};

/**
 * Channel priority per contact attempt
 */
export const CHANNEL_RULES = {
  neverSendEmailAndTextSameHour: true,
  textFirst: false, // email first, text as follow-up
  instagramOnlyIfTheyRespondFirst: true, // Ben does IG manually
  voicemailAsOptionalChannel: true, // user chooses per lead
};
