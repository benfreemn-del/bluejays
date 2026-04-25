import type { Prospect } from "./types";
import { CATEGORY_CONFIG } from "./types";
import { getShortPreviewUrl, getShortUnsubUrl, deriveShortCode } from "./short-urls";
import { addUtm } from "./utm";

/**
 * Self-hosted open-tracking pixel for HTML pitch emails.
 *
 * Returns an `<img>` tag string that loads our /api/o/[code] pixel —
 * a 43-byte transparent GIF served from our own domain. When the
 * recipient opens the HTML email, their mail client fetches the pixel,
 * we log an `email_events` open row, and if it's the FIRST open we
 * fire the hot-lead-on-first-open SMS alert to Ben.
 *
 * Why first-party: SendGrid's built-in open tracking rewrites email
 * HTML to insert SendGrid-domain pixels — a well-known commercial-
 * sender fingerprint that Gmail's Promotions classifier triggers on.
 * SendGrid open tracking is OFF in email-sender.ts on purpose. This
 * pixel restores the open signal without the deliverability cost
 * because Gmail doesn't pattern-match a first-party pixel from the
 * sender's brand domain.
 *
 * Only included in HTML bodies (plain text can't track opens). Plain-
 * text-only sends accept that limitation in exchange for guaranteed
 * Primary-tab placement during the 14-day domain warmup.
 */
export function getTrackingPixel(prospectId: string): string {
  const code = deriveShortCode(prospectId);
  // `display:none` hides it from rendering layouts but every modern
  // mail client still loads it. Width/height + alt="" so screen readers
  // skip past it cleanly. The src URL is intentionally on bluejayportfolio.com
  // (matches sender domain) for first-party reputation alignment.
  return `<img src="https://bluejayportfolio.com/api/o/${code}" width="1" height="1" alt="" style="display:none;border:0;width:1px;height:1px;" />`;
}

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

  // Tag the preview URL with UTM source/medium/campaign so the Stripe
  // `paid` event can attribute back to the Day-0 pitch send.
  // utm_content=v1 reserved for an A/B variant tag if we ever want to
  // split-test pitch copy from the same campaign label.
  previewUrl = addUtm(previewUrl, "email", "outreach", "pitch_day0", "v1");

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
    ${getTrackingPixel(prospect.id)}
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

  // UTM-tag preview URL so the Day 5 "re:" follow-up gets attribution
  // distinct from the Day 0 pitch in conversion reporting.
  previewUrl = addUtm(previewUrl, "email", "outreach", "followup_day5_re");

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
  const upsellsUrl = `${baseUrl}/upsells/${prospect.id}`;

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
Need more? See add-ons → ${upsellsUrl}

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
 * Day 2 onboarding nudge — fires from the multi-stage reminder cron
 * (`/api/onboarding-reminders/process`) when a paid prospect's onboarding
 * is still null OR `step1_complete` two days after payment.
 *
 * Follows the locked outreach rules: ≤80 words, exactly 1 link, no pricing.
 * Subject escalates from the 30-minute reminder — "Quick — need 5 min from
 * you to start your site" — without nagging.
 *
 * Idempotent via `prospects.onboarding_reminder_sent_at`. The cron uses the
 * timestamp value (not just null/non-null) so subsequent stages can fire
 * after this one.
 */
export function getOnboardingReminderDay2(prospect: Prospect): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const onboardingUrl = `https://bluejayportfolio.com/onboarding/${prospect.id}`;

  const subject = `Quick — need 5 min from you to start ${prospect.businessName}'s site`;

  const body = `Hi ${name},

Just need 5 minutes from you to plug your real content into ${prospect.businessName}'s site. Step 1 is the unblocking part — name, phone, logo, colors. After that I can start building right away.

${onboardingUrl}

If anything's confusing, reply to this email and I'll handle it for you.

— Ben`;

  return { subject, body, sequence: 102 };
}

