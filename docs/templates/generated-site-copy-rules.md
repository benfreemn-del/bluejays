# Generated Site Copy Rules (NON-NEGOTIABLE — added 2026-04-19)

Moved out of CLAUDE.md on 2026-05-07 to keep the always-loaded surface lean. Read on demand.

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

