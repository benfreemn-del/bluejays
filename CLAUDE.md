@AGENTS.md

# BlueJays Project — The Money Printer

> **Where dated material lives** (kept out of the always-loaded surface):
> - `docs/archive/2026-Q2-locked-rules.md` — historical session-locked
>   rules, marketing plans, launch procedures, daily/6-month ramps. Read
>   on demand if a question references something from before May 2026.
> - `docs/playbooks/` — multi-step build playbooks (AI Package, etc.).
> - `docs/templates/` — outreach templates (email, SMS, ads).
> - `docs/ops/` — operational audits (domain, billing, 2FA recovery).
> - `.claude/commands/` — repeatable workflows as slash commands.

## To-Do Scoping Rules (NON-NEGOTIABLE)

The to-do system has THREE distinct surfaces. Don't mix them. When
adding any task-related feature, pick the right surface up front.

1. **`/dashboard` home overview** — BlueJay Business Solutions LLC
   ONLY. Tax / legal / ops compliance for the BlueJays company itself.
   Surface: `<BusinessSetupChecklist />` (localStorage, no DB). Never
   render `client_tasks` rows here. The home overview is for Ben's
   own business, not for client work.

2. **`/dashboard/clients/[slug]`** — per-client task list. One client
   per page. Backed by `client_tasks` filtered by `client_slug`. Each
   business gets its own list connected to its own back end. New
   client features land on THIS surface, not the home overview.

3. **`/dashboard/all-tasks`** — master cross-client board. Aggregates
   every `client_tasks` row across every client into one filterable
   view. **Always accessible** via the persistent "Master To-Do"
   button in the dashboard header (and the "All" button on each
   per-client task page). Never bury this link.

When asked "where do I see X tasks":
- BlueJays internal tax/legal → home overview checklist
- One client's tasks → /dashboard/clients/[slug]
- Everything Ben + every client owe right now → /dashboard/all-tasks

Per-client portal at `/clients/[slug]/portal` is a SEPARATE customer-
facing surface, not part of the dashboard. Same `client_tasks` table,
filtered by `owner='client'`.

