import type { Prospect } from "./types";
import { CATEGORY_CONFIG } from "./types";
import { getShortPreviewUrl, getShortUnsubUrl } from "./short-urls";

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
export const EMAIL_FOOTER = `Quilcene, WA · Opt out: {{unsubUrl}}`;

/**
 * Deterministic A/B variant assignment — same prospect always gets the same variant.
 * Uses a simple hash of the prospect ID. Variant "A" ≈ 50%, variant "B" ≈ 50%.
 * Kept for the ab-report API which tracks open/click rates per variant.
 */
export function getSubjectVariant(prospectId: string): "A" | "B" {
  let hash = 0;
  for (let i = 0; i < prospectId.length; i++) {
    hash = (hash * 31 + prospectId.charCodeAt(i)) >>> 0;
  }
  return hash % 2 === 0 ? "A" : "B";
}

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
${EMAIL_FOOTER.replace("{{unsubUrl}}", getShortUnsubUrl(prospect))}`;

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
      Quilcene, WA · <a href="${esc(getShortUnsubUrl(prospect))}" style="color:#9ca3af;">Opt out</a>
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
${EMAIL_FOOTER.replace("{{unsubUrl}}", getShortUnsubUrl(prospect))}`,
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
${EMAIL_FOOTER.replace("{{unsubUrl}}", getShortUnsubUrl(prospect))}`,
    sequence: 3,
  };
}

const BASE = "https://bluejayportfolio.com";
const CONTACT_EMAIL = process.env.FROM_EMAIL || "ben@bluejayportfolio.com";
const BEN_PHONE = process.env.BEN_PHONE || "(253) 886-3753";

export function getReferralEmail(
  prospect: Prospect,
  referralCode: string,
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || prospect.businessName;
  const referralUrl = `${BASE}?ref=${referralCode}`;

  return {
    subject: `${name} — a quick thank-you and something for your network`,
    body: `Hi ${name},

It's been about a month since ${prospect.businessName} went live — hope customers are already finding you online.

If you know any other local business owners who could use a premium website, share your personal link:

${referralUrl}

Every business that claims a site through your link earns you $50 off your next annual renewal.

Thanks for trusting us with ${prospect.businessName}'s online presence.

— Ben
${CONTACT_EMAIL}`,
    sequence: 0,
  };
}

export function getHandoffEmail(
  prospect: Prospect,
  liveUrl: string,
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || prospect.businessName;

  return {
    subject: `${prospect.businessName} is live — here's everything you need`,
    body: `Hi ${name},

Your website is live. Bookmark this email — it's your complete reference going forward.

Your site: ${liveUrl}


What's covered at $100/year
---
  - Domain renewal
  - Hosting (your site stays up, always)
  - Maintenance and security updates
  - Support — reply to this email anytime
  - Minor content updates (hours, phone, services, photos)


How to request a change
---
Reply to this email with what you want updated. Most updates are done within 48 hours.

Or upload materials anytime at: ${BASE}/onboarding/${prospect.id}


Questions?
---
Reply here, email ${CONTACT_EMAIL}, or call/text ${BEN_PHONE}

Congratulations, ${name}. Your work deserves to be found — and now it will be.

— Ben @ BlueJays`,
    sequence: 0,
  };
}

/**
 * Stripe Customer Portal URL — set this env var to a configured portal
 * (https://dashboard.stripe.com/settings/billing/portal). When unset, all
 * customer-facing billing CTAs fall back to a mailto so we never ship a
 * dead link in production.
 *
 * NOTE: Document `STRIPE_CUSTOMER_PORTAL_URL` in CLAUDE.md before pointing
 * the dunning emails at production.
 */
export function getBillingPortalUrl(): string {
  const url = process.env.STRIPE_CUSTOMER_PORTAL_URL;
  if (url && /^https?:\/\//.test(url)) return url;
  return "mailto:bluejaycontactme@gmail.com?subject=Update+my+card";
}

/**
 * 30-day pre-renewal email. Friendly heads-up before the $100/yr mgmt
 * subscription auto-charges. Locked CLAUDE.md outreach rules: ≤80 words
 * body, exactly 1 link (Stripe portal OR fallback mailto), zero pricing
 * objection language in the body.
 */
export function getRenewal30DayEmail(
  prospect: Prospect,
  chargeDateIso?: string,
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const portalUrl = getBillingPortalUrl();
  const dateStr = chargeDateIso
    ? new Date(chargeDateIso).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })
    : "in about a month";

  const subject = `${prospect.businessName} — quick heads up about your renewal`;

  // Body: <80 words, one link, zero pricing arguments / objections.
  const body = `Hi ${name},

Quick heads up — ${prospect.businessName}'s annual renewal is coming up on ${dateStr}. It covers domain renewal, hosting, and ongoing maintenance.

If your card on file has changed in the last year, you can update it here:

${portalUrl}

Want me to add anything to the site while we're at it? Just reply.

— Ben @ BlueJays`;

  return { subject, body, sequence: 200 };
}

/**
 * 7-day pre-renewal email. More urgent header, same single CTA. Locked
 * outreach rules: ≤80 words body, exactly 1 link.
 */
