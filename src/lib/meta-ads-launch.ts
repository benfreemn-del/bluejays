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

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { logCost } from "@/lib/cost-logger";
import {
  buildAdDestinationUrl,
  type WaveSpec,
  type AdSetSpec,
} from "./ads-spec/wave-1";

const META_BASE_URL = "https://graph.facebook.com";
const DEFAULT_API_VERSION = "v21.0";

// ── Types ──────────────────────────────────────────────────────────

export type LaunchPhase = "skeleton" | "ads" | "complete";
export type LaunchStatus = "in_progress" | "complete" | "failed";

export type LaunchRow = {
  id: string;
  wave: string;
  campaign_id: string | null;
  campaign_name: string | null;
  ad_set_ids: Array<{ audience: string; id: string; name: string }>;
  ad_ids: Array<{ hook_id: string; id: string }>;
  image_hashes: Record<string, string>;
  video_ids: Record<string, string>;
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

// ── Config helpers ─────────────────────────────────────────────────

function getCfg(): {
  token: string;
  accountId: string;
  apiVersion: string;
  pageId: string;
} {
  const token = (process.env.META_ADS_SYSTEM_TOKEN || "").trim();
  const rawAccount = (process.env.META_ADS_ACCOUNT_ID || "").trim();
  const apiVersion = (process.env.META_ADS_API_VERSION || DEFAULT_API_VERSION).trim();
  const pageId = (process.env.META_ADS_PAGE_ID || "").trim();
  const accountId = rawAccount.startsWith("act_") ? rawAccount : `act_${rawAccount}`;
  if (!token || !rawAccount) {
    throw new Error(
      "Meta env not configured: need META_ADS_SYSTEM_TOKEN + META_ADS_ACCOUNT_ID",
    );
  }
  return { token, accountId, apiVersion, pageId };
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
      targeting: JSON.stringify(adSet.targeting),
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
// Deferred to a follow-up commit. Spec is already in
// src/lib/ads-spec/wave-1.ts — the orchestrator will:
//   1. For each ad whose creative.kind === "image":
//      - Read the file from disk (asset_path is relative to repo root)
//      - POST /act_X/adimages with the binary, get back image_hash
//   2. For each ad whose creative.kind === "video":
//      - POST /act_X/advideos with the file, get back video_id
//      - Poll video processing status until READY
//   3. For each of the 12 ads:
//      - POST /act_X/adcreatives with object_story_spec referencing
//        the image_hash OR video_id + headline + body + CTA + URL
//      - POST /act_X/ads with creative_id + adset_id + name + PAUSED
//   4. Update meta_launches row: phase="ads", record all IDs
//
// Phase 2 lands once HyperAgent images exist at the spec'd
// asset_path locations + the VSL #2 Stories trim is generated.
//
// The buildAdDestinationUrl(spec, ad) helper from ads-spec/wave-1.ts
// composes the destination URL with UTM tags during ad-creative
// creation.
export { buildAdDestinationUrl };

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