## Output Formatting Rules (NON-NEGOTIABLE)
- **Never wrap URLs in bold (`**`).** Write links as plain text or plain markdown `[text](url)`. Bold markers around a URL break it when copied — the `**` gets included in the copied string. This applies everywhere: chat responses, code comments, commit messages, HTML, anywhere a URL appears.
- **Outreach emails MUST use three separate fenced code blocks** — one for TO, one for SUBJECT, one for BODY. Never combine them. Never put the signature in the body (Ben has an auto-signature). This format lets Ben copy each field independently and forward without editing. Every single email Claude writes, no exceptions.
- **ALWAYS drop runnable SQL / scripts inline in the chat — never just point at a file path.** When a migration, seed script, one-off SQL, or any "Ben must run this somewhere" snippet is needed, paste the FULL code into the chat inside a fenced ```sql / ```bash / ```powershell block so Ben can copy it directly. Telling him to "open `supabase/migrations/X.sql` and paste the contents" forces an extra step every single time. Also state where to paste it (Supabase SQL Editor, Vercel CLI, terminal, etc.). The file in the repo is the source of truth; the inline drop is for ergonomics. Both, every time.

## Client Tenant Status — READ BEFORE BUILDING ANY TENANT FEATURE

Different BlueJays clients buy different tiers. NOT all clients have an
owner-portal backend, and NOT all clients with a backend bought the AI
system. **Default to gating new features by slug.** When in doubt, ask
Ben which clients should see the feature instead of auto-adding for
every slug.

| Slug | Owner-Portal Backend | AI Marketing System | Sales Portal (commission program) | Notes |
|---|---|---|---|---|
| `zenith-sports` | ✓ | ✓ | ✓ | TEKKY · 4-qtr $10K AI plan · soccer, Caleb + Philip + Paul |
| `itc-quick-attach` | ✓ | ✓ (queued) | ✓ | Jake · $9.7K AI System · tractor accessories · signing later |
| `laser-lakes` | ✓ | ✗ | ✗ | Nate · custom site + Customers/Email tab ONLY · explicitly NO AI features |
| `hector-landscaping` | ✗ (TBD) | ✗ | ✗ | Currently leads-only via SLUG_CONFIG · package undecided |
| `olympic-inspections` | ✗ | ✗ | ✗ | Native booking calendar + admin (formerly `pine-and-particle`) |
| `mountain-view-landscape` | ✗ | ✗ | ✗ | Inquire-only routing |
| `lewis-county-autism` | ✗ | ✗ | ✗ | Inquire-only routing |
| `bloodlines` | ✗ | ✗ | ✗ | Preston James Hunsaker · indie-author bespoke showcase · 5 interactive features (world map / roster / elletas / parchment / faction quiz) · Amazon-driven CTAs · launched 2026-05-07 |
| Others in `SLUG_CONFIG` | ✗ | ✗ | ✗ | Email routing only — no portal, no AI |

**Rules when adding a tenant-facing feature:**
1. **AI-related features** (AI inbound responder · Hyperloop · AI postcards · AI Skills tab · funnel automation · self-learning ads): gate to `slug === "zenith-sports" || slug === "itc-quick-attach"` ONLY.
2. **Portal backend features in general**: only ship for slugs with ✓ in column 2 of the table above.
3. **Sales-portal / partner features**: only ship for slugs with ✓ in column 3.
4. **Custom-build / e-commerce / customer-tracking features** (e.g. Laser Lakes Customers tab, Shopify webhook): can be specific to non-AI clients with portals — those clients still get a portal, just without the AI surface.
5. **Inquire-only clients** (✗ in column 2): don't get any portal features. Don't seed `client_owners` rows for them. Their entries in `/api/clients/inquire/route.ts` `SLUG_CONFIG` are routing-only (lead emails to the right person).

**When the table needs updating:** any time a client moves between tiers (e.g. Hector signs the AI System tomorrow), update this table FIRST in the same commit as the feature gate. The table is the source of truth for what's deployed where — don't let the code and the table drift.

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

## QC Generation Rules — see docs/playbooks/qc-generation-rules.md

Rules locked into the site-generator pipeline. Read when modifying src/lib/site-audit.ts, src/lib/scraper.ts, or any prompt that drives automatic site copy/asset selection.

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

## Quality Gate — see docs/playbooks/quality-gate-failsafes.md

The two failsafes (gate 1 = pre-generation lockout; gate 2 = post-generation auto-flag-for-review) that protect the production funnel from leaking bad output. Read when changing the QC pipeline.

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

## V2 Template Features — see docs/playbooks/v2-template-features.md

Every premium feature mandated for new V2 category templates. Read on demand when building a new V2 template (electrician, plumber, salon, etc.).

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
- **Four pricing tiers exist**:
  1. **Standard ($997)** — one-time for custom website + domain + hosting setup → $100/yr after 1 year. Default for cold-outreach prospects.
  2. **Free ($30 upfront)** — friends/family only. Same $100/yr after.
  3. **Custom ($100/yr)** — bespoke hand-built showcase at `customSiteUrl` (e.g. `/clients/wholme-naturopathy`). Inbound leads. No setup fee.
  4. **Fullsystem ($9,700 + $500–1,000/mo)** — Custom AI Marketing Funnel package. Includes everything in Custom plus the per-audience funnel engine, ad library, affiliate pipeline, weekly reports, and lead magnets. Renders with the **gold $ badge** in the dashboard. See `docs/AI_PACKAGE_PLAYBOOK.md` for the full buildout pattern.
- The `pricing_tier` column on the prospects table controls which tier applies. The claim page, checkout API, Stripe session, and dashboard rendering all respect this field dynamically.

## AI Package — Custom AI Marketing Funnel (`fullsystem` tier)
The full pipeline behind the $9,700 + $500–1,000/mo offering on the audit page. **Documented in `docs/AI_PACKAGE_PLAYBOOK.md`** — read that file before building anything for an AI-package client. **Closeout deliverable in `docs/AI_PACKAGE_HANDOFF.md`** — the doc the client receives at handoff.

### Subscription model (capability tiers)
The system DEGRADES GRACEFULLY based on per-client subscriptions tracked in `client_subscriptions`. Source of truth in `src/lib/client-subscriptions.ts → TIERS`.
- **Hyperloop** — Off / Starter $99 / Pro $249 / Elite $499. Off = funnel runs static. Pro+ = auto-optimize variants weekly + Claude variant gen.
- **Claude** — Off / Starter $49 / Pro $149 / Unlimited $399. Off = no AI features. Starter+ = reply drafting + audience detection.
- **Twilio / SendGrid / Meta-Ads / Google-Ads** — tracked as `managed_by: bluejays` during 30-day onboarding then transitioned to `managed_by: client`.

Capability checks via `hasCapability(slug, "hyperloop.weekly")` etc. Code that uses an AI feature MUST gate on the capability — never assume Hyperloop or Claude is available. The system never hard-fails because of a missing subscription.

### Frictionless onboarding
**Phase 0a** of the playbook: ask for delegated business-email access (`info@theirbusiness.com`) so Ben can stand up Twilio + Google Ads + Meta + Calendly + SendGrid accounts in one day. Accounts are still OWNED by the client; we just do the verification heavy-lifting. Massive value multiplier on the offer.

Per-client artifacts (all keyed by `client_slug`):
- Showcase site at `/clients/{slug}`
- Funnel definitions in `src/lib/client-funnels/{slug}.ts` + registry entry
- Ad creative library in `src/lib/client-ads/{slug}-creatives.ts` + registry entry
- Affiliate seed list in `src/lib/client-affiliates-seeds/{slug}.ts`
- Per-client dashboards at `/dashboard/clients/{slug}/{leads|ads|affiliates|reports}`

DB tables (all `client_slug`-keyed): `client_tasks`, `client_leads`, `client_lead_messages`, `client_ad_creatives`, `client_affiliates`, `client_funnel_runs`.

When adding a new AI Package client, walk the 8 phases in the playbook. Roughly 60-80% config, 20-40% bespoke content. ~1 week of focused work per client.

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

## SMS A2P 10DLC Compliance Rules — Rule 35 (NON-NEGOTIABLE — UPDATED 2026-05-06)

**History:** TCR rejected the first A2P 10DLC submission (April 2026)
because the opt-in description claimed "businesses whose numbers appeared
on public business listings". TCR rejected the SECOND submission
(May 2026) because the SMS consent checkbox on `/get-started` was
REQUIRED to submit the form — TCPA 47 CFR 64.1200(a)(7)(i) forbids
making SMS consent a condition of service.

**The fix is permanent and enforced in code (the BELT + SUSPENDERS gate):**

### SMS fires ONLY when BOTH flags are true on the prospect record

Gated inside `src/lib/funnel-manager.ts` in TWO places
(`buildStepPayload()` + `buildVoicemailFollowUpPayload()`):

```ts
const smsAllowedForThisProspect =
  prospect.source === "inbound" &&
  prospect.smsConsent === true;