/**
 * Day 5 onboarding nudge — fires when payment + onboarding incomplete
 * after 5 days. More urgent subject + offers a manual workaround:
 * Ben will gather the info via email/phone if the form is the blocker.
 *
 * Same outreach-rule constraints as Day 2.
 */
export function getOnboardingReminderDay5(prospect: Prospect): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const onboardingUrl = `https://bluejayportfolio.com/onboarding/${prospect.id}`;

  const subject = `Stuck? Reply and I'll handle the form for you`;

  const body = `Hi ${name},

${prospect.businessName}'s site has been ready to customize for almost a week. Want me to just grab the details over a quick call or by email instead?

If the form's the blocker, reply with your logo + brand colors + services and I'll plug it in for you. Otherwise the 3-step form takes about 10 min:

${onboardingUrl}

Either way works — just let me know.

— Ben`;

  return { subject, body, sequence: 103 };
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

  // Day 12 "value reframe" — distinct campaign tag for attribution.
  previewUrl = addUtm(previewUrl, "email", "outreach", "followup_day12_value_reframe");

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

/**
 * Day 21 "social proof" follow-up. Mid-funnel touch that reinforces the
 * effort hook ("hand-built for you") since by Day 21 the prospect has
 * gone silent through 4 touches and likely needs reassurance that this
 * is real, not a mass blast.
 *
 * ≤80 words, exactly 1 link, no pricing, soft reply prompt — same locked
 * outreach rules as the pitch + earlier follow-ups.
 */
export function getFollowUp3(
  prospect: Prospect,
  previewUrl: string = getShortPreviewUrl(prospect),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _videoUrl?: string,
): EmailTemplate {
  const { greeting } = getGreetingName(prospect);

  previewUrl = addUtm(previewUrl, "email", "outreach", "followup_day21_social_proof");

  const subject = `Re: ${prospect.businessName}`;

  return {
    subject,
    body: `Hi ${greeting},

Quick thought — a few other businesses I built sites for this month have already moved on theirs. Made me realize I never followed up properly on yours.

The version I put together for ${prospect.businessName} is still here if you want another look:

${previewUrl}

Not trying to push — genuinely curious what your honest take is.

— Ben
${EMAIL_FOOTER.replace("{{unsubUrl}}", getShortUnsubUrl(prospect))}`,
    sequence: 4,
  };
}

/**
 * Day 30 final check-in. Uses the "should I close this out?" framing
 * (lower-stakes language than "last email") which historically gets
 * higher reply rates than urgency-led closes. Subject deliberately
 * matches the "Re: [Business]" pattern of earlier touches so it threads
 * inside Gmail/Apple Mail.
 */
export function getFollowUp4(
  prospect: Prospect,
  previewUrl: string = getShortPreviewUrl(prospect),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _videoUrl?: string,
): EmailTemplate {
  const { greeting } = getGreetingName(prospect);

  previewUrl = addUtm(previewUrl, "email", "outreach", "followup_day30_final");

  const subject = `Re: ${prospect.businessName}`;

  return {
    subject,
    body: `Hi ${greeting},

Wanted to check in one more time on the site I built for ${prospect.businessName}:

${previewUrl}

If timing's just off, totally get it — happy to leave it up a while longer. Otherwise I'll archive it on my end.

Either way, no hard feelings.

— Ben
${EMAIL_FOOTER.replace("{{unsubUrl}}", getShortUnsubUrl(prospect))}`,
    sequence: 5,
  };
}

/**
 * Day 45 "graceful goodbye" — the highest-reply-rate email pattern in
 * any cold sequence. Industry data: 50%+ of B2B replies come on touches
 * 5–8, and the "should I close this out?" framing consistently outperforms
 * urgency-led closes by 2-3x in published reply-rate studies.
 *
 * Locked outreach rules: ≤80 words, exactly 1 link, no pricing, soft
 * reply prompt.
 */
