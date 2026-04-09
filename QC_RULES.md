# BlueJays Quality Control Rules

This document is the **single source of truth** for BlueJays preview-site quality standards. Every generated preview must satisfy these rules before it can be approved for outreach, manual review, delivery, or deployment. If any required rule fails, the site is **not ready**.

## Release Standard

A site is **not outreach-ready** unless it passes every required rule below. Reviewers and automated checks must treat these standards as blocking requirements rather than optional polish. A preview that partially works, silently hides broken assets, or looks acceptable only in one viewport still fails release.

| Standard | Requirement | Pass condition |
|---|---|---|
| Hero image quality | Every site must display a real hero image above the fold on desktop and mobile. Text-only heroes are not acceptable unless the category template has an approved image-free design treatment. | The hero shows a loaded, relevant, professional image in both viewport sizes. |
| Image integrity | No image on the page may be broken, blank, malformed, or silently replaced by an invisible transparent pixel. | Every displayed image resolves and renders visibly; failures must trigger an approved fallback image instead of a hidden placeholder. |
| Image uniqueness | The same major image must not be reused across hero, about, gallery, testimonial, or supporting sections unless there is a deliberate business reason. | Major images are visually distinct across sections. |
| Footer attribution | The footer must say **Created by bluejayportfolio.com** and the text must link to `https://bluejayportfolio.com`. | Footer copy exactly matches the approved attribution standard. |
| Link integrity | No links may be broken, malformed, or point to dead in-page anchors. | Every CTA, internal anchor, and outbound destination works. |
| Mobile responsiveness | Mobile layouts must feel production-ready, with no horizontal overflow, clipping, overlap, or unreadable spacing. | The preview is clean and usable on a standard mobile viewport. |
| Claim banner | The claim banner must be present on the preview and the claim CTA must open the correct claim path for that prospect. | Desktop and mobile both show a working claim flow. |
| Business identity accuracy | The correct business name and real phone number must be visible and must match the prospect record. | Name and phone are accurate, readable, and not placeholders. |
| Visual consistency | The palette, imagery, spacing, and section styling must feel intentional and category-appropriate. | The preview reads as a coherent premium website rather than a generic template. |
| Copy quality | No placeholder text, lorem ipsum, fake phone numbers, unfinished copy, or generic filler may remain. | All visible copy is business-specific and production-ready. |
| Before/after comparison | If the workflow supports comparison or the prospect has an existing site, the comparison experience must exist and work. | A valid comparison page is available when applicable. |
| URL sanitization | All stored and rendered image URLs must be trimmed of whitespace and control characters before validation, proxying, or display. | No image URL contains leading/trailing whitespace, newline characters, or `%0A`-style corruption in production rendering. |
| Image resolution minimums | Hero images must be at least **800px wide**. About and gallery images must be at least **400px wide** or have URL metadata that strongly suggests that scale or better. | Hero and supporting imagery meet the minimum quality bar and do not look thumbnail-sized. |
| Image contextual relevance | Site images must match the business category and business context. | The imagery would make sense to the business owner and customer for that category. |
| Stock fallback quality | Stock images may be used only as a fallback and must be high-quality, category-appropriate Unsplash imagery. | When fallback imagery appears, it looks intentional, premium, and relevant to the category. |
| Gallery-heavy category coverage | Tattoo, photography, interior-design, florist, landscaping, salon, catering, and pet-services previews require deeper image coverage. | Those categories include at least **5 real photos** suitable for hero, about, and gallery use. |
| No invisible image failures | Broken proxied images must never count as a pass because a transparent GIF or similar hidden placeholder rendered successfully. | Failed images are replaced with approved category fallbacks or surfaced as blockers. |
| Image diversity | The hero, about, and gallery sections should not all reuse the same image or near-identical asset. | Imagery is varied enough to make the preview feel real and premium. |

## Image Quality Standards

Image quality is a first-class approval gate. Weak images can make an otherwise strong site fail review because they directly affect trust, perceived craftsmanship, and conversion quality. The image pipeline must therefore sanitize, validate, rank, and safely fall back before a preview is rendered.

| Rule | Requirement | Enforcement expectation |
|---|---|---|
| Hero image requirement | `photos[0]` must exist, be a real contextual photo, and must not be a logo, icon, favicon, screenshot, or thumbnail-scale asset. | A missing or low-quality hero image is a blocking failure. |
| URL validity | Every production image URL must be a well-formed `http` or `https` URL after trimming. `data:` URIs are not acceptable for hero or gallery imagery. | Invalid URLs fail QC and must be replaced. |
| Trailing whitespace removal | All image URLs from scraping, storage, preview rendering, and proxying must be trimmed before use. | Newlines, tabs, or control characters must never survive into proxied URLs. |
| Low-quality pattern detection | URLs that indicate thumbnail dimensions, blur parameters, screenshot assets, or expiring CDN tokens must be treated as risky or low quality. | Such images must be downgraded, replaced, or rejected depending on severity. |
| Duplicate detection | Duplicate or query-variant-equivalent image URLs should be treated as the same asset for QC purposes. | Repeated images across sections are flagged and corrected. |
| Fallback behavior | If an image is missing or unusable, the system must use an approved category fallback rather than silently fail. | The rendered preview always shows visible, intentional imagery. |
| Real-photo preference | Real photos from the business website, Google Places, or validated social sources are preferred over stock. | Stock is reserved for missing, broken, or clearly substandard real imagery. |
| Section diversity | Hero, about, and gallery imagery should represent different views whenever enough assets exist. | The same photo should not anchor multiple major sections. |