```

- `source === "inbound"` proves the prospect submitted /get-started
  themselves OR was manually flipped to inbound after a phone-confirmed
  opt-in.
- `smsConsent === true` proves they explicitly ticked the OPTIONAL
  SMS consent checkbox on the form OR opted in via /opt-in-sms/[id]
  post-submit OR Ben manually captured consent through another
  channel.

Both flags are needed. Source alone is insufficient because TCPA forbids
required consent. SmsConsent alone is insufficient because we still
want to keep cold-scouted prospects out of the SMS pool entirely.

### What counts as a valid SMS opt-in capture
1. **`/get-started` form, optional checkbox ticked** — `/api/leads/submit`
   sets `source: "inbound"`, `smsConsent: true`, `smsConsentAt: now`,
   `smsConsentSource: "get_started_form"`. Checkbox wording is locked —
   must reference SMS specifically (NOT bundled with email), mention
   frequency, "Msg & data rates may apply", "Reply STOP to opt out", AND
   state explicitly that consent is NOT required to submit the form.
2. **`/opt-in-sms/[id]` post-submit upsell** — when the prospect submits
   `/get-started` WITHOUT ticking the SMS box, the form redirects to
   /opt-in-sms/[id]. There they can confirm phone + tick the consent box.
   `/api/leads/sms-opt-in/[id]` sets `smsConsent: true`,
   `smsConsentAt: now`, `smsConsentSource: "opt_in_page"`.
3. **Manual capture via another channel** — Ben captures consent
   through a phone call, written reply, in-person etc. Update the
   prospect row manually with `smsConsent: true`, `smsConsentAt: <ISO>`,
   `smsConsentSource: "manual"`. Record the consent capture in
   prospect notes for audit defense.

### What does NOT count
- Scraping a number from Google Business Profile / Yelp / BBB
- The number being "publicly available"
- The business being "obviously commercial"
- Submitting `/get-started` WITHOUT ticking the consent box (form
  submission alone is NOT consent — `source='inbound'` flips but
  `smsConsent` stays false)
- Any interpretation where the user didn't affirmatively tick a
  checkbox or send an explicit yes

### Form contract (TCPA-compliant, locked 2026-05-06)
- The SMS consent checkbox on `/get-started` MUST be unchecked by default
- The form MUST submit successfully without the checkbox ticked
- Phone number is REQUIRED only when the box is ticked; otherwise optional
- Email is REQUIRED (it's the only contact for non-SMS-consenters)
- Checkbox label MUST start with an "Optional" badge AND state "Consent
  is not required to submit this form or receive a website preview"
- When unchecked → /api/leads/submit creates the prospect AND
  redirects browser to `/opt-in-sms/[id]` for the optional upsell
- When checked → /api/leads/submit creates the prospect AND shows
  the success state immediately (no upsell needed)

### Cold-outreach funnel shape (no SMS without opt-in)
| Day | Channels (cold scouted) | Channels (inbound + smsConsent) |
|---|---|---|
| 0 | email only | email + SMS |
| 2 | voicemail | voicemail |
| 5 | email | email + SMS |
| 12 | email | email + SMS |
| 18 | voicemail | voicemail |
| 21 | email | email + SMS |
| 30 | email | email |

Inbound prospects who did NOT tick the SMS box get the same shape as
cold-scouted (email-only).

### Fields TCR must validate (locked in the May 2026 resubmission)
- Privacy Policy URL: `https://bluejayportfolio.com/privacy` (must render
  the new "consent is not a condition" wording)
