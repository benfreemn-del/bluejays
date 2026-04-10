@AGENTS.md

# BlueJays Project — The Money Printer

## Core Philosophy
This system is designed to function like a money printer. Every feature should drive toward one goal: scout businesses, build them premium websites, sell those websites at $1,000, and automate as much of the pipeline as possible. Efficiency = profit.

## Quality Rules (NON-NEGOTIABLE)
- **Every website must match OPS quality level** — the Olympic Protective Services site is the minimum quality bar. Numbered service cards, SVG icons (never emojis), section headers with accent words, decorative underlines, grid patterns, glow effects, rich hover states, industry-specific SVG patterns, and unique personality per category.
- **Every section must have a background** — no plain dark/flat sections. Use glows, patterns, gradients, or industry-specific SVG silhouettes. Every. Single. Section.
- **Generated preview sites MUST use V2 template components** — for any category that has a V2 template, generated preview sites must render using the V2 component (not the generic PreviewRenderer). The V2 template is the quality standard. A preview sent to a business owner should look identical to the V2 showcase, just with their data injected. The generic PreviewRenderer is only for categories without a V2 template.
- **Match theme darkness to the industry's vibe** — feminine/elegant businesses (salon, florist, daycare, photography, interior-design, catering) should use LIGHT themes (white/cream backgrounds, dark text). Masculine/trade businesses (electrician, plumber, roofing, auto-repair, towing, construction) should use DARK themes. Medical/professional (dental, law, insurance, accounting) can go either way but lean light for trust. This is a fundamental design principle — a salon site shouldn't look like a garage.
- **Each template must SCREAM its industry** — Real Estate screams luxury. Dental screams trust. Law screams authority. Landscaping screams nature. Salon screams beauty. If it could be any industry, it's not good enough.
- **$1,000 is the base price** — firm, no negotiation for agents. Period.
- **All generated sites and templates must use the footer credit** — `Created by bluejayportfolio.com`, with `bluejayportfolio.com` rendered as a clickable link to `https://bluejayportfolio.com`. Never use BlueJay Business Solutions wording, BluejayLogo branding, or any other footer variation.
- **Review approval required** — sites go to "pending-review" before outreach, not straight to "contacted".
- **Color review agent must pass** — every generated site's color scheme is reviewed for vibrancy and category fit before approval.
- **Social proof overlays MUST use real data or be removed. NEVER show fake or inflated numbers.**
- **Personalized proposals MUST be generated before entering the sales funnel, combining all CRM data, scraped info, reviews, and notes.**

## Visual QC Rules
1. **No duplicate images within a site** — compare by Unsplash photo ID, not just exact URL. Same photo with different query params counts as a duplicate.
2. **Every image URL must be HTTP-verified** (HEAD request, status 200) before saving to Supabase.
3. **Hero copy must be short** — 5-10 word tagline max, one supporting sentence. No walls of text on the hero section.
4. **Use the business's real logo** in the header top-left if a high-quality version is available. Don't force a bad/blurry logo.
5. **Every site must be visually reviewed** — actually open it in a browser on desktop AND mobile (375px). Don't just check the data.
6. **Compare against the business's real website** for brand colors, services, and tone.
7. **Before/after sections only for transformation businesses** (landscaping, painting, cleaning, pressure washing) — remove for law firms, accounting, dental, insurance, etc.
8. **Footer must say "Created by bluejayportfolio.com"** — NOT "BlueJay Business Solutions" or any other variation.
9. **No hallucinated Unsplash URLs** — only use known working photo IDs or search the Unsplash API. Never guess a photo ID.
10. **About text must name the business and reference what they actually do** — no generic placeholder copy.
11. **Services must match the business's real offerings** from their actual website.
12. **No logos used as hero images.**

## Project Rules
1. **Pricing**: $1,000 upfront per website + $100/year maintenance. Domain and hosting included (~$15-17/year cost per client).
2. **Never assume a site passes QC** without visually reviewing it in the browser.
3. **When a batch fix fails to save to Supabase**, don't declare victory — always verify with a re-fetch after patching.
4. **Don't give up on fixing all sites in a batch** — if some fail, fix ALL of them before reporting done.
5. **When updating site_data in Supabase**, the column is JSONB. Send the value as a JSON object, NOT a stringified JSON string.

## Locked QC Generation Rules (NON-NEGOTIABLE)
Every AI agent, generator, reviewer, and automation path that creates or updates a prospect site MUST treat the QC standards below as blocking release requirements. These rules are permanently embedded from `QC_RULES.md` and are not optional polish. A generated site that fails any requirement below is **not ready** for outreach, manual review, owner delivery, or deployment.

