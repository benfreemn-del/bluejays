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
- **$997 is the base price** — firm, no negotiation for agents. Period.
- **All generated sites and templates must use the footer credit** — `Created by bluejayportfolio.com`, with `bluejayportfolio.com` rendered as a clickable link to `https://bluejayportfolio.com`. Never use BlueJay Business Solutions wording, BluejayLogo branding, or any other footer variation.
- **Review approval required** — sites go to "pending-review" before outreach, not straight to "contacted".
- **Color review agent must pass** — every generated site's color scheme is reviewed for vibrancy and category fit before approval.
- **Social proof overlays MUST use real data or be removed. NEVER show fake or inflated numbers.**
- **Personalized proposals MUST be generated before entering the sales funnel, combining all CRM data, scraped info, reviews, and notes.**

## Image Rules (NON-NEGOTIABLE)
These image rules are governed by `QC_RULES.md`, which is the authoritative single source of truth for image validation, fallback behavior, duplicate detection, contextual relevance, sanitization, and section-by-section image approval standards. If this file and `QC_RULES.md` ever differ, follow `QC_RULES.md`.

- **NEVER reuse the same stock photo across multiple templates** — every template must have completely unique images. If two templates use the same person photo, it's immediately obvious and kills trust.
- **Every team/staff photo must be unique per template** — no sharing headshots between electrician, plumber, dental, etc.
- **Verify all image URLs actually load** — broken images are unacceptable. Test before deploying.
- **For generated preview sites**: use the business's real photos when scraped. Only fall back to stock as last resort, and never reuse stock across different prospects.
- **All external images must go through the image proxy** — Google Places photo URLs need the API key server-side, and Wix/Squarespace CDN URLs expire. Use `proxyImage()` from `@/lib/image-proxy` or serve through `/api/image-proxy?url=ENCODED_URL`. The preview page already proxies all photos before passing to renderers. Unsplash URLs bypass the proxy (they work directly).
- **ALL preview images must pass a resolution check** — the `isLowQualityImage()` function in `preview-utils.ts` automatically skips: logos, favicons, icons, Wix thumbnails (<200px wide), blurred previews, screenshots. If ALL scraped photos are low-res, use Google Places photos instead. A tiny pixelated logo used as a hero image is the #1 way to make a preview look amateur. This check runs automatically in `getHeroImage()` and `getAboutImage()`.
- **REJECT blurry, low-quality, or poorly-framed scraped images** — if a business's scraped photos are blurry, tiny, dark, poorly cropped, or show mundane things (bathroom fixtures, random pipes, blank walls), DO NOT USE THEM. Replace with high-quality stock photos for that industry. A blurry real photo is WORSE than a clean stock photo. The business owner will think we did a bad job if their preview has ugly images. This applies to hero images, gallery images, and about section images.
- **Stock images are LAST RESORT only** — but they are PREFERRED over bad real photos — always attempt to use scraped photos from the business's website first. Only use hardcoded stock images if nothing of reasonable quality can be scraped. A real photo of their actual business (even if lower quality) is better than a generic stock photo.

## Customization Rules (NON-NEGOTIABLE)
Every generated website MUST be heavily customized to the specific business. Generic is unacceptable. The site generation agent must:
- **Use the business's actual logo** if available (scraped from their current site or Google Business Profile). If no logo, generate a text-based logo with their name in a style matching the industry.
- **Match their brand colors** — scrape their existing site/socials for brand colors and use those as the accent color. Only fall back to category defaults if no brand colors are found.
- **Use their actual photos** — pull photos from their Google Business Profile, existing website, and social media. Prioritize real photos over stock. Use stock only as a last resort.
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
- **The preview URL IS the product** — `/preview/[id]` is the exact link sent to business owners in pitch emails, texts, and DMs. It must look like a $997 website, not a prototype.
- **Preview must match the V2 template quality for its category** — if electrician has a V2 template, the electrician preview must render with V2-level quality (14 sections, glass morphism, particles, trust badges, etc.)
- **Never send outreach with a generic-looking preview** — if the preview doesn't match V2 quality, it stays in processing until it does.
- **The preview is the pitch** — a business owner's first impression of our work. One chance. Make it count.

