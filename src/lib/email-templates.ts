import type { Prospect } from "./types";
import { CATEGORY_CONFIG } from "./types";
import { getShortPreviewUrl } from "./short-urls";

export interface EmailTemplate {
  subject: string;
  body: string;           // text/plain version — fallback for HTML-off clients
  htmlBody?: string;      // multipart HTML version with inline screenshot
  sequence: number;
}

/**
 * thum.io live-screenshot URL for a prospect's preview page. Same endpoint
 * used for the per-prospect OG metadata; embedding it inline in the HTML
 * email body turns the "here's a link" moment into a "here's a picture of
 * YOUR site" moment. Thum caches captures for ~24h after first hit, so the
 * OG scraper warm-up from when the prospect enrolled means the image
 * usually loads instantly when they open the email.
 *
 * Kept in one place so every email template references the same capture.
 */
export function getPreviewScreenshotUrl(prospectId: string): string {
  const base = "https://bluejayportfolio.com";
  const target = `${base}/preview/${prospectId}?embed=1`;
  return `https://image.thum.io/get/width/1200/crop/630/fullpage/noanimate/wait/5/png/${target}`;
}

/**
 * Build the shared HTML email chrome around a body block. Keeps styling
 * deliberately minimal so Gmail's Promotions-tab classifier doesn't trip —
 * no tables, no custom fonts, no inline-CSS-heavy marketing layouts. Just
 * personal-looking formatting with ONE hero image (the prospect's own site
 * screenshot) so the email still looks hand-crafted to the recipient.
 */
