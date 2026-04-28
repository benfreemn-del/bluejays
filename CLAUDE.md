@AGENTS.md

# BlueJays Project — The Money Printer

## Output Formatting Rules (NON-NEGOTIABLE)
- **Never wrap URLs in bold (`**`).** Write links as plain text or plain markdown `[text](url)`. Bold markers around a URL break it when copied — the `**` gets included in the copied string. This applies everywhere: chat responses, code comments, commit messages, HTML, anywhere a URL appears.
- **Outreach emails MUST use three separate fenced code blocks** — one for TO, one for SUBJECT, one for BODY. Never combine them. Never put the signature in the body (Ben has an auto-signature). This format lets Ben copy each field independently and forward without editing. Every single email Claude writes, no exceptions.

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
- **All generated sites and templates must use the network-effect footer credit** (Hormozi review #10) — `Built by BlueJays — get your free site audit`, with `BlueJays` rendered as a clickable link to `https://bluejayportfolio.com/audit`. The BluejayLogo bird icon stays before "Built by". Never use BlueJay Business Solutions wording or any other footer variation. Goal: every customer's site footer pulls free audit-funnel traffic — at customer #100 we have 100 backlinks driving to /audit.
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
8. **Footer must say "Built by BlueJays — get your free site audit"** linking to `/audit` (network-effect drive). NOT "Created by bluejayportfolio.com" anymore (changed 2026-04-26 per Hormozi review #10), NOT "BlueJay Business Solutions" or any other variation.
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
- **Every V2 preview template MUST render the BluejayLogo component in the footer** next to "Built by BlueJays — get your free site audit" (link target: `/audit`)
- **Every portfolio showcase page MUST have the inline bird SVG** in the footer credit line
- **The bird icon appears BEFORE the text** "Built by BlueJays — get your free site audit" with `flex items-center gap-1.5` alignment
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
- **Current active categories** — every category in `src/lib/scout.ts::ACTIVE_CATEGORIES` has a V2 preview template AND a V2 showcase page (verified 2026-04-26: 46 templates + 46 showcases on disk). The full list is whatever `ACTIVE_CATEGORIES` exports — that's the source of truth, not this comment.
- **Add new categories only after building their premium template first** — template first, then scout.
- **Categories with FULL V2 pipeline (showcase + dynamic renderer + preview routing)**: 46 categories total — electrician, dental, law-firm, salon, fitness, real-estate, church, plumber, hvac, roofing, auto-repair, chiropractic, veterinary, photography, interior-design, landscaping, cleaning, pest-control, accounting, tattoo, florist, moving, daycare, insurance, martial-arts, pool-spa, general-contractor, catering, pet-services, physical-therapy, tutoring, restaurant, medical, painting, fencing, tree-service, pressure-washing, garage-door, locksmith, towing, construction (plus 5 more — `ls src/components/templates/V2*Preview.tsx | wc -l` is the canonical count).

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

## Active Template Categories (46 total — verified 2026-04-26 via `ls src/components/templates/V2*Preview.tsx`)
The canonical list lives in `src/lib/scout.ts::ACTIVE_CATEGORIES` — that's source of truth. The hand-maintained list below drifted historically (was "41 total"); on disk we have 46 V2 preview templates + 46 V2 showcase pages. When in doubt, `ls src/components/templates/V2*Preview.tsx | wc -l`.

Known categories (partial — see `scout.ts` for the complete + currently-active set):
real-estate, dental, law-firm, landscaping, salon, electrician, plumber, hvac, roofing, auto-repair, chiropractic, fitness, veterinary, photography, cleaning, pest-control, accounting, moving, florist, daycare, insurance, interior-design, tattoo, martial-arts, physical-therapy, tutoring, pool-spa, general-contractor, catering, pet-services, church, restaurant, medical, painting, fencing, tree-service, pressure-washing, garage-door, locksmith, towing, construction (plus 5 additional categories — check `ls` for the current set).

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
interlocks SMS, email, and ringless voicemail across 60 days. Verified
against code 2026-04-26.

| Day | Channels | Label |
|-----|----------|-------|
| 0 | email + SMS | Initial Pitch |
| 2 | voicemail | Voicemail Drop |
| 5 | email + SMS | Gentle Follow-Up |
| 12 | email + SMS | Value Reframe |
| 18 | voicemail | Follow-Up VM |
| 21 | email + SMS | Social Proof |
| 30 | email | Final Check-In |
| 45 | email | graceful_goodbye |
| 60 | email | final_seasonal_hook |

Notes:
- **Voicemails on Day 2 + Day 18 only** — two ringless drops per funnel.
  Pre-launch they're effectively paused because (a) A2P 10DLC is still
  pending approval and (b) the voicemail provider integration has been
  intermittently failing. When voicemails can't deliver, the funnel
  tries SMS as a fallback — which is also blocked by `SMS_FUNNEL_DISABLED`
  today. So Day 2 + Day 18 simply skip during warmup and the prospect
  advances to the next email step.
- **SMS-eligible days are Day 0, 5, 12, 21** — but SMS only actually
  fires for `source === "inbound"` prospects (Rule 35 + the A2P 10DLC
  gate). For cold-scouted prospects, SMS is gated off and only email
  goes out on those days.
- **Email fires on 7 days** — Day 0, 5, 12, 21, 30, 45, 60. Day 30 is
  the final-check-in, Day 45/60 are reactivation hooks for prospects
  who never replied.
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
- **`STRIPE_CUSTOMER_PORTAL_URL` (REQUIRED before going live with year-2 dunning):** the configured Stripe Customer Portal link the dunning + renewal-reminder emails point at so customers can self-service their card on file. Configure once at https://dashboard.stripe.com/settings/billing/portal then set the env var to that URL on Vercel. Until set, every payment-failed / renewal-reminder email falls back to `mailto:bluejaycontactme@gmail.com?subject=Update+my+card` so the link is never broken — but the customer self-service path is gone. Document the live URL here once configured. See `getBillingPortalUrl()` in `src/lib/email-templates.ts`.

### Webhook Events Handled (post wave-2 LTV protection — 2026-04-24)
Wired in `src/app/api/webhooks/stripe/route.ts`:
- `checkout.session.completed` — marks paid, creates deferred mgmt sub, sends welcome email (now with retry-queue fallback)
- `customer.subscription.updated` — flips subscriptionStatus to active/past_due/cancelled
- `customer.subscription.deleted` — cancellation + installment graduation to deferred mgmt sub
- `checkout.session.expired` — abandoned checkout recovery email + Ben SMS
- **`invoice.payment_failed`** *(wave 2)* — sends friendly card-failed email, bumps `payment_failure_count`, SMSes Ben. After 3 consecutive failures escalates `subscriptionStatus` → `at_risk` and sends an urgent dunning email. All status transitions logged to `prospect_status_changes` so the daily-drain dashboard surfaces churn risk in real time.
- **`invoice.payment_succeeded`** *(wave 2)* — resets `payment_failure_count` to 0 and flips `subscriptionStatus` back to `active`. Prevents customers from sitting in `at_risk` forever after one bad month.

### Wave-2 LTV Crons (2026-04-24)
- **`/api/billing/check-upcoming-renewals`** — daily at 16:00 UTC. Pages all active subscriptions, finds those with `current_period_end` ~30 days or ~7 days out, sends the friendly pre-renewal nudge via `getRenewal30DayEmail()` / `getRenewal7DayEmail()`. Dedupes via `renewal_reminders` table keyed on (prospect, sub, kind, scheduled_charge_at).
- **`/api/billing/retry-failed-sends`** — daily at 17:00 UTC. Drains `email_retry_queue` (welcome / handoff / renewal_30 / renewal_7 / payment_failed). Up to 3 attempts with exponential backoff (1h → 4h → 24h). After exhaustion, alerts Ben via SMS for manual handling.

Migration: `supabase/migrations/20260424_email_retry_queue.sql` adds `email_retry_queue` + `renewal_reminders` tables and `prospects.payment_failure_count` / `prospects.last_payment_failure_at` columns.

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
- Vercel cron: `/api/funnel/run` daily at 16:00 UTC (8am PT — Rule 30) + `/api/replies/process` every minute
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

- [x] **Stripe LIVE flip — DONE 2026-04-25**: see "Stripe LIVE Launch Procedure" section below for the full checklist run + post-launch monitoring.
- [ ] **Flip Namecheap to live** (still pending): remove `NAMECHEAP_SANDBOX=true` env var so domain registration goes against the production API. Verify with a `.com` availability check.
- [ ] **Flip Lob to live** (still pending): swap `test_pub_*` / `test_*` keys for `live_pub_*` / `live_*`. Verify with a postcard preview render. Unblocks the 21 queued postcards waiting on `/api/test-cohort/postcard-cron`.

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

## Domain Registration System (added 2026-04-24)

Backend foundation for buying domains on behalf of paid prospects. Schema
in `supabase/migrations/20260424_domains.sql`. One row per domain.
Source of truth for registrar order id, expiry, renewal date, hosting
linkage, and per-domain cost. Designed to scale to ~5,000 sites and
feeds the existing $100/yr deferred Stripe sub without modifying it.

**Files:**
- `src/lib/domain-registrar.ts` — provider-agnostic `RegistrarClient`
  interface, `namecheapClient` (REST API, sandbox-aware), `mockClient`
  (deterministic dev fallback), `getRegistrar()` factory.
- `src/lib/domain-store.ts` — Supabase CRUD: `createDomain`,
  `updateDomain`, `getDomain`, `getDomainByName`, `getDomainsByProspect`,
  `getDomainsExpiringWithin`, `listDomains`.
- `src/app/api/domains/check` POST — availability + price.
- `src/app/api/domains/register` POST — pending row + registrar call +
  patch on success/fail. Requires `prospect.status === "paid"`.
- `src/app/api/domains/[id]` GET / PATCH — single-row CRUD.
- `src/app/api/domains/list` GET — `?prospectId=`, `?status=`,
  `?expiringWithinDays=`.

**Env vars (flip mock → live):** `NAMECHEAP_API_USER`,
`NAMECHEAP_API_KEY`, `NAMECHEAP_USERNAME`, `NAMECHEAP_CLIENT_IP`,
`NAMECHEAP_SANDBOX=true` while testing. With these unset, `getRegistrar()`
returns the mock client and no real registrations occur.

**Cost assumption:** $11/yr per `.com` (Namecheap retail). Logged via
`logCost()` service `domain_registrar`. Other TLDs use the registrar's
quoted price when returned.

**Not in this commit:** Vercel project auto-add, renewal cron, dashboard
domain card. Those are separate tasks.

### Vercel Project Integration (added 2026-04-24)

After Namecheap registration succeeds, the register route ALSO:
1. Sets the registrar's nameservers to ns1/ns2.vercel-dns.com so DNS is
   delegated to Vercel.
2. Adds the domain to the Vercel project that hosts customer previews
   so traffic to e.g. `bluejaybob.com` resolves to the rendered site.

**Files:**
- `src/lib/vercel-api.ts` — `addDomainToProject()`, `getDomainStatus()`,
  `removeDomainFromProject()`, `VercelError` typed error class,
  `VERCEL_NAMESERVERS` constant. Mock branch when env vars missing.
- `src/app/api/domains/register/route.ts` — extended to call Vercel +
  setNameservers after registrar success. Vercel failures DO NOT roll
  back the registrar leg — `last_error` records the issue and Ben can
  retry via `/api/domains/[id]/vercel-add`.
- `src/app/api/domains/[id]/vercel-add` POST — retry the add step for a
  row whose `vercel_domain_added_at` is null. 409 if status != registered
  or the row is already added.
- `src/app/api/domains/[id]/vercel-status` GET — Vercel's view (verified,
  production URL, DNS records still needed). Used by the dashboard for
  inline "verified ✓ / needs DNS" badges.

**Env vars (flip mock → live):** `VERCEL_API_TOKEN` (from
https://vercel.com/account/tokens), `VERCEL_PROJECT_ID` (the project that
serves prospect previews — probably the BlueJays main project), and
optionally `VERCEL_TEAM_ID` if Ben is on a team plan. With `VERCEL_API_TOKEN`
unset, all three Vercel functions return deterministic mock results so
the pipeline runs end-to-end in dev without modifying any real project.

**Project structure:** ONE shared Vercel project hosts every customer
domain today. Each registered domain is added as a project domain on
that single project; the project's Next.js routing decides what to
render per host. **Scaling note:** Vercel's per-project domain caps are
50 on Pro and unlimited on Enterprise. At ~5,000 domains we'll need to
shard across multiple Vercel projects (one project per ~50 domains on
Pro, or migrate to Enterprise). The `vercel_project_id` column on the
`domains` table is the seam — populate it with the actual project we
chose for that domain so we can route traffic + bill correctly across a
shard fleet later. Today every row gets the same project id from
`VERCEL_PROJECT_ID`.

**Nameserver flow:** Namecheap is the registrar of record (controls the
domain itself + renewal). Vercel is delegated DNS (controls A/CNAME/TXT
records via its own DNS UI/API). After register, we call
`registrar.setNameservers(domain, ns1.vercel-dns.com, ns2.vercel-dns.com)`
which switches authoritative DNS to Vercel. Vercel then auto-verifies
the domain via the nameserver delegation (no TXT-record dance needed
for the customer). DNS propagation typically completes in 5–60 minutes;
during that window `getDomainStatus()` will return `verified: false`
and the dashboard renders "needs DNS". Once propagated it flips to
`verified: true` and the production URL becomes live.

**Cost:** Vercel domain-add is free (we already pay Vercel for hosting).
Every call still logs via `logCost()` service `vercel_domain` at $0 so
the audit trail captures call volume even if not dollars.

### Renewal Cron (added 2026-04-24)

Daily cron at `/api/billing/check-domain-renewals` runs at **18:00 UTC**
(10am PT) — strictly AFTER the 16:00 UTC pre-renewal-email cron and
17:00 UTC retry-failed-sends cron, so any card updates customers made
after the 30-day / 7-day reminder are already reflected in Stripe by
the time we look up sub status.

**Order of operations (NON-NEGOTIABLE — Stripe FIRST, registrar SECOND):**
1. Find domains where `next_renewal_at <= now()` AND `status='registered'`
2. For each: look up `prospect.mgmtSubscriptionId` → `stripe.subscriptions.retrieve()`
3. Branch on Stripe state:
   - **active** → `registrar.renew(domain, 1)` → log $11 cost → bump
     `expires_at` and `next_renewal_at` by 1 year → send "renewed" email
   - **past_due** → set `status='renewal_paused'` → email customer with
     billing-portal link → SMS Ben (DO NOT pay $11 for an unpaid customer)
   - **cancelled** → set `status='cancelled'` → email 30-day grace
     notice → SMS Ben
   - **registrar API error** → keep `status='registered'`, set
     `last_error`, SMS Ben (manual intervention — no blind retry)

**Throttle:** Hand-rolled 30/min throttle (2-second sleep between domains)
sits comfortably under Namecheap's ~50/min API limit. `PAGE_SIZE=100`
per cron run is plenty since renewals are spread evenly across 365 days
and we'll see at most ~14 due-for-renewal in a single run at 5,000 sites.

**New domain status:** `renewal_paused` — added in
`supabase/migrations/20260424_domain_renewal_paused_status.sql`. Domain
in this state recovers to `registered` via the failure-recovery endpoint
`POST /api/domains/[id]/retry-renewal` once the operator has confirmed
the customer updated their card. The retry endpoint runs the exact same
Stripe-first → registrar-second flow on a single domain.

**Email templates:**
- `getDomainRenewalChargedEmail(prospect, domain, expiresAt)` — sequence
  210, friendly receipt-style note after a successful renewal.
- `getDomainRenewalPausedEmail(prospect, domain, expiresAt)` — sequence
  211, card-failed notice with Stripe portal link and N-day grace
  countdown until expiry.

Both follow CLAUDE.md outreach rules (≤80 words, exactly 1 link, zero
pricing-language in body).

**Mock mode:** if `STRIPE_SECRET_KEY` OR `NAMECHEAP_API_KEY` is absent,
the cron uses the deterministic mock branch (always treats subs as
"active" so the registrar-renew code path is exercised end-to-end in dev/CI).
No real charges, no real registrar calls.

**Cost logging:** Every successful renewal logs via
`logCost(prospectId, "domain_renewal", $11)` (rate from
`COST_RATES.domain_renewal`). Failed renewals log nothing (cost only on
success path).

---

## Locked-In Rules — Session 2026-04-24 evening (Wave 1 sales-funnel hardening)

These rules were derived from the deep sales-funnel review (6 parallel
agent reports) and the bug-class fixes that immediately followed. Each
prevents a real bug we shipped or a class of regression we want
permanently dead.

### 26. Action-Button Hrefs Use Live Route Params, Never Derived State

The `/book/${info?.id || ""}` bug shipped to production with every
prospect tapping the "Book a 15-min walkthrough" CTA on the claim
page → `info.id` was never populated → `href="/book/"` → 404. Same
bug class as the short-URL `id.slice(0,8)` regression in rule 1.

**Rule:** When building action hrefs in client components, use the
URL param from `useParams()` directly — do NOT use derived state
(`info`, `prospect`, `data`) unless you've verified that field is
populated by every code path that renders the button. If a button
takes a prospect ID, get it from `useParams()`, not from a fetched
data object.

When in doubt: `const { id: prospectId } = useParams() as { id: string };`
then `href={\`/book/${prospectId}\`}`. Period.

### 27. List-Unsubscribe Header URL Must Match the In-Body Link

Gmail's RFC 8058 one-click unsubscribe verifies that the URL in the
`List-Unsubscribe` header is reachable AND aligned with the visible
in-body opt-out link. We shipped with the header pointing at
`/api/unsubscribe/${prospectId}` while the body footer used
`getShortUnsubUrl(prospect)` which renders `/u/[code]`. Header URL
404'd silently — Gmail's classifier downgraded the sender.

**Rule:** Both URLs MUST be the same canonical route. Today that is
`getShortUnsubUrl(prospect)` (resolves to `/u/[code]`). The route
MUST accept `POST` with empty body and return `200` on success
AND on unknown codes (per RFC 8058 — non-2xx responses cause Gmail
to downgrade the sender).

When adding any new opt-out surface, change all three: header, body
link, AND the route handler. They are a unit, not three separate
files.

### 28. Plain-Text Email Bodies Are UTF-8; Never ASCII-Strip

The `body.replace(/[^\x00-\x7F]/g, "")` line in `email-sender.ts`
silently removed every ★, em-dash, and curly quote from every
plain-text outreach email for months. "Your 4.8★ across 23 reviews
stood out" arrived as "Your 4.8 across 23 reviews stood out" —
killing the validation hook in CLAUDE.md's Psychology Stack.

**Rule:** Email bodies are UTF-8 by default. SendGrid handles UTF-8
plain-text natively via the `text/plain; charset=utf-8` content type
its API sets. Do NOT add ASCII-only filters, "sanitization", or
"safe character" strips to email bodies. If a future encoding bug
appears, fix the encoding header — don't drop characters.

The same rule applies to SMS (Twilio handles GSM-7 + UCS-2 charset
detection automatically) and voicemail TwiML.

### 29. Payment-Plan Buttons Call `redirectToCheckout(plan)` Directly

Already in CLAUDE.md "Claim Page Simplification Rules" but was being
violated: the "3 × $349 (Most Popular)" button mutated `?plan=...`
in the URL and triggered a full page reload, while the secondary
"$997 once" button called `redirectToCheckout("full")` directly.
The recommended path FELT broken vs the secondary one.

**Rule:** Every payment-plan-selector button on `/claim/[id]` MUST
call `redirectToCheckout(plan)` directly. Never use the
`window.location.href = ?plan=...` reload pattern. Never. If you
need to persist plan choice for analytics, use a hidden form input
or pass `?plan=` as a Stripe metadata param — but the user-facing
click goes straight to checkout.

### 30. Outbound Marketing Crons Hit US Business Hours

Vercel cron `0 8 * * *` (08:00 UTC) = 12am Pacific / 3am Eastern.
Every prospect for the entire 14-day warming ramp got cold emails
between midnight and 3am their local time. Gmail's classifier
clusters that pattern as commercial bulk sending and downgrades
inbox placement. The funnel cron is now `0 16 * * *` (16:00 UTC =
8am PT / 11am ET — peak cold-email open window for US East-and-West
combined).

**Rule:** Any outbound commercial cron (cold email, postcard send,
SMS to inbound prospects, voicemail drop) MUST fire between **15:00
and 19:00 UTC** to land in the US morning-window. Internal crons
(QC, dashboards, data sync, scout) are timezone-agnostic and can run
whenever. When adding a new outbound cron, document the local-time
target in the cron name comment.

### 31. Social Proof Must Use Real Data Or Be Removed (Reinforcement)

Already an existing rule, but `SmartSocialProof.tsx` shipped with
hardcoded "X hours ago" timestamps that never updated — a textbook
violation. The strings looked like data ("A roofing business in
Bellevue viewed their preview · 2 hours ago") which is the most
trust-destroying form of fakeness.

**Rule reinforcement:** It is a NON-NEGOTIABLE FAIL to ship any
component that renders fake-looking dynamic data. Specifically:
- Hardcoded relative timestamps ("3 hours ago", "yesterday")
- Hardcoded counts ("47 sites built this week")
- Hardcoded named-business strings ("A {category} in {city}…")

If real data isn't available, REMOVE the component. Don't ship a
placeholder. The empty state is always more trustworthy than a fake
one. If a future dev needs to add a fake-data placeholder for
component preview, it MUST be gated by `process.env.NODE_ENV !==
"production"` AND visually obvious as a placeholder ("[mock]
preview...").

### 32. Domain Registration System (NON-NEGOTIABLE)

The 5,000-site target is real. Domain registration + Vercel hosting +
$100/yr renewal is the spine of the business — every rule below is
designed to prevent failures that compound at scale.

**Architecture:**
- Registrar abstraction lives in `src/lib/domain-registrar.ts` —
  `RegistrarClient` interface with `namecheap`, `mock`, future
  `porkbun` / `cloudflare` impls. Routes NEVER call the registrar
  REST API directly; always go through `getRegistrar()`.
- Vercel hosting integration lives in `src/lib/vercel-api.ts` —
  same mock-when-env-absent pattern.
- All domain rows live in the `domains` table (migration
  `20260424_domains.sql`); FK to `prospects.id` (UUID).
- Cost-logging service names: `domain_registration` (initial buy),
  `domain_renewal` (yearly auto-renew), `vercel_domain` ($0, audit only).

**Eligibility:**
- Domains can ONLY be registered for prospects with `status === "paid"`.
  Pre-paid speculation is forbidden — we don't own a domain we
  haven't been paid for. Enforced in `/api/domains/register/route.ts`.
- Every register call MUST log cost via `logCost(prospectId, ...)`
  so per-customer CAC/LTV math works.

**Mock-mode policy:**
- When `NAMECHEAP_API_KEY` (or required env vars) absent, the lib
  silently uses `mockClient` which returns deterministic responses
  + still logs $0 cost rows (so end-to-end UI testing works).
- Same for Vercel: `isVercelConfigured()` gates the live branch;
  mock returns deterministic verification info.
- It is FORBIDDEN to remove the mock fallback. Local dev, CI, and
  any dashboard demo MUST continue to work without external API keys.

**Failure handling:**
- If the registrar call succeeds but Vercel auto-add fails, do NOT
  roll back the registration. Persist `status='registered'` +
  `last_error` and let the operator retry the Vercel add via
  `POST /api/domains/[id]/vercel-add`. Never make a half-purchased
  domain disappear.
- If the registrar call itself fails, persist `status='failed'` +
  `last_error` and DO NOT charge the customer (cost only logs on
  success path).

**Nameserver flow (DON'T CHANGE):**
- Namecheap = registrar of record (renewal billing, transfer rights).
- Vercel = delegated DNS (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`).
- After register, ALWAYS call `registrar.setNameservers(domain, …)`
  to switch DNS authority to Vercel. Vercel then auto-verifies via
  the delegation — no TXT-record dance for the customer.

**Renewal alignment with Stripe (CRITICAL — at scale this is the
biggest bug surface):**
- Customer paid Day 0. Stripe deferred mgmt sub fires Day 365 ($100).
- Domain registered Day 0 (or Day 1-2 after onboarding). Namecheap
  renewal due Day 365 + buffer.
- The `next_renewal_at` column MUST be set to `expires_at - 30
  days` (the auto-renew window). Renewal cron MUST charge the
  customer's Stripe sub BEFORE auto-renewing the domain at Namecheap.
  If the Stripe charge fails (card expired etc), pause the domain
  renewal and trigger dunning — do NOT pay $11 for a domain whose
  customer hasn't paid us $100 yet.

**5,000-site scaling notes:**
- Vercel Pro caps domains per project at 50. At 5K sites, shard
  across ~100 projects OR migrate to Enterprise (unlimited). The
  `vercel_project_id` column on `domains` is the sharding seam —
  it's already populated per-row so future migration can rebalance.
- Namecheap API has rate limits (~50 req/min). Batch operations
  (renewal cron) MUST throttle; never hammer the API in a tight loop.
- DNS propagation is the slowest step (5–60 min). Renewal cron MUST
  fire 30+ days before expiry to absorb propagation delays.

### 33. Built-But-Unwired Detection (Meta-Rule)

The single most-recurring pattern in the 2026-04-24 sales-funnel
review: feature exists in code, sits inert because UI/cron/wiring
was never added. Examples we found: `getSubjectVariant()` (returns
A/B but never called), `engagement-tracker.ts` (data populated, AI
prompt never reads it), Apollo integration (`src/lib/apollo.ts`
fully built, never called from auto-scout), `ReviewRequestPanel`
(component built, mounted nowhere), `Compare page` (`/compare/[id]`
404s in incognito because it calls a protected API), open-tracking
pixel (env config exists, no `<img>` ever emitted), `ENABLE_HTML_PITCH_EMAIL`
(coded with no auto-flip-trigger).

**Rule:** When you build any feature, you MUST in the same commit:
1. Wire it into a customer-facing surface OR a cron OR an operator
   dashboard
2. Document the env vars / dashboards / triggers required
3. Verify the happy path renders / fires once

A PR that adds a function with no caller is a bug, not a feature.
If you can't wire it in the same commit (legitimate reason — depends
on a separate system not yet built), open a TODO entry in the BLOCK
3 section of CLAUDE.md so it doesn't drift.

### 35. AI Responder Kill-Switch (`AI_AUTO_REPLY_ENABLED`)

A single env var gates whether the AI responder auto-sends replies to
prospects.

- **Default:** unset OR `true` → current behavior. Replies get drafted,
  classified, and queued via `queueDelayedReply()` then auto-sent on the
  next 1-minute cron tick (with high-intent speed-bypass).
- **`AI_AUTO_REPLY_ENABLED=false`** → replies still get classified and
  drafted, but `queuePendingReview()` parks them in the
  `queued_replies` table with `status='pending_review'`. The
  `processQueuedReplies` cron explicitly ignores that status, so the
  draft sits until Ben approves it via the dashboard. An owner SMS
  fires immediately ("Inbound from {biz} — AI drafted reply, needs
  review: {dashboardUrl}") so Ben isn't surprised.

**Recommendation:** set `AI_AUTO_REPLY_ENABLED=false` for the first
30 days post-launch when reply volume is low — it costs ~5 minutes
of manual approval per inbound but eliminates the "one bad AI reply
burns a $997 sale" risk while we tune the prompt.

When the kill-switch is enabled the speed-bypass logic still computes
intent normally — high-intent items just sit at the top of the
review queue (sorted by created_at desc on the dashboard tile).

### 36. AI Responder Speed-Bypass (5-min cliff)

In `src/lib/delayed-replies.ts`:

- High-intent replies (`interested`, `custom_request`) bypass the
  random delay entirely — `scheduledFor = now()` so the 1-minute cron
  picks them up immediately. Replies under 5 minutes are 9× more likely
  to convert (Lead Response Management Study, MIT/InsideSales).
- All other intents get a randomized **30-90 SECOND** delay (was 1-10
  minutes pre-Wave-2). Even objection / question replies should land
  inside the 5-minute conversion window.

When new high-intent intents are added to `IntentType` (e.g. an
explicit `ready_to_buy` / `schedule_call` once the responder
classifies them), add them to the `HIGH_INTENT_BYPASS` Set in the
same file.

### 37. AI Responder Conversation History

`buildPrompt()` in `src/lib/ai-responder.ts` now injects a
`CONVERSATION HISTORY:` block above the current incoming message
listing the last 6 outbound messages (mixed email + sms + prior
queued AI replies for this prospect). Format:

```
[2026-04-22] outbound email: [Made something for Acme] Hi Sam, ...
[2026-04-21] outbound sms: Hey Sam, Ben from BlueJays — ...
```

When no prior history exists the section is omitted entirely (not
left empty). The history fetch is wrapped in a try/catch so a
flaky DB read can never break the responder — worst case the AI
sees no history and responds as it did before Wave 2.

### 34. CTA Copy Includes the Offer (Reinforcement)

Existing claim-page CTAs say "Claim this site →" with no price, no
guarantee. Prospects mid-scroll don't know what tapping commits them
to → reduces tap-through rate.

**Rule:** Every primary conversion CTA on customer-facing surfaces
MUST include either the price OR the guarantee in its label.
Examples (use these patterns):
- "Claim — $997 · 100% money-back"
- "Claim — from $349/3mo"
- "Get started — 30-day guarantee"
- "Book free walkthrough — no card required"

Naked "Claim →" or "Get Started →" buttons are banned from the
preview/claim/book surfaces. Internal admin tools can use them.

---

### 38. Needs Review Workflow (`PendingRepliesPanel`)

When `AI_AUTO_REPLY_ENABLED=false` (Rule 35 kill-switch), every AI-drafted
reply parks in `queued_replies` with `status='pending_review'` and waits
for Ben to clear it via the dashboard's `Needs Review` tile (top of
`/dashboard`, `#pending-review` anchor). Without this loop the queue
silently grows and prospects never get answered.

**Operator obligations (NON-NEGOTIABLE):**

- **Clear the Needs Review queue at least once per day** while the
  kill-switch is on. A draft sitting overnight blows past the 5-minute
  conversion cliff (Rule 36) and effectively wastes the inbound. Treat
  it like email — empty inbox daily.
- **High-intent intents (`interested`, `custom_request`) approve FIRST.**
  The list is sorted newest-first by created_at, but high-intent badges
  (green for `interested`, amber for `objection`, blue for `question`)
  exist precisely so they're scannable in the queue. Don't approve a
  90-minute-old `unclear` before clearing today's `interested`.
- **Every approve goes through the 30-second buffer by default.** The
  "Approve & Send" button schedules `send_after = now() + 30s` to keep
  the cadence feeling human (no instant-reply tell). Use "Send now"
  only when the prospect is actively waiting on a reply (e.g. a phone
  call follow-up they expect within seconds).

**Editing rules (preserve the psychology stack — Rule from outreach
templates):**

- The AI draft already encodes the Ben-approved hooks: validation,
  reciprocity, humility ("no idea if it's what you had in mind, but…"),
  soft reply-prompt. Edits should TIGHTEN those hooks — never strip
  them. If you find yourself deleting the entire draft and writing
  fresh, reject + reply manually instead. The audit trail (rejected vs
  edited-and-approved) feeds back into prompt-tuning.
- **Keep edits short.** A 2-sentence draft that's 90% correct beats a
  6-sentence "improvement" — short replies convert.
- **Don't add pricing into the body.** Same rule as outreach emails
  (CLAUDE.md "Outreach Email Template Rules"): pricing lives on the
  claim page, not in the reply.
- **Don't add a Calendly / booking link** unless the prospect explicitly
  asked to schedule. The whole point of the soft reply prompt is to
  keep the conversation open.

**Reject vs Edit decision matrix:**

| Situation                                     | Action |
|---|---|
| AI got the intent right, copy is 90% there    | Edit + Approve |
| AI got the intent right, copy is wrong tone   | Edit (preserve psychology hooks) + Approve |
| AI misclassified the intent (e.g. flagged objection but it's interest) | Reject + reply manually from prospect detail |
| Prospect already replied to a different channel about same thing | Reject (reason: "already handled in [channel]") |
| Prospect is angry / unsubscribing             | Reject + handle manually |

**Rejection reasons matter.** Always supply one — even a 3-word note
("wrong intent", "tone off", "already replied"). They become the
training signal for AI responder prompt updates.

**API contract (for future tooling):**

- `GET /api/replies/pending-review` → `{ replies: PendingReply[], total: N }`
- `POST /api/replies/[id]/approve` body `{ editedBody?, sendImmediately? }`
- `POST /api/replies/[id]/reject` body `{ reason? }`

The cron (`/api/replies/process`) picks up `status IN ('pending', 'queued')`
and ignores `'pending_review' | 'rejected' | 'sent' | 'failed'`. Approving
flips the row to `'queued'`; the cron sweeps it up on the next minute.

**When to flip the kill-switch back to true:** after 30 days of clean
manual review (no rejections in 7 days) AND after the AI responder
prompt has been re-tuned with rejection-reason signal. Until then
treat the panel as the daily must-clear inbox.

## Upsell SKUs (NON-NEGOTIABLE — added 2026-04-24)

Wave-2 LTV protection. Four productized add-ons that turn each $997
customer into a $1,000–$1,400/yr customer with no new sales motion. At
15% take-rate × 100 customers ≈ $6K/yr added revenue per SKU. Deep
retention review #4 + #13 identified this as the difference between a
$100K lifestyle business and a $300K machine.

### The 4 SKUs

| SKU (internal)     | Display                       | Price            | What it includes |
|---|---|---|---|
| `review_blast`     | Review Request Blast          | $99 one-time     | Send 50 review-request SMS to past customers in 24 hrs (avg 10–15 new 5-star reviews). |
| `extra_pages`      | Add 5 Extra Pages             | $400 one-time    | 5 additional pages (services, FAQ, gallery, blog, case studies — customer's choice). Live in 48 hrs. |
| `gbp_setup`        | Google Business Profile Setup | $150 one-time    | Claim, optimize, post-schedule the prospect's GBP. Includes 5 weekly posts pre-scheduled. |
| `monthly_updates`  | Monthly Content Updates       | $50/mo subscription | Once-a-month site refresh — photos, copy tweaks, seasonal banners, special offers. Cancel anytime. |

Single source of truth: `src/lib/upsells.ts` (`UPSELL_CATALOG`). Every
SKU's price + display name + Stripe mode + welcome email is wired
through this map. Adding/changing a SKU means editing this one file +
the matching welcome email helper in `email-templates.ts`.

### Stripe Products + Price IDs

Ben must (one-time, in production):
1. Create 4 Stripe Products at https://dashboard.stripe.com/products with
   prices matching the table above. Three are one-time `payment` mode,
   `monthly_updates` is a `recurring/month` subscription mode.
2. Set the Price IDs as Vercel env vars:
   ```
   STRIPE_PRICE_REVIEW_BLAST=price_xxx
   STRIPE_PRICE_EXTRA_PAGES=price_xxx
   STRIPE_PRICE_GBP_SETUP=price_xxx
   STRIPE_PRICE_MONTHLY_UPDATES=price_xxx
   ```
3. **Until env vars are set, the upsell flow uses inline `price_data`** —
   Stripe accepts ad-hoc prices and the system works in mock-mode
   immediately on first deploy. Same fallback pattern as
   `STRIPE_PRICE_CUSTOM_ID`. The env vars are a polish step (cleaner
   Stripe reporting, single Product per SKU), not a blocker.

### Endpoints

- **`POST /api/checkout/upsell`** — public. Body
  `{ prospectId, sku, successUrl?, cancelUrl? }`. Verifies the prospect
  exists AND `prospect.status === "paid"`, resolves SKU → Stripe Price
  ID (env var first, inline fallback), creates a Checkout Session, and
  returns `{ url }`. Mock-mode safe (returns mock URL when
  `STRIPE_SECRET_KEY` missing).
- **`GET /api/upsells/[prospectId]`** — operator-only. Lists every
  upsell row for the prospect, sorted newest-first. Used by the
  ProspectDetail dashboard panel.
- **`POST /api/upsells/[upsellId]/fulfill`** — operator-only.
  Sets `status='fulfilled'` + `fulfilled_at=now()`. Idempotent.
- **`POST /api/webhooks/stripe`** *(extended)* — `checkout.session.completed`
  events with `metadata.upsell === "true"` short-circuit out of the
  $997/mgmt-sub flow and route into `handleUpsellSession()`: insert into
  `upsells` table (idempotent via UNIQUE(stripe_session_id)), send the
  SKU-specific welcome email (with retry-queue fallback), SMS Ben.

### Database

Migration `supabase/migrations/20260424_upsells.sql` adds the `upsells`
table with `prospect_id`, `sku`, `amount_cents`, `currency`,
`stripe_session_id` (UNIQUE), `stripe_subscription_id`, `status`
('paid' | 'fulfilled' | 'cancelled' | 'refunded'), `fulfilled_at`,
`metadata` (JSONB), `created_at`, `updated_at`. Indexed by prospect,
status, and sku.

### Customer-facing surfaces

- **`/upsells/[id]`** — public page. 4 SKU cards each with display name,
  price, 1-paragraph description, "Buy Now" button. POSTs to
  `/api/checkout/upsell` and redirects to Stripe Checkout. Shows the
  prospect's current site URL in the header. Light theme, matches
  `/claim/[id]`. Auth via UUID-as-secret.
- **Welcome email** (`getWelcomeEmail`) — adds a small "Need more? See
  add-ons → /upsells/[id]" footer.
- **Handoff email** (`getHandoffEmail`) — same footer.
- **Monthly report** (`getMonthlyReportEmail`) — adds 1-line contextual
  upsell suggestion based on metrics: 0 reviews this month → suggests
  Review Blast; 0 leads → suggests GBP Setup; otherwise → neutral
  "browse add-ons" line.
- **SKU-specific welcome emails** (`getReviewBlastWelcomeEmail`,
  `getExtraPagesWelcomeEmail`, `getGbpSetupWelcomeEmail`,
  `getMonthlyUpdatesWelcomeEmail`) — fire from the Stripe webhook on
  successful upsell purchase. Each is ≤80 words, single link, follows
  CLAUDE.md outreach email rules.

### Operator dashboard

`ProspectDetail` renders `<UpsellsSection prospectId={...} />` (only for
`status === "paid"` prospects). Lists purchased SKUs with status badge,
amount, purchased date, fulfilled date, and a "Mark fulfilled" button
per row. Sortable by purchased date.

### Fulfillment workflow

1. Customer buys an upsell at `/upsells/[id]`.
2. Webhook logs the row + sends the SKU-specific welcome email
   (which spells out exactly what Ben needs from the customer to
   deliver the SKU).
3. Customer replies with the required artifact (CSV for review_blast,
   page list for extra_pages, GBP admin for gbp_setup, monthly request
   for monthly_updates).
4. Ben does the work.
5. Ben opens the prospect in the dashboard, hits "Mark fulfilled" on
   the upsell row.

### Rule 40 — Upsell-Inclusive Lifecycle Emails (NON-NEGOTIABLE)

Every paid customer should see upsell paths in their lifecycle emails.
Don't gate add-ons behind direct sales calls — they should be
1-click-buyable. Specifically:

- The welcome email and handoff email MUST link to `/upsells/[id]`.
- The monthly report email MUST surface a contextual upsell suggestion
  based on real metrics (0 reviews → review blast, 0 leads → GBP setup,
  otherwise → neutral browse line).
- New lifecycle emails added for paid customers (e.g. quarterly
  check-ins, annual review) MUST follow the same pattern.
- Never describe an upsell SKU using language that implies it's only
  available via a sales call. Every SKU in `UPSELL_CATALOG` is
  always-on and self-serve.

### Rule 41 — 3-Step Onboarding Contract (NON-NEGOTIABLE — added 2026-04-24)

The post-purchase onboarding form at `/onboarding/[id]` MUST be 3 steps,
not a wall. The deep retention review identified the old single-page
22-field form as the biggest gate between "paid" and "delivered" —
sub-30% completion rate. The new contract:

**Step 1 — Essentials (~3 min, 5 fields):**
- Business name, phone, email, logo upload, brand colors (primary +
  accent).
- After "Save & Continue", `_onboardingStatus = "step1_complete"` lands
  in `onboarding.form_data` and Ben SHOULD ALREADY be able to start
  building. Step 1 is unblocking; everything else is improvement.
- **The cron's Day-2 reminder fires when status is null OR
  `step1_complete`** because step 1 alone is enough to start. Don't
  upgrade Step 1's threshold — the whole point is the unblocking floor.

**Step 2 — Content (~5-7 min, 8 fields):**
- Services list (multi-line, prefilled from `scrapedData.services`),
  about paragraph, tagline, hours, real photos (multi-file upload, up
  to 10), 3 testimonials.
- "Skip — I'll email you later" link MUST exist. Skipping advances the
  UI to Step 3 without flipping server status to `step2_complete` —
  the prospect is still on `step1_complete` from the server's POV so
  Day-2/5/10 reminders continue if they don't return.

**Step 3 — Preferences (~2 min, 5 fields):**
- Theme, languages, special requests, domain preference, "anything
  else?". Submit flips `_onboardingStatus = "completed"` and redirects
  to `/welcome/[id]`.
- "Skip — I'll email you later" on Step 3 means submit-with-blanks (it
  still flips status to `completed` — better to land them on the
  finish line with sparse preferences than have them bounce).

**UX requirements:**
- Progress bar at top showing "Step N of 3" with green checkmarks on
  completed steps. Users can JUMP backward to any completed step (good
  for editing Step 1 after they uploaded a wrong logo).
- Each "Save & Continue" persists to Supabase BEFORE advancing the UI
  step — so a tab close mid-step doesn't lose the data.
- `localStorage` auto-save on every blur as a backup. Clears on final
  submit so completed prospects don't see stale draft data on revisit.
- All 3 steps are pre-filled from `getPrefillData(prospect)` (in
  `src/lib/onboarding-prefill.ts`) so users edit existing values
  rather than typing from scratch. Reduces field-blank fatigue.

**Reminder cron (`/api/onboarding-reminders/process`) escalates:**
- **30 min** post-purchase: first nudge (`getOnboardingReminderEmail`,
  sequence 101). Existing behavior — preserved.
- **Day 2** if status null OR `step1_complete`: escalating subject
  ("Quick — need 5 min from you to start your site"),
  `getOnboardingReminderDay2`, sequence 102.
- **Day 5** if still incomplete: urgent + manual offer ("Stuck? Reply
  and I'll handle the form for you"), `getOnboardingReminderDay5`,
  sequence 103.
- **Day 10** if still incomplete: SMS Ben directly via
  `sendOwnerAlert()` so he can manually outreach. No email.

The cron uses `prospects.onboarding_reminder_sent_at` as a "last
reminder fired" marker. Stages 2/3 only fire if the previous reminder
was at least 1-2 days ago — this stops the cron from rapid-firing
multiple stages on a record that just barely crossed Day 5 / Day 10.

**File uploads (logo + photos)** go through
`/api/onboarding/upload/[id]` to the Supabase Storage bucket
`client-uploads`. Path layout:
`client-uploads/{prospectId}/{type}/{timestamp}-{filename}` where
`type` is "logo" or "photos". Bucket is public-read, 10MB/file (5MB
enforced for logos at the API layer), allowed MIMEs:
jpeg/png/webp/svg+xml/gif. Auto-created idempotently on first upload
via `ensureClientUploadsBucket()` — same pattern as
`mapper-uploads`. Mock-mode safe: returns 503 if Supabase Storage
isn't configured so the form can fall back to "we'll email you" UX.

**Backwards compatibility:**
- The `onboarding` table's `form_data` JSONB is a superset — old
  single-page submissions with 22 fields stay queryable. The new form
  writes the same column with fewer top-level keys + the new
  `_onboardingStatus` marker. Old keys (`businessNameLegal`,
  `domainRegistrar`, `currentHosting`, etc.) are no longer collected
  but historical data remains intact.
- The legacy POST shape (no `step` field) still works — it's treated
  as a final submit, identical to Step 3.

**Banned patterns:**
- Don't add a wall-of-fields back. If you need a new piece of info,
  fit it into one of the existing 3 steps OR wire it into a separate
  upsell SKU / email-driven follow-up.
- Don't gate the form behind login — paid prospects arrive via the
  Stripe success URL with `?session_id=` and the form must work
  unauthenticated.
- Don't make Step 1 fields optional. Phone + email + business name
  are the minimum viable info to start building; if any is blank, the
  build can't begin.
- Don't merge "Save & Continue" with "Submit" semantics. Steps 1-2
  save partial; Step 3 submits final. Mixing them confuses the
  reminder cron's status detection.

### Rule 42 — Hard-Bounce Suppression Policy (NON-NEGOTIABLE — added 2026-04-24)

Bounces compound. A single hard bounce that re-sends 3 times because
the address never got flipped to a "stop sending" state burns sender
reputation 4× faster than one bounce alone. The fix is a deterministic
3-layer suppression contract enforced inside `processBounce()` in
`src/lib/email-deliverability.ts`.

**The 3 layers (all must fire for every hard bounce — no exceptions):**

1. **Prospect status flip** — `updateProspect(prospectId, { status:
   "bounced", funnelPaused: true }, { source: "hard_bounce:<reason>" })`.
   The new `"bounced"` status (added to `ProspectStatus` in types.ts +
   `StatusBadge.tsx`) is a terminal state — funnel sweeps, retargeting,
   bulk-send scripts, and dashboard "needs attention" tiles MUST
   exclude it the same way they exclude `"unsubscribed"` and
   `"dismissed"`. The status transition gets logged to
   `prospect_status_changes` automatically via the existing
   `logStatusChange()` hook.
2. **Funnel pause** — set `funnelPaused: true` (in the same updateProspect
   call so it's atomic). The funnel cron (`/api/funnel/run`) already
   skips paused enrollments. This stops the next email/SMS/voicemail
   step from firing.
3. **SendGrid suppression group** — POST the address to the
   "Hard Bounces" suppression group via the SendGrid v3 API. The group
   is created lazily on first hard-bounce of a process lifetime
   (idempotent — POST returns the existing group if one already
   exists with that name) and the group ID is cached in-memory.
   Wrapped in try/catch — suppression-group failures NEVER block the
   bounce flow. SendGrid silently drops any future send to a
   suppressed address at the API layer, which protects us against bug-
   induced re-sends (manual outreach, funnel re-enroll, batch-send
   scripts that forgot the bounce filter).

**Soft-bounce escalation (3-in-7-days rule):**

Soft bounces (4xx SMTP responses) are normally retryable — a temporary
block, full mailbox, transient DNS hiccup. But persistent soft bounces
indicate a genuinely undeliverable address. The escalation rule:

- Each soft bounce increments `prospects.soft_bounce_count` (int) and
  sets `prospects.last_soft_bounce_at` to now.
- If a soft bounce arrives MORE than 7 days after the previous one,
  reset the counter to 1 (only consecutive-in-window bounces escalate).
- Once the rolling 7-day count hits **3**, treat as a hard bounce and
  fire all 3 layers above. Source string in the status log:
  `"escalated_from_3_soft_bounces_in_7d"`.

The window + threshold are tunable via `SOFT_BOUNCE_WINDOW_DAYS` and
`SOFT_BOUNCE_ESCALATION_THRESHOLD` constants in
`email-deliverability.ts`. Don't change them without a deliverability
review — they were chosen to match SendGrid's own internal rule of
thumb for "convert soft to hard" treatment.

**Migration:** `supabase/migrations/20260424_bounce_tracking.sql` adds
the two tracking columns. The `status` column itself is free-form TEXT
so no DDL is needed to accept `"bounced"` as a value.

**Mock-mode policy:**
- If `SENDGRID_API_KEY` is unset, `addToSendGridSuppressionGroup()`
  logs a `[Deliverability] (mock) would suppress…` line and returns.
  Local dev / CI never hits the live API.
- The status-flip + funnel-pause legs run regardless of SendGrid being
  configured — those are local DB ops.

**RULES — NEVER do any of these:**
- Don't reset `soft_bounce_count` or `last_soft_bounce_at` outside
  the rolling-window logic. The escalation depends on them.
- Don't manually flip a `"bounced"` prospect back to an active status
  without first re-validating their email (Apollo / waterfall enrich).
  A hard bounce is permanent — only a verified replacement address
  unbounces them.
- Don't add new SendGrid suppression groups beyond "Hard Bounces"
  through this code path. The single-group pattern keeps the API
  call surface small and the audit trail single-source-of-truth.
- Don't bypass `processBounce()` from any new bounce-handling
  surface (e.g. a future Postmark integration). Route every bounce
  through the same function so the 3-layer contract holds.

## Recurring vs Variable Cost Tracking (NON-NEGOTIABLE — added 2026-04-24)

The cost-tracking system has two complementary halves. Both must stay
populated for the spending dashboard's monthly-burn and per-site-margin
math to be honest at scale.

### The two tables
- **`system_costs`** (per-action variable spend) — see `src/lib/cost-logger.ts`.
  Every billable API call (Google Places, Twilio SMS/voice, SendGrid send,
  Manus site gen, Claude/OpenAI/Perplexity calls, Lob postcards, domain
  registrations) writes a row via `logCost()`. These costs scale with
  pipeline volume — more leads = more spend.
- **`recurring_costs`** (fixed monthly subscriptions) — see
  `src/lib/recurring-costs.ts` and migration
  `supabase/migrations/20260424_recurring_costs.sql`. One row per active
  subscription (Supabase Pro, Vercel Pro, SendGrid plan, Twilio plan,
  Browserless, Apollo, Lob credit, etc.). These costs burn whether or not
  we generate a single site this month.

The spending dashboard at `/spending` shows both side-by-side:
total monthly burn = recurring + variable. Per-site cost = burn / paid
customers. Margin at the $100/yr renewal sub = $8.33/mo per site - per-site
cost. The 5K-site projection calculator uses
`getProjectedMonthlyBurn(siteCount)` to extrapolate at any target volume.

### Rules (both halves)
- **Every new external service Ben subscribes to MUST be added to
  `recurring_costs` within 24 hours of activation.** Use POST
  `/api/recurring-costs` or the "+ Add" button on `/spending`. A
  forgotten subscription quietly compounds the gap between what we
  think we're spending and what we are.
- **At scale milestones (100, 500, 1000, 5000 paid sites), revisit
  every active recurring cost and check if a higher tier is needed.**
  Concrete examples to audit at each milestone:
  - **Vercel Pro at ~5K domains** — Pro caps at 50 domains/project. By
    the time we have 2,500+ live sites we've sharded across ~50
    projects on Pro or migrated to Enterprise (custom pricing,
    typically $20K+/yr). Quote both before crossing 1,000 sites.
  - **Supabase Pro** — Pro tier covers 8GB DB + 500MB egress/day. At
    1,000+ sites with active engagement tracking, plan to upgrade
    to Team ($599/mo) which includes 50GB DB + IPv4 add-on +
    point-in-time recovery (critical — Pro tier loses PITR).
  - **SendGrid Essentials 50K** — covers up to 50K sends/mo. At 100
    leads/day in warmup × 14 days × 2 domains × follow-ups, we
    breach 50K within the first month of full-volume cold outreach.
    Upgrade to Pro 100K ($89.95/mo) before the cap.
  - **Twilio** — current plan is per-use; at scale revisit dedicated
    short codes / 10DLC volume tier pricing.
  - **Lob postcards** — currently per-mailpiece; review bulk discount
    contracts at 500+ pieces/month.
- **Per-site margin must stay positive at the projected milestone.**
  Use the projection calculator after any recurring-cost change. If
  margin/site/mo < $0 at the next milestone, the answer is one of:
  (a) raise the renewal sub price, (b) drop a non-essential
  recurring cost, or (c) negotiate the next tier of an existing
  one before crossing the milestone — not after.
- **Mark subscriptions ended via DELETE
  `/api/recurring-costs/[service]` (or the "End" button), never
  hard-delete the row.** History is the only thing that lets future
  Ben answer "when did this start eating $25/mo?".
- **Both `system_costs` AND `recurring_costs` reads are part of
  `getCostData()` in `cost-logger.ts`** — `recurringMonthly`,
  `recurringByCategory`, and `totalMonthlyCombined` are appended to
  the returned object. Don't add a third cost table; extend these
  two if a new cost class shows up.

---

## Customer Portal — `/client/[id]` (NON-NEGOTIABLE — added 2026-04-24)

The single year-2 retention lever identified in the deep retention review.
Without a place a customer can SEE the leads, reviews, and renewal info
Ben drove for them, the $100/yr renewal feels like a "vague maintenance
fee" instead of "concrete value Ben delivered this month." This is the
fix.

### URL-as-secret auth pattern

The route `/client/[id]` is PUBLIC. The prospect's UUID in the path IS
the credential — same pattern as a magic link. UUIDs are 128-bit and
not enumerable; we get practical access control by keeping the URL
out of public discovery (sitemap, robots, search index), and the page
sets `robots: noindex` + `nocache` headers so search engines can't
surface it even if a customer accidentally shares the link publicly.

The route is NOT listed in `PROTECTED_PATHS` in `src/middleware.ts`,
so the matcher passes it through. No per-request auth check needed.

If we ever need stronger access control (e.g. Ben starts surfacing
customer financials beyond Stripe-portal-link level), upgrade to an
HMAC-signed URL pattern (path = `/client/[id]?sig=hmac(id+secret)`)
without changing the route shape. Until then, UUID-as-secret is
plenty for read-only customer dashboards.

**RULE:** Don't add any new field to the page that we wouldn't want
exposed to anyone with the URL — phone, email, adminNotes, internal
QC scores, funnel state are all OFF the page. Same whitelist
philosophy as `/api/claim/[id]`.

### What the page renders

Three tabs (`src/app/client/[id]/ClientPortal.tsx`):
1. **Leads** — `contact_form_submissions` + `missed_call_logs` +
   `schedule_bookings` for the prospect. Tap-to-call, tap-to-email
   reply CTAs.
2. **Reviews** — `client_reviews` (5-star with "Sent to Google" badge,
   <5 with "Private feedback" badge). Empty-state CTA links a mailto
   that auto-fills "send review requests" with Ben.
3. **Renewal** — `mgmtSubscriptionId` → Stripe `subscriptions.retrieve`
   for next charge date + last 3 invoices. "Update card" button uses
   `getBillingPortalUrl()` (Stripe portal env var or mailto fallback).
   Pricing wording: "$100/yr covers domain renewal, hosting, ongoing
   maintenance, and support" — verbatim per Pricing Wording
   Consistency Rule.

### Failure modes (all must keep the page rendering)
- Supabase missing → metric helpers return [], empty-states render.
- Stripe call fails → `renewal.error="stripe_unavailable"` + amber
  inline notice. Update-card button still works (mailto fallback).
- Prospect not found → 404 (Next.js `notFound()`).
- mgmtSubscriptionId absent → renewal card shows "Not scheduled yet".

## Rule 39: Monthly Report MUST Use Real Data (NON-NEGOTIABLE — added 2026-04-24)

The previous `getMonthlyReportEmail()` shipped GENERIC TIPS ("add
your site to Google Business Profile, put the URL in your Instagram
bio, ask happy customers for reviews…") with NO real data about the
specific customer's month. This violated the existing CLAUDE.md
non-negotiable about social-proof: never show generic content where
real data is available.

The fix lives in `src/lib/customer-metrics.ts` (`getCustomerMonthMetrics`)
+ `src/app/api/reports/monthly/route.ts` (cron now fetches metrics
per prospect before sending).

**Rules:**
- Monthly report email body MUST contain real per-customer counts
  for the previous month: leads, missed-calls auto-recovered,
  5-star reviews, appointments. No more generic-tip content.
- If the customer had ZERO activity that month, switch to the
  encouragement template ("Your site was up 100% of April —
  reply with one thing you'd like to try"), NEVER ship "0 leads,
  0 calls, 0 reviews" in the body.
- The email body MUST link to `/client/[id]` so the customer can
  see the full names/numbers/details. Don't truncate the data
  inside the email — emails are nudges, the portal is the data.
- Adding a new metric (e.g. SMS auto-replies sent) requires
  extending `getCustomerMonthMetrics` AND updating the email
  body template in lockstep. Never let one drift ahead of the
  other.
- Mock-mode safe: every count helper wraps the Supabase query
  in try/catch and returns 0 if the table doesn't exist yet —
  so a missing `missed_call_logs` table doesn't break the cron.
- Generic tips/advice paragraphs in monthly emails are BANNED.
  If we want to share a tip, send a separate broadcast — don't
  pad the per-customer report with content that's identical to
  every other customer's email.

## Rule 43: Persist Before You Touch (NON-NEGOTIABLE — added 2026-04-24)

Every customer-facing event handler that fires an automated touch
(SMS, email, voicemail, postcard, call) MUST persist a log row to
the appropriate Supabase table BEFORE the touch fires. The
persistence is the source of truth for the customer portal +
monthly report metrics. The touch itself is a side effect — losing
it is bad, but losing the count of how many we've delivered is
worse because it silently turns the portal into a liar.

**Concrete examples (in-tree):**
- `/api/missed-call/callback` — inserts into `missed_call_logs`
  BEFORE calling Twilio's Messages.json. Wraps the insert in
  try/catch so a Supabase outage never blocks the SMS, and flips
  `auto_sms_sent=true` only after the SMS dispatches successfully.
  Idempotent on Twilio retries via UNIQUE(twilio_call_sid).
- `/api/contact-form/[id]` — inserts into
  `contact_form_submissions` BEFORE firing the auto-SMS + owner
  email.
- `/api/review/submit` — inserts into `client_reviews` BEFORE
  emailing the owner about a <5-star feedback.
- `/api/schedule/book/[id]` — inserts into `schedule_bookings`
  BEFORE confirmation email/SMS.

**The rules:**
1. Order matters. INSERT first, then dispatch. Never dispatch and
   then "log if I have time" — the log row is the contract with
   the customer portal, not an afterthought.
2. Wrap the INSERT in try/catch. Log the error but do NOT block
   the dispatch. The auto-touch reaching the caller/customer is a
   higher-priority side effect than the metric.
3. Use UPSERT with a UNIQUE constraint on a provider-supplied id
   (Twilio CallSid, Stripe session id, etc.) when the upstream
   webhook may retry. Idempotency by primary key is non-negotiable.
4. Set the dispatch-confirmation flag (`auto_sms_sent`,
   `email_sent`, etc.) in a separate UPDATE AFTER the dispatch
   resolves. Never set it preemptively.
5. When adding a new automated-touch handler, add the persistence
   table in the SAME commit. Code that touches a customer with no
   audit row is a regression.

**This rule's existence:** Wave 4A built `customer-metrics.ts` to
power the customer portal. Three of the four metrics (leads,
reviews, bookings) had backing tables. The fourth (missed-call
recovery) didn't — the callback fired the SMS and threw the event
on the floor. The portal showed 0 missed calls forever and the
customer had no idea Ben's auto-texter was actually working for
them. Migration 20260424_missed_call_logs.sql + the callback
update (this rule's catalyst) closed the gap. The next gap of
this shape is forbidden.



## Rule 44: NPS-Gated Referral (NON-NEGOTIABLE — added 2026-04-24)

The Day-30 referral email and the auto-fired promoter referral
email are NPS-gated: we only ask happy customers to send their
friends. Pre-Wave-5b every paid customer got the same generic
"send your friends!" pitch regardless of how the build experience
actually went. Detractors and lukewarm passives got asked for
referrals at the worst possible moment — actively hurting the
relationship.

**The flow:**

1. **Day 14 cron** (`/api/nps/send`, schedule `0 16 * * *`) finds
   paid prospects with `paid_at <= now() - 14 days` and
   `nps_sent_at IS NULL` and `status = 'paid'`. Sends
   `getNpsSurveyEmail()`. Stamps `nps_sent_at = now()`.
2. **Email body** — 11 score links pointing at `/r/[code]/[score]`.
   When `ENABLE_HTML_PITCH_EMAIL=true`, renders as a colored button
   row (red 0-6, yellow 7-8, green 9-10).
3. **Customer clicks a score link.** `/r/[code]/[score]` records
   the row in `nps_responses` with derived category, then 302s to
   the appropriate variant of `/nps/thanks/[code]`.
4. **Promoter (9-10):** auto-fire `getPromoterReferralEmail()` +
   show the referral amplification page (personalized link, email-
   a-friend mailto, LinkedIn/Facebook share buttons). Mark
   `referral_email_sent=true` on the row so the regular
   `/api/referral/send` cron skips this prospect.
5. **Passive (7-8):** show "what would have made it a 9 or 10?"
   textarea. Soft signal; emails the BlueJays inbox; no SMS.
6. **Detractor (0-6):** show "what went wrong? I want to fix it."
   textarea. Submit fires `sendOwnerAlert()` to Ben's phone WITHIN
   SECONDS — this is the at-risk-customer save. The page promised
   24-hour personal outreach, so Ben needs to act within that
   window.
7. **Day 30 cron** (`/api/referral/send`) only fires
   `getReferralEmail()` for prospects whose latest
   `nps_responses.category === 'promoter'`. Passives + detractors
   are SKIPPED entirely — never get the referral ask.

**Why Day 14 (not 7, not 30):**
- Day 7 measures honeymoon excitement, not stable opinion.
- Day 30 misses the "honest first impression" window — the
  experience is no longer fresh.
- Day 14 is the sweet spot: the build dopamine has worn off but
  the experience is still vivid enough to remember concrete
  details.

**Public routes added to middleware allowlist:**
- `/r/` — NPS click handler (must work without auth cookie)
- `/nps/` — thanks page (URL-as-secret pattern, like `/client/[id]`)
- `/api/nps/` — feedback POST (called from the thanks page)

**Idempotency contract:**
- `/api/nps/send` cron: `nps_sent_at` flag prevents resends. Set
  AFTER successful send so a partial failure doesn't lock the
  prospect out forever (next cron retries).
- `/r/[code]/[score]` clicks: each click inserts a new row but the
  promoter referral email is gated on
  `nps_responses.referral_email_sent=true` for any prior row —
  re-clicks don't double-send.
- `/api/nps/feedback/[code]` POST: updates the latest row's
  feedback column rather than spawning a new row. Detractor SMS
  fires once per row (gated on `feedback_sent_to_ben=false`).

**RULES — never violate:**
- Don't fire any referral ask (email, SMS, dashboard reminder) to a
  prospect whose latest NPS category is `passive` or `detractor`.
- Don't fire a referral ask to a prospect with no NPS response
  yet — wait for them to score. The cron treats "no response"
  identically to "skip".
- Don't soft-prompt a detractor to "give us another chance" within
  the 14-30 day window via a different channel. They told us
  they're unhappy; the next contact is Ben personally, not
  another automated email.
- Don't lower the day-14 threshold. The whole psychology of the
  survey depends on customers having lived with the site long
  enough to form a stable opinion. A Day-3 or Day-7 NPS measures
  excitement, not satisfaction.



## Rule 45: Win/Loss Feedback Loop (NON-NEGOTIABLE — added 2026-04-24)

Every "not_interested" farewell that the AI responder sends MUST include
a soft probe sentence asking why. Without this, every dismissal is
silently wasted training data — we never learn whether prospects pass
because of price, timing, the design, or because they already have a
website. Three weeks of probe responses build the objection database
that informs every future template + pitch change.

**Where it's enforced:**
- `getLossProbeSentence(prospectId)` in `src/lib/ai-responder.ts` —
  returns one of three randomized phrasings, picked deterministically
  by `prospect.id` hash so the same prospect always sees the same
  wording across multiple touches (consistency) but the AI pattern is
  hard to detect across the prospect base.
- `appendLossProbe(reply, prospectId)` — appends the probe to a
  not_interested farewell unless `farewellAlreadyHasProbe(reply)`
  detects the AI organically wrote a similar question itself
  (idempotent — safe to call repeatedly).
- Both the fast-path `not_interested` branch AND the AI-classified
  `intent === "not_interested"` branch in `processIncomingMessage()`
  call `appendLossProbe()` and persist `lossProbeSentAt` on the
  prospect record so the inbound classifier can detect probe responses
  later.

**The 5 categories** (matches the `loss_reasons.category` column):
- `price` — too expensive, can't afford, budget too tight
- `timing` — not the right time, busy, maybe later, next year
- `design` — preview didn't feel right, wrong colors, wrong vibe
- `have_one` — already have a website / developer / agency
- `other` — anything else (catch-all)

A 6th allowed value `no_response` exists in the schema for future
use (e.g., a cron that auto-classifies prospects who never replied
to the probe within 14 days) but is not produced by the current
classifier.

**Inbound probe-response handling** (`tryHandleLossProbeResponse`):
- Gate: `prospect.status === "dismissed"` AND `lossProbeSentAt` is
  within the last 30 days. Outside that window the reply is treated as
  a brand-new inbound and runs through normal classification.
- Routes the body through `gpt-4.1-mini` to classify into one of the
  5 categories with a 0-1 confidence. Falls back to a keyword
  heuristic in mock mode (no `OPENAI_API_KEY`) so dev still works.
- Persists a `loss_reasons` row with the raw response, classification,
  confidence, and metadata (which model classified it, when the probe
  was sent).
- Sends a tiny acknowledgment back: "Thanks — that helps." (one line,
  no link, no further pitch).
- DOES NOT re-engage the funnel. They said no — respect it. TCPA +
  basic decency.
- Logs a cost row via `logCost(..., service: "openai", action:
  "loss_probe_classification", costUsd: 0.0008)` for every classification.

**The dashboard surface** (`LossReasonsPanel`):
- Mounted on the main dashboard view directly under
  `StatusTransitionsToday`.
- Top 5 categories by count (last 30 days) with colored badges.
- 10 most recent verbatim responses with prospect business name,
  category badge, AI confidence %, and a "Mark reviewed" button per
  row that POSTs to `/api/loss-reasons/[id]/review` to set
  `acted_on_at`.
- Polls `/api/loss-reasons/stats` every 60s.
- Empty state: "No loss data yet — probes will start landing as the AI
  fires more not_interested farewells."

**Operator goal:** review loss reasons WEEKLY. The whole point of
collecting this data is to use it. If 60% of dismissals say "price"
that month → the pitch needs more ROI framing on first touch. If 40%
say "design" → the V2 templates for that category need a refresh.
If "have_one" dominates → push the comparison page harder in the
initial email. The data tells you which lever to pull.

**RULES — never violate any of these:**
- Don't strip the probe from any not_interested farewell — fast-path or
  AI-classified, both must include it. Idempotency means safe to call
  twice; the rule is never to skip it.
- Don't re-engage the funnel after a probe response. Don't send a "well
  if it's price, here's our payment plan…" reply. They said no.
- Don't send the probe twice — `farewellAlreadyHasProbe()` exists
  precisely so the AI can't accidentally wrap "was it the price?" with
  another "was it the price?" if it organically wrote one.
- Don't use the probe wording as a sales hook. The phrasing is
  intentionally neutral and "help me improve" — never "let me try one
  more time to convince you." The whole reason it works is that it
  doesn't feel like sales.
- Don't add new probe phrasings without testing them — the current
  three are calibrated for a soft, low-pressure tone. New phrasings get
  added to `LOSS_PROBE_PHRASINGS` only after a manual review.
- Don't surface phone/email/internal notes through the loss-reasons
  stats endpoint. The endpoint is operator-only (gated by the dashboard
  auth middleware) but the principle stays.

**Migration:** `supabase/migrations/20260424_loss_reasons.sql` adds the
`loss_reasons` table and `prospects.loss_probe_sent_at` column. Schema:

```
loss_reasons (
  id UUID PK,
  prospect_id UUID FK → prospects(id) ON DELETE CASCADE,
  category TEXT,
  raw_response TEXT,
  ai_classification TEXT,
  confidence DECIMAL(3,2),
  surfaced_at TIMESTAMPTZ DEFAULT NOW(),
  acted_on_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
)
```

Indexes: by `prospect_id`, by `category`, by `surfaced_at DESC` (so
the dashboard's "newest first" query is cheap).

---

## North Star: 5,000 Paying Sites — The Failure-Is-Not-An-Option Plan

This is the long-term operating thesis for BlueJays. Every system, every
hire, every channel decision, every CLAUDE.md rule must measurably move
the business toward this number. If a project doesn't, it's a
distraction.

### The math at 5,000 sites
- **5,000 customers × $997 setup = $4.985M one-time revenue** (acquired
  over 24 months ≈ $208K/mo run-rate at year 1)
- **5,000 × $100/yr renewal = $500K/yr recurring annuity** at full
  scale (assuming 80% year-2 retention)
- **Hitting 90%+ retention adds ~$160K/yr at the 5K mark** — that's
  why the customer portal + real-data monthly report + NPS funnel +
  Stripe dunning are non-negotiable infrastructure.

### Cost ceiling per acquired customer (CAC)
At $997 setup + ~$80/yr 5-year LTV, total LTV ≈ $1,400 over 5 years.
Sustainable CAC = ~$200–$300 per closed customer. Above $400 the
unit economics break.

### Margin per site at scale
- $997 setup minus ~$11 domain, ~$5 generation, ~$3 hosting, ~$50
  blended CAC = **~$925 margin per first-year customer**
- Renewal year: $100 - $11 - $3 = **$86/yr recurring margin per
  retained customer**

### Five milestones — each unlocks the next phase

**Milestone 1: 100 sites (~$100K revenue, $10K/yr annuity)**
- Operator: Ben alone. Manual review on every reply.
- Marketing: cold email + inbound SMS + LinkedIn manual + postcards.
- Failure mode: Ben burns out. Mitigation: PendingRepliesPanel + 3-step
  onboarding + customer portal + loss-reasons feedback loop.

**Milestone 2: 500 sites (~$500K revenue, $50K/yr annuity)**
- First hire: VA at $5–$8/hr × 20 hrs/wk for intake + support triage.
- Marketing: add Apollo ($30/mo), retargeting pixels ($100/mo), Day-7
  postcard ($200/mo at 100 prospects).
- Tech: enable HTML pitch email after Day 14 warmup; add 3rd warming
  domain for 300 sends/day combined.

**Milestone 3: 1,000 sites (~$1M revenue, $100K/yr annuity)**
- Second hire: junior designer at $15–$25/hr × 30 hrs/wk for
  customizations.
- Marketing: outbound voice (Ben dials 10/day from
  opened-but-didn't-claim list), GBP claim, Chamber memberships.
- Tech: Vercel Pro 50-domain-per-project cap is hit. Shard across
  20+ projects via `vercel_project_id` column OR upgrade to Enterprise.

**Milestone 4: 2,500 sites (~$2.5M revenue, $250K/yr annuity)**
- Third hire: closer/sales rep at $50K base + 10% commission.
- Marketing: Apollo Sales Nav team license, paid LinkedIn ads,
  partner referrals from 2–3 designers who don't serve SMB.
- Tech: registrar spend = ~$70/day at this volume. Renewal cron
  MUST be airtight.

**Milestone 5: 5,000 sites (~$5M revenue, $500K/yr annuity)**
- Team: Ben + closer + 3 designers + VA + customer success hire.
- Marketing: brand spend kicks in. Local radio, event sponsorships,
  podcast sponsorship.
- Tech: Vercel Enterprise OR sharded Pro, Supabase Team ($599/mo for
  PITR), SendGrid Pro ($89/mo), Twilio short-code (~$1K/mo).
- Failure mode: regulatory exposure. Mitigated by airtight TCPA gate,
  working unsubscribe, state subscription disclosure on every surface.

### The 5 systems that must be airtight before scaling past 100

1. **Domain renewal cron** — Stripe-first, registrar-second policy is
   the load-bearing wall. One bug = systemic revenue leak.
2. **Card-failure dunning** — invoice.payment_failed + 30/7-day
   pre-renewal emails + customer portal must convert ≥60% of failed
   cards before suspending service.
3. **AI responder + Ben-review queue** — kill switch + drafts panel.
4. **Customer portal + monthly real-data report** — the "$100/yr"
   must feel like ongoing value, not a hidden subscription.
5. **Onboarding 3-step form + multi-stage reminder cron** — every
   paid customer who can't fill the form is a customer who never
   goes live.

### Channel mix at full scale (the 80/20)

The unsexy truth: **at 5K sites, 80% of acquisition will come from
outbound + referrals, not inbound.** SEO/content/PR are
brand-building, not pipeline-driving, until much higher scale.

Concrete revenue split target at 5K:
- Cold email + inbound SMS + voicemail: **45%**
- Referrals + customer-success NPS-promoter loop: **20%**
- LinkedIn outbound (manual + Sales Nav): **15%**
- Outbound voice (Ben + closer dialing warm leads): **10%**
- Paid retargeting + brand reinforcement: **5%**
- SEO + content + organic referrals: **5%**

The first $1M of revenue comes almost entirely from cold email +
inbound SMS + manual outbound. Don't get distracted building TikTok
funnels.

### Risk register — what kills this business

1. **SendGrid sender reputation collapse** — one bad batch tanks the
   domain. Mitigated: parallel domain warming, bounce auto-suppression,
   gradual ramp.
2. **Stripe account suspension** — chargeback rate >1% suspends the
   account. Mitigated: 100% money-back guarantee, Customer Portal,
   generous first-30-days refund.
3. **Vercel/AWS cost explosion** — viral growth = Lambda spikes.
   Mitigated: cost-per-call logging, spending dashboard,
   recurring-cost projection.
4. **Single-state regulatory action** — WA AG investigates "$100/yr
   in perpetuity." Mitigated: every paid customer sees the renewal
   cadence in welcome email, monthly report, and customer portal.
5. **Ben hit-by-bus** — single-founder risk. Mitigated: by Milestone
   3 the codebase + CLAUDE.md should be operable by a $20/hr VA
   + Claude in 90% of cases.

### How to know if we're on track — the 5 weekly numbers

Each Friday, Ben reviews these:
1. **Net new paid customers this week** (target: 5/wk at M1 → 50/wk at M5)
2. **Email open rate** (target: ≥30% — below = sender reputation slipping)
3. **Reply rate** (target: ≥3% on Day 0 pitch — below = copy/list quality)
4. **Onboarding form completion within 48 hrs of payment** (target: ≥70%)
5. **Year-2 retention** (target: ≥80%)

Numbers below target for 2 consecutive weeks = pause new acquisition
spend, fix the leaking surface first, then resume.

### Locked-In Rule 46 — Failure-Is-Not-An-Option Decision Framework

Every meaningful decision (new feature, new channel, new hire, new
expense, new tool) must answer: **"Does this measurably move us
toward 5,000 paid sites in 24 months?"** Default answer should be no.
Saying yes requires showing which milestone it unlocks AND which of
the 5 weekly numbers it improves. If neither applies, the answer is
no — even if the idea is "cool."

This rule is the antidote to the BlueJays codebase's recurring
problem: building 8 channels and only deploying 2.5. **Build less,
deploy more, measure everything.**

### Locked-In Rule 47 — Approved Prospects Must Auto-Enroll Daily

The 2026-04-25 audit found that the warming domains were under-utilized
(36 sends out of 100 capacity) NOT because of missing prospects, but
because the daily funnel cron only sends to ALREADY-ENROLLED prospects.
Approved-but-not-enrolled prospects sat in the pool while the warming
capacity went unused. Manual `enroll-batch` was the only path.

**Rule:** the daily funnel cron MUST auto-enroll up to (today's warming
limit − today's already-sent-day-0) approved-and-not-enrolled prospects
BEFORE running the funnel processor. Implementation lives in
`/api/funnel/run/route.ts`. Never let warming capacity sit idle while
approved prospects sit in the backlog — that wastes the most expensive
asset BlueJays owns: sender reputation runway.

### Locked-In Rule 48 — Ask 10+ Questions Before Any Big Job (NON-NEGOTIABLE)

Established 2026-04-25 by Ben. Big jobs that get started without enough
upfront context end up in rework — wrong assumptions baked in, scope
creep, mid-build pivots that waste hours. The fix:

**Before starting ANY big job, ask Ben at least 10 specific questions.**

A "big job" = anything that meets ANY of these:
- Multi-file refactor or new feature spanning 3+ files
- New customer-facing surface (page, email template, channel)
- New automation/cron or change to an existing cron's behavior
- New external integration (API, service, vendor)
- Anything Ben describes as "the next big move," "the big build,"
  "let's tackle X," or scopes broader than a single fix
- Any change touching pricing, billing, the funnel, or onboarding
- Any plan that would take more than ~30 minutes of execution

**Questions must be specific and load-bearing — not generic.** Bad:
"What's your goal?" Good: "Should the new SKU charge upfront or
defer to the year-2 sub like the rest?" The 10 questions should
collectively eliminate ambiguity around: scope, priority, success
criteria, edge cases, who/what is affected, what to leave alone,
deadline, dependencies, what done looks like, and what would make
this fail.

**Format (NON-NEGOTIABLE):** numbered list. Under each question, give
2-5 lettered multiple-choice options (A, B, C, D...) representing the
most likely answers. ALWAYS include a final option labeled "Other —
type your own" so Ben can override. No preamble. Wait for Ben's
answers before writing a single line of code or running a single
command.

Why multiple-choice: it's faster for Ben to pick a letter than to
type out a paragraph. The options also surface considerations Ben
might not have thought of yet — he sees what the realistic answer
space looks like before committing. The "Other" escape hatch keeps
him from feeling boxed in.

Good multiple-choice options are concrete and load-bearing:
- BAD: A) Yes  B) No  C) Other
- GOOD: A) Charge upfront like review_blast  B) Defer to year-2 sub
  like custom tier  C) Make it a separate $X/mo subscription
  D) Other — type your own

**Exceptions (no 10-question gate required):**
- Bug fixes with a clear repro
- Single-file edits that Ben explicitly scoped
- Continuing a job already in flight where context is established
- Read-only investigation / answering a question Ben asked

If unsure whether a job qualifies as "big," default to asking the
questions. The cost of asking is 30 seconds; the cost of building
the wrong thing is hours.

### Locked-In Rule 49 — Manually-Added Prospects Must Be Tagged (NON-NEGOTIABLE)

Established 2026-04-25 by Ben. Caught the same day: the freshly-shipped
Rule 47 auto-enroll cron would have swept Lewis County Autism
Coalition, Meyer Electric, Hector Landscaping, and OPS Security into
the cold-outreach warming pool because all 4 sat in `status='approved'`.
These are warm relationships — gifted sites, custom builds, or
hand-picked closes — that Ben handles personally with custom outreach,
NOT the templated funnel.

**The rule:** any prospect that Ben adds manually to the system
(directly via dashboard, via SQL import, via custom-tier purchase, via
gift, via friend/family/referral introduction) MUST be tagged with
`prospects.manually_managed = true` BEFORE any automation can touch it.

**The mechanism:**
- Schema: `prospects.manually_managed BOOLEAN NOT NULL DEFAULT false`
  (migration `20260425_manually_managed.sql`).
- Type: `Prospect.manuallyManaged?: boolean` in `src/lib/types.ts`.
- Auto-enroll filter: `/api/funnel/run/route.ts` Step 0 already
  enforces `.eq("manually_managed", false)` on the candidates query —
  do NOT remove this clause.
- Default false so every existing scouted prospect retains current
  behavior. Only the manual ones get flipped to true.

**When ANY future code adds a manual prospect, it MUST set
`manuallyManaged: true` in the same `createProspect` / `updateProspect`
call.** Examples:
- Custom-tier purchases (`pricingTier === "custom"`) → always manual.
- Direct dashboard "Add prospect" form → manual by default unless
  operator explicitly opts in to auto-outreach.
- SQL imports / bulk uploads of warm leads → manual until proven
  otherwise.

**When in doubt, default to manual.** False positives are cheap (Ben
handles them himself), false negatives are expensive (warm relationship
gets the cold-pitch template, trust burned).

**Future surfaces that MUST respect this flag:**
- Auto-enroll (already done)
- Bulk-send scripts (`scripts/recover-broken-link-sends.ts` and any
  future bulk-outreach script)
- Daily SMS funnel sweeps
- Voicemail drop crons
- Postcard cron (when wired)
- Retargeting pixel triggers (when wired)
- Test group selection (Rule 50 below)

If a new automated-touch surface gets built and skips this filter, that's
a regression. The filter is part of the Rule 47 contract — auto-touch
without `manually_managed = false` is forbidden.

### Locked-In Rule 50 — Cold Outreach Skips Killer-Site & Franchise Prospects (NON-NEGOTIABLE)

Established 2026-04-25 by Ben. Two prospect classes that should never
get cold pitches because the $997 offer doesn't fit their reality:

**1. Already-killer existing websites.** If a prospect's current website
is genuinely good — modern design, clear CTAs, mobile-responsive,
recent content, real photography — pitching them a $997 redesign feels
desperate and ill-informed. They'll dismiss us, and rightly so. The
prospects worth pursuing are the ones with visibly outdated, broken,
template-generic, or missing sites where the upgrade is obvious.

**2. Franchise locations.** Franchise businesses (chain pizza, chain
auto-repair, chain real-estate offices, chain gyms, etc.) have
corporate-mandated websites — the local owner can't change them. The
$997 pitch is dead on arrival. Even if the franchisee LOVES the
preview, they can't act on it.

**The rule:** every cold-outreach selection mechanism (auto-scout,
auto-enroll, test-group picker, bulk-send scripts, retargeting list
builder) MUST filter out:
- Prospects flagged as `franchise = true` (when the column exists).
- Prospects whose `qualityNotes` or scraped data indicates a
  high-quality existing website (use `qualityScore` heuristics: skip
  prospects whose CURRENT site scores ≥ 80 on the QC review).

**Implementation guidance:**
- For auto-scout: tag franchise listings during scrape (Google Places
  often has "Franchise" in the business type or the website URL is a
  subdomain of a national chain like `www.midaschain.com/store/123`).
- For auto-enroll: add `.lt("current_site_quality_score", 80)` once
  the scoring column exists. Until then, lean on manual review during
  approval — Ben should reject obvious franchises and killer-site
  prospects at the approval gate.
- For test-group selection: Rule 50 is load-bearing. The whole point of
  a test group is to spend extra ($/prospect) on the highest-converting
  segment. Wasting Browserless videos + Lob postcards on a franchise
  Sears Auto Center destroys the per-prospect economics.

**Heuristics for "killer existing website" detection** (use any 2+):
- Site loads cleanly on mobile (no horizontal scroll, no broken layout)
- Has booking/scheduling system embedded
- Recent blog content (within last 12 months)
- Custom photography (not generic stock)
- Modern framework (Next.js, Webflow, Squarespace 7.1, modern Wix)
- Site speed score > 80 on PageSpeed Insights
- HTTPS + valid SSL + sitemap.xml present

If a prospect hits 2+ of those, treat them as killer-site and exclude
from cold outreach. Ben can still pitch them manually if there's a
relationship angle, but the templated funnel stays away.

**Until automated detection ships, the gate is the dashboard approval
step.** Ben must consciously reject killer-site and franchise prospects
when they hit `pending-review` — never approve them and let auto-enroll
do its thing.

### Locked-In Rule 52 — Stripe Live Kill-Switch (NON-NEGOTIABLE)

Established 2026-04-25 by Ben as part of the LIVE flip. Every public
checkout entry-point MUST honor a single env-var kill-switch so any
incident can stop new transactions in <2 minutes without code changes.

**The contract:**
- When `STRIPE_LIVE_ENABLED=false`, every public checkout endpoint
  returns HTTP 503 with a friendly "temporarily unavailable, email Ben"
  message BEFORE any other logic runs (rate limit, prospect lookup,
  Stripe call). No partial transactions possible.
- Default unset OR `STRIPE_LIVE_ENABLED=true` (or any value !== "false")
  = normal operation. The check is fail-OPEN by design — a missing env
  var doesn't accidentally disable checkout.
- Webhook handler does NOT honor the kill-switch. In-flight transactions
  (already at Stripe) MUST still process when they fire so customers
  who paid get their welcome email + mgmt sub created. Stopping new
  starts is the goal; stopping in-flight finishes is a worse outcome.

**Endpoints that MUST honor the kill-switch (verify when adding any new
checkout surface):**
- `POST /api/checkout/create` — main $997 / installment checkout
- `POST /api/checkout/upsell` — 4-SKU upsell checkouts
- Any future checkout route MUST check `STRIPE_LIVE_ENABLED !== "false"`
  at the top of the handler. If a new route forgets, that's a regression.

**When to flip:**
- Stripe account suspension warning (rare, but immediate trigger)
- Webhook signing-secret mismatch detected in logs (transactions
  succeed but our webhook 401s → customers pay but get nothing)
- Any chargeback rate spike that risks Stripe account health
- Maintenance windows where an incompatible code change is deploying
- Suspected fraud / unusual transaction volume

**Recovery:**
1. Set `STRIPE_LIVE_ENABLED=true` (or remove the env var) on Vercel
2. Redeploy (~60-90 sec)
3. New checkouts work again
4. Webhook handling for in-flight events was unaffected throughout

**Forbidden:**
- Don't add a UI surface that bypasses this gate
- Don't add a different env var for the same purpose — this is the
  single canonical kill-switch
- Don't make the kill-switch fail-CLOSED (default off when env var
  missing) — that bricks new Vercel projects on first deploy

### Locked-In Rule 53 — LIVE Launch: Standard Tier Self-Serve Only

Established 2026-04-25 by Ben at LIVE launch. At launch, ONLY the
`standard` ($997) tier is self-serve through the `/claim/[id]` →
Stripe Checkout flow. The `free` ($30) and `custom` ($100/yr) tiers
are gated behind a "request" path — prospects on those tiers must
email Ben directly so the relationship can be handled personally.

**Why:**
- `free` tier is for friends/family — never auto-served, always tagged
  manually by Ben (existing rule)
- `custom` tier is for bespoke builds with hand-off relationships
  (Lewis County Autism, Hector Landscaping, etc.) — these prospects
  shouldn't see the templated checkout flow because their experience
  is supposed to feel personal
- The auto-enroll cron (Rule 47) + cohort selection (Rule 49) already
  exclude manually-managed prospects from automated outreach. This
  rule extends the same logic to the conversion surface — even if a
  custom prospect somehow lands on `/claim/[id]`, they get routed to
  Ben rather than self-serving.

**Implementation:** `/api/checkout/create` returns HTTP 403 with a
"please email bluejaycontactme@gmail.com" message when the prospect's
`pricingTier !== 'standard'`. Override available via env var
`STRIPE_ALLOW_NON_STANDARD_TIERS=true` if Ben needs to re-open
self-serve on those tiers for a specific batch (e.g. friends-and-
family promotion).

**The override env var is for specific campaigns, not the new normal.**
After re-enabling for a batch, flip back to default (unset) so the
gate stays in place by default. If you find yourself wanting it on
permanently, that signals the policy is wrong — talk to Ben before
making it the default.

**Existing custom-tier customers:** prospects already in `paid` status
on a custom tier are unaffected — they've already paid and the route
gate only fires on NEW checkout attempts. Their renewal flow runs
through Stripe subscriptions independently of the checkout surface.

### Locked-In Rule 54 — Pre-Flip Code Changes Ship Before Env Vars Flip

Established 2026-04-25 by Ben. When migrating any third-party service
from test/sandbox to LIVE (Stripe, Namecheap, Lob, Twilio, SendGrid),
the order is:

1. Code changes that gate the new behavior (kill-switches, tier gates,
   feature flags, mock-mode fallbacks) ship + deploy to Vercel FIRST
2. Verify the deploy succeeded (gh api commit status check)
3. THEN flip the env vars in the third-party dashboard + Vercel
4. THEN run a dry-run verification (test charge / webhook trigger /
   address availability check)
5. THEN remove the kill-switch / feature flag if appropriate (not
   immediately — leave it in place for a few days as a safety rail)

**Why:** flipping env vars before the gating code exists creates a
window where the system is half-migrated and any incident has no
fast recovery path. Code-first means there's always a one-liner
revert: flip the env-var kill-switch back on.

**This rule generalizes:** applies to Namecheap going live (a NAMECHEAP_LIVE_ENABLED kill-switch should be added before flipping NAMECHEAP_SANDBOX off), to Lob going live (LOB_LIVE_ENABLED), to Twilio if/when SMS launches at scale, etc. Don't trust env vars alone as the gate — always pair with a code-level kill-switch.

---

## Stripe LIVE Launch Procedure (locked 2026-04-25)

The exact sequence Ben follows when flipping Stripe from TEST to LIVE.
Every step here is gating — skip one and the launch is a partial
migration that risks customer-impacting bugs.

### Pre-flip code (must be on master before touching env vars)

- [x] `STRIPE_LIVE_ENABLED` kill-switch in `/api/checkout/create`
      and `/api/checkout/upsell` (Rule 52)
- [x] `STRIPE_ALLOW_NON_STANDARD_TIERS` gate in `/api/checkout/create`
      (Rule 53 — standard-only self-serve at launch)
- [x] CLAUDE.md updated with Rules 52/53/54 + this procedure

### Stripe Dashboard work (Ben does in browser — ~30 min)

1. **Create 8 LIVE Products** at https://dashboard.stripe.com/products
   (LIVE mode, NOT test mode). Note the `price_xxx` IDs:
   - $997 one-time setup → `STRIPE_PRICE_SETUP_ID`
   - $100/yr maintenance subscription → `STRIPE_PRICE_MGMT_ID`
   - $100/yr custom-tier subscription → `STRIPE_PRICE_CUSTOM_ID`
   - $99 one-time review_blast → `STRIPE_PRICE_REVIEW_BLAST`
   - $400 one-time extra_pages → `STRIPE_PRICE_EXTRA_PAGES`
   - $150 one-time gbp_setup → `STRIPE_PRICE_GBP_SETUP`
   - $50/mo monthly_updates subscription → `STRIPE_PRICE_MONTHLY_UPDATES`
   - $349 installment payment → no env var needed (inline price_data)

2. **Configure Customer Portal** at https://dashboard.stripe.com/settings/billing/portal
   - Enable: update payment method, view invoices, cancel subscription
   - Save the LIVE login URL (looks like `https://billing.stripe.com/p/login/...`)
   - This becomes `STRIPE_CUSTOMER_PORTAL_URL` on Vercel

3. **Enable Stripe Tax** at https://dashboard.stripe.com/settings/tax
   - Add EIN / business tax registration
   - Enable auto-collect for the relevant US states
   - This auto-applies to all LIVE checkout sessions going forward

4. **Create the LIVE Webhook Endpoint** at https://dashboard.stripe.com/webhooks
   - Endpoint URL: `https://bluejayportfolio.com/api/webhooks/stripe`
   - Events to send (matches the code's handler list):
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `checkout.session.expired`
     - `invoice.payment_failed`
     - `invoice.payment_succeeded`
   - After creating, click "Reveal" on the Signing Secret — copy it.
     This becomes `STRIPE_WEBHOOK_SECRET` on Vercel.

5. **Get the LIVE secret key** at https://dashboard.stripe.com/apikeys
   - Copy the `sk_live_*` value. This replaces `STRIPE_SECRET_KEY`.

### Vercel env vars (single deploy after all set)

Update on Vercel → Project Settings → Environment Variables → Production:

```
STRIPE_SECRET_KEY=sk_live_*                  (REPLACE existing test key)
STRIPE_WEBHOOK_SECRET=whsec_*                (REPLACE existing test secret)
STRIPE_PRICE_SETUP_ID=price_*                (NEW — was unset)
STRIPE_PRICE_MGMT_ID=price_*                 (REPLACE existing test ID)
STRIPE_PRICE_CUSTOM_ID=price_*               (REPLACE existing test ID)
STRIPE_PRICE_REVIEW_BLAST=price_*            (NEW — was unset)
STRIPE_PRICE_EXTRA_PAGES=price_*             (NEW — was unset)
STRIPE_PRICE_GBP_SETUP=price_*               (NEW — was unset)
STRIPE_PRICE_MONTHLY_UPDATES=price_*         (NEW — was unset)
STRIPE_CUSTOMER_PORTAL_URL=https://billing.stripe.com/p/login/*
STRIPE_LIVE_ENABLED=true                     (NEW — Rule 52 kill-switch)
```

After all 11 are set, redeploy (any push triggers it, OR
"Redeploy latest" in the Vercel dashboard).

### Post-flip verification (do not skip)

1. Hit the env-check endpoint in browser — confirm all 11 vars show present:
   `https://bluejayportfolio.com/api/admin/env-check`
2. Open a test prospect's claim page → click "Get Started" → confirm
   you reach Stripe Checkout (NOT the 503 error from the kill-switch).
3. Smoke-test the kill-switch: temporarily set
   `STRIPE_LIVE_ENABLED=false` → redeploy → confirm checkout returns
   503 → set back to `true` → redeploy. (Verifies the kill-switch
   actually works before you need it in an emergency.)
4. Watch the Stripe webhook log at https://dashboard.stripe.com/webhooks
   for the next inbound event — confirm signature validation succeeds
   (HTTP 200 in the webhook log, not 401).

### Rollback (if something breaks)

```
Vercel → Settings → Environment Variables → Production:
  STRIPE_LIVE_ENABLED=false   (kill new transactions immediately)
```

Redeploy. New checkouts return 503. In-flight Stripe events still
process via webhook (so customers who paid in the last few minutes
still get their welcome email).

If the issue is broader (signing secret mismatch, key swap mistake),
revert STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET to the test values,
redeploy, and diagnose with the test webhook before re-flipping.

---

## Review Blast Wave 1 — Customer-Facing Fulfillment (Locked 2026-04-25)

The $99 Review Blast SKU now has end-to-end self-serve fulfillment.
Per Ben's 10-question gate (Rule 48) answers locked 2026-04-25:

**Spec:**
- **Submission UX:** magic link in the welcome email → public page
  `/review-blast/[upsellId]` → paste up to 50 phone numbers (one per
  line, any format) → pick category template → submit. Optional +
  fillable whenever — no urgency banner.
- **Phone format:** customer pastes any format (parens, dashes,
  spaces, leading +, etc.) — server normalizes to E.164 via
  `normalizePhone()` in `src/lib/review-blast.ts`. Invalid lines are
  surfaced back, not silently dropped.
- **Per-customer data:** phone numbers only. No customer names — keeps
  the submission frictionless.
- **SMS template:** category-tuned pre-built templates (dental, vet,
  salon, electrician, plumber, hvac, roofing, auto-repair, landscaping,
  cleaning, fitness, real-estate, law-firm, default fallback). Customer
  picks from a dropdown; preview updates live in the form.
- **Tokens:** `{businessName}` + `{reviewLink}` only. The reviewLink
  resolves to `/review/[prospectId]` — the existing 5-star-filter
  funnel page (5★ → Google review CTA, <5★ → private feedback to
  business owner email).
- **Dispatch timing:** all 50 SMS land within ~3 seconds of the cron
  picking up the submission (50ms delay between sends to stay under
  Twilio's unthrottled rate limit). Spec target was "within 1 hour" —
  we beat that.
- **Pre-A2P fallback:** submissions queue in `pending_a2p` status.
  Once `SMS_FUNNEL_DISABLED` flips off (A2P approved), the next cron
  tick auto-dispatches the backlog. No customer action required.
- **Reply routing:** customer-of-customer replies route to the
  BUSINESS's `prospect.email` (NOT Ben's). Each business handles its
  own customer relationship. Implementation: `tryHandleReviewBlastReply()`
  in `src/lib/review-blast.ts` runs BEFORE the normal prospect-by-phone
  match in `/api/inbound/sms` — short-circuits when the inbound is
  from a phone we recently SMS'd via Review Blast.
- **Operator dashboard:** minimal — just the existing upsell row in
  `/dashboard/customers`. No separate Review Blast firehose page.
- **Cost:** Twilio ~$0.008/SMS × 50 SMS = $0.40 raw. We charge $99 →
  ~$98.60 margin. Logged via `logCost()` service `twilio_sms` so the
  spending dashboard captures the cost.

**Files:**
- `supabase/migrations/20260425_review_blast.sql` — schema
- `src/lib/review-blast.ts` — submission + dispatch + reply-handle module
- `src/lib/review-blast-templates.ts` — category-tuned SMS templates
- `src/app/review-blast/[id]/page.tsx` + `ReviewBlastForm.tsx` — public submission UI
- `src/app/api/review-blast/submit/[id]/route.ts` — POST endpoint
- `src/app/api/review-blast/dispatch/route.ts` — daily cron (17:30 UTC)
- Updated `getReviewBlastWelcomeEmail()` to inject the magic link
- Updated `/api/webhooks/stripe` to capture upsell row ID + pass to welcome
- Updated `/api/inbound/sms` to detect + forward Review Blast replies

**Path additions to PUBLIC_API_PATHS in `src/middleware.ts`:**
- `/api/review-blast/submit/` (customer-facing POST, URL-as-secret)
- `/api/review-blast/dispatch` (Vercel cron, gated by CRON_SECRET)
- `/review-blast/` (customer-facing page, URL-as-secret)

**Vercel cron schedule:** `30 17 * * *` (17:30 UTC = 9:30am PT).
Sits AFTER funnel-run (16:00) + postcard-cron (17:00) so all the
regular SMS volume from those flows finishes first per Rule 30
(outbound commercial crons hit US business hours).

**Wave 2 candidates (post-A2P + initial customer feedback):**
- Operator dashboard with per-SMS delivery + reply tracking
- CSV upload alternative to paste-textarea
- Customer-name personalization (`{customerName}` token)
- Send-window picker (customer chooses business-hours window)
- Direct Google review link option (vs the 5-star filter we use today)

---

## Test Group Wave 1 — Full-Stack Outreach Test (Locked 2026-04-25)

The first controlled outreach test. Built so we can measure if the
full-stack channel mix is worth the per-prospect spend before scaling
it across the whole pipeline.

**Spec (locked by Ben 2026-04-25):**
- Cohort ID: `wave1-2026-04-25` (constant in `src/lib/test-cohort.ts`)
- 50 prospects, Pacific NW only (WA / OR / ID)
- 6 categories: dental, electrician, salon, landscaping, veterinary, roofing
  — auto-picked by `googleRating × log(reviewCount + 1)` quality score
- Manual prospects (Rule 49) excluded automatically
- Killer-site + franchise prospects (Rule 50) — gated by Ben's manual
  review of the dry-run output BEFORE commit
- **Channels:** email (current funnel + UTM `pitch_day0`) + ringless
  voicemail (Day 2 + 18 — already in funnel) + Lob postcard (Day 7 — new
  cron) + manual Loom for top 10 (Ben records)
- **NOT in Wave 1:** SMS (waiting on A2P 10DLC; Wave 2 add), Browserless
  video (parked due to OOM)
- **Launch gate:** flip after A2P 10DLC approval AND Lob live keys flipped
- **30-day window** → at Day 30, stop entirely (no auto-roll-forward)
- **Budget cap:** $300-500 total
- **Success bar:** ≥1 closed-paid (1% conversion of 50)
- **If < 1% by Day 30:** kill worst-performing channel, double best,
  run Wave 2 with revised mix

**Data model (migration `20260425_test_cohort.sql`):**
- `prospects.test_cohort_id TEXT` (nullable, indexed-where-set)
- `prospects.cohort_postcard_sent_at TIMESTAMPTZ` (dedupe key for postcard cron)
- `prospects.loom_video_url TEXT` (manual capture, drives email token)

**Endpoints:**
- `GET/POST /api/test-cohort/select` — dry-run by default. POST with
  `{ "confirm": true }` to commit. Override auto-pick with
  `{ "confirm": true, "prospectIds": [...] }`.
- `GET /api/test-cohort/[cohortId]` — full firehose stats JSON
- `GET/POST /api/test-cohort/postcard-cron` — daily cron (17:00 UTC) that
  fires Lob postcards for cohort prospects past Day 7. Mock-safe when
  `LOB_API_KEY` absent. forceTier:true bypasses the standard
  rating/review tier-gate (cohort selection already filtered for quality).

**Dashboard:** `/dashboard/test-group/[cohortId]` (e.g.
`/dashboard/test-group/wave1-2026-04-25`). Firehose: hero metrics
(paid / spent / projected ROI / CPA), email funnel breakdown,
postcards / Looms / VMs sent, status / category / state breakdowns,
action queues (Loom recording queue + postcard queue), per-prospect
table with day-since-enrollment + postcard / Loom status.

**Email integration:**
- `getPitchEmail()` reads `prospect.loomVideoUrl` and injects a
  "Quick 60-sec walkthrough I recorded for you: {loomUrl}" line above
  the preview URL. Cohort-only — never injected for prospects without
  the URL set, so non-cohort emails are unchanged.

**Launch checklist (run in this order, all gates must be GREEN):**

1. Apply the migration in Supabase SQL editor:

```sql
ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS test_cohort_id TEXT,
  ADD COLUMN IF NOT EXISTS cohort_postcard_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS loom_video_url TEXT;

CREATE INDEX IF NOT EXISTS prospects_test_cohort_id_idx
  ON public.prospects (test_cohort_id)
  WHERE test_cohort_id IS NOT NULL;
```

2. Dry-run the cohort selection (browser, while logged into dashboard):
   `https://bluejayportfolio.com/api/test-cohort/select`
   Inspect the JSON output — should show ~50 prospects across the 6
   categories. Reject any franchises or killer-site prospects.

3. Commit the cohort (curl from terminal with admin session cookie):

```bash
curl -X POST https://bluejayportfolio.com/api/test-cohort/select \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=YOUR_COOKIE" \
  -d '{"confirm": true}'
```

   Or to override the auto-pick with a hand-curated list:

```bash
curl -X POST https://bluejayportfolio.com/api/test-cohort/select \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=YOUR_COOKIE" \
  -d '{"confirm": true, "prospectIds": ["uuid1","uuid2","..."]}'
```

4. Verify cohort tag landed:

```sql
SELECT business_name, category, state, status
FROM public.prospects
WHERE test_cohort_id = 'wave1-2026-04-25'
ORDER BY category, business_name;
```

5. Verify A2P 10DLC approval is in (TCR campaign status = APPROVED) AND
   `LOB_API_KEY` env var is set to a `live_pub_*` value on Vercel.

6. Open the dashboard:
   `https://bluejayportfolio.com/dashboard/test-group/wave1-2026-04-25`

7. The cohort prospects will be auto-enrolled in the funnel by the
   16:00 UTC cron (Rule 47). At 17:00 UTC the postcard cron will
   queue postcards for any cohort prospects past Day 7. As Ben
   records Looms for the top 10, paste the Loom URL via:

```sql
UPDATE public.prospects
SET loom_video_url = 'https://www.loom.com/share/XXXXXXXX'
WHERE id = 'PROSPECT_UUID';
```

   The next outbound email pitch from the funnel will inject the Loom
   URL automatically.

**Wave 2 plan (post-A2P approval):**
- Add SMS to the channel mix
- Same 50-prospect-cohort structure, fresh cohort ID `wave2-YYYY-MM-DD`
- Reuse the same dashboard infrastructure
- Compare reply / paid rates against Wave 1 to isolate SMS contribution

---

### Locked-In Rule 55 — Stripe Env Vars Use `price_*` IDs, NEVER `prod_*` (NON-NEGOTIABLE)

Established 2026-04-25 during the LIVE flip. All 7 `STRIPE_PRICE_*`
env vars on Vercel were initially set to Product IDs (`prod_*`) instead
of Price IDs (`price_*`). Result: the $997 button silently 400'd with
"No such price: prod_xxx" while the installment $349 button worked
(it uses inline `price_data` and doesn't depend on these env vars).

**Why it happened:** the Stripe product detail page shows BOTH IDs
within ~200 pixels of each other — the `prod_*` Product ID at the top
of the page (header), and the `price_*` Price ID inside the "Pricing"
section card lower down. Both look like `xxx_XXXXXXXXXXXXXX`. Easy
copy-paste mistake.

**The rule:** every Stripe env var named `STRIPE_PRICE_*` MUST contain
a value starting with `price_`. NEVER `prod_`. The two IDs serve
different purposes:
- `prod_*` — the Product object (name, description, metadata, tax
  category). Useful for `stripe.products.retrieve()` calls.
- `price_*` — a specific Price + recurring-interval combination on
  that product. Required in checkout `line_items` and subscription
  creation.

**Verification:** the `/api/admin/env-check` endpoint includes a
`stripePricePrefixes` field that reports the prefix group of each
`STRIPE_PRICE_*` env var. After any Stripe env var change, hit the
endpoint and confirm every entry shows `"price"` (not `"prod"` or
`"other"` or `null` for vars that should be set).

**When adding a NEW SKU** (e.g., a new upsell or pricing tier):
1. Create the Product in Stripe — note the `prod_*` ID for reference
2. Inside that product, create a Price — note the `price_*` ID
3. Set the `STRIPE_PRICE_NEW_SKU` env var to the **`price_*` value
   only**
4. Add the new var name to the `STRIPE_PRICE_KEYS` list in
   `src/app/api/admin/env-check/route.ts` so the prefix audit covers it
5. Hit env-check, confirm the new entry shows `"price"`
6. Smoke-test the new checkout path before relying on it

**This rule extends to scripts:** any script that programmatically
creates Stripe checkout sessions (e.g., bulk-send promotion scripts,
email-attached checkout links) MUST validate price IDs with a
`startsWith("price_")` check before submitting to Stripe. Don't trust
hardcoded values in scripts — they tend to drift from the real
configuration.

### Locked-In Rule 51 — Runnable Code Must Be One-Click Copyable (NON-NEGOTIABLE)

Established 2026-04-25 by Ben. When giving Ben code, SQL, env vars, or
shell commands to run, the snippet MUST be presented in a single clean
fenced code block so most terminals/IDEs let him click-to-copy without
selecting text by hand.

**The format:**
- ONE fenced code block per runnable thing — no splitting it across
  paragraphs with explanation interleaved.
- NO leading prompt characters (`$`, `>`, `PS>`) inside the block.
- NO inline commentary inside the block — comments belong in the
  language's native comment syntax (`-- ...` for SQL, `# ...` for
  bash, etc.) so the whole thing pastes and runs as-is.
- NO truncation, no `...`, no "etc." inside the block — the snippet
  must be complete and ready to execute.
- Specify the language on the fence (`````sql, `````bash, `````ts) so
  syntax highlighting works.
- Put the explanation BEFORE the block ("Run this in Supabase SQL
  editor:") and verification steps AFTER the block — never inside it.

**Bad example (don't do this):**
```
First, run:
$ psql -c "ALTER TABLE prospects..."
Then run:
$ psql -c "SELECT * FROM..."
```

**Good example (always do this):**

Run this in Supabase SQL editor:

```sql
ALTER TABLE prospects ADD COLUMN manually_managed BOOLEAN DEFAULT false;

UPDATE prospects SET manually_managed = true
WHERE business_name ILIKE '%lewis county autism%';
```

Verify with:

```sql
SELECT business_name, manually_managed FROM prospects WHERE manually_managed = true;
```

**This applies to:** SQL migrations, env var blocks, bash one-liners,
PowerShell commands, npm/npx scripts, curl commands, JSON config
snippets — anything Ben needs to copy and execute.

**Exception:** when explaining a code pattern (not running it), inline
fragments and prose-interleaved snippets are fine. The rule applies to
RUNNABLE artifacts only.

---

## Mobile / Phone Session Rules — Building Static Sites (NON-NEGOTIABLE)

Ben sometimes builds sites from his **phone** (Claude mobile app). In
this context, stream idle timeouts occur constantly when generating
large files in a single response. Every session that involves building
or modifying a client static site MUST follow these rules.

### How to detect a phone session

Ben will say one of:
- "I'm on the phone"
- "I'm on my phone"
- "building from phone"
- "phone session"
- Or the conversation is happening in the Claude mobile app (visible
  from context — short messages, screenshot images, voice-style prose)

**When any of these signals are present, immediately switch to the
chunked-write strategy below for ALL file generation.**

### The stream idle timeout problem

Stream idle timeout = the AI's THINKING phase takes too long before
outputting the first token. This happens whenever Claude tries to plan
and then write a 200+ line file in one shot. The error is:

> API Error: Stream idle timeout — partial response received

This is NOT a network problem. It's a generation-length problem.
Spawning background agents does NOT fix it — agents hit the same limit.
Writing smaller files DOES fix it.

### The fix: chunked Python append writes (NON-NEGOTIABLE on phone)

Never use the `Write` tool to generate a large file in one call on a
phone session. Instead, use **`Bash` with Python append mode** to write
the file in sections of ~60–100 lines each:

```python
# FIRST chunk — open with 'w' (creates/overwrites)
python3 << 'PYEOF'
f = open('/home/user/bluejays/public/sites/[slug]/index.html', 'w')
f.write("""
... first 60-100 lines of content ...
""")
f.close()
print("chunk 1 done")
PYEOF

# SUBSEQUENT chunks — open with 'a' (append)
python3 << 'PYEOF'
f = open('/home/user/bluejays/public/sites/[slug]/index.html', 'a')
f.write("""
... next 60-100 lines ...
""")
f.close()
print("chunk 2 done")
PYEOF
```

**Rules for each chunk:**
- First chunk uses `open(..., 'w')` — creates the file
- All subsequent chunks use `open(..., 'a')` — appends
- Each chunk ends with `print("chunk N done")` so Claude can confirm
- Never put more than ~80 lines of HTML/CSS/JS in a single chunk
- Run chunks sequentially, waiting for "chunk N done" before the next
- After all chunks: verify with `wc -l filename` to confirm line count

### Static site file structure (for client sites)

All client static sites live at `/public/sites/[slug]/` and follow
this pattern (same as OPS site):

```
/public/sites/[slug]/
  index.html      — full HTML, all sections
  css/styles.css  — all CSS, custom properties, responsive
  js/main.js      — all JS wrapped in DOMContentLoaded
```

HTML asset paths use **absolute `/sites/[slug]/css/styles.css`** format
(not relative). This is how the OPS site does it and it works with
Next.js static file serving.

### Build order for a new static site

Always in this order — CSS and JS can be written in parallel but HTML
comes last (or references them at end of body):

1. Create directories:
   ```bash
   mkdir -p /home/user/bluejays/public/sites/[slug]/css
   mkdir -p /home/user/bluejays/public/sites/[slug]/js
   ```
2. Write `js/main.js` in chunks (smallest file, write first)
3. Write `css/styles.css` in chunks (medium file)
4. Write `index.html` in chunks (largest file, references the above)
5. Verify: `wc -l` all three files
6. Run: `npm run build` — must pass clean before committing
7. Commit + push

### Chunk size guide by file type

| File | Target lines/chunk | Typical chunk count |
|---|---|---|
| `js/main.js` | 80–120 lines | 2–3 chunks |
| `css/styles.css` | 80–100 lines | 6–8 chunks |
| `index.html` | 60–80 lines | 8–12 chunks |

### What NOT to do on a phone session

- ❌ Use the `Write` tool to generate 200+ lines of HTML/CSS in one call
- ❌ Spawn background agents to write large files (same timeout applies)
- ❌ Use 3 parallel agents for 3 large files (all three will timeout)
- ❌ Try to generate the file in one "smarter" prompt — the problem is
  generation length, not prompt quality
- ❌ Give up and tell Ben it can't be done — chunked writes always work

### Reference: The Pine & Particle site

The Pine & Particle Co. site (`/public/sites/pine-and-particle/`) was
built entirely with the chunked-write approach in April 2026 after
repeated stream timeouts killed every other approach. It's the proof
that this works. When in doubt, look at how those 9 HTML chunks and
6 CSS chunks were structured.

---

## Locked-In Rules — Session 2026-04-26 evening (audit funnel hardening)

These rules came out of the audit-funnel build session that shipped
commits `718d248` through `7b6fe47` on 2026-04-26. Each captures a
pattern that's now the default for similar problems.

### Locked-In Rule 56 — Validate Public Env Vars Before Mounting Scripts (NON-NEGOTIABLE)

Any `NEXT_PUBLIC_*` env var that gets injected into a `<script>` tag
or used as the source of an external resource URL (Meta Pixel, Google
Ads tag, Hotjar, Stripe.js, etc.) MUST run through a defensive
validator BEFORE the script mounts. The validator's job is to reject
copy-pasted-from-docs placeholder values that look syntactically
valid but reference non-existent IDs.

**Why:** when Ben configured the retargeting pixels (2026-04-26), he
pasted the docs-example values `1234567890123456` and `AW-XXXXXXXXXX`
literally. Without a validator, the next deploy would have injected
scripts that 404'd at Meta/Google, polluted the browser console with
invalid-pixel errors, and burned a few hundred ms of useless network
on every audit-page paint. The validator now silently rejects those
exact strings + any other obvious placeholder pattern.

**The pattern (used in `src/components/RetargetingPixels.tsx`):**

```ts
function isValidMetaPixelId(v: string | undefined): v is string {
  if (!v) return false;
  const trimmed = v.trim();
  if (!/^\d{15,16}$/.test(trimmed)) return false;
  if (trimmed === "1234567890123456" || trimmed === "0000000000000000") return false;
  return true;
}

const META_PIXEL_ID = isValidMetaPixelId(RAW_META_PIXEL_ID) ? RAW_META_PIXEL_ID : undefined;
```

**Required for every new public env var:**
1. A regex shape check (length, character class, prefix)
2. An exact-match blacklist of known docs-example strings
3. A dev-mode `console.warn` so misconfigured values are LOUD, not silent
4. A graceful fallback (treat as if the env var was unset) so the
   page still renders cleanly

**Apply to:** any tracking pixel (Meta, Google, Hotjar, LinkedIn,
Pinterest, TikTok), any third-party widget script (Stripe Elements,
Calendly embed, chat widgets), any analytics SDK that takes a key in
the URL.

**Don't apply to:** server-side env vars (`STRIPE_SECRET_KEY` etc.) —
those validate at use-time via the API call itself. Rule 56 is about
pre-mount validation for client-side script injection specifically.

### Locked-In Rule 57 — 3-CTA Hub Pattern for Lead-Magnet Conversion Surfaces

When a prospect reaches the conversion surface of any lead-magnet
funnel (audit, free preview, free strategy session, free template
download, etc.), the page MUST present THREE forks of intent —
ascending in commitment but each capturing the lead — instead of a
single "Buy now" CTA.

**The Hormozi pattern ("stack the slip"):**
1. **High-intent fork** — the immediate paid conversion ("Fix it now"
   → Stripe checkout). Most popular badge.
2. **Medium-intent fork** — a phone/video commitment ("Schedule a
   call" → /schedule/[id]). Captures warm leads who need more info.
3. **Low-intent fork** — a slow-yes lead capture ("Get my free
   preview" → POSTs to backend, alerts Ben). Captures the "not ready
   to buy or talk" prospects who'd otherwise bounce, and gives Ben a
   second swing at them.

**Why three:** a single CTA forces a binary yes/no. Three CTAs let
the prospect pick their own commitment level, and they're 3× more
likely to pick ONE of three options than to pick a single forced
choice. Reference implementation: `src/app/audit/[id]/AuditCTAHub.tsx`.

**Visual rules:**
- All three cards same size, equal weight on the page
- High-intent fork gets a "Most Popular" or similar amber badge
- Each card has: icon → title → headline number → 1-line value prop
  → 1-line trust line → CTA button
- Trust strip below all 3 cards (money-back, delivery time, no fees)
- Secondary fallback option (e.g. "Or pay $997 once") as a small text
  link below the cards — discoverable but doesn't crowd the trio

**Backend contract for the low-intent fork:**
- Endpoint MUST be idempotent (re-clicking returns ok:true +
  already:true without re-firing the SMS alert)
- Marks prospect with `manually_managed=true` (Rule 49) so the
  auto-funnel skips them — Ben handles them personally
- Sends owner-alert SMS with biz name + audit URL + dashboard link
- Persists state BEFORE firing the SMS (Rule 43)

### Locked-In Rule 58 — Auto-Suggest Defaults at Page Load (NOT on Field Submit)

Any onboarding / form flow where we can pre-fill a field via API
call MUST fire the API call at page-mount time, not at field-blur or
form-submit time. The picks should already be on screen by the time
the user scrolls down to that field.

**Why:** every additional click is a drop-off. If the user has to
type a business name and then click "Get suggestions", we lose a
percentage of users at the click step. Firing on mount means the
moment they see the field, the picks are already there.

**Reference implementation:** auto-domain suggestions in onboarding
Step 1 (`src/app/onboarding/[id]/page.tsx`). On mount the page fires
`/api/domain-suggestions/[id]`, displays a spinner while loading,
swaps to 3 radio-style domain picks the moment the API resolves.

**Pattern:**
1. Fire the API call from a `useEffect` keyed only on `prospectId`
   (NOT on any user input — page-load means page-load)
2. Show a loading state (spinner + "Checking…" message) while the
   call is in flight
3. Render the picks as easy one-click buttons + ALWAYS-on text input
   as escape hatch for "I want a different one"
4. The endpoint loads its data server-side (don't depend on a
   protected `/api/prospects/[id]` route returning 200 to unauth
   customers)

**Apply to:** anywhere we can show a smart default — domain picks,
brand colors (sample from the existing site), business hours
(default to category norms), service lists (prefill from scrape),
testimonials (prefill from Google reviews scrape).

### Locked-In Rule 59 — Deterministic Math for Trust-Sensitive Numbers (NOT AI)

Any number we show to a customer that anchors a buying decision
(money-leak estimate, recovery projection, lead-value chip,
testimonial-implied results) MUST be computed by a deterministic
formula, NOT an AI prompt. The formula's inputs (vertical avg
customer value, conversion lift %, close rate) live as named
constants the operator can tune.

**Why:** AI numbers vary across runs. The same prospect re-running
the audit could see "+$5,100/mo" once and "+$8,200/mo" the next time
— that variance kills trust instantly. Deterministic = same input →
same number, every time. Customers can re-run the audit, screenshot
both, and the numbers match.

**Reference implementations** (`src/lib/site-audit.ts`):
- `estimateMoneyLeak()` — vertical avg × monthly visitors × lift %
  × 0.7 safety margin
- `recoveryProjection.totalMonthly` — leak × `RECOVERY_CAP_PERCENT`
  (0.60 — conservative)
- Per-fix recovery — severity-weighted share of total recovery pool
- Leads vs customers translation — `DEFAULT_CLOSE_RATE` = 0.4

**The rules:**
1. Constants at the top of the file with comments explaining the
   source / why this number (industry benchmark, conservative bias,
   Hormozi research deliverable, etc.)
2. Round to nearest $50 / nearest 5% / similar so the numbers feel
   deliberate not algorithmic
3. Apply a safety margin (0.6×–0.7×) so we ALWAYS underclaim
4. Document the methodology to the customer (footnote text under
   the big number) — transparent math earns trust
5. NEVER let the AI prompt suggest numbers. The AI generates copy
   ABOUT the deterministic numbers.

**Apply to:** money-leak math, recovery math, "you'll get X new
customers" claims, ROI calculators, before/after metrics, anything
the customer might screenshot and forward to their accountant.

### Locked-In Rule 60 — Auto-Improvement Loops Need Dormancy Gates

Any cron that uses AI to analyze data and suggest improvements
(prompt tuning, ad copy generation, email subject A/B tests,
retargeting audience optimization) MUST have a minimum-data
dormancy gate that prevents it from running until the dataset is
big enough for the AI's analysis to be meaningful.

**Why:** AI analyzing 3 audits + 0 paid customers is just noise
generation. The model will confabulate trends from random variance
and suggest "improvements" that are statistically meaningless. Worse,
those suggestions get rolled out as A/B tests, polluting the dataset
further. Dormancy guards against this.

**Reference implementation:** Hyperloop cron (`src/app/api/hyperloop/run/route.ts`).
Two thresholds at top of file as named constants:

```ts
const MIN_READY_AUDITS_TO_WAKE = 100;
const MIN_PAID_CUSTOMERS_TO_WAKE = 5;
```

Below either threshold → log a `dormant` heartbeat row in
`hyperloop_runs` + return gate-reason without firing the AI call.

**The rules:**
1. Dormancy thresholds as named constants the operator can tune
2. Heartbeat insert on every tick (active OR dormant) so we have
   continuous evidence the cron is firing on schedule
3. `gate_reason` field on the runs table explains WHY this tick was
   dormant
4. Active path stays minimal at first (Day-1 = log + obvious-loser
   retirement only). Claude-suggested-new-variants step lands as a
   follow-up commit AFTER signal exists
5. The gate constants stay editable — bumping `MIN_PAID_CUSTOMERS_TO_WAKE`
   from 5 to 50 once we have data is just a one-line change

**Apply to:** any future AI-driven optimization cron — ad-copy
generator, email-subject A/B test cron, prompt-tuning loop,
audience-segment generator, scheduling-optimizer.

### Locked-In Rule 61 — 3rd-Grade Reading Level for Customer-Facing AI Output

All AI prompts that generate text for the customer-facing audit, or
any future customer-facing AI surface, MUST enforce 3rd-grade reading
level via TWO hard constraints in the prompt:

1. **Banned words** list — the explicit jargon that fails (`optimize`,
   `leverage`, `enhance`, `streamline`, `maximize`, `utilize`,
   `facilitate`, `sub-optimal`, `prioritize`, `conversion`,
   `methodology`, `UX`, `above-the-fold`, `social proof`,
   `positioning`, `V2`, `template`, `tag`)
2. **Yes words** list — concrete verbs the model is encouraged to
   use instead (`fix`, `swap`, `drop`, `slow`, `fast`, `big`, `small`,
   `lose`, `win`, `miss`, `beat`, `grab`, `lift`, `sink`)

PLUS a sentence-length cap (~12-20 words per sentence) and a
"if a 9-year-old can't read it out loud and get it, rewrite it"
acceptance criterion.

**Why:** Hormozi-research-validated. SMB owners read at ~7th-grade
level on average; 3rd-grade hits universally. Any jargon costs
comprehension AND trust simultaneously.

**Reference:** `buildHeroPrompt()` + `buildTechnicalPrompt()` in
`src/lib/site-audit.ts`. Same banned/yes lists in both prompts so
output style stays consistent across Claude + GPT.

**Static UI copy follows the same rules:**
- Section headers: "Top of Your Page" not "Hero & Above the Fold"
- Buttons: "Fix it now" not "Initiate purchase"
- Tooltips, error messages, form labels — all 3rd-grade

**Defensive render-time stripper:** for legacy data already
generated under older prompts, ship a render-time `stripJargon()`
helper (see `src/app/audit/[id]/page.tsx`) that catches the most
common offenders. New audits won't generate jargon (prompt
enforcement); old audits in Supabase get cleaned at render.

### Locked-In Rule 62 — Lob Postcards Target High-Intent Self-Identifiers

Lob postcards cost ~$1.20 each. Per-prospect economics only work
when the recipient has already self-identified as warm — not on a
cold list, not on a list of "scraped potential prospects".

**The rule:** Lob postcard crons MUST gate by EXPLICIT high-intent
signal:
1. The prospect performed an opt-in action (submitted an audit form,
   clicked through a preview link, replied to email)
2. AND has a quality bar (4.5★+ rating, established business)
3. AND hasn't already taken the next-step action (paid, booked,
   requested preview)
4. AND is past the silent-rejection window (5+ days from the
   self-identifying action)
5. AND `manually_managed = false` (Rule 49 — never auto-touch)
6. AND `<column>_postcard_sent_at IS NULL` (idempotent — never
   re-send to the same person)

Reference implementation: `/api/audit/postcard-cron/route.ts`
(2026-04-26). Targets prospects who submitted an audit AND have
4.5★+ AND haven't acted in 5 days. Migration adds a per-trigger
`audit_postcard_sent_at` column distinct from
`cohort_postcard_sent_at` so the two crons don't fight.

**NEVER fire postcards at:**
- Cold-scraped prospect lists (no opt-in signal)
- Anyone with manually_managed=true (Ben handles personally)
- Prospects below the rating bar (cost vs. expected close rate)
- Anyone already in the funnel's later stages (paid, booked, dismissed)

**Schema pattern for new postcard crons:**
- New `<trigger>_postcard_sent_at TIMESTAMPTZ` column on prospects
- Partial index `WHERE that_column IS NULL` (cron's hot path)
- Stamp on success AND on permanent-skip (no_address, below_tier,
  already_sent) so the cron doesn't keep retrying tomorrow
- Don't stamp on transient-error skips (so retries work next tick)

---

## Locked-In Rules — Session 2026-04-27 (Stage-2 Hyperloop hardening)

These came out of the adversarial Hormozi review of the Hyperloop
self-improving ad system. Each captures a class of failure that's
expensive in money OR debuggability.

### Locked-In Rule 63 — Cost caps protect the EXPENSIVE thing, not the cheap one (NON-NEGOTIABLE)

When building any AI-driven autonomous system that triggers downstream
spend on a paid platform (ads, registrar fees, API mailings, infra),
the cost cap MUST bound the largest downstream cost surface, NOT just
the AI/inference cost.

**Why this rule exists:** Hyperloop v1 had a $50/wk cap on Anthropic
credits but ZERO cap on the platform-side ad spend it could trigger.
Claude could generate 10 bad-tone variants for $0.20 in credits and
Hyperloop would auto-roll-out all 10 to Meta + Google, where the
combined daily ad budgets (e.g. $50 Meta + $50 Google = $100/day)
would burn ~$700 over the 7-day analysis window before the Bayesian
loop could pause them. **The cheap input was capped; the expensive
output wasn't.**

**The rule:**
1. For every autonomous loop that creates downstream spend, identify
   the single largest dollar leak surface (usually NOT the AI cost).
2. Add a cap on THAT surface FIRST. AI cost cap is secondary.
3. The cap belongs at the ENTRY of every cron tick — read current
   spend (from internal logs OR platform API) and short-circuit
   variant generation/rollout if cap is breached.
4. Make the cap configurable from a DB row (`hyperloop_config`,
   `system_settings`, etc.) so Ben can adjust without redeploy.
5. Surface week-to-date spend on the operator dashboard as a
   progress bar against the cap, color-graded (green/amber/red).

**Apply to:** any future "AI generates → platform creates → platform
spends" loop. Same shape: ad gen, content posting, programmatic
outreach, automated marketplace listings.

### Locked-In Rule 64 — Mock implementations must self-flag at the data layer (NON-NEGOTIABLE)

Any mock client that returns data which gets persisted (mock ad IDs,
mock user IDs, mock domain IDs, etc.) MUST include a sentinel prefix
(`mock_`) in those values. The cron/route writing the data MUST
detect mock-prefixed values and refuse to persist them when env
configuration says we're in LIVE mode for that platform.

**Why this rule exists:** mock-mode pollution is silent and
catastrophic. If a deploy ever runs with one platform configured
(LIVE) but another not yet configured (mock), the mock client
happily returns `mock_meta_ad_xxx` strings, the cron stamps them
into `platform_ad_id` columns, and the next sync hits the real
Meta API with `mock_meta_ad_xxx`, gets a 400, logs `[ERROR]`, and
the row is broken forever. Manual SQL cleanup required.

**The rule:**
1. Every mock client returns a value with `mock_` prefix on any field
   that gets persisted to a column whose name reads as a foreign-key
   to the platform (`platform_ad_id`, `stripe_customer_id`,
   `namecheap_order_id`, etc.).
2. Every route/cron that PERSISTS such a value MUST call a guard
   helper (e.g. `isSafeAdId()`) before INSERT/UPDATE.
3. The guard returns `true` ONLY when EITHER:
    - the value is non-mock (no `mock_` prefix), OR
    - ALL relevant platforms are unconfigured (i.e. we're fully in dev mode)
4. On guard failure: `console.error()` with a clear message naming
   the env var that should be set, and SKIP the persist (don't crash
   the cron — just refuse the dirty write).

**Reference:** `isSafeAdId()` in `src/app/api/hyperloop/run/route.ts`.

**Apply to:** any new platform integration that has a mock fallback
+ persistent state. Same shape: domain registrar, payments, email
service providers, SMS providers, file storage providers.

### Locked-In Rule 65 — Every platform API mutation must have a retry-on-orphan path (NON-NEGOTIABLE)

If a cron creates a row in our DB and ALSO mutates external state
(creates an ad on Meta/Google, registers a domain, sends a postcard,
fires a payment), the cron MUST have a separate retry pass at the
NEXT tick that finds rows in inconsistent state (DB row exists but
external write didn't land) and retries the external mutation
idempotently.

**Why this rule exists:** Without retry, network blips become
permanent orphans. A single Meta 429 during rollout means the variant
lands in `hyperloop_variants` with no `platform_ad_id`. The cron's
existing rollout-step only fires for FRESHLY generated variants, not
older orphans. Sync skips the variant (no platform_ad_id to query).
Bayesian sees 0 impressions, parks it as 'insufficient_data', forever.
The variant is invisible to every subsequent cron tick.

**The rule:**
1. At the START of every cron that creates DB rows + external state,
   add an "orphan retry" pass:
    - Query rows where DB exists, external write missing, age >
      threshold (typically 1 hour)
    - For each, retry the external mutation
    - On success: stamp the missing field
    - On error: log + leave for next tick
2. The retry must be idempotent — calling the platform API twice
   for the same logical operation must not duplicate state on the
   platform side.
3. Surface orphan-retry stats in the run summary so Ben sees if a
   particular orphan keeps failing (signals deeper API issue).

**Reference:** orphan-retry pass at top of active path in
`src/app/api/hyperloop/run/route.ts`. Retries variants where
`status='active' AND kind in (ad_copy_meta, ad_copy_google) AND
platform_ad_id IS NULL AND created_at < now() - 1 hour`.

**Apply to:** any future cron that does the "create DB row →
external mutation" two-step. Domain registration, postcard send,
ad creation, Stripe customer creation, etc.

### Locked-In Rule 66 — Every cron must have a heartbeat alert path (NON-NEGOTIABLE)

A daily check MUST alert Ben if any expected cron hasn't logged a
row in N×schedule_period (e.g. weekly cron without a run in 8 days,
daily cron without a run in 36 hours, per-minute cron without a run
in 5 minutes). Silent crons are systemic disasters that go undetected
for weeks.

**Why this rule exists:** Vercel cron platform issues, env-var
deletions, Supabase RLS changes, Stripe key rotations, A2P 10DLC
revocations — any of these can silently break a cron. Without a
dedicated heartbeat check, the failure is invisible until the
downstream impact (e.g. "no audits getting generated", "no welcome
emails sent") is noticed manually. By that point you've burned days
of pipeline time.

**The rule:**
1. EVERY cron (scheduled task, weekly Hyperloop, daily renewal
   check, hourly digest, per-minute reply processor) MUST log a row
   in a runs/heartbeat table at the END of every tick — including
   ticks where the cron decided to no-op.
2. A separate watchdog cron (daily) MUST check each expected cron's
   most recent heartbeat row. If older than the threshold, SMS Ben
   via `sendOwnerAlert()` with the cron name + last-seen timestamp.
3. Watchdog thresholds default to 2× the cron's schedule period
   (e.g. weekly cron → 14-day threshold). Tunable per-cron via
   config row.
4. Watchdog's own failure must also alert (canary problem) — make
   the watchdog itself a tick-counted cron that logs to a
   `watchdog_runs` table the same way.

**Reference (built 2026-04-26):** `/api/watchdog/run` (daily 13:00 UTC,
self-logs to `watchdog_runs`) scans 18 entries in `WATCHED_CRONS`. As
of commit 57771f1, every cron in `vercel.json` writes a `cron_heartbeats`
row at end-of-success via `logHeartbeat(cron_name, metadata)`, and the
watchdog scans by `cron_name` filter. Stale heartbeats SMS Ben.

**Still open (canary-of-canary):** the watchdog itself logs to
`watchdog_runs` every tick, but nothing reads that table for staleness.
A second-level "watchdog-watcher" or external uptime monitor would
catch the case where the watchdog cron itself silently fails.

**Apply to:** every existing + future cron. Audit `vercel.json`
crons periodically — any cron without a corresponding heartbeat-table
INSERT is a silent-failure risk.

---


---

## Daily Task System — 30-Day Growth Ramp (started 2026-04-28)

**HOW TO USE:** When Ben asks "what are my daily tasks?" or "what should I do today?", calculate `currentDay = (today - 2026-04-28) + 1` (capped at 30 for day-specific tasks, the three permanent habits continue forever). Then present tasks in this format:

```
## Today's Tasks — Day [N] ([date])

### GROWTH RAMP
[day-specific tasks from the schedule below]

### PERMANENT DAILY HABITS (every day, no exceptions)
- [ ] Warm Outreach / Referral follow-ups (20 min)
- [ ] 1 LinkedIn post (30 min) — see content ideas by week below
- [ ] 1 Instagram post (15 min) — repurpose the LinkedIn post, vertical format
- [ ] Affiliate check (10 min) — reply to any affiliate replies, follow up open conversations
- [ ] Pipeline review: approve previews, reply to engaged leads (20 min)
```

Always show the GROWTH RAMP category first, then PERMANENT DAILY HABITS. Never merge them. Always include checkboxes.

---

### Permanent Daily Habits (115 min/day — run forever past Day 30)

| Habit | Time | Target |
|---|---|---|
| Warm outreach / referral follow-ups | 20 min | Days 1-14: 10 new personal contacts/day. Days 15-21: follow up open conversations only. Day 22+: pure relationship mode — respond and nurture. |
| LinkedIn post | 30 min | One post per day. Use content ideas by week below. Never skip. |
| Instagram post | 15 min | Repurpose the LinkedIn post — same message, vertical format. Reels perform best. Never skip. |
| Affiliate check | 10 min | Reply to any affiliate replies that came in. Follow up open affiliate conversations. Days 1-30: also track who hasn't replied yet and re-approach. |
| Pipeline review | 20 min | Approve pending-review previews, review AI reply drafts, personally reply to any engaged lead (clicked preview or submitted /audit). |

**Email volume targets (auto-send — just verify it's running):**
- Days 1-7: 10/domain/day = 20 total
- Days 8-14: ~50/domain/day = 100 total
- Days 15+: 100/domain/day = 200 total (hold indefinitely)

---

### Week 1 Day-Specific Tasks (Days 1–7)

**Day 1:**
- Compile your full warm contact list (target 100+ names: friends, family, ex-coworkers, gym, church, neighbors, anyone who knows a business owner)
- Publish origin post on LinkedIn: "I'm building websites for local businesses using AI. Here's why."
- Add /audit link to every email signature
- Approve 3–5 prospects in dashboard

**Day 2:**
- Send 10 personal warm messages (use script below — NOT the cold email)
- Post LinkedIn: before/after screenshot of one V2 preview + one line of caption
- Review any overnight email replies

**Day 3:**
- Send 10 more warm messages
- Post LinkedIn: "The local business website problem" — describe the gap you're solving in one paragraph
- Approve pipeline batch
- Draft your referral program one-pager ($150 cash per closed referral)

**Day 4:**
- Follow up any Day 2 warm contacts who replied
- Post LinkedIn: one real pipeline stat (e.g. "Sent 60 emails this week. 3 people clicked their preview.")
- Identify 5 potential affiliate partners: local SEO agency, Google/Meta ad freelancer, business coach, accountant, print shop

**Day 5:**
- Send 10 more warm messages
- Post LinkedIn: "Here's how I find businesses with outdated websites" — describe the Google Places scout process plainly
- Check email open rates — is subject line hitting >25%?

**Day 6:**
- Send 10 more warm messages
- Post LinkedIn: category story — "I built a site for a [dental/electrician/salon] in [city] before they knew I existed."
- Approve pipeline batch

**Day 7 (weekly review):**
- Send 10 more warm messages
- Post LinkedIn: Week 1 numbers post — emails sent, open rate, preview clicks, conversations started
- Weekly review checklist: email open rate >30%? Pipeline healthy? 50 warm messages sent this week?

---

### Week 2 Day-Specific Tasks (Days 8–14)

**Day 8:**
- Send 10 warm messages + follow up any Week 1 non-responders
- Post LinkedIn: "What makes a $997 website worth it" — show the 10 sections the V2 templates include
- Check domain warming stats — both domains healthy?
- Personally text Steadfast Plumbing (360) 797-2979 — warm human call, not the cold email script

**Day 9:**
- Send 10 warm messages
- Post LinkedIn: screenshot your dashboard stats (sites built, pipeline count) — transparency builds trust
- Reach out to the first affiliate target from Day 4 (personal email, not cold)

**Day 10:**
- Send 10 warm messages
- Post LinkedIn: "One thing every local business website is missing" — give real actionable value, no pitch
- Add the $100 referral incentive to the NPS promoter email (Rule 44 in codebase)

**Day 11:**
- Follow up any Day 2-3 warm contacts who showed interest
- Post LinkedIn: address a real objection you've received ("I already have a website" → your reframe)
- Text Sequim Valley Electric (360) 681-3330

**Day 12:**
- Send 10 warm messages
- Post LinkedIn: "The hardest part about cold pitching local businesses" — honest and relatable
- Follow up the 5 affiliate targets identified on Day 4

**Day 13:**
- Send 10 warm messages
- Post LinkedIn: before/after (different category than Week 1)
- Weekly email performance review

**Day 14 (warmup milestone):**
- 100 warm messages sent total across 2 weeks — relationship mode begins
- Post LinkedIn: 14-day update — real numbers, real honesty
- PRIMARY DOMAIN WARMUP COMPLETE — verify 100/day sending is active
- Milestone check: open rate target hit? First reply conversations? LinkedIn getting traction?

---

### Week 3 Day-Specific Tasks (Days 15–21)

Email volume now at 200/day. Focus shifts to optimizing the bottleneck.

**Day 15:**
- Shift warm outreach: stop cold personal messages, start following up everyone who showed interest in Weeks 1-2
- Post LinkedIn: feature one specific V2 showcase with link — "This is what a [category] site should look like."
- Identify the #1 funnel bottleneck (open rate → click rate → claim page → checkout — which step is weakest?)
- Build the affiliate partner page at /partners: one paragraph, the $150 offer, a simple form

**Day 16:**
- 5 targeted warm follow-ups (quality over quantity)
- Post LinkedIn: "I sent 200 cold emails yesterday. Here's what came back." — real data
- Reach out to 3 more affiliate targets with the /partners link

**Day 17:**
- Follow up any referral intros received from warm outreach
- Post LinkedIn: educational value post — teach something about local SEO or web design a business owner would use
- Full reply queue review

**Day 18:**
- Post LinkedIn: social proof — if you have a paid client, share it (anonymized or with permission). If not, share a real preview reaction.
- Implement one change at the identified bottleneck (subject line test, claim page headline test, email opener variant — ONE THING ONLY)

**Day 19:**
- Post LinkedIn: "The business category I'm most excited to build for" + showcase link
- Start tracking the bottleneck change from Day 18 — open a note to record results daily

**Day 20:**
- Post LinkedIn: Week 3 numbers — impressions, emails sent, open conversations
- Follow up all open affiliate conversations

**Day 21 (first paid client target):**
- Post LinkedIn: Month 1 halfway point — what's working, what isn't
- Weekly review: if no paid client yet, audit the claim page flow in incognito — is there friction you're not seeing?
- Confirm referral incentive is live in NPS emails

---

### Week 4 Day-Specific Tasks (Days 22–30)

Lock in habits. Optimize. Let compound effects build.

**Day 22:**
- Follow up all open warm conversations
- Post LinkedIn: "The affiliate program — if you know local business owners, here's how to make $150 per referral"
- Check bottleneck test results from Day 18 — is the metric moving?

**Day 23:**
- Post LinkedIn: deep-dive on one premium feature (comparison table, interactive quiz, Google review header) — teach it like you're showing a business owner what they're getting

**Day 24:**
- Post LinkedIn: repurpose your best-performing Week 1 post with updated data
- Walk any active affiliate partners through the referral process personally

**Day 25:**
- Post LinkedIn: "Month 1 of BlueJays. What I learned." — full transparency post. This one should be long.
- Implement bottleneck test #2 (different variable from Day 18)

**Day 26:**
- Post LinkedIn: one category-specific post for the vertical you're pitching most this week

**Day 27:**
- Post LinkedIn: "How the AI pipeline works in 5 steps" — process transparency for marketers/builders in your audience

**Days 28–30 (Month 1 close):**
- Post LinkedIn: 30-day final numbers post — every metric, every lesson. This post will perform well.
- Clear entire reply queue — respond to every engaged lead personally
- Full month review against targets (see below)
- Plan Month 2: which channel showed the most traction? Double it.

---

### Warm Outreach Script (Days 1–14, personal text/DM — NOT the cold email)

> "Hey [name] — I started a company building premium websites for local businesses. I build the site first and show it to them before asking for anything. Do you know any business owner whose website looks outdated? I'll build theirs for free to show what I do. No pressure at all."

When they reply with a name: ask for a three-way text introduction. "Could you intro us over text? That way I can follow up directly."

---

### LinkedIn Content Ideas by Week

**Week 1 — Origin and Problem:**
origin story, before/after visual, the local business website gap, pipeline stat, how I find businesses, category story, Week 1 numbers

**Week 2 — Value and Process:**
what makes the $997 worth it, dashboard stats transparency, one thing every website is missing, objection reframe, the hardest part of cold pitching, before/after (new category), 14-day update

**Week 3 — Proof and Education:**
V2 showcase feature, real email results data, local SEO teaching post, social proof / reaction, favourite category + link, Week 3 numbers, halfway point reflection

**Week 4 — Scale and System:**
the affiliate program, premium feature deep-dive, repurpose best Week 1 post, Month 1 full transparency, category-specific pitch week post, how the pipeline works, 30-day final numbers

**Universal rules for every post:**
- Specific numbers always beat vague claims ("3 out of 47 replied" beats "some people responded")
- Before/after visuals are the highest-performing format — use them whenever possible
- End every post with one question to drive comments
- Never pitch in the post body — let the content pull people to your profile where the /audit link lives

---

### Day 30 Success Targets

| Metric | Minimum | Strong |
|---|---|---|
| Total cold emails sent | 3,000 | 4,500+ |
| Warm messages sent | 100 | 150+ |
| LinkedIn posts | 30 | 30 |
| LinkedIn impressions | 5,000 | 15,000+ |
| Open prospect conversations | 15 | 40+ |
| Affiliate partners active | 2 | 5+ |
| Paid clients | 1 | 3–5 |
| Revenue | $997 | $3,000+ |

If Day 30 lands below minimum on paid clients: do NOT add new channels. Audit the claim page in incognito, personally call every prospect who clicked the preview link but didn't claim, and run one more week before expanding. The bottleneck is conversion, not volume.

---

### The Compounding Flywheel (reference when explaining progress to Ben)

```
Warm Outreach ──► First clients ──► Testimonials ──► Social proof
                                                          │
Cold Email ───► Preview clicks ──► Claim page ──► Revenue │
                                                          │
Content ──────► Inbound DMs ───► Warm leads ─────────────┘
                     │
                     └──► Affiliates find you ──► Passive lead flow
```

After Day 30, every channel feeds every other channel. The goal of Month 1 is to start all three flywheels spinning. Month 2 is where they start pulling each other.

---

## 6-Month Marketing Ramp Plan (started 2026-04-28)

This extends the 30-day ramp into a full 6-month machine. Each month builds on the last. The five permanent daily habits (LinkedIn post, Instagram post, warm outreach/referrals, affiliate check, pipeline review) NEVER stop — they are the spine of everything.

At the start of each session, calculate what month Ben is in:
- Month 1: Days 1–30 (2026-04-28 to 2026-05-27)
- Month 2: Days 31–60 (2026-05-28 to 2026-06-26)
- Month 3: Days 61–90 (2026-06-27 to 2026-07-26)
- Month 4: Days 91–120 (2026-07-27 to 2026-08-25)
- Month 5: Days 121–150 (2026-08-26 to 2026-09-24)
- Month 6: Days 151–180 (2026-09-25 to 2026-10-24)

Show Ben which month he's in and what the focus is. Ask about the three daily habits every single session.

---

### Month 1 — PLANT (Days 1–30, 2026-04-28 to 2026-05-27)

**Theme:** Build the machine. Send the emails. Post every day. Show up before results exist.

**Daily habits (115 min/day):**
- LinkedIn post (30 min)
- Instagram post (15 min)
- Warm outreach / referral messages (20 min)
- Affiliate check (10 min)
- Pipeline review (20 min)

**Email volume:**
- Days 1–7: 20/day (10/domain)
- Days 8–14: 100/day (50/domain)
- Days 15+: 200/day (100/domain)

**Month 1 milestones:**
- [ ] 100 warm messages sent
- [ ] 30 LinkedIn posts published
- [ ] 30 Instagram posts published
- [ ] 19 affiliate partners contacted (DONE Day 1)
- [ ] 2+ affiliates replied and engaged — follow up every session
- [ ] LinkedIn + Instagram accounts live (DONE Day 1)
- [ ] 3,000+ cold emails sent
- [ ] 1 paid client minimum ($997)

**Month 1 content themes:**
- Week 1: origin story, the local biz website gap, pipeline stats
- Week 2: what makes the $997 worth it, objection reframes, process transparency
- Week 3: V2 showcase features, real email data, educational value
- Week 4: affiliate program, 30-day full numbers post

**Month 1 end targets:**

| Metric | Minimum | Strong |
|---|---|---|
| Cold emails sent | 3,000 | 4,500+ |
| Warm messages sent | 100 | 150+ |
| LinkedIn posts | 30 | 30 |
| LinkedIn impressions | 5,000 | 15,000+ |
| Instagram posts | 30 | 30 |
| Affiliate partners active | 2 | 5+ |
| Paid clients | 1 | 3–5 |
| Revenue | $997 | $3,000+ |

---

### Month 2 — WATER (Days 31–60, 2026-05-28 to 2026-06-26)

**Theme:** Double down on what got replies. Let the flywheel start turning. Your first clients become your first testimonials.

**New actions this month:**
- Follow up EVERY affiliate contact from Month 1 — anyone who opened but didn't reply gets a second touch
- Collect first testimonials from any paid clients (video preferred, written fine)
- Post testimonials/results on LinkedIn and Instagram — real proof performs better than any other content
- Add Instagram Reels: repurpose your best LinkedIn posts as 30-second vertical videos
- Flip `ENABLE_HTML_PITCH_EMAIL=true` on Vercel (domains are warmed — HTML email with preview screenshot unlocks)
- If open rate is below 25%, test 3 new subject lines this month — run each for 5 days before calling it
- Follow up all 19 affiliate emails with a second personal touch (phone or email)
- Add Google Business Profile for BlueJays (30 min, compounds forever)

**Daily habits (same 115 min/day — never changes):**
- LinkedIn post
- Instagram post
- Warm outreach / referral follow-ups
- Affiliate check
- Pipeline review

**Email volume:** 200/day stable (100/domain)

**Month 2 content themes:**
- Week 1: first client result (anonymized if needed), affiliate program, email stats update
- Week 2: "Here's what 60 days of cold email taught me", showcase deep-dives
- Week 3: repurpose best Month 1 posts with updated data, objection handling posts
- Week 4: 60-day numbers, what's working, what's not

**Month 2 targets:**

| Metric | Minimum | Strong |
|---|---|---|
| Cold emails sent | 6,000 | 9,000+ |
| Affiliate referrals received | 1 | 3+ |
| LinkedIn followers gained | 100 | 300+ |
| Instagram followers gained | 50 | 200+ |
| Testimonials collected | 1 | 3 |
| Paid clients this month | 2 | 5 |
| Cumulative revenue | $2,000+ | $6,000+ |

---

### Month 3 — SPROUT (Days 61–90, 2026-06-27 to 2026-07-26)

**Theme:** The machine should be running. Your job this month is to find the bottleneck and eliminate it. One fix to the weakest stage compounds across everything else.

**New actions this month:**
- Run a full funnel audit: open rate → click rate → claim page → checkout. Find the single weakest link and fix only that
- Add LinkedIn Sales Navigator ($79/mo) — reach decision-makers directly, not just cold email
- Add Apollo.io ($30/mo) — enrich prospect data, find LinkedIn profiles of business owners
- Enable Lob postcards for Day 7 cohort (high-intent prospects only — 4.5★+ rating)
- Start 1 new outreach channel: either LinkedIn DMs OR outbound voice calls (pick one, commit for the full month)
- Expand affiliate outreach — add 10 more contacts from new counties

**Daily habits (115 min/day):**
- LinkedIn post
- Instagram post
- Warm outreach / referral follow-ups
- Affiliate check
- Pipeline review

**Month 3 content themes:**
- Week 1: "The funnel audit — here's what I found", results from Month 2
- Week 2: deep-dive on the new channel you added
- Week 3: before/after showcase for a real paid client (with permission)
- Week 4: 90-day numbers — raw, honest, specific

**Month 3 targets:**

| Metric | Minimum | Strong |
|---|---|---|
| Cold emails sent | 6,000 | 9,000+ |
| LinkedIn DMs or calls | 200 | 500+ |
| Affiliate referrals received | 2 | 6+ |
| LinkedIn followers total | 300 | 800+ |
| Paid clients this month | 3 | 8 |
| Cumulative revenue | $5,000+ | $15,000+ |

---

### Month 4 — GROW (Days 91–120, 2026-07-27 to 2026-08-25)

**Theme:** You have proof now. Use it. Social proof is the highest-leverage asset you own — a real testimonial does more work per post than any cold pitch ever will.

**New actions this month:**
- Hire part-time VA ($5–8/hr, 10 hrs/wk) for inbox triage and outreach support — frees 2 hrs/day of Ben's time
- Add retargeting pixels to /preview and /claim pages (Meta Pixel + Google Ads tag) — start $50/mo in retargeting ads
- Publish a case study post: one client, real numbers, real result — this single post will outperform everything else you wrote in Month 1
- Add a "Results" page or highlight reel to bluejayportfolio.com — let the work sell itself
- Start A/B testing email subject lines systematically — one variable at a time
- Expand to 3rd email warming domain if volume needs to exceed 200/day

**Daily habits (115 min/day — same forever):**
- LinkedIn post
- Instagram post
- Warm outreach / referral follow-ups
- Affiliate check
- Pipeline review

**Month 4 content themes:**
- Week 1: case study deep-dive (the client, the site, the result)
- Week 2: "What I learned building 10 websites" — patterns, surprises, mistakes
- Week 3: retargeting and paid ads explainer (builds personal brand as a smart operator)
- Week 4: 120-day numbers

**Month 4 targets:**

| Metric | Minimum | Strong |
|---|---|---|
| Paid clients this month | 5 | 12 |
| Cumulative revenue | $10,000+ | $25,000+ |
| LinkedIn followers total | 600 | 1,500+ |
| Active affiliates | 3 | 8+ |
| Retargeting ads live | Yes | Yes |
| VA hired | Yes | Yes |

---

### Month 5 — SCALE (Days 121–150, 2026-08-26 to 2026-09-24)

**Theme:** The system works. Now make it bigger. Everything you do this month is about increasing capacity without proportionally increasing your own time.

**New actions this month:**
- Hire part-time junior designer ($15–25/hr, 20 hrs/wk) — offload template customizations
- Systemize the handoff: create a documented process so the VA can run intake without you
- Run NPS on every paid client from Months 1–4 — collect promoters and activate them
- Launch a referral blast to all NPS promoters — personal message from Ben, not automated
- Record 5 Loom walkthroughs for top prospects (high-signal, clicked-but-didn't-claim)
- Add 4th email warming domain if needed for 400+/day volume

**Daily habits (115 min/day):**
- LinkedIn post
- Instagram post
- Warm outreach / referral follow-ups
- Affiliate check
- Pipeline review

**Month 5 content themes:**
- Week 1: "I hired my first person — here's what changed"
- Week 2: NPS results, what clients actually said
- Week 3: "The referral machine — how I'm getting clients from clients"
- Week 4: 150-day update — cumulative everything

**Month 5 targets:**

| Metric | Minimum | Strong |
|---|---|---|
| Paid clients this month | 8 | 20 |
| Cumulative revenue | $20,000+ | $45,000+ |
| LinkedIn followers total | 1,000 | 2,500+ |
| Referrals from NPS promoters | 2 | 8+ |
| Team (VA + designer) | 2 | 3 |

---

### Month 6 — MACHINE (Days 151–180, 2026-09-25 to 2026-10-24)

**Theme:** This is the proof-of-concept month. If the system works, it runs mostly without you. Your job is closing deals, managing the team, and planning Month 7+.

**New actions this month:**
- Closer/sales rep hire if volume warrants it ($50K base + 10% commission)
- Full funnel review: which channel produced the most paid clients? Double it in Month 7
- Publish "6 months of BlueJays" post — this will be the most viral content you've ever written
- Plan Month 7+ based on real data: which channel, which category, which county is the winner
- Evaluate Vercel Enterprise if domain count is approaching 50 on Pro plan
- Set up proper bookkeeping: revenue, costs, margins, CAC, LTV — know your numbers cold

**Daily habits (115 min/day — still, always):**
- LinkedIn post
- Instagram post
- Warm outreach / referral follow-ups
- Affiliate check
- Pipeline review

**Month 6 content themes:**
- Week 1: "6-month milestone" post — real numbers only
- Week 2: "Here's the exact system" — full transparency, builds massive credibility
- Week 3: team spotlight, process post
- Week 4: "What Month 7 looks like" — forward-looking, creates anticipation

**Month 6 targets:**

| Metric | Minimum | Strong |
|---|---|---|
| Paid clients this month | 12 | 25+ |
| Cumulative 6-month revenue | $30,000+ | $75,000+ |
| Total paying sites | 30 | 75+ |
| LinkedIn followers total | 1,500 | 5,000+ |
| Active affiliates | 5 | 15+ |
| Monthly recurring (renewals) | $3,000/yr | $7,500+/yr |

---

### 6-Month Summary Scorecard

| Month | Theme | Paid Clients (min) | Cumulative Revenue (min) |
|---|---|---|---|
| Month 1 | PLANT | 1 | $997 |
| Month 2 | WATER | 3 | $4,000 |
| Month 3 | SPROUT | 6 | $10,000 |
| Month 4 | GROW | 11 | $21,000 |
| Month 5 | SCALE | 19 | $40,000 |
| Month 6 | MACHINE | 31 | $71,000 |

Miss minimum 2 months in a row → stop adding channels and fix the conversion bottleneck first. The problem is never volume. It's always the weakest stage in the funnel.

---

### Marketing Stats Tracking Rules (NON-NEGOTIABLE)

Every session where Ben reports completing a habit or outreach action, Claude MUST update the Progress Log below immediately. The log is the single source of truth for whether Ben is on track against the Hormozi ramp targets.

**What gets logged every session:**
- LinkedIn posts published (running total toward 30/month)
- Instagram posts published (running total toward 30/month)
- Warm messages sent (running total toward 100/month)
- Affiliate emails sent + delivered vs bounced
- Affiliate replies received + follow-ups done
- Cold emails sent (from dashboard)
- Pipeline actions (approvals, replies)
- Paid clients signed + revenue

**How to check progress vs targets:**
At the start of every session, compare the progress log totals against the current month's targets table. If any metric is behind pace, call it out specifically: "You need X more LinkedIn posts this month to hit 30. You're on pace for Y at current rate."

**Pace math (Month 1):**
- LinkedIn: 1/day = 30 total. Behind if cumulative < (current day - 1)
- Warm messages: ~3.3/day = 100 total. Behind if cumulative < (current day × 3.3)
- Cold emails: auto-send, just verify it's running
- Affiliate follow-ups: any reply gets a same-day response

### Progress Log (updated each session — Ben's running scoreboard)

**Day 1 — 2026-04-28: ✅ COMPLETE**
- ✅ LinkedIn account created (business)
- ✅ Instagram account created (business)
- ✅ LinkedIn post published
- ✅ Warm outreach: 20 messages sent to friends/family
- ✅ Pipeline review: done
- ✅ 19 affiliate partner emails attempted (Fobian, Pratt, Hadlock, Castell, Haguewood + 14 Mason/Kitsap targets)
- ⚠️ 8 of 19 affiliate emails bounced — need correct addresses, resend pending
- ✅ 11 of 19 affiliate emails delivered
- Cold emails: warming ramp starting (20/day)
- Paid clients: 0
- Notes: Perfect Day 1. All three habits done. Strongest possible start.

---

## Daily Accountability Rule — Hormozi-Style (NON-NEGOTIABLE)

**Every single session Ben opens in this project, this rule fires. No exceptions.**

### The Rule

At the START of every session, before doing any technical work, ask Ben:

> "Day [N] — Month [M] ([theme: PLANT/WATER/SPROUT/GROW/SCALE/MACHINE]). Did you post on LinkedIn today? Did you post on Instagram? Did you send your warm outreach or follow up referrals? Did you check your affiliate replies? Did you review the pipeline? Yes or no on each."

If Ben has NOT been in the project today yet, also ask midway through any session that runs longer than 30 minutes:

> "Quick check — have you done your three habits today? LinkedIn post, warm outreach, pipeline review. These don't move themselves."

### Accountability Response Patterns

**If Ben says he did all three:**
Acknowledge it briefly and with real energy. Something like: "That's the work. 200 emails going out, 30 LinkedIn posts compounding, warm contacts turning into conversations — that's the machine building itself. Keep the streak alive."

**If Ben skipped one or more habits:**
Do NOT let it slide. Respond the way Hormozi would — direct, no judgment, but zero softness:

Examples of the tone to use:
- "Nobody's coming to save you. The electrician in Sequim doesn't know you exist yet. The LinkedIn post you didn't write today was the one that would've made someone DM you this week. Post it now before we do anything else."
- "You want 5,000 sites. You know what separates you from the version of you that hits that? The days you showed up when you didn't want to. Post the LinkedIn. Now. Then we'll talk code."
- "Cold email goes out whether you work or not. But content and warm outreach only happen if YOU do them. The automated system can't build your reputation. Write the post."
- "Every day you skip the post is a day your audience doesn't grow. Your audience is the asset that makes everything else cheaper. Don't tax future-Ben."
- "Skipping one day is a choice. Skipping two is a habit. Don't let today be the second one."

**If Ben says he's too busy / had a hard day:**
Acknowledge the reality, then redirect:
- "Hard days happen. But the habit only compounds if it's daily. A 3-minute LinkedIn post and 10 text messages to your contacts doesn't require a perfect day. It requires 23 minutes. Do it now."
- "You don't have to be good today. You just have to show up. The algorithm rewards consistency, not quality. Ship something."

**If Ben says the habits feel pointless yet / no results:**
This is the most important moment — don't let him quit before compounding kicks in:
- "Hormozi's exact words: most people do 1/42 of the required effort and declare the channel dead. You're on Day [N]. The compound curve doesn't bend until around Day 20-25. You're not in the results phase yet. You're in the planting phase. Keep going."
- "You've sent [X] cold emails. At 1% conversion that's [X×0.01] clients. You need volume first. The post you write today gets seen by someone who knows someone who needs a website. That's how it works. You just can't see it yet."
- "Every big creator, every big agency, every business you admire — they had a Day [N] where nothing had happened yet and they kept going anyway. That's the only filter that matters."

### Tone Always:
- Blunt but not cruel
- Specific (use Day N, use real numbers from the pipeline, use their actual targets)
- No preamble, no softening — just the truth and the redirect
- End every accountability message with the one action they should do RIGHT NOW before anything else

### When to fire this rule:
- First message of every session in this project
- If a session runs 30+ minutes without Ben mentioning the daily habits
- Any time Ben mentions being tired, behind, unmotivated, or asks "is this worth it"
- Any time Ben asks about adding new features before the 30-day ramp is complete

### Never do:
- Skip the accountability check because Ben seems busy or stressed
- Accept "I'll do it later" without pushing back
- Let a session end without confirming at least one of the three daily habits got done