export function getFollowUp5(
  prospect: Prospect,
  previewUrl: string = getShortPreviewUrl(prospect),
): EmailTemplate {
  const { greeting } = getGreetingName(prospect);

  previewUrl = addUtm(previewUrl, "email", "outreach", "followup_day45_graceful_goodbye");

  const subject = `should I close this out?`;

  return {
    subject,
    body: `Hey ${greeting},

Didn't hear back so figured I'd close out the file. The preview I built for ${prospect.businessName} is still live for now:

${previewUrl}

If timing's just off, no worries — happy to leave it up another month or two. Otherwise I'll archive it.

— Ben
${EMAIL_FOOTER.replace("{{unsubUrl}}", getShortUnsubUrl(prospect))}`,
    sequence: 205,
  };
}

/**
 * Day 60 final touch + seasonal hook. Last note in the sequence —
 * deliberately brief, references the category's seasonal pattern as
 * a soft "right now is when this matters" angle without using banned
 * urgency phrases like "limited time" or "expires soon".
 *
 * Locked outreach rules: ≤80 words, exactly 1 link, no pricing.
 */
export function getFollowUp6(
  prospect: Prospect,
  previewUrl: string = getShortPreviewUrl(prospect),
): EmailTemplate {
  const { greeting } = getGreetingName(prospect);
  const category = CATEGORY_CONFIG[prospect.category].label.toLowerCase();

  previewUrl = addUtm(previewUrl, "email", "outreach", "followup_day60_final_seasonal");

  const subject = `${prospect.businessName} — last note from me`;

  return {
    subject,
    body: `Hey ${greeting},

Going to take this off my list this week. Reaching out one more time because ${category} businesses tend to ramp up around now and a stronger website pays for itself fast.

The preview's still here if you want to take another look:

${previewUrl}

— Ben
${EMAIL_FOOTER.replace("{{unsubUrl}}", getShortUnsubUrl(prospect))}`,
    sequence: 206,
  };
}

const BASE = "https://bluejayportfolio.com";
const CONTACT_EMAIL = process.env.FROM_EMAIL || "ben@bluejayportfolio.com";
const BEN_PHONE = process.env.BEN_PHONE || "(253) 886-3753";

/**
 * Day-30 referral ask — gated to NPS PROMOTERS only (Rule 44).
 *
 * Pre-Wave-5b this email fired indiscriminately to every paid customer
 * 30 days after purchase, which meant detractors and lukewarm passives
 * got a tone-deaf "send your friends" pitch right when they were
 * already cooling on the experience. Now the cron in
 * `/api/referral/send` only includes prospects whose latest
 * `nps_responses.category === 'promoter'` — passives and detractors
 * skip this email entirely (the right move; a "tell your friends!"
 * ask from someone you'd rate a 5/10 is actively harmful).
 *
 * Promoter copy is upgraded too: bigger reward ($100 off OR a free
 * year of management) since they self-identified as enthusiastic
 * advocates AND the referee gets $100 off, so it's a true two-sided
 * incentive.
 */
export function getReferralEmail(
  prospect: Prospect,
  referralCode: string,
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || prospect.businessName;
  const referralUrl = `${BASE}?ref=${referralCode}`;

  return {
    subject: `${name} — thank you (and a little something for your network)`,
    body: `Hi ${name},

You rated ${prospect.businessName}'s experience a 9 or 10 — that means a lot.

If you know other local business owners who could use the same upgrade, share your personal link:

${referralUrl}

For every business that claims a site through your link, they get $100 off AND you get $100 off your renewal — OR a free year of management, your call.

Thanks again for trusting us with ${prospect.businessName}.

— Ben
${CONTACT_EMAIL}`,
    sequence: 0,
  };
}