function wrapEmailHtml(innerHtml: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Preview</title></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;line-height:1.5;">
  <div style="max-width:560px;margin:0 auto;padding:16px 20px;font-size:15px;">
    ${innerHtml}
  </div>
</body></html>`;
}

/** Escape string for safe HTML interpolation. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * CAN-SPAM compliant email footer.
 * Appended to every outbound email in the funnel.
 */
// Minimal CAN-SPAM-compliant footer designed for Gmail Primary placement.
// Previously: 3-line block with brand-name header, "you're receiving this
// because we built..." explanation, and a verbose "Unsubscribe:" label.
// All of those are classic Gmail Promotions-tab signals (bulk-marketing
// flavor). This minimal version keeps CAN-SPAM compliance (physical
// address + one-click opt-out) via the List-Unsubscribe header on the
// SendGrid payload, and surfaces only a short in-body line — Washington,
// USA for the physical address requirement plus a plain-text opt-out
// link. The Unsubscribe header is where Gmail's native opt-out UI
// pulls its data from, so the in-body link is belt-and-suspenders.
export const EMAIL_FOOTER = `Quilcene, WA · Opt out: {{baseUrl}}/unsubscribe/{{prospectId}}`;

function buildVideoBlock(videoUrl?: string) {
  if (!videoUrl) return "";

  return `
I also recorded a quick personalized walkthrough of the site so you can see the full vision in under 90 seconds:

${videoUrl}
`;
}

/**
 * Resolve the greeting name for a prospect. Returns the first name when we
 * have a real owner name on file, otherwise a neutral "there" fallback so
 * we never generate subject lines like:
 *   "Merit Construction, I made something for Merit Construction"
 * or body greetings like "Hi Merit Construction,". Single-letter or empty
 * first names also fall through to the fallback.
 *
 * `hasName` lets callers branch subject-line templates so they can drop
 * the name prefix entirely when we don't have a real person to address.
 */
function getGreetingName(prospect: Prospect): { greeting: string; hasName: boolean } {
  const firstName = prospect.ownerName?.trim().split(/\s+/)[0];
  if (firstName && firstName.length > 1 && firstName.toLowerCase() !== prospect.businessName.toLowerCase()) {
    return { greeting: firstName, hasName: true };
  }
  return { greeting: "there", hasName: false };
}

/**
 * "Your 4.8⭐ with 62 reviews stood out" — skipped when we don't have the data.
 */
function buildRatingBlurb(prospect: Prospect): string {
  if (prospect.googleRating && prospect.reviewCount && prospect.reviewCount >= 5) {
    return ` Your ${prospect.googleRating}-star rating with ${prospect.reviewCount} reviews is exactly the kind of reputation a strong website should be matching.`;
  }
  return "";
}

/**
 * Effort-investment hook — one of the most important rules in the template.
 *
 * Every pitch email MUST include a specific reference to Ben personally
 * investing time in THIS prospect's site. This is the reciprocity trigger:
 * when someone tells you they worked hours specifically for you, you feel
 * a pull to at least look at what they made. It separates BlueJays from
 * mass-marketing "you need a website!" spam.
 *
 * We rotate across several natural phrasings so that 20 pitches sent on
 * the same day don't have an identical-body fingerprint that Gmail can
 * pattern-match across the batch. Deterministic selection by prospect.id
 * means the same prospect always gets the same phrasing if they receive
 * multiple sends over time (consistency).
 *
 * See CLAUDE.md "Outreach Email Template Rules" for the full rationale.
 */
const EFFORT_PHRASES = [
  "I spent a few hours this week putting together what a new website for you could look like",
  "Worked on this for a chunk of the afternoon yesterday — a website concept for you",
  "Put together a rough version of what your website could look like over the weekend",
  "Spent part of the morning building out a website concept for you",
  "Threw together a website for you last night",
  "Worked on this a few hours this week — a website draft for you",
  "Built this out over the weekend — a website concept for you",
  "Spent a couple hours on this recently — a website draft for you",
];

function pickEffortPhrase(prospectId: string): string {
  // Deterministic hash: same prospect id → same phrase every time.
  let hash = 0;
  for (let i = 0; i < prospectId.length; i++) {
    hash = (hash * 31 + prospectId.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % EFFORT_PHRASES.length;
  return EFFORT_PHRASES[index];
}

/**
 * Pulls the first service name from scrapedData when available so follow-ups
 * can reference a specific offering (e.g., "emergency repair", "kitchen remodels").
 */
function getTopService(prospect: Prospect): string | undefined {
  const services = prospect.scrapedData?.services;
  if (!services || services.length === 0) return undefined;
  const name = services[0]?.name;
  return name && name.length > 2 && name.length < 40 ? name.toLowerCase() : undefined;
}

/**
 * Day 0 pitch email — optimized for Gmail Primary-tab placement.
 *
 * Rewritten 2026-04-19 after discovering that the previous version was
 * being silently quarantined by Gmail / bucket-filtered into Promotions
 * due to commercial trigger fingerprints:
 *   - Multiple CTA links (preview + portfolio + calendly)
 *   - Pricing language in the body ($997, 3 payments of $349)
 *   - "Book a walkthrough" / "no pressure" / "limited time" cadence
 *   - Long body (>250 words)
 *
 * New strategy: email is a soft "hey I built you this thing" nudge. All
 * pricing and CTAs live on the claim page, which the prospect reaches by
 * clicking the one preview link. The email itself reads like a personal
 * note from one person to another.
 *
 * Design principles:
 *   - Under 80 words in the body
 *   - ONE link only (the preview)
 *   - Zero pricing language
 *   - Zero calendly / booking language
 *   - Question at the end that invites a soft reply
 *   - Casual sign-off, no title
 */
export function getPitchEmail(
  prospect: Prospect,
  previewUrl: string = getShortPreviewUrl(prospect),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _videoUrl?: string,
): EmailTemplate {
  const { greeting, hasName } = getGreetingName(prospect);
  const category = CATEGORY_CONFIG[prospect.category].label.toLowerCase();
  const city = prospect.city || prospect.address?.split(",")[0] || "";

  const subject = hasName
    ? `${greeting}, made something for ${prospect.businessName}`
    : `Made something for ${prospect.businessName}`;

  // --- Psychology stack baked into the body ---
  //
  // 1. Discovery (specificity)   — "I was looking at X in Y and came across
  //                                 {business}" — feels like a real person
  //                                 doing real research, not a mass blast
  // 2. Validation (identity)     — "Your 5★ / 23 reviews stood out" —
  //                                 rewards the reader's ego for work already
  //                                 done, primes them to feel seen
  // 3. Reciprocity (effort)      — "{effort phrase}" from EFFORT_PHRASES —
  //                                 signals Ben personally invested time
  //                                 specifically for THEM. Hook #1 for
  //                                 reply rate per cold-email research
  // 4. Humility (disarm + gap)   — "No idea if it's what you had in mind"
  //                                 — lowers perceived sales-threat AND
  //                                 implies they have standards/taste that
  //                                 their current site might not match
  // 5. Curiosity (soft reply)    — "Curious what you'd change" — invites
  //                                 conversation without asking for a call
  //
  // See CLAUDE.md "Outreach Email Template Rules" for rationale.
  const discoveryLine = city
    ? `I was looking at ${category} businesses in ${city} and came across ${prospect.businessName}.`
    : `I came across ${prospect.businessName} while looking at ${category} businesses in your area.`;

  const ratingLine =
    prospect.googleRating && prospect.reviewCount && prospect.reviewCount >= 5
      ? ` Your ${prospect.googleRating}★ across ${prospect.reviewCount} reviews stood out.`
      : "";

  const effortPhrase = pickEffortPhrase(prospect.id);

  const body = `Hi ${greeting},

${discoveryLine}${ratingLine}

${effortPhrase} — uses your actual services, photos, and contact info:

${previewUrl}

No idea if it's what you had in mind, but figured you'd want to see it. Curious what you'd change.

— Ben
bluejaycontactme@gmail.com
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com").replace("{{prospectId}}", prospect.id)}`;

  // HTML version — identical copy but with the prospect's live preview
  // screenshot embedded inline as a clickable image.
  //
  // DELIVERABILITY GATE: the HTML body is only generated when the
  // `ENABLE_HTML_PITCH_EMAIL` env var is set to "true". Reason: a 2026-04-20
  // live A/B test sent from a freshly-warmed domain (ben@bluejayportfolio.com,
  // Day 5 of 14-day ramp) to a brand-new Gmail inbox landed in SPAM when
  // the email was multipart HTML+text with an inline image — the same
  // content landed in Primary when sent as plain-text only. Per CLAUDE.md
  // Outreach Email Template Rules, plain-text Primary-tab placement is
  // non-negotiable during warmup. Turn this flag ON only after Day 14
  // (fully warmed) when the domain has established reputation and one
  // inline image no longer trips Gmail's classifier.
  const enableHtmlPitch = process.env.ENABLE_HTML_PITCH_EMAIL === "true";
  const screenshotUrl = enableHtmlPitch ? getPreviewScreenshotUrl(prospect.id) : "";

  // HTML body only built when the deliverability gate opens (post-warmup).
  // During warmup, returning `undefined` here means sendViaSendGrid ships
  // as single-part text/plain only — Primary-tab compatible.
  const htmlBody = enableHtmlPitch
    ? wrapEmailHtml(`
    <p style="margin:0 0 16px;">Hi ${esc(greeting)},</p>
    <p style="margin:0 0 16px;">${esc(discoveryLine)}${ratingLine ? " " + esc(ratingLine.trim()) : ""}</p>
    <p style="margin:0 0 16px;">${esc(effortPhrase)} — uses your actual services, photos, and contact info:</p>
    <p style="margin:0 0 16px;">
      <a href="${esc(previewUrl)}" style="text-decoration:none;display:block;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <img src="${esc(screenshotUrl)}" alt="${esc(prospect.businessName)} — website preview" width="520" style="display:block;width:100%;max-width:520px;height:auto;border:0;" />
      </a>
    </p>
    <p style="margin:0 0 16px;"><a href="${esc(previewUrl)}" style="color:#2563eb;">${esc(previewUrl)}</a></p>
    <p style="margin:0 0 16px;">No idea if it's what you had in mind, but figured you'd want to see it. Curious what you'd change.</p>
    <p style="margin:0 0 4px;">— Ben</p>
    <p style="margin:0 0 16px;"><a href="mailto:bluejaycontactme@gmail.com" style="color:#6b7280;">bluejaycontactme@gmail.com</a></p>
    <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.4;">
      Quilcene, WA · <a href="${esc(process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com")}/unsubscribe/${esc(prospect.id)}" style="color:#9ca3af;">Opt out</a>
    </p>
  `)
    : undefined;

  return { subject, body, htmlBody, sequence: 1 };
}

