/**
 * Meta Marketing API launch orchestrator.
 *
 * Owns the "create campaign + ad sets + ads + creatives from a spec"
 * workflow. Different from src/lib/meta-ads-client.ts which handles
 * ongoing operations (insights pulls, ad pause/unpause, budget
 * updates).
 *
 * Two-phase split:
 *   - Phase 1 ("skeleton"): create campaign + ad sets, all PAUSED.
 *     Lands tonight — doesn't require any HyperAgent images.
 *   - Phase 2 ("ads"): upload image/video assets + create 12 ad
 *     creatives + 12 ads. Lands AFTER Ben has the HyperAgent images
 *     in /public/ad-assets/wave-1/.
 *
 * Idempotency: every launch persists progress to the `meta_launches`
 * table keyed by `wave`. Re-running `bj meta launch wave-1` reads
 * the existing row and skips already-created resources. Safe to call
 * after a partial failure.
 *
 * All Meta resources are created with status=PAUSED. Ben unpauses in
 * Ads Manager after a manual sanity check (targeting refinement,
 * creative review).
 */

import { readFile } from "fs/promises";
import path from "path";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { logCost } from "@/lib/cost-logger";
import {
  buildAdDestinationUrl,
  type WaveSpec,
  type AdSetSpec,
  type AdSpec,
} from "./ads-spec/wave-1";

const META_BASE_URL = "https://graph.facebook.com";
const DEFAULT_API_VERSION = "v21.0";

// ── Types ──────────────────────────────────────────────────────────

export type LaunchPhase = "skeleton" | "ads" | "complete";
export type LaunchStatus = "in_progress" | "complete" | "failed";

/** Per-hook Phase-2 progress state. Persisted in
 *  meta_launches.ads_state JSONB keyed by hook_id. */
export type AdState = {
  image_hash?: string;
  video_id?: string;
  video_status?: string;
  creative_id?: string;
  ad_id?: string;
  status?: "complete" | "video_processing" | "failed";
  last_error?: string;
};

export type LaunchRow = {
  id: string;
  wave: string;
  campaign_id: string | null;
  campaign_name: string | null;
  ad_set_ids: Array<{ audience: string; id: string; name: string }>;
  ad_ids: Array<{ hook_id: string; id: string }>;
  image_hashes: Record<string, string>;
  video_ids: Record<string, string>;
  ads_state: Record<string, AdState>;
  phase: LaunchPhase;
  status: LaunchStatus;
  notes: string | null;
};

export type SkeletonResult = {
  ok: boolean;
  wave: string;
  campaign: { id: string; name: string; created: boolean };
  ad_sets: Array<{
    audience: string;
    id: string;
    name: string;
    created: boolean;
  }>;
  errors: string[];
};

export type AdsResultEntry = {
  hook_id: string;
  audience: string;
  outcome: "created" | "skipped" | "failed" | "video_processing";
  creative_id?: string;
  ad_id?: string;
  error?: string;
};

export type AdsResult = {
  ok: boolean;
  wave: string;
  /** Per-ad outcome. Length always equals total ads in the spec. */
  results: AdsResultEntry[];
  /** Summary counts. */
  created: number;
  skipped: number;
  failed: number;
  video_processing: number;
  errors: string[];
};

// ── Config helpers ─────────────────────────────────────────────────

function getCfg(): {
  token: string;
  accountId: string;
  apiVersion: string;
  pageId: string;
  instagramActorId: string;
} {
  const token = (process.env.META_ADS_SYSTEM_TOKEN || "").trim();
  const rawAccount = (process.env.META_ADS_ACCOUNT_ID || "").trim();
  const apiVersion = (process.env.META_ADS_API_VERSION || DEFAULT_API_VERSION).trim();
  const pageId = (process.env.META_ADS_PAGE_ID || "").trim();
  const instagramActorId = (process.env.META_ADS_INSTAGRAM_ACTOR_ID || "").trim();
  const accountId = rawAccount.startsWith("act_") ? rawAccount : `act_${rawAccount}`;
  if (!token || !rawAccount) {
    throw new Error(
      "Meta env not configured: need META_ADS_SYSTEM_TOKEN + META_ADS_ACCOUNT_ID",
    );
  }
  return { token, accountId, apiVersion, pageId, instagramActorId };
}

/** Phase 2 requires META_ADS_PAGE_ID (creative.object_story_spec.page_id
 *  is mandatory). META_ADS_INSTAGRAM_ACTOR_ID is recommended but
 *  optional (without it, Meta still serves on FB but not as a native
 *  IG post — it'll render as a "FB cross-post" on IG placements). */
