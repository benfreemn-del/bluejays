import type { Prospect } from "./types";
import { CATEGORY_CONFIG } from "./types";
import { getShortPreviewUrl } from "./short-urls";

export interface EmailTemplate {
  subject: string;
  body: string;
  sequence: number;
}

/**
 * CAN-SPAM compliant email footer.
 * Appended to every outbound email in the funnel.
 */
export const EMAIL_FOOTER = `
—
BlueJays Business Solutions | Washington, USA
You're receiving this because we built a free website for your business.
Unsubscribe: {{baseUrl}}/unsubscribe/{{prospectId}}
`;

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
 * Pulls the first service name from scrapedData when available so follow-ups
 * can reference a specific offering (e.g., "emergency repair", "kitchen remodels").
 */
function getTopService(prospect: Prospect): string | undefined {
  const services = prospect.scrapedData?.services;
  if (!services || services.length === 0) return undefined;
  const name = services[0]?.name;
  return name && name.length > 2 && name.length < 40 ? name.toLowerCase() : undefined;
}

export function getPitchEmail(
  prospect: Prospect,
  previewUrl: string = getShortPreviewUrl(prospect),
  videoUrl?: string,
): EmailTemplate {
  const { greeting, hasName } = getGreetingName(prospect);
  const category = CATEGORY_CONFIG[prospect.category].label;
  const hasWebsite = !!prospect.currentWebsite;
  const city = prospect.city || prospect.address?.split(",")[0] || "";

  // Drop the name prefix when we don't have a real owner name — avoids
  // awkward "Merit Construction, I made something for Merit Construction"
  const subject = hasName
    ? `${greeting}, I made something for ${prospect.businessName}`
    : `I made a website for ${prospect.businessName}`;

  const discoveryLine = hasWebsite
    ? `I found ${prospect.businessName} while searching for top-rated ${category.toLowerCase()} businesses${city ? ` in ${city}` : ""} — your reviews stood out.`
    : `I was looking for ${category.toLowerCase()} businesses${city ? ` in ${city}` : ""} and came across ${prospect.businessName} — but noticed you don't have a website yet.`;

  const ratingBlurb = buildRatingBlurb(prospect);

  const body = `Hi ${greeting},

${discoveryLine}${ratingBlurb}

Your reviews tell one story — the question is whether your website tells the same one. So I built one that does.

See your site: ${previewUrl}
${buildVideoBlock(videoUrl)}
Your customers are searching for ${category.toLowerCase()} services online right now. When they find you, what do they see? A site like this makes sure their first impression matches the quality of your work.

See more ${category.toLowerCase()} sites we've built: https://bluejayportfolio.com/v2/${prospect.category}

The full build is $997 one-time — custom design, domain registration, and hosting setup all included. If that feels heavy right now, we also split it into 3 payments of $349.

Book a quick 15-min walkthrough — I'll show you everything live, no pressure: https://calendly.com/bluejaycontactme/website-walkthrough

What's one thing about your business you'd want front-and-center on a new site?

— Ben @ BlueJays
bluejaycontactme@gmail.com
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com").replace("{{prospectId}}", prospect.id)}`;

  return { subject, body, sequence: 1 };
}

export function getFollowUp1(
  prospect: Prospect,
  previewUrl: string = getShortPreviewUrl(prospect),
  videoUrl?: string,
): EmailTemplate {
  const { greeting, hasName } = getGreetingName(prospect);
  const categoryPhrase = prospect.category.replace("-", " ");
  const city = prospect.city || prospect.address?.split(",")[0] || "your area";

  const subject = hasName
    ? `${greeting} — what do ${city} customers see when they search "${categoryPhrase}"?`
    : `What do ${city} customers see when they search "${categoryPhrase}"?`;

  return {
    subject,
    body: `Hi ${greeting},

Quick test — pull up your phone, Google "${categoryPhrase} near me" in ${city}, and look at the top result.

Is it ${prospect.businessName}? Or is it a competitor with a stronger website?

I built this for you specifically so that answer flips: ${previewUrl}
${buildVideoBlock(videoUrl)}
It's $997 one-time — custom design, domain registration, and hosting setup included. 3 payments of $349 if that's easier.

More ${categoryPhrase} sites in this style: https://bluejayportfolio.com/v2/${prospect.category}

15 minutes on a Zoom and I'll show you exactly how this ranks you higher: https://calendly.com/bluejaycontactme/website-walkthrough

When was the last time you Googled your own business name from your phone — what did you see?

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

export function getFollowUp2(
  prospect: Prospect,
  previewUrl: string = getShortPreviewUrl(prospect),
  videoUrl?: string,
): EmailTemplate {
  const { greeting, hasName } = getGreetingName(prospect);
  const category = CATEGORY_CONFIG[prospect.category].label;
  const topService = getTopService(prospect);
  const serviceHook = topService
    ? `I made sure ${topService} is front-and-center — it's the first thing visitors see, because it's clearly what you do best.`
    : `I designed it around what you actually do best — front and center, not buried on some "services" sub-page.`;

  const subject = hasName
    ? `I looked at your current site, ${greeting} — here's the side-by-side`
    : `${prospect.businessName} — here's the side-by-side with your current site`;

  return {
    subject,
    body: `Hi ${greeting},

I built this site for ${prospect.businessName} because your work deserves a website that doesn't make visitors second-guess the quality.

Compare for yourself: ${previewUrl}
${buildVideoBlock(videoUrl)}
${serviceHook}

The businesses winning in ${category.toLowerCase()} aren't always the best at what they do — they're the best at being found. You're clearly great at the work. The website's the only thing in the way.

$997 one-time covers the custom design, domain registration, and hosting setup. Or 3 payments of $349.

This preview stays live for 30 days, then I move on and build for someone else. Worth 15 minutes before it comes down? https://calendly.com/bluejaycontactme/website-walkthrough

See other ${category.toLowerCase()} builds: https://bluejayportfolio.com/v2/${prospect.category}

One honest question — if price weren't the issue, would you want this site live for ${prospect.businessName}?

— Ben
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com").replace("{{prospectId}}", prospect.id)}`,
    sequence: 3,
  };
}
