# V2 Site Config Migration Guide

> **Audit roadmap #6** · ~10 hrs across all 47 templates · ship one
> template at a time as prospects close — no upfront speculative work.

## What this is

The 47 V2 site templates at `src/app/v2/<category>/page.tsx` are
1,000-1,400 lines each. Industry copy + design is shared across every
prospect in a category (e.g. every electrician site has the same
hero structure), but per-tenant strings (business name, phone,
address, hero image, brand color, testimonials) are baked inline as
literal strings.

This guide walks the operator through extracting those per-tenant
strings into a `V2SiteConfig` registry entry — turning each template
from "1 hardcoded site" into "1 template + N tenants × 1 config each."

## Foundation already shipped

- `src/lib/v2-site-configs.ts` — type + registry + helpers
  (`getV2SiteConfig` / `listConfigsByCategory` / `placeholderConfig`)
- Anchor config: `meyer-electric` (electrician category) — proves the
  pattern + serves as the template-author's reference

## When to migrate a template

**Trigger:** a prospect closes in a category that doesn't yet have a
config-extracted template.

**Don't migrate speculatively.** The audit is explicit: "don't
pre-customize V2 templates for prospects who aren't paying." The 47
templates work as-is for cold-pitch previews; only closed-deal
prospects warrant the config-extraction work.

## The migration recipe

### Step 1 — Identify the per-tenant strings in the template

Open `src/app/v2/<category>/page.tsx`. Search for these patterns
(grep `meyer-electric` for the recipe used on the anchor):

| Pattern | Action |
|---|---|
| Business-name string literals (e.g. `"Meyer Electric"`) | Extract to `cfg.businessName` |
| Phone numbers (regex `\(\d{3}\)\s\d{3}-\d{4}`) | Extract to `cfg.phone` |
| Email addresses (`hello@`, `info@`) | Extract to `cfg.email` |
| Hardcoded city + state (Sequim WA, etc.) | Extract to `cfg.address` |
| Hero image URLs (`unsplash.com/...`) | Extract to `cfg.heroImage` |
| Brand-accent hex colors | Extract to `cfg.brandColor` |
| Service-line names + descriptions | Extract to `cfg.serviceLines` array |
| Testimonial quote + author + context | Extract to `cfg.testimonials` array |

Tip: many V2 templates ALREADY use string constants near the top —
those convert 1:1.

### Step 2 — Add a config entry

In `src/lib/v2-site-configs.ts`, add a new const inside the file
modeled on `MEYER_ELECTRIC`:

```ts
const NEW_TENANT: V2SiteConfig = {
  slug: "new-tenant-slug",
  category: "<category>",
  businessName: "...",
  // ...all the V2SiteConfig fields, populated from step 1
};

const REGISTRY: Record<string, V2SiteConfig> = {
  "meyer-electric": MEYER_ELECTRIC,
  "new-tenant-slug": NEW_TENANT,
};
```

### Step 3 — Refactor the template

Top of the V2 page:

```tsx
import { getV2SiteConfig, placeholderConfig } from "@/lib/v2-site-configs";

const cfg = getV2SiteConfig("<category>", "<slug>") ?? placeholderConfig("<category>");
```

Then swap inline literals for `cfg.businessName`, `cfg.phone`, etc.

For per-tenant sub-routes (e.g. `/v2/electrician/meyer-electric`),
read the slug from the route param instead of hardcoding it.

### Step 4 — Verify

- Run `npx tsc --noEmit -p tsconfig.json` and confirm no errors.
- Hit `/v2/<category>` in dev and confirm the page renders the
  config'd strings instead of the old hardcoded ones.
- For per-tenant sub-routes, also hit `/v2/<category>/<slug>`.
- For any existing prospect screenshot in the docs/legal trail, do a
  diff to confirm no copy regression.

## Why config registry, not a more clever approach

We intentionally pass on:
- **A single dynamic renderer for all 47 templates.** Each category's
  copy + photos + interactive features are industry-specific. A
  single renderer would be either incoherent or massively bloated.
- **A YAML / Markdown / DB-driven config.** Type-safety wins; the
  V2SiteConfig interface in TS catches missing fields at compile
  time. Adding a new field = update the type + every config gets
  flagged for the missing key.
- **Pre-migrating all 47 templates speculatively.** Wasted work
  until prospects land. Migrate on-close.

## Status after this commit

| Templates with config-extracted V2SiteConfig | 1 / 47 |
|---|---|
| Pattern verified end-to-end | ✓ (Meyer Electric anchor) |
| Migration path documented | ✓ (this file) |
| Estimated effort per remaining template | ~10 min |
| Total remaining effort | ~7-8 hrs (46 × 10 min, slack for unusual ones) |

Migrate one at a time as prospects close. Reference this guide and
the Meyer Electric anchor each time.
