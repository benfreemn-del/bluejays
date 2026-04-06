@AGENTS.md

# BlueJays Project

## Workflow Rules
- **Commit and push to GitHub periodically** — don't wait until the end of a session. Push after completing major features.
- **Always run `npm run build` before declaring something done** — catch TypeScript errors early.
- **Start dev server after code changes** so the user can see results immediately.
- **Every generated website section must have a background** — no plain dark/flat sections. Use glows, patterns, gradients, or industry-specific SVG silhouettes.
- **$997 is the base price** — firm, no negotiation for agents.
- **All generated sites must include the Bluejay footer branding** — "Website created by Bluejay Business Solutions" with the BluejayLogo SVG.
- **Review approval required** — sites go to "pending-review" before outreach, not straight to "contacted".

## Tech Stack
- Next.js 16 + React 19 + TypeScript + Tailwind v4 + Framer Motion
- Supabase for production database (with JSON file fallback for local dev)
- File-based store at `data/` for local development

## Key Files
- `scripts/pipeline.ts` — CLI to run scout/scrape/generate pipeline
- `src/lib/types.ts` — All types, categories, pricing, and category config
- `src/components/templates/TemplateLayout.tsx` — Shared layout for all generated sites
- `src/components/templates/SectionBackground.tsx` — Industry-specific section backgrounds
- `src/components/BluejayLogo.tsx` — BluejayLogo SVG component used everywhere