### 1. Image Integrity, Validation, and Fallback Rules
- **MUST sanitize every stored and rendered image URL before validation, proxying, or display** — trim leading/trailing whitespace, newline characters, tabs, control characters, and `%0A`-style corruption before using any URL.
- **MUST only accept well-formed `http` or `https` image URLs for production imagery** — malformed URLs, `data:` URIs for hero/gallery images, localhost references, and dead placeholder URLs are immediate QC failures.
- **MUST verify every major image URL actually resolves before approval** — hero, about, gallery, testimonial, supporting, and logo images must return a valid response and render visibly.
- **NEVER count a transparent pixel, invisible placeholder, broken proxy response, blank image, or silently hidden asset as a pass** — failed images must surface as blockers or be replaced with an approved visible fallback.
- **MUST use the image proxy for external business photos that require stable server-side access** — Google Places and expiring Wix/Squarespace-style CDN assets must be proxied before rendering. Approved Unsplash fallbacks may render directly.
- **NEVER store raw `maps.googleapis.com/maps/api/place/photo` URLs in final `site_data`.** Those Google Maps photo endpoints are temporary source inputs, not production image URLs; they must be proxied, validated, or replaced before approval.
- **MUST prefer validated real business photos from the business website, Google Places, or validated social sources over stock whenever those real photos are good enough.**
- **MUST use approved high-quality Unsplash fallbacks when real photos are missing, broken, expired, duplicate-heavy, blurred, thumbnail-sized, off-brand, or otherwise unusable.**
- **NEVER use logos, icons, favicons, screenshots, collages, or thumbnail-scale assets as hero/about/gallery imagery.**
- **MUST reject risky low-quality image patterns** — thumbnail dimensions, blur parameters, screenshot assets, obvious logo crops, expiring-token URLs, or other metadata that strongly suggests poor quality or poor longevity must be downgraded, replaced, or rejected.
- **MUST treat duplicate URLs, query-string variants of the same asset, and visually repeated major images as duplicates for QC purposes.**
- **NEVER reuse the same major image across hero, about, gallery, testimonial, or supporting sections unless there is a deliberate business reason and no stronger alternative exists.**
- **MUST keep hero, about, and gallery imagery visually distinct whenever enough usable assets exist.**
- **NEVER reuse the same stock photo across multiple templates or prospects when a unique category-appropriate alternative is available.**
- **ALL V2 preview templates MUST use the shared stock image picker** at `@/lib/stock-image-picker` for fallback image selection. This utility uses deterministic hashing by business name to ensure different businesses get different stock photos. Templates must: (1) import `pickFromPool` and `pickGallery` from the shared utility, (2) store stock images in `STOCK_HERO_POOL`, `STOCK_ABOUT_POOL`, and `STOCK_GALLERY` arrays (not single constants), (3) use `pickFromPool(pool, data.businessName)` for hero/about fallbacks, (4) use `pickGallery(pool, data.businessName)` for gallery fallbacks. Gallery pools must have at least 8 images to prevent collisions. The picker guarantees zero duplicates within a single preview via Set-based dedup.

### 1.5 ZERO DUPLICATE IMAGE POLICY (ABSOLUTE — NO EXCEPTIONS)
This policy applies to ALL images everywhere in the system — scraped, stock, generated, hero, about, gallery, card, testimonial, CTA, and any other section.

**Within a single preview (same business):**
- **NEVER show the same image twice on the same page.** Hero background, hero card, about section, gallery items, testimonial backgrounds, CTA sections — every image slot MUST be a unique URL. If the scraped photo array contains duplicates, deduplicate with `new Set()` before assigning to slots.
- **Hero background and hero card MUST be different images.** If only one photo exists, use a stock fallback for the card — never show the same photo side by side.
- **About image MUST differ from hero.** If `photos[1] === photos[0]`, skip to `photos[2]` or a stock fallback.
- **Gallery images MUST all be unique.** Use `pickGallery()` which has Set-based dedup built in.

**Across previews (different businesses in the same category):**
- **Different businesses MUST get different stock fallback images.** The `pickFromPool()` function uses business-name hashing to deterministically assign different images to different businesses. NEVER use a single hardcoded `const STOCK_HERO = "url"` — always use `STOCK_HERO_POOL` arrays with `pickFromPool()`.
- **Stock image pools MUST have at least 8 unique images per category** to ensure adequate variety across businesses.

**Across categories (different template types):**
- **NEVER share the same Unsplash URL between two different category templates.** A photo used in the electrician template must not appear in the plumber template. Run `bash scripts/validate-images.sh` to check.

**In the generation pipeline:**
- **The scraper MUST deduplicate photo URLs before saving to prospect data.** Remove exact URL matches AND query-string variants of the same base URL.
- **The quality gate MUST reject any preview where the same image appears more than once** across hero, about, gallery, or card sections.
- **The image quality agent MUST check for visual duplicates** — two different URLs that show the same image (e.g., different crop sizes from Google Places) count as duplicates.

**Implementation requirements:**
- ALL templates must `import { pickFromPool, pickGallery } from "@/lib/stock-image-picker"`
- ALL templates must deduplicate `data.photos` with `[...new Set(data.photos)]` before using
- ALL stock arrays must be named `STOCK_*_POOL` (arrays, never single strings)
- The `getPreviewImages()` helper in `stock-image-picker.ts` handles all of this automatically — use it when possible

### 2. Minimum Photo Coverage Requirements

| Category group | Hard requirement |
|---|---|
| Standard service categories | **MUST have at least 3 usable real photos** that can cover the hero, about/supporting section, and at least one additional gallery image. |
| Gallery-heavy categories | **MUST have at least 5 usable real photos** suitable for hero, about, and gallery use. This applies to `tattoo`, `photography`, `interior-design`, `florist`, `landscaping`, `salon`, `catering`, and `pet-services`. |
| Zero-photo prospects | **NEVER treat zero real photos as approval-ready.** Approved stock fallbacks may keep the preview visually functional, but the site still fails QC until the imagery gap is corrected or consciously waived. |