- Terms URL: `https://bluejayportfolio.com/terms` (must render the new
  opt-in description with /get-started + /opt-in-sms/[id] paths)
- End User Consent description: explicit "consent is NOT required to
  submit the form, receive a preview, or purchase any product or service"
- Sample messages: fully rendered, no `{placeholder}` tokens
- STOP compliance: every SMS template ends with "Reply STOP to opt out"
- HELP reply: "BlueJay Business Solutions: Custom website previews for
  local businesses. Email bluejaycontactme@gmail.com or see /terms.
  Reply STOP to unsubscribe."

### NEVER do (kills the campaign after approval)
- Remove EITHER half of the belt+suspenders gate in funnel-manager
- Make the SMS consent checkbox `required` on the form again
- Make phone field `required` regardless of SMS consent
- Send SMS to a prospect whose `smsConsent !== true`
- Describe opt-in sources to TCR that don't match what the code does
- Auto-flip `smsConsent` to true when a prospect submits the form
  without ticking — capture must be affirmative-tick only
- Pre-check the consent box on either `/get-started` or `/opt-in-sms/[id]`

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

## North Star — see docs/playbooks/north-star-5k-paying-sites.md

Long-form strategic plan: 5,000 paying sites at $997 = $5M ARR. Read when making decisions that touch growth strategy, pricing, or capacity.

## AI / LLM Discoverability — Every Site Ships With llms.txt (NON-NEGOTIABLE — added 2026-05-05)

Every BlueJays site (bluejayportfolio.com itself + every client static
site + every paid customer site) MUST ship with an `llms.txt` file
following the emerging llmstxt.org spec. This is how AI crawlers
(ChatGPT browse, Claude browse, Perplexity, Gemini, Bing AI) parse
the site without choking on JS / Next.js bundles, and it's a clean
SEO-discoverable topic map. Tiny file. Zero ongoing maintenance.

**This is also a SELLING POINT.** Pitch it on the audit page,
the claim page, and in outreach: *"every BlueJays site ships
AI-discoverable so when someone asks ChatGPT for [your service] in
[your city], your business shows up."*

### File location and naming

- **Next.js sites** (bluejayportfolio.com): route handlers at
  `src/app/llms.txt/route.ts` and `src/app/llms-full.txt/route.ts`,
  both returning `Content-Type: text/markdown; charset=utf-8`.
  Use `dynamic = "force-static"` + `revalidate = 3600` so it caches
  cleanly on Vercel.
