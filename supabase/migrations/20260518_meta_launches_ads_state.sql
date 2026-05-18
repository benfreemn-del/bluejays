-- Adds `ads_state` JSONB to meta_launches for Phase 2 (ad creatives + ads).
--
-- Shape: { [hook_id]: {
--   image_hash?: string,        // present for image ads after upload
--   video_id?: string,          // present for video ads after upload
--   video_status?: string,      // "ready" once Meta finishes processing
--   creative_id?: string,       // set after POST /act_X/adcreatives
--   ad_id?: string,             // set after POST /act_X/ads
--   status?: "complete" | "video_processing" | "failed",
--   last_error?: string         // most recent failure reason for this hook
-- } }
--
-- One key per `WAVE_1.ad_sets[i].ads[j].hook_id` (12 keys for wave-1).
-- Phase 2 reads this column to decide which ads still need work and
-- writes it back at end-of-run so the next invocation only retries
-- failed/missing hooks. Re-running `bj meta launch wave-1 --phase ads`
-- after a partial failure is safe — completed hooks short-circuit.

alter table meta_launches
  add column if not exists ads_state jsonb not null default '{}'::jsonb;

comment on column meta_launches.ads_state is
  'Phase 2 progress map keyed by hook_id. Each entry tracks image_hash / video_id / creative_id / ad_id / status / last_error. Re-running bj meta launch <wave> --phase ads skips hooks whose ad_id is already populated.';
