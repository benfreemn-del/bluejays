/**
 * Client ads — DB helpers + per-client creative library registry.
 */

import { getSupabase } from "../supabase";
import { ZENITH_CREATIVES, type CreativeSeed } from "./zenith-creatives";
import { OIT_CREATIVES } from "./oit-creatives";

export type AdStatus =
  | "draft"
  | "ready"
  | "live"
  | "paused"
  | "archived"
  | "killed";

export type ClientAdCreative = {
  id: string;
  client_slug: string;
  audience: string;
  platform: string;
  ad_set: string | null;
  variant_label: string | null;
  headline: string;
  body: string;
  cta: string | null;
  image_brief: string | null;
  video_brief: string | null;
  asset_url: string | null;
  utm: Record<string, string>;
  status: AdStatus;
  external_id: string | null;
  external_account_id: string | null;
  impressions: number | null;
  clicks: number | null;
  conversions: number | null;
  spend_cents: number | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
};

const REGISTRY: Record<string, CreativeSeed[]> = {
  "zenith-sports": ZENITH_CREATIVES,
  "olympic-inspections": OIT_CREATIVES,
};

export function getCreativeSeeds(clientSlug: string): CreativeSeed[] {
  return REGISTRY[clientSlug] ?? [];
}

export async function listClientAdCreatives(
  clientSlug: string,
): Promise<ClientAdCreative[]> {
  const { data, error } = await getSupabase()
    .from("client_ad_creatives")
    .select("*")
    .eq("client_slug", clientSlug)
    .order("audience")
    .order("platform")
    .order("variant_label");
  if (error) throw new Error(`listClientAdCreatives: ${error.message}`);
  return (data ?? []) as ClientAdCreative[];
}

/**
 * Upsert seeds → DB. Matches existing rows on
 * (client_slug, audience, platform, variant_label) so re-running this
 * after edits updates rather than dupes.
 */
export async function seedClientAdCreatives(
  clientSlug: string,
  seeds: CreativeSeed[],
): Promise<{ inserted: number; updated: number }> {
  const sb = getSupabase();
  let inserted = 0;
  let updated = 0;
  for (const s of seeds) {
    const { data: existing } = await sb
      .from("client_ad_creatives")
      .select("id")
      .eq("client_slug", clientSlug)
      .eq("audience", s.audience)
      .eq("platform", s.platform)
      .eq("variant_label", s.variant_label ?? "")
      .maybeSingle();

    if (existing) {
      const { error } = await sb
        .from("client_ad_creatives")
        .update({
          ad_set: s.ad_set,
          headline: s.headline,
          body: s.body,
          cta: s.cta,
          image_brief: s.image_brief ?? null,
          video_brief: s.video_brief ?? null,
          utm: s.utm,
        })
        .eq("id", existing.id);
      if (error) throw new Error(`seed update: ${error.message}`);
      updated += 1;
    } else {
      const { error } = await sb.from("client_ad_creatives").insert([
        {
          client_slug: clientSlug,
          audience: s.audience,
          platform: s.platform,
          ad_set: s.ad_set,
          variant_label: s.variant_label,
          headline: s.headline,
          body: s.body,
          cta: s.cta,
          image_brief: s.image_brief ?? null,
          video_brief: s.video_brief ?? null,
          utm: s.utm,
        },
      ]);
      if (error) throw new Error(`seed insert: ${error.message}`);
      inserted += 1;
    }
  }
  return { inserted, updated };
}

export async function updateAdCreativeStatus(
  id: string,
  status: AdStatus,
): Promise<void> {
  const { error } = await getSupabase()
    .from("client_ad_creatives")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(`updateAdCreativeStatus: ${error.message}`);
}

/**
 * Build a CSV the user can paste into Meta Ads Manager / Google Ads
 * Editor for bulk import. Format is platform-specific so we keep a
 * tiny renderer per output target.
 */
export function adsToCsv(
  rows: ClientAdCreative[],
  target: "meta" | "google",
): string {
  if (target === "meta") {
    const header = [
      "Ad Name",
      "Headline",
      "Primary Text",
      "Description",
      "Call to Action",
      "Website URL",
      "URL Parameters",
      "Audience",
      "Platform",
      "Status",
    ].join(",");
    const lines = rows.map((r) =>
      [
        `"${(r.variant_label ?? "").replace(/"/g, '""')}"`,
        `"${r.headline.replace(/"/g, '""')}"`,
        `"${r.body.replace(/"/g, '""')}"`,
        `"${(r.cta ?? "").replace(/"/g, '""')}"`,
        `"${r.cta ?? ""}"`,
        `"https://bluejayportfolio.com/clients/${r.client_slug}"`,
        `"${Object.entries(r.utm)
          .map(([k, v]) => `${k}=${v}`)
          .join("&")}"`,
        r.audience,
        r.platform,
        r.status,
      ].join(","),
    );
    return [header, ...lines].join("\n");
  }
  // Google Ads CSV — basic responsive search ad columns
  const header = [
    "Campaign",
    "Ad group",
    "Headline 1",
    "Description 1",
    "Final URL",
    "URL Parameters",
    "Status",
  ].join(",");
  const lines = rows.map((r) =>
    [
      `"tekky-${r.audience}"`,
      `"${r.ad_set ?? ""}"`,
      `"${r.headline.replace(/"/g, '""')}"`,
      `"${r.body.replace(/"/g, '""')}"`,
      `"https://bluejayportfolio.com/clients/${r.client_slug}"`,
      `"${Object.entries(r.utm)
        .map(([k, v]) => `${k}=${v}`)
        .join("&")}"`,
      r.status,
    ].join(","),
  );
  return [header, ...lines].join("\n");
}