/**
 * Day 5 follow-up — short nudge, one link, no pricing language.
 * Same Primary-tab principles as the pitch: short, personal, soft ask.
 */
export function getFollowUp1(
  prospect: Prospect,
  previewUrl: string = getShortPreviewUrl(prospect),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _videoUrl?: string,
): EmailTemplate {
  const { greeting } = getGreetingName(prospect);

  const subject = `Re: ${prospect.businessName}`;

  return {
    subject,
    body: `Hi ${greeting},

Wanted to circle back — sent you a link earlier to a site I built for ${prospect.businessName}. Didn't hear back so figured it got buried.

Here it is again if you missed it: ${previewUrl}

Even if the timing isn't right, I'd genuinely love to hear what you'd change about it.

— Ben
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com").replace("{{prospectId}}", prospect.id)}`,
    sequence: 2,
  };
}

/**
 * Post-purchase welcome email — fires from the Stripe webhook immediately
 * after `checkout.session.completed`. Confirms the payment and sends the
 * prospect to the onboarding form at `/onboarding/[id]` so Ben has their
 * real content (logo, brand colors, services, photos, etc.) within minutes.
 *
 * This email is idempotent via `prospects.welcome_email_sent_at` — the
 * webhook checks that column before sending to avoid double-sending on
 * Stripe retries.
 */
