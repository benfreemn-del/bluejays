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
 * Pricing: $997 one-time for custom website design, domain registration, and hosting setup. $100/year maintenance covers domain renewal, hosting, ongoing maintenance, and support. FIRM. No negotiation. But reframe the value when pushed back on.
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
  paymentPlan: { installments: 3, amount: 349 },
  positioning: "$997 one-time, done — design, domain, and hosting included. Then $100/year for maintenance after year one.",
  comparisonPoints: [
    "Traditional agencies charge $3,000-$10,000 for this",
    "That's less than $3/day for the first year",
    "Most businesses make this back in their first new customer",
    "$997 one-time includes custom website design, domain registration, and hosting setup",
    "$100/year maintenance covers domain renewal, hosting, ongoing maintenance, and support",
    "Payment plan available: 3 payments of $349",
  ],
  neverNegotiate: true,
  remarketing_price: 497, // for win-back campaigns only
  urgencyOptions: [
    "Your preview stays live for 30 days",
    "2 other businesses in your area claimed theirs this week",
    "We only take on a handful of {category} clients per month",
  ],
};

/**
 * Objection Handling Framework
 * Style: Reframe the value, never argue, always leave the door open.
 * Rules: 2 sentences max for SMS, 3 for email. Vary openers. End with a re-engaging question.
 * Payment plan: 3 payments of $349 — mention on every price-related objection.
 * Portfolio: https://bluejayportfolio.com/v2/{category}
 */
