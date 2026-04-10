# BlueJays Visual QC Review Guide — Mandatory Before Preview Queue

> This document is the single source of truth for reviewing every generated prospect site before it enters Ben's preview queue. Every rule here comes directly from Ben or from lessons learned during production. No site moves to `pending-review` without passing every check in this guide.

## Core Philosophy

These preview sites are the **secret sauce** of BlueJays. Every prospect receives a link to a custom-built website via text or email. That first impression determines whether they become a $997 customer. The site must look like it was **hand-crafted for that specific business** — not a template, not a generic placeholder, not a broken page.

**Prospects open these on their phone from a text message.** Mobile is primary. Desktop is secondary.

---

## Review Process — One Site at a Time

Every site must be reviewed **individually**. No batch-grading from data alone. No skipping sites. No grading from code inspection.

### For Each Site, the Reviewer Must:

1. **Open the live preview URL** in a browser at `https://bluejayportfolio.com/preview/{prospect_id}`
2. **View the full page on desktop** — scroll through every section top to bottom
3. **View the full page on mobile (375px width)** — scroll through every section top to bottom
4. **Visit the prospect's existing website** (from the `website` field in Supabase) to understand what the business actually does, what services they offer, what their branding looks like, and what their vibe is
5. **Compare our preview to their existing site** — our version should feel like a premium upgrade, not a downgrade or a mismatch
6. **Grade the site** and fix any issues directly in Supabase before moving on to the next one

---

## Grading Scale

| Grade | Meaning | Action |
|-------|---------|--------|
| **A** | Ready to send to the prospect. Looks hand-crafted, professional, all images load, colors work, copy is specific. | Move to `pending-review` for Ben's final approval |
| **B** | Minor issues — one image slightly off, a small copy tweak needed. Fixable in under 2 minutes. | Fix it immediately, then re-grade as A |
| **C** | Multiple issues — wrong color scheme, generic copy, some broken images. Needs real work. | Fix all issues, then re-grade |
| **D** | Broken or unusable — hero image missing, page doesn't load, completely wrong content. | Fix everything, then re-grade |

**Only A-grade sites enter the preview queue. Period.**

---

## Image Rules (NON-NEGOTIABLE)

### Hero Image
- **Must load successfully** (HTTP 200) — no broken images, no alt text showing, no empty space
- **Must be high quality** — minimum 800px wide, landscape/wide format preferred
- **Must be relevant to the business category** — a dental office gets a dental image, a landscaper gets an outdoor/garden image, etc.
- **Must NOT be a logo, favicon, Google Maps screenshot, or thumbnail**
- **Must look premium on both desktop AND mobile** — use `object-cover`, properly centered, no awkward cropping
- **If no good hero image exists**, use an approved high-quality Unsplash image that matches the category
- **Every hero image URL must be verified with an HTTP HEAD request before approval**

### Gallery/Portfolio Images
- **Every image must load** (HTTP 200)
- **No duplicate images** within the same site — every gallery image must be different
- **Images must match the business category** — roofing shows roofs, salons show hair, vets show animals
- **Minimum 3 images for standard categories, minimum 5 for gallery-heavy categories** (tattoo, photography, interior-design, florist, landscaping, salon, catering, pet-services)
- **No low-resolution images** — minimum 400px wide
- **No Google Maps photos, street view screenshots, or map pins as gallery images**

### Before/After Sections
- **Only include before/after sections for transformation-based businesses** where visual change makes sense: landscaping, painting, pressure-washing, roofing, cleaning, construction, fencing, tree-service, salon (hair transformations)
- **Remove before/after sections for businesses where it doesn't make sense**: law firms, accounting, insurance, church, tutoring, daycare, martial-arts, restaurant, medical, veterinary, photography, florist, catering
- **If before/after is included, both images must load and clearly show a transformation**

### Image Verification
- **Every single image URL must be tested with an HTTP HEAD request**
- **Any URL returning non-200 status must be replaced before the site can pass QC**
- **Unsplash URLs must be verified** — the AI has previously hallucinated fake Unsplash photo IDs that return 404

---

## Color Scheme Rules (NON-NEGOTIABLE)

### Brand Colors
- **Scrape the prospect's existing website for their brand colors** — if they use blue and white, our preview should use blue and white (or a refined version)
- **Brand colors must be applied to ALL versions** (V1 and V2)
- **Colors may be slightly adjusted** for readability (e.g., brightening a too-dark accent), but the overall feel should match their brand
- **If the prospect has no existing website or no clear branding**, choose a professional palette that fits the industry category

### Color Scheme Quality
- **Text must be readable against its background** — no light text on light backgrounds, no dark text on dark backgrounds
- **The color scheme must look professional** — no clashing neon combinations, no jarring contrasts
- **Dark theme and light theme must both look good** — if the site has a theme toggle, both modes must pass visual inspection
- **Elements must have sufficient contrast** — buttons, links, headings, and body text must all be clearly visible
- **The overall palette should feel cohesive** — accent colors, backgrounds, text, and borders should work together as a unified design