function assertPhase2Env(cfg: ReturnType<typeof getCfg>): void {
  if (!cfg.pageId) {
    throw new Error(
      "Phase 2 requires META_ADS_PAGE_ID — set the FB Page ID that ads will publish under.",
    );
  }
}

// ── Persistence helpers ───────────────────────────────────────────

async function getOrCreateLaunchRow(wave: string): Promise<LaunchRow | null> {
  if (!isSupabaseConfigured()) return null;
  const { data: existing } = await supabase
    .from("meta_launches")
    .select("*")
    .eq("wave", wave)
    .maybeSingle();
  if (existing) return existing as LaunchRow;

  const { data: created } = await supabase
    .from("meta_launches")
    .insert({
      wave,
      phase: "skeleton" as const,
      status: "in_progress" as const,
    })
    .select("*")
    .single();
  return (created as LaunchRow | null) ?? null;
}

async function patchLaunchRow(
  wave: string,
  patch: Partial<{
    campaign_id: string;
    campaign_name: string;
    ad_set_ids: Array<{ audience: string; id: string; name: string }>;
    ad_ids: Array<{ hook_id: string; id: string }>;
    image_hashes: Record<string, string>;
    video_ids: Record<string, string>;
    ads_state: Record<string, AdState>;
    phase: LaunchPhase;
    status: LaunchStatus;
    notes: string;
  }>,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await supabase
    .from("meta_launches")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("wave", wave);
}

// ── Graph API helpers ──────────────────────────────────────────────

async function graphPost<T>(args: {
  apiVersion: string;
  path: string;
  body: Record<string, string>;
  token: string;
}): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const url = `${META_BASE_URL}/${args.apiVersion}/${args.path}`;
  const form = new URLSearchParams({
    ...args.body,
    access_token: args.token,
  });
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    if (!r.ok) {
      // Meta error envelope: { error: { message, type, code,
      // error_subcode, error_user_title, error_user_msg, fbtrace_id } }
      // Surface code + subcode + user_msg verbatim so the CLI shows
      // Ben exactly which permission/operation is rejected (not just
      // the generic "Permissions error" message).
      type ErrPayload = {
        error?: {
          message?: string;
          code?: number;
          error_subcode?: number;
          error_user_msg?: string;
          error_user_title?: string;
          fbtrace_id?: string;
        };
      };
      const errBody = (await r.json().catch(() => ({}))) as ErrPayload;
      const err = errBody.error || {};
      const parts: string[] = [];
      parts.push(err.message || `HTTP ${r.status}`);
      if (err.code !== undefined) parts.push(`code=${err.code}`);
      if (err.error_subcode !== undefined)
        parts.push(`subcode=${err.error_subcode}`);
      if (err.error_user_msg) parts.push(`details: ${err.error_user_msg}`);
      if (err.fbtrace_id) parts.push(`fbtrace=${err.fbtrace_id}`);
      return { ok: false, error: parts.join(" · ") };
    }
    return { ok: true, data: (await r.json()) as T };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── Phase 1: skeleton (campaign + ad sets) ────────────────────────

/**
 * Create the campaign + 3 ad sets in PAUSED state. Idempotent —
 * reads meta_launches and skips already-created resources. Returns
 * a summary the CLI can render.
 *
 * Doesn't touch ads / creatives / image upload — those are Phase 2.
 */
