@AGENTS.md

# BlueJays Project — The Money Printer

## Core Philosophy
This system is designed to function like a money printer. Every feature should drive toward one goal: scout businesses, build them premium websites, sell those websites at $997, and automate as much of the pipeline as possible. Efficiency = profit.

## AI Cost Optimization Rules (MANDATORY)
Every AI API call must follow these rules to minimize cost:

**Prompt Caching (90% savings on repeated context):**
- The sales agent system prompt, objection scripts, and personality framework are IDENTICAL across all prospects. These MUST be sent as cached system prompts using `anthropic-beta: prompt-caching-2024-07-31` header and `cache_control: { type: "ephemeral" }` on the system message.
- The QC scoring rubric, supercharge instructions, and template rules are static context — cache them.
- Any prompt section that's the same across 5+ calls should be cached.
- Cache read cost: $0.30/MTok vs $3/MTok uncached = **90% savings**.

**Model Selection (use the cheapest model that works):**
- **Sales agent responses** (inbound replies): Claude Sonnet 4 ($3/$15 per MTok) — needs quality for customer-facing
- **QC scoring**: GPT-4.1-mini ($0.40/$1.60 per MTok) — structured output, cheaper is fine
- **Site supercharge**: GPT-4.1-mini — bulk data enrichment, doesn't need premium
- **Intent classification**: GPT-4.1-mini — simple classification task
- **NEVER use Claude Opus for automated pipeline tasks** — reserve for manual/complex work only