/**
 * Day-14 NPS survey email (Wave-5b retention).
 *
 * The 14-day mark is the goldilocks window: long enough that the
 * honeymoon glow has worn off and the customer is operating with the
 * site in their day-to-day, short enough that the build experience is
 * still fresh. Two weeks earlier and we'd be measuring excitement;
 * two weeks later and indifferent customers have already drifted.
 *
 * Body is intentionally tiny (≤80 words, single semantic question).
 * The eleven 0-10 scores are rendered as plain-text URLs in the
 * fallback body so any mail client can click them. When
 * `ENABLE_HTML_PITCH_EMAIL` is set we render the same 11 endpoints as
 * a colored button row (red 0-6, yellow 7-8, green 9-10) which gets
 * higher response rates without changing the underlying mechanic.
 *
 * Each link goes to `/r/{shortCode}/{score}` — a public route that
 * (a) records the score, (b) branches to a category-specific thanks
 * page, and (c) auto-fires the referral email for promoters. See
 * `src/app/r/[code]/[score]/route.ts`.
 */
export function getNpsSurveyEmail(prospect: Prospect): EmailTemplate {
  const { greeting } = getGreetingName(prospect);
  const code = prospect.short_code || deriveShortCode(prospect.id);
  const linkFor = (score: number) => `${BASE}/r/${code}/${score}`;

  // Plain-text fallback body. Each line is its own clickable URL so
  // even text-only mail clients render the full 0-10 scale.
  const scoreLines = Array.from({ length: 11 }, (_, score) => {
    return `${score}: ${linkFor(score)}`;
  }).join("\n");

  const body = `Hi ${greeting},

Quick one — on a scale of 0-10, how likely are you to recommend BlueJays to another business owner?

${scoreLines}

Just one click — takes 5 seconds. I read every response.

— Ben
${EMAIL_FOOTER.replace("{{unsubUrl}}", getShortUnsubUrl(prospect))}`;

  // HTML version — colored button row. Only rendered when the
  // ENABLE_HTML_PITCH_EMAIL gate is on (post-warmup). The plain-text
  // body above is always populated and is what 99% of clients render
  // anyway during the warmup phase.
  const htmlBody = process.env.ENABLE_HTML_PITCH_EMAIL === "true"
    ? wrapEmailHtml(`
        <p>Hi ${esc(greeting)},</p>
        <p>Quick one — on a scale of 0-10, how likely are you to recommend BlueJays to another business owner?</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;border-collapse:collapse;">
          <tr>
            ${Array.from({ length: 11 }, (_, score) => {
              const color =
                score >= 9 ? "#16a34a" : score >= 7 ? "#ca8a04" : "#dc2626";
              return `<td style="padding:0 4px;">
                <a href="${esc(linkFor(score))}" style="display:inline-block;min-width:36px;text-align:center;padding:10px 0;background:${color};color:#ffffff;font-weight:700;text-decoration:none;border-radius:6px;font-size:15px;">${score}</a>
              </td>`;
            }).join("")}
          </tr>
        </table>
        <p>Just one click — takes 5 seconds. I read every response.</p>
        <p>— Ben</p>
        <p style="color:#888;font-size:12px;margin-top:24px;">Quilcene, WA · <a href="${esc(getShortUnsubUrl(prospect))}" style="color:#888;">Opt out</a></p>
      `)
    : undefined;

  return {
    subject: `Quick question about your site — 30 seconds?`,
    body,
    htmlBody,
    sequence: 220,
  };
}

/**
 * Promoter-specific referral email fired immediately after a 9 or 10
 * NPS click. Differs from `getReferralEmail()` in two ways:
 *   1. References the just-given high rating ("you rated us a 10!")
 *   2. Body is shorter — they already saw the offer on the thanks
 *      page; this is just an inbox-archived copy of the ask.
 */