export async function launchSkeleton(spec: WaveSpec): Promise<SkeletonResult> {
  const cfg = getCfg();
  const errors: string[] = [];

  // Pull or create the meta_launches row up front
  const row = await getOrCreateLaunchRow(spec.wave);
  const existingAdSets = row?.ad_set_ids || [];

  // ── 1) Campaign ──
  let campaignId = row?.campaign_id || "";
  let campaignName = row?.campaign_name || spec.campaign_name;
  let campaignCreated = false;

  if (!campaignId) {
    type CampaignResp = { id: string };
    const r = await graphPost<CampaignResp>({
      apiVersion: cfg.apiVersion,
      path: `${cfg.accountId}/campaigns`,
      token: cfg.token,
      body: {
        name: spec.campaign_name,
        objective: spec.campaign_objective,
        status: "PAUSED",
        // Meta-required: declare which special ad category if any.
        // We're not in housing/employment/credit/political, so [] is the
        // correct value (must be sent explicitly).
        special_ad_categories: "[]",
        // OUTCOME-prefixed objectives need a buying type — AUCTION is default
        buying_type: "AUCTION",
        // Required for campaigns that use AD-SET-level budgets instead
        // of Campaign Budget Optimization. False = each ad set's daily
        // budget is independent (what we want for A/B testing audiences
        // cleanly). True would let Meta shift 20% across ad sets, which
        // hurts attribution per-audience until a winner is locked in.
        is_adset_budget_sharing_enabled: "false",
      },
    });
    if (!r.ok) {
      await patchLaunchRow(spec.wave, {
        status: "failed",
        notes: `campaign create failed: ${r.error}`,
      });
      return {
        ok: false,
        wave: spec.wave,
        campaign: { id: "", name: campaignName, created: false },
        ad_sets: [],
        errors: [`campaign create: ${r.error}`],
      };
    }
    campaignId = r.data.id;
    campaignCreated = true;
    await patchLaunchRow(spec.wave, {
      campaign_id: campaignId,
      campaign_name: campaignName,
    });
    await logCost({
      service: "meta_ads",
      action: "createCampaign",
      costUsd: 0,
      metadata: { wave: spec.wave, campaign_id: campaignId },
    }).catch(() => {});
  }

  // ── 2) Ad sets (one per audience) ──
  const adSetResults: SkeletonResult["ad_sets"] = [];
  const newAdSetIds = [...existingAdSets];

  for (const adSetSpec of spec.ad_sets) {
    const existing = existingAdSets.find((a) => a.audience === adSetSpec.audience);
    if (existing) {
      adSetResults.push({
        audience: adSetSpec.audience,
        id: existing.id,
        name: existing.name,
        created: false,
      });
      continue;
    }

    const result = await createAdSet({
      cfg,
      campaignId,
      adSet: adSetSpec,
      optimizationEvent: spec.optimization_event,
    });
    if (!result.ok) {
      errors.push(`ad set ${adSetSpec.audience}: ${result.error}`);
      continue;
    }
    adSetResults.push({
      audience: adSetSpec.audience,
      id: result.id,
      name: adSetSpec.name,
      created: true,
    });
    newAdSetIds.push({
      audience: adSetSpec.audience,
      id: result.id,
      name: adSetSpec.name,
    });
  }

  // Persist the merged ad-set list back to meta_launches
  await patchLaunchRow(spec.wave, {
    ad_set_ids: newAdSetIds,
    phase: "skeleton",
    status: errors.length === 0 ? "in_progress" : "failed",
    notes: errors.length > 0 ? errors.join(" · ") : "",
  });

  return {
    ok: errors.length === 0,
    wave: spec.wave,
    campaign: { id: campaignId, name: campaignName, created: campaignCreated },
    ad_sets: adSetResults,
    errors,
  };
}