### 3. Hero Image Requirements
- **Every site MUST display a real, contextual hero image above the fold on desktop and mobile** unless that category has an explicitly approved image-free hero treatment.
- **Text-only heroes are NOT allowed by default.** A plain dark or flat hero without a real visual treatment fails QC.
- **The promoted hero image MUST exist, render visibly, and be relevant to the business category, brand vibe, or core service.**
- **Hero images MUST be at least 800px wide, or the URL metadata must strongly indicate comparable or better quality.**
- **The hero image MUST NOT be a logo, favicon, icon, screenshot, thumbnail, or badly cropped asset.**
- **No V2 template may layer a decorative animation, loading animation, SVG effect, particle system, or floating glow on top of a hero image section.** If a V2 hero uses a real hero image, the hero image itself plus readability overlays may remain, but animated or decorative foreground layers must be removed from that hero section.
- **Hero framing MUST feel premium on desktop and mobile** — use intentional centering and cropping, not awkward empty space, cut-off subjects, or logo zoom-ins.
- **If no good hero image is available, the system MUST use an approved category fallback rather than shipping a broken, low-res, or irrelevant hero.**

### 4. About, Gallery, and Industry-Relevance Rules
- **About and gallery images MUST be at least 400px wide, or the URL metadata must strongly indicate comparable or better quality.**
- **Gallery and project images MUST match the business category and the section purpose.** Roofing must show roofs, pet services must show pets, interior design must show interiors, landscaping must show outdoor work, and so on.
- **Gallery-heavy categories MUST use gallery-forward layouts and prominent visual proof, not token filler images.**
- **NEVER approve a site whose gallery is populated with irrelevant, repeated, or obviously generic filler imagery.**

### 5. Before/After Rules
- **ONLY use before/after sections for transformation-based businesses where a real or clearly valid transformation story exists.**
- **Both images in a before/after pair MUST show the same type of thing** — for example, both roofs, both lawns, both bathrooms, both driveways, or both painted surfaces.
- **The “before” image MUST look worse than the “after” image and MUST communicate a real transformation.**
- **Both images MUST be relevant to the industry and make sense as a pair.**
- **Both before/after URLs MUST load successfully and MUST be visually reviewed as a matched pair.**
- **If no strong, matched, industry-relevant pair is available, NEVER include a before/after section. Use a regular gallery or another proof section instead.**
- **After modifying a before/after section, the agent MUST run `npx tsx scripts/validate-before-after.ts` and must describe in plain English what each image shows and why the pair is valid.**

### 6. Content and Business Accuracy Rules
- **NEVER ship placeholder text, lorem ipsum, generic filler copy, fake phone numbers, fake testimonials, unfinished sections, or “Call Us Today” style stand-ins.**
- **Business name, phone number, address, services, and about copy MUST be real, prospect-specific, and production-ready before the site can pass QC.**
- **The business name MUST be the real business name** — reject values such as `website`, `My Site`, `Home`, or any other generic placeholder and fall back to the prospect record when necessary.
- **`site_data.businessName` MUST exactly match `prospects.business_name` unless a documented manual override exists.** Do not rewrite, shorten, or generalize the business name.
- **Taglines MUST be business-specific and category-relevant.** Reject vague slogans and generic marketing filler unless the line clearly names the business or describes a real local differentiator.
- **About copy MUST explicitly name the business and explain what it actually does.** Generic “proudly serving” filler, placeholder introductions, and broadly interchangeable copy fail QC.
- **Services MUST be populated with real or confidently extracted business-specific services, not default category filler.**
- **Service lists MUST match the business category and actual offering.** Reject empty lists, obviously irrelevant services, or generic category defaults that could fit any prospect in the niche.
- **Social links must be preserved or omitted conservatively.** NEVER invent, guess, or swap in uncertain social profiles just to fill the field.
- **Social proof overlays, metrics, and badges MUST use real data or be removed. NEVER invent or inflate credibility signals.**
- **The claim banner and all business-identifying copy MUST show the actual business name, not a placeholder.**

### 7. Contact Formatting Rules
- **A real phone number MUST be present before generation approval.** If no real phone number is found, the prospect stays in processing/manual-review.
- **When a phone number or address exists in the prospect record, copy that source value exactly into `site_data` unless a documented correction is available.** Do not generate alternate formats or conflicting contact values.
- **Phone numbers MUST render as clickable `tel:` links and MUST be visibly formatted as real business phone numbers.**
- **Addresses MUST be present when available and MUST render as clickable Google Maps links using the encoded address.**
- **Address fields MUST be normalized to the exact business address without appended county names, duplicate state fragments, or other redundant geography.**
- **NEVER mark a site as ready if contact information is missing, malformed, placeholder-filled, or visually hidden.**

### 8. Template Selection and Readiness Rules
- **Generated preview sites MUST use the highest-quality category-appropriate renderer available.** If a V2 template exists for the category, the preview MUST use the V2 component. The generic `PreviewRenderer` is ONLY allowed for categories that do not yet have a V2 renderer.
- **Template selection MUST match the business category, tone, image density, and proof style.** If the assigned template does not clearly fit the business category, the site fails QC.
- **Gallery-heavy categories MUST use gallery-forward templates. Transformation-service categories MUST only include before/after when the pair passes all before/after rules above.**
- **A site MUST remain in `generated` or another non-ready state until every locked QC rule passes. It MUST NEVER move to `pending-review` or outreach-ready status while any blocker remains.**