## Deployment Rules (NON-NEGOTIABLE)
- **Vercel deploys take 60-90 seconds after git push** — always wait for deploy before Chrome-verifying on the live site.
- **Hard refresh (Ctrl+Shift+R) when verifying** — browser cache can show old code.
- **Commit and push to GitHub periodically** — don't wait until the end of a session. Push after completing major features.
- **Always run `npm run build` before declaring something done** — catch TypeScript errors early.

## Funnel Testing Rules (NON-NEGOTIABLE)
- **Test before live outreach** — before sending any real outreach campaign, ALWAYS run the Test Funnel button first. This sends the complete funnel (all emails + all texts) to Ben's personal email (benfreemn@gmail.com) for review.
- **Test funnel must use the highest version template** — the test preview link must point to the best V2 template we have for the category being tested. Currently defaults to /v2/electrician.
- **Two test emails are sent**: (1) Full strategy document with agent voice, funnel timeline, pricing framework, objection handling, and all 3 email sequences. (2) All 3 SMS text sequences in order.
- **Verify links work** — Ben will click the preview links in the test emails to confirm they load correctly. If they don't, fix before going live.
- **The funnel and strategy should evolve** — as we aggregate data (open rates, response rates, what objections come up), the agent's strategy should be updated. The test funnel is how Ben reviews these changes.
- **API endpoint**: POST /api/test-funnel (protected, dashboard only)

## Sales Agent Evolution Rules (NON-NEGOTIABLE)
The sales agent is a LIVING SYSTEM that must improve over time, not stay static.
- **Always use the latest version of everything** — when generating outreach (emails, texts, DMs), the system must pull from the most current version of: agent-personality.ts, email-templates.ts, sms.ts, conservative funnel timing, objection handling, and pricing framework. Never cache old versions.
- **Refresh before every output** — before the test funnel sends emails OR before live outreach fires, the system must read the current state of all sales configuration files. This ensures any improvements made to the agent's strategy are immediately reflected in all output.
- **The test funnel button triggers a full knowledge refresh** — when Ben clicks "Test Funnel", it reads the latest agent-personality.ts, email-templates.ts, sms.ts, and funnel-manager.ts LIVE (not from any cache). The test output always reflects the most current strategy.
- **New leads trigger the latest pipeline** — when a new prospect enters the funnel (via scout, manual add, or get-started form), all outreach uses the current version of templates and strategy. No stale copy.
- **Aggregate and learn** — track which email subjects get opened, which preview links get clicked, which objections come up most. Use this data to periodically update: email-templates.ts (better subject lines), agent-personality.ts (better objection responses), sms.ts (better text hooks).
- **Skills and frameworks** — the sales agent and all building agents should leverage these skill libraries:
  - **coreyhaines31/marketingskills**: CRO, cold outreach sequences, conversion optimization, pricing strategy, churn prevention
  - **OpenClaudia/openclaudia-skills**: write-landing (high-converting copy), page-cro (conversion rate optimization), copywriting, copy-editing, competitor-analysis, pricing-strategy, growth-strategy, demand-gen
  - **onewave-ai/claude-skills**: landing-page-copywriter, sales prospecting, email generation, content optimization (100 skills)
  - **anthropics/skills/frontend-design**: production-grade landing page code (React + Tailwind + shadcn/ui)
  - **anthropics/skills/web-artifacts-builder**: beautiful modern web components with animations
  - **alirezarezvani/claude-skills**: 220+ skills — Landing Page Generator, Sales Engineer, Revenue Ops, CMO Advisor, VP Sales Advisor, CRO pod, SEO Audit, Customer Success, SaaS Scaffolder
  - **VoltAgent/awesome-agent-skills**: 1,234+ agentic skills across all categories, universal SKILL.md format
  - When updating sales copy, apply: benefit-first headlines, social proof, urgency without sleaze, objection preemption, CRO principles, psychological triggers, A/B testing mindset. Think like a growth marketer.
- **Version the improvements** — when the sales strategy is updated, log what changed and why (e.g., "Changed email 1 subject line because open rate was 12%, new version targets 25%"). This creates an audit trail of what's working.