async function createAdSet(args: {
  cfg: ReturnType<typeof getCfg>;
  campaignId: string;
  adSet: AdSetSpec;
  optimizationEvent: "Lead";
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { cfg, campaignId, adSet } = args;

  // Convert Pixel-event-name to Meta's optimization_goal + custom_event_type.
  // For "Lead" we use OFFSITE_CONVERSIONS + the Pixel ID.
  const pixelId = (process.env.NEXT_PUBLIC_META_PIXEL_ID || "").trim();
  if (!pixelId) {
    return {
      ok: false,
      error: "NEXT_PUBLIC_META_PIXEL_ID env missing — can't wire optimization",
    };
  }

  const promoted_object = JSON.stringify({
    pixel_id: pixelId,
    custom_event_type: "LEAD",
  });

  type AdSetResp = { id: string };
  const r = await graphPost<AdSetResp>({
    apiVersion: cfg.apiVersion,
    path: `${cfg.accountId}/adsets`,
    token: cfg.token,
    body: {
      name: adSet.name,
      campaign_id: campaignId,
      status: "PAUSED",
      // Meta budgets are in cents — 15 USD = 1500
      daily_budget: String(Math.round(adSet.daily_budget_usd * 100)),
      billing_event: "IMPRESSIONS",
      optimization_goal: "OFFSITE_CONVERSIONS",
      promoted_object,
      // Meta requires advantage_audience to be explicitly set (1 or 0).
      // We default to 0 (disabled) so Ben refines targeting manually in
      // Ads Manager before unpausing — auto-expansion would override the
      // hand-tuned interest seeds.
      targeting: JSON.stringify({
        ...adSet.targeting,
        targeting_automation: { advantage_audience: 0 },
      }),
      bid_strategy: "LOWEST_COST_WITHOUT_CAP",
      // Required when status=PAUSED + budget: declare start time
      start_time: new Date().toISOString(),
    },
  });
  if (!r.ok) return { ok: false, error: r.error };

  await logCost({
    service: "meta_ads",
    action: "createAdSet",
    costUsd: 0,
    metadata: {
      campaign_id: campaignId,
      ad_set_id: r.data.id,
      audience: adSet.audience,
    },
  }).catch(() => {});

  return { ok: true, id: r.data.id };
}

// ── Phase 2: ads (image upload + creatives + ads) ─────────────────
//
// Reads the wave spec + the existing meta_launches row, then for each
// of the 12 ads:
//   1. If image: POST /act_X/adimages with the file binary → image_hash
//      If video: POST /act_X/advideos with the file binary → video_id,
//                then poll GET /<video_id>?fields=status until ready.
//   2. POST /act_X/adcreatives with object_story_spec referencing the
//      image_hash OR video_id + headline + body + CTA + URL.
//   3. POST /act_X/ads with creative_id + adset_id + name + PAUSED.
//   4. Persist per-hook progress into meta_launches.ads_state JSONB
//      keyed by hook_id so the next run skips completed hooks.
//
// Failure isolation: a single ad failing (image upload, creative
// rejection, ad create error) records last_error on that hook's
// ads_state entry and continues to the next ad. End-of-run summary
// counts created / skipped / failed / video_processing.
//
// Idempotency: an ad whose ads_state[hook_id].ad_id is already set
// is skipped wholesale. Partially-progressed hooks (image_hash set
// but ad_id not) resume from wherever they left off.
//
// Video-processing ceiling: 5 minutes of polling. Videos that
// haven't finished processing record status="video_processing" and
// keep their video_id, so the next invocation picks them up.
//
// Re-export the URL builder so callers don't need a second import.
export { buildAdDestinationUrl };

const META_BASE_URL_PHASE2 = META_BASE_URL;

/**
 * Phase 2 entry point. Creates one creative + one ad per AdSpec in
 * the wave, in PAUSED state. Requires Phase 1 to have completed —
 * errors if meta_launches has no campaign_id / ad_set_ids yet.
 */
export async function launchAds(spec: WaveSpec): Promise<AdsResult> {
  const cfg = getCfg();
  assertPhase2Env(cfg);

  const errors: string[] = [];
  const results: AdsResultEntry[] = [];

  const row = await getLaunchStatus(spec.wave);
  if (!row) {
    return {
      ok: false,
      wave: spec.wave,
      results: [],
      created: 0,
      skipped: 0,
      failed: 0,
      video_processing: 0,
      errors: [
        `no meta_launches row for ${spec.wave} — run Phase 1 first (bj meta launch ${spec.wave} --phase skeleton)`,
      ],
    };
  }
  if (!row.campaign_id) {
    return {
      ok: false,
      wave: spec.wave,
      results: [],
      created: 0,
      skipped: 0,
      failed: 0,
      video_processing: 0,
      errors: [
        `meta_launches.${spec.wave} has no campaign_id — Phase 1 did not complete`,
      ],
    };
  }

  const adSetByAudience = new Map<string, { id: string; name: string }>();
  for (const a of row.ad_set_ids || []) {
    adSetByAudience.set(a.audience, { id: a.id, name: a.name });
  }

  const adsState: Record<string, AdState> = { ...(row.ads_state || {}) };

  for (const adSetSpec of spec.ad_sets) {
    const adSet = adSetByAudience.get(adSetSpec.audience);
    if (!adSet) {
      const err = `no ad set found for audience=${adSetSpec.audience} — Phase 1 did not create it`;
      errors.push(err);
      for (const ad of adSetSpec.ads) {
        results.push({
          hook_id: ad.hook_id,
          audience: ad.audience,
          outcome: "failed",
          error: err,
        });
      }
      continue;
    }

    for (const adSpec of adSetSpec.ads) {
      const entry = await processAd({
        cfg,
        spec,
        adSpec,
        adSet,
        state: adsState[adSpec.hook_id] || {},
      });
      adsState[adSpec.hook_id] = entry.state;
      results.push(entry.result);
      if (entry.result.outcome === "failed" && entry.result.error) {
        errors.push(`${adSpec.hook_id}: ${entry.result.error}`);
      }
    }
  }

  const created = results.filter((r) => r.outcome === "created").length;
  const skipped = results.filter((r) => r.outcome === "skipped").length;
  const failed = results.filter((r) => r.outcome === "failed").length;
  const video_processing = results.filter(
    (r) => r.outcome === "video_processing",
  ).length;

  // Persist the merged ads_state back. Phase flips to "ads" regardless
  // of whether every hook completed — partial progress is the whole
  // point of the JSONB column.
  await patchLaunchRow(spec.wave, {
    ads_state: adsState,
    ad_ids: extractAdIds(adsState),
    phase: "ads",
    status: failed === 0 && video_processing === 0 ? "in_progress" : "failed",
    notes: errors.length > 0 ? errors.slice(0, 10).join(" · ") : "",
  });

  return {
    ok: failed === 0,
    wave: spec.wave,
    results,
    created,
    skipped,
    failed,
    video_processing,
    errors,
  };
}

function extractAdIds(
  adsState: Record<string, AdState>,
): Array<{ hook_id: string; id: string }> {
  const out: Array<{ hook_id: string; id: string }> = [];
  for (const [hook_id, s] of Object.entries(adsState)) {
    if (s.ad_id) out.push({ hook_id, id: s.ad_id });
  }
  return out;
}

/** Per-ad pipeline. Walks the state machine
 *  upload → creative → ad and short-circuits on any failure. */
async function processAd(args: {
  cfg: ReturnType<typeof getCfg>;
  spec: WaveSpec;
  adSpec: AdSpec;
  adSet: { id: string; name: string };
  state: AdState;
}): Promise<{ state: AdState; result: AdsResultEntry }> {
  const { cfg, spec, adSpec, adSet } = args;
  const state: AdState = { ...args.state };

  // Already done — short-circuit.
  if (state.ad_id) {
    return {
      state,
      result: {
        hook_id: adSpec.hook_id,
        audience: adSpec.audience,
        outcome: "skipped",
        creative_id: state.creative_id,
        ad_id: state.ad_id,
      },
    };
  }

  // ── 1) Asset upload ──
  if (adSpec.creative.kind === "image" && !state.image_hash) {
    const r = await uploadImage(cfg, adSpec.creative.asset_path);
    if (!r.ok) {
      state.status = "failed";
      state.last_error = `image upload: ${r.error}`;
      return {
        state,
        result: {
          hook_id: adSpec.hook_id,
          audience: adSpec.audience,
          outcome: "failed",
          error: state.last_error,
        },
      };
    }
    state.image_hash = r.hash;
  }

  if (adSpec.creative.kind === "video") {
    if (!state.video_id) {
      const r = await uploadVideo(cfg, adSpec.creative.asset_path);
      if (!r.ok) {
        state.status = "failed";
        state.last_error = `video upload: ${r.error}`;
        return {
          state,
          result: {
            hook_id: adSpec.hook_id,
            audience: adSpec.audience,
            outcome: "failed",
            error: state.last_error,
          },
        };
      }
      state.video_id = r.id;
    }

    if (state.video_status !== "ready") {
      const r = await pollVideoReady(cfg, state.video_id);
      state.video_status = r.status;
      if (!r.ok) {
        // Could be still-processing OR errored. Either way, surface
        // and let the next invocation retry the poll.
        if (r.status === "processing") {
          state.status = "video_processing";
          return {
            state,
            result: {
              hook_id: adSpec.hook_id,
              audience: adSpec.audience,
              outcome: "video_processing",
              error: `video ${state.video_id} still processing after 5min`,
            },
          };
        }
        state.status = "failed";
        state.last_error = `video processing: ${r.error || r.status}`;
        return {
          state,
          result: {
            hook_id: adSpec.hook_id,
            audience: adSpec.audience,
            outcome: "failed",
            error: state.last_error,
          },
        };
      }
    }
  }

  // ── 2) Creative ──
  if (!state.creative_id) {
    const r = await createAdCreative({
      cfg,
      spec,
      adSpec,
      imageHash: state.image_hash,
      videoId: state.video_id,
    });
    if (!r.ok) {
      state.status = "failed";
      state.last_error = `creative: ${r.error}`;
      return {
        state,
        result: {
          hook_id: adSpec.hook_id,
          audience: adSpec.audience,
          outcome: "failed",
          error: state.last_error,
        },
      };
    }
    state.creative_id = r.id;
  }

  // ── 3) Ad ──
  const r = await createAd({
    cfg,
    adSpec,
    adSetId: adSet.id,
    creativeId: state.creative_id,
  });
  if (!r.ok) {
    state.status = "failed";
    state.last_error = `ad: ${r.error}`;
    return {
      state,
      result: {
        hook_id: adSpec.hook_id,
        audience: adSpec.audience,
        outcome: "failed",
        error: state.last_error,
      },
    };
  }
  state.ad_id = r.id;
  state.status = "complete";
  delete state.last_error;
  return {
    state,
    result: {
      hook_id: adSpec.hook_id,
      audience: adSpec.audience,
      outcome: "created",
      creative_id: state.creative_id,
      ad_id: state.ad_id,
    },
  };
}

// ── Phase 2 Graph API helpers ─────────────────────────────────────

/** Read a file relative to the repo root. asset_path comes from the
 *  spec and is intentionally repo-root-relative (e.g.
 *  `public/ad-assets/wave-1/mfg-pain-1x1.jpg`). */
async function readAssetBytes(assetPath: string): Promise<Buffer> {
  // process.cwd() is the bluejays project root when the API route runs
  // (next dev / next start both cd into the project). The spec paths
  // already start with `public/` so a simple join works.
  const abs = path.isAbsolute(assetPath)
    ? assetPath
    : path.join(process.cwd(), assetPath);
  return readFile(abs);
}

function mimeFromPath(p: string): string {
  const ext = p.toLowerCase().split(".").pop() || "";
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "mp4":
      return "video/mp4";
    case "mov":
      return "video/quicktime";
    case "webm":
      return "video/webm";
    default:
      return "application/octet-stream";
  }
}

