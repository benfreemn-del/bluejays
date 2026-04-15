@AGENTS.md

# BlueJays Project — The Money Printer

## Core Philosophy
This system is designed to function like a money printer. Every feature should drive toward one goal: scout businesses, build them premium websites, sell those websites at $997, and automate as much of the pipeline as possible. Efficiency = profit.

## Quality Rules (NON-NEGOTIABLE)
- **Every website must match OPS quality level** — the Olympic Protective Services site is the minimum quality bar. Numbered service cards, SVG icons (never emojis), section headers with accent words, decorative underlines, grid patterns, glow effects, rich hover states, industry-specific SVG patterns, and unique personality per category.
- **Every section must have a background** — no plain dark/flat sections. Use glows, patterns, gradients, or industry-specific SVG silhouettes. Every. Single. Section.
- **Generated preview sites MUST use V2 template components** — for any category that has a V2 template, generated preview sites must render using the V2 component (not the generic PreviewRenderer). The V2 template is the quality standard. A preview sent to a business owner should look identical to the V2 showcase, just with their data injected. The generic PreviewRenderer is only for categories without a V2 template.
- **Match theme darkness to the industry's vibe** — feminine/elegant businesses (salon, florist, daycare, photography, interior-design, catering) should use LIGHT themes (white/cream backgrounds, dark text). Masculine/trade businesses (electrician, plumber, roofing, auto-repair, towing, construction) should use DARK themes. Medical/professional (dental, law, insurance, accounting) can go either way but lean light for trust. This is a fundamental design principle — a salon site shouldn't look like a garage.
- **Each template must SCREAM its industry** — Real Estate screams luxury. Dental screams trust. Law screams authority. Landscaping screams nature. Salon screams beauty. If it could be any industry, it's not good enough.
- **$997 is the base price** — firm, no negotiation for agents. It includes custom website design, domain registration, and hosting setup. The ongoing maintenance plan is $100/year and covers domain renewal, hosting, ongoing maintenance, and support.
- **All generated sites and templates must use the footer credit** — `Created by bluejayportfolio.com`, with `bluejayportfolio.com` rendered as a clickable link to `https://bluejayportfolio.com`. Never use BlueJay Business Solutions wording, BluejayLogo branding, or any other footer variation.
- **Review approval required** — sites go to "pending-review" before outreach, not straight to "contacted".
- **Color review agent must pass** — every generated site's color scheme is reviewed for vibrancy and category fit before approval.
- **Social proof overlays MUST use real data or be removed. NEVER show fake or inflated numbers.**
- **Personalized proposals MUST be generated before entering the sales funnel, combining all CRM data, scraped info, reviews, and notes.**

## Premium Preview Overhaul Rules (NON-NEGOTIABLE)
When manually reviewing/upgrading a preview from the dashboard:

### Brand Alignment
- **ALWAYS extract the business's real brand colors** from their website (use javascript_tool to read computed CSS). Set `accentColor` via the API. Never use template default teal/orange on a business with a completely different color scheme.
- **Match the template theme to the business vibe.** Family dental/vet/daycare = warm cream light theme. Trades/moving/construction = dark professional theme with boosted glows. Law firms = dark navy premium. Salons = soft pastels.
- **Use their actual tagline or philosophy** from their website, not generic "Modern X Care" copy.

### Data Enrichment Before Generation
- **Every business MUST have 6+ services with descriptions** before generation. If the scraper only got names, write descriptions from the website content.
- **Stats must be real** — years in business, Google rating, review count, awards. Pull from Google Places and their website.
- **About text must mention the owner/doctor by name**, the city, and what makes them unique. Generic "we provide quality service" copy fails QC.

### Template Theme Rules by Category
| Category | Theme | Background | Accent Style |
|----------|-------|-----------|-------------|
| dental, veterinary, daycare, church | Warm light | `#faf9f6` cream | Soft, friendly |
| salon, med-spa, florist, photography | Soft light | `#fefefe` white | Elegant, minimal |
| electrician, plumber, hvac, roofing, construction | Dark professional | `#1a1a1a` charcoal | Bold, high-contrast |
| moving, junk-removal, towing, tree-service | Dark bold | `#1a1a1a` with amber/orange | Strong, trustworthy |
| law-firm, accounting, insurance, real-estate | Dark navy | `#0f172a` slate | Premium, authoritative |
| restaurant, catering | Warm dark | `#1c1917` with warm accents | Appetizing, inviting |
| fitness, martial-arts | High contrast dark | Pure black with neon accent | Energetic, powerful |

### Category-Specific Features
- **Dental**: "Accepting New Patients" badge, insurance mention, emergency care callout, smile-related gallery titles
- **Veterinary**: Pet type icons (dog/cat), "Your Pet's Best Friend" tone, vaccination/wellness focus
- **Moving**: "Bonded & Insured" badge, free quote CTA, process steps (quote > plan > move > deliver)
- **Law Firm**: "Free Consultation" CTA, practice area cards, attorney credentials
- **Restaurant**: Menu section, reservation CTA, food photography gallery
- **Salon**: "Book Now" with service menu, stylist profiles, before/after gallery
- **Construction/Trades**: License numbers, "Free Estimate" CTA, project portfolio gallery
- **Medical/Dental**: Provider credentials (DDS, MD), insurance accepted, patient portal mention

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
1. **Pricing**: $997 one-time per website for custom website design, domain registration, and hosting setup. After launch, $100/year maintenance covers domain renewal, hosting, ongoing maintenance, and support.
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
- **Check premium feel** — does this site look like a $997 product? Would a business owner be impressed? If it looks cheap, generic, or amateur, it FAILS.
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

### Failsafe 4: Image Review on EVERY Generation (MANDATORY — NO EXCEPTIONS)
**EVERY time a website is generated or regenerated**, an image review MUST run. This is not optional. This is not "before showing to Ben" — it runs on EVERY generation, period.

The image review agent MUST:
- **HTTP-verify every image URL** — curl each URL in data.photos, hero pools, gallery pools, and any hardcoded Unsplash URLs. Verify HTTP 200. Replace any non-200 with a working alternative.
- **Check stock image pools in templates** — Unsplash photos get deleted over time. When running bulk operations, scan ALL V2 template stock pools for 404s and replace immediately.
- **Check /images/ local paths** — verify every `/images/xxx.png` reference has a matching file in `public/images/`.
- **Check image centering** — hero images must be properly centered/cropped. If an image shows mostly blank space, a wall, or an off-center subject, flag it for replacement.
- **Check for duplicates** — no two prospects in the same category should share any of the same photos.
- **Check image quality** — reject blurry, tiny (<200px), dark, or poorly composed photos. A bad real photo is worse than a good stock photo.
- **Check logo rendering** — if logoUrl exists, verify it loads and would display correctly in the nav.
- **This agent runs AFTER generation, BEFORE status promotion** — it's the last check before the preview is considered valid.
- **Log findings** — for each prospect, log: X images checked, Y passed, Z replaced, logo status, overall verdict PASS/FAIL.
- **Periodic full scan** — when doing bulk enrichment/regeneration across categories, run a full scan of ALL showcase pages AND ALL template stock pools for broken URLs. Unsplash deletions happen silently and can break dozens of sites at once.

### Portfolio Showcase Reference Rule (ALL AGENTS MUST FOLLOW)
When generating, reviewing, or improving any prospect's preview site, agents MUST reference the portfolio showcase for that category as the quality benchmark:
- **Portfolio showcases live at `/v2/[category]`** — these are the polished, beast-mode examples of what each category should look like
- **Before generating a site**, open the showcase for that category and compare: does the generated site match the showcase's quality level?
- **The showcase IS the gold standard** — if the generated preview doesn't match the showcase's feature set, polish, and visual quality, it's not ready
- **Always provide the specific showcase link** when referencing quality. For a dental prospect, link to `https://bluejayportfolio.com/v2/dental`. For a roofing prospect, link to `https://bluejayportfolio.com/v2/roofing`. Always use the exact category slug.
- **When in doubt, screenshot the showcase AND the generated site side-by-side** and verify they're at the same level
- **Portfolio URL pattern**: `https://bluejayportfolio.com/v2/[category]` (live) or `http://localhost:3000/v2/[category]` (dev)

### BlueJay Bird Logo in Footer (NON-NEGOTIABLE — ALL TEMPLATES AND SHOWCASES)
- **Every V2 preview template MUST render the BluejayLogo component in the footer** next to "Created by bluejayportfolio.com"
- **Every portfolio showcase page MUST have the inline bird SVG** in the footer credit line
- **The bird icon appears BEFORE the text** "Created by bluejayportfolio.com" with `flex items-center gap-1.5` alignment
- **Templates use**: `<BluejayLogo size={14} className="text-sky-500" />` (imported from `@/components/BluejayLogo`)
- **Showcases use**: inline SVG `<svg width="14" height="14" viewBox="0 0 32 32" ...>` with `className="text-sky-500"`
- **Position**: bottom footer, right-aligned or centered credit line — same position on every site
- **If you create a new template or showcase**, the bird logo MUST be in the footer. No exceptions.

### Sales & Outreach Rules (ALL AGENTS — NON-NEGOTIABLE)

**Every outreach message (email, SMS, AI response) MUST include:**
1. **Portfolio category link** — `https://bluejayportfolio.com/v2/[category]` — so prospects can see polished examples in their industry. Never send a preview link without also showing the portfolio.
2. **Payment plan mention for price objections** — "We also offer 3 payments of $349 if that's easier." This exists in the checkout system and must be mentioned whenever price resistance is detected.

