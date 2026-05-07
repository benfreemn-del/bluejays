# Quality Gate — TWO Failsafes (NON-NEGOTIABLE)

Moved out of CLAUDE.md on 2026-05-07 to keep the always-loaded surface lean. Read this file on demand when the topic comes up.

---

<!-- moved from CLAUDE.md: ## Quality Gate — TWO Failsafes (NON-NEGOTIABLE) -->

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


---