### Theme (Dark/Light)
- **Choose the theme that best fits the business** — some businesses look better dark (nightlife, tattoo, photography), others look better light (dental, daycare, florist, medical)
- **The chosen theme must be saved to the prospect record** so it persists

---

## Copy Rules (NON-NEGOTIABLE)

### Business Name
- **Must be the exact business name** — not a shortened version, not a guess, not "Your Business"
- **Must appear in the nav, hero section, about section, and claim banner**
- **The claim banner must say "This website was built for {Business Name}"**

### About Section
- **Must explicitly name the business** and explain what it actually does
- **Must be specific to THIS business** — mention their city, their specialties, their unique selling points
- **No generic "proudly serving the community" filler** that could apply to any business
- **Compare against their existing website** — the about text should reflect what they actually say about themselves, upgraded to sound more professional

### Services
- **Must list services the business actually offers** — check their existing website
- **No default category filler** (e.g., don't just list "General Dentistry, Cosmetic Dentistry, Orthodontics" for every dental office)
- **Services should match what the business advertises** on their own site, Google listing, or social media

### Tagline
- **Must be specific to the business** — not a generic industry tagline
- **Should communicate what makes this business different** or what they're known for
- **No placeholder text** like "Your trusted local provider"

### Footer
- **Must say "Created by bluejayportfolio.com" with a clickable link**
- **Must NOT say "BlueJay Business Solutions" or any other variation**

---

## Contact Information Rules

- **Phone number must be real** — verified against the prospect's existing website or Google listing
- **Address must be accurate** — city, state at minimum; full address preferred
- **No placeholder phone numbers** like "(555) 123-4567" or "Call Us Today"
- **No placeholder addresses** like "123 Main Street"
- **If the business has no public phone number**, use what's available from their Google listing

---

## Layout and Responsiveness Rules

### Desktop
- **All sections must render properly** — no overlapping text, no cut-off images, no broken layouts
- **Proper spacing between sections** — not cramped, not excessively spaced
- **Navigation must work** — all nav links should scroll to the correct section

### Mobile (375px — THIS IS PRIMARY)
- **Every section must look good at 375px width** — this is where prospects first see the site
- **Hero image must display properly** — no awkward cropping, no tiny image, no empty space
- **Text must be readable** — not too small, not overflowing its container
- **Buttons must be tappable** — proper size, proper spacing
- **No horizontal scrolling** — everything must fit within the viewport
- **Gallery images must stack properly** — not tiny thumbnails, not overflowing

### Premium Feel
- **Every site must feel premium from the first pixel** — the hero section is the first thing prospects see
- **No empty/flat text-only heroes** — must have a background image, animated gradient, or decorative visual element
- **Animations should be smooth and purposeful** — not distracting or broken
- **The overall impression should be "wow, someone built this for MY business"**

---

## Template Selection Rules

- **Use V2 templates when available** for the business category
- **Template must match the business category** — don't use a dental template for a landscaper
- **Gallery-heavy categories must use gallery-forward layouts** with prominent visual portfolios

---

## Claim Banner Rules

- **Must be present on every preview site**
- **Must show the correct business name**
- **Must have a working "Claim Your Website" CTA button**
- **Must show the preview expiration timer**
- **Must say "Custom-built preview for this business"**

---

## What Passes vs. What Fails — Quick Reference

| Check | Pass | Fail |
|-------|------|------|
| Hero image | Loads, relevant, high-res, looks great on mobile | Broken, alt text showing, logo as hero, irrelevant stock photo |
| Gallery | 3-5+ unique, relevant, loading images | Duplicates, broken URLs, irrelevant images, less than 3 |
| Colors | Professional, cohesive, readable, matches brand | Clashing, unreadable text, random palette, doesn't match business |
| About text | Names the business, specific details, sounds professional | Generic placeholder, could apply to any business, "Your Business" |
| Services | Real services from the business's actual offerings | Default category list, irrelevant services, empty |
| Mobile | Everything looks great at 375px | Broken layout, tiny images, horizontal scroll, unreadable text |
| Footer | "Created by bluejayportfolio.com" with link | "BlueJay Business Solutions" or any other text |
| Phone/Address | Real, verified contact info | Placeholder, missing, incorrect |
| Before/After | Only present when it makes sense, both images load | Present on law firm, broken images, no visible transformation |

---

## Enforcement

- **No site enters Ben's preview queue without passing every rule above**
- **The reviewer must actually look at each site** — not just check data fields
- **Every fix must be verified on the live preview URL after patching Supabase**
- **This guide must be followed for every new site generated, every re-review, and every batch QC run**
- **Any new rules Ben adds get appended here immediately and apply retroactively to all queued sites**

---

## Revision History

- **v1.0 (Apr 9, 2026)**: Initial comprehensive guide compiled from all of Ben's stated rules and preferences, plus lessons learned from the first 106-site review where broken Unsplash URLs, generic copy, and bad color schemes slipped through automated-only review.