## Category-Specific Photo Count Requirements

Different categories need different image density. Some businesses can still look credible with a tight set of supporting photos, while gallery-heavy categories must show significantly more visual proof.

| Category group | Minimum usable real photos | Notes |
|---|---:|---|
| Standard service categories | 3 | Must cover hero, about/supporting image, and at least one additional gallery image. |
| Gallery-heavy categories | 5 | Applies to **tattoo**, **photography**, **interior-design**, **florist**, **landscaping**, **salon**, **catering**, and **pet-services**. |
| Zero-photo prospects | 0 real photos available is never approval-ready by itself | Approved category stock fallbacks may render the preview, but the site still fails QC until imagery is corrected or consciously waived. |

## Contextual Relevance Rules

Images must not merely load; they must make sense. A technically valid but irrelevant image still fails because it damages credibility. Reviewers must reject images that conflict with the business category, business type, or section purpose.

| Section | Relevance standard |
|---|---|
| Hero | Must immediately communicate the business category, brand vibe, or core service. |
| About | Should support trust, team credibility, workspace, craftsmanship, or real-world business context. |
| Gallery / projects | Should show varied examples of actual work, services, environment, or outcomes, not repeated stock poses. |
| Testimonials / supporting sections | Should not reuse the hero asset unless there is a deliberate business reason and no stronger alternative exists. |

## Stock Fallback Rules

Stock imagery is acceptable only when it improves the user-facing result over broken or visibly poor real imagery. When stock is used, it must be category-appropriate, high-resolution, and visually aligned with the section where it appears.

| Rule | Requirement |
|---|---|
| Allowed source | Approved high-quality Unsplash fallbacks only. |
| Category fit | The fallback must clearly match the prospect category. A dental fallback cannot appear on a landscaping preview. |
| Quality bar | The fallback must meet the same hero/about/gallery resolution standards as real imagery. |
| Use threshold | Stock is acceptable when real images are missing, invalid, duplicate-heavy, thumbnail-sized, expired, blurred, or obviously off-brand. |
| Transparency rule | A fallback must be visible and intentional. Invisible placeholder pixels do not count as fallback behavior. |

## Required QC Workflow

Every site must be checked in both desktop and mobile views before approval. Reviewers should confirm functional accuracy first, then visual polish, then outbound-link integrity, and finally image-specific quality details. If the preview itself does not load, that is an immediate blocker and all downstream review stops until the rendering issue is fixed.

| Review step | Reviewer action |
|---|---|
| 1. Load the live preview | Open the live preview URL and confirm that the page renders successfully without a server error. |
| 2. Confirm image rendering | Verify that the hero image and all major supporting images visibly load on desktop and mobile. |
| 3. Check image quality | Confirm that hero/about/gallery images are relevant, distinct, and not logos, favicons, screenshots, or thumbnail-sized assets. |
| 4. Check fallback behavior | If any real image fails, verify that the approved category stock fallback appears instead of a blank or transparent pixel. |
| 5. Check attribution and CTA | Verify footer attribution, claim banner wording, and claim-path correctness. |
| 6. Check business accuracy | Confirm business name, phone number, address presentation, and absence of placeholder content. |
| 7. Check responsive behavior | Inspect the mobile layout for overflow, clipping, broken stacking, and image framing problems. |
| 8. Check outbound destinations | Validate important links, claim CTAs, compare-page paths, and maps/phone actions when present. |
| 9. Approve only on full pass | Mark the site as outreach-ready only after every required standard passes. |

## Automated QC Expectations

Automated checks must act as a failsafe, not as a cosmetic scorecard. The pipeline should sanitize URLs at ingestion, storage, and preview-render stages; validate image URL quality before images are selected for hero or about sections; detect duplicate and low-quality patterns; and fail previews whose hero imagery is missing, invalid, or clearly non-photographic.

A technically rendered preview is **not** considered healthy if image failures are masked by transparent placeholders. Automated QC must treat invisible failures as failures and direct the system toward an approved category fallback or a blocking review issue.

## Failure Handling

If a preview fails any rule, the reviewer or automation must document the exact issue, assign the corrective action, and keep the site out of the outreach batch until the fix has been confirmed on the live preview URL. Image issues should identify whether the failure came from malformed URLs, insufficient photo coverage, duplication, low-quality metadata, contextual mismatch, or fallback misuse so the repair path is obvious.