### 9. QC Enforcement Reminder
- **MUST verify both desktop and mobile before approval.**
- **MUST verify hero visibility, image loading, business identity accuracy, contact info, and link integrity before a site is considered ready.**
- **If any locked QC rule fails, the reviewer or automation MUST log the exact issue and keep the site out of the outreach batch until the fix is confirmed.**

## Customization Rules (NON-NEGOTIABLE)
Every generated website MUST be heavily customized to the specific business. Generic is unacceptable. The site generation agent must:
- **Use the business's actual logo** if available (scraped from their current site or Google Business Profile). If no logo, generate a text-based logo with their name in a style matching the industry.
- **Match their brand colors** — scrape their existing site/socials for brand colors and use those as the accent color. Only fall back to category defaults if no brand colors are found.
- **Use their actual photos** — pull photos from their Google Business Profile, existing website, and social media. Prioritize real photos over stock only when those real photos pass the locked QC rules above.
- **Match their copywriting style** — if their current site is formal, be formal. If casual and friendly, match that tone. Scrape their "about" text and mirror the voice.
- **Include their real services, real prices, real testimonials** — never use placeholder data when real data is available from scraping.
- **Each generated site must feel like THEIR site** — not a template with their name swapped in. If you showed it to the business owner, they should think "this was made specifically for me."
- **All addresses MUST be clickable Google Maps links** — every address on a generated site, V2 template, or preview must be wrapped in `<a href="https://maps.google.com/?q=ENCODED_ADDRESS" target="_blank">`. This is critical for mobile — users tap the address to get directions instantly. No plain text addresses anywhere. Phone numbers must also be clickable `tel:` links.
- **Always incorporate the business's brand colors and logo** — when the scraper extracts brandColor from their website, the V2 dynamic renderer must use it as the accent color (replacing the category default). When a logo URL is scraped, display it in the nav instead of the text-based name. The generated site should feel like THEIR brand, not our template's default colors.

## Verification Rules (NON-NEGOTIABLE)
- **ALWAYS use Chrome browser tools (screenshots, Chrome extension) to verify work** — you have PERMANENT PERMISSION to use Chrome tools for verification. Never assume anything works without visually confirming it.
- **After generating a preview site**: open it in Chrome, take a screenshot, verify: business name correct, real phone number, real services, images load, hero has a background (not plain dark), sections have backgrounds/patterns/glows.
- **After any UI change**: screenshot the page in both desktop AND mobile to verify layout.
- **After fixing a bug**: verify the fix on the LIVE site, not just that the build passes.
- **Check generated preview sites for**: real phone number, real address, real services, scraped content actually used, hero image relevant to industry, social links present if available, NO plain/flat sections.
- **A preview with placeholder data (generic tagline, no real services, no background images) is UNACCEPTABLE** — the site must be fully populated before being shown.
- **Chrome verification is MANDATORY, not optional** — every generated site, every deploy, every UI change must be visually confirmed via Chrome screenshot. This is a system rule, not a suggestion.
- **EVERY change Ben requests must be verified via Chrome after deployment** — when Ben asks for a fix, deploy it, then open Chrome, navigate to the page, screenshot it, and confirm the fix is live. Do NOT just say "done" without visual proof. This is non-negotiable.

## Data Extraction Failsafe Rules (NON-NEGOTIABLE)
When extracting business data, NEVER rely on a single method. Use a cascading failsafe chain:
- **Level 1 — Cheerio HTML scraper**: Try the traditional HTML scraper first. If it returns data, use it.
- **Level 2 — Google Places Details API**: If the scraper returns no phone/website, fetch Place Details (phone, website, hours, photos) using the Google Places API place_id.
- **Level 3 — WebFetch with AI extraction**: If the business website uses JavaScript rendering (React/Next.js/WordPress with lazy load) that Cheerio can't parse, use WebFetch to render the page and extract data with AI.
- **Level 4 — Web Search**: If all else fails, search the web for "[business name] [city] phone services" and extract data from results (Yelp, BBB, Google, Facebook).
- **Every prospect MUST have a phone number before generation** — if none of the above methods find one, the prospect stays in "scouted" status and is flagged for manual review.
- **Design these as systems, not one-offs** — every extraction method should be a reusable function that works for any business in any category. The pipeline must get more efficient over time, not require manual intervention.

## Quality Gate — TWO Failsafes (NON-NEGOTIABLE)

### Failsafe 1: Automated Data Quality Gate
Before a site can move from "generated" (processing) to "pending-review" (ready):
- **Must have real phone number** (not "Call Us Today" or placeholder)
- **Must have real services** (not default category services)
- **Must have real about text** (not generic template text)
- **Must have a hero background** (image or rich gradient, not plain dark)
- **Must have section backgrounds** (glows, patterns, images — no flat sections)
- If ANY of these fail, the site stays in "generated" status. Period.

