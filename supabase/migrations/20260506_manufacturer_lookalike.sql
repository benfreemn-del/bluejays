-- 20260506_manufacturer_lookalike.sql
-- Adds the manufacturer-lookalike scout tagging fields to prospects.
-- Wave 4 / 2026-05-06: 6 mfg-* slugs added to ACTIVE_CATEGORIES per the
-- deep dive on ITC + Zenith + Nevarland Outpost (3 anchors).
--
-- See:
--   - bluejays/src/lib/scout.ts (MANUFACTURER_LOOKALIKE_CATEGORIES)
--   - bluejays/src/lib/scout-optimizer.ts (SMART_QUERIES mfg-* entries)
--   - bluejays/docs/MANUFACTURER_BACKLOG.md (per-category sub-niches)
--   - bluejays/src/lib/types.ts (Prospect.lookalikeCategory + .defensibilityScore)

ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS lookalike_category TEXT
    CHECK (lookalike_category IN (
      'mfg-ag-equipment',
      'mfg-sports-equipment',
      'mfg-apparel-kids',
      'mfg-auto-parts',
      'mfg-outdoor-gear',
      'mfg-food-bev'
    ));

ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS defensibility_score INTEGER
    CHECK (defensibility_score IS NULL OR (defensibility_score >= 0 AND defensibility_score <= 100));

-- Partial index on lookalike_category for the dashboard's "manufacturer
-- pipeline" panel hot path (only ~100s of mfg-* rows expected; vast
-- majority of prospects are NULL on this column).
CREATE INDEX IF NOT EXISTS prospects_lookalike_category_idx
  ON public.prospects (lookalike_category)
  WHERE lookalike_category IS NOT NULL;

-- Index on defensibility_score for filtering low-specificity prospects
-- before pitch-cycle spend. Threshold is currently informational (no
-- automated gate yet) but the index makes "show me all <30 score"
-- queries cheap.
CREATE INDEX IF NOT EXISTS prospects_defensibility_score_idx
  ON public.prospects (defensibility_score)
  WHERE defensibility_score IS NOT NULL;
