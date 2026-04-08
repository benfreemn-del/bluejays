# BlueJays Proposal System — Refinement Recommendations

**Date:** April 8, 2026  
**System Reviewed:** `/preview/[id]`, `/compare/[id]`, `/claim/[id]`, `src/lib/generator.ts`, `src/lib/quality-review.ts`

---

## Overview

The BlueJays proposal system is a three-stage funnel: the **preview site** (a fully-built personalized website delivered to the prospect), the **compare page** (a side-by-side before/after of their old site vs. the new one), and the **claim/checkout flow** (an AI-powered chat that guides them to purchase). Together, these three stages represent the core of the BlueJays sales experience.

The system is already well-conceived and technically sound. The generator correctly prioritizes real scraped data over defaults, the quality review system flags missing content before a site goes live, and the claim chat provides a conversational path to checkout. The recommendations below are focused on elevating the system from "functional" to "exceptional" — the kind of proposal experience that makes a local business owner feel like BlueJays built this specifically for them.

---

## Section 1 — Preview Site Polish

The preview site is the most important asset in the entire funnel. It must be flawless, because it is the product demonstration. The following issues were identified in the current preview system.

**1.1 — Placeholder Text Visibility**

When the data extractor fails to find an "About" section for a business, the generator falls back to `generateDefaultAbout()` in `src/lib/generator.ts`, which produces generic category-level copy (e.g., "We are a trusted plumbing business serving the local community..."). A prospect who reads this and recognizes it as generic boilerplate will immediately lose confidence in the product.

**Recommendation:** Add a visible indicator in the preview banner (the `ClaimBanner` component) when the site is using fallback content. Something like: *"This is your preview — after you claim it, we replace all placeholder text with content specific to your business."* This sets expectations correctly and prevents the prospect from rejecting the site because of generic copy that they know will be replaced.

**1.2 — Customization Score Display**

The `generateSiteData()` function in `src/lib/generator.ts` already calculates a customization score (0–9) based on how much real data was extracted. This score is logged to the console but never shown to the prospect or Ben.

**Recommendation:** Surface the customization score in the admin dashboard so Ben can see at a glance which previews are data-rich (score 6–9) vs. data-poor (score 0–3) before sending outreach. Low-score previews should be flagged for manual data enrichment before the pitch goes out. A prospect who receives a preview with their real phone number, real services, and real reviews is far more likely to convert than one who receives a site full of placeholder data.

**1.3 — The Claim Banner Urgency**

The `ClaimBanner` component shows a countdown timer ("Preview expires in Xd Xh Xm") and a social proof ticker ("47 businesses in your area upgraded their website this month"). Both are effective urgency mechanisms. However, the social proof number is currently hardcoded at 47 — it should pull from the real `/api/social-proof` endpoint which returns actual counts from the database.

**Recommendation:** Connect the `ClaimBanner` to the `/api/social-proof` endpoint and use the real `cityCounts` data to show a localized message: *"12 businesses in [City] upgraded their website this month."* A localized number is far more compelling than a generic one.

---

## Section 2 — The Compare Page (`/compare/[id]`)

The compare page is the most underutilized asset in the funnel. It is currently only linked from the "already have a website" objection handling script, but it should be a primary CTA in the initial outreach for any prospect who has an existing website.

**2.1 — The "Before" Column is Too Generic**

The current "Before" column shows either an iframe of the prospect's existing site or a "No Website Found" placeholder. The metrics below the iframe are hardcoded as "Slow / Outdated / Poor" regardless of the actual site quality.

**Recommendation:** Run a basic automated check on the prospect's existing website (or use the data already scraped) to populate real metrics. Even simple checks would be compelling: does the site have HTTPS? Is it mobile-responsive (viewport meta tag present)? Does it load in under 3 seconds? Does it have a visible phone number? These are all checkable without a full PageSpeed audit. Showing a prospect that their site "fails mobile" or "missing HTTPS" is far more persuasive than a generic "Outdated" label.

**2.2 — The "After" Column Needs a Feature Callout**