type UploadImageOk = { ok: true; hash: string };
type UploadImageErr = { ok: false; error: string };

async function uploadImage(
  cfg: ReturnType<typeof getCfg>,
  assetPath: string,
): Promise<UploadImageOk | UploadImageErr> {
  let bytes: Buffer;
  try {
    bytes = await readAssetBytes(assetPath);
  } catch (err) {
    return {
      ok: false,
      error: `read ${assetPath}: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const filename = path.basename(assetPath);
  const url = `${META_BASE_URL_PHASE2}/${cfg.apiVersion}/${cfg.accountId}/adimages?access_token=${encodeURIComponent(cfg.token)}`;
  const form = new FormData();
  // Meta keys the response by the form-field name (which it expects
  // to equal the filename) — that's why we pass `filename` twice.
  form.append(
    filename,
    new Blob([new Uint8Array(bytes)], { type: mimeFromPath(filename) }),
    filename,
  );

  try {
    const r = await fetch(url, { method: "POST", body: form });
    if (!r.ok) {
      const errText = await r.text().catch(() => "");
      return { ok: false, error: `HTTP ${r.status}: ${errText.slice(0, 300)}` };
    }
    type ImagesResp = {
      images?: Record<string, { hash?: string; url?: string }>;
    };
    const data = (await r.json()) as ImagesResp;
    const entry = data.images && data.images[filename];
    if (!entry || !entry.hash) {
      // Meta sometimes keys by a sanitized version of the filename —
      // fall back to the first entry.
      const first = data.images
        ? Object.values(data.images).find((v) => v.hash)
        : undefined;
      if (first && first.hash) {
        await logCost({
          service: "meta_ads",
          action: "uploadImage",
          costUsd: 0,
          metadata: { asset: filename, hash: first.hash },
        }).catch(() => {});
        return { ok: true, hash: first.hash };
      }
      return {
        ok: false,
        error: `no hash in response: ${JSON.stringify(data).slice(0, 200)}`,
      };
    }
    await logCost({
      service: "meta_ads",
      action: "uploadImage",
      costUsd: 0,
      metadata: { asset: filename, hash: entry.hash },
    }).catch(() => {});
    return { ok: true, hash: entry.hash };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

type UploadVideoOk = { ok: true; id: string };
type UploadVideoErr = { ok: false; error: string };

async function uploadVideo(
  cfg: ReturnType<typeof getCfg>,
  assetPath: string,
): Promise<UploadVideoOk | UploadVideoErr> {
  let bytes: Buffer;
  try {
    bytes = await readAssetBytes(assetPath);
  } catch (err) {
    return {
      ok: false,
      error: `read ${assetPath}: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const filename = path.basename(assetPath);
  const url = `${META_BASE_URL_PHASE2}/${cfg.apiVersion}/${cfg.accountId}/advideos?access_token=${encodeURIComponent(cfg.token)}`;
  const form = new FormData();
  form.append(
    "source",
    new Blob([new Uint8Array(bytes)], { type: mimeFromPath(filename) }),
    filename,
  );

  try {
    const r = await fetch(url, { method: "POST", body: form });
    if (!r.ok) {
      const errText = await r.text().catch(() => "");
      return { ok: false, error: `HTTP ${r.status}: ${errText.slice(0, 300)}` };
    }
    type VideoResp = { id?: string };
    const data = (await r.json()) as VideoResp;
    if (!data.id) {
      return {
        ok: false,
        error: `no id in response: ${JSON.stringify(data).slice(0, 200)}`,
      };
    }
    await logCost({
      service: "meta_ads",
      action: "uploadVideo",
      costUsd: 0,
      metadata: { asset: filename, video_id: data.id },
    }).catch(() => {});
    return { ok: true, id: data.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

const VIDEO_POLL_INTERVAL_MS = 5_000;
const VIDEO_POLL_MAX_ATTEMPTS = 60; // ~5 min ceiling

type PollVideoResult =
  | { ok: true; status: "ready" }
  | { ok: false; status: "processing" | "error"; error?: string };

async function pollVideoReady(
  cfg: ReturnType<typeof getCfg>,
  videoId: string,
): Promise<PollVideoResult> {
  for (let attempt = 0; attempt < VIDEO_POLL_MAX_ATTEMPTS; attempt++) {
    const url = `${META_BASE_URL_PHASE2}/${cfg.apiVersion}/${videoId}?fields=status&access_token=${encodeURIComponent(cfg.token)}`;
    try {
      const r = await fetch(url);
      if (!r.ok) {
        const errText = await r.text().catch(() => "");
        return {
          ok: false,
          status: "error",
          error: `HTTP ${r.status}: ${errText.slice(0, 200)}`,
        };
      }
      type StatusResp = {
        status?: { video_status?: string };
      };
      const data = (await r.json()) as StatusResp;
      const vs = data.status?.video_status || "";
      if (vs === "ready") return { ok: true, status: "ready" };
      if (vs === "error") {
        return { ok: false, status: "error", error: "Meta returned status=error" };
      }
      // "processing" / "uploading" / empty — keep polling.
    } catch (err) {
      return {
        ok: false,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      };
    }
    await sleep(VIDEO_POLL_INTERVAL_MS);
  }
  return { ok: false, status: "processing" };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Creative + Ad creation ────────────────────────────────────────

type CreativeOk = { ok: true; id: string };
type CreativeErr = { ok: false; error: string };

async function createAdCreative(args: {
  cfg: ReturnType<typeof getCfg>;
  spec: WaveSpec;
  adSpec: AdSpec;
  imageHash?: string;
  videoId?: string;
}): Promise<CreativeOk | CreativeErr> {
  const { cfg, spec, adSpec, imageHash, videoId } = args;
  const link = buildAdDestinationUrl(spec, adSpec);

  // object_story_spec varies by media kind.
  type LinkData = {
    link: string;
    image_hash?: string;
    message: string;
    name: string;
    description?: string;
    call_to_action: { type: string; value: { link: string } };
  };
  type VideoData = {
    video_id: string;
    title: string;
    message: string;
    call_to_action: { type: string; value: { link: string } };
  };
  type StorySpec = {
    page_id: string;
    instagram_actor_id?: string;
    link_data?: LinkData;
    video_data?: VideoData;
  };

  const storySpec: StorySpec = { page_id: cfg.pageId };
  if (cfg.instagramActorId) storySpec.instagram_actor_id = cfg.instagramActorId;

  if (adSpec.creative.kind === "image") {
    if (!imageHash) return { ok: false, error: "missing image_hash" };
    storySpec.link_data = {
      link,
      image_hash: imageHash,
      message: adSpec.primary_text,
      name: adSpec.headline,
      description: adSpec.description,
      call_to_action: { type: adSpec.cta, value: { link } },
    };
  } else {
    if (!videoId) return { ok: false, error: "missing video_id" };
    storySpec.video_data = {
      video_id: videoId,
      title: adSpec.headline,
      message: adSpec.primary_text,
      call_to_action: { type: adSpec.cta, value: { link } },
    };
  }

  type CreativeResp = { id: string };
  const r = await graphPost<CreativeResp>({
    apiVersion: cfg.apiVersion,
    path: `${cfg.accountId}/adcreatives`,
    token: cfg.token,
    body: {
      name: `${adSpec.hook_id}-creative`,
      object_story_spec: JSON.stringify(storySpec),
    },
  });
  if (!r.ok) return { ok: false, error: r.error };

  await logCost({
    service: "meta_ads",
    action: "createAdCreative",
    costUsd: 0,
    metadata: { hook_id: adSpec.hook_id, creative_id: r.data.id },
  }).catch(() => {});

  return { ok: true, id: r.data.id };
}

type AdOk = { ok: true; id: string };
type AdErr = { ok: false; error: string };

async function createAd(args: {
  cfg: ReturnType<typeof getCfg>;
  adSpec: AdSpec;
  adSetId: string;
  creativeId: string;
}): Promise<AdOk | AdErr> {
  const { cfg, adSpec, adSetId, creativeId } = args;

  type AdResp = { id: string };
  const r = await graphPost<AdResp>({
    apiVersion: cfg.apiVersion,
    path: `${cfg.accountId}/ads`,
    token: cfg.token,
    body: {
      name: `${adSpec.hook_id}`,
      adset_id: adSetId,
      creative: JSON.stringify({ creative_id: creativeId }),
      status: "PAUSED",
    },
  });
  if (!r.ok) return { ok: false, error: r.error };

  await logCost({
    service: "meta_ads",
    action: "createAd",
    costUsd: 0,
    metadata: { hook_id: adSpec.hook_id, ad_id: r.data.id },
  }).catch(() => {});

  return { ok: true, id: r.data.id };
}

// ── Public query: read launch state ────────────────────────────────

export async function getLaunchStatus(wave: string): Promise<LaunchRow | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase
    .from("meta_launches")
    .select("*")
    .eq("wave", wave)
    .maybeSingle();
  return (data as LaunchRow | null) ?? null;
}

// ── Reset a launch (delete campaign + clear row) ──────────────────

/** Reset a launch — delete the campaign on Meta's side (which
 *  cascades to ad sets + ads automatically) AND clear the
 *  meta_launches row. After running this, `bj meta launch <wave>`
 *  starts from a clean slate.
 *
 *  Used when:
 *    - Campaign objective needs to change (Meta locks objective on
 *      create; deletion + recreate is the only path)
 *    - Initial launch failed halfway and you want a fresh attempt
 *      without manually editing Supabase
 *    - You want to flip the spec materially and re-test from zero
 */
export type ResetResult = {
  ok: boolean;
  wave: string;
  campaign_deleted: boolean;
  campaign_id_was: string | null;
  row_cleared: boolean;
  error?: string;
};

export async function resetLaunch(wave: string): Promise<ResetResult> {
  const cfg = getCfg();
  const row = await getLaunchStatus(wave);
  if (!row) {
    return {
      ok: true,
      wave,
      campaign_deleted: false,
      campaign_id_was: null,
      row_cleared: false,
      error: "no launch row to reset",
    };
  }

  let campaignDeleted = false;
  if (row.campaign_id) {
    // DELETE /{campaign_id} — Meta cascades to child ad sets + ads
    const url = `${META_BASE_URL}/${cfg.apiVersion}/${row.campaign_id}?access_token=${encodeURIComponent(cfg.token)}`;
    try {
      const r = await fetch(url, { method: "DELETE" });
      if (r.ok) {
        campaignDeleted = true;
      } else {
        // If the campaign was already deleted in the UI, Meta returns
        // a "Cannot delete" or 100 error — treat as "already gone" and
        // proceed to clear the row.
        const errText = await r.text().catch(() => "");
        const looksLikeAlreadyGone =
          /does not exist|cannot delete|invalid.*campaign/i.test(errText);
        if (!looksLikeAlreadyGone) {
          return {
            ok: false,
            wave,
            campaign_deleted: false,
            campaign_id_was: row.campaign_id,
            row_cleared: false,
            error: `Meta delete failed: ${errText.slice(0, 200)}`,
          };
        }
      }
    } catch (err) {
      return {
        ok: false,
        wave,
        campaign_deleted: false,
        campaign_id_was: row.campaign_id,
        row_cleared: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
    await logCost({
      service: "meta_ads",
      action: "deleteCampaign",
      costUsd: 0,
      metadata: { wave, campaign_id: row.campaign_id },
    }).catch(() => {});
  }

  // Wipe the row entirely so the next launch starts from zero. We
  // DELETE rather than zero-out columns so the unique constraint on
  // wave doesn't trip when launching fresh.
  let rowCleared = false;
  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from("meta_launches")
      .delete()
      .eq("wave", wave);
    rowCleared = !error;
  }

  return {
    ok: true,
    wave,
    campaign_deleted: campaignDeleted,
    campaign_id_was: row.campaign_id,
    row_cleared: rowCleared,
  };
}