### Failsafe 2: Visual Quality Review Agent (Chrome) — MANDATORY
After Failsafe 1 passes, a quality review agent MUST:
- **Open the generated site in Chrome** and take screenshots (desktop + mobile)
- **COMPARE AGAINST THE HIGHEST VERSION OF THAT CATEGORY'S TEMPLATE** — if a V2 exists for that category, the generated site must match V2 quality. If only V1 exists, match V1. The agent must explicitly state: "This site is comparable to [V1/V2] [category] template quality" or "This site does NOT match [V1/V2] quality because [reasons]"
- **The comparison is non-negotiable** — the agent must open both the generated preview AND the best template for that category side-by-side (or in sequence) and confirm they're at the same level
- **Check for**: broken images, missing backgrounds, placeholder text, generic content, missing phone numbers, flat/plain sections, wrong brand colors
- **Check customization**: does it feel like THIS business's site? Or just a template with their name swapped in?
- **Verdict: PASS or FAIL** — if FAIL, the site stays in "generated" and the agent logs what needs to be fixed
- **Only a PASS from the visual review agent allows promotion to "pending-review"**
- This agent has PERMANENT PERMISSION to use Chrome extensions and screenshots
- **Current highest templates by category**: electrician=V2, plumber=V2, hvac=V2, roofing=V2, auto-repair=V2, dental=V2, law-firm=V2, salon=V2, fitness=V2, real-estate=V2, church=V2, chiropractic=V2, veterinary=V2, photography=V2, interior-design=V2, landscaping=V2, cleaning=V2, pest-control=V2, accounting=V2, tattoo=V2, florist=V2, moving=V2, daycare=V2, insurance=V2, martial-arts=V2, pool-spa=V2. Remaining V1 only: general-contractor, catering, pet-services, physical-therapy, tutoring.

### Failsafe 2.5: Brand Asset Preservation & Verification (MANDATORY)
**Preservation rule:** When re-scraping or re-generating a prospect, NEVER overwrite existing brand assets with empty/default values. The generate route MUST merge new extraction data with existing scrapedData, preserving:
- `brandColor` — if already set, keep it. Only overwrite if the new extraction found a BETTER color.
- `logoUrl` — if already set, keep it. Only overwrite if a higher-quality logo is found.
- `photos` — merge arrays, don't replace. Add new photos, keep existing ones.
This prevents manual curation work from being wiped by automated re-scraping.

**Verification rule:**
Before any site can proceed past the quality gate, verify it has attempted to scrape and use:
- **Brand color** — `data.accentColor` must NOT be the category default unless no brand color exists on their website. If they have a website, re-scrape specifically for brand colors (theme-color meta, CSS custom properties, prominent button/header colors).
- **Logo** — `data.logoUrl` or a logo image in `data.photos`. If their website has a logo, it must be in the generated site nav. Only use text-based logo as fallback if no logo can be found anywhere.
- **Real photos** — `data.photos` must contain Google Place photos or scraped website images. Zero photos = FAIL. The cascading extractor (Level 1-4) must have been run.
- **If a prospect has a website and we didn't get their brand color or logo, that's a pipeline failure** — re-run the extractor before proceeding. The business owner will immediately notice if their site doesn't use their colors.

### Failsafe 3: Image Quality & Visual Premium Agent
This agent reviews scraped/Google photos BEFORE they go into the generated site:
- **Check image quality** — blurry, tiny, dark, or poorly composed photos must be REJECTED. In these cases, use high-quality stock photos instead. This is the ONE exception to the "real photos first" rule: a bad photo is worse than a good stock photo.
- **Check color scheme** — does the accent color work? Is the palette vibrant and professional? Does it match the industry's premium feel? A site with a muddy or clashing color scheme fails.
- **Check premium feel** — does this site look like a $1,000 product? Would a business owner be impressed? If it looks cheap, generic, or amateur, it FAILS.
- **Image replacement authority** — this agent has the authority to swap low-quality scraped photos for premium stock alternatives. Customization matters, but visual quality matters MORE. A stunning stock photo beats a blurry phone photo every time.
- **This agent's review is part of the pipeline** — no site can be marked "pending-review" without passing the image quality check.

### Failsafe 3.5: Content & Layout Quality Review (MANDATORY before showing to Ben)
Before ANY preview is shown to Ben, a quality agent MUST check:
- **Hero text size and length** — the hero heading must be SHORT (business name or a compelling tagline, NOT a full description or URL). If the scraped tagline is too long (>60 chars), truncate it or use just the business name. Long text in the hero looks terrible and unprofessional.
- **Business name in nav** — the nav must show the actual business name, NOT "website" or a generic placeholder. If scraped businessName is empty, use the prospect's businessName from the database.
- **Hero image quality** — the first photo should be a REAL photo of the business, not a cropped logo. If data.photos[0] is a logo (detected by URL containing 'logo'), use data.photos[1] for hero and display the logo in the nav instead.
- **Text overflow** — no text should overflow its container, get cut off mid-word, or wrap in ugly ways. Check hero, service cards, testimonials, about section.
- **Image centering and cropping** — hero images must use `object-cover` and be properly centered. Logos used as hero images look terrible (zoomed in, cropped).
- **Claim banner text** — must show the actual business name, not "website" or placeholder.
- **These checks run on EVERY generated preview before status promotion.**

