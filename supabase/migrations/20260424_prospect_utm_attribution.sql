-- Wave-3 attribution columns for the prospects table.
--
-- Every outreach surface (email pitch, follow-ups, SMS, voicemail
-- fallback email, postcard QR) now appends UTM params to its preview
-- link via src/lib/utm.ts. When a prospect lands on /claim/[id] the
-- client reads the UTM params and posts them to /api/checkout/create,
-- which (a) attaches them to the Stripe Checkout Session metadata so
-- the `paid` webhook event can attribute the conversion AND (b)
-- persists the most recent attribution on the prospect record so the
-- dashboard can group conversions by source/campaign without joining
-- through Stripe.
--
-- All four columns are nullable — pre-Wave-3 prospects + direct
-- dashboard / referral visits won't have UTM data, and that's fine.
-- The `paid` event still goes through; we just lose attribution for
-- those rows.
--
-- Index on `last_utm_campaign` because the dashboard report groups
-- conversions by campaign label (pitch_day0 vs followup_day5_re vs
-- postcard_day7 etc.) — a btree there is enough at our scale (<10k
-- paid prospects per year for the foreseeable future).

ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS last_utm_source TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_content TEXT;

CREATE INDEX IF NOT EXISTS prospects_last_utm_campaign_idx
  ON public.prospects (last_utm_campaign)
  WHERE last_utm_campaign IS NOT NULL;
