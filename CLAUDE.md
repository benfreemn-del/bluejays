@AGENTS.md

# BlueJays Project — The Money Printer

## Core Philosophy
This system is designed to function like a money printer. Every feature should drive toward one goal: scout businesses, build them premium websites, sell those websites at $997, and automate as much of the pipeline as possible. Efficiency = profit.

## Quality Rules (NON-NEGOTIABLE)
- **Every website must match OPS quality level** — the Olympic Protective Services site is the minimum quality bar. Numbered service cards, SVG icons (never emojis), section headers with accent words, decorative underlines, grid patterns, glow effects, rich hover states, industry-specific SVG patterns, and unique personality per category.
- **Every section must have a background** — no plain dark/flat sections. Use glows, patterns, gradients, or industry-specific SVG silhouettes. Every. Single. Section.
- **Each template must SCREAM its industry** — Real Estate screams luxury. Dental screams trust. Law screams authority. Landscaping screams nature. Salon screams beauty. If it could be any industry, it's not good enough.
- **$997 is the base price** — firm, no negotiation for agents. Period.
- **All generated sites must include the Bluejay footer branding** — "Website created by Bluejay Business Solutions" with the BluejayLogo SVG.
- **Review approval required** — sites go to "pending-review" before outreach, not straight to "contacted".
- **Color review agent must pass** — every generated site's color scheme is reviewed for vibrancy and category fit before approval.

## Customization Rules (NON-NEGOTIABLE)
Every generated website MUST be heavily customized to the specific business. Generic is unacceptable. The site generation agent must:
- **Use the business's actual logo** if available (scraped from their current site or Google Business Profile). If no logo, generate a text-based logo with their name in a style matching the industry.
- **Match their brand colors** — scrape their existing site/socials for brand colors and use those as the accent color. Only fall back to category defaults if no brand colors are found.
- **Use their actual photos** — pull photos from their Google Business Profile, existing website, and social media. Prioritize real photos over stock. Use stock only as a last resort.
- **Match their copywriting style** — if their current site is formal, be formal. If casual and friendly, match that tone. Scrape their "about" text and mirror the voice.
- **Include their real services, real prices, real testimonials** — never use placeholder data when real data is available from scraping.
- **Each generated site must feel like THEIR site** — not a template with their name swapped in. If you showed it to the business owner, they should think "this was made specifically for me."

## Scouting Rules
- **Only scout categories that have a built template** — don't scout categories we can't generate premium sites for yet.
- **Current active categories** (have premium templates): real-estate, dental, law-firm, landscaping, salon, electrician, plumber, hvac, roofing, auto-repair
- **Add new categories only after building their premium template first** — template first, then scout.

## Workflow Rules
- **Commit and push to GitHub periodically** — don't wait until the end of a session. Push after completing major features.
- **Always run `npm run build` before declaring something done** — catch TypeScript errors early.
- **Start dev server after code changes** so the user can see results immediately.
- **Ben's phone**: +12538863753 — for owner alerts
- **Ben's email**: bluejaycontactme@gmail.com

## Tech Stack
- Next.js 16 + React 19 + TypeScript + Tailwind v4 + Framer Motion
- Supabase for production database (with JSON file fallback for local dev)
- SendGrid for emails (LIVE)
- Twilio for SMS (LIVE — trial account)
- File-based store at `data/` for local development

## Key Files
- `scripts/pipeline.ts` — CLI to run scout/scrape/generate pipeline
- `src/lib/types.ts` — All types, categories, pricing, and category config
- `src/components/templates/TemplateLayout.tsx` — Shared layout for all generated sites
- `src/components/BluejayLogo.tsx` — BluejayLogo SVG component used everywhere
- `src/lib/quality-review.ts` — AI quality review agent
- `src/lib/color-review.ts` — Color scheme review agent
- `src/lib/website-quality-agent.ts` — Industry best practices per category
- `src/lib/smart-followup.ts` — Personalized follow-ups from Google reviews
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
