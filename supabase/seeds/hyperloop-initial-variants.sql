-- Hyperloop initial ad-copy variants (Q7A from Ben's todo list)
-- 4 × ad_copy_meta + 4 × ad_copy_google. Hormozi tone, 3rd-grade reading level
-- per Rule 61. All variants seeded with verdict='insufficient_data' so the
-- Bayesian thresholds (200 imp verdict / 400 imp loser) gate them properly.
--
-- Run in Supabase SQL editor. Idempotent — uses ON CONFLICT DO NOTHING on
-- variant_name unique-by-kind. Re-run safely.
--
-- After seeding:
--   1. Visit /dashboard/hyperloop to verify the 8 rows are visible
--   2. When ready, map them to your Meta + Google ad creatives via the
--      mapping UI (Stage 2 Commit E shipped this — variant.metadata.platformAdId)
--   3. Hyperloop weekly cron (16:00 UTC Mondays) starts measuring once
--      MIN_READY_AUDITS_TO_WAKE (100) + MIN_PAID_CUSTOMERS_TO_WAKE (5) hit
--
-- ─── META ad copy (4 variants) ───────────────────────────────────────────
-- Schema per src/lib/hyperloop-variant-gen.ts:
--   { headline: string (<=30 chars), primaryText: string (<=90 chars),
--     cta: 'Learn More'|'Get Quote'|'Sign Up' }

INSERT INTO hyperloop_variants (kind, variant_name, content, status, metadata)
VALUES
  (
    'ad_copy_meta',
    'meta_money_leak_v1',
    '{"headline": "Your site is leaking $$$", "primaryText": "Free 60-sec audit shows where leads die. No signup.", "cta": "Learn More"}'::jsonb,
    'active',
    '{"angle": "loss_aversion", "source": "seed_2026_04_26", "ai_model_used": null}'::jsonb
  ),
  (
    'ad_copy_meta',
    'meta_score_v1',
    '{"headline": "Score your site 0-100", "primaryText": "60 seconds. Free. We show the 3 fixes that move money.", "cta": "Get Quote"}'::jsonb,
    'active',
    '{"angle": "concrete_score", "source": "seed_2026_04_26", "ai_model_used": null}'::jsonb
  ),
  (
    'ad_copy_meta',
    'meta_competitor_v1',
    '{"headline": "Beat your competitor''s site", "primaryText": "Free audit. 60 sec. See why theirs gets the call, not yours.", "cta": "Learn More"}'::jsonb,
    'active',
    '{"angle": "fomo_competitor", "source": "seed_2026_04_26", "ai_model_used": null}'::jsonb
  ),
  (
    'ad_copy_meta',
    'meta_direct_pain_v1',
    '{"headline": "Why no calls from your site?", "primaryText": "Find out free in 60 sec. We score it 0-100 and tell you why.", "cta": "Sign Up"}'::jsonb,
    'active',
    '{"angle": "direct_question", "source": "seed_2026_04_26", "ai_model_used": null}'::jsonb
  )
ON CONFLICT DO NOTHING;

-- ─── GOOGLE ad copy (4 variants) ─────────────────────────────────────────
-- Schema per src/lib/hyperloop-variant-gen.ts:
--   { headlines: [string × 3, each <=30 chars],
--     descriptions: [string × 2, each <=90 chars] }

INSERT INTO hyperloop_variants (kind, variant_name, content, status, metadata)
VALUES
  (
    'ad_copy_google',
    'google_score_focused_v1',
    '{"headlines": ["Free Website Audit", "Score Your Site 0-100", "See the 3 Fixes"], "descriptions": ["Free. 60 seconds. We show why your site isn''t booking jobs.", "No signup. No credit card. Just an honest score."]}'::jsonb,
    'active',
    '{"angle": "score_focus", "source": "seed_2026_04_26", "ai_model_used": null}'::jsonb
  ),
  (
    'ad_copy_google',
    'google_money_leak_v1',
    '{"headlines": ["Your Site Leaks Leads", "Find the Money Leak", "Free 60-Sec Audit"], "descriptions": ["See exactly which fixes are worth real money.", "Free audit. 60 seconds. No signup needed."]}'::jsonb,
    'active',
    '{"angle": "loss_aversion", "source": "seed_2026_04_26", "ai_model_used": null}'::jsonb
  ),
  (
    'ad_copy_google',
    'google_direct_action_v1',
    '{"headlines": ["Why No Calls?", "Free Site Score", "60-Second Audit"], "descriptions": ["Find out why customers go to your competitor.", "Plain-English fixes. No jargon. 60 seconds."]}'::jsonb,
    'active',
    '{"angle": "direct_pain", "source": "seed_2026_04_26", "ai_model_used": null}'::jsonb
  ),
  (
    'ad_copy_google',
    'google_comparison_v1',
    '{"headlines": ["Beat Your Competitor", "Audit Your Site Free", "Score: 0-100"], "descriptions": ["See the gap between your site and the gold standard.", "Free. 60 seconds. The 3 fixes that actually matter."]}'::jsonb,
    'active',
    '{"angle": "fomo_competitor", "source": "seed_2026_04_26", "ai_model_used": null}'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Verify the seed landed:
-- SELECT kind, variant_name, content, status, created_at
-- FROM hyperloop_variants
-- WHERE variant_name LIKE '%_v1' AND metadata->>'source' = 'seed_2026_04_26'
-- ORDER BY kind, variant_name;
