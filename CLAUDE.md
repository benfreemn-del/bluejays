@AGENTS.md

# BlueJays Project — The Money Printer

## Core Philosophy
This system is designed to function like a money printer. Every feature should drive toward one goal: scout businesses, build them premium websites, sell those websites at $997, and automate as much of the pipeline as possible. Efficiency = profit.

## Quality Rules (NON-NEGOTIABLE)
- **Every website must match OPS quality level** — the Olympic Protective Services site is the minimum quality bar. Numbered service cards, SVG icons (never emojis), section headers with accent words, decorative underlines, grid patterns, glow effects, rich hover states, industry-specific SVG patterns, and unique personality per category.
- **Every section must have a background** — no plain dark/flat sections. Use glows, patterns, gradients, or industry-specific SVG silhouettes. Every. Single. Section.
- **Generated preview sites MUST use V2 template components** — for any category that has a V2 template, generated preview sites must render using the V2 component (not the generic PreviewRenderer). The V2 template is the quality standard. A preview sent to a business owner should look identical to the V2 showcase, just with their data injected. The generic PreviewRenderer is only for categories without a V2 template.
- **Each template must SCREAM its industry** — Real Estate screams luxury. Dental screams trust. Law screams authority. Landscaping screams nature. Salon screams beauty. If it could be any industry, it's not good enough.
- **$997 is the base price** — firm, no negotiation for agents. Period.
- **All generated sites must include the Bluejay footer branding** — "Website created by Bluejay Business Solutions" with the BluejayLogo SVG.
- **Review approval required** — sites go to "pending-review" before outreach, not straight to "contacted".
- **Color review agent must pass** — every generated site's color scheme is reviewed for vibrancy and category fit before approval.

## Image Rules (NON-NEGOTIABLE)
- **NEVER reuse the same stock photo across multiple templates** — every template must have completely unique images. If two templates use the same person photo, it's immediately obvious and kills trust.
- **Every team/staff photo must be unique per template** — no sharing headshots between electrician, plumber, dental, etc.
- **Verify all image URLs actually load** — broken images are unacceptable. Test before deploying.
- **For generated preview sites**: use the business's real photos when scraped. Only fall back to stock as last resort, and never reuse stock across different prospects.
- **Stock images are LAST RESORT only** — always attempt to use scraped photos from the business's website first. Only use hardcoded stock images if nothing of reasonable quality can be scraped. A real photo of their actual business (even if lower quality) is better than a generic stock photo.

## Customization Rules (NON-NEGOTIABLE)
Every generated website MUST be heavily customized to the specific business. Generic is unacceptable. The site generation agent must:
- **Use the business's actual logo** if available (scraped from their current site or Google Business Profile). If no logo, generate a text-based logo with their name in a style matching the industry.
- **Match their brand colors** — scrape their existing site/socials for brand colors and use those as the accent color. Only fall back to category defaults if no brand colors are found.
- **Use their actual photos** — pull photos from their Google Business Profile, existing website, and social media. Prioritize real photos over stock. Use stock only as a last resort.
- **Match their copywriting style** — if their current site is formal, be formal. If casual and friendly, match that tone. Scrape their "about" text and mirror the voice.
- **Include their real services, real prices, real testimonials** — never use placeholder data when real data is available from scraping.
- **Each generated site must feel like THEIR site** — not a template with their name swapped in. If you showed it to the business owner, they should think "this was made specifically for me."

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
- **Current highest templates by category**: electrician=V2, plumber=V2, hvac=V2, roofing=V2, auto-repair=V2, dental=V2, law-firm=V2, salon=V2, fitness=V2, real-estate=V2, church=V2. All other categories=V1.

### Failsafe 3: Image Quality & Visual Premium Agent
This agent reviews scraped/Google photos BEFORE they go into the generated site:
- **Check image quality** — blurry, tiny, dark, or poorly composed photos must be REJECTED. In these cases, use high-quality stock photos instead. This is the ONE exception to the "real photos first" rule: a bad photo is worse than a good stock photo.
- **Check color scheme** — does the accent color work? Is the palette vibrant and professional? Does it match the industry's premium feel? A site with a muddy or clashing color scheme fails.
- **Check premium feel** — does this site look like a $997 product? Would a business owner be impressed? If it looks cheap, generic, or amateur, it FAILS.
- **Image replacement authority** — this agent has the authority to swap low-quality scraped photos for premium stock alternatives. Customization matters, but visual quality matters MORE. A stunning stock photo beats a blurry phone photo every time.
- **This agent's review is part of the pipeline** — no site can be marked "pending-review" without passing the image quality check.

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
- **Categories with FULL V2 pipeline (showcase + dynamic renderer + preview routing)**: electrician, dental, law-firm, salon, fitness, real-estate, church, plumber, hvac, roofing, auto-repair (ALL 11 V2 categories complete)

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
  - When updating sales copy, apply: benefit-first headlines, social proof, urgency without sleaze, objection preemption, CRO principles, psychological triggers, A/B testing mindset. Think like a growth marketer.
- **Version the improvements** — when the sales strategy is updated, log what changed and why (e.g., "Changed email 1 subject line because open rate was 12%, new version targets 25%"). This creates an audit trail of what's working.

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

## Tech Stack
- Next.js 16 + React 19 + TypeScript + Tailwind v4 + Framer Motion
- Supabase for production database (with JSON file fallback for local dev)
- SendGrid for emails (LIVE)
- Twilio for SMS (LIVE — trial account)
- File-based store at `data/` for local development

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

## Active Template Categories (30 total)
real-estate, dental, law-firm, landscaping, salon, electrician, plumber, hvac, roofing, auto-repair, chiropractic, fitness, veterinary, photography, cleaning, pest-control, accounting, moving, florist, daycare, insurance, interior-design, tattoo, martial-arts, physical-therapy, tutoring, pool-spa, general-contractor, catering, pet-services

## Gallery-Heavy Categories
These categories MUST have prominent visual galleries/portfolios as a primary feature:
tattoo, photography, interior-design, florist, landscaping, salon, catering, pet-services