export function getRenewal7DayEmail(
  prospect: Prospect,
  chargeDateIso?: string,
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const portalUrl = getBillingPortalUrl();
  const dateStr = chargeDateIso
    ? new Date(chargeDateIso).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })
    : "next week";

  const subject = `${prospect.businessName} — your renewal hits ${dateStr}`;

  const body = `Hi ${name},

Final reminder — ${prospect.businessName}'s renewal charges on ${dateStr}. Make sure your card on file is current so the site stays online without a hiccup:

${portalUrl}

If anything's wrong or you want to update before the charge, reply and I'll handle it.

— Ben @ BlueJays`;

  return { subject, body, sequence: 201 };
}

/**
 * Payment-failed dunning email. Fires from the Stripe webhook on the
 * 1st or 2nd `invoice.payment_failed` event for a customer's mgmt sub.
 * Friendly tone — most failures are an expired card on file at the
 * year-2 anniversary, not a customer trying to leave.
 *
 * Locked rules: ≤80 words body, exactly 1 link (Stripe portal OR
 * fallback mailto), no pricing language in body.
 */
export function getPaymentFailedEmail(prospect: Prospect): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const portalUrl = getBillingPortalUrl();

  const subject = `${prospect.businessName} — heads up, your card on file failed`;

  const body = `Hi ${name},

The renewal charge for ${prospect.businessName}'s site just failed — most likely an expired card on file. No action needed if you'd like Stripe to keep retrying, but updating your card now is the quickest fix:

${portalUrl}

Reply and I'll help if anything's tricky.

— Ben @ BlueJays`;

  return { subject, body, sequence: 202 };
}

/**
 * Urgent payment-failure email — fires after 3 consecutive failures.
 * The site goes into `at_risk` and Ben gets an SMS too. This message
 * is the customer's last clean shot to update their card before
 * service is suspended.
 */
export function getPaymentFailedUrgentEmail(prospect: Prospect): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const portalUrl = getBillingPortalUrl();

  const subject = `${prospect.businessName} — service interruption coming if we can't get your card sorted`;

  const body = `Hi ${name},

Three renewal attempts on ${prospect.businessName}'s site have failed. Stripe stops retrying soon and the site will be paused until billing is current.

Update your card here and we're back on track:

${portalUrl}

Reply if it's not the card and I'll dig in personally.

— Ben @ BlueJays`;

  return { subject, body, sequence: 203 };
}

/**
 * Confirmation email — fires from the domain renewal cron AFTER the customer's
 * Stripe sub charged successfully AND the registrar auto-renewed the domain.
 * Friendly receipt-style note. Locked outreach rules: ≤80 words body, exactly
 * 1 link (Stripe portal — for billing history / card mgmt), zero pricing
 * objection language.
 */
export function getDomainRenewalChargedEmail(
  prospect: Prospect,
  domain: string,
  newExpiresAtIso: string,
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const portalUrl = getBillingPortalUrl();
  const dateStr = new Date(newExpiresAtIso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const subject = `${domain} — renewed for another year`;

  const body = `Hi ${name},

Quick heads up — ${domain} is renewed for another year. Next renewal: ${dateStr}.

You can view billing history or update your card anytime:

${portalUrl}

Anything you'd like added to the site this year? Just reply.

— Ben @ BlueJays`;

  return { subject, body, sequence: 210 };
}

/**
 * Renewal-paused email — fires from the domain renewal cron when the
 * customer's Stripe mgmt sub is `past_due` (card on file failed) so we
 * skipped the registrar auto-renewal. Customer has ~30 days from this
 * email to update their card before the domain actually expires.
 *
 * Locked outreach rules: ≤80 words body, exactly 1 link (Stripe portal),
 * zero pricing language.
 */
export function getDomainRenewalPausedEmail(
  prospect: Prospect,
  domain: string,
  expiresAtIso: string,
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const portalUrl = getBillingPortalUrl();

  // Days between now and expiry. Floor so we never overstate the runway.
  const msUntilExpiry = new Date(expiresAtIso).getTime() - Date.now();
  const rawDays = Math.floor(msUntilExpiry / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, Math.min(30, rawDays));
  const windowStr =
    daysRemaining > 0
      ? `within ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`
      : "right away";

  const subject = `${domain} — couldn't renew, your card on file failed`;

  const body = `Hi ${name},

Heads up — couldn't renew ${domain} because your card on file failed. Update it ${windowStr} or the domain will expire:

${portalUrl}

Reply if anything's tricky and I'll handle it personally.

— Ben @ BlueJays`;

  return { subject, body, sequence: 211 };
}

export function getMonthlyReportEmail(
  prospect: Prospect,
  liveUrl: string,
  monthName: string,
  daysLive: number,
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || prospect.businessName;
  const renewalReminder =
    daysLive >= 335
      ? `\nHeads up — your annual plan renews soon. We'll send a reminder before anything is charged.\n`
      : "";

  return {
    subject: `${prospect.businessName} — ${monthName} update`,
    body: `Hi ${name},

Monthly check-in on ${prospect.businessName}'s website (${daysLive} days live).

${liveUrl}
${renewalReminder}
A few quick wins to get more from your site this month:

- Add your website to your Google Business Profile — it's the #1 traffic driver
- Put the URL in your Instagram bio and Facebook About section
- Ask happy customers to mention your website when they leave a Google review
- Add it to your business cards, invoices, and email signature
- Send us any new photos — fresh content helps with Google rankings


Need something updated?
---
New hours, services, a team photo — just reply to this email. Included in your plan, usually done within 48 hours.

— Ben @ BlueJays
${CONTACT_EMAIL} | ${BEN_PHONE}`,
    sequence: 0,
  };
}
