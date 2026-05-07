/**
 * Laser Lakes — product + lake catalog data.
 *
 * Two arrays here:
 *   1. PRODUCTS — every standalone product Nate sells (the lake-map
 *      variants, ornaments, wildlife pieces). Each has size / finish
 *      options + a base price.
 *   2. LAKES — the catalog of lakes Nate has CNC files for. Drives
 *      the lake-browser search + the custom-order configurator's
 *      first step. Curated US lake list as a starting set; once Nate
 *      sends his real catalog, swap this array out.
 *
 * Real data lives in client_camps-style DB tables eventually; this
 * file is the day-1 source of truth so the page renders beautifully
 * before Nate sends his exports.
 */

export type ProductFinish =
  | "natural-birch"
  | "walnut-stain"
  | "ebony-stain"
  | "weathered-oak";

export type ProductSize = "small" | "medium" | "large" | "xlarge";

export type Product = {
  id: string;
  name: string;
  category: "lake-map" | "ornament" | "wildlife" | "sign";
  /** Short blurb shown under the title in the catalog grid. */
  blurb: string;
  basePriceCents: number;
  /** Smallest first. */
  sizes: { id: ProductSize; label: string; addCents: number }[];
  /** First entry is treated as default. */
  finishes: { id: ProductFinish; label: string; addCents: number }[];
  /** Stock photo URL. Replace with Nate's real photos as they come in. */
  imageUrl: string;
  /** Lead time in business days from order → ship. */
  leadDays: number;
  isFeatured?: boolean;
  /** Engraving available (custom name / coords / family est. line). */
  engravable: boolean;
};

export const SIZE_LABELS: Record<ProductSize, string> = {
  small: '12"',
  medium: '18"',
  large: '24"',
  xlarge: '36"',
};

export const FINISH_LABELS: Record<ProductFinish, string> = {
  "natural-birch": "Natural Birch",
  "walnut-stain": "Walnut",
  "ebony-stain": "Ebony",
  "weathered-oak": "Weathered Oak",
};

const STD_FINISHES: Product["finishes"] = [
  { id: "natural-birch", label: "Natural Birch", addCents: 0 },
  { id: "walnut-stain", label: "Walnut", addCents: 1500 },
  { id: "ebony-stain", label: "Ebony", addCents: 1500 },
  { id: "weathered-oak", label: "Weathered Oak", addCents: 2000 },
];

const MAP_SIZES: Product["sizes"] = [
  { id: "small", label: '12" diameter', addCents: 0 },
  { id: "medium", label: '18" diameter', addCents: 4000 },
  { id: "large", label: '24" diameter', addCents: 9000 },
  { id: "xlarge", label: '36" diameter', addCents: 18000 },
];