### Failsafe 4: Image Quality Review Agent (MANDATORY before showing to Ben)
Before ANY preview is shown to Ben (marked "pending-review"), an image review agent MUST:
- **Check every image loads** — visit each URL in data.photos, verify HTTP 200. Replace broken ones with stock.
- **Check image centering** — hero images must be properly centered/cropped. If an image shows mostly blank space, a wall, or an off-center subject, flag it for replacement.
- **Check for duplicates** — no two prospects in the same category should share any of the same photos (Google Place photos have unique URLs, but stock fallbacks can collide).
- **Check image quality** — reject blurry, tiny (<200px), dark, or poorly composed photos. A bad real photo is worse than a good stock photo.
- **Check logo rendering** — if logoUrl exists, verify it loads and would display correctly in the nav (not broken, not too large, not a full-page image being used as a logo).
- **This agent runs AFTER generation, BEFORE status promotion** — it's the last check before Ben sees the preview.
- **Log findings** — for each prospect, log: X images checked, Y passed, Z replaced, logo status, overall verdict PASS/FAIL.

### Boss/Orchestrator Agent Rules
A pipeline orchestrator agent manages the flow and enforces rules:
- **Monitors all prospect statuses** — if something is in "pending-review" that shouldn't be, it demotes it back to "generated"
- **Validates status transitions** — a prospect can ONLY move forward if it meets the requirements for the next stage
- **Valid transitions**: scouted → scraped (must have scraped data) → generated (must have generated site) → pending-review (must pass BOTH failsafes) → approved (Ben approves) → contacted
- **CANNOT skip stages** — no jumping from "scouted" to "pending-review"
- **Has permission to use Chrome, screenshots, and all verification tools**
- **Logs everything** — every status change, every quality check result, every flag
- **Alerts Ben** if a site that should be ready has quality issues

## Status Accuracy Rules (NON-NEGOTIABLE)
- **NEVER label a site as "pending-review" (Sites Ready) unless it passes BOTH quality failsafes** — automated data check AND visual Chrome review.
- **A site in "pending-review" means it's READY for the owner to see RIGHT NOW** — if you wouldn't send it to the business owner this second, it's NOT ready.
- **Dashboard status must reflect reality** — no prospect should show a status that doesn't match its actual state. If the preview is broken, half-baked, or uses placeholder data, the status must reflect that.
- **Before any outreach (email, text, DM), verify the preview is actually good** — never send a pitch with a broken or generic preview.
- **"Processing" means processing** — if data extraction is incomplete or the site needs work, it stays in processing. No exceptions.

## Agent Build Rules (NON-NEGOTIABLE)
When spawning sub-agents to build templates or components:
- **Explicitly instruct agents about image uniqueness** — agents WILL reuse URLs if not told otherwise. Every agent prompt must include: "Use UNIQUE photos not shared with any other template."
- **Agents must run `npm run build` to verify** — no declaring done without a clean build.
- **Agents must not use `initial={{ opacity: 0 }}` on generated/preview components** — content for business owners must be ALWAYS VISIBLE. Framer Motion opacity animations are only allowed on V2 showcase templates, never on PreviewRenderer or dynamic preview components.
- **Agents must verify image URLs load** — after building, grep all unsplash URLs and test at least 2-3 to confirm they return 200.
- **Every agent-built template needs a post-build image audit** — grep all image URLs, check for duplicates within the file AND across all other templates before pushing.
- **Run `bash scripts/validate-images.sh` after EVERY template build** — this script checks for cross-category duplicate Unsplash photos automatically. If it reports duplicates, FIX THEM before pushing. This is automated and non-negotiable.
- **Run `npx tsx scripts/validate-before-after.ts` after modifying any before/after section** — validates URLs load and flags pairs for visual review.
- **ZERO TOLERANCE for broken images on live portfolio sites** — before ANY V2 showcase or preview goes live, EVERY Unsplash URL must be tested with `curl -s -o /dev/null -w "%{http_code}"` and confirmed HTTP 200. This is the #1 recurring issue and it's unacceptable. If an agent builds a template, the agent MUST test every image URL before declaring done. Broken images showing alt text on a portfolio site destroys credibility instantly.
- **V2 hero SVG animations must be HIGH QUALITY and detailed** — every V2 template has an animated SVG in the hero section (piston for auto, tooth for dental, paw for vet, etc.). These MUST be detailed, recognizable, and premium-looking. No simple outline circles and lines — add fills with low-opacity gradients, inner highlights, glow effects, path-drawing animations, pulsing elements, sparkle accents. The animation is the first thing people see. If it looks like a rough sketch, rebuild it. Review the shape visually before pushing.
- **ALL V2 preview templates MUST use `@/lib/stock-image-picker`** for stock fallback images — never hardcode a single `STOCK_HERO = "url"` constant. Use `pickFromPool(STOCK_HERO_POOL, data.businessName)` and `pickGallery(STOCK_GALLERY, data.businessName)`. This prevents the same stock photo from appearing on multiple business previews in the same category. When building a NEW V2 template, always import and use this utility from day one.
- **People photos must show full faces** — always use `object-top` on headshot/portrait images so the face isn't cut off. Default `object-cover` centers on the middle of the image which cuts off heads. For team photos, agent photos, and testimonial photos, always add `object-top` or `object-[center_20%]` to keep faces visible.
- **Before/after images are CRITICAL — get them right or don't include them** — This has been messed up REPEATEDLY. Rules:
  1. BOTH images must show the SAME TYPE OF THING (e.g., both show roofs, both show bathrooms, both show lawns)
  2. The "before" must look WORSE than the "after" — that's the whole point
  3. Images must be RELEVANT TO THE INDUSTRY — a roofing before/after shows ROOFS not cabins and cars
  4. Before using ANY before/after images, describe what BOTH images show and confirm they make sense together
  5. If you can't find two matching industry-relevant images, DO NOT include a before/after section. Use a regular gallery instead.
  6. This applies to: roofing, painting, pressure-washing, landscaping, cleaning, and any other transformation-based service
  7. **AUTOMATED CHECK REQUIRED**: After ANY agent builds or modifies a before/after section, it MUST run the before/after validation script at `/scripts/validate-before-after.ts` which checks that both URLs load AND flags them for visual review. The agent must also describe in plain English what each image shows and confirm they match.