- **Static client sites** (\`/public/sites/[slug]/\`): literal
  \`/public/sites/[slug]/llms.txt\` file. Vercel serves it as static
  text. The shorter form is enough — most client sites don't need a
  full split.
- **Paid customer sites on custom domains**: same pattern —
  every customer site gets at least an \`llms.txt\`.

### Required content (the spec)

1. **H1 title** — business name + 1-line industry tag
2. **Blockquote summary** — 2-3 sentence elevator pitch with location
3. **Markdown sections** with \`## \` headers covering:
   - What the business does (services list with internal links)
   - Pricing (concrete numbers when applicable, ranges when not)
   - Process / how it works (numbered steps for service businesses)
   - Contact info (phone, email, address)
   - Service area
   - Key URLs (link to every important page)
4. **"Built by"** footer linking to https://bluejayportfolio.com/audit
   (network-effect rule — same as the visible footer credit)

### Required when building any new site (NON-NEGOTIABLE checklist)

- [ ] Create \`llms.txt\` at the root of the site
- [ ] For Next.js sites only: also create \`llms-full.txt\` with the
      fuller version
- [ ] Add \`/llms.txt\` and \`/llms-full.txt\` to the \`allow\` list
      in \`robots.ts\` so crawlers know it's there
- [ ] Verify it returns HTTP 200 with \`text/markdown\` content-type
- [ ] Verify the URLs in the file actually resolve

### Banned patterns

- Don't put \`<!-- HTML comments -->\` in the file — break the markdown
- Don't include phone numbers / emails / addresses that aren't
  ALSO on the public site (single source of truth)
- Don't list features the site doesn't actually have
- Don't omit the "Built by BlueJays" footer link (network effect)
- Don't auto-generate from scraped data — every \`llms.txt\` must
  be hand-crafted or template-driven from real verified business info

### Why this is worth the 10 minutes per site

- AI agents pulling business info into ChatGPT answers parse this
  cleanly. Without it, they have to JS-render and they often miss
  key details.
- It's a cheap SEO win — Google's AI Overviews + Bing Copilot read
  llms.txt where available
- Future-proofs the site as more crawlers adopt the standard
- It's a defensible pitch differentiator vs Wix/Squarespace
  (neither generates llms.txt by default)

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

## Today's Tasks — moved to docs/archive/2026-Q2-locked-rules.md

Daily-task playbook from the 30-day growth ramp. Stale by design — the live to-do is /dashboard/all-tasks. Archive only.

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

---

## Owner Portal Rules (NON-NEGOTIABLE — added 2026-05-04)

The per-client `/clients/{slug}/portal` is the customer-facing surface
for AI Package clients (Zenith first, more to come). Treat it as a
miniature version of the bluejays admin dashboard, not a one-off page.

### 1. Checkbox semantics — selection ONLY

When a portal list (Leads, To-Do, anything multi-row) has checkboxes
on each row:
- The checkbox MUST select the row for bulk-action purposes only
- The checkbox MUST NOT mutate row state (no "checkbox = mark done")
- All mutating actions (mark done, mark won, etc.) live in:
  - The bulk-action toolbar (visible when `selected.size > 0`)
  - Explicit buttons inside the row's expanded view
- Visual: selected row gets `border-blue-400/60 ring-1 ring-blue-400/30`

This is a hard rule. The opposite ("checkbox = action") was shipped
once on the To-Do tab and accidentally completed two real client
tasks within minutes. Bug pattern: `<input type="checkbox">` nested
inside a parent `<button>` proxies clicks to the inner control.

**Architecture rule:** never put any interactive form control (input,
select, textarea) inside a `<button>`. Always make the checkbox + its
`<label>` siblings of any expand/click target, with their own
isolated `onClick={(e) => e.stopPropagation()}` on the label.

### 2. Bulk-action toolbar — required pattern

Every multi-row list in the portal MUST have:
- `selected: Set<string>` state
- `toggleSelect(id)` / `clearSelection()` helpers
- "Select all visible" / "Clear all" toggle button next to the filters
- A sticky bulk-action toolbar that appears ONLY when `selected.size > 0`
  - Class: `sticky top-[110px] z-10 rounded-lg border border-blue-500/40 bg-blue-950/80 backdrop-blur p-3`
  - Leads with: "X selected" badge → action buttons → `Clear ✕`
- Server-side bulk endpoint at `/api/client-portal/{resource}/bulk`
  - Always pre-fetches the rows by id and filters by `client_slug` so
    an owner can NEVER bulk-update another client's data even if they
    forge the ids
  - Caps at 200 ids per request

Reuse the `<BulkBtn>` component in `portal/page.tsx` for consistent
button styling (default = slate, `tone="amber"` for "send back" / risky).

### 3. Bulk action menus — what each list MUST surface

**To-Do tab:**
- Status: ✓ Mark done · ⏳ In progress · 🚫 Blocked · ○ Pending
- Reassign: ↩ Send back to Ben (sets `owner='ben'`, removes from portal)

**Leads tab:**
- Status: 🏆 Mark won · 💬 Mark responded · ▶ Start funnel · ⏸ Pause
- Touch logging: ✉ Log email · ☎ Log call · 💬 Log text
  (each writes one `client_lead_messages` row per selected lead with
  `provider='manual'` and `template_id='manual.owner-log.bulk'`)

These menus are the contract. Don't omit options, don't add net-new
ones without updating this rule.

### 4. Server-side guard — always re-verify ownership

Even though the cookie scopes to `owner.client_slug`, every bulk
endpoint MUST:
1. Pre-fetch rows by id with `.in('id', ids).eq('client_slug', owner.client_slug)`
2. Use the returned `safeIds` (the intersection) for the actual update
3. Return 404 if `safeIds.length === 0`

Same pattern as the per-row PATCH endpoints. Defense in depth.

### 4a. Input validation — UUID + action shape BEFORE the DB read

Found during the 2026-05-04 funnel review: bad inputs were producing
500s with raw Postgres errors (`"invalid input syntax for type uuid"`)
leaking through to the client. Fixed and now mandatory:

**Every [id] route handler** must validate the path param is a valid
UUID before any DB call:
```ts
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!UUID_RE.test(id)) {
  return NextResponse.json({ ok: false, error: "Invalid <resource> id" }, { status: 400 });
}
```

**Every bulk endpoint** must filter the ids array through the same
regex before passing to the DB:
```ts
const ids = Array.isArray(body.ids)
  ? (body.ids as unknown[]).filter((v): v is string => typeof v === "string" && UUID_RE.test(v))
  : [];