export const PRODUCTS: Product[] = [
  {
    id: "lake-map-classic",
    name: "Custom Lake Map · Classic",
    category: "lake-map",
    blurb:
      "Layered Baltic-birch contour map of any lake. Hand-finished. Family-name engraving optional.",
    basePriceCents: 11500,
    sizes: MAP_SIZES,
    finishes: STD_FINISHES,
    imageUrl: "/clients/laser-lakes/photos/lake-map-classic.jpg",
    leadDays: 21,
    isFeatured: true,
    engravable: true,
  },
  {
    id: "lake-map-shadowbox",
    name: "Lake Map · Shadowbox Frame",
    category: "lake-map",
    blurb:
      "Same hand-cut map, mounted in a shadowbox with depth. Heirloom piece for the cabin entryway.",
    basePriceCents: 18900,
    sizes: MAP_SIZES,
    finishes: STD_FINISHES,
    imageUrl: "/clients/laser-lakes/photos/lake-map-shadowbox.jpg",
    leadDays: 28,
    isFeatured: true,
    engravable: true,
  },
  {
    id: "lake-map-coaster-set",
    name: "Lake Coaster Set (4)",
    category: "lake-map",
    blurb:
      "Four 4\" coasters of your lake, cork-backed. The hostess gift the cabin neighbors fight over.",
    basePriceCents: 4800,
    sizes: [{ id: "small", label: 'Set of 4 · 4"', addCents: 0 }],
    finishes: STD_FINISHES.slice(0, 2),
    imageUrl: "/clients/laser-lakes/photos/coasters.jpg",
    leadDays: 10,
    isFeatured: true,
    engravable: false,
  },
  {
    id: "lake-ornament",
    name: "Lake Ornament",
    category: "ornament",
    blurb:
      'Mini layered map, 4" round, twine hanger. Great Christmas gift for the lake-house family.',
    basePriceCents: 2400,
    sizes: [{ id: "small", label: '4" round', addCents: 0 }],
    finishes: STD_FINISHES.slice(0, 3),
    imageUrl: "/clients/laser-lakes/photos/ornament.jpg",
    leadDays: 7,
    engravable: true,
  },
  {
    id: "wildlife-loon",
    name: "Northwoods Loon",
    category: "wildlife",
    blurb:
      "Hand-cut and stained loon silhouette on layered birch — the sound of the lake on the wall.",
    basePriceCents: 6500,
    sizes: [
      { id: "medium", label: '14" wingspan', addCents: 0 },
      { id: "large", label: '22" wingspan', addCents: 3500 },
    ],
    finishes: STD_FINISHES,
    imageUrl: "/clients/laser-lakes/photos/loon.jpg",
    leadDays: 14,
    engravable: false,
  },
  {
    id: "wildlife-pine",
    name: "Pine Tree Trio",
    category: "wildlife",
    blurb:
      "Three layered Northwoods pines, mounted on reclaimed barn wood. Cabin-entry standard.",
    basePriceCents: 7800,
    sizes: [
      { id: "medium", label: '16" tall', addCents: 0 },
      { id: "large", label: '24" tall', addCents: 3000 },
    ],
    finishes: STD_FINISHES,
    imageUrl: "/clients/laser-lakes/photos/pine-trio.jpg",
    leadDays: 14,
    engravable: false,
  },
  {
    id: "cabin-name-sign",
    name: "Custom Cabin Sign",
    category: "sign",
    blurb:
      'Family name + "Established" date + lake name. The lake house version of the front-door wreath.',
    basePriceCents: 8900,
    sizes: [
      { id: "medium", label: '24" wide', addCents: 0 },
      { id: "large", label: '36" wide', addCents: 4000 },
    ],
    finishes: STD_FINISHES,
    imageUrl: "/clients/laser-lakes/photos/cabin-sign.jpg",
    leadDays: 18,
    engravable: true,
  },
];

export type Lake = {
  id: string;
  name: string;
  state: string; // 2-letter postal
  region?: string; // Northwoods / Boundary Waters / Iron Range / etc.
  /** Approximate centroid for the future map view. */
  lat?: number;
  lng?: number;
  /** Notable feature shown as a small tagline in the browser. */
  hint?: string;
};

/** Curated US lake catalog. Day-1 set focused on Minnesota, Wisconsin,
 *  Michigan, plus the iconic non-Midwest lakes most-requested
 *  nationally. Once Nate sends his real catalog this whole array
 *  swaps out — the consumer side reads from this constant. */