- **Gallery images must make sense for the industry** — a roofing before/after should show ROOFS, not luxury houses with pools. A pet gallery should show PETS, not stock photos of random objects. Industry relevance is non-negotiable.

## V2 Upgrade Checklist (MANDATORY when building a new V2 for any category)
When Ben asks to build a V2 (or higher) template for a category, ALL of these steps must be completed:
1. **Build the V2 showcase template** at `src/app/v2/[category]/page.tsx` + `layout.tsx` — 14+ sections, glass morphism, particles, Phosphor icons, mobile hamburger menu, unique photos, industry-specific personality
2. **Build the dynamic V2 preview renderer** at `src/components/templates/V2[Category]Preview.tsx` — same visual quality as showcase but accepts `GeneratedSiteData` props for dynamic business data injection. NO opacity:0 animations.
3. **Register in V2_RENDERERS map** at `src/app/preview/[id]/page.tsx` — add the new renderer so generated previews auto-route to V2
4. **Update homepage portfolio card** in `src/components/Hero.tsx` — change the card's `href` from `/templates/[category]` to `/v2/[category]`, update category label to "[Category] V2"
5. **Update CLAUDE.md version tracking** — update "Current highest templates by category" line to reflect new V2
6. **Run post-build image audit** — grep all image URLs, check for duplicates within file AND across all other templates
7. **Chrome verify on desktop AND mobile** — screenshot the showcase template AND a generated preview using the new V2 renderer
8. **Re-generate existing prospects** in that category — so they use the new V2 renderer instead of the old generic one
9. **Save the V2 process to memory** if any new patterns were learned

## Scouting Rules
- **Only scout categories that have a built template** — don't scout categories we can't generate premium sites for yet.
- **Current active categories** (have premium templates — all 30 categories have V1, 11 have V2): real-estate, dental, law-firm, landscaping, salon, electrician, plumber, hvac, roofing, auto-repair, chiropractic, fitness, veterinary, photography, cleaning, pest-control, accounting, moving, florist, daycare, insurance, interior-design, tattoo, martial-arts, physical-therapy, tutoring, pool-spa, general-contractor, catering, pet-services, church
- **Add new categories only after building their premium template first** — template first, then scout.
- **Categories with FULL V2 pipeline (showcase + dynamic renderer + preview routing)**: ALL 41 categories have V2 — electrician, dental, law-firm, salon, fitness, real-estate, church, plumber, hvac, roofing, auto-repair, chiropractic, veterinary, photography, interior-design, landscaping, cleaning, pest-control, accounting, tattoo, florist, moving, daycare, insurance, martial-arts, pool-spa, general-contractor, catering, pet-services, physical-therapy, tutoring, restaurant, medical, painting, fencing, tree-service, pressure-washing, garage-door, locksmith, towing, construction

## Version Toggle Rules (NON-NEGOTIABLE)
- **Every preview must have a V1/V2 toggle** — the preview-device page must allow Ben to flip between V1 (generic PreviewRenderer) and V2 (dynamic V2 renderer) for any prospect. This lets Ben compare quality levels.
- **Default to highest version** — when a prospect's preview loads, it should default to V2 if available, V1 otherwise.
- **If no V1 template exists for a category, the toggle is disabled** — only show the toggle when both versions are available.
- **Future versions (V3+)** — the toggle should support any number of versions as we upgrade categories.

## Preview = Product Rules (NON-NEGOTIABLE)
- **The preview URL IS the product** — `/preview/[id]` is the exact link sent to business owners in pitch emails, texts, and DMs. It must look like a $1,000 website, not a prototype.
- **Preview must match the V2 template quality for its category** — if electrician has a V2 template, the electrician preview must render with V2-level quality (14 sections, glass morphism, particles, trust badges, etc.)
- **Never send outreach with a generic-looking preview** — if the preview doesn't match V2 quality, it stays in processing until it does.
- **The preview is the pitch** — a business owner's first impression of our work. One chance. Make it count.

## Deployment Rules (NON-NEGOTIABLE)
- **Vercel deploys take 60-90 seconds after git push** — always wait for deploy before Chrome-verifying on the live site.
- **FROM_EMAIL must be hardcoded, not from env var** — the Vercel FROM_EMAIL env var was set to an invalid value causing "Invalid from email address" errors. Hardcoded to `bluejaycontactme@gmail.com` in email-sender.ts to prevent this.
- **Vercel serverless functions have READ-ONLY filesystems** — cannot write to `data/emails/` or any local directory. Skip file logging when `process.env.VERCEL` is set. Use Supabase for production logging instead.
- **When debugging API failures, check the ACTUAL error response** — don't assume it's the API key. Add error detail logging (response status + body) to every external API call. The error "SendGrid API failed" was useless — "Invalid from email address" was the real issue.