```

**Action shape validation runs BEFORE the DB read.** If the request
contains an `action.kind` or similar discriminator, validate it +
nested fields up front. Don't let `action.kind === "unknown"` burn a
DB query and surface a confusing pg-syntax error.

Rule: **no user-reachable path should ever return a 500 with a raw
Postgres error message.** All input-shape errors are 400 with a
friendly `error` string. Internal failures are 500 with a generic
message; the real error is logged server-side, never returned.

### 5. Mutating-API gating

- AI features (reply drafts, future agent actions) MUST gate on
  `hasCapability(slug, "claude.…")` and return 402 with
  `{ upgrade_required: true }` when the client isn't on a Claude tier
- SMS fan-out MUST gate on per-client Twilio number availability
  (env var or `client_subscriptions` capability check)
- Shopify metrics MUST return `{ connected: false }` gracefully when
  no row in `client_shopify` — never throw or return zero data that
  reads as "your store has no sales"

### 6. Documentation contract

Any change to the portal — new tab, new bulk action, new mutation —
MUST update BOTH:
1. `docs/AI_PACKAGE_PLAYBOOK.md` (Owner Portal section)
2. This file (Owner Portal Rules)

So the next AI Package client onboards with the same surface, and
the next Claude session knows what's already shipped.

### 7. Auto-refresh on save (NON-NEGOTIABLE)

Any per-row mutation in the portal MUST call the parent's `onMutate`
callback after a successful response. The parent owns the data fetch
(`loadLeads`, `loadTasks`) and a stale parent makes the badge / chip
/ counter on the collapsed card render the OLD value, which reads
as "did my save work?" UX rot.

Already enforced on:
- Lead status flips (per-row + bulk)
- Lead notes save
- Lead enroll / log-contact
- Task status, owner-reassign, notes

Pattern: `if (j.ok) onMutate();` immediately after the API call.
Don't wait for the next user action to refresh; mutations should
feel instant.

### 8. Audience color-coding (NON-NEGOTIABLE for multi-audience clients)

Any client with 2+ audience segments (parent / coach / player / club
/ etc.) MUST surface that segmentation visually on every lead card,
not just as a text badge:
- 4px left accent strip in the audience color
- Soft `bg-{color}/[0.06]` tint on the card
- Audience badge re-themed to match
- Brand-voice doc audience taxonomy maps directly to colors
  (Zenith: parent=amber / coach=cobalt / player=lime / club=violet)

Why: owners scan the pipeline visually — "we have a wave of parents
this week" reads instantly without parsing each card. Text-only
audience badges fail this test on mobile where badge text shrinks.

The canonical token shape lives in `portal/page.tsx` as
`AUDIENCE_COLOR` — copy/extend per client, don't reinvent.

### 9. Dismiss is its own status (NON-NEGOTIABLE)

Spam / bot / not-a-real-lead entries need a way out of the active
pipeline that ISN'T deletion. Pattern:
- Add `'dismissed'` to the `funnel_status` enum (DB migration)
- Per-row "✕ Dismiss" button (rose accent, confirms before applying)
- Bulk-toolbar "✕ Dismiss" option
- Default filters silently exclude `funnel_status='dismissed'`
- Separate "Dismissed" filter chip surfaces them for restore
- Dismissed leads visually fade (opacity-50 + line-through status)

Do NOT use `paused` or `completed` as a substitute. Those mean
something specific (paused = funnel-runner skip; completed = hit
the end of the funnel). Conflating with dismiss makes reports lie.

---

### 10. Inline Leads-Search Bar (NON-NEGOTIABLE — added 2026-05-05)

Every leads-style table — BlueJays main dashboard, every AI System
client owner-portal Leads tab, any future "list of people we have
records for" surface — MUST mount the shared `LeadsSearchBar`
component at the top of the list, ABOVE all filter chips.

**The shared assets:**
- `src/components/shared/LeadsSearchBar.tsx` — UI component
- `src/lib/leads-search.ts` — pure filter helpers (`filterBySearch`,
  `extractIdLookup`, `extractProspectSearchText`,
  `extractClientLeadSearchText`)

**Behavior contract:**
- Reads/writes `?q=` from the URL — sharable + back-button works
- Debounced 150ms before pushing to URL/onChange
- Cmd/Ctrl+K from anywhere on the page focuses the input
- "/" key (when not typing in another input) also focuses
- Esc key clears the search
- Clear button (✕) appears when there's text, also visible inside
  the no-results banner
- ID-lookup short-circuit: if the query exactly matches a UUID or
  8-char short code, the result narrows to that one row only —
  use this to make "paste an ID, see the row" work as a debug aid

**Composition rule (AND, never OR):**
- Search composes AND with existing filter chips (status, audience,
  tier, etc.) — search narrows the already-chip-filtered subset
- Filter-chip counts MUST be computed against the pre-search
  totals (so a count of "12 enrolled" doesn't collapse to "0
  enrolled" when the user is typing) — apply search LAST

**Pattern (mirror this in every new portal):**

```tsx
import LeadsSearchBar from "@/components/shared/LeadsSearchBar";
import {
  filterBySearch,
  extractClientLeadSearchText,
  extractIdLookup,
} from "@/lib/leads-search";