export const LAKES: Lake[] = [
  // ── MINNESOTA · the homeland ──
  { id: "mn-lake-of-the-woods", name: "Lake of the Woods", state: "MN", region: "Northwoods", lat: 49.25, lng: -94.93, hint: "Walleye capital" },
  { id: "mn-mille-lacs", name: "Mille Lacs Lake", state: "MN", region: "Central", lat: 46.20, lng: -93.66, hint: "132,000 acres" },
  { id: "mn-leech", name: "Leech Lake", state: "MN", region: "Northwoods", lat: 47.16, lng: -94.39 },
  { id: "mn-vermilion", name: "Lake Vermilion", state: "MN", region: "Iron Range", lat: 47.83, lng: -92.40, hint: "365 islands" },
  { id: "mn-rainy", name: "Rainy Lake", state: "MN", region: "Boundary Waters", lat: 48.47, lng: -93.10 },
  { id: "mn-cass", name: "Cass Lake", state: "MN", region: "Northwoods", lat: 47.39, lng: -94.61 },
  { id: "mn-gull", name: "Gull Lake", state: "MN", region: "Brainerd Lakes", lat: 46.41, lng: -94.36 },
  { id: "mn-pelican", name: "Pelican Lake", state: "MN", region: "Otter Tail", lat: 46.57, lng: -95.85 },
  { id: "mn-detroit", name: "Detroit Lake", state: "MN", region: "Becker", lat: 46.81, lng: -95.85 },
  { id: "mn-bemidji", name: "Lake Bemidji", state: "MN", region: "Northwoods", lat: 47.51, lng: -94.86 },
  { id: "mn-minnetonka", name: "Lake Minnetonka", state: "MN", region: "Twin Cities", lat: 44.93, lng: -93.59 },
  { id: "mn-superior-mn", name: "Lake Superior (MN shore)", state: "MN", region: "North Shore", lat: 47.50, lng: -90.50 },
  { id: "mn-saganaga", name: "Saganaga Lake", state: "MN", region: "Boundary Waters", lat: 48.24, lng: -90.83 },
  { id: "mn-basswood", name: "Basswood Lake", state: "MN", region: "Boundary Waters", lat: 48.07, lng: -91.55 },

  // ── WISCONSIN ──
  { id: "wi-superior-wi", name: "Lake Superior (WI shore)", state: "WI", region: "North Shore", lat: 46.80, lng: -90.80 },
  { id: "wi-michigan-wi", name: "Lake Michigan (WI shore)", state: "WI", region: "Door County", lat: 44.85, lng: -87.40 },
  { id: "wi-winnebago", name: "Lake Winnebago", state: "WI", region: "Central", lat: 44.10, lng: -88.40, hint: "WI's largest inland" },
  { id: "wi-pepin", name: "Lake Pepin", state: "WI", region: "Mississippi", lat: 44.50, lng: -92.15 },
  { id: "wi-chippewa", name: "Chippewa Flowage", state: "WI", region: "Northwoods", lat: 45.85, lng: -91.10 },
  { id: "wi-namekagon", name: "Lake Namekagon", state: "WI", region: "Northwoods", lat: 46.13, lng: -91.10 },
  { id: "wi-trout", name: "Trout Lake", state: "WI", region: "Vilas", lat: 46.04, lng: -89.67 },
  { id: "wi-flambeau", name: "Flambeau Flowage", state: "WI", region: "Northwoods", lat: 45.97, lng: -90.30 },
  { id: "wi-pewaukee", name: "Pewaukee Lake", state: "WI", region: "Waukesha", lat: 43.10, lng: -88.27 },

  // ── MICHIGAN ──
  { id: "mi-superior-mi", name: "Lake Superior (MI shore)", state: "MI", region: "Upper Peninsula", lat: 47.00, lng: -88.00 },
  { id: "mi-michigan-mi", name: "Lake Michigan (MI shore)", state: "MI", region: "West Coast", lat: 44.00, lng: -86.50 },
  { id: "mi-huron", name: "Lake Huron", state: "MI", region: "Great Lakes", lat: 44.50, lng: -82.50 },
  { id: "mi-torch", name: "Torch Lake", state: "MI", region: "Antrim", lat: 45.00, lng: -85.30, hint: "Caribbean blue water" },
  { id: "mi-charlevoix", name: "Lake Charlevoix", state: "MI", region: "Antrim", lat: 45.27, lng: -85.13 },
  { id: "mi-higgins", name: "Higgins Lake", state: "MI", region: "Central", lat: 44.48, lng: -84.73 },
  { id: "mi-houghton", name: "Houghton Lake", state: "MI", region: "Central", lat: 44.32, lng: -84.77 },
  { id: "mi-mullett", name: "Mullett Lake", state: "MI", region: "Cheboygan", lat: 45.50, lng: -84.55 },
  { id: "mi-burt", name: "Burt Lake", state: "MI", region: "Cheboygan", lat: 45.43, lng: -84.69 },
  { id: "mi-walloon", name: "Walloon Lake", state: "MI", region: "Charlevoix", lat: 45.27, lng: -84.93, hint: "Hemingway's lake" },

  // ── NEW YORK · Adirondacks + Finger Lakes ──
  { id: "ny-george", name: "Lake George", state: "NY", region: "Adirondacks", lat: 43.55, lng: -73.65 },
  { id: "ny-placid", name: "Lake Placid", state: "NY", region: "Adirondacks", lat: 44.28, lng: -73.99 },
  { id: "ny-cayuga", name: "Cayuga Lake", state: "NY", region: "Finger Lakes", lat: 42.70, lng: -76.71 },
  { id: "ny-seneca", name: "Seneca Lake", state: "NY", region: "Finger Lakes", lat: 42.65, lng: -76.91 },

  // ── NEW HAMPSHIRE / VT / MAINE ──
  { id: "nh-winnipesaukee", name: "Lake Winnipesaukee", state: "NH", region: "Lakes Region", lat: 43.62, lng: -71.32 },
  { id: "nh-squam", name: "Squam Lake", state: "NH", region: "Lakes Region", lat: 43.81, lng: -71.55, hint: "On Golden Pond" },
  { id: "vt-champlain", name: "Lake Champlain", state: "VT", region: "Champlain Valley", lat: 44.50, lng: -73.30 },
  { id: "me-moosehead", name: "Moosehead Lake", state: "ME", region: "North Woods", lat: 45.65, lng: -69.80 },
  { id: "me-sebago", name: "Sebago Lake", state: "ME", region: "Southern Maine", lat: 43.83, lng: -70.55 },

  // ── WESTERN ICONS ──
  { id: "id-coeur-dalene", name: "Lake Coeur d'Alene", state: "ID", region: "Panhandle", lat: 47.65, lng: -116.78 },
  { id: "id-pend-oreille", name: "Lake Pend Oreille", state: "ID", region: "Panhandle", lat: 48.07, lng: -116.32 },
  { id: "wa-chelan", name: "Lake Chelan", state: "WA", region: "Cascades", lat: 48.10, lng: -120.40 },
  { id: "wa-washington", name: "Lake Washington", state: "WA", region: "Seattle", lat: 47.60, lng: -122.25 },
  { id: "wa-sammamish", name: "Lake Sammamish", state: "WA", region: "Seattle Eastside", lat: 47.58, lng: -122.06 },
  { id: "or-crater", name: "Crater Lake", state: "OR", region: "Cascades", lat: 42.95, lng: -122.10, hint: "Deepest in US" },
  { id: "ca-tahoe", name: "Lake Tahoe", state: "CA", region: "Sierra Nevada", lat: 39.10, lng: -120.04 },
  { id: "mt-flathead", name: "Flathead Lake", state: "MT", region: "Northwest", lat: 47.95, lng: -114.10 },

  // ── SOUTH ──
  { id: "tn-norris", name: "Norris Lake", state: "TN", region: "East Tennessee", lat: 36.30, lng: -83.85 },
  { id: "ga-lanier", name: "Lake Lanier", state: "GA", region: "North Georgia", lat: 34.20, lng: -83.95 },
  { id: "tx-travis", name: "Lake Travis", state: "TX", region: "Hill Country", lat: 30.40, lng: -98.00 },
];

/** Quick state list for the configurator's state-first pick. */
export const STATES_WITH_LAKES = Array.from(
  new Set(LAKES.map((l) => l.state)),
).sort();

export function lakesInState(state: string): Lake[] {
  return LAKES.filter((l) => l.state === state).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function searchLakes(q: string, max = 30): Lake[] {
  const ql = q.trim().toLowerCase();
  if (!ql) return LAKES.slice(0, max);
  return LAKES.filter(
    (l) =>
      l.name.toLowerCase().includes(ql) ||
      l.state.toLowerCase() === ql ||
      l.region?.toLowerCase().includes(ql) ||
      l.hint?.toLowerCase().includes(ql),
  ).slice(0, max);
}

export function formatPrice(cents: number): string {
  const d = cents / 100;
  return d % 1 === 0
    ? `$${d.toLocaleString()}`
    : `$${d.toFixed(2)}`;
}