## Tech Stack
- Next.js 16 + React 19 + TypeScript + Tailwind v4 + Framer Motion
- Supabase for production database (with JSON file fallback for local dev)
- SendGrid for emails (LIVE — domain authenticated, sender verified)

## Auth
- Portfolio (/, /templates/*, /preview/*, /claim/*) = PUBLIC
- Dashboard, lead pages, API routes = PROTECTED (login required)
- Password: set via ADMIN_PASSWORD env var (default: bluejay2026)

## Approval & Pricing Rules (NON-NEGOTIABLE)
- **Ben approves ALL preview sites and final sites manually before they go live or enter the funnel. No site goes out without approval.** This applies to both standard and free-tier prospects. Every site must pass quality gates AND receive explicit manual approval from Ben before any outreach or deployment.
- **Free tier ($30) is for friends/family only. Default pricing tier is always standard ($1,000).** The free tier exists solely for prospects Ben personally tags as "free" in the dashboard. It charges $30 upfront (covers domain + server costs) instead of $1,000, but still creates the same deferred $100/year management subscription after 1 year. Never auto-assign free tier — it requires manual tagging by Ben.
- **Two pricing tiers exist**: Standard ($1,000 upfront → $100/yr after 1 year) and Free ($30 upfront → $100/yr after 1 year). The `pricing_tier` column on the prospects table controls which tier applies. The claim page, checkout API, and Stripe session all respect this field dynamically.

## Active Template Categories (41 total)
real-estate, dental, law-firm, landscaping, salon, electrician, plumber, hvac, roofing, auto-repair, chiropractic, fitness, veterinary, photography, cleaning, pest-control, accounting, moving, florist, daycare, insurance, interior-design, tattoo, martial-arts, physical-therapy, tutoring, pool-spa, general-contractor, catering, pet-services, church, restaurant, medical, painting, fencing, tree-service, pressure-washing, garage-door, locksmith, towing, construction

## Gallery-Heavy Categories
These categories MUST have prominent visual galleries/portfolios as a primary feature:
tattoo, photography, interior-design, florist, landscaping, salon, catering, pet-services

## Brand Color Rules
- Business brand colors MUST be scraped from the prospect's existing website during data extraction
- Scraped brand colors MUST be applied to ALL versions of the preview (V1 and V2)
- Colors may be slightly altered to better fit the template theme (e.g., adjusting saturation or brightness)
- If scraped colors are truly bad (clashing, unreadable, or unprofessional), they may be ignored in favor of the template's default palette
- The quality review system MUST verify that brand colors have been applied or intentionally overridden
- Brand color application should be checked as part of the quality gate before a site is marked 'pending-review'

## Template Image URL Quality Control (QC Rule)
- **Always review portfolio sites for broken URLs and duplicate images before deploying.** Every template and generated site must pass an image integrity check as part of the deployment pipeline.
- **Each template should use unique, category-appropriate images** — no two templates should share the same hero/gallery images. Every business category must have its own distinct visual identity with images that reflect the specific industry.
- **All image URLs must be valid and loading correctly** — no 404s, no placeholder URLs that don't resolve, no localhost references. Every `src` attribute, `background-image` URL, and any other image reference must return a valid image over HTTPS. Broken or placeholder image URLs are a deployment blocker.
- **EVERY image URL (hero, gallery, before/after) MUST be HTTP-verified (HEAD request, status 200) before saving to Supabase. Never use AI-generated/hallucinated Unsplash URLs. Use the Unsplash API or known-good curated URLs only. This is a recurring issue — the AI tends to hallucinate plausible-looking Unsplash photo IDs that return 404.**
- **No duplicate image URLs within a single site. Every image (hero, gallery, about, services, before/after, testimonials) must be a unique URL. After generating or fixing images, run a deduplication check — compare all URLs within the site and replace any duplicates with unique category-relevant alternatives.** This applies to both exact URL duplicates AND same Unsplash photo ID with different query parameters (e.g., `?w=800` vs `?w=1600` of the same photo ID are still duplicates). Use photo ID extraction (`/photo-XXXXXXX/` segment) to detect these cross-parameter duplicates.

## Hero Section Visual Quality (QC Rule)
- **Every template MUST have a visually engaging hero section** — either a background image, hero image, gradient with animation, or decorative SVG pattern. No empty/flat text-only heroes. First impressions are critical: prospects open these sites from a text message and the hero is the first thing they see.
- **Acceptable hero treatments**: full-bleed background image with overlay, animated gradient, decorative SVG silhouette pattern, or a prominent foreground hero image. A solid color or simple linear gradient with no visual element is NOT acceptable.
- **Mobile must look premium too** — hero images must use `object-cover` and be properly centered. Test at 375px width. A hero that looks great on desktop but breaks on mobile is a failure.

## Visual QC Review Guide
- **Every generated site MUST pass the full Visual QC Review Guide (VISUAL_QC_REVIEW_GUIDE.md) before entering Ben's preview queue.**
- **The reviewer MUST open each site in a browser, view it on desktop AND mobile (375px), visit the prospect's existing website, and compare.**
- **No automated-only review is sufficient. Every site must be visually inspected one at a time.**
- **Only A-grade sites (as defined in the guide) can move to pending-review status.**
- **See VISUAL_QC_REVIEW_GUIDE.md for the complete checklist.**