The "After" column currently shows an iframe of the new preview site with three green metrics ("90+ PageSpeed / Modern / Perfect Mobile"). These are good but generic.

**Recommendation:** Add 2–3 specific callouts that reference the prospect's actual data. For example: *"Featuring your 4.8-star Google reviews"* or *"Highlights your [Top Service Name] service"* or *"Built for [City] customers."* These callouts make the "After" column feel personal rather than like a template demo.

**2.3 — The CTA Below the Comparison**

The current CTA is a single button: "Claim Your New Website — $997." This is clear and direct, but it leaves no path for prospects who are interested but not ready to commit financially.

**Recommendation:** Add a secondary CTA below the primary button: *"Have questions? Schedule a quick call with Ben →"* (linking to his calendar). This two-option structure is a proven conversion pattern — the primary CTA captures ready buyers, while the secondary CTA captures warm-but-hesitant prospects who would otherwise bounce. The calendar link should also be present on the preview site itself.

---

## Section 3 — Leveraging CRM and Scraped Data More Effectively

The `Prospect` type in `src/lib/types.ts` contains rich data that is currently underutilized in the proposal experience. The `googleRating`, `reviewCount`, `estimatedRevenueTier`, and `scrapedData` fields all contain information that could make the proposal feel dramatically more personalized.

**3.1 — Surface Review Metrics Prominently**

The `googleRating` and `reviewCount` fields are stored on the prospect but never displayed to the prospect themselves in the proposal flow.

**Recommendation:** Add a personalized headline to the compare page that references the prospect's actual review data. For example: *"[Business Name] has 4.8 stars across 127 reviews — but your website doesn't reflect that reputation."* This is a powerful pain point framing because it tells the prospect that their online reputation is better than their website suggests. It creates a gap between where they are and where they could be.

**3.2 — Pain Points by Revenue Tier**

The `estimatedRevenueTier` field (`low`, `medium`, `high`) is stored but not used in the proposal copy. A high-revenue business has different pain points than a low-revenue one.

**Recommendation:** Customize the pain point framing on the compare page based on revenue tier. For a `high` tier business: *"At your level, every missed call is a significant revenue loss — your website should be converting visitors, not losing them."* For a `low` tier business: *"A professional website is often the difference between a business that grows and one that stays flat."* This level of segmentation makes the proposal feel like it was written for them specifically.

**3.3 — Category-Specific Pain Points**

The compare page currently uses generic copy regardless of the business category. A plumber's pain points are completely different from a photographer's.

**Recommendation:** Create a `CATEGORY_PAIN_POINTS` map (similar to the existing `CATEGORY_CONFIG`) that provides 1–2 category-specific pain point statements for use on the compare page. Examples:

| Category | Pain Point Statement |
| :--- | :--- |
| Plumber | "When a pipe bursts at 2 AM, customers Google the first plumber they find. Is your site the one they trust?" |
| Dental | "Patients judge a dental practice by its website before they ever step inside. First impressions are everything." |
| Law Firm | "Potential clients research attorneys extensively before calling. Your website is your most important credential." |
| Restaurant | "Diners check menus and photos online before deciding where to eat. Is your current site making them hungry?" |
| Salon | "Clients book salons based on portfolio photos and reviews. Are yours front and center?" |

---

## Section 4 — The Claim Chat (`/claim/[id]`)

The claim page uses an AI-powered chat interface to guide prospects toward checkout. The current implementation is functional but has several opportunities for improvement.

**4.1 — The Opening Message**

The current opening message is:
> *"Hey there! Welcome — I'm the BlueJays assistant. I see you're here about the website we built for [Business Name]. Pretty cool, right?"*

This is a good start, but "pretty cool, right?" is slightly presumptuous. A prospect who is skeptical may react negatively to being told they should think it's cool.

**Recommendation:** Change the opening to acknowledge their visit without presuming their reaction:
> *"Hey! Welcome — I see you're checking out the website we built for [Business Name]. What do you think so far?"*

This opens a dialogue rather than seeking validation, and the prospect's answer will immediately reveal their intent level.