## Voicemail Drop Rules (NON-NEGOTIABLE)
- **Voicemail drops are part of the funnel** — Day 2 (initial VM) and Day 18 (follow-up VM) are auto-deployed as part of the sales funnel.
- **Only drop voicemails, never live calls** — the system uses Twilio AMD (Answering Machine Detection) to detect voicemail. If a human answers, it hangs up immediately. We are NOT cold calling.
- **Ben records the voicemail** — the pre-recorded voicemail lives at `/public/voicemail.mp3`. Until Ben records, the system uses Twilio TTS as fallback.
- **Voicemail script must be genuine** — matches the agent personality (friendly, casual, authentic). Mentions the business by name. Under 30 seconds.
- **Max 2 voicemail drops per prospect** — initial (Day 2) and follow-up (Day 18). No more.
- **Always follow up a voicemail with a text** — the VM says "I'll shoot you a text with the link." The text must be sent within minutes of the VM drop.
- **API endpoints**: POST /api/voicemail/drop/[id] (trigger drop), GET /api/voicemail/twiml (Twilio callback), POST /api/voicemail/status (AMD callback)

## Outreach Safety Rules (NON-NEGOTIABLE)
- **Rate limit outreach** — no more than 20 emails, 10 texts, or 10 DMs per day. Sending too many triggers spam filters and gets accounts flagged.
- **Never outreach without a working preview** — before sending any email/text/DM, verify the preview URL loads and looks premium. A broken link in a pitch email is worse than no email.
- **Mobile-first verification** — most business owners will open the preview on their phone. ALWAYS verify mobile layout before marking ready for outreach.
- **Competitor check before pitching** — if a business already has a modern, professional website, don't pitch them. Focus on businesses with bad/outdated/no websites. The scraper should flag this.

## Cost & Efficiency Rules
- **Track API costs per prospect** — every Google Places API call, every scrape, every generation has a cost. Log it. The cost-tracker at src/lib/cost-tracker.ts must be maintained.
- **Don't re-scrape unnecessarily** — if a prospect already has good scraped data, don't re-scrape on every generate. Only re-scrape if data is missing or stale (>7 days).
- **Batch operations when possible** — bulk generate, bulk scrape, bulk outreach. Don't make individual API calls when a batch would do.

## Workflow Rules
- **Ben's phone**: +12538863753 — for owner alerts
- **Ben's email**: bluejaycontactme@gmail.com
- **Save learnings to memory** — when a mistake is caught and fixed, save it to the memory system so future sessions don't repeat it.
- **Design as systems, not one-offs** — every fix should be a reusable solution that works for all categories, not a category-specific patch.
- **Test on mobile AND desktop** — every page, every template, every preview. Mobile is where the money is.

## Lessons Learned (HARD-WON — DO NOT REPEAT THESE MISTAKES)
- **SVG animations that look bad are worse than no animation** — if a hero SVG looks like a rough sketch (salon scissors, PT stick figure, fitness runner), replace it with a beautiful photo instead. A stunning photo > a mediocre animation every time.
- **Photos > animations for feminine/elegant categories** — salon, florist, photography, interior-design look better with real photos than SVG animations. Save animations for industrial/trade categories where they can be bold and simple (barbell, piston, lightning bolt).
- **Gallery images MUST match their labels** — "Modern Kitchen Remodel" must show a kitchen, not curtains. If an agent assigns labels to a gallery, the agent must verify each image matches its label. This was caught on general-contractor.
- **Wix sites return "My Site" or "website" as business name** — the generator must reject these and use the prospect's name from the database instead. This is handled in generator.ts but ALWAYS check.
- **Google Places photo URLs expire and need the API key** — all external images go through /api/image-proxy which handles this. Never render Google Places photos directly.
- **Most small businesses don't have email addresses on their websites** — phone/SMS/voicemail will be the primary outreach channel for most prospects. Don't rely on email scraping alone.
- **Suggestion deductions in quality gate add up fast** — cap them at 15pts total so anonymous Google reviews ("Happy Customer") don't tank the score for otherwise good sites.
- **SendGrid domain auth requires the domain WITHOUT https://** — just "bluejayportfolio.com", not "https://bluejayportfolio.com/". This caused days of 401 errors.
- **Vercel env vars are sensitive to trailing characters** — always verify no extra space or newline after pasting API keys.
- **FROM_EMAIL must be hardcoded, not from env var** — the Vercel FROM_EMAIL env var was set to an invalid value causing "Invalid from email address" errors. Hardcoded to `bluejaycontactme@gmail.com` in email-sender.ts to prevent this.
- **Vercel serverless functions have READ-ONLY filesystems** — cannot write to `data/emails/` or any local directory. Skip file logging when `process.env.VERCEL` is set. Use Supabase for production logging instead.
- **When debugging API failures, check the ACTUAL error response** — don't assume it's the API key. Add error detail logging (response status + body) to every external API call. The error "SendGrid API failed" was useless — "Invalid from email address" was the real issue.