**Token Limits (don't waste tokens):**
- Sales agent responses: max_tokens=512 (responses should be SHORT — 2-3 sentences)
- QC scoring: max_tokens=1024
- Supercharge: max_tokens=2048
- Intent classification: max_tokens=256
- NEVER set max_tokens higher than needed — you pay for output tokens

**Batch API (50% discount for non-urgent):**
- Auto-scout site generation can use batch API — these aren't time-sensitive
- QC scoring for bulk runs can be batched
- Retargeting email personalization can be batched overnight
- Real-time responses (sales agent) must stay synchronous

**Cost Tracking:**
- Every AI call MUST log cost via `logCost()` with service, model, and token count
- Review `/spending` dashboard weekly for cost trends
- If AI costs exceed $5/day, audit which calls are most expensive and optimize

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

**The #1 goal of ALL outreach and AI responses is to SCHEDULE A ZOOM/PHONE CALL WITH BEN.**
The agent warms them up, answers questions, handles objections — but always pushes for a call. Ben closes on the call, not through text/email. Only send checkout link if prospect literally says "I want to buy right now."

**Every outreach message (email, SMS, AI response) MUST include:**
1. **Portfolio category link** — `https://bluejayportfolio.com/v2/[category]` — so prospects can see polished examples in their industry. Never send a preview link without also showing the portfolio.
2. **Calendar/booking link** — always offer to schedule a quick 15-minute walkthrough call. Frame it as "no pressure, I'll show you the site live and answer any questions."
3. **Payment plan mention for price objections** — "We also offer 3 payments of $349 if that's easier." This exists in the checkout system and must be mentioned whenever price resistance is detected.

**Objection handling — agents must know these responses:**
3. **"I already have a website"** → "We actually designed yours as an upgrade to your current site — we kept your branding and made the experience more modern and mobile-friendly. Compare them side by side on the claim page."
4. **"Who are you / is this legit?"** → "BlueJays is a web design studio that builds premium websites for local businesses. See our portfolio at bluejayportfolio.com — we've built sites for 30+ industries. Yours was custom-designed specifically for [businessName]."
5. **"Why not Wix/Squarespace?"** → Reference the comparison table on the claim page. Key points: we build it FOR you (they don't), 48-hour turnaround vs weeks, no monthly fees vs $16-45/mo forever, SEO + mobile included.
6. **"$997 is too much"** → ROI angle: "How much is one new customer worth to your business? At $997, you need just [X] new clients to pay for the entire site." Plus payment plan option.

**Preview page rules:**
7. **Stock photo disclaimer** — the preview page shows a banner: "Preview — images and content will be customized with your real business photos after purchase." This sets expectations so prospects don't think stock photos are the final product.
8. **Claim page must show** — ROI calculator, DIY comparison table, payment plan option, post-purchase timeline, satisfaction guarantee. These are all on the claim page and should be referenced in sales conversations.

**Psychological hooks (weave naturally into outreach — never all at once, pick 1-2 per message):**
- **Identity**: "Your work is clearly premium — shouldn't your website reflect that?"
- **Loss aversion**: "How many customers are finding your competitors first because their online presence is stronger?"
- **Social proof**: "Other [category] businesses in your area have already upgraded this month."
- **Future self**: "Imagine a customer searching for [category] tonight — what do they find?"
- **Gap**: "There's a gap between the quality of your work and what your website shows."
- **Effort justification**: "You've put years into building this business. A 15-minute call could change how the world sees it."
- **Scarcity**: "Your preview stays live for 30 days — after that, I move on."
- **Reciprocity**: "I already built this for you at no cost — I just want you to see it."

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
- **People photos MUST show full faces — `object-top` is MANDATORY on every person photo** — `object-cover` alone centers vertically and crops off heads. This has been a recurring bug across 11+ portfolio pages. The rule is simple and absolute:
  - **ANY `<img>` where a person's face/upper body is the subject MUST have `object-top` class** — this includes: founder headshots, team member photos, testimonial author photos used as backgrounds, stylist/trainer/doctor/attorney/therapist profiles, and any about-section portrait.
  - **`object-center` is banned on person photos** — it is no better than the default and gives a false sense of being set intentionally. Use `object-top` for people, `object-cover` alone for pure landscape/equipment/building photos.
  - **The default pattern for every person image:** `className="w-full h-full object-cover object-top"`
  - **For testimonial card backgrounds with person photos:** `className="absolute inset-0 w-full h-full object-cover object-top"`
  - **When in doubt, use `object-top`** — it is always safer for people photos than centering.
  - **Post-build checklist:** after writing any template, grep for `object-cover` without `object-top` and check each one: if the alt text names a person, a team, a founder, or a professional role — add `object-top`. If it's a building, car, product, or landscape — leave it.
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

### No Boring Colors Rule (NON-NEGOTIABLE — added 2026-04-22)
This rule governs both category-default accent colors (in `src/lib/color-review.ts`) AND any override/fix applied to an individual prospect. Violated once when tattoo defaulted to silver gray `#a3a3a3` — gray and other desaturated colors kill the "premium" feel instantly and make every preview look the same.

**BANNED as a category default or suggested accent:**
- Any color with HSL saturation < 40% (grays, beiges, tans, muted near-white)
- Any color with HSL lightness < 15% or > 85% (near-black or near-white — disappear on the template backgrounds)
- "Safe" neutral palettes (`#a3a3a3`, `#d4d4d4`, `#737373`, `#e5e5e5`, `#6b7280`, `#9ca3af`) — including as "alternatives"
- Pastel-only palettes (all four entries have lightness > 75%) — fine as ONE alternative, banned as the primary

**REQUIRED for every category default + its 3 alternatives:**
- Primary color: HSL saturation ≥ 50%, lightness between 35–65%
- Each of the 3 alternatives must also meet the same saturation bar (≥ 40% minimum). The alternatives can vary in hue and lightness but NOT in vibrancy — at least one alternative must be bolder than the primary (higher saturation or more saturated sibling)
- The palette must obviously belong to the industry — red/crimson/gold for tattoo, forest green for landscaping, amber/yellow for electrician, pink for salon, crimson/red for auto-repair. Generic blue is fine for many service categories but shouldn't be the default for creative/bold industries
- The primary color SHOULD match the V2 template's internal constant when one exists (e.g. tattoo V2 uses `DEFAULT_CRIMSON = "#b91c1c"` — so `color-review.ts` tattoo primary is `#b91c1c`)

**Rule of thumb for adding a new category or updating an existing one:**
If you can imagine the color on a luxury brand storefront in that industry, it's fine. If it looks like a hospital lobby wall or a default Bootstrap button, it's banned.

**When a scraped brand color gets rejected by `color-review.ts` QC (saturation too low, lightness out of range, hue mismatch):** replace it with the category default — never leave the site with a gray/beige accent. The category default is always guaranteed to be vibrant because this rule blocks gray defaults.

**This rule applies retroactively:** any time `color-review.ts` is edited to add or change a category's primary or alternatives, verify the palette against the saturation/lightness bar above. The linter for this is running `npx tsx -e "import('./src/lib/color-review.ts').then(m => Object.entries(m.default || {}))"` — if we later add a runtime check, this rule becomes enforced at build time.

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

---

## Generated Site Copy Rules (NON-NEGOTIABLE — added 2026-04-19)

Every generated preview site has a tagline + about paragraph that
ultimately roots in `src/lib/content-brief.ts`. When the scraper can't
surface category-specific data (no services list, no differentiators),
the old fallback produced garbage like:

> "Serving Snohomish area with church expertise."

This failed because:
- "expertise" is meaningless for most categories (churches don't have
  "expertise", they have fellowship/community/service)
- "serving X area" is generic across all 46 categories
- The sentence could be swapped into any business and would read the
  same — which means it says nothing about THIS business

### The rule

**Every category MUST have unique, on-brand fallback copy defined in
`CATEGORY_VOICE` in `content-brief.ts`.** When editing or extending the
voice table:

- Each entry provides a `tagline` (final fallback) + `aboutFill` (used
  when no services list is available). Both take `(businessName, area)`
  and return a full sentence.
- **"Expertise" is BANNED** outside of trades and professional services
  where it genuinely applies (electrician, plumber, HVAC, law, medical,
  accounting). Even there, prefer concrete verbs ("wires", "represents",
  "diagnoses") over the word "expertise".
- **The tagline must describe what the business DOES, not what category
  it belongs to.** `"keeps Snohomish smiles healthy"` tells you it's
  dental without using the word dental. `"welcomes Snohomish into a
  community of faith"` tells you it's a church without using the word
  expertise. That's the bar.
- **The sentence must fail the "swap test":** if you can replace the
  category in the sentence with any other category and it still reads
  plausibly, the copy is too generic. Rework until only one category fits.
- **Use specific verbs per industry:**
  - Healthcare-adjacent: cares for, treats, heals, keeps healthy
  - Trades: wires, fixes, builds, installs, repairs, paints, protects
  - Creative: designs, captures, creates, styles
  - Food: feeds, serves, crafts, caters
  - Community: welcomes, gathers, teaches, trains
  - Services: guides, helps, handles, clears

### Tone direction (Option A — observational / hook-y)

Approved by Ben on 2026-04-19. This is the permanent voice.

- Opens with `{business} [verb]s {area} [object/audience]`
- Feels like a local personally describing their business in one line
- Never salesy, never corporate
- Zero marketing puffery ("premier", "world-class", "unparalleled",
  "cutting-edge" — all banned)
- One sentence, period.

### When adding a new category to `Category` type

You MUST add a matching entry to `CATEGORY_VOICE` in
`src/lib/content-brief.ts` in the SAME commit. The `getCategoryVoice`
helper has a generic fallback but any category should hit its bespoke
copy, not the generic one. TypeScript's `Record<Category, CategoryVoice>`
type will catch missing entries at build time.

### Regenerating existing prospects after copy edits

Any change to `CATEGORY_VOICE` only applies to NEW generations. To
backfill currently-approved or in-flight prospects with the new copy,
fire `/api/generate/bulk-refresh` (see that endpoint for details).
Status gate: prospects in `approved`, `pending-review`, `ready_to_review`,
`ready_to_send`, `generated`, or `qc_failed` are eligible for refresh.
`paid` and `dismissed` prospects are NOT refreshed — their content is
locked.

### PRESERVATION RULE (NON-NEGOTIABLE — learned the hard way 2026-04-19)

Any endpoint or script that updates `prospects.scraped_data` or
`generated_sites.site_data` tagline/about fields **MUST first test the
existing value against `isGenericTagline()` / `isGenericAbout()` in
`src/lib/content-brief.ts`** and only overwrite values that return true.

The first version of `/api/generate/bulk-refresh` ignored this and
unconditionally overwrote 94 prospects' real scraped copy with generic
category-voice fallback — erasing content like Ariana Designs' "25
years + 2 National NKBA Design Awards", Pacific Ave Dental's "Dr.
Hablutzel for 16 years", Evergreen HVAC's "Since 1975", Saluk Salon's
full founding story. Supabase on free tier has no point-in-time
recovery, so those fields were permanently destroyed in the DB and
had to be recovered by re-scraping each prospect's live website via
`/api/generate/recover-copy`.

**The rules that prevent a repeat:**

1. Before overwriting ANY `tagline` or `about` field, call
   `isGenericTagline(current)` or `isGenericAbout(current)`. Only
   proceed if it returns `true`.

2. When you add a NEW generic-fallback sentence to the generator (e.g.
   a new `CATEGORY_VOICE` entry, or a new terminal fallback), ALSO add
   a matching regex to `GENERIC_TAGLINE_PATTERNS` / `GENERIC_ABOUT_PATTERNS`
   in the same commit. That way the fallback is recognizable as generic
   by the preservation check — if it isn't, next time we edit the
   template the endpoint won't know the old copy was system-generated
   and will preserve it forever (the inverse bug).

3. NEVER blanket-update scraped_data.tagline or .about in a bulk script
   without the guard. Even a one-off admin utility must honor it.

4. When in doubt, log the before/after and require explicit confirmation
   via a `?confirm=true` query param before actually writing. The cost
   of an extra round-trip is zero compared to destroying human content.

5. If a new type of bulk mutation is needed in the future, write it as
   read-only first and dry-run it against the full pipeline. Only after
   eyeballing a sample of the dry-run output should the mutation be
   enabled.

See `isGenericTagline`, `isGenericAbout`, and `GENERIC_*_PATTERNS` in
`src/lib/content-brief.ts`. See the 2026-04-19 damage-recovery endpoint
at `/api/generate/recover-copy` for the only sanctioned way to undo a
scraped-copy overwrite (re-scraping live websites).

## Outreach Email Template Rules (NON-NEGOTIABLE — locked in 2026-04-19)

Ben tested the original multi-CTA pitch email against a fresh Gmail
account on 2026-04-19. SendGrid reported "Delivered and Received" but
the email never appeared in any folder — Google silent-quarantined it
because the body had every Promotions/spam-classifier trigger. After
rewriting to a minimal, personal template, Ben explicitly approved the
new format as permanent and asked for these rules to be codified.

**The email is a nudge. The claim page is the pitch.** The whole job of
the pitch/follow-up emails is to get a prospect to click the preview
link. Everything else — pricing, payment plans, ROI calculator, Calendly,
comparison table, guarantees — lives on the preview + claim pages where
context matters and conversion tooling can work.

### Body structure (ALL outreach emails — pitch, follow-up 1, follow-up 2)

- **Max 80 words** in the body. Short > long in cold outreach.
- **EXACTLY ONE link** — the preview URL (via `getShortPreviewUrl`). No
  exceptions. No portfolio link. No Calendly link. No second CTA.
- **Zero pricing language in the body.** No "$997", no "3 payments of",
  no "one-time", no "includes domain registration". The prospect sees
  those on the claim page.
- **Zero booking / walkthrough CTAs.** No "book a call", no "schedule",
  no Calendly URL. The soft reply prompt at the end ("curious what you'd
  change") is the CTA.
- **Personal tone only.** First-person, no titles, no company name in the
  sign-off. "— Ben" beats "— Ben @ BlueJays, CEO".
- **Closing question that invites a soft reply**, not a booking. Examples:
  "Curious what you'd change", "What you'd change about it", "Let me
  know if it's a fit or not". Never "Would you like to schedule a call?".
- **Subject line: short, lowercase-feeling, curiosity-inducing.** "Made
  something for [Business]" beats "[Business] — a $997 custom website
  opportunity". No pricing in subject. No emojis. No ALL CAPS.
- **Soft "re:" treatment on follow-ups.** `Re: [Business Name]` as
  follow-up 1 subject signals "continuing a conversation" which Gmail
  treats more favorably than a new commercial send.
- **"Thanks for being one of the ones I spent time on"** or similar in
  the final follow-up. Reciprocity framing converts better than urgency.

### Tone principles

- Should read like a developer or designer emailing a stranger about
  something interesting they noticed, not a sales rep pitching a service.
- Use casual phrasing: "I spent a few hours this week putting together"
  beats "I've designed a professional website solution"
- Validate THEIR work first (reviews, rating, reputation), then mention
  what you built. Never lead with what you want.
- Never apologize for reaching out, never explain why you have their
  info, never say "sorry if you're not interested". Ironically, those
  hedges reduce response rates.

### Banned phrases (never in any outreach email body or subject)

- "Book a call" / "schedule a walkthrough" / "15-min demo"
- "$997" / pricing in any form
- "No pressure" (defensive, sounds like a pushy salesperson backpedaling)
- "Limited time" / "expires soon" / "only a few spots left"
- "Custom design, domain registration, and hosting setup all included"
  (marketing copy in the body — move to claim page)
- "The full build is..." (transactional framing)
- "Click here to..." / "Learn more" (calls-to-action in link text)
- "Premium" / "professional" / "state-of-the-art" (brochure language)

### Psychology Stack (NON-NEGOTIABLE — every pitch must include all 5)

The body copy carries 5 distinct psychological hooks in a specific order.
Each one is small enough to feel natural but together they compound into
a meaningfully higher reply rate than a neutral pitch. Don't skip any.

1. **Discovery + specificity** — open with a real observation about how
   you found them: `"I was looking at {category} businesses in {city} and
   came across {business}"`. Signals real research, not mass blast.
   Never open with "Hope this finds you well" or any other filler.

2. **Validation of their work** — reference their rating/reviews/real
   achievement: `"Your 5★ across 23 reviews stood out"`. Rewards the
   reader's ego for work already done. They feel SEEN before they feel
   SOLD. Skip only if the data isn't there (fewer than 5 reviews).

3. **Reciprocity + effort** — mention specific time invested: `"I spent
   a few hours this week putting together..."`. This is the #1 reply-rate
   driver in cold email research. Classical reciprocity: "they worked for
   me, I should at least look." To avoid Gmail pattern-matching across a
   daily batch of 20+ sends, the codebase rotates across several natural
   phrasings (see `EFFORT_PHRASES` in `email-templates.ts`). Deterministic
   by prospect.id so the same person always gets the same phrasing across
   multiple follow-ups (consistency).

4. **Humility + implicit gap** — disarm the sales-pitch threat while
   subtly implying they have taste: `"No idea if it's what you had in
   mind, but figured you'd want to see it"`. This line does two things
   simultaneously — it lowers the reader's defenses ("he's not pushing
   me"), and it primes them to compare what you built against an
   internal standard they already hold (classic gap technique).

5. **Soft reply prompt / curiosity** — close with an open question that
   invites conversation, not a commitment: `"Curious what you'd change"`.
   Reply rate on "Curious what you'd change" is materially higher than
   on "Would you be open to a 15-min call?" because the former requires
   no commitment — the reader can reply with literally any thought.

**Other hooks from the broader Sales & Outreach section** (loss aversion,
scarcity, social proof, future self, identity) are appropriate on the
claim page, voicemail scripts, and follow-up SMS — but **NOT in the
pitch email body**. They read as marketing copy and trip Gmail's
Promotions classifier. Keep the pitch email pure psychology-first,
pricing/scarcity/CTA-zero.

### Effort phrase rotation rule

Ben explicitly requested (2026-04-19) that every pitch mention a
specific amount of time invested personally — "a few hours this week",
"all afternoon yesterday", "a chunk of the weekend", etc. The codebase
maintains an array `EFFORT_PHRASES` in `email-templates.ts` with 6-8
natural variations.

- ADD new phrases to that array, NEVER replace existing ones without
  Ben's approval — different businesses across the funnel history may
  have seen specific phrasings.
- Every phrase must be casual, specific, and first-person ("I" not "we"
  or "our team").
- Never say "the team" or "our designers" — Ben is one person, that
  personal thread is part of the psychology.
- Time references can be vague ("recently", "this week") or specific
  ("yesterday afternoon", "Sunday night"). Mix is fine.

### Approved baseline template (Day 0 pitch)

Locked in `src/lib/email-templates.ts::getPitchEmail()`. If you rewrite
it, you must preserve all of the rules above. The approved body format:

```
Hi {greeting},

I was looking at {category} businesses in {city} and came across
{businessName}. Your {rating}★ across {reviewCount} reviews stood out.

{effortPhrase} — uses your actual services, photos, and contact info:

{shortPreviewUrl}

No idea if it's what you had in mind, but figured you'd want to see it.
Curious what you'd change.

— Ben
bluejaycontactme@gmail.com
```

Where `{effortPhrase}` is deterministically picked from `EFFORT_PHRASES`
based on prospect.id — e.g. "I spent a few hours this week putting
together what a new website for you could look like" or "Worked on this
for a chunk of the afternoon yesterday — a website concept for you".

The follow-ups (Day 5 + Day 12) use the same principles with slightly
different framings: "Re: [Business]" + "just circling back" for follow-up
1, "Last check on [Business]" + graceful out for follow-up 2.

### Why this matters

Email deliverability compounds on volume + content. Bad body copy kills
sender reputation even if DKIM/SPF/DMARC are perfect. **Every single
email that lands in Promotions or Spam instead of Primary drags the
domain's reputation down.** One clean template at 80 words with 1 link
outperforms a polished 300-word template with 3 links every time. And
because we warm up over 14 days, the cost of a bad template during
warmup is 14 days of compounding reputation damage that takes 30+ days
to recover from. The template lives at the foundation — treat it as such.

## Outreach SMS Template Rules (NON-NEGOTIABLE — added 2026-04-19)

SMS templates follow the same philosophy as the email templates above —
adapted for the constraints of the channel. See `src/lib/sms.ts` for
the locked-in implementations of `getInitialSms`, `getFollowUpSms1`,
`getFollowUpSms2`, and `getPostVoicemailSms`.

### Core rules (mirror email rules)

- **ONE link only** — the short preview URL via `getShortPreviewUrl()`.
  Full UUIDs break on mobile line-wrapping and look like spam links in
  iMessage/Android. No portfolio URLs, no Calendly URLs.
- **Zero pricing language** — no "$997", no "3 payments of", no
  "one-time fee". Pricing lives on the claim page, reached by clicking
  the preview link.
- **Zero "book a walkthrough" CTAs** — no Calendly link in SMS ever.
  The soft reply prompt is the CTA.
- **Zero scarcity / urgency** — no "goes offline in 2 weeks", no "limited
  spots", no "expires soon". Feels like a scam text.
- **Personal 1-to-1 voice** — mention Ben by name in the initial SMS
  ("Ben from BlueJays") so the message doesn't look like a spam bot.
  Use the prospect's first name when we have one; "Hey there" fallback.
- **Include the effort hook** — "spent some time this week building..."
  carries the reciprocity psychology from the email pitch. Don't skip it
  on the initial SMS.
- **Closing reply prompt** — "Curious what you'd change" or "Take a look
  when you have a sec". Never "Would you like to schedule a call?".

### SMS-specific constraints

- **STOP compliance on EVERY message** — A2P 10DLC requirement. Append
  `Reply STOP to opt out` at the end of every single SMS we send to a
  prospect, regardless of message type. The kill-switch can be flipped
  via the `SMS_FUNNEL_DISABLED` env var while A2P approval is pending.
- **Stay under 2 segments (~306 chars)** — each segment = a Twilio bill.
  3+ segments also look spammy to carriers during the A2P scoring.
- **URL is the short URL** — the templates use `getShortPreviewUrl()`
  directly; the legacy `previewUrl` parameter on the function signatures
  is ignored (kept for backward compat with older callers).

### Banned phrases in SMS (never in any outgoing SMS body)

- Any price ($997, $349, etc.)
- Any Calendly / "book a call" / "schedule" language
- Any scarcity ("goes offline", "expires", "limited time")
- "Free website" (triggers SMS spam filters hard)
- Multi-link sequences (preview + portfolio + STOP = too many clickable
  elements in one message)

### Approved baseline templates

Locked in `src/lib/sms.ts`. The initial SMS reads:

```
Hey {name}, Ben from BlueJays — spent some time this week building a
website for {business}: {shortUrl} Take a look when you have a sec.
Reply STOP to opt out
```

Follow-up 1 (circle back):

```
{name} — circling back on the site I built for {business}:
{shortUrl} Curious what you'd change. Reply STOP to opt out
```

Follow-up 2 (graceful out):

```
{name} — last check on that {business} site: {shortUrl} If timing's
off, just say so and I'll stop reaching out. Reply STOP to opt out
```

Post-voicemail (right after a VM drop):

```
Hey {name}, just left you a voicemail about the site I built for
{business}: {shortUrl} Reply STOP to opt out
```

### Relationship to email + voicemail templates

The funnel schedule (from `FUNNEL_STEPS` in `src/lib/funnel-manager.ts`)
interlocks SMS, email, and ringless voicemail across 30 days:

| Day | Channels | Label |
|-----|----------|-------|
| 0 | email + SMS | Initial Pitch |
| 2 | voicemail | Voicemail Drop |
| 5 | email | Gentle Follow-Up |
| 12 | email + SMS | Value Reframe |
| 18 | voicemail | Follow-Up VM |
| 21 | email | Social Proof |
| 30 | email | Final Check-In |

Notes:
- **Voicemails on Day 2 + Day 18 only** — two ringless drops per funnel.
  Pre-launch they're effectively paused because (a) A2P 10DLC is still
  pending approval and (b) the voicemail provider integration has been
  intermittently failing. When voicemails can't deliver, the funnel
  tries SMS as a fallback — which is also blocked by `SMS_FUNNEL_DISABLED`
  today. So Day 2 + Day 18 simply skip during warmup and the prospect
  advances to the next email step.
- **SMS fires on Day 0 + Day 12 only** — aligned with the email pitch +
  Value Reframe so recipients who get both channels hear a consistent
  voice within a few minutes of each other.
- **Email fires on 5 days** — Day 0, 5, 12, 21, 30. Day 30 is email
  only (the graceful-out final check-in), NOT email + SMS. Don't
  double-send on the final day.
- **The tone matches across channels** so a prospect who receives both
  email + SMS + voicemail feels like they're hearing from the same
  person, not a marketing machine. Every surface uses the effort hook,
  the same short URL via `getShortPreviewUrl()`, and the same soft
  reply-prompt CTA pattern.

## Short URL Rules (NON-NEGOTIABLE — added 2026-04-19)

Any URL that a prospect or customer will see — in an email, SMS, voicemail,
Instagram DM, printed proposal, or anywhere else customer-facing — MUST use
the short URL format, not a raw UUID.

**Short URL pattern:** `https://bluejayportfolio.com/p/a1b2c3d4` (~40 chars)
**NOT:** `https://bluejayportfolio.com/preview/02b37937-2980-4101-929e-dfa8dd8aba13` (~85 chars)

Why:
- Full-UUID URLs are 85+ chars, wrap ugly in email clients, look spammy, get
  flagged by some spam filters for "long tracking links", and are impossible
  to dictate over the phone.
- Short `/p/[code]` URLs are clean, fit on one line, look trustworthy, and
  match every modern brand-friendly short-link pattern (bit.ly, tinyurl,
  Mailchimp's own shortener, etc.)
- The actual conversion rate impact is real and measurable — clean URLs
  consistently outperform UUID URLs in both open-rate and click-rate studies.

**Implementation:**
- Every prospect has a deterministic 8-char `short_code` (md5 of UUID).
- Backed by `prospects.short_code` column + migration `20260419_prospect_short_codes.sql`.
- Route: `/p/[code]/page.tsx` resolves the code to a prospect and renders the preview.
- Helper: `import { getShortPreviewUrl } from "@/lib/short-urls"` — **ALWAYS use this**
  when generating a customer-facing preview URL.

**RULES for new code:**
- NEVER hardcode `/preview/${id}` or `/preview/{uuid}` in a customer-facing string.
  Use `getShortPreviewUrl(prospect)` instead.
- NEVER hardcode `/claim/${id}` either — use `getShortClaimUrl(prospect)` when we
  add a short claim route.
- The long-form `/preview/[id]` route still works — it's our internal admin/dashboard
  path. Don't break it. But don't send it to prospects.
- If you're in a context where you only have a UUID and no prospect object, call
  `deriveShortCode(uuid)` from the same lib — it uses the same md5 derivation so
  you get the same short code without a DB lookup.

**Exceptions:**
- Internal admin/dashboard routes (/lead/[id], /image-mapper/[id], /preview-device/[id])
  can use full UUIDs — those are auth-gated and operator-facing.
- Internal APIs (/api/prospects/[id], /api/generate/[id], etc.) — not customer-facing.

## Public-Facing Surface Rules (NON-NEGOTIABLE — added 2026-04-17)

The sales funnel is PUBLIC: prospects arrive from email/SMS outreach without an auth cookie. Every page/route on the prospect path must work for unauthenticated visitors.

### Public routes + their data sources
- `/preview/[id]` — the rendered site preview. Loads data from `/api/generated-sites/[id]` (public, sanitized) and `/api/claim/[id]` (public, claim-safe whitelist).
- `/claim/[id]` — the checkout/offer page. Loads data from `/api/claim/[id]` + `/api/engagement/[id]` — BOTH public. Never calls `/api/prospects/[id]` (protected).
- `/compare/[id]` — same public data sources as the claim page.
- `/api/checkout/create` — public so prospects can initiate Stripe Checkout.
- `/api/webhooks/stripe` — public inbound webhook.

### Public API endpoints (safe to expose)
- `/api/claim/[id]` — whitelist of claim-safe fields ONLY: id, businessName, category, city, state, currentWebsite, googleRating, reviewCount, generatedSiteUrl, pricingTier, status, scrapedData. NEVER: phone, email, adminNotes, QC scores, funnel state.
- `/api/generated-sites/[id]` — returns the rendered siteData (same content prospects see anyway).
- `/api/engagement/[id]` — returns score + trigger flags only (no PII).
- `/api/image-audit/library` — internal admin tool, protected. NOT in PUBLIC_API_PATHS.

### RULES
- **Never add new public pages/components that fetch `/api/prospects/[id]`.** That route is protected and will always return 401 to unauthenticated visitors — the page will look broken. Use `/api/claim/[id]` instead.
- **Never expose phone/email/adminNotes through a public endpoint.** When adding a new field to the `/api/claim/[id]` whitelist, triple-check it doesn't contain contact info or internal notes.
- **Iframing external business sites is forbidden.** Almost all real business sites set X-Frame-Options or frame-ancestors CSP — the iframe will render blank. Use thum.io (`https://image.thum.io/get/width/.../fullpage/.../png/{url}`) to capture a screenshot instead.
- **Every public page gets smoke-tested in incognito after deploy.** Specifically: claim, preview, compare. If any part of the page shows "Unauthorized" / 404 / blank iframe for an unauthenticated visitor, it's broken and must be fixed before the page is considered production-ready.

## Preview Page Simplification Rules (added 2026-04-17)

The preview page shows the prospect their future site. It must NOT simulate/reformat anything.

- **No device toggle UI.** The page auto-detects the visitor's actual device via `matchMedia('(max-width: 768px)')`. Phone users get phone-width rendering; desktop users get desktop rendering. The site's own Tailwind responsive classes handle the layout.
- **No phone-frame simulator wrapper.** Mobile users just see the site at their natural viewport width. Don't wrap it in a 390px "phone" div or add bezels.
- **`?device=mobile|desktop` URL param still works** as an override for internal tools (dashboard screenshots, thum.io capture, etc.). Only add the param when you need a specific capture; don't force a view on real prospects.
- **Floating "Claim this site →" CTA** anchored bottom-right is how prospects move from the preview to `/claim/[id]`. That's the ONLY path forward on the preview page — no other CTAs, no social proof modals, no chat widgets on the preview.
- **`?embed=1` mode** hides the floating CTA + video button + disclaimer banner, for use inside screenshot services / iframes / etc. Required whenever the preview is rendered inside another context.
- **Preview page is PUBLIC.** Don't add any data fetch that hits protected routes.

## Claim Page Simplification Rules (added 2026-04-17)

The claim page is the conversion surface. By the time a prospect lands here, they've already seen the preview — the claim page is pure offer + payment.

- **NO preview iframe/screenshot component on the claim page.** Showing the preview again is clutter. A single subtle "Re-open your preview site ↗" link is the only reference to the preview.
- **Claim page = hero + value breakdown + trust badges + detailed what's-included + social proof (smart-triggered) + payment CTAs + money-back guarantee + chat.** That's the full structure. Don't add more sections.
- **Every payment-plan selector must call `redirectToCheckout(plan)` directly** (don't just set `?plan=...` in the URL and reload — that makes the button appear broken to prospects who expect a click to DO something).
- **The preview link in outreach emails/SMS points at `/preview/[id]`, not `/claim/[id]`.** Prospects flow: email → preview → claim → stripe. Never short-circuit email → claim.

## Custom Pricing Tier Rules (NON-NEGOTIABLE — added 2026-04-20)

A third pricing tier called `custom` exists alongside `standard` ($997) and
`free` ($30). It's for bespoke, hand-built websites that live at their own
domain (e.g. Lewis County Autism Coalition at `lcautism.org`) — NOT
V2-template-generated previews.

### Billing structure — custom ($100/yr)

- Day 0: $100 charged at checkout via Stripe subscription (`mode: "subscription"`,
  `interval: year`).
- **No trial period**, **no separate setup fee**.
- Year 1, Year 2, Year 3+: $100/yr each year on the renewal date.
- The custom tier subscription IS the management subscription. The webhook
  handler explicitly skips `createDeferredManagementSubscription()` for custom-tier
  sessions so the customer is never double-billed.

### Rules

- **Ben manually tags prospects as `custom`.** There is no auto-routing
  logic and no self-serve tier switch on `/claim/[id]`. The claim page
  detects `pricingTier === "custom"` and renders a custom-specific hero +
  CTA, but the tier assignment itself is a manual SQL/dashboard action.
- **`prospects.custom_site_url` holds the absolute URL** of the live hand-built
  site. Must start with `http://` or `https://`.
- **`/p/[short_code]` redirects to `custom_site_url` for custom-tier prospects**
  instead of rendering a `PreviewClientPage`. The short URL becomes a
  brand-friendly shortlink pointing at the real site. Non-custom tiers
  continue to render the template preview as before.
- **Stripe SKU:** set `STRIPE_PRICE_CUSTOM_ID` env var to a pre-created
  $100/yr Stripe Price. The code falls back to inline `price_data` if the
  env var is missing, but pre-created SKU is preferred for reporting.
- **Webhook skip:** `/api/webhooks/stripe/route.ts` must check
  `session.metadata?.pricingTier === "custom"` and skip
  `createDeferredManagementSubscription()`. Double-billing a customer $100+$100
  starting year 2 is an unrecoverable customer-trust blow.
- **The subscription id returned by Stripe IS saved as `mgmtSubscriptionId`**
  on the prospect record — same field the standard/free tiers use for the
  deferred sub. Keeps the dashboard's subscription-tracking UI consistent
  across all three tiers.

### When to assign a prospect to custom tier

- They came in through a direct 1:1 relationship (referral, network, word-of-mouth)
  and Ben builds them a hand-crafted site outside the V2 template system
- They specifically asked for something more involved than a template fill-in
- They're a non-profit, community org, or mission-driven business whose site
  needs a bespoke feel that V2 templates can't match
- Ben explicitly decided they're a custom project

### When NOT to assign custom

- Any prospect in the auto-funnel warmup pipeline
- Any prospect whose preview is a V2-template render
- Free tier friends/family — they go to `free` at $30

### Relationship to the rest of the stack

- Warmup/email/SMS outreach DOES apply to custom prospects if they're in the
  funnel state — the pricing tier is orthogonal to the outreach state
- Pre-purchase onboarding + welcome email + 30-min reminder work identically
  across all three tiers (the welcome email mentions `/onboarding/[id]` regardless)
- Post-purchase, custom-tier prospects still fill out the onboarding form,
  but most of their content is already live at their own site — the form is
  used more for metadata capture

## Stripe Payment Rules (NON-NEGOTIABLE — added 2026-04-17)

### Billing structure — full-pay ($997)
- Day 0: customer pays $997 one-time. NO recurring charge.
- Webhook (`checkout.session.completed`, `session.mode === "payment"`) creates a $100/yr mgmt subscription with `trial_end` = now + 365 days.
- Day 365: first $100 mgmt charge. Then annual forever.

### Billing structure — installment (3 × $349)
- Day 0: checkout creates a MONTHLY $349 subscription. First $349 charged at checkout.
- Webhook (`checkout.session.completed` with `metadata.paymentPlan === "installment"`) PATCHes the subscription with `cancel_at = now + 92 days` so Stripe auto-cancels after 3 charges (today, ~day 30, ~day 60).
- Day ~92: Stripe fires `customer.subscription.deleted`. Our webhook detects `metadata.paymentPlan === "installment-3x349"` and creates the deferred $100/yr mgmt sub just like full-pay does.

### Rules
- **NEVER attach STRIPE_PRICE_MGMT_ID as a checkout line item.** If you do, Stripe will charge the $100 mgmt fee IMMEDIATELY (day 0), which customers don't expect. The mgmt subscription is ALWAYS created via webhook post-payment with a trial so the first charge lands exactly 1 year later.
- **`subscription_data.cancel_at` is NOT a valid param on `checkout.sessions.create`** — that was a mistake earlier in this codebase's history. Set cancel_at POST-creation via `stripe.subscriptions.update(id, { cancel_at })` from the webhook handler.
- **baseUrl for Stripe success/cancel URLs is hardcoded to `https://bluejayportfolio.com`** in stripe.ts. DO NOT use `process.env.NEXT_PUBLIC_BASE_URL` — that env var on Vercel was set to a stale preview URL and Stripe rejected the session with "Not a valid URL". Same hardcoding pattern as FROM_EMAIL.
- **Webhook MUST be registered in the SAME Stripe account/sandbox as the `STRIPE_SECRET_KEY` on Vercel.** Events only flow within a single account; if the key is from Account A and the webhook lives in Account B, events never reach the endpoint. Verify by matching the account prefix in `sk_test_51{prefix}...` to the account ID in the Stripe dashboard.
- **Required env vars on Vercel for Stripe to work end-to-end:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (matches the endpoint's signing secret), and optionally `STRIPE_PRICE_SETUP_ID` + `STRIPE_PRICE_MGMT_ID`. Before LIVE launch, re-register a separate webhook in Live mode with its own `whsec_*` and swap the keys from `sk_test_*` to `sk_live_*`.

## Parallel Domain Warming (added 2026-04-17)

Two sender domains run warmup in parallel so daily capacity doubles at every ramp stage.

- **Primary:** `bluejayportfolio.com` — existing SendGrid domain auth + single sender `bluejaycontactme@gmail.com`.
- **Backup:** `bluejaywebs.com` — new domain authenticated via SendGrid. Sends from `ben@bluejaywebs.com`; because there's no real inbox at that address yet, Reply-To is set to `bluejaycontactme@gmail.com` so prospect replies land in the working Gmail.
- Both domains ramp independently 10/day → 100/day over 14 days. Combined: 20/day → 200/day by Day 14.
- `pickSendingDomain()` in `domain-warming.ts` picks whichever domain has more remaining capacity today. If one hits SendGrid rate limits or bounces, the other keeps flowing.
- `canSendEmail(domain)` and `recordEmailSent(domain)` are per-domain. State lives in Supabase `domain_warming` table keyed by domain (two rows, one per domain).
- Schema migrations: `supabase/migrations/20260416_domain_warming.sql` (initial table) + `20260416_parallel_warming.sql` (unique-by-domain index + bluejaywebs.com seed row).
- **Enable a domain via POST `/api/warming` with body `{"domain":"..."}`.** Defaults to primary if no body.
- Daily digest SMS shows both domains' ramp state so Ben can spot imbalances.

## Image Audit Tool (added 2026-04-17)

Internal admin page at `/image-audit` for Ben to manually review the image-mapper's THEME_LIBRARY stock photos.

- Renders every slot across all 46 categories as a numbered grid (e.g. #1–#408).
- Click any image to flag it for removal. Flagged IDs appear as a comma-separated list at the top; Copy button copies to clipboard.
- Ben pastes the flagged IDs back to Claude; Claude removes those slots from `src/app/image-mapper/[id]/page.tsx` + `src/lib/image-mapper-library.ts`.
- `THEME_LIBRARY` is duplicated across those two files — keep them in sync when editing. The mapper page is the runtime source; the library file is a shared copy so the audit page can render without importing client-state from the mapper.
- Route protected behind the admin auth middleware (same as `/dashboard`, `/image-mapper`, etc.).

## Video Generation Status (added 2026-04-17)

The TTS walkthrough video generator (OpenAI TTS + Puppeteer + FFmpeg) is built at `src/lib/video-generator.ts` but **does not work on Vercel's Hobby/Pro serverless functions** — @sparticuz/chromium binary is ~63MB compressed / ~200MB unzipped and exceeds the bundle size limit at runtime even with `includeFiles` in vercel.json.

- Auto-generation is wired into `enrollInFunnel()` and will fire silently on every enrollment, but currently always fails with "No Chromium executable available for video capture."
- Email + SMS outreach templates degrade gracefully: if `video_url` isn't set on the prospect, the walkthrough paragraph is omitted from the email body.
- Preview page's `PreviewVideoButton` component reads `/api/videos/[id]` and only renders the floating "Watch Walkthrough" pill when a video exists.
- **Resolution paths (post-May-1):** (a) use Browserless.io cloud Chrome-as-a-service (~$20/mo, works with Vercel), (b) generate videos locally on Ben's PC via CLI and upload MP4s to Supabase Storage, (c) self-host Puppeteer on a separate server. Do NOT try to make Vercel work for this — the size limit is fundamental.

## thum.io Screenshot Service (added 2026-04-17)

Used to capture real-site screenshots we can't iframe (most prospect sites block cross-origin embedding).

- **URL format:** `https://image.thum.io/get/width/1400/fullpage/noanimate/png/<full-url>`
- **Free tier, no auth key required.** First capture per URL is ~30s (Stripe render + cache); subsequent requests are instant.
- **`fullpage` option** captures the entire rendered page height. `crop/N` truncates at N pixels — don't use that unless you specifically want a top-fold crop.
- **Rate limits are generous** at current volume (under 200 prospects/day). If we outgrow it, consider Browserless.io or ScreenshotOne with API key as upgrades.

## TypeScript Debt (added 2026-04-17)

- `next.config.ts` sets `typescript: { ignoreBuildErrors: true }` as a safety net. The codebase should still ship with 0 errors — the flag exists so a single stray error never blocks a production deploy.
- Current count: **0 errors**. If you see tsc errors after editing, fix them immediately — don't let the count creep back up. `ignoreBuildErrors` is an emergency valve, not a license to ignore types.

## Funnel Architecture Recap (added 2026-04-17)

End-to-end flow at launch (May 1, 2026):

```
Scouting (auto-scout) → Scraping → Site Generation → QC (Claude + automated)
    → Manual Approval (Ben) → Funnel Enrollment → Parallel Warmup Email
      → Preview Page (/preview/[id]) → Claim Page (/claim/[id])
      → Stripe Checkout → Webhook → status=paid + $100/yr mgmt sub
    → Onboarding → Handoff
```

Key infrastructure:
- Supabase: prospects, scraped_data, funnel_enrollments, domain_warming, emails, email_events, generated_sites (with video_* columns), funnel_retry_queue, auto_scout_progress
- Vercel cron: `/api/funnel/run` daily at 08:00 UTC + `/api/replies/process` every minute
- SendGrid: both `bluejayportfolio.com` and `bluejaywebs.com` domain-authenticated; per-domain SENDERS lookup in email-sender.ts
- Twilio: A2P 10DLC pending carrier approval (required for US SMS at scale)
- Stripe: Sandbox mode for testing; Live mode keys + Live mode webhook required before May 1
- OpenAI + Anthropic API keys on Vercel for QC/supercharge pipeline

## Client Features System (for paid clients — businesses whose websites we built)

**Core philosophy:** "Best website = better online reputation." The three client features below are value-adds included with every $997 website. They make the site actively generate leads and protect the owner's Google reputation automatically. Each feature is scoped per-prospect by `prospectId`. Only `status: "paid"` prospects should have these features enabled.

### Feature 1: Google Review Funnel

**What it does:**
- Business owner texts past customers a link: `bluejayportfolio.com/review/[prospectId]`
- Customer taps the link and rates 1–5 stars
- **5 stars** → Thank you message + "Leave us a Google Review" button (links to their Google listing)
- **1–4 stars** → Private feedback form. Feedback is emailed to the business owner. Never goes public.
- This filters negative reviews OUT of Google while funneling 5-stars IN.

**Files:**
- `src/app/review/[id]/page.tsx` — server component, fetches prospect, passes props
- `src/app/review/[id]/ReviewClient.tsx` — interactive star rating UI ("use client")
- `src/app/api/review/submit/route.ts` — saves review to `client_reviews` Supabase table, emails owner on < 5 stars
- `src/app/api/review-request/send/route.ts` — POST `{ prospectId, customerPhone, customerName? }` → sends SMS to customer

**Dashboard UI:**
- `src/components/dashboard/ReviewRequestPanel.tsx` — collapsible panel for entering customer phones and sending requests. Include this in ProspectDetail for paid clients.

**Supabase tables needed:**
```sql
create table client_reviews (
  id uuid primary key,
  prospect_id text not null,
  business_name text,
  rating int not null,
  feedback text,
  submitted_at timestamptz default now()
);
```

**Rules:**
- NEVER redirect < 5 star reviews to Google. They go to the owner's inbox only.
- Google review URL: prefer `scrapedData.googlePlaceId` for direct link. Fall back to Google search URL.
- The review page uses the business's `accentColor` for branding. Feels custom-built.
- Always mention "Powered by bluejayportfolio.com" in the footer of the review page.

---

### Feature 2: Missed-Call Auto-Texter

**What it does:**
- When a customer calls the client's business phone and gets no answer, they automatically receive an SMS within seconds:
  > "Hi! You just called [BusinessName] and we missed you. Book a time here: [booking link]"
- This recovers missed leads that would otherwise call a competitor next.

**How it works (Twilio):**
1. Buy or assign a Twilio phone number to the client in Twilio dashboard
2. Set that number's "A call comes in" webhook URL to:
   `https://bluejayportfolio.com/api/missed-call/twiml/[prospectId]`
3. Set the Status Callback URL to:
   `https://bluejayportfolio.com/api/missed-call/callback`
4. Store the client's Twilio number in Supabase: `client_feature_configs.missed_call_config.clientPhoneNumber`

**Files:**
- `src/app/api/missed-call/twiml/[id]/route.ts` — TwiML: greets caller, records voicemail, tells them to expect a text
- `src/app/api/missed-call/callback/route.ts` — receives Twilio StatusCallback, detects missed/no-answer calls, sends auto-SMS to caller
- `src/app/api/missed-call/config/[id]/route.ts` — GET/PATCH per-client config (enabled, customMessage, clientPhoneNumber)

**"Missed call" detection logic:**
- `CallStatus === "no-answer"` OR `CallStatus === "busy"` OR `CallStatus === "failed"` → missed
- `CallStatus === "completed"` AND `CallDuration < 10` → also missed (rang through, hung up before VM)

**Supabase tables needed:**
```sql
create table client_feature_configs (
  prospect_id text primary key,
  missed_call_config jsonb,
  updated_at timestamptz default now()
);
```

**Rules:**
- NEVER send the auto-SMS if the call was answered (CallStatus = "completed" with duration > 10s)
- The auto-SMS always includes the `/book/[id]` booking link so the caller can self-schedule
- This feature is ON by default for all paid clients
- Per-client custom message can be set via PATCH `/api/missed-call/config/[id]`

---

### Feature 3: Booking Automation (Contact Form → Auto Booking SMS)

**What it does:**
- When someone submits the contact/inquiry form on the client's website, they instantly receive an SMS:
  > "Hi [Name]! Thanks for reaching out to [BusinessName]. We'll be in touch shortly. Want to pick a time now? [booking link]"
- Also emails the business owner with the full lead details.
- Saves submission to `contact_form_submissions` Supabase table.

**File:** `src/app/api/contact-form/[id]/route.ts`

**Integration:**
- Client websites POST to `https://bluejayportfolio.com/api/contact-form/[prospectId]`
- Body: `{ name, phone, email?, message?, service? }`
- CORS headers allow cross-origin posts from client websites
- Booking link = `/book/[prospectId]` (existing booking page) or client's own Calendly URL

**Supabase tables needed:**
```sql
create table contact_form_submissions (
  id uuid primary key,
  prospect_id text not null,
  business_name text,
  customer_name text,
  customer_phone text,
  customer_email text,
  message text,
  service_requested text,
  submitted_at timestamptz default now(),
  sms_sent boolean default false,
  email_sent boolean default false
);
```

**Rules:**
- ALWAYS send auto-SMS immediately on submission — this is the key conversion hook
- Include a booking link in every auto-SMS — don't just say "we'll call you"
- Email the business owner every time so they can follow up manually too
- CORS is open on this endpoint — client sites are hosted on other domains

---

### Onboarding Integration: Booking Link After Form Submit

After a paying client submits their onboarding form (`/api/onboarding/[id]`), send them an SMS with next steps + their booking link if applicable. This is already sending an owner alert — add a welcome SMS to the client (business owner) if their phone is on file.

---

## ════════════════════════════════════════════
## BEN'S HOME TODO LIST (updated 2026-04-22)
## ════════════════════════════════════════════

---

### BLOCK 1 — MUST DO BEFORE FIRST EMAIL GOES OUT

- [ ] **Add `BEN_PHONE` env var on Vercel**: `BEN_PHONE=(253) 886-3753`
  - This shows up in every email signature and the claim page. Set it once, appears everywhere.

- [ ] **Run the email patch script** with your real Supabase credentials:
  ```
  SUPABASE_URL=https://[your-project].supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key] \
  npx tsx scripts/patch-prospect-emails.ts
  ```
  Adds emails to 8 prospects, moves Meyer Electric back to "generated".

- [ ] **Set up SendGrid domain authentication** (~20 min, one-time):
  1. SendGrid → Settings → Sender Authentication → Authenticate a Domain
  2. Enter `bluejayportfolio.com`
  3. Copy the 3 DNS CNAME records it gives you
  4. Add those records to your DNS (Vercel Domains or wherever bluejayportfolio.com lives)
  5. Click "Verify" in SendGrid once DNS propagates (~5-30 min)
  6. Vercel → Project Settings → Environment Variables → add `FROM_EMAIL=ben@bluejayportfolio.com`
  7. Redeploy

- [ ] **Set SendGrid Event Webhook**:
  - SendGrid → Settings → Mail Settings → Event Webhook
  - URL: `https://bluejayportfolio.com/api/email-tracking`
  - Enable: click, open, bounce, spam report

- [ ] **Approve prospects in dashboard** — review the pending prospects, approve the ones ready, funnel fires automatically.

---

### BLOCK 2 — CREDIBILITY (DO BEFORE SCALING TO 100+ EMAILS)

These are the things the code can't do for you. Without these, scaling outreach just means more people googling you and finding nothing.

- [ ] **Get 3 real paying clients first** — friends, family, a business you know personally. Charge $97 or free. The goal is testimonials, not revenue. Even one real client with a name and face is worth more than every line of copy on the claim page.

- [ ] **Create a Google Business Profile for BlueJays**:
  1. Go to business.google.com
  2. Create profile: "BlueJays Web Design" — Washington State
  3. Category: Web Designer
  4. Add your phone (253) 886-3753, website bluejayportfolio.com
  5. Ask your first 3 clients to leave you a Google review here
  This is what a skeptical business owner finds when they Google you. Right now there's nothing.

- [ ] **Add a short "About Ben" section to bluejayportfolio.com** — just your name, that you're local (Washington), and 1-2 sentences about why you do this. Business owners are buying from a person. Make it personal. A headshot helps.

- [ ] **Text or call Steadfast Plumbing**: (360) 797-2979 — no email found, but they're a warm prospect
- [ ] **Text or call Sequim Valley Electric**: (360) 681-3330 — same situation

---

### BLOCK 3 — FUNNEL IMPROVEMENTS (BUILT — NEED WIRING)

- [ ] **Add `BEN_PHONE` to Vercel env vars** — `(253) 886-3753` (see Block 1). Shows up in all emails automatically.

- [ ] **Set up Supabase tables for client features** (run in Supabase SQL editor):
  ```sql
  create table if not exists client_reviews (
    id uuid primary key,
    prospect_id text not null,
    business_name text,
    rating int not null check (rating between 1 and 5),
    feedback text,
    submitted_at timestamptz default now()
  );

  create table if not exists client_feature_configs (
    prospect_id text primary key,
    missed_call_config jsonb default '{}',
    updated_at timestamptz default now()
  );

  create table if not exists contact_form_submissions (
    id uuid primary key,
    prospect_id text not null,
    business_name text,
    customer_name text,
    customer_phone text,
    customer_email text,
    message text,
    service_requested text,
    submitted_at timestamptz default now(),
    sms_sent boolean default false,
    email_sent boolean default false
  );

  create table if not exists schedule_bookings (
    id uuid primary key,
    prospect_id text not null,
    business_name text,
    contact_name text,
    phone text,
    email text,
    slot_iso timestamptz not null,
    slot_label text,
    date text,
    notes text,
    status text default 'confirmed',
    created_at timestamptz default now()
  );
  ```

- [ ] **Test review funnel on your phone**:
  1. Open `bluejayportfolio.com/review/[any-prospect-id]`
  2. Tap 5 stars → should show Google review button
  3. Tap 3 stars → fill feedback → submit → you should get an email

- [ ] **Test scheduling modal**: open `bluejayportfolio.com/schedule/[any-prospect-id]` — should show a calendar, tap a date, pick a slot, fill in details, confirm. Check that you get an email/SMS.

- [ ] **Wire missed-call auto-texter for first paid client**:
  1. In Twilio: assign or buy a number for the client
  2. Set incoming call URL → `https://bluejayportfolio.com/api/missed-call/twiml/[prospectId]`
  3. Set status callback → `https://bluejayportfolio.com/api/missed-call/callback`
  4. PATCH `/api/missed-call/config/[id]` with `{ clientPhoneNumber: "+1XXXXXXXXXX" }`

- [ ] **Add ReviewRequestPanel to the ProspectDetail view** for paid clients — import from `src/components/dashboard/ReviewRequestPanel.tsx` and render it when `prospect.status === "paid"`.

---

### BLOCK 4 — GROWTH (LATER, AFTER FIRST 5 CLIENTS)

- [ ] **Lewis County Autism Coalition** — find the Claude session where you built it, bring the code in. Fix the mobile English→Spanish button.

- [ ] **Build a client dashboard at `/client/[id]`** — where paying clients can see their review stats, contact form submissions, and missed call logs. The reviews + scheduling system is already built; this is just a read-only UI over the data.

- [ ] **CSV uploader for review blast** — business owner pastes 50 past customer phone numbers, system sends review request SMS to all of them at once. Gets clients 20+ Google reviews fast. This is a major upsell.

- [ ] **Google Calendar integration** — let clients OAuth-connect their Google Calendar so bookings appear automatically. Right now it uses our custom slot system.

=======

## SMS A2P 10DLC Compliance Rules (NON-NEGOTIABLE — locked in 2026-04-20)

TCR rejected the first A2P 10DLC campaign submission citing issues
verifying the Call-to-Action (CTA). Root cause: the opt-in description
said "businesses whose numbers appeared on public business listings
(Google, Yelp, BBB)" — which TCR does NOT accept as valid SMS consent
under TCPA. Scraped public business numbers are not opt-ins.

**The fix is permanent and enforced in code:**

### SMS fires ONLY for `prospect.source === "inbound"` prospects

This is gated inside `src/lib/funnel-manager.ts`:
- `buildStepPayload()` checks `prospect.source === "inbound"` before
  building any SMS payload. Cold-outreach prospects (`source: "scouted"`)
  get `smsBody = undefined` and only receive email + voicemail.
- `buildVoicemailFollowUpPayload()` applies the same gate to the
  post-voicemail SMS follow-up.

### What counts as a valid opt-in source
1. **Inbound form submission** — prospect fills out `/get-started` and
   ticks the required SMS consent checkbox. `/api/leads/submit` sets
   `source: "inbound"` on the created prospect. The checkbox wording
   is locked — it must reference both email AND SMS, mention frequency
   (up to 4/week), "Msg & data rates may apply", and "Reply STOP to
   opt out". See `src/app/get-started/page.tsx` for the current copy.
2. **Direct reply expressing interest + providing phone** — manually
   updated to `source: "inbound"` when a prospect replies to email/VM
   asking Ben to text them. Record the consent capture in prospect notes.

### What does NOT count
- Scraping a number from Google Business Profile / Yelp / BBB
- The number being "publicly available"
- The business being "obviously commercial"
- Any interpretation where the user didn't take an affirmative action

### Cold-outreach funnel shape (post-gate)
| Day | Channels |
|---|---|
| 0 | email only (was email + SMS) |
| 2 | voicemail |
| 5 | email |
| 12 | email only (was email + SMS) |
| 18 | voicemail |
| 21 | email |
| 30 | email |

Inbound prospects still get the full email + SMS + voicemail mix on
the same schedule.

### Fields TCR must validate (locked in the resubmission)
- Privacy Policy URL: `https://bluejayportfolio.com/privacy` (must render)
- Terms URL: `https://bluejayportfolio.com/terms` (must render)
- Sample messages: fully rendered, no `{placeholder}` tokens
- STOP compliance: every SMS template ends with "Reply STOP to opt out"
- HELP reply: "BlueJay Business Solutions: Custom website previews for
  local businesses. Email bluejaycontactme@gmail.com or see /terms.
  Reply STOP to unsubscribe."

### NEVER do (kills the campaign after approval)
- Remove the `source === "inbound"` gate in funnel-manager
- Send SMS to a prospect whose `source` is `"scouted"` or unknown
- Describe opt-in sources to TCR that don't match what the code does
- Skip the consent checkbox on `/get-started` — TCR can crawl it

---

## Marketing Plan — Cold Outreach Without SMS (locked in 2026-04-20)

With SMS restricted to inbound opt-ins, the cold-outreach funnel relies
on email + voicemail only — which alone underperforms the
email+SMS+VM combo. These channels fill the gap and several convert
BETTER than SMS did. Ship in this order.

### Tier 1 — Highest impact

**1. Inline OG screenshot in pitch email (BUILT 2026-04-20, GATED OFF)**
- `EmailTemplate.htmlBody?` field added; `getPitchEmail` returns
  multipart text+HTML WHEN `ENABLE_HTML_PITCH_EMAIL=true` env var is set.
  HTML body embeds a clickable `<img>` of the prospect's thum.io preview
  screenshot above the link.
- `sendViaSendGrid` in `src/lib/email-sender.ts` accepts the optional
  `htmlBody` param and sends as multipart. Plain text stays as
  fallback for HTML-off clients.
- **Deliverability finding 2026-04-20 (live A/B test):** sending the
  multipart HTML+image pitch from a Day-5-of-14 warming domain to a
  brand-new Gmail inbox landed in SPAM every time. Same content as
  plain-text-only landed in Primary. Gmail's classifier treats
  HTML + inline image from unseasoned senders as commercial/promo
  material regardless of personalisation.
- **Gate:** HTML pitch is only built when `ENABLE_HTML_PITCH_EMAIL=true`
  on Vercel. Keep OFF during warmup. Turn ON only AFTER Day 14 of each
  domain's ramp, once the domain has reputation to absorb the HTML.
  Plan to A/B test primary-tab placement by flipping this on one
  domain at a time post-warmup.
- Shared helper: `getPreviewScreenshotUrl(prospectId)` returns the
  thum.io URL. Use it everywhere the screenshot is referenced (OG meta,
  email HTML, postcards) so cache keys stay consistent.
- **NEVER flip `ENABLE_HTML_PITCH_EMAIL=true` during warmup.** Every
  Spam/Promotions landing drags reputation. A single day of HTML
  sends to a cold inbox list can set warmup back 7+ days.

**2. Personalized video walkthrough pipeline (PARKED 2026-04-20 — post-launch)**

Status: All infrastructure wired, provisioned, and debugged through round 9
— still OOM-killing on Vercel Lambda at 3008MB memory + 4000px image cap.
The ffmpeg `split + 5x crop + concat` filter graph holds too much frame data
in memory simultaneously. Fixing requires rewriting `renderVideoFromPlan` to
stream segments sequentially to disk instead of parallel-processing in RAM.
Significant refactor — not worth the pre-launch risk.

**What's already in place (ready for post-launch pickup):**
- Browserless.io account provisioned with key on Vercel (paid, working)
- Supabase `generated-videos` bucket created (public, 50MB, mp4/webm)
- `BROWSERLESS_API_KEY` detected → `launchCaptureBrowser()` uses it
- ffmpeg auto-downloads to /tmp on cold start (no bundling issues)
- Screenshot capped at 4000px height (prevents most OOMs)
- Lambda memory bumped to Pro-max 3008MB
- `OPENAI_API_KEY` on Vercel working (TTS narration ready)
- `toAbsolutePreviewUrl` always prepends https:// (no more invalid URLs)
- Short codes backfilled for all 224 prospects
- Auto-generation wired into `enrollInFunnel()` — will kick in the moment
  rendering works

**The remaining blocker:** `renderVideoFromPlan` in `video-generator.ts` — the
  filter chain `[0:v]scale=W:-1,split=N...[concat]...` duplicates decoded
  frames N times in RAM. For 1440x4000 input, that's ~86MB per split × 5
  segments = 430MB + ffmpeg buffers + Node overhead. Sporadically OOM-kills
  on Vercel even at 3008MB. `SIGKILL` happens outside any try/catch so the
  client gets a generic Next.js 500 HTML page instead of our JSON error.

**Fix when revisited:**
1. Rewrite to process segments one at a time, write each to a tempfile, then
   `concat demuxer` the tempfiles into final output. Uses ~1/N the memory.
2. Alternative: call a dedicated video-service API (Shotstack $50/mo,
   Synthesia, HeyGen) — zero DIY debugging. Pass template + prospect data.
3. Interim workaround for high-value prospects: Ben records Loom videos
   manually (~5 min each). More personal than TTS anyway.

**Short-URL fact discovered along the way:** 224 prospects were missing
`short_code` in the DB. All backfilled via md5(uuid)[:8] — `/p/[code]`
route now resolves for everyone.
- `src/lib/video-generator.ts::launchCaptureBrowser()` detects
  `BROWSERLESS_API_KEY` and connects to Browserless.io via
  `wss://production-sfo.browserless.io/chrome?token=...&stealth=true`.
  Falls back to local @sparticuz/chromium for dev.
- Fixes the Vercel 250MB bundle limit that blocked video gen before.
- `enrollInFunnel()` already fires `generateProspectVideo()` async on
  every enrollment — no SKIP flag, no wiring changes needed. Once the
  env var is set, video gen runs automatically.
- `POST /api/videos/[id]` — manual trigger, synchronous, `maxDuration=300`.
- `GET /api/videos/[id]` — returns video URL when ready.
- Supabase storage bucket `generated-videos` created 2026-04-20,
  public, 50MB file-size limit, allows video/mp4 + video/webm.
- Output URL: appended to outreach via the existing `{videoUrl}`
  token in `email-templates.ts` (buildVideoBlock).
- **Action required before it runs:** Ben to provision Browserless.io
  account (7-day free trial, then $19/mo Starter = 10k sessions) and
  add `BROWSERLESS_API_KEY` to Vercel env vars in all three environments.
- Smoke test once key set:
  ```
  curl -X POST "https://bluejayportfolio.com/api/videos/{prospectId}" \
    -H "Authorization: Bearer $ADMIN_PASSWORD" -m 300
  ```
- Cost math: 1 video = 1 Browserless session ≈ $0.0019 on Starter plan,
  ~$0.30/video at full 100-per-day runs. Starter plan covers 10k videos/mo.

**3. Direct mail postcard pipeline (SCAFFOLDED 2026-04-20)**
- `src/lib/postcard-sender.ts` created. `sendPostcard(prospect)` sends
  via Lob API — renders HTML front (screenshot overlay) + back
  (handwritten-style note with QR + short URL).
- Gated by `isEligibleForPostcard()`: only fires for prospects with
  4.5+ star rating and 20+ reviews, protecting the ~$1.50 per-send cost.
- Cost logged via `logCost()` service=`lob_postcard` so the /spending
  dashboard tracks it.
- **Action required**: set env vars on Vercel:
  - `LOB_API_KEY` (start in test mode with `test_pub_...`, switch to
    `live_pub_...` when ready)
  - `LOB_FROM_NAME`, `LOB_FROM_LINE1`, `LOB_FROM_CITY`, `LOB_FROM_STATE`,
    `LOB_FROM_ZIP` — return address on every postcard
- **Wiring required** (not done yet): add a funnel step at Day 7 that
  calls `sendPostcard(prospect)`. Insert in `FUNNEL_STEPS` after email
  1 and before email 2.

### Tier 2 — Ship when Tier 1 is live

**4. LinkedIn outreach**
- Discover business owner's LinkedIn via Apollo.io API (~$30/mo) or
  manual search during review.
- Free-tier LinkedIn allows 15-20 connection requests/day.
- Template: "Saw your 5-star reviews in Sequim — built a website for
  you, happy to send the link if it is useful."
- Track connection responses in CRM as a new outreach channel.
- 100% compliant — no TCR, no CAN-SPAM, no DNC list overlap.

**5. Preview/claim page retargeting pixels**
- Install Facebook Pixel + Google Ads tag on `/preview/[id]` and
  `/claim/[id]`.
- When prospect opens preview, they enter a 30-day retargeting window.
- Spend $50-100/mo on brand-awareness retargeting ads across Meta +
  Google Display. Ambient exposure makes the eventual email/VM land
  warmer because "I have seen these guys before."
- Add to Privacy Policy: mention the retargeting pixel.

**6. Outbound voice calls (by Ben, not automated)**
- Voice calls are NOT under A2P 10DLC. TCPA + DNC list apply, but
  business-to-business voice is explicitly permitted.
- Script: "Hi, this is Ben from BlueJay. I built a website preview for
  [Business] — mind if I text or email you the link?" The ask flips
  them to inbound then legally SMS-eligible.
- Twilio outbound voice: $0.015/min. 100 calls/day ~ $5.
- Best for high-intent prospects (opened email, did not claim).

### Tier 3 — Nice-to-have adds

**7. "Text me back" form on `/preview/[id]`**
- Small widget at bottom: "Want me to text you when I am free? [phone]"
- Explicit opt-in captured then prospect becomes SMS-eligible.

**8. Chamber of Commerce / BBB data hook**
- Scrape chamber membership lists during extraction.
- Email opener: "Saw you are a Sequim Chamber member..." — zero cost,
  big local trust signal.

**9. Exit-intent modal on `/claim/[id]`**
- When cursor heads for close button, show: "Leaving without claiming?
  Want me to email the preview in 3 days as a reminder?"
- Captures lapsed interest.

**10. Automated warm-intro via shared LinkedIn connections**
- Scrape shared connections via Apollo. Mention 1 by name in email.
- Trust signal: mutual acquaintance reference.

### Implementation order (after May 1 launch)
1. Monitor inline-screenshot email performance (already live)
2. Provision Browserless.io then enable video pipeline (~$20/mo)
3. Provision Lob then enable postcard at Day 7 for 4.5+ star prospects
4. Add LinkedIn discovery to prospect enrichment (Apollo API)
5. Install retargeting pixels
6. Ship "text me back" widget on preview page

### Compliance + cost summary
| Channel | Legal basis | Cost per send | Shipped |
|---|---|---|---|
| Cold email | CAN-SPAM, unsubscribe link | ~$0 | ✓ |
| Inline screenshot in email | Same as above | ~$0 (thum.io free tier) | ✓ |
| Ringless voicemail | Drop law varies by state, generally OK | ~$0.10 | provider pending |
| SMS (inbound only) | TCPA express written consent via checkbox | $0.0075 Twilio | ✓ gate enforced |
| Outbound voice | TCPA B2B permitted | $0.015/min | manual |
| LinkedIn DM | Platform ToS only | $0 | pending |
| Direct mail postcard | No regulation | ~$1.20 | code ✓ / account pending |
| Personalized video | N/A (asset) | ~$0.30/video at Browserless | code ✓ / account pending |
| Retargeting ad | Pixel consent in privacy policy | ~$0.01/impression | pending |

---

## Locked-In Rules — Session 2026-04-23 (post-launch hardening)

This section captures rules derived from bugs caught and patterns established
in the 2026-04-22/23 session. Every rule here prevents a real bug we shipped
or catches a pattern that took hours to discover. **Treat as non-negotiable
for future agents.**

### 1. Short URL Generation — NEVER build from UUID prefix

The `/p/[code]`, `/u/[code]`, and `/b/[code]` routes resolve by
`prospects.short_code`, which is `md5(id).slice(0,8)` — **NOT** the first 8
chars of the UUID. Those are two different values.

```ts
// ❌ WRONG — silently 404s for every prospect
const previewUrl = `${BASE_URL}/p/${prospect.id.slice(0, 8)}`;

// ✅ CORRECT
import { getShortPreviewUrl, getShortUnsubUrl, getShortBookUrl } from "@/lib/short-urls";
const previewUrl = getShortPreviewUrl(prospect);
```

**This bug shipped broken links for a week.** Every outreach email hit a 404
page until 2026-04-23. Any future outreach surface MUST use the helper — no
exceptions. The short URL helpers live in `src/lib/short-urls.ts`; extend
there if a new short route is added (e.g. `/c/[code]`).

### 2. Supabase Pagination — default cap is 1000, and it drops rows silently

PostgREST caps `.select("*")` at 1000 rows by default. There is no error, no
warning — rows past 1000 just vanish. The dashboard's Contacted/Approved
tiles shrank day over day for weeks because `getAllProspects()` was returning
the 1000 most recent and every new scout pushed an old contacted prospect off
the end.

**Rule:** Any `.select("*")` or `.select("X,Y,Z")` against a table that may
cross 1000 rows MUST paginate in 1000-row chunks with `.range(from, from + 999)`
until a short page returns. `getAllProspects()` in `src/lib/store.ts` is the
canonical example. Safety rail: abort after 50k rows (different conversation at
that scale — switch to server-side aggregate counts).

### 3. Image Proxy Allowlist — suffix matching for tenant-per-subdomain CDNs

Squarespace, Wix, and the like use one CDN domain for everyone. AWS
Cloudfront gives each tenant their own subdomain (`d14f1v6bh52agh.cloudfront.net`,
`d3abcdefg.cloudfront.net`, etc). When a prospect uses such a CDN, exact-
hostname allowlisting doesn't match anything.

**Rule:** `src/app/api/image-proxy/route.ts` has BOTH `ALLOWED_DOMAINS` (exact
hostname) and `ALLOWED_HOST_SUFFIXES` (suffix match via `endsWith`). When
adding a new image host, use suffix matching iff the subdomain is dynamic
per tenant.

Currently suffix-allowed: `.cloudfront.net`, `.amazonaws.com`. Add more
as prospects surface new CDNs.

### 4. Scraped Image URLs — copy verbatim, NEVER swap size segments

CDNs like Cloudfront pre-generate a per-variant hash in the URL. The URL
`.../DuCZykL4UDVfSxG8c9AH4OkkwZc=/fit-in/2800xorig/...` is signed for
`2800xorig`. Changing to `/fit-in/1600xorig/` with the same hash returns
**400 Bad Request**.

**Rule:** Scraped image URLs MUST be used verbatim from the source page's
HTML. Never fabricate resize variants. Never swap `800xorig` → `1600xorig`
etc. If you need a different size, scrape the page fresh to find the
variant with that size's real hash.

### 5. Deduplicate photos by underlying asset ID

Same underlying image at two different CDN resize variants counts as a
duplicate for rendering purposes — the template will render both and prospects
see the exact same photo twice. Templates consume `data.photos[0]` hero,
`[1]` hero-card, `[2]` about, `[2..9]` gallery — overlap in the indices
guarantees a duplicate if the array contains two sizes of the same image.

**Rule:** Prospect photos arrays MUST be de-duplicated by the underlying
asset ID (the path segment after `/uploads/` for Squarespace, or equivalent
opaque ID for other CDNs), not by full URL. One entry per underlying image.

### 6. PreviewImageGuard — retry proxied URLs once before falling back

Cloudfront returns transient 502s that resolve immediately on retry
(measured: 502 → 200 → 200 across 3 attempts, ~200ms apart). The old
`onErrorCapture` handler swapped to a stock Unsplash fallback on the first
error — permanently losing real photos to a 300ms CDN hiccup.

**Rule:** `src/components/preview/PreviewImageGuard.tsx` now retries proxied
URLs (those containing `/api/image-proxy`) ONCE with a 400ms delay and a
cache-buster query string before falling back. Bounded to 1 retry per image
so it can't loop. Don't remove this guard without replacing it with a
backoff-retry wrapper inside the image-proxy itself.

### 7. V2 Templates — category-specific color palette is mandatory

Every V2 preview template MUST have a `PALETTE` constant (4–6 harmonious
category-appropriate colors) plus a `pickPaletteColor(i)` helper, and MUST
rotate the palette through service/feature/ministry card icon tiles. The
single-accent-everywhere look reads templated the moment a prospect scrolls
past the fold.

**The pattern** (copied verbatim from V2ChurchPreview.tsx):

```tsx
const PALETTE = ["#hex", "#hex", "#hex", "#hex", "#hex", "#hex"];
const pickPaletteColor = (i: number) => PALETTE[i % PALETTE.length];

// Inside the service/feature map:
{data.services.map((service, i) => {
  const tile = pickPaletteColor(i);
  return (
    <div ...>
      <div style={{ background: `${tile}22`, borderColor: `${tile}55` }}>
        <Icon style={{ color: tile }} />
      </div>
      <span style={{ color: `${tile}99` }}>{String(i + 1).padStart(2, "0")}</span>
      ...
    </div>
  );
})}
```

Brand accent (ACCENT / PRIMARY / GOLD / TEAL / whichever the template uses)
stays on section headers, CTAs, nav, stats — palette ONLY touches card-level
iconography. If a template has a second icon grid, use `pickPaletteColor(i + 2)`
offset so the two grids don't render the same color order.

Palettes should feel like the category. Tattoo = crimson + gold + ink. Florist
= rose + blush + sage. HVAC = sky + orange (hot/cold). Don't use gray/beige
in palettes (see existing "No Boring Colors Rule" above).

### 8. V2 Site Data — flexible optional fields (2026-04-23)

The V2 renderers honor several optional flags/arrays on `generated_sites.site_data`.
Populate these per prospect to tailor the rendered site:

| Field | Type | Effect |
|---|---|---|
| `hideBeforeAfter` | `boolean` | Hides the Before/After section (for prospects without a real transformation pair — the generic placeholder image is not a Hector- or Thrive-owned visual) |
| `suppressClaimUi` | `boolean` | Hides the floating "Claim this site →" CTA, the "Preview — will be customized" disclaimer banner, and the TextMeBack widget. Use for gifted / custom-built previews that shouldn't read as a sales pitch |
| `serviceAreas` | `string[]` | Rendered as city chips in the V2 "Areas We Serve" section. Landscaping template uses this today; pattern extends to any category |
| `resources` | `{label, description?, url, icon?}[]` | V2 church "Take the Next Step" grid. Links out to real pages on the prospect's own site (Watch Online / Connection Card / Give / Volunteer, etc.). icon: `watch` / `connect` / `give` / `volunteer` / `calendar` / `book` |
| `teamMembers` | `{name, role, bio?, quote?, photoUrl?}[]` | V2 church "Meet Our Team" grid. Initials avatar falls back when no photoUrl |
| `heroTagline` | `string` | Short hero h1 override. The longer scraped tagline stays in `data.tagline` for SEO / about usage, but the hero displays this short version (5–10 words). Used to satisfy CLAUDE.md's "hero copy short" rule without overwriting the preserved scraped tagline |
| `service.signupPath` | `string` (per-service) | When set on a service, the V2 card renders as an `<a>` link (click-through affordance + hover lift + tile-color "Learn more →" indicator) instead of a plain div. Route to `/inquire/[code]?program=slug&label=X` to open the inquiry form that emails the prospect's office |

### 9. /inquire/[code] form — contract

`/inquire/[code]?program=slug&label=Human+Readable` renders a public form that
collects name/email/phone/message and POSTs to `/api/inquire/[code]`. The
handler emails the prospect's contact email with `Reply-To` set to the
visitor's email (so the business replies directly to the inquirer), CCs
`bluejaycontactme@gmail.com` so Ben sees inquiry volume, and rate-limits
to 3 inquiries per prospect per minute.

**Rule:** any "Learn more" / "Sign up for program" / "Contact about event"
affordance on a V2 template should wire to `/inquire/[code]` via
`service.signupPath` or an equivalent href in a resource card. Don't build
per-category inquiry forms — this one handles all categories uniformly.

### 10. Pipeline batch loop — MUST thread Google Places pageTokens

`scout()` deduplicates against every active-pipeline prospect. Without
pagination across batches, batch N+1 re-queries Google Places for the same
`(location, category)` tuple and receives the same top-20 results, all of
which are now in-pipeline → dedup returns 0 → client's dry-batch circuit
breaker stops after 2 empty rounds. Symptom: "Run Pipeline always stops at
CHUNK_SIZE sites."

**Rule:** `/api/pipeline/batch` accepts and returns `pageTokens: Record<category, token>`.
`PipelineDashboard.tsx` carries the map across loop iterations and sends it
with every batch. Don't remove this without replacing with a different
de-duplication strategy (e.g. rotating cities per batch).

### 11. Client-side batch loop — resilience, not break-on-first-error

`PipelineDashboard.handleRunPipeline` MUST:
- Use `AbortController` with a <5min timeout per batch fetch (Vercel's function
  cap). Hangs without a timeout wedge the entire loop forever.
- Count consecutive failures and stop only after 3 in a row (circuit breaker).
  One flaky batch mid-run shouldn't kill the next 10.
- Parse non-JSON responses defensively (try/catch `res.json()`). A server-side
  HTML error page can crash a `.json()` call and exit the loop.
- Show the last error state in `loopState.lastMessage` on every failure so the
  user sees "Batch N timed out, continuing…" instead of a silent stall.

### 12. Image-mapper save preserves pool extras beyond mapped slots

`/api/image-mapper/save/[id]` builds the saved `scraped_data.photos`
array as:
1. **Slot-driven photos first** (in template-slot order — photos[0]
   is hero, [1] is hero-card, [2] is about, etc.), applying any
   replacements the operator made in the mapper.
2. **Pool extras appended after** — any URL already in
   `scraped_data.photos` that wasn't one of the mapper's scanned slots
   is preserved at the tail of the array.

This preserves scripted enrichment (Google Places photo scrapes, fix
scripts, bulk refreshes) even when the mapper was loaded before that
enrichment ran. The image-mapper UI still sees the extras in its
drag-source library.

**A prior implementation used a 409-shrink-guard** (reject if save
would reduce `photos.length` by >5 or >25%) — that guard surfaced as
"Conflict — mapping was modified by another session. Refreshing..."
for every operator who added photos outside the mapper. Removed
because preserving pool extras at save time is a strictly better
fix: no false positives, no information loss, no operator confusion.

The optimistic-concurrency check on `mapping.lastUpdated` is still
there — that one's a real concern and stays.

### 13. Recovery/bulk-send scripts — dynamic-import to avoid mock-mode trap

`src/lib/email-sender.ts` captures `SENDGRID_API_KEY` at module-evaluation
time. ES static imports hoist to the top of a file, BEFORE any `.env.local`
loader the script runs. In tsx scripts, a static import of `sendEmail`
captures `SENDGRID_API_KEY` as `undefined` → silent fall through to
mock mode → "Sent 48 emails!" with zero actual delivery.

**Rule:** scripts that invoke `sendEmail` (or any module that captures env at
module-level) MUST use `await import("...")` inside `main()`, AFTER the dotenv
loader has populated `process.env`. And bulk-send scripts MUST explicitly check
`process.env.SENDGRID_API_KEY` and exit 1 if missing — silent mock mode is
worse than a crash.

### 14. Scraper garbage email filter — always run before bulk sends

The scraper sometimes pulls mailto-like strings from page HTML that aren't
real addresses: image filenames (`flags@2x.webp`), placeholder domains
(`user@domain.com`, `example@mysite.com`, `contact@sansoxygen.com`), generic
demos. Hard-bouncing those during warming drags reputation for days.

**Rule:** Any bulk-send script MUST filter recipients through an
`isRealEmail()` check before hitting SendGrid:

```ts
function isRealEmail(email: string): boolean {
  const e = (email || "").toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return false;
  if (/\.(webp|png|jpg|jpeg|svg|gif)$/.test(e)) return false; // image filenames
  const host = e.split("@")[1];
  if (["domain.com", "example.com", "mysite.com", "mail.com", "yoursite.com", "yourdomain.com"].includes(host)) return false;
  const local = e.split("@")[0];
  if (/^(user|email|example|info|contact|admin|test|demo|sample)$/.test(local)
      && /^(domain|example|mysite|sample)\./.test(host)) return false;
  return true;
}
```

Reference implementation in `scripts/recover-broken-link-sends.ts`.

### 15. SendGrid activity shows metadata only — bodies live in the `emails` table

The SendGrid Activity Feed shows subject/from/to/event timeline but NOT the
actual body text. If a prospect replies "what was in that email?" or Ben
wants to audit what went out, query the `emails` Supabase table which logs
every `sendEmail()` call with the full body.

Helper script: `scripts/show-last-sends.ts` (dumps the last N with full
body text). Table columns: `id, prospect_id, to_address, from_address,
subject, body, sequence, method, sent_at` — note `to_address`/`from_address`,
not `to`/`from`.

### 16. Hardcoded baseUrl for outreach email footers

`email-templates.ts` and `retargeting-emails.ts` MUST use hardcoded
`https://bluejayportfolio.com` for the unsubscribe + book URLs. Reading
`process.env.NEXT_PUBLIC_BASE_URL` is a trap — that variable on Vercel has
historically been set to a stale preview domain (`bluejays-three.vercel.app`),
which pointed the opt-out link in every sent email at a throwaway URL. Same
rule as `stripe.ts` `baseUrl` and `email-sender.ts` `FROM_EMAIL`.

### 17. Status-transition log is the only answer to "why did this number drop?"

The `prospect_status_changes` table (migration 20260421) logs every
`updateProspect({ status })` call with from/to/timestamp/source. When any
dashboard tile changes unexpectedly, query this table before speculating —
the answer is in the log. Dashboard component: `StatusTransitionsToday.tsx`
surfaces today's moves. For older investigations, query the table directly.

---

## Locked-In Rules — Session 2026-04-23 evening (V2 showcase image audit)

Derived from a full visual audit of all 45 V2 portfolio showcases. 161
off-brand photos were replaced across the codebase in this session.
Every rule below prevents a specific failure caught on a real page.

### 18. Unsplash photo IDs don't describe their content — NEVER use a URL without visually inspecting it first

The canonical failure mode: an agent builds a template, searches
"construction contractor photo ID" in memory, emits a plausible-looking
`photo-XXXXXXX-XXXXXXX` URL, and the rendered page ends up with a
**PLAYMOBIL PIRATE**, **bread + wheat on a wooden table**, **Saint
Basil's Cathedral**, **a Black Pug**, **Scrabble tiles spelling
"CONTACT"**, or **DIAMONDS on a black background** — all real examples
caught in this audit.

**The rule:** every new Unsplash URL introduced into a template or
preview MUST be downloaded and visually inspected via the Read tool
before being committed. No exceptions. The ID alone is unreliable
because:
1. Unsplash photos get re-uploaded under new IDs or deleted
2. Agents frequently hallucinate plausible-looking IDs that don't exist
3. Even verified IDs from the `category-fallback-images.ts` library are
   sometimes contextually wrong (see rule 19)

The download-and-inspect pattern:
```
mkdir -p /tmp/audit
curl -sL --max-time 10 "https://images.unsplash.com/photo-XXX?w=600&q=60" \
  -o /tmp/audit/inspect.jpg
cp /tmp/audit/inspect.jpg "C:/Users/BenFr/AppData/Local/Temp/"
# Then use the Read tool to view the Windows-temp copy.
```
(Windows paths are required for the Read tool on this project.)

### 19. `src/lib/category-fallback-images.ts` is NOT a source of truth — it's contaminated

The library was populated from Unsplash API search results for queries
like "construction contractor", "wood fence", "tattoo design". Unsplash's
search returns surprising irrelevance for many categories:

- `construction` pool contained a Playmobil pirate figurine, colored
  pencils in a wood holder, daycare classrooms, paint trays, kids
  reading, and a wooden toy train. Only ~40% of "construction" entries
  are real construction photos.
- `tattoo` pool contained Hawaiian shirts, mountain lakes, Saint Basil's
  Cathedral, a turtleneck man, and various unrelated portraits alongside
  real tattoo work.
- `tutoring` pool had a male headshot of Marcus Chen (an older white
  man) — a photo that could not plausibly be Marcus Chen by any name.
- `landscaping` pool had a Mercedes hood ornament and a wine glass.

**The rule:** if you are pulling a replacement URL from
`category-fallback-images.ts`, you MUST download and visually inspect
the image before using it. The library is an *input to the inspection
process*, not a shortcut past it. Alts in the library are machine-
generated by Unsplash and often describe a tiny subject in the frame
rather than the main content (e.g. an image alt-captioned "a man
showing something with his finger" is actually a 10-story construction
site).

A follow-up cleanup pass on the fallback library itself is warranted —
audit each category's entries, tag the actually-usable ones, and
separate them from the contamination.

### 20. Staff photo name/gender/ethnicity must match the template's character name

Distinct failure mode: the template says "Dr. Priya Kaur" and the
photo is a masked male surgeon. "Marcus Chen (Asian male tutor)" and
the photo is an older white man. "Priya Patel (South Asian woman)" and
the photo is a blonde white woman. "James Okafor (Black male
attorney)" and the photo is a young white man.

**The rule:** every template that introduces a named character (team
member, attorney, stylist, tutor, chef, provider) MUST have the
portrait visually match the name's apparent gender and, where the
name is culturally specific, apparent ethnicity. If the stock pool
doesn't have a matching portrait, there are two valid fixes:
1. **Swap the photo** to one that matches the character name
2. **Rewrite the character** to match the photo (Agent 7's
   "Chef Adriana Reyes" → "Chef Adrian Reyes" with pronoun
   updates — preserving the existing photo by adjusting the copy
   around it)

Either is fine. What's NOT fine is shipping a mismatch — the cognitive
dissonance between named character and photo destroys every trust
signal the template was built to create.

Also required: every portrait/headshot `<img>` must have `object-top`
or `object-[center_20%]` class applied so `object-cover`'s default
center crop doesn't cut off the face. Check this on every template
with a named team member.

### 21. Parallel sub-agent audits need a cross-category dedup pass afterward

When 8 parallel agents each audit 5 categories and each pulls
replacements from the same `category-fallback-images.ts` library, they
WILL collide on the same photo IDs across categories. This session's
Wave 1 agents introduced 10 cross-category duplicates (e.g., the same
South Asian woman headshot appeared as Elena Vasquez on interior-design,
Priya Patel on tutoring, and a team member on law-firm).

**The rule:** any parallel image-replacement work MUST be followed by a
cross-category dedup check:
```
grep -rhoE "photo-[a-z0-9-]+" src/app/v2/*/page.tsx | sort | uniq -c \
  | awk '$1 > 1'
```
Every duplicate found must either be replaced in all-but-one category,
or (if genuinely category-agnostic like a generic office interior) be
explicitly whitelisted with a comment. Zero tolerance for unknown
cross-category duplicates.

### 22. Image API crashes on Read — have a no-Read fallback path

The Claude image-processing API returned `400 Could not process image`
twice in this session when an agent Read a downloaded image. Both
crashes happened deep inside long sub-agent runs and wasted the full
context window with no edits made.

**The rule:** any agent prompt that does visual image inspection MUST
include a fallback strategy:
1. Bound every download with `curl -sL --max-time 10`
2. Never retry a failed Read — skip the image and judge from caption
3. Have an alternate no-Read judgment path (URL-pattern + fallback
   library cross-reference) so the agent can still make progress when
   Read crashes

When building a batched parallel audit, prepare two versions of the
agent prompt: one "happy path" with Read, and one "no-Read" fallback
that judges by caption + URL + library-source only. If the first
version crashes, re-launch with the second.

### 23. When an image is contextually wrong, swap the image OR swap the caption — not both

A valid pattern used by Agent 7 this session: the template said
"Chef Adriana Reyes" next to a photo of a male chef. Rather than hunt
for a perfect Adriana photo in a library that didn't have one, the
agent renamed the character to "Chef Adrian Reyes" and updated every
"her/she" → "his/he" across the file. Five-minute fix, preserved all
existing brand context around the photo.

**The rule:** when caption and photo disagree, pick the cheaper fix:
- If the caption is generic ("Construction crew at job site") → easier
  to find a matching photo
- If the caption names a specific character → easier to rename the
  character than to find a matching photo in a thin library

Don't thrash back and forth. Pick one direction, commit, move on.

### 24. Google Places photos cap at 10 per Details response — script, don't re-scrape

The auto-scraper (`src/lib/data-extractor.ts:235`) caps photos at 5
with `.slice(0, 5)` to save on proxy bandwidth. But Google returns up
to 10 photo_references per business via `/place/details`. For
high-value manual enrichment (prospects Ben is customizing for a
specific sale), use `scripts/scrape-meyer-all-google-photos.ts` as
the template — it:
1. Resolves place_id via textsearch (doesn't require place_id stored)
2. Fetches full Details with photos field
3. Builds clean proxy-compatible URLs (no API key embedded, no
   trailing `\n`) from ALL photo_references
4. Merges with existing non-Google photos (preserves website scrapes)
5. Strips `data:` URIs and malformed entries during merge
6. Persists `googlePlaceId` on the prospect for future re-scrapes

**The rule:** never store raw `maps.googleapis.com/maps/api/place/photo?key=...`
URLs. Always build URLs WITHOUT the key — `/api/image-proxy` appends
it server-side, and the stored URL stays stable across API key
rotations. Also strip trailing `\r\n` characters on merge — the scraper
has historically corrupted entries with them, violating the QC
sanitize rule.

### 25. `data:image/...;base64,` URIs must never appear in `scraped_data.photos`

When the scraper finds an inline base64 image (logo, favicon, social-
share badge) in a business website's HTML, it sometimes dumps the raw
base64 into `photos`. These are:
- Useless as gallery/hero images (they're logos or icons, not photos)
- Visible noise in the image-mapper UI
- A QC-failure per rule 1 of the locked image rules ("malformed URLs,
  data: URIs ... are immediate QC failures")

**The rule:** any script that writes to `scraped_data.photos` MUST
filter with `!u.startsWith("data:") && /^https?:\/\//.test(u)`. The
Meyer photo-scrape script does this. Backfill scripts should strip
existing data: URIs on touch. Include this in the generator-side
photo-merge function so the corruption never enters the DB in the
first place.

---