**4.2 — The Payment Cancelled Recovery Flow**

When a prospect cancels checkout and returns to the claim page, the current message is:
> *"Welcome back! Looks like you didn't finish checking out. No worries at all — your custom website for [Business Name] is still reserved."*

This is good, but it misses an opportunity to address the likely reason they cancelled (price hesitation or uncertainty about what's included).

**Recommendation:** Add a follow-up message after the welcome-back message:
> *"Sometimes people get to the checkout page and want to make sure they know exactly what they're getting before committing — totally understandable. Want me to walk you through everything that's included? Or if you have a specific question, just ask."*

This proactively addresses the most common reason for checkout abandonment without making the prospect feel judged for leaving.

**4.3 — Missing "What Happens Next" Clarity**

After a prospect expresses interest in purchasing, the chat currently directs them to the checkout link. However, there is no clear explanation of what happens after they pay.

**Recommendation:** Before sending the checkout link, the agent should briefly explain the post-purchase process:
> *"Once you complete the checkout, here's what happens: (1) You'll get an email with a link to fill out a short form with your preferences — colors, photos, any changes you want. (2) We make all the customizations within 48 hours. (3) We connect it to your domain and it goes live. The whole process is usually 2–3 days from payment to live site."*

Clarity about the next steps dramatically reduces post-purchase anxiety and increases the likelihood that the prospect completes checkout rather than abandoning it.

---

## Section 5 — The Value Proposition and Pricing Presentation

**5.1 — The "$997 Covers Everything" Breakdown**

The price is mentioned on the compare page and in the claim chat, but there is no visual breakdown of what the $997 includes anywhere in the proposal flow. Prospects who are price-sensitive need to see the value itemized.

**Recommendation:** Add a "What's Included" section to the compare page (below the comparison, above the CTA) that lists everything in the package. This should be a clean, scannable grid — not a wall of text:

| What You Get | Value |
| :--- | :--- |
| Custom website built for your business | — |
| Full customization (colors, photos, text, layout) | — |
| Mobile optimization | — |
| SEO best practices built in | — |
| Domain connection and hosting setup | — |
| Professional copywriting | — |
| One full year of site management | — |
| No monthly fees, no hidden costs | — |
| **Total investment** | **$997 one-time** |

The "Value" column could optionally show what each item would cost from an agency, making the $997 price feel like an extraordinary deal by comparison.

**5.2 — The Risk Reversal Statement**

The current proposal flow has no explicit risk reversal. Prospects who are hesitant about spending $997 on something they haven't seen in its final form need reassurance.

**Recommendation:** Add a risk reversal statement near the primary CTA on both the compare page and the claim chat:
> *"Not happy with the final result? We'll keep working on it until you are. We don't consider a site done until you love it."*

This is not a money-back guarantee (which would create operational complexity), but it is a commitment to satisfaction that reduces the perceived risk of the purchase.

---

## Summary of Recommended Changes

| Priority | Location | Change |
| :--- | :--- | :--- |
| High | Preview site (`ClaimBanner`) | Add placeholder content disclosure message |
| High | Compare page | Add real metrics to "Before" column (HTTPS, mobile, phone) |
| High | Compare page | Add personalized callouts to "After" column using scraped data |
| High | Compare page | Add secondary "Schedule a call" CTA |
| High | Compare page | Add review metric headline using `googleRating` + `reviewCount` |
| Medium | Admin dashboard | Surface customization score (0–9) per prospect |
| Medium | Compare page | Add "What's Included" breakdown above CTA |
| Medium | Compare page | Add category-specific pain point statement |
| Medium | Claim chat | Revise opening message to invite response rather than seek validation |
| Medium | Claim chat | Add "What Happens Next" explanation before checkout link |
| Medium | Claim chat | Improve payment-cancelled recovery flow |
| Low | Preview site (`ClaimBanner`) | Connect to real `/api/social-proof` for localized city counts |
| Low | Compare page | Add risk reversal statement near CTA |
| Low | All proposal pages | Segment pain point copy by `estimatedRevenueTier` |