export const OBJECTION_RESPONSES: Record<string, { response: string; followUp: string }> = {
  "too expensive": {
    response: "$997 one-time, done — that includes design, domain, and hosting, versus $3K-$10K at an agency. We also offer 3 payments of $349 if that's easier.",
    followUp: "How much is one new customer worth to {businessName}? Most businesses make the $997 back from their first lead off the new site.",
  },
  "not interested": {
    response: "Appreciate you being straight with me — no hard feelings at all. The site I built is yours to look at anytime if anything changes. Wishing {businessName} all the best!",
    followUp: "", // Don't follow up if they explicitly say no
  },
  "already have a website": {
    response: "I actually designed yours as an upgrade to your current site — same branding, just more modern and mobile-friendly. Compare them side by side on the claim page and see which one you'd rather send customers to.",
    followUp: "Have you had a chance to look at both side by side? Here's the direct comparison: {compareUrl}",
  },
  "have a developer": {
    response: "That's solid — not trying to step on anyone's toes. The preview is free either way, and it might give your dev some fresh ideas for the next update.",
    followUp: "Did your developer get a chance to look at the preview? Would love to hear what they think.",
  },
  "need to think about it": {
    response: "Of course — what you're seeing is just version one, and we customize everything after purchase. Your preview stays live for 30 days.",
    followUp: "What's the main thing you're weighing? Happy to answer specifics so you're not guessing.",
  },
  "bad timing": {
    response: "Totally fair — when would be a better time to revisit this? Your preview stays live for 30 days so there's no rush.",
    followUp: "Hey {name}, just circling back — is now a better time to take another look at the site we built for {businessName}?",
  },
  "can you do it cheaper": {
    response: "$997 is firm because we don't cut corners — design, domain, and hosting are all included. That said, we do offer 3 payments of $349 if spreading it out helps.",
    followUp: "Would the payment plan make it easier to move forward? Most businesses recoup the cost from their first new customer.",
  },
  "what's included": {
    response: "The $997 one-time fee covers custom website design, domain registration, and hosting setup. After year one, $100/year handles domain renewal, hosting, maintenance, and support — and what you're seeing now is just version one. We customize everything to your preferences after purchase.",
    followUp: "Any specific features you're looking for? Everything on the preview is fully customizable.",
  },
  "show me your work": {
    response: "Absolutely — check out our full portfolio at bluejayportfolio.com. We've built sites for 30+ industries, and yours was custom-designed specifically for {businessName}.",
    followUp: "Did you get a chance to browse the portfolio? Here's the direct link for your industry: https://bluejayportfolio.com/v2/{category}",
  },
  "is this legit": {
    response: "Great question — BlueJays is a web design studio that builds premium websites for local businesses. See our full portfolio at bluejayportfolio.com, and the site we built for {businessName} is already live at your preview link.",
    followUp: "Want me to send over a few examples of other {category} businesses we've built for? Happy to show the work.",
  },
  "can i pay monthly": {
    response: "We offer 3 payments of $349 — that gets you the full site with design, domain, and hosting included. After year one, maintenance is just $100/year.",
    followUp: "Would the 3-payment option work for you? I can send the checkout link set up that way.",
  },
  "need to talk to partner": {
    response: "Makes total sense — big decisions deserve a second opinion. Your preview stays live for 30 days, so there's time, but 2 other businesses in your area claimed theirs this week.",
    followUp: "Were you and your partner able to take a look together? Happy to hop on a quick call if either of you has questions.",
  },
  "can you redesign my current site": {
    response: "That's actually exactly what we did — the preview is a modern rebuild of your current site with your branding, services, and content. After purchase we customize further based on your feedback.",
    followUp: "What would you want changed from what you see in the preview? Everything is adjustable — colors, photos, layout, content.",
  },
  "preview doesnt look good": {
    response: "Fair feedback — the preview is version one, built from what we could find online. After purchase, we do a full customization round with your real photos, exact colors, and whatever layout changes you want.",
    followUp: "What specifically would you want different? We adjust colors, photos, layout, and copy — your feedback shapes the final product.",
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
 * Voicemail Scripts — Ben's pre-recorded drops
 * Keep under 30 seconds. Mention business name. End with a reason to check the text.
 */
export const VOICEMAIL_SCRIPTS = {
  day2: `Hey {name}, this is Ben from BlueJays. I sent over a website I custom-built for {businessName} — just wanted to make sure you saw it. Take a look at the link I texted you and let me know what you think. No pressure at all, talk soon.`,
  day18: `Hey {name}, Ben again from BlueJays. Just checking if you got a chance to look at the site I built for {businessName}. Your preview is still live, but it won't be up forever — if you have any questions just shoot me a text back. Hope business is going well!`,
};

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

/**
 * Decision Framework: ALWAYS push for a Zoom/call with Ben.
 * The ultimate goal of every conversation is scheduling a call where
 * Ben walks them through the vision, plan, and closes the sale live.
 *
 * The agent's job is to warm them up and get them on the calendar — NOT to close.
 */
export const CLOSE_DECISION_FRAMEWORK = {
  /** The ONE goal: schedule a call with Ben */
  primaryGoal: "Schedule a Zoom/phone call with Ben to walk through the site, discuss customization, and close",

  /** When to push the calendar link */
  pushCalendar: [
    "Any time prospect shows interest — even mild curiosity",
    "After answering a question — 'Want to hop on a quick call so I can show you in real time?'",
    "After addressing an objection — 'Might be easier to chat about this on a call?'",
    "When prospect asks about pricing — 'Let me walk you through everything on a quick Zoom'",
    "When prospect asks how to get started — 'Let's set up a quick call and I'll handle everything'",
    "When prospect says they love it — 'Awesome! Let's hop on a call and I'll walk you through next steps'",
  ],

  /** How to frame the call */
  callFraming: [
    "It's a quick 15-minute walkthrough — no pressure, no commitment",
    "I'll show you the site live, walk through customization options, and answer any questions",
    "Most business owners find it helpful to see everything in action before deciding",
    "We can go through your specific needs and I'll show you exactly what the finished site will look like",
  ],

  /** ONLY send checkout link if prospect explicitly says 'I want to buy right now' */
  directCloseOnly: [
    "Prospect literally says 'I want to buy', 'take my money', 'let's do it', 'send me the link'",
    "Prospect has already been on a call with Ben and is following up to pay",
  ],

  /** Calendar/booking link — agent should include this in interested responses */
  bookingUrl: "https://calendly.com/bluejaycontactme/website-walkthrough",

  /** All categories push for call — no exceptions */
  allCategoriesPushCall: true,
};

/**
 * Escalation Rules: When to hand off to Ben.
 * Based on the sales strategy playbook Part 5.
 */
export const ESCALATION_RULES = {
  /** Immediate escalation (same day) — Ben needs to act NOW */
  immediate: [
    "Prospect expresses purchase intent but has questions agent cannot answer",
    "Prospect is angry or situation is escalating",
    "Prospect requests to speak with a human directly",
    "AI responder returns a low-confidence classification",
  ],
  /** Next-day escalation — flag for Ben's review */
  nextDay: [
    "Prospect has responded positively multiple times but hasn't converted after 3+ exchanges",
    "Prospect is asking about custom work or enterprise-level features",
    "Prospect is a high-value category and has shown interest",
  ],
  /** The handoff message template */
  handoffScript: "I'm going to have Ben reach out to you directly — he's the founder and can answer everything in detail. You'll hear from him within {timeframe}. In the meantime, your preview is still live at {previewUrl}.",
};

/**
 * Intent-to-CRM-Status Mapping
 * Maps the 6 prospect intent categories to their proper CRM status transitions.
 * Based on the sales strategy playbook Part 2.
 */
export const INTENT_STATUS_MAP: Record<string, string> = {
  interested: "interested",
  question: "responded",
  objection: "responded",
  not_interested: "dismissed",
  angry: "unsubscribed",
  unsubscribe: "unsubscribed",
  neutral: "responded",
  custom_request: "interested",
  unknown: "responded", // escalate to Ben for review
};

/**
 * Ben's 15-Minute Zoom Call Script
 * Goal: Walk through the preview live, handle objections, close or set a follow-up date.
 * Never end a call without a specific next step.
 */
export const ZOOM_CALL_SCRIPT = {
  open: `"Hey [name], thanks for jumping on — I'll keep this to 15 minutes, I know you're busy. Quick question before I share my screen — have you had a chance to click around the preview I sent, or is this your first real look at it?"`,

  screenShare: `Pull up their preview URL. Walk top to bottom.
Call out specific details:
- "I pulled your actual services from your Google profile — see these cards here?"
- "That's your real rating and review count up top."
- "The color scheme — I matched that to your existing branding."
Let them react. Silence is fine. Most owners just need a moment to process someone actually built this for them.`,

  keyLine: `"What you're seeing is version one — built from what's publicly available online. After you claim it, we do a full customization round. Real photos, your colors, whatever you want changed — layout, copy, all of it. This is the starting point, not the finish line."`,

  openingQuestion: `"What's your gut reaction? What would you want different?"
(Write down what they say — their answer means they're mentally making it theirs.)`,

  objections: {
    price: `"$997 one-time — that covers design, domain registration, and hosting setup. After year one it's $100/year maintenance. We also do 3 payments of $349 if you'd rather spread it out."`,
    alreadyHaveWebsite: `"I know — I looked at it before I built this. This is designed as an upgrade, not a replacement. Same branding, just more modern. Take a look at both side by side — which one would you rather send a customer to?"`,
    needToThink: `"Totally fair. What's the main thing you're weighing? I'd rather answer it now while we're both here than have you guess at it later."`,
    tooExpensive: `"$997 is firm — design, domain, and hosting is a real cost. But the 3-payment option makes it $349 today. Most businesses make that back off their first new customer."`,
  },

  close: `"So here's where we're at — I've already done the work, the site is built and live. The next step is just claiming it. Do you want to move forward today, or is there something specific holding you back I can help you work through?"

If yes: "Perfect — I'll send you the claim link right now, takes about 5 minutes. Once you're in, we'll schedule the customization call and get your real photos and any changes done."

If not yet: "No problem — what's the timeline looking like? I want to make sure I hold your preview and don't move on to someone else in [city]."`,

  neverEndWithoutADate: `Always close with a specific next step. Never "think about it."
Example: "Let's touch base Thursday — does that work?"`,
};