export function getWelcomeEmail(prospect: Prospect): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const baseUrl = "https://bluejayportfolio.com";
  const onboardingUrl = `${baseUrl}/onboarding/${prospect.id}`;

  const subject = `Welcome to BlueJays — here's what happens next, ${name}`;

  const body = `Hi ${name},

Thanks for trusting me with ${prospect.businessName}'s website — I'm genuinely excited to build this out for you.

Here's exactly what happens from here:

1. You fill out a quick onboarding form (10 min)
   ${onboardingUrl}

   This is where you give me the real content — your logo, brand colors, services, hours, photos, testimonials, and any specific requests. Everything you share here makes your final site feel like YOUR site, not a template.

2. I customize your site (24-48 hours)
   The preview you saw is V1 — I take it from there and plug in your real photos, content, and any custom features you requested.

3. Domain + hosting setup (same day as approval)
   Once you approve the final version, I register your domain and point it at the live site. Your $997 covers all of that — no surprise fees.

4. Site goes live
   I'll email you the login details and a short walkthrough video so you know exactly how everything works.

The faster you fill out the onboarding form, the faster your site goes live. Most clients knock it out in under 15 minutes.

Start onboarding: ${onboardingUrl}

If you have any questions along the way, just reply to this email — it comes straight to me.

— Ben @ BlueJays
ben@bluejayportfolio.com

—
BlueJays Business Solutions | Washington, USA
You're receiving this because you purchased a website from BlueJays.`;

  return { subject, body, sequence: 100 };
}

/**
 * 30-minute onboarding reminder — fires from the reminder cron
 * (`/api/onboarding-reminders/process`) when a paid prospect hasn't
 * submitted the onboarding form within 30 minutes of payment.
 *
 * Idempotent via `prospects.onboarding_reminder_sent_at` — only fires once.
 */
export function getOnboardingReminderEmail(prospect: Prospect): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const baseUrl = "https://bluejayportfolio.com";
  const onboardingUrl = `${baseUrl}/onboarding/${prospect.id}`;

  const subject = `${name}, just need a few details to start building your site`;

  const body = `Hi ${name},

Saw you grabbed ${prospect.businessName}'s website earlier today — thanks again!

I'm ready to start customizing, but I need your onboarding form first so I can plug in your real logo, colors, services, and photos. Takes about 10 minutes:

${onboardingUrl}

The main things I need:
  • Your logo (if you have one — if not I'll handle it)
  • Your brand colors
  • A list of your services
  • Any photos you want featured
  • Your preferred domain name
  • Anything specific you want on the site

Once I have all of that, I'll have your finished site ready within 24-48 hours.

If something came up or you're stuck on a question, just reply to this email and I'll help.

— Ben @ BlueJays
ben@bluejayportfolio.com

—
BlueJays Business Solutions | Washington, USA
You're receiving this because you purchased a website from BlueJays.`;

  return { subject, body, sequence: 101 };
}

/**
 * Day 12 "value reframe" — last outreach in the active sequence.
 * Slightly more direct ask but still no pricing language in the body.
 */
export function getFollowUp2(
  prospect: Prospect,
  previewUrl: string = getShortPreviewUrl(prospect),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _videoUrl?: string,
): EmailTemplate {
  const { greeting } = getGreetingName(prospect);

  const subject = `Last check on ${prospect.businessName}`;

  return {
    subject,
    body: `Hi ${greeting},

One last nudge — the site I built for ${prospect.businessName} is still live if you want another look:

${previewUrl}

If it's not a fit right now, totally fine. Just reply and let me know and I'll stop reaching out.

Either way — thanks for being one of the ones I spent time on.

— Ben
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com").replace("{{prospectId}}", prospect.id)}`,
    sequence: 3,
  };
}
