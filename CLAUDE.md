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
- `src/middleware.ts` — Auth protection (portfolio public, dashboard behind login)

## Auth
- Portfolio (/, /templates/*, /preview/*, /claim/*) = PUBLIC
- Dashboard, lead pages, API routes = PROTECTED (login required)
- Password: set via ADMIN_PASSWORD env var (default: bluejay2026)