**Objection handling — agents must know these responses:**
3. **"I already have a website"** → "We actually designed yours as an upgrade to your current site — we kept your branding and made the experience more modern and mobile-friendly. Compare them side by side on the claim page."
4. **"Who are you / is this legit?"** → "BlueJays is a web design studio that builds premium websites for local businesses. See our portfolio at bluejayportfolio.com — we've built sites for 30+ industries. Yours was custom-designed specifically for [businessName]."
5. **"Why not Wix/Squarespace?"** → Reference the comparison table on the claim page. Key points: we build it FOR you (they don't), 48-hour turnaround vs weeks, no monthly fees vs $16-45/mo forever, SEO + mobile included.
6. **"$997 is too much"** → ROI angle: "How much is one new customer worth to your business? At $997, you need just [X] new clients to pay for the entire site." Plus payment plan option.

**Preview page rules:**
7. **Stock photo disclaimer** — the preview page shows a banner: "Preview — images and content will be customized with your real business photos after purchase." This sets expectations so prospects don't think stock photos are the final product.
8. **Claim page must show** — ROI calculator, DIY comparison table, payment plan option, post-purchase timeline, satisfaction guarantee. These are all on the claim page and should be referenced in sales conversations.

**Banned phrases (NEVER use in any outreach or response):**
- "just following up" — filler, say something specific instead
- "no strings attached" — sounds defensive, just say "free"
- "take a look and let me know what you think" — generic, ask a specific question instead
- "I put a lot of thought into it" — self-focused, show don't tell
- "unfortunately" before pricing — never apologize for the price
- "No hidden fees" — defensive framing, use "$997 one-time, done" instead

**Urgency language (use naturally, not in every message):**
- "Your preview stays live for 30 days"
- "A few other [category] businesses in your area claimed theirs recently"
- "We take on limited clients each month"

**Copy principles:**
- Lead with THEIR data (Google rating, review count, top service, city)
- End every response with a QUESTION that moves the conversation forward
- Validate the concern BEFORE reframing the objection
- Short > long. 2 sentences beats 5 every time for SMS/text
- Vary openers — never start two messages the same way

**Never do:**
- Send outreach without a preview link AND a portfolio link
- Ignore price objections — always mention the payment plan
- Let a prospect think stock photos are the final product
- Promise features that don't exist yet
- Say "this is my last email" and then send another one
- Assume why they didn't respond ("I know you've been busy")

### Auto-Scout System
Automated lead generation that scouts county-by-county, category-by-category.

**How it works:**
- Configurable via dashboard panel (Auto-Scout button in header)
- Starts DISABLED — Ben must enable it manually
- Scouts all 46 categories in a county before moving to the next
- Counties ordered by population (largest first = more businesses)
- Daily limit (default 100 leads/day) prevents runaway costs
- Tracks progress in Supabase `auto_scout_progress` table — never re-scouts same county+category
- Generates preview sites automatically for each new prospect found

**Files:**
- `src/lib/auto-scout.ts` — core engine (runAutoScout, getNextCounty, progress tracking)
- `src/app/api/auto-scout/route.ts` — GET status, POST run, PATCH config
- `src/app/api/auto-scout/config/route.ts` — GET/PATCH config

**Cost:** ~$2/day at 100 leads (Google Places: $0.032/search + $0.017/detail)

**Rules:**
- NEVER enable auto-scout without Ben's explicit approval
- ALWAYS check daily limit before continuing a run
- Log every scout combo to prevent re-scouting
- If Google Places returns ZERO_RESULTS, mark that county+category as done
- Respect the 2.5-second delay before using next_page_token

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

## Mandatory Premium Features Per V2 Template (NON-NEGOTIABLE)
Every V2 preview template MUST include ALL of the following conversion-focused sections. These are not optional — they are the minimum bar for a $997 website. Templates missing these features fail QC.

### Universal Features (required on EVERY category)
1. **Trust Badges on Hero** — 3+ pill badges below CTA buttons (Licensed, X-Star Rated, Free Estimates/Consult). Never ship a hero without social proof.
2. **Google Reviews Header** — Star rating + review count summary displayed above the testimonials section. Pull from `data.googleRating` and `data.reviewCount`.
3. **Enhanced Testimonials** — Decorative quote marks, verified badge with CheckCircle icon, star ratings at 18px. Not just plain text in a card.
4. **Competitor Comparison Table** — "[Business Name] vs. The Competition" with 5-7 rows. Us column = green checkmarks, them column = "Sometimes"/"Varies"/"No". Uses GlassCard wrapper.
5. **Financing/Payment Section** — 3 pricing tiers showing affordability. Adapt to category (monthly payments for trades, service pricing for professional services).
6. **Video Testimonial Placeholder** — Play button overlay on a project/office photo. "Watch Our Work" or "Take a Virtual Tour". Even without real video, it signals professionalism.
7. **Interactive Quiz/Calculator CTA** — Category-specific engagement tool (roof age quiz, last checkup quiz, "what type of service do you need?" selector). 3 options with color-coded recommendations leading to phone CTA.
8. **Emergency/Urgency Element** — Pulsing indicator with response time or availability. "Crews Available Now", "Same-Day Appointments", "24/7 Emergency Service".
9. **Certifications/Partners Badge Row** — Industry-specific trust signals (GAF for roofing, ADA for dental, BBB, NRCA, state licenses). Horizontal row of pill badges.
10. **Enhanced Service Area** — Not just a text address. Show coverage radius, response time, and availability status with pulsing indicator.

### How Premium Features Work (IMPORTANT — NO API CALLS)
All 10 premium features per category are **hardcoded directly into each V2 template component** as static React JSX. They render instantly with zero external API calls. The pricing cards, comparison tables, quizzes, before/after sections, Google review headers, etc. are all pre-built into the template and simply render with the business's dynamic data (`data.businessName`, `data.phone`, `data.googleRating`, etc.).

**When a new site is generated:**
1. The pipeline scrapes the business website + Google Places (this is the only slow step)
2. The generator creates a `GeneratedSiteData` object with the scraped info
3. The V2 template renders instantly with all 10 premium features — no API, no AI, no waiting
4. The preview is immediately available

**When building a NEW V2 template for a category**, include all 10 universal features + the category-specific features listed below. They go directly into the `.tsx` file as JSX — not as API calls or external data.

### Category-Specific Premium Features (BUILT — reference when building/upgrading any category)

**DENTAL** (warm light theme `#faf9f6`)
1. New Patient Special Banner — "$99 Exam, X-Rays & Cleaning" urgency CTA
2. Insurance Accepted Badges — "Most Insurance", "CareCredit", "Payment Plans", "In-House Savings"
3. Financing/Payment Plans — 3 pricing tiers ($99/$Free/$49mo)
4. Smile Before/After — real photo at `/images/dental-before-after.png`
5. Patient Comfort Section — sedation, gentle techniques, warm blankets, no-rush
6. Dental Technology — Digital X-Rays, Intraoral Cameras, Laser, 3D Imaging
7. Competitor Comparison — vs average dental office, 7 rows
8. Video Tour Placeholder — office tour with play button
9. "When Was Your Last Checkup?" Quiz — green/amber/red with CTA
10. Google Reviews Header — stars + count above testimonials

**ROOFING** (dark theme `#111827`)
1. Before/After Image — real photo at `/images/roofing-before-after.jpg`
2. Insurance Claims Timeline — 4-step: inspect → file → meet adjuster → install ($0 out of pocket)
3. Premium Materials Section — Architectural Shingles, Standing Seam Metal, Cedar Shake, Composite Tile
4. Financing Section — $89/$149/$199 monthly payment tiers
5. Certifications Badge Row — GAF, BBB, Licensed, Manufacturer Warranty, NRCA
6. Competitor Comparison — vs average movers, 7 rows
7. Video Placeholder — crew in action
8. Roof Age Quiz — under 10/10-20/20+ years with recommendations
9. Emergency Response Card — pulsing "Crews Available Now", under 2 hours
10. Moving Day Guarantee — on-time, no hidden fees, no damage

**VETERINARY** (warm light theme `#f7faf8`)
1. Pet Insurance & Payment Badges — pet insurance, payment plans, CareCredit, wellness plans
2. Wellness Pricing Plans — $65 exam, $149 vaccines, $299 dental
3. Pet Type Cards — Dogs, Cats, Exotic Pets, Senior Pets with icons
4. Before/After Pet Grooming — real photo at `/images/vet-before-after.png`
5. Comfort & Fear-Free Section — gentle handling, calming environment, treat rewards
6. Competitor Comparison — vs average vet clinic, 7 rows
7. Video Tour Placeholder — hospital tour
8. "When Was Your Pet's Last Checkup?" Quiz — green/amber/red
9. Google Reviews Header — stars + count
10. New Client Special — $49 First Exam with urgency CTA
- Hero stock: Australian Shepherd at `/images/vet-hero-dog.png`

**MOVING** (dark theme `#1a1a1a`)
1. Licensed & Insured Badges — licensed, bonded, BBB, background-checked
2. Moving Pricing Estimates — $349/$599/$999 tier cards
3. Truck Size Calculator — Studio/1BR/2BR/3BR/4BR+ to truck size mapping
4. What We Move Grid — 8 item types (furniture, pianos, antiques, etc.)
5. Moving Day Checklist — 6-item prep list with ShimmerBorder
6. Competitor Comparison — vs average movers, 7 rows
7. Video Placeholder — crew in action
8. "When Are You Moving?" Quiz — this week/this month/just planning
9. Google Reviews Header — stars + count
10. Moving Day Guarantee — on-time, no hidden fees, no damage

**PEST CONTROL** (dark theme `#1a1a1a`)
1. Licensed & Safe Badges — EPA-approved, pet & child safe, satisfaction guaranteed
2. Pest Control Pricing — $149 one-time, $99/quarter, $79/month
3. Common Pests Grid — 8 pest types with icons and descriptions
4. Treatment Process — 4-step: inspect → plan → treat → guarantee
5. Eco-Friendly Section — green products, targeted, safe for family
6. Competitor Comparison — vs average exterminators, 7 rows
7. Video Placeholder — process showcase
8. "What Pest?" Quiz — ants/rodents/bed bugs/not sure with urgency levels
9. Google Reviews Header — stars + count
10. Pest-Free Guarantee — satisfaction guarantee with ShimmerBorder

**CLEANING** (dark theme `#1a1a1a`)
1. Trust & Safety Badges — background-checked, bonded, eco-friendly, guaranteed
2. Cleaning Pricing Plans — $149/$249/$349 tiers
3. What We Clean Grid — 8 room types with icons
4. Cleaning Checklist — 10 items included in every clean
5. Eco-Friendly Section — non-toxic, allergen reduction, green seal
6. Before/After Transformation — clean kitchen/bathroom showcase
7. Competitor Comparison — vs average cleaning services, 7 rows
8. "How Often?" Quiz — weekly/bi-weekly/monthly recommendations
9. Google Reviews Header — stars + count
10. Spotless Guarantee — re-clean for free promise

**INTERIOR DESIGN** (warm light theme `#faf9f7`)
1. Design Style Badges — residential, commercial, full-service, award-winning
2. Design Packages — $250 consult, $2500 room, $10K+ full home
3. Design Process Timeline — 5-step vertical (discover → concept → develop → procure → reveal)
4. Room Types Grid — 8 spaces (living, kitchen, bedroom, bath, office, outdoor, commercial, restaurant)
5. Design Philosophy — personalized, craftsmanship, timeless, sustainable
6. Before/After Room Transformation — real photo at `/images/interior-design-before-after.jpg`
7. Competitor Comparison — vs DIY/big box, 7 rows
8. "What's Your Style?" Quiz — modern/traditional/boho/contemporary
9. Google Reviews Header — stars + count
10. Free Consultation CTA — ShimmerBorder with dual CTAs

**PHOTOGRAPHY** (warm light/gold theme)
1. Photography Styles Showcase — 6 style badges (portraits, weddings, events, etc.)
2. Session Pricing Packages — $199/$499/$1500+ with "investment" language
3. The Experience Timeline — 5-step (consult → scout → shoot → edit → deliver)
4. Portfolio Highlight Enhancement — session type overlays on gallery images
5. What Makes Us Different — artistic eye, natural light, fast turnaround, print rights
6. Investment Guide — 6 deliverables (edited images, gallery, print release, etc.)
7. Competitor Comparison — vs average photographers, 7 rows
8. Session Type Quiz — portraits/family/wedding/commercial
9. Google Reviews Header — stars + count
10. Limited Availability CTA — seasonal booking with FOMO pulsing indicator

**INSURANCE** (dark navy theme)
1. Coverage Type Badges — auto, home, business, life, health, umbrella
2. Insurance Savings — save $500/$800/25% bundle cards
3. Insurance Process — 4-step reassuring flow
4. Why Independent Agents Win — shop carriers, personal service, claims advocacy
5. Carrier Partners Row — Progressive, Safeco, Travelers, Hartford, Nationwide, Liberty Mutual
6. Competitor Comparison — vs direct/online insurance, 7 rows
7. Video Placeholder — "Meet Your Agent"
8. "What Insurance?" Quiz — auto/home/business/life with quote CTA
9. Google Reviews Header — stars + count
10. Free Quote CTA — $427 avg savings, ShimmerBorder

**ACCOUNTING** (dark navy/gold theme)
1. Service Type Badges — tax prep, bookkeeping, payroll, advisory, IRS, planning
2. Tax Savings — $199/$499/$299mo pricing cards
3. Tax Process — 4-step with icons
4. Why Choose a CPA — licensed, IRS rep, year-round, audit protection
5. Industries We Serve — 8 industry cards
6. Competitor Comparison — vs DIY tax software, 7 rows
7. Video Placeholder — "Meet Your CPA"
8. "What Tax Help?" Quiz — personal/business/bookkeeping/IRS problem
9. Google Reviews Header — stars + count
10. Free Consultation CTA — $3,200 avg savings

**CHIROPRACTIC** (warm dark theme)
1. Treatment Type Badges — adjustments, sports, auto accident, prenatal, pediatric, wellness
2. New Patient Special — $49 exam/x-rays/first adjustment
3. Conditions We Treat — 8 conditions (back, neck, headaches, sciatica, sports, auto, posture, joint)
4. Chiropractic Process — 4-step path to relief
5. Patient Comfort — gentle techniques, no cracking, same-day relief, family-friendly
6. Competitor Comparison — vs pain medication, 7 rows
7. Video Placeholder — "See What a Visit Looks Like"
8. "Where Does It Hurt?" Quiz — back/neck/headaches/other
9. Google Reviews Header — stars + count
10. Pain-Free Guarantee — $49 first visit CTA

**AUTO REPAIR** (dark professional theme)
1. Service Type Badges — oil, brakes, engine, transmission, diagnostics, A/C
2. Transparent Pricing — $39.99/$149/$89 cards
3. What We Service — 8 vehicle types/systems grid
4. Repair Process — 4-step no-surprises flow
5. Honesty Guarantee — no unnecessary repairs, free estimates, warranty, show the problem
6. Competitor Comparison — vs dealership service, 7 rows
7. Video Placeholder — "See Our Shop"
8. "What Does Your Car Need?" Quiz — maintenance/sounds wrong/brakes/check engine
9. Google Reviews Header — stars + count
10. Warranty CTA — every repair backed

**GENERAL CONTRACTOR** (dark professional theme)
1. Project Type Badges — kitchen, bathroom, additions, new construction, commercial, outdoor
2. Project Investment Guide — $15K/$35K/$75K+ project tiers
3. Build Process — 5-step: consult → design → permits → build → walkthrough
4. Why Choose Licensed GC — licensed/bonded, permits, subcontractor coordination, warranty
5. Project Types Grid — 8 project types
6. Competitor Comparison — vs handyman/unlicensed, 7 rows
7. Video Placeholder — "Tour Our Projects"
8. "What's Your Project?" Quiz — kitchen-bath/addition/whole-home/commercial
9. Google Reviews Header — stars + count
10. Project Guarantee CTA — on time, on budget, with license number

**HVAC** (dark professional theme, uses `BLUE` variable — NOT ACCENT)
1. Service Type Badges — heating, AC, heat pumps, furnaces, ductwork, 24/7
2. Seasonal Savings — $89/$79/$4999 pricing cards
3. What We Service — 8 equipment types grid
4. HVAC Process — 4-step comfort flow
5. Energy Savings — save 40%, smart thermostats, $2K tax credits
6. Competitor Comparison — vs big box HVAC, 7 rows
7. Video Placeholder — "Meet Our Team"
8. HVAC Need Quiz — no heat/maintenance/new system/air quality
9. Google Reviews Header — stars + count
10. Comfort Guarantee — satisfaction guaranteed, financing available

**ELECTRICIAN** (dark professional theme)
1. Service Type Badges — residential, commercial, panels, EV, generators, 24/7
2. Upfront Pricing — $99/$1800/$799 cards
3. What We Handle — 8 capabilities grid
4. Electrical Process — 4-step safety flow
5. Safety First — licensed, code-compliant, background-checked, warranty
6. Competitor Comparison — vs handyman electrical, 7 rows
7. Video Placeholder — "See Our Work"
8. Electrical Quiz — outlet/panel/new install/emergency
9. Google Reviews Header — stars + count
10. Safety Guarantee — free inspection, license number

**PLUMBER** (dark professional theme, uses `TEAL` variable)
1. Service Type Badges — emergency, drain, water heaters, sewer, repiping, leak
2. Upfront Pricing — $99/$1200/$149 cards
3. What We Fix — 8 items grid
4. Plumbing Process — 4-step no-surprises
5. Why Choose Us — licensed, 24/7, upfront, guaranteed
6. Competitor Comparison — vs handyman/DIY, 7 rows
7. Video Placeholder — "See Our Work"
8. Plumbing Issue Quiz — drain/leak/water heater/sewer
9. Google Reviews Header — stars + count
10. Guarantee CTA — licensed, insured, guaranteed

**SALON** (elegant theme, uses `ROSE` variable — NOT ACCENT)
1. Service Category Badges — haircuts, color, balayage, extensions, bridal, treatments
2. Service Menu — $55/$120/$200+ pricing cards
3. Stylist Profiles — 4 specialty cards
4. Salon Experience — 4-step elegant journey
5. Why Choose Us — award-winning, premium products, relaxing, consultation
6. Competitor Comparison — vs chain salons, 7 rows
7. Video Placeholder — "Tour Our Salon"
8. Service Quiz — haircut/color/occasion/repair
9. Google Reviews Header — stars + count
10. New Client Special — 20% off first visit

**LANDSCAPING** (earthy theme, uses `PRIMARY` variable)
1. Service Type Badges — lawn care, design, hardscaping, irrigation, tree, cleanup
2. Service Pricing — $45/visit, $2500+, $8000+ cards
3. What We Do — 8 services grid
4. Process — 4-step with icons
5. Why Choose Us — licensed, custom, sustainable, guaranteed
6. Competitor Comparison — vs mow-and-go, 7 rows
7. Video Placeholder — "See Our Transformations"
8. Yard Need Quiz — lawn care/makeover/hardscaping/cleanup
9. Google Reviews Header — stars + count
10. Free Consultation CTA — transform your outdoor space

**LAW FIRM** (dark navy premium, uses `EMERALD` variable — NOT PRIMARY)
1. Practice Area Badges — PI, family, criminal, employment, immigration, business
2. Case Results — $2.5M recovered, custody won, charges dismissed
3. Legal Process — 4-step with icons
4. Why Choose Our Firm — no fee unless win, 24/7, track record, personal
5. Practice Areas Grid — 8 areas
6. Competitor Comparison — vs large corporate firms, 7 rows
7. Video Placeholder — "Meet Your Attorney"
8. Legal Help Quiz — accident/family/criminal/business
9. Google Reviews Header — stars + count
10. Free Consultation CTA — ShimmerBorder with trust badges
- **BEAST MODE UPGRADE (learned from Real Estate):**
  - **Case Results Ticker** — animated counter showing "$X Million Recovered" with live counting animation (like mortgage calculator but for settlements). Specific dollar amounts in testimonials ("won $340K settlement") are 10x more convincing than generic praise.
  - **Practice Area Deep-Dive Accordions** — expandable cards for each practice area with detailed descriptions, common case types, and "Free Case Review" CTA per area. Interactive content keeps visitors on page longer.
  - **Consultation Scheduler** — interactive form with case type dropdown, urgency selector, preferred contact method. More sophisticated than a basic contact form.

**REAL ESTATE** (dark premium, uses `GOLD` variable — NOT PRIMARY)
1. Service Type Badges — buying, selling, investing, first-time, luxury, relocation
2. Market Stats — days on market, homes sold, avg price
3. Buying/Selling Process — 5-step journey
4. Why Choose This Agent — local expert, track record, full-service, negotiation
5. Areas We Serve — 8 neighborhoods grid
6. Competitor Comparison — vs online brokers, 7 rows
7. Video Placeholder — "See Our Featured Listings"
8. Buying or Selling Quiz — buy/sell/explore/invest
9. Google Reviews Header — stars + count
10. Free Home Valuation CTA — "What's Your Home Worth?"
- **BEAST MODE FEATURES (built in showcase, apply to generated sites too):**
  - **Property Search Bar** — interactive hero search with location/price/beds dropdowns. Centered hero layout (NOT left-aligned) breaks template pattern.
  - **Mortgage Calculator** — 3 range sliders (price/down payment/rate) with LIVE monthly payment calculation. Interactive features keep prospects engaged.
  - **Neighborhood Spotlight** — 4 cards with real local data (avg price, walk score, school rating). Shows local expertise.
  - **Auto-rotating Testimonial Carousel** — 5 reviews that rotate every 5 seconds with dot navigation. Specific dollar amounts in reviews ("negotiated $47K off") are more convincing than generic praise.
  - **Trust Bar** — horizontal stats strip immediately below hero. Numbers sell.

**FITNESS / MARTIAL ARTS** (high contrast dark theme)
- **BEAST MODE UPGRADE (learned from Real Estate):**
  - **Class Schedule Grid** — interactive weekly schedule like the property search bar. Filter by class type (HIIT, Yoga, Strength, Boxing). Interactive engagement keeps visitors exploring.
  - **Membership Tier Comparison** — 3 pricing cards like mortgage calculator tiers. Basic/Premium/Unlimited with feature checkmarks and "Start Free Trial" CTAs.
  - **Transformation Gallery** — before/after carousel like the testimonial carousel. Auto-rotating success stories with specific results ("Lost 47 lbs in 6 months").
  - **BMI/Fitness Calculator** — interactive like the mortgage calculator. Enter height/weight, get result with recommended program. Interactive tools = longer time on page.

**MED SPA** (elegant dark/light theme)
- **BEAST MODE UPGRADE (learned from Real Estate):**
  - **Treatment Menu with Pricing** — interactive cards like property cards. Filter by category (Face, Body, Skin, Injectables). Each shows treatment name, duration, price range, and "Book Now".
  - **Before/After Slider** — interactive drag comparison for treatments (like smile slider for dental). Real results sell med spa services.
  - **Skin Quiz** — "What's Your Skin Concern?" interactive quiz like the buying/selling quiz. Acne/Aging/Pigmentation/Texture → recommended treatment → booking CTA.
  - **Provider Spotlight** — like Sarah Chen agent spotlight. Medical director with credentials, board certifications, years of experience. Trust is critical for medical procedures.

### Beast Mode Showcase Registry (built — reference for future category builds)

**#1 Real Estate — Puget Sound Realty** (1,432 lines)
- Theme: Dark luxury, gold `#b8860b` on `#09090b`
- Hero: Centered text + interactive property search bar (location/price/beds dropdowns)
- Unique: Mortgage calculator (3 sliders, live math), neighborhood spotlight with local data, draggable property gallery
- Testimonials: Auto-rotating carousel with dot navigation
- Layout lesson: Centered hero + interactive tool = modern premium

**#2 Dental — Emerald City Dental** (1,092 lines)
- Theme: Warm cream `#faf9f6`, teal `#0d9488`
- Hero: Split layout — text left, real smile photo right on light bg
- Unique: Before/after slider with real `/images/dental-before-after.png`, insurance carrier badges, "When was your last checkup?" quiz
- Testimonials: Staggered masonry grid (NOT carousel — different from RE)
- Layout lesson: Light theme proves range, insurance badges are huge for healthcare trust

**#3 Law Firm — Pacific Law Group** (1,151 lines)
- Theme: Dark navy `#0f172a`, emerald `#059669` + gold `#ca8a04`
- Hero: Full-width billboard — massive centered typography, Scale of Justice SVG watermark, case results ticker scrolling
- Unique: Case results ticker ($4.2M | $1.8M | Dismissed), practice area deep-dive accordions, 3 attorney profiles, "Arrested? Call Now" emergency banner
- Testimonials: Dark editorial, one-at-a-time with navigation
- Layout lesson: Bold typography + scrolling ticker = authority and power

**#4 Electrician — Cascade Electric Co.** (1,195 lines)
- Theme: Dark charcoal `#1a1a1a`, amber `#f59e0b` + blue `#3b82f6`
- Hero: Diagonal split with clip-path, lightning bolt SVG path-draw animation, pulsing 60-min emergency badge
- Unique: Emergency response pulsing strip, license number displayed 4 places, upfront transparent pricing, circuit board SVG background
- Testimonials: Alternating left/right layout
- Layout lesson: Diagonal clip-path hero feels industrial/modern, license numbers build trade credibility

**#5 Plumber — Emerald City Plumbing** (1,449 lines)
- Theme: Dark teal `#0f172a` with teal `#0d9488` + deep blue `#1e40af`
- Hero: Overlapping card layout — glass card with animated ripple border overlaps hero photo. Water drop SVG drip animation on left edge. 24/7 emergency pulsing badge.
- Unique: Water ripple animated border (conic-gradient rotation), floating water drop particles, "Honest Plumber Promise" (show problem first, can't fix = free), horizontal drag-scroll testimonials
- Testimonials: Horizontal drag-scroll (unique from all previous — carousel, masonry, editorial, alternating)
- Layout lesson: Overlapping card hero creates depth. "Honest promise" sections directly address trade industry trust fears. Each showcase should use a DIFFERENT testimonial layout.

**#6 Fitness — Iron & Oak Fitness** (1,203 lines)
- Theme: Pure black `#0a0a0a` with neon lime `#84cc16`
- Hero: Full-bleed photo + outlined "STRONGER" text (photo shows through letters, Nike-style)
- Unique: Interactive class schedule grid, membership tier toggle (monthly/annual), BMI calculator with program recommendation, transformation gallery with specific results
- Layout lesson: Outlined text hero feels like a premium athletic brand. Monthly/annual toggle adds interactivity.

**#7 Roofing — Summit Roofing NW** (1,970 lines)
- Theme: Dark charcoal `#111827` with brick red `#dc2626` + gold `#ca8a04`
- Hero: 50/50 split-screen (text left, real before/after photo right)
- Unique: Insurance claims 4-step timeline, premium materials with warranty specs, roof age quiz, real `/images/roofing-hero.png`, rain particles
- Layout lesson: Card stack testimonials create visual interest. Real before/after photos 10x more convincing.

**#8 Auto Repair — Pacific Auto Works** (1,374 lines)
- Theme: Dark `#111111` with red `#dc2626` + silver `#94a3b8`
- Hero: Scroll-driven parallax reveal (car image reveals as you scroll, text stays sticky)
- Unique: Vehicle types grid (domestic/import/european/diesel/hybrid), "Honest Mechanic Guarantee", specific dollar savings in testimonials ("saved me $2,400"), racing flag checker service cards
- Layout lesson: Scroll-driven parallax feels cinematic/automotive. Specific dollar savings in reviews are 10x more convincing.

**#9 Salon — Velvet Hair Studio** (1,053 lines)
- Theme: Warm cream `#faf8f5` with rose gold `#b76e79`
- Hero: Asymmetric editorial photo grid (3 overlapping photos like a fashion magazine)
- Unique: Stylist profiles with individual specialties, "What's Your Hair Vibe?" quiz, Pinterest masonry gallery, products badge row (Olaplex, Kerastase), elegant serif typography
- Layout lesson: Editorial mood board hero feels like Vogue. Quote-only minimal testimonials feel more luxurious than cards.

**#10 Landscaping — Cascade Landscapes** (1,196 lines)
- Theme: Dark forest `#0f1a0f` with green `#16a34a` + earth brown `#a3845b`
- Hero: Floating 3D cards over gradient (hover tilt perspective)
- Unique: Seasonal services calendar (Spring/Summer/Fall/Winter), eco-friendly/sustainability section, project portfolio with PNW neighborhood names, leaf SVG patterns
- Layout lesson: 3D tilt cards create depth. Seasonal calendar shows year-round value.

**#11 Church — Grace Community Church** (992 lines)
- Theme: Warm cream `#faf9f6` with amber `#d97706`
- Hero: Warm full-bleed community photo + golden overlay (Hillsong-style)
- Unique: Service times cards, "I'm New Here" first-timer section, upcoming events calendar, sermon archive with play buttons, community impact counters, give/donate section
- Layout lesson: Golden overlay = warmth/welcome. "I'm New Here" section directly addresses first-timer anxiety.

**#12 Vet — Northshore Vet Clinic** (935 lines)
- Theme: Warm green-cream `#f7faf8` with forest green `#16a34a` + rose `#e11d48`
- Hero: Scroll-driven parallax pet photo collage (5 overlapping pets at different scroll speeds)
- Unique: Pet types grid, fear-free section, wellness plan pricing tiers, pet-named testimonials (Bailey, Mochi, Spike), real `/images/vet-hero-dog.png` + `/images/vet-before-after.png`
- Layout lesson: Pet photo collage = instant emotional connection. Mentioning pets BY NAME in testimonials adds authenticity.

**#13 GC — Summit Builders NW** (1,137 lines)
- Theme: Dark `#1a2030` with amber `#d97706`
- Hero: Isometric/3D perspective tilt on construction photo
- Unique: Project investment guide ($15K/$35K/$75K+), 5-step vertical alternating build timeline, blueprint SVG grid pattern, construction beam decorations
- Layout lesson: 3D perspective tilt adds depth. Blueprint patterns = construction DNA.

**#14 Catering — Ember & Oak Catering** (1,200 lines)
- Theme: Warm dark `#1c1917` with copper `#c2703e`
- Hero: Split-screen with food photography (photo left, dark text right, copper divider)
- Unique: Tabbed sample menu (Appetizers/Mains/Desserts), event type cards, dietary accommodation badges, seasonal ingredient highlights, package pricing per person, chef spotlight with culinary credentials
- Layout lesson: Tabbed menu = restaurant sophistication. Per-person pricing is how catering is actually sold.

**#15 Pet Services — Happy Tails Pet Care** (2,231 lines)
- Theme: Warm cream `#faf8f5` with teal `#0d9488` + coral `#f97066`
- Hero: Animated card stack (3 fanned pet cards with hover-rotate)
- Unique: Pet type selector with tabbed interface, daily report card mock, safety badges (background checked, bonded, first aid), pricing per visit type
- Layout lesson: Card stack hero is playful/fun. Daily report card shows transparency.

**#16 Physical Therapy — Summit PT & Rehab** (1,094 lines)
- Theme: Warm cream `#faf9f6` with deep blue `#1e40af` + orange `#ea580c`
- Hero: Kinetic typography — "MOVE" outlines + "BETTER" slides in with spring
- Unique: Recovery timeline (3 phases), body map quiz (6 areas), insurance checker with carrier badges, conditions treated grid
- Layout lesson: Kinetic typography hero = dynamic/health-forward. Body map quiz is highly engaging.

**#17 Tutoring — Bright Minds Tutoring** (1,181 lines)
- Theme: White `#ffffff` with purple `#7c3aed` + yellow `#eab308`
- Hero: Typewriter text reveal — "Understanding" types letter-by-letter, "Clicks." springs in
- Unique: Grade level selector (interactive tabs), subject grid, success stories with score improvements (SAT 1180→1420), parent resources section
- Layout lesson: Typewriter hero = smart/modern. Specific score improvements are hugely convincing for education.

**#18 Med Spa — Radiance Med Spa** (1,222 lines)
- Theme: Dark `#0a0a0a` with blush `#f9a8d4` + gold `#d4a853`
- Hero: Morphing SVG blob with blush-to-gold gradient behind centered text
- Unique: Treatment menu with 4 filterable categories, skin concern quiz, membership tiers (Gold/Platinum), products we use badges, before/after transformations
- Layout lesson: Morphing blob = luxury beauty brand. Filterable treatment menu shows sophistication.

**#19 Appliance Repair — ProFix Appliance Repair** (1,094 lines)
- Theme: Dark `#111111` with orange `#f97316` + steel blue `#64748b`
- Hero: Cycling counter stats (15,000+ / 98% / 4.9 / 15 Years) with dot indicators
- Unique: 8 appliance services, 8 brands we service grid, appliance lifespan guide, common issues education section
- Layout lesson: Cycling counter hero = impressive stats without being static. Brand logos build trust for appliance work.

**#20 Junk Removal — CleanSlate Junk Removal** (1,162 lines)
- Theme: Dark `#111827` with green `#22c55e` + amber `#f59e0b`
- Hero: Before/after split wipe — cluttered garage wipes to reveal clean space
- Unique: Eco commitment (60% donated/30% recycled/10% landfill visual bars), truck-size pricing ($149/$249/$399), "What Needs to Go?" quiz, Why Not DIY section
- Layout lesson: Before/after wipe is satisfying to watch. Eco stats differentiate from competitors.

**#21 Carpet Cleaning — FreshStart Carpet Cleaning** (1,107 lines)
- Theme: Dark `#0f172a` with cyan `#06b6d4` + white
- Hero: Gradient text reveal — "FRESH START" fills from clean-white to dirty-brown, clean side expands on scroll
- Unique: Per-room pricing ($99/1, $179/3, $349/house), 24-hour dry guarantee, eco products section, carpet health facts, how-often-to-clean guide
- Layout lesson: Gradient text reveal is visually clever. Room-based pricing is how carpet cleaning is sold.

**#22 Event Planning — Elevate Events** (1,189 lines)
- Theme: Dark elegant `#0a0a0a` with gold `#d4a853` — the most luxurious
- Hero: Animated CSS bokeh/gala lights (6 shifting gradients + floating blur circles)
- Unique: 6 event types, venue partnerships (6 Seattle venues), day-of timeline, 100+ vendor network, limited availability ("24 events/year"), per-event pricing ($5K/$15K/$30K+)
- Layout lesson: Bokeh hero = walking into a gala. Limited availability creates exclusivity.

**#23 Accounting — Evergreen Tax & Advisory** (1,163 lines)
- Theme: Dark navy `#0f172a` with emerald `#059669` + gold `#ca8a04`
- Hero: Dashboard layout with animated financial metric cards
- Unique: Tax savings calculator, filing deadline countdown, document checklist tracker
- Layout lesson: Dashboard hero = trust through data visualization

**#24 Chiropractic — Align Chiropractic** (1,253 lines)
- Theme: Dark teal `#0c1a1a` with teal `#0f766e` + amber `#d97706`
- Hero: Spine alignment reveal (vertebrae animate from misaligned to aligned, healing pulse)
- Unique: "Where Does It Hurt?" body map quiz, spinal health self-assessment, comparison table (chiro vs medication), pain journey testimonials
- Layout lesson: Body map quiz is highly engaging for healthcare. Pain scale bars in testimonials = proof.

**#25 Cleaning — Crystal Clean Co.** (1,070 lines)
- Theme: Dark blue `#0a1520` with sky blue `#0284c7` + mint `#34d399`
- Hero: Rotating room cards (Kitchen/Bath/Living/Bed auto-cycle with task checklists)
- Unique: Instant estimate calculator (sliders + add-ons), eco commitment progress bars, 200% satisfaction guarantee, 3-tier pricing
- Layout lesson: Room cards = tangible preview of service. Live calculator = instant engagement.

**#26 HVAC — Summit Heating & Air** (1,574 lines)
- Theme: Dark navy `#0c1222` with blue `#0ea5e9` + orange `#f97316`
- Hero: Comfort gauge (animated thermostat SVG, needle 50°F→72°F comfort zone)
- Unique: Diagnostic quiz (5 symptoms → urgency), energy savings calculator, seasonal maintenance calendar, 3 maintenance tiers
- Layout lesson: Thermostat gauge = immediate industry recognition. Season-tagged reviews build year-round trust.

**#27 Insurance — Puget Sound Insurance Group** (1,282 lines)
- Theme: Dark navy `#0f172a` with blue `#1d4ed8` + emerald `#059669` + gold `#ca8a04`
- Hero: Shield protection layers (concentric rings expand, each labeled with coverage type)
- Unique: Coverage quiz, bundle savings calculator, "Are You Covered?" gap checker, independent agent comparison
- Layout lesson: Shield rings = visual safety. Coverage-grouped testimonial tabs keep reviews relevant.

**#28 Interior Design — Cascadia Interiors** (1,595 lines)
- Theme: Warm light `#faf9f6` with gold `#b8860b` + sage `#6b7f5e` (LIGHT THEME)
- Hero: Mood board collage (6 floating design swatches with tilt hover)
- Unique: Style quiz (Modern/Traditional/Bohemian/etc), budget estimator per room, color palette explorer
- Layout lesson: Light theme proves range from dark. Mood board hero = designer DNA. Georgia serif = luxury.

**#29 Moving — Cascade Movers** (1,259 lines)
- Theme: Dark `#111111` with orange `#f97316` + brown `#92400e`
- Hero: Moving truck journey (animated SVG truck on winding road, progress dots)
- Unique: Cost estimator (size+distance+add-ons), moving countdown with milestone tasks, truck size quiz
- Layout lesson: Journey visualization = emotionally resonant. Milestone countdown = practical value.

**#30 Pest Control — Evergreen Pest Solutions** (1,228 lines)
- Theme: Dark `#111827` with orange `#ea580c` + red `#ef4444` + green `#22c55e`
- Hero: Pest threat radar (rotating SVG sweep, pest dots eliminated)
- Unique: Pest identifier (8 types with danger levels), treatment estimator, seasonal pest calendar
- Layout lesson: Radar hero = protection/security feeling. Emergency strip with pulsing dot = urgency.

**#31 Photography — Cascade Lens Photography** (1,201 lines)
- Theme: Warm light `#faf9f7` with gold `#ca8a04` + cool slate `#64748b` (LIGHT THEME)
- Hero: Camera shutter reveal (6 SVG blades retract iris-style)
- Unique: Session builder (type+duration+add-ons), photography style quiz, gallery filter with categories
- Layout lesson: Shutter hero = photographer DNA. Polaroid-framed testimonials = on-brand. Light theme balances dark ones.

### Testimonial Layout Registry (never repeat within portfolio)
1. Real Estate → auto-rotating carousel with dot navigation
2. Dental → staggered masonry grid
3. Law Firm → dark editorial, one-at-a-time with navigation
4. Electrician → alternating left/right cards
5. Plumber → horizontal drag-scroll
6. Fitness → vertical timeline
7. Roofing → card stack (overlapping/fanned)
8. Auto Repair → split-screen (photo left + quote right, alternating)
9. Salon → quote-only minimal (large italic serif, no cards)
10. Landscaping → photo cards (project photo + quote overlay)
11. Church → story cards with photo backgrounds, mobile carousel
12. Vet → pet-named cards with paw print icons
13. GC → neighborhood-tagged cards
14. Catering → event-type tagged testimonials
15. Pet Services → pet-named cards with daily report style
16. Physical Therapy → body-map tagged reviews with recovery timelines
17. Tutoring → staggered columns with score improvement badges
18. Med Spa → auto-rotating carousel with treatment tags
19. Appliance Repair → brand-tagged review cards
20. Junk Removal → masonry with eco-impact badges
21. Carpet Cleaning → masonry with room-type tags
22. Event Planning → auto-rotating carousel with gold accents (grand finale)
23. Accounting → metric cards with revenue/tax impact numbers
24. Chiropractic → pain journey cards (before/after pain scale bars with % improvement)
25. Cleaning → checklist-style reviews (rooms cleaned as tagged badges per review)
26. HVAC → season-tagged reviews (Summer AC/Winter Furnace with dollar savings badges)
27. Insurance → coverage-grouped tabs (Auto/Home/Life tabs with claim savings)
28. Interior Design → room transformation cards (mini color palettes + budget ranges)
29. Moving → move summary cards (origin→destination neighborhoods, move type, time)
30. Pest Control → pest type + urgency cards (pest icon, urgency badge, response time)
31. Photography → photo session recap cards (session type, photos delivered, turnaround, polaroid frame)
ALL 31 TESTIMONIAL LAYOUTS ARE NOW USED. For future showcases, invent new ones.

### Hero Layout Registry (never repeat within portfolio)
1. Real Estate → centered text + interactive search bar
2. Dental → warm light split (text left, photo right)
3. Law Firm → full-width billboard + case results ticker
4. Electrician → diagonal clip-path split + lightning SVG
5. Plumber → overlapping card with ripple border + water drop SVG
6. Fitness → full-bleed photo + outlined "STRONGER" text (photo through letters)
7. Roofing → 50/50 split-screen (text left, before/after photo right)
8. Auto Repair → scroll-driven parallax reveal (car image reveals as you scroll)
9. Salon → asymmetric editorial photo grid (3 overlapping photos like mood board)
10. Landscaping → floating 3D cards over gradient (hover tilt perspective)
11. Church → warm full-bleed community photo + golden overlay
12. Vet → scroll-driven parallax pet photo collage (5 overlapping pets)
13. GC → isometric/3D perspective tilt on construction photo
14. Catering → split-screen with food photography (photo left, dark text right, copper divider)
15. Pet Services → animated card stack (3 fanned cards with hover-rotate)
16. Physical Therapy → kinetic typography ("MOVE BETTER" spring animation)
17. Tutoring → typewriter text reveal (letter-by-letter typing)
18. Med Spa → morphing SVG blob with gradient fill
19. Appliance Repair → cycling counter stats (numbers rotate with indicators)
20. Junk Removal → before/after split wipe (CSS clip-path animation)
21. Carpet Cleaning → gradient text reveal (clean-to-dirty fill expands on scroll)
22. Event Planning → animated CSS bokeh/gala lights (THE GRAND FINALE)
23. Accounting → dashboard hero with animated financial charts
24. Chiropractic → spine alignment reveal (vertebrae animate from misaligned → aligned, healing pulse travels)
25. Cleaning → rotating room cards (Kitchen/Bath/Living/Bed auto-cycle with task checklists)
26. HVAC → comfort gauge (animated circular thermostat SVG, needle sweeps 50°F→95°F→settles at 72°F)
27. Insurance → shield protection layers (concentric rings expand, each labeled with coverage type)
28. Interior Design → mood board collage (6 floating design swatches with tilt hover effects)
29. Moving → moving truck journey (animated SVG truck on winding road, progress dots light up)
30. Pest Control → pest threat radar (rotating radar sweep, pest dots flash red + get eliminated)
31. Photography → camera shutter reveal (6 SVG shutter blades retract iris-style revealing text)
ALL 31 HERO PATTERNS ARE NOW USED. For future showcases, invent new ones.

### Lessons Learned — Speed & Quality Checklist (follow this every time)

**Before building ANY template or showcase:**
1. `grep` the file for its color variable name FIRST (TEAL/ACCENT/PRIMARY/BLUE/ROSE/EMERALD/GOLD). Using the wrong one = build crash = hours wasted.
2. Check for `ACCENT` references in the mid-page CTA section — this is where the bug appears in EVERY template. Many templates have a mid-page CTA that was copy-pasted with `ACCENT` even though the template uses a different variable.
3. Verify ALL phosphor icon imports exist by checking `node_modules/@phosphor-icons/react/dist/ssr/{IconName}.es.js`. Icons that DON'T exist: `Faucet`, `Spray`, `CircleWavyCheck`, `SprayBottle` (use `Bathtub`, `Drop`, `SealCheck` instead).

**During builds:**
4. After EVERY template edit, run a braces balance check: `node -e "const c=require('fs').readFileSync('FILE','utf8'); console.log('Braces:',(c.match(/\{/g)||[]).length,'/',(c.match(/\}/g)||[]).length)"`. Unbalanced braces = build crash.
5. Never use `initial={{ opacity: 0 }}` on preview templates (CLAUDE.md rule). Showcases CAN use it.
6. When making the row a drop target or adding event handlers to JSX, always close the opening tag with `>` before adding children. Missing `>` after `onDrop={...}` crashed the build twice.

**For image management:**
7. Scraped photos often include logos, SVG design files, button graphics, and data URIs. ALWAYS filter these out before using as gallery/hero images. Check for: `.svg`, `data:`, `Group-`, `logo`, dimensions < 100px.
8. When patching photos via the API, the generate endpoint will OVERWRITE them unless they contain `/images/` local paths (smart merge protects those).
9. Every real before/after photo from Ben goes in `/public/images/` with a descriptive name and gets referenced in CLAUDE.md.

**For data enrichment:**
10. Always PATCH enriched data THEN regenerate — not the other way around. The scraper can overwrite PATCHed services/about/tagline if you regenerate first (smart merge helps but isn't perfect).
11. About text MUST mention the owner by name + city. "Is a [category] business serving [address]" is unacceptable.
12. The generator's `content-brief.ts` auto-generates about text. It filters street addresses now, but always verify the output isn't robotic.

**For Vercel deploys:**
13. After pushing, check Vercel dashboard if previews don't update. A single JSX syntax error in ANY template blocks ALL deploys — not just that template.
14. Force redeploy from Vercel dashboard if the deploy ID hasn't changed after 3+ minutes.
15. The deploy ID is embedded in the page HTML (`dpl_XXXXX`). Compare before/after pushing to verify a new build went live.

**For the portfolio showcases:**
16. Each showcase MUST have a unique hero layout AND a unique testimonial layout. Check the registries above before building.
17. Showcase pages are at `/v2/[category]/page.tsx`. Preview templates are at `/components/templates/V2[Category]Preview.tsx`. They are DIFFERENT files with DIFFERENT purposes.
18. Showcases can use `initial={{ opacity: 0 }}` animations. Preview templates CANNOT.
19. Every showcase needs realistic PNW addresses, phone numbers starting with (206) or (425), and real Seattle neighborhood names.
20. Real photos from Ben (in `/public/images/`) should be used over Unsplash stock whenever available. They're 10x more convincing.

### Portfolio Showcase Design Principles (learned from Beast Mode builds)
- **NO two showcase sites should share the same hero layout.** If real estate has centered text + search bar, dental should have split layout, law firm should have full-bleed video bg, etc.
- **Every showcase needs 2-3 INTERACTIVE features** unique to that industry. Static content = template. Interactive content = custom build.
- **Specific numbers > generic praise.** "$47K negotiated off" beats "great negotiator". "Lost 47 lbs" beats "amazing results". "98% satisfaction" beats "highly rated".
- **Auto-rotating elements add life** without requiring user interaction. Testimonial carousels, stat counters, and subtle animations make the page feel alive.
- **Centered hero + search/calculator = modern.** Left-aligned hero + side image = 2020. The hero layout is the first thing prospects see — it must feel current.
- **Trust bar immediately below hero.** Don't make visitors scroll to find credibility signals. Numbers + badges right after the hero.
- **Light vs dark themes prove range.** Showing BOTH warm light (dental) and dark luxury (real estate) in the portfolio proves we don't just do one look. Alternate themes across showcases.
- **Staggered masonry testimonials feel organic** vs carousel feeling automated. Use masonry for warm/friendly categories, carousel for premium/luxury.
- **Every interactive feature should feel like a mini-app.** Calculators with live updating prices, quizzes with progress bars and scored results, and filtering galleries with smooth AnimatePresence — these differentiate from static templates.
- **Animated SVG heroes are the most memorable.** Spine alignment, radar sweeps, comfort gauges, camera shutters, moving trucks — SVG heroes that tell the industry's story visually outperform photo-based heroes.
- **Light themes (Interior Design, Photography) prove design range.** At least 2-3 light-themed showcases among the 31 shows prospects we don't just do "dark mode everything."
- **Industry-specific data in testimonials > generic star reviews.** Pain scales for chiro, rooms cleaned for cleaning, season tags for HVAC, pest types for pest control, move details for moving — these make reviews feel real and specific.
- **Comparison tables sell the decision.** Chiro vs medication, independent vs captive agent, professional vs DIY, our company vs competitors — these help visitors decide, not just browse.
- **Parallel agent builds at 5-10x speed.** Delegating showcase builds to sub-agents while tracking from main context cuts total time dramatically. Always verify braces balance after agent writes.
- **Pre-flight checklist before every showcase: (1) check template color variables, (2) check hero/testimonial registries for unused patterns, (3) plan 2-3 interactive features, (4) verify braces after write, (5) confirm no build errors.**
- **Insurance/carrier badges are HUGE trust signals** for healthcare categories. People's first question: "do you take my insurance?" Show this prominently.
- **Before/after with REAL photos** (not stock) are 10x more convincing. Use Ben's real before/after images where available (`/images/dental-before-after.png`, `/images/roofing-before-after.jpg`, `/images/vet-before-after.png`, `/images/interior-design-before-after.jpg`).
- **Comfort/anxiety sections sell healthcare categories.** "We know dental anxiety is real" / "fear-free veterinary" / "gentle physical therapy" directly addresses the #1 objection.

### Minimum Template Quality Standards (NON-NEGOTIABLE)
Every V2 preview template MUST meet these minimums before being considered production-ready:
- **800+ lines minimum** — anything under 800 lines is a stub, not a template
- **15+ sections minimum**: Nav, Hero, Stats, Services, About, Process, Pricing (3 tiers), Comparison Table, Testimonials (with Google Reviews header), FAQ, Contact Form, Service Area, CTA Banner, Video Placeholder, Footer
- **1+ interactive feature**: quiz, calculator, filter tabs, or accordion — static content only = template, not premium
- **Category-specific features**: every template must have 2-3 features unique to that industry (dental: insurance badges + smile quiz, electrician: emergency strip + license display, etc.)
- **All 10 universal premium features present**: trust badges, Google Reviews header, enhanced testimonials, comparison table, pricing tiers, video placeholder, interactive quiz/calculator, urgency element, certifications row, service area
- **bg-black/70 hero overlay** (or appropriate for light themes)
- **BluejayLogo in footer** — imported and rendered
- **No `initial={{ opacity: 0 }}`** on any element (banned on preview templates)
- **Stock image pools** using `pickFromPool()`/`pickGallery()` — no single hardcoded URLs
- **Template audit grades**: A = 1000+ lines, B = 800-999 lines. No Grade C (under 800) allowed in production.

### Continuous Improvement Rule (MANDATORY after every site build)
After working on ANY website (generating, enriching, reviewing, or fixing a prospect site), you MUST:
1. **Identify what made this site better or more premium** — new section layout, better copy pattern, improved image placement, stronger CTA, smarter service card design, etc.
2. **Apply that improvement to the V2 template** for that category if it's not already there — this ensures ALL future sites in that category automatically get the upgrade
3. **Check if the improvement applies to other categories too** — if a dental site got a great "comfort/anxiety" section, check if chiropractic, PT, and med-spa templates should get the same pattern
4. **Update CLAUDE.md** if it's a new design principle or pattern worth preserving
5. **Never improve a single site without improving the template** — one-off fixes are wasted work. Template improvements compound across every future prospect.

### Before/After Image Rules (NON-NEGOTIABLE)
**Before/after images are NEVER scraped.** They always use our own placeholder images from `/public/images/` until the client buys and provides real photos. This is a hard rule.

**Available before/after images (local, in `/public/images/`):**
- `dental-before-after.png` — smile transformation (broken → fixed)
- `roofing-before-after.jpg` — roof transformation (damaged → repaired)
- `vet-before-after.png` — pet grooming transformation
- `carpet-before-after.png` — carpet stain removal
- `interior-design-before-after.jpg` — kitchen renovation
- `landscaping-before-after.png` — yard transformation
- `medspa-before-after-1.png` — skin rejuvenation
- `medspa-before-after-2.png` — facial contouring
- `medspa-before-after-3.png` — anti-aging treatment

**Rules for before/after sections:**
1. **NEVER use scraped photos (data.photos) for before/after.** Scraped photos are random Google Places images — they're not before/after pairs. Only use `/images/` local files or curated Unsplash pairs.
2. **Combined images (single file with before+after side by side) are fine** — they render as one image with labels. This is the simplest approach.
3. **Slider effects need TWO separate image files** — one for the "before" state, one for the "after" state. Both must be contextually correct (e.g., dental: cracked teeth → perfect smile, NOT two random photos).
4. **Context must match the category exactly:**
   - Dental: damaged/stained smile → bright healthy smile
   - Roofing: damaged/old roof → new installed roof
   - Landscaping: overgrown/bare yard → manicured landscape
   - Carpet: stained/dirty carpet → clean fresh carpet
   - Painting: peeling/faded paint → fresh painted surface
   - Pressure washing: grimy driveway/deck → sparkling clean
   - Med spa: skin concerns → treated/rejuvenated skin
   - Junk removal: cluttered space → clean empty space
5. **If a category doesn't have a local before/after image yet, DON'T fake it.** Label the section "Our Results" or "Recent Transformations" instead of "Before & After". Only call it before/after when you have a real transformation pair.
6. **After a client buys, their real before/after photos replace our placeholders** via the image mapper tool. The template uses the same image slot — we just swap the file.
7. **Categories that SHOULD have before/after:** dental, roofing, veterinary, carpet-cleaning, med-spa, landscaping, interior-design, junk-removal, painting, pressure-washing, cleaning, auto-repair, salon (hair transformations)
8. **Categories that should NOT have before/after:** law-firm, accounting, insurance, real-estate, photography, church, daycare, tutoring, restaurant

### Hero Text Visibility Rules (NON-NEGOTIABLE)
- **Every hero with a background image MUST have bg-black/70 or stronger overlay.** The weak gradient `from-black/60 via-black/30 to-black/10` is BANNED — it leaves the right side of the hero nearly transparent on desktop and the entire hero unreadable on mobile.
- **NEVER use `from-white/80` gradient on a dark-text hero.** This fights the dark overlay and makes text invisible. Use `from-black/40 via-transparent to-black/20` instead.
- **Hero about/description text over images must be `text-white/80` with `textShadow: "0 1px 8px rgba(0,0,0,0.6)"`.** Never use `text-slate-400` over a photo — it's invisible on busy backgrounds.
- **Light-theme heroes (Dental, Vet, Interior Design, Photography) use dark text on white/cream backgrounds** — these don't need overlays, but verify contrast is adequate.
- **Test on mobile.** Hero images look different on mobile (portrait crop, different focal point). The overlay must be strong enough that text is readable regardless of what part of the image is visible.

### Image Context Rules (learned from full audit — NON-NEGOTIABLE)
- **Every stock image must match the business category.** A kitchen photo on a plumber template is wrong. A living room on a roofing template is wrong. A wheat field on a tree service is wrong. If you can't tell what industry the photo belongs to, it's wrong.
- **No generic "modern home interior/exterior" photos** unless the category is interior design, real estate, or general contractor. These luxury home shots are the #1 offender — they look great but say nothing about the business.
- **No recycled headshots across categories.** If a person photo appears in one showcase/template, it CANNOT appear in any other. Prospects browse multiple categories — seeing the same "founder" across 6 businesses kills trust instantly.
- **Dental office photos can ONLY be used on dental pages.** A dental chair appearing on a vet clinic, med spa, or PT page is an instant credibility killer.
- **Stock photo inline comments must match what the photo actually shows.** Several templates had comments like "// moving boxes" next to photos of bathrooms and kitchens. When updating stock pools, verify the photo matches the comment.
- **When components don't forward style props, the style is silently dropped.** Always check that custom components (SpringButton, MagneticButton, etc.) accept AND forward the `style` prop. The salon CTA was invisible because SpringButton ignored the `style={{ background: ROSE }}` prop.
- **Run image context audit after every bulk image replacement.** Unsplash photo IDs don't describe their content — always verify what the photo actually shows before using it.
- **Footer and nav links must point to real pages.** The `/templates` footer link was a 404 for months. Check all navigation links actually resolve.

### Theme Pairing Guide (for generated sites AND showcases)
When building sites, match theme to industry vibe:

| Theme | Background | When to use | Categories |
|-------|-----------|-------------|-----------|
| **Warm Light** | `#faf9f6` cream | Friendly, approachable, family | Dental, Vet, Daycare, Church, Tutoring, PT |
| **Dark Luxury** | `#09090b` near-black | Premium, high-end, aspirational | Real Estate, Law Firm, Med Spa, Photography |
| **Dark Professional** | `#111827`/`#1a1a1a` | Trades, reliability, trust | Roofing, HVAC, Electrician, Plumber, Auto, GC, Moving |
| **Soft Elegant** | `#fefefe` white | Creative, stylish, visual | Salon, Interior Design, Event Planning, Florist |
| **Bold Energy** | `#0a0a0a` pure black | Power, intensity, motivation | Fitness, Martial Arts, Tattoo |

### Typography Pairing Guide (NON-NEGOTIABLE for all generated sites + showcases)
Every site MUST use the correct Google Fonts pairing for its category. Heading font is for h1/h2/h3 tags + nav branding. Body font is for paragraphs, descriptions, and UI text.

**How to implement:** Add this to the template's `<head>` or layout:
```html
<link href="https://fonts.googleapis.com/css2?family={HeadingFont}:wght@400;600;700;800&family={BodyFont}:wght@300;400;500;600&display=swap" rel="stylesheet" />
```
Then set `font-family` via Tailwind or inline styles on headings and body.

| Category | Heading Font | Body Font | Why |
|----------|-------------|-----------|-----|
| **dental** | DM Serif Display | DM Sans | Warm serif says "we care" without being stuffy — modern enough for young families |
| **veterinary** | DM Serif Display | DM Sans | Same warmth as dental — pet owners respond to approachable, friendly type |
| **daycare** | Nunito | Lato | Rounded, soft, playful — feels safe and kid-friendly |
| **church** | Merriweather | Lato | Classic serif conveys tradition and trust without being cold |
| **tutoring** | Merriweather | Open Sans | Academic authority with clean readability for parents |
| **physical-therapy** | Merriweather | Lato | Medical credibility with warmth — not clinical, not casual |
| **law-firm** | EB Garamond | Source Sans Pro | Traditional serif = authority and gravitas, body stays clean |
| **accounting** | Crimson Pro | Inter | Professional serif for trust, modern sans for data-heavy content |
| **insurance** | Libre Baskerville | Open Sans | Established, trustworthy serif paired with friendly body text |
| **real-estate** | DM Serif Display | DM Sans | Luxury-adjacent but not pretentious — works for $300K and $3M listings |
| **med-spa** | Cormorant Garamond | Jost | Elegant thin serif = beauty/luxury, geometric body = clinical precision |
| **salon** | Cormorant Garamond | Raleway | Fashion-forward serif with airy geometric body — feels like Vogue |
| **interior-design** | Cormorant Garamond | Montserrat | Refined taste meets clean modern — editorial design magazine feel |
| **photography** | Playfair Display | Raleway | Editorial serif for portfolio gravitas, light body for image-first layouts |
| **florist** | Playfair Display | Raleway | Romantic serif pairs perfectly with floral/botanical aesthetics |
| **event-planning** | Cormorant Garamond | Raleway | High-end elegance for weddings and galas |
| **fitness** | Bebas Neue | Open Sans | Bold condensed impact for energy, clean body for readability |
| **martial-arts** | Oswald | Nunito Sans | Strong condensed heading with friendly body — discipline + approachability |
| **tattoo** | Archivo Black | Archivo | Heavy bold heading with matching body — industrial edge, no frills |
| **electrician** | Space Grotesk | Inter | Technical modern feel — smart, capable, current |
| **plumber** | Space Grotesk | Inter | Same tech-forward feel — trades should look modern, not dated |
| **hvac** | Space Grotesk | Inter | Consistent with electrical/plumbing — modern trades branding |
| **roofing** | Barlow Condensed | Barlow | Sturdy condensed heading = construction strength, clean body |
| **auto-repair** | Barlow Condensed | Barlow | Automotive industry standard — strong, mechanical, trustworthy |
| **general-contractor** | Barlow Condensed | Barlow | Construction authority — matches roofing/auto for trade consistency |
| **landscaping** | Raleway | Lato | Light, airy heading for outdoor/nature feel, friendly body |
| **cleaning** | Poppins | Poppins | Clean, rounded, modern — literally looks "clean" |
| **carpet-cleaning** | Poppins | Poppins | Same clean feel as general cleaning — brand consistency |
| **pressure-washing** | Barlow Condensed | Barlow | Power/industrial feel matching other trade categories |
| **pest-control** | Space Grotesk | Inter | Technical/scientific credibility for pest treatment |
| **moving** | Barlow Condensed | Barlow | Strong, capable heading for heavy-lifting industry |
| **junk-removal** | Barlow Condensed | Barlow | Same industrial strength as moving — consistent trades feel |
| **tree-service** | Barlow Condensed | Barlow | Outdoor trades — matches landscaping-adjacent categories |
| **painting** | Raleway | Lato | Creative/artistic heading for visual transformation business |
| **fencing** | Barlow Condensed | Barlow | Construction trade — matches GC, roofing |
| **garage-door** | Space Grotesk | Inter | Technical service — matches electrician/plumber |
| **locksmith** | Space Grotesk | Inter | Security/technical — modern and trustworthy |
| **towing** | Oswald | Nunito Sans | Bold urgency heading for emergency service |
| **construction** | Barlow Condensed | Barlow | Core construction trade font |
| **catering** | Playfair Display | Lato | Food industry elegance — upscale but readable for menus |
| **restaurant** | DM Serif Display | DM Sans | Warm, inviting serif for dining — not too formal |
| **pet-services** | Nunito | Nunito Sans | Soft, rounded, playful — pet owners love friendly type |
| **pool-spa** | Raleway | Lato | Resort/relaxation feel — light and breezy |
| **medical** | Libre Baskerville | Open Sans | Clinical authority with accessible body text |
| **appliance-repair** | Space Grotesk | Inter | Technical service matching other repair categories |

**Rules:**
- ALWAYS use the pairing from this table. No exceptions, no improvising.
- Both fonts must be loaded from Google Fonts in the template
- Heading font: h1, h2, h3, nav logo text, CTA buttons
- Body font: paragraphs, descriptions, form labels, footer text, stat labels
- Font weights: headings use 600-800, body uses 300-500
- It's fine if multiple categories use the same pairing — consistency within industry clusters is intentional
| **Warm Dark** | `#1c1917` charcoal | Inviting, cozy, appetite | Restaurant, Catering |

### Cross-Category Feature Patterns (apply learnings across similar industries)

**Healthcare family** (dental, vet, chiropractic, PT, med spa):
- Patient/pet comfort section addressing anxiety — MANDATORY
- Insurance/payment badges — show carrier names prominently
- Before/after with real photos when available
- Provider spotlight with credentials (DDS, DC, DVM, MD)
- "When was your last visit?" interactive quiz
- New patient/client special banner with pricing

**Trades family** (roofing, HVAC, electrician, plumber, auto, GC):
- Honesty/transparency guarantee section — MANDATORY (people fear getting ripped off)
- Upfront pricing cards — show actual price ranges
- License/bond/insurance display — show actual numbers
- "What do you need?" diagnostic quiz
- Emergency service pulsing indicator
- Competitor comparison vs DIY/handyman/dealership

**Professional services** (law, insurance, accounting, real estate):
- Case results/savings with specific dollar amounts
- Interactive calculators (mortgage, tax savings, settlement estimator)
- Credential badges and professional associations
- "What help do you need?" intake quiz
- Free consultation CTA with urgency
- Agent/attorney spotlight with full bio

**Lifestyle/beauty** (salon, med spa, photography, fitness, interior design):
- Style/type quiz ("What's your style?" / "What service?")
- Portfolio/gallery as the hero feature — visuals sell
- Stylist/trainer/designer profiles
- Pricing menu with tiers
- Before/after transformation showcase
- "Now Booking" limited availability CTA

**CATEGORIES NOT YET BUILT** (use the 10 universal features + adapt from similar):
- Restaurant → unique: menu section with categories, reservation CTA, food gallery, chef spotlight
- Catering → unique: event type cards, menu packages, dietary options filter
- Pet Services → unique: pet type cards, boarding calendar, grooming packages
- Physical Therapy → unique: condition cards, recovery timeline, insurance checker
- Tutoring → unique: subject grid, tutor profiles, scheduling calendar
- Church → unique: service times, sermon archive, community events calendar
- Tattoo → unique: style gallery, artist profiles, booking with deposit
- Towing → unique: coverage map, response time, vehicle type selector
- All others → use the 10 universal features as baseline

**CRITICAL BUILD NOTE — COLOR VARIABLE NAMES:**
Each template uses a DIFFERENT color variable name. Using the wrong one crashes the entire Vercel build. Always read the file first and check:
- Dental: `TEAL` | Roofing: `ACCENT` | Vet: `PRIMARY` | Moving: `ACCENT`
- Pest Control: `ACCENT` | Cleaning: `ACCENT` | Interior Design: `PRIMARY`
- Photography: `GOLD` | Insurance: `ACCENT` | Accounting: `ACCENT`
- Chiropractic: `PRIMARY` | Auto Repair: `ACCENT` | GC: `ACCENT`
- HVAC: `BLUE` | Electrician: `ACCENT` | Plumber: `TEAL`
- Salon: `ROSE` | Landscaping: `PRIMARY` | Law Firm: `EMERALD` | Real Estate: `GOLD`

### Copy Quality Rules (NON-NEGOTIABLE)
- **NEVER include street addresses in about/hero copy.** The about text should mention the CITY name only, never "123 Main St Suite 204". Street addresses belong in the contact section and footer only. Filter out any string containing 3+ digits, "suite", "unit", "#", or full addresses.
- **NEVER truncate text mid-word or mid-sentence.** All visible copy must end at a natural sentence boundary. "Th..." or "the K..." is unacceptable. Use sentence-boundary slicing: find the nearest period after 80 chars.
- **NEVER use generic filler copy.** "is a [category] business serving [city] and [full address]" is template garbage. Write copy that sounds human: mention the owner by name, their philosophy, years in business, or what makes them unique.
- **About text must read like a human wrote it.** First person ("we", "our") or warm third person ("Led by Dr. Smith"). Never robotic third person ("The business is a dental business serving...").
- **Hero subtitle must be a COMPLETE thought.** No trailing "...", no cut-off sentences. If the full about text is too long, write a shorter version — don't just slice it.

### Implementation Rules
- **Use existing shared components** — `GlassCard`, `MagneticButton`, `ShimmerBorder`, `SectionHeader` from within the template
- **Use `@phosphor-icons/react`** for all icons — never emoji, never Font Awesome
- **Data constants** (comparison rows, materials, insurance steps) go at the top of the file with other constants
- **Section backgrounds** must match the template theme (light cream for dental/vet, dark charcoal for trades)
- **Mobile responsive** — all grids collapse to 1-column on mobile, all text readable at 375px
- **No framer motion `initial={{ opacity: 0 }}`** on any premium feature — content renders immediately
- **NEVER truncate hero text with "..."** — The about text on the hero must be a COMPLETE sentence. Don't slice at 160 chars and add "...". A hero that says "We proudly serve Maple Valley a..." looks broken. Either show a full 1-2 sentence excerpt or write a dedicated hero subtitle. Use `.slice(0, text.indexOf('.', 80) + 1)` to cut at the nearest sentence boundary instead of a hard character limit.

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
- **The preview URL IS the product** — `/preview/[id]` is the exact link sent to business owners in pitch emails, texts, and DMs. It must look like a $997 website, not a prototype.
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
- **Free tier ($30) is for friends/family only. Default pricing tier is always standard ($997).** The free tier exists solely for prospects Ben personally tags as "free" in the dashboard. It charges $30 upfront to cover basic domain registration and hosting setup costs instead of the standard $997 one-time fee, which includes custom website design, domain registration, and hosting setup. Both tiers still create the same deferred $100/year maintenance subscription after 1 year, which covers domain renewal, hosting, ongoing maintenance, and support. Never auto-assign free tier — it requires manual tagging by Ben.
- **Two pricing tiers exist**: Standard ($997 one-time for custom website design, domain registration, and hosting setup → $100/yr after 1 year for domain renewal, hosting, ongoing maintenance, and support) and Free ($30 upfront for basic domain registration and hosting setup costs → $100/yr after 1 year for domain renewal, hosting, ongoing maintenance, and support). The `pricing_tier` column on the prospects table controls which tier applies. The claim page, checkout API, and Stripe session all respect this field dynamically.

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

## Automatic Generation Quality Rules (NON-NEGOTIABLE)
These rules apply to EVERY site generation — both initial pipeline runs and manual regenerations. They ensure sites come out premium without needing manual review fixes.

### Data Enrichment (during extraction/generation)
- **Services MUST have descriptions.** If the scraper only extracts service names, the generator MUST write a one-sentence description for each service based on the category. A service card with just a name and no description looks empty and unprofessional.
- **Minimum 6 services per site.** If fewer than 6 are scraped, supplement with standard services for that category (e.g., dental always gets: Preventive Care, Cosmetic Dentistry, Restorative, Emergency, Pediatric, Root Canal).
- **About text MUST be specific.** Must mention: the business name, the city/area they serve, and at least one specific detail (owner name, years in business, philosophy, or award). Generic "we provide quality service to our community" FAILS.
- **Stats MUST be real.** Pull Google rating, review count, and years in business from the scrape. Never fabricate stats. If unknown, omit the stats section rather than showing fake numbers.
- **Tagline must come from the business.** Use their actual tagline/motto from their website. If none exists, write one that references their specific city or specialty — never use category-generic copy like "Modern Dental Care" or "Professional Moving Company".

### Photo Quality Gate (during extraction)
- **Filter out non-photo images during scraping.** Remove any scraped URL that matches: button graphics, icons, logos (SVG/PNG under 200px), social media badges, payment icons, map screenshots, or UI elements. These are NOT hero/gallery material.
- **Deduplicate photos BEFORE saving to the prospect.** Run `new Set()` on the URL array. Also strip query params and compare base URLs to catch resize variants of the same image.
- **Minimum 3 unique, relevant photos to pass QC.** If the scraper returns fewer, flag for stock fallback but do NOT use irrelevant stock (e.g., books for a moving company, food for a dental office).
- **Photo ordering matters.** The generator should place the best/most relevant photo first (team photo > interior > exterior > stock). A building exterior or parking lot should NEVER be photo[0] if a team or interior photo exists.

### Template Rendering (during preview build)
- **Hero section text MUST be readable.** If the template uses a photo background, there MUST be a sufficient overlay (white/black gradient) so heading text has at least 4.5:1 contrast ratio. Text-shadow alone is NOT sufficient on busy photos.
- **No decorative SVGs over hero images.** Rotating teeth, floating paw prints, animated sparkles, or any SVG decoration layered on top of a real business photo makes it look cheap. Use the photo itself as the visual — decorative elements belong in non-photo sections only.
- **Hero card must show a DIFFERENT photo than the hero background.** Use `uniquePhotos[1]` for the card, never `heroImage` again. If only one photo exists, use a stock fallback for the card.
- **Gallery text must be white on dark overlays.** Never `text-slate-900` or `text-[#1c1917]` on a `from-black/80` gradient — it's invisible. Gallery image overlays always get white text.
- **Section backgrounds must match the theme.** Light themes use warm cream/white gradients (`#faf9f6`, `#f5f0eb`). Dark themes use charcoal gradients (`#1a1a1a`, `#0f0d08`). NEVER mix dark gradients into a light theme or vice versa — this creates jarring black voids or washed-out sections.
- **CTA buttons on accent backgrounds get white text.** Any button with `background: accentColor` must use `text-white`, not `text-slate-900`.
- **Glass cards must be visible on their background.** Light theme: `bg-white/80 border-slate-200`. Dark theme: `bg-white/[0.06] border-white/15`. Never use `border-white/10 bg-white/[0.03]` on dark — it's invisible.

### Brand Color Application (during generation)
- **accentColor from the prospect's scrapedData MUST be applied.** The generator must pass `data.accentColor` to the template. If no accentColor is set, use the category default — but NEVER teal for a green-branded business or orange for a blue-branded one.
- **The scraper MUST extract brand colors from the business website.** Check computed CSS on links, buttons, and headers. Store as `brandColor` and `accentColor` in scrapedData. This is the single biggest factor in making a preview feel "custom-built for them" vs "generic template".

## End-to-End Pipeline Rules (Learned from Reviews — NON-NEGOTIABLE)

These rules were derived from recurring issues caught across multiple review cycles. They apply to every stage of the pipeline from scraping through outreach.

### 1. Pricing Wording Consistency Rule
- **Every customer-facing surface MUST explicitly state that the $997 one-time price includes domain registration AND hosting setup.** Do not say "custom website design" alone — always include "domain registration and hosting setup" in the same sentence or bullet. This applies to: homepage copy, Terms of Service, email templates, SMS templates, proposals, VSL scripts, voicemail scripts, agent personality prompts, and any new surface that mentions pricing.
- **The $100/year MUST always be described as covering domain renewal, hosting, ongoing maintenance, and support.** Never shorten to just "maintenance" or "hosting" alone.
- **When adding or modifying any pricing reference, grep the entire codebase for `997` and `100/year` to verify all surfaces are consistent.** Pricing drift across surfaces is a recurring issue — catch it at the source.

### 2. Address Normalization Rule
- **All address data MUST be normalized before storage in Supabase.** Strip duplicate locality fragments (e.g., "Sequim, WA 98382, USA, Clallam, WA," should become "Sequim, WA 98382"). Remove trailing commas, duplicate state names, duplicate county names, and "USA" suffixes when a state is already present.
- **Address normalization MUST happen in the scraping/extraction pipeline, NOT in the rendering layer.** The `MapLink` component and `TemplateLayout` render whatever they receive — they should not need to clean data. Fix it upstream.
- **After any batch scrape or data import, run a validation pass on all addresses** to catch formatting anomalies before sites enter the QC pipeline.

### 3. Image Proxy Failure Visibility Rule
- **The image proxy (`/api/image-proxy`) MUST NOT silently return a transparent pixel on upstream failures.** A 1x1 transparent GIF with HTTP 200 masks broken images and makes them invisible rather than diagnosable. This directly violates the "never count a transparent pixel as a pass" QC rule.
- **On upstream image failure, the proxy MUST either:** (a) return a visible branded placeholder image that clearly indicates a missing photo, OR (b) return an HTTP error status (e.g., 502) so the browser shows the alt text and QC agents can detect the failure.
- **Image proxy failures MUST be logged to Supabase** with the prospect ID, failed URL, and error details so broken images can be batch-identified and fixed.

### 4. Cross-Commit Merge Conflict Prevention Rule
- **When multiple features are being developed in parallel and pushed to master, each feature branch MUST pull and rebase against the latest master before pushing.** The video pipeline and Vonage SMS integration both modified `sms.ts` and caused a merge conflict. This is avoidable.
- **Files that are shared across features (sms.ts, email-templates.ts, funnel-delivery.ts, store.ts, types.ts, middleware.ts) are high-conflict zones.** When modifying these files, always check if another feature is in flight that touches the same file.

### 5. Legal Pages Maintenance Rule
- **Privacy Policy and Terms of Service pages MUST be updated whenever:** (a) a new communication channel is added (e.g., Vonage SMS), (b) pricing changes, (c) a new data collection method is added, or (d) a new third-party service is integrated.
- **After any pricing change, grep `/privacy` and `/terms` page source files for pricing references and update them.** These pages are legally binding and must stay current.
- **Footer navigation from legal pages MUST use absolute routes (e.g., `/` not `#`)** so users can navigate back to the homepage from any page. Page-local anchors break when used on non-homepage routes.

### 6. Outreach Template Completeness Rule
- **Every new outreach channel or content type (video, voicemail, email, SMS) MUST be wired into ALL relevant outreach paths before being considered done.** This includes: direct send routes, bulk outreach routes, automated funnel steps, and follow-up sequences.
- **After adding a new outreach asset (e.g., personalized video), verify it appears in:** `email-templates.ts`, `sms.ts`, `funnel-manager.ts`, `outreach.ts`, and any bulk/direct send API routes.
- **New outreach assets MUST degrade gracefully** — if a video hasn't been generated yet for a prospect, the outreach template must still work without it (no broken links, no empty placeholders).

### 7. Post-Deploy Verification Rule
- **After every push to master, the following MUST be verified on the live site within 2 hours of Vercel deploy:**
  1. Homepage loads and pricing copy is correct
  2. At least 2 random preview pages load with no broken images
  3. Footer links work (Privacy, Terms, Portfolio → homepage)
  4. Any new pages or features added in the push are accessible
- **This is a lightweight smoke test, not a full QC review.** It catches deploy failures, missing env vars, and build-time regressions before they sit unnoticed.

### 8. Lint Debt Rule
- **New code MUST NOT introduce new lint errors.** Run `pnpm lint` on changed files before committing. Pre-existing lint debt (currently 1,124 issues) is tracked separately and should be reduced over time, but new contributions must be clean.
- **When lint debt exceeds 500 errors, schedule a dedicated cleanup sprint** before adding major new features. Accumulated lint debt makes it harder to catch real issues in new code.

### 9. Supabase Credential Rotation Rule
- **Service role keys used in automation, review scripts, and CI/CD MUST be verified working before any automated pipeline run.** The review audit was partially blocked because the service role key returned "Invalid API key" on direct REST access.
- **When rotating Supabase keys, update ALL locations:** Vercel env vars, local .env files, CLAUDE.md documentation, and any scripts that reference the key directly.
- **Never hardcode Supabase keys in committed code** — always use environment variables. The key in CLAUDE.md is for documentation/reference only and must match the actual active key.

### 10. Stock Image Dedup Enforcement Rule
- **The `getPreviewImages()` function in `stock-image-picker.ts` is the SINGLE SOURCE OF TRUTH for image assignment.** All templates MUST use this function rather than manually assigning images from `data.photos`. Manual assignment bypasses the dedup tracking and causes duplicate images.
- **After any change to stock image pools or the picker logic, re-sample at least 5 live previews** to confirm image diversity improved. Don't just check the code — verify the rendered output.
- **Image dedup MUST compare by Unsplash photo ID (the segment after `/photo-` in the URL), not just exact URL match.** The same photo with different query params (`?w=800` vs `?w=1600`) is still a duplicate.


### 11. QC Instant Fail Gates
- **The following are INSTANT FAIL conditions. If ANY of these are detected, the site MUST fail QC with a score capped at 49:**
  1. **Broken Images** — Any image URL that is broken, returns an error, is a data URI, or is an SVG placeholder.
  2. **Duplicate Images** — Any image appearing more than once anywhere on the site (same URL or same Unsplash photo ID).
  3. **Wrong/Missing City** — The about section or site content doesn't mention the prospect's actual city.
  4. **Placeholder Testimonials** — Fake names like "Happy Customer", "John D.", "Sarah M." or clearly generic testimonial text that wasn't pulled from the real business.
- **These gates are non-negotiable.** A site that triggers any of them is not ready for outreach regardless of how good the rest looks.
- **QC pass threshold is 70.** Sites scoring 70+ with no instant fail gates triggered are approved for outreach.

### 12. Supercharge Priority Order
- **When supercharging a site, the AI agent MUST prioritize in this exact order:**
  1. **QUALITY** — Every section must feel polished, professional, and smooth. No rough edges, no awkward copy, no jarring transitions.
  2. **SMOOTHNESS** — The overall flow should feel cohesive. Hero → services → about → testimonials → contact should tell a natural story.
  3. **CUSTOMIZATION** — Pull as much as possible from the real business website and scraped info: brand colors, real photos, actual services, real testimonials, tone of voice, team info, hours, specialties. The site should feel like it was hand-built for THIS business.
- **The supercharge agent uses gpt-4.1-mini by default** (configurable via QC_MODEL env var). Claude Opus is reserved for the notes/handoff system only, to keep API costs low.
- **If the supercharge cannot find real data from the business, it should leave the section clean and generic rather than inventing fake details.**

### 13. AI Model Cost Management
- **QC scoring and supercharge use gpt-4.1-mini (cheap).** Claude Opus is reserved ONLY for the prospect notes/handoff system where nuanced quality matters most.
- **This is controlled by the USE_OPENAI_FOR_QC env var** (default: true). Set to "false" to revert to Claude for QC if needed.
- **Batch QC runs should always use the cheap model.** Never run 100+ sites through Claude Opus — that burns through API credits fast.
