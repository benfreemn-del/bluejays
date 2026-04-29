-- Case studies = public, indexable versions of audits.
-- Every audit at /audit/[uuid] is private (URL-as-secret). Publishing
-- creates a *separate* public URL at /case-studies/[slug] that's:
--   - human-readable (slug = business-name kebab)
--   - opted-in (only if published_at is non-null)
--   - SEO-optimized (separate render with structured data, less funnel)
--
-- Compounds over time: every audit Ben runs becomes a free permanent
-- piece of expert-level SEO content about that business + category.

ALTER TABLE site_audits
  ADD COLUMN IF NOT EXISTS case_study_slug text,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- Slug must be unique across all audits since it's the public URL key.
-- Allowing nulls so unpublished audits don't need a slug.
CREATE UNIQUE INDEX IF NOT EXISTS site_audits_case_study_slug_unique
  ON site_audits(case_study_slug)
  WHERE case_study_slug IS NOT NULL;

-- Common query: "list all published case studies, newest first"
CREATE INDEX IF NOT EXISTS site_audits_published_idx
  ON site_audits(published_at DESC NULLS LAST)
  WHERE published_at IS NOT NULL;

-- Reload PostgREST schema cache so the API sees the new columns
NOTIFY pgrst, 'reload schema';