## Tech Stack
- Next.js 16 + React 19 + TypeScript + Tailwind v4 + Framer Motion
- Supabase for production database (with JSON file fallback for local dev)
- SendGrid for emails (LIVE — domain authenticated, sender verified)
- Twilio for SMS + Voicemail (LIVE — upgraded from trial)
- File-based store at `data/` for local development
- **Domain**: bluejayportfolio.com — DNS managed by **Vercel** (ns1.vercel-dns.com, ns2.vercel-dns.com)
- **Hosting**: Vercel Pro (benfreemn-dels-projects/bluejays)
- **Domain registrar**: Vercel (DNS records added through Vercel dashboard → project → Domains)
- **Image proxy**: /api/image-proxy — proxies Google Places + Wix/Squarespace CDN images server-side
- **Preview utils**: src/lib/preview-utils.ts — smart hero text truncation, logo detection, nav name cleanup

## Key Files
- `scripts/pipeline.ts` — CLI to run scout/scrape/generate pipeline
- `src/lib/types.ts` — All types, categories, pricing, and category config
- `src/lib/data-extractor.ts` — Cascading data extraction (Cheerio → Google Places → Web Search)
- `src/lib/generator.ts` — Site data generator with dual quality failsafes
- `src/lib/quality-review.ts` — AI quality review agent
- `src/lib/color-review.ts` — Color scheme review agent
- `src/app/preview/[id]/page.tsx` — **Preview routing** — V2_RENDERERS map routes to V2 components per category
- `src/components/templates/PreviewRenderer.tsx` — Generic preview (fallback for categories without V2 dynamic renderer)
- `src/components/templates/V2ElectricianPreview.tsx` — Dynamic V2 electrician preview (accepts GeneratedSiteData)
- `src/components/templates/TemplateLayout.tsx` — Shared layout with claim banner, footer branding
- `src/components/Hero.tsx` — Homepage with portfolio cards (update href when adding V2s)
- `src/app/v2/[category]/page.tsx` — V2 showcase templates (11 categories)
- `src/components/BluejayLogo.tsx` — BluejayLogo SVG component used everywhere
- `src/lib/auto-funnel.ts` — 6-step automated retargeting funnel
- `src/lib/cost-tracker.ts` — Per-lead and system-wide cost tracking
- `src/middleware.ts` — Auth protection (portfolio public, dashboard behind login)

## Auth
- Portfolio (/, /templates/*, /preview/*, /claim/*) = PUBLIC
- Dashboard, lead pages, API routes = PROTECTED (login required)
- Password: set via ADMIN_PASSWORD env var (default: bluejay2026)

## Approval & Pricing Rules (NON-NEGOTIABLE)
- **Ben approves ALL preview sites and final sites manually before they go live or enter the funnel. No site goes out without approval.** This applies to both standard and free-tier prospects. Every site must pass quality gates AND receive explicit manual approval from Ben before any outreach or deployment.
- **Free tier ($30) is for friends/family only. Default pricing tier is always standard ($997).** The free tier exists solely for prospects Ben personally tags as "free" in the dashboard. It charges $30 upfront (covers domain + server costs) instead of $997, but still creates the same deferred $100/year management subscription after 1 year. Never auto-assign free tier — it requires manual tagging by Ben.
- **Two pricing tiers exist**: Standard ($997 upfront → $100/yr after 1 year) and Free ($30 upfront → $100/yr after 1 year). The `pricing_tier` column on the prospects table controls which tier applies. The claim page, checkout API, and Stripe session all respect this field dynamically.

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

## Hero Section Visual Quality (QC Rule)
- **Every template MUST have a visually engaging hero section** — either a background image, hero image, gradient with animation, or decorative SVG pattern. No empty/flat text-only heroes. First impressions are critical: prospects open these sites from a text message and the hero is the first thing they see.
- **Acceptable hero treatments**: full-bleed background image with overlay, animated gradient, decorative SVG silhouette pattern, or a prominent foreground hero image. A solid color or simple linear gradient with no visual element is NOT acceptable.
- **Mobile must look premium too** — hero images must use `object-cover` and be properly centered. Test at 375px width. A hero that looks great on desktop but breaks on mobile is a failure.