export function getPromoterReferralEmail(
  prospect: Prospect,
  referralCode: string,
  score: number,
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || prospect.businessName;
  const referralUrl = `${BASE}?ref=${referralCode}`;

  return {
    subject: `Thanks for the ${score}/10, ${name} — your referral link`,
    body: `Hi ${name},

Just got your ${score}/10 — really appreciate that.

Here's your personal referral link to share with any business owner who could use the same upgrade:

${referralUrl}

Every business that claims through your link gets $100 off — and you get $100 off your renewal OR a free year of management, your call.

Thanks again.

— Ben
${EMAIL_FOOTER.replace("{{unsubUrl}}", getShortUnsubUrl(prospect))}`,
    sequence: 221,
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

— Ben @ BlueJays

—
Need more? See add-ons → ${BASE}/upsells/${prospect.id}`,
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

/**
 * Monthly report email — REAL per-customer metrics replace the old generic
 * tips body. CLAUDE.md Rule 39: monthly report MUST use real data per the
 * non-negotiable about social-proof. Generic tips are out.
 *
 * Backwards-compatible signature: callers that used the old positional form
 * `(prospect, liveUrl, monthName, daysLive)` still work; metrics are
 * optional and default to all-zeros (which renders the encouragement
 * template, since the customer effectively had no recorded activity).
 *
 * The portal link in the email body points at `/client/[id]` — the
 * read-only customer portal where the prospect can see leads, reviews,
 * and renewal info. UUID-as-secret URL pattern; no auth needed.
 */
export function getMonthlyReportEmail(
  prospect: Prospect,
  liveUrl: string,
  monthName: string,
  daysLive: number,
  metrics?: {
    leads: number;
    missedCallsRecovered: number;
    fiveStarReviews: number;
    appointments: number;
  },
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || prospect.businessName;
  const portalUrl = `${BASE}/client/${prospect.id}`;
  const renewalReminder =
    daysLive >= 335
      ? `\nHeads up — your annual plan renews soon. I'll send a separate reminder before anything is charged.\n`
      : "";

  const m = metrics || { leads: 0, missedCallsRecovered: 0, fiveStarReviews: 0, appointments: 0 };
  const totalActivity = m.leads + m.missedCallsRecovered + m.fiveStarReviews + m.appointments;

  // Wave-2 LTV protection: pick a contextual upsell based on what the
  // customer's site is (or isn't) producing this month. See CLAUDE.md
  // "Upsell SKUs" + Rule 40 — every paid customer should see upsell
  // paths in their lifecycle emails, gated to be 1-click-buyable.
  const upsellsUrl = `${BASE}/upsells/${prospect.id}`;
  let upsellLine = `Want more from your site? Browse add-ons → ${upsellsUrl}`;
  if (m.fiveStarReviews === 0) {
    upsellLine = `Zero new reviews this month? Review Request Blast sends 50 SMS to your past customers in 24 hrs (avg 10-15 new 5-star reviews) → ${upsellsUrl}`;
  } else if (m.leads === 0) {
    upsellLine = `Quiet inbox? Most local customers find businesses through Google. I can claim and optimize your Google Business Profile so you show up in local searches → ${upsellsUrl}`;
  }

  // Encouragement template — zero activity that month. Don't ship "0 leads,
  // 0 calls, 0 reviews" in the body; that reads worse than no email at all.
  if (totalActivity === 0) {
    return {
      subject: `${prospect.businessName} — ${monthName} update`,
      body: `Hi ${name},

Your site was up 100% of ${monthName} — nothing to report on the activity side this month.

Want me to help you get more out of it? Reply with one thing you'd like to try — a new photo, a seasonal banner, an updated menu, an Instagram/Facebook embed, anything. I'll have it live within 48 hours, no charge.
${renewalReminder}
${upsellLine}

See your full dashboard:
${portalUrl}

— Ben @ BlueJays
${CONTACT_EMAIL} | ${BEN_PHONE}`,
      sequence: 0,
    };
  }

  // Real-metrics template — at least one signal of activity to celebrate.
  const lines: string[] = [];
  if (m.leads > 0) {
    lines.push(`📞 ${m.leads} new lead${m.leads === 1 ? "" : "s"} from your contact form`);
  }
  if (m.missedCallsRecovered > 0) {
    lines.push(
      `🔄 ${m.missedCallsRecovered} missed call${m.missedCallsRecovered === 1 ? "" : "s"} auto-recovered with a follow-up text`,
    );
  }
  if (m.fiveStarReviews > 0) {
    lines.push(
      `⭐ ${m.fiveStarReviews} new 5-star Google review${m.fiveStarReviews === 1 ? "" : "s"} via your review funnel`,
    );
  }
  if (m.appointments > 0) {
    lines.push(`📅 ${m.appointments} appointment${m.appointments === 1 ? "" : "s"} booked online`);
  }

  return {
    subject: `${prospect.businessName}, here's your ${monthName} website report`,
    body: `Hi ${name},

Here's what your site did in ${monthName}:

${lines.join("\n")}

See the full report (with names, numbers, and details):
${portalUrl}

Your live site:
${liveUrl}
${renewalReminder}
If you'd like to add anything to your site this month — new photos, an updated menu, a seasonal banner — just reply to this email and I'll have it live within 48 hours.

${upsellLine}

— Ben @ BlueJays
${CONTACT_EMAIL} | ${BEN_PHONE}`,
    sequence: 0,
  };
}

// ═══════════════════════════════════════════════════════════════
// UPSELL SKU WELCOME EMAILS (post-purchase per add-on)
//
// Fired from the Stripe webhook on `checkout.session.completed` events
// where `metadata.sku` is one of the 4 productized upsells. Each is a
// receipt-style note that tells the customer exactly what we need from
// them to deliver the SKU. Locked outreach rules: ≤80 words, exactly
// 1 link, no banned phrases. See CLAUDE.md "Upsell SKUs".
// ═══════════════════════════════════════════════════════════════

/** Review Request Blast — $99 — needs a CSV of past customers. */
export function getReviewBlastWelcomeEmail(prospect: Prospect): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || "there";

  const subject = `${prospect.businessName} — got your $99 for the Review Blast`;

  const body = `Hi ${name},

Got your $99 for the Review Request Blast — thanks!

Please reply to this email with a CSV (or just a list) of your past customers' names + phone numbers. I'll fire the SMS blast within 24 hrs of receiving it. Average return is 10-15 new 5-star Google reviews.

Reply here when you're ready: ${CONTACT_EMAIL}

— Ben @ BlueJays`;

  return { subject, body, sequence: 220 };
}

