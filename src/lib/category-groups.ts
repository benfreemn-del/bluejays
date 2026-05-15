import type { Category } from "./types";

/**
 * High-level groupings of the Category enum. Matches the refocused ICP
 * announced 2026-05-14 (manufacturer + indie-author verticals on the
 * $10K AI System ladder, with the 46 V2 service templates kept live for
 * inbound / paying clients but no longer scouted). The dashboard leads
 * table uses these to filter by vertical without forcing Ben to tick
 * every sub-category one at a time.
 *
 * Source of truth for memberships is scout.ts (MANUFACTURER_LOOKALIKE_
 * CATEGORIES) — mirrored here so this module stays client-safe (no
 * server-only imports). Keep the two in sync.
 */
export type CategoryGroup = "manufacturer" | "author" | "service";

export const MANUFACTURER_GROUP_CATEGORIES: ReadonlySet<Category> =
  new Set<Category>([
    "mfg-ag-equipment",
    "mfg-sports-equipment",
    "mfg-apparel-kids",
    "mfg-auto-parts",
    "mfg-outdoor-gear",
    "mfg-food-bev",
  ]);

export const AUTHOR_GROUP_CATEGORIES: ReadonlySet<Category> =
  new Set<Category>(["indie-author"]);

export function getCategoryGroup(category: Category): CategoryGroup {
  if (MANUFACTURER_GROUP_CATEGORIES.has(category)) return "manufacturer";
  if (AUTHOR_GROUP_CATEGORIES.has(category)) return "author";
  return "service";
}

export const CATEGORY_GROUP_LABEL: Record<CategoryGroup, string> = {
  manufacturer: "Manufacturer",
  author: "Author",
  service: "Service",
};

export const CATEGORY_GROUP_EMOJI: Record<CategoryGroup, string> = {
  manufacturer: "🏭",
  author: "📚",
  service: "🛠️",
};