const [searchQuery, setSearchQuery] = useState<string>("");

// existing chip filters → tierFiltered
const tierFiltered = /* result of stage + audience + tier filters */;

// search is the LAST axis
const idLookup = extractIdLookup(searchQuery);
const filtered = idLookup
  ? tierFiltered.filter((l) => l.id === idLookup.value)
  : filterBySearch(tierFiltered, searchQuery, extractClientLeadSearchText);
const searchHasNoResults =
  !!searchQuery && tierFiltered.length > 0 && filtered.length === 0;

return (
  <div>
    <div className="mb-3">
      <LeadsSearchBar
        onChange={setSearchQuery}
        placeholder="Search leads — name, email, phone, ID…"
        totalCount={tierFiltered.length}
        showNoResults={searchHasNoResults}
        onClear={() => setSearchQuery("")}
      />
    </div>

    {/* existing filter chip rows… */}
    {/* lead cards rendered from `filtered` */}
  </div>
);
```

**Banned patterns:**
- Don't reinvent the search input — always use `<LeadsSearchBar>`.
  Custom inputs drift in styling, break the Cmd-K shortcut, and
  forget URL sync
- Don't filter PRESENT items via search and HIDE filter chips that
  no longer match — keep the chips' counts honest (compute counts
  pre-search, render visibility post-search)
- Don't put the search bar BELOW the filter chips — the chips are
  contextual narrowing; search is the fastest path. Search-first
  saves a tap on mobile every single time

**When onboarding a new AI System client portal:** the
`<LeadsSearchBar>` mount is part of the Phase 5 "Leads tab" build
checklist in `docs/AI_PACKAGE_PLAYBOOK.md` — never skip it. The
shared component means new clients get search for free with zero
extra wiring.

---

## Custom-Domain Rewrite Pattern (NON-NEGOTIABLE — added 2026-05-04)

When a client transfers their custom domain to Namecheap and points
DNS at Vercel, the domain by default serves the bluejays portfolio
homepage (because Vercel maps the domain to the project root). To
serve their actual showcase, add an entry to `CLIENT_DOMAIN_MAP` in
`src/middleware.ts`:

```ts
const CLIENT_DOMAIN_MAP: Record<string, string> = {
  "hectorlandscaping.com": "/preview/ad954c6f-...",  // generated tier
  // "tekky.org": "/clients/zenith-sports",         // custom tier
};
```

Path may be either:
- A static showcase folder under `/clients/{slug}` (custom / fullsystem)
- A generated `/preview/{prospect-id}` (template / standard tier)

Middleware strips `www.` for lookup so apex + www both resolve.
Edge cases handled: `_next/*` and `/api/*` paths bypass the rewrite,
already-prefixed paths bypass (no double-rewrite), query string
preserved.

Add the custom domain to the Vercel project (Settings → Domains)
BEFORE merging the middleware change, otherwise Vercel will 404 the
incoming requests at the edge before middleware runs.

---

## Vertical Padding Standards (NON-NEGOTIABLE — added 2026-05-04)

Premium DTC reference (Whoop / AG1 / Manscaped / Tonal): 64-96px
mobile, 96-128px desktop section padding. Heavier feels luxurious
but kills scroll velocity on the 70%+ mobile traffic typical of
local-business clients.

Standard for content sections on every showcase:
```
py-20 sm:py-24 lg:py-32   // 80 / 96 / 128px
```

Heavier OK (intentional drama):
- Hero (page anchor)
- Final CTA / closer ("welcome to ...")

DO NOT go heavier than `py-32 sm:py-44 lg:py-56` (128/176/224px) on
any section. Anything more reads as "the page is over."

Side padding (`px-*`) stays consistent across the page — this rule
is about TOP/BOTTOM gaps only. Reduce vertical, leave horizontal.

Quick math: each `py-28 → py-20` change saves 64px per section.
A typical showcase has ~10 sections. That's ~640px of scroll cut
out before reaching the inquiry form — about one full mobile
screen of momentum recovered without changing any copy.

If a client's design feels "tight" after this, the fix is more
internal section spacing (`space-y-*` between elements WITHIN a
section), NOT wider top/bottom gaps.

## Autonomous-Batch Execution Mode (NON-NEGOTIABLE — added 2026-05-06)

When Ben says some variant of *"tackle everything you can without my
help"* / *"do all of those"* / *"keep going"*, the working mode flips
to autonomous-batch:

1. **Don't ask permission per step.** Plan the batch up front
   (TodoWrite), then execute.
2. **One in_progress todo at a time.** Mark complete the moment each
   item is genuinely done — never batch-complete at the end.
3. **Stage your own files only.** When committing, cherry-pick paths
   that match your edits. NEVER `git add -A` or `git add .` — there
   is almost always unrelated working-tree drift from Ben's parallel
   work that must not ride into your commit.
4. **One commit per logical batch** with a body that lists every file
   touched and why.
5. **Push when committing.** Default to `git push` after the commit
   lands — don't wait for explicit permission. Ben wants the
   autonomous batch to fully ship in one motion.
6. **End with a clean leftover ledger.** Two-section summary:
   ✅ shipped (what's done) and ⚠️ still needs you (logins, calls,
   decisions, payment info, anything blocked on a human). Never
   silently skip an item — surface it.
7. **Type-check at the end of the batch**, not per-file. Pre-existing
   errors in files you didn't touch are NOT yours to fix in this
   commit; flag them but ship.

This is the mode this whole session ran in. The rule stops the
opposite failure: stopping mid-batch to ask "should I do the next
one?" when Ben already said yes to all of them.

## Storage Decision: base64-in-Postgres vs Supabase Storage (NON-NEGOTIABLE — added 2026-05-06)

**Default: store files as base64 TEXT in a Postgres column** when ALL
of these hold:
- File size ≤ 5 MB
- Total volume ≤ a few hundred files
- Accessed rarely (admin downloads, not customer-facing streams)
- Need to ship today without provisioning a Storage bucket

Examples that fit: W-9 PDFs, signed IC agreements, ID verification
docs, weekly digest snapshots, ad-hoc CSV uploads from Ben.

Reach for **Supabase Storage** only when ANY of these flips:
- Files are streamed publicly to customer browsers (hero images,
  product photos)
- Volume justifies dedicated bucket configuration + RLS policies
- File size > 5 MB (base64 inflates by ~33% — a 6 MB upload becomes
  an 8 MB row)

Canonical pattern lives in `partner_documents`
(`supabase/migrations/20260516_partner_documents.sql`):

```sql
create table partner_documents (
  id uuid primary key default gen_random_uuid(),
  <owner>_id uuid not null references <owner>(id) on delete cascade,
  kind text not null,             -- 'w9' | 'ic-agreement' | ...
  filename text not null,
  mime_type text not null,
  size_bytes integer not null,
  content_base64 text not null,
  created_at timestamptz not null default now()
);
```

Why default to Postgres: zero operational setup, no bucket-permission
forgetting, ships today, migrates to Storage cheap when needed.

## No-Backend Client Pattern (NON-NEGOTIABLE — added 2026-05-06)

When a client owns their own commerce stack (Shopify, Squarespace,
Etsy, Wix Stores) and the BlueJays site is purely a marketing front:

1. **Never POST configurator/inquiry output to `/api/clients/inquire`.**
   Use a `mailto:` link with pre-filled `subject=` and `body=` query
   params. The customer's own email client sends the request directly
   to the client.
2. **Never seed `client_owners` rows for them.** Without an owner
   row, they have no portal — that's correct. They check leads in
   their Shopify admin / their inbox, not in a BlueJays dashboard.
3. **No `client_leads`, no `client_email_campaigns`, no
   `client_subscriptions`.** Those tables are for clients on the
   $9,700 AI Marketing System tier. Marketing-only clients don't
   touch them.
4. **`client-site-urls.ts` entry stays `kind: "internal"`** when we
   host the marketing front under `/clients/<slug>`. The lack of an
   owner row is what distinguishes them from full-tier clients.
5. **Hot-link external CDN images** for product photos (e.g., the
   client's own Shopify CDN at `<store>.com/cdn/shop/files/...`).
   Don't download + re-host — they update inventory and we'd go stale.

Reference build: Laser Lakes (`src/app/clients/laser-lakes/`).
Configurator → mailto: pre-fill to `nate@laserlakes.com`.

## Partner First-Payout Gate (NON-NEGOTIABLE — added 2026-05-06)

Before any commission can leave Ben's pocket via Venmo/Zelle, the
partner record MUST have all three:

1. **Signed IC Agreement** filed at
   `docs/contracts/<Partner Name> - Independent Contractor Agreement.md`
   (template lives in same folder, copy + replace `[name]` blocks).
2. **W-9 on file** — `partners.w9_received_at IS NOT NULL`. Partners
   self-serve via `/partners/[code]/w9` (URL-as-secret). The dashboard
   at `/partners/[code]` renders a red banner until this is filled.
3. **Banking handle** — `partners.payout_handle` populated (Venmo
   handle, Zelle email, or ACH details).

Today this is enforced operationally — Ben checks before paying. When
volume grows, harden in code: `partner_referrals` payout flow
short-circuits with a clear error if any of the three is missing.

The companion-doc checklist lives at the bottom of
`docs/contracts/<name> - Independent Contractor Agreement.md` in the
template — never skip it when onboarding a partner.


---

## Locked-In Rules · 2026-05-06 evening — moved to docs/archive/2026-Q2-locked-rules.md

Manufacturer ICP buildout + Madie's portal restore. Read on demand if a question references that build.

