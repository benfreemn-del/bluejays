/**
 * Anchor-article registry for /guides/[slug].
 *
 * Hormozi compounding-content rule: depth > frequency. One 2,000-word
 * article that owns a query > 30 thin posts that rank for nothing.
 *
 * Each article:
 *   - targets ONE specific high-intent query
 *   - is evergreen (no dates that age the content)
 *   - ends with a CTA to /audit
 *   - links to ≥3 internal pages (compounding internal links)
 *
 * Adding new articles: just push another object onto GUIDES.
 * Body is plain text with double-newlines = paragraphs and lines
 * starting with "## " = h2 sections. Lines starting with "- " = list items.
 */

export type Guide = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  // Primary search intent this article targets
  intent: string;
  // Reading time estimate (minutes)
  readingTime: number;
  // Date for freshness signal in JSON-LD (kept evergreen but updated)
  publishedAt: string;
  modifiedAt: string;
  // Body — formatted as plain text with simple markdown-ish syntax.
  // Renderer parses this; no MDX dependency.
  body: string;
};

export const GUIDES: Guide[] = [
  {
    slug: "landscaping-website-cost",
    title: "How much should a landscaping website cost in 2026?",
    metaTitle: "How much should a landscaping website cost in 2026? | BlueJays",
    metaDescription:
      "Honest 2026 breakdown of what a landscaping website actually costs — from $20 DIY templates to $5K+ agency builds. What's worth paying for.",
    intent: "landscaping website cost",
    readingTime: 7,
    publishedAt: "2026-04-29",
    modifiedAt: "2026-04-29",
    body: `If you're a landscaper trying to figure out what a website should cost, you've probably found numbers anywhere from $0 to $15,000 — and you're not sure who's lying.

Most of them are. Here's the honest breakdown.

## The four real options

Every landscaping website you can buy in 2026 falls into one of four buckets. The difference between them isn't really the price — it's how much of the work YOU end up doing.

**1. DIY templates ($0–$300/year)**

Wix, Squarespace, GoDaddy. You build it yourself using a drag-and-drop editor. The template is free or near-free; you pay $16–$33/month for hosting and your domain.

The math people don't tell you: building it yourself takes 12–25 hours if you've never done it before. At $50/hour of your time, that's $600–$1,250 of your time you don't get back. And the result usually looks like a Wix template — because it is one.

**2. Freelancer ($800–$2,500)**

A guy on Upwork or Fiverr builds you a site. Quality is wildly variable. The good ones are great. The bad ones disappear with your money. The middle ones build you a Wix or WordPress site that looks fine but doesn't bring you customers.

Most landscaping freelancers don't know landscaping — they're selling you a generic template with grass photos.

**3. Local agency ($3,500–$8,000+)**

A small marketing agency builds you a custom site. Quality is usually good. Process is slow — 6 to 12 weeks is normal. They charge for revisions ($150/hour after the first round). Year 2 hosting is $200–$400/year.

Total over 3 years: usually $4,500–$10,000. They do good work, but you pay for the office, the project manager, the account exec, and the agency's marketing budget — none of which makes your site any better.

**4. Big-shop "platform" agencies ($10,000–$25,000)**

These exist mostly for restaurant chains and franchises. Don't pay this for a single-location landscaping company. You're being sold a marketing budget, not a website.

## What you're actually paying for

Strip away the agency layer and these are the real components of a landscaping website:

- **The design and build**: 8–15 hours of skilled work. Real cost: $400–$900.
- **Copywriting that converts**: 2–4 hours if it's good. Real cost: $200–$500.
- **Local SEO setup**: 1–3 hours. Real cost: $100–$300.
- **Photos**: $0 if you take your own. $200–$800 if you hire someone.
- **Domain + first-year hosting**: $50–$200.

Real total: $750–$2,700 of actual labor + materials.

Anyone charging more than that is charging for their office and their pipeline, not for your site.

## What your landscaping site actually needs to do

Forget the price for a second. Here's the test of whether a site is worth it:

- **Loads in under 2 seconds on cell signal.** Half your customers Google you while sitting in their truck.
- **Shows your work in your area.** Stock photos kill trust. Real photos of your real jobs convert.
- **Lists your services clearly.** "Mow, edge, mulch, hardscape" — short, specific, scannable.
- **Has your phone number visible on every screen, every page.** The #1 conversion tool on a landscaping site is making it dead-easy to call.
- **Ranks for "landscaper [your city]"** and your top 2–3 service queries.
- **Mobile-first.** 70%+ of landscaping searches happen on a phone.

If a site doesn't do those six things, the price doesn't matter — it's the wrong site.

## What we charge

Full disclosure: BlueJays builds these sites for $997 one-time + $100/year for hosting and support starting year 2. We work fast (live in 48 hours), we don't charge for revisions, and we let you see the finished site before you pay anything.

That's not the cheapest option (the DIY route is cheaper if you have 25 hours), but it's the only option in the under-$2,500 range that gets you a custom site that doesn't look like everyone else's. We'd rather show you than tell you.

## The simplest way to compare

Run [a free 60-second audit](/audit) of your current site. We'll score it against what good landscaping sites are doing in 2026, show you exactly what's costing you customers, and give you the fix list.

If your current site is fine, you'll know. If it's not, you'll see exactly what's worth paying to fix — and you can compare any quote you get against the audit's findings.

It costs nothing. No call, no signup, no credit card. Just an honest look at what you've got.`,
  },
  {
    slug: "why-your-dental-site-isnt-booking-patients",
    title: "Why your dental site isn't booking new patients (and the 3 things to fix)",
    metaTitle:
      "Why your dental site isn't booking new patients (3 fixes) | BlueJays",
    metaDescription:
      "Most dental websites lose 70%+ of potential new patients before they ever pick up the phone. Here are the 3 specific fixes that change that.",
    intent: "why dental website not booking patients",
    readingTime: 6,
    publishedAt: "2026-04-29",
    modifiedAt: "2026-04-29",
    body: `If your dental practice's website looks fine but the new-patient calls aren't coming, the site is the problem. It's almost always one of three issues. None of them are about how the site looks.

Here's how to find out which one is hurting you — and what to do about each.

## The setup: most dental sites lose 70%+ of their visitors

Industry data on dental websites is brutal. The average bounce rate (visitor leaves without doing anything) is 65–80%. Of the people who DO stick around, only 5–12% actually book or call. Do that math: out of every 100 people who land on your site from Google, you get 1 to 4 patients.

That's not because dentistry is hard to sell. Most of those 100 visitors WANT a dentist — that's why they searched. They left because something on your site told them you weren't the right one. Almost always, it's one of these three things.

## Problem 1: the call-to-action isn't obvious in 5 seconds

Pull up your site on your phone right now. Time how long it takes you to find:

- Your phone number
- The "book appointment" or "schedule" button
- A new-patient form

If any of those takes more than 5 seconds to find on the homepage, you're losing patients there. The fix:

**Phone number in the header. Big "Book new patient" button on every screen.** Mobile-first means thumb-reachable. Most dental sites bury the phone number in tiny gray text in the footer. That's a 30%+ booking-rate hit right there.

## Problem 2: there's no proof you're worth it

A new patient choosing between five dentists in their area looks for three things, in this order:

- **Reviews** — at least 50, with recent ones (within 6 months)
- **Real photos of your office and team** — not stock photos of generic smiles
- **Specific services they need** — "implants," "veneers," "kids' cleanings," "Invisalign"

If your site has stock photos and 8 reviews from 2020, the visitor doesn't trust you. They scroll back to Google and click the next result.

The fix: ask every patient for a Google review at checkout. Get to 50+ reviews. Replace stock photos with real photos of your actual office and staff. List your specific services as separate sections, not as a generic "general dentistry" lump.

## Problem 3: the site is slow on mobile

Google reports that 53% of mobile users leave a site that takes longer than 3 seconds to load. Most dental sites built before 2023 take 5–8 seconds. You can test yours at [PageSpeed Insights](https://pagespeed.web.dev) — anything below 70 on mobile is costing you patients.

The fixes here are technical: compressed images, fewer plugins, modern hosting, less code bloat. If you're on Wix or Squarespace, you have limited options — those platforms add overhead you can't remove. If you're on a custom site, a developer can usually fix this in a day.

A site that loads in under 2 seconds on cell signal converts 20–30% better than a site that loads in 5+ seconds. Same content, same design — just faster.

## The fastest way to find which one is hurting you

The three problems above are the most common. There are about 15 more (heading hierarchy, schema markup, contact form length, color contrast, etc.) — each individually small, all together meaningful.

The fastest way to know which ones are hitting your site specifically is to run [a free 60-second audit](/audit). We score your site 0–100 on what dental practices need to do well, find the 3 specific issues hurting your bookings the most, and show you the fix list.

It costs nothing — no call, no credit card. You'll know within a minute exactly what's broken and how big each problem is.

## The honest answer about hiring help

If your audit comes back showing more than 3 real problems, fixing them piecemeal usually costs more than rebuilding. Most "fix my dental website" projects we see end up over $2,000 in patches before the owner gives up and rebuilds anyway.

A clean rebuild from scratch — done right, with mobile-first speed and the conversion structure dental practices actually need — runs $997 [at BlueJays](/get-started). That's not the cheapest option (DIY is), but it's the only sub-$2,500 option that fixes all three problems above in one shot, and you don't pay anything until you see it and like it.

Whatever you do — fix in place, rebuild yourself, or hire it out — the audit is the right first step. You can't fix what you haven't measured.

[Run the free audit on your dental site →](/audit)`,
  },
];

export function getGuideBySlug(slug: string): Guide | null {
  const cleaned = (slug || "").toLowerCase().trim();
  return GUIDES.find((g) => g.slug === cleaned) || null;
}