/** Add 5 Extra Pages — $400 — needs the 5 page topics. */
export function getExtraPagesWelcomeEmail(prospect: Prospect): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || "there";

  const subject = `${prospect.businessName} — got your $400 for 5 extra pages`;

  const body = `Hi ${name},

Got your $400 for 5 extra pages on ${prospect.businessName}'s site — thanks!

Reply with what you'd like (services, FAQ, gallery, blog, case studies — your choice) and I'll have them live within 48 hrs. Send any photos or copy you want included.

Reply here: ${CONTACT_EMAIL}

— Ben @ BlueJays`;

  return { subject, body, sequence: 221 };
}

/** Google Business Profile Setup — $150 — needs admin access. */
export function getGbpSetupWelcomeEmail(prospect: Prospect): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || "there";

  const subject = `${prospect.businessName} — got your $150 for GBP setup`;

  const body = `Hi ${name},

Got your $150 for the Google Business Profile setup — thanks!

Please send admin access to your existing GBP listing (or confirm you don't have one yet) and I'll handle the claim, optimize the listing, and pre-schedule 5 weekly posts so you start showing up in local searches.

Reply here with access: ${CONTACT_EMAIL}

— Ben @ BlueJays`;

  return { subject, body, sequence: 222 };
}

/** Monthly Content Updates — $50/month — sets expectations + portal link. */
export function getMonthlyUpdatesWelcomeEmail(prospect: Prospect): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const portalUrl = getBillingPortalUrl();

  const subject = `${prospect.businessName} — welcome to monthly updates`;

  const body = `Hi ${name},

Welcome to monthly updates for ${prospect.businessName}!

I'll reach out at the start of each month asking what you'd like changed — new photos, copy tweaks, seasonal banners, special offers, anything. You can cancel anytime via your billing portal:

${portalUrl}

Reply here whenever you have something new for the site.

— Ben @ BlueJays`;

  return { subject, body, sequence: 223 };
}
