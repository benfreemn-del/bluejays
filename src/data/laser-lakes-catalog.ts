/**
 * Laser Lakes — product + lake catalog data.
 *
 * Two arrays here:
 *   1. PRODUCTS — every standalone product Nate sells (the lake-map
 *      variants, ornaments, wildlife pieces). Each has size / finish
 *      options, a base price, and an optional Shopify product URL.
 *   2. LAKES — the catalog of lakes Nate has CNC files for. Drives
 *      the lake-browser search + the custom-order configurator's
 *      first step. Curated US lake list as a starting set; once Nate
 *      sends his real catalog, swap this array out.
 *
 * NO BACKEND on our side. Laser Lakes runs on Shopify — checkout +
 * customer records + order fulfillment all live there. The site
 * here is a beautiful storefront that funnels into Shopify.
 *
 * For standard products → product card links to its Shopify URL.
 * For custom orders → the configurator sends Nate a pre-filled email
 * with all the spec; Nate prices it, builds the line item in Shopify,
 * and emails the customer the checkout link.
 */

/** Nate's Shopify shop root + the email orders go to. Update when his
 *  custom domain switches over. */
export const SHOPIFY_SHOP_URL = "https://laserlakes.com";
export const ORDERS_EMAIL = "nate@laserlakes.com";

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
  /** Shopify product page URL. When set, the catalog card links here.
   *  When null, the card opens the configurator (because every variant
   *  needs Nate to spec it). */
  shopifyUrl?: string;
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

// Real photos pulled from Nate's Shopify CDN (laserlakes.com/cdn/shop/files/).
// Hot-linked directly so they render at full quality without us hosting them.
// Real prices verified against the live shop ($325-$650 for lake maps,
// $15-$25 for ornaments, $22 wildlife pieces).
const SHOPIFY_CDN = "https://laserlakes.com/cdn/shop/files";

export const PRODUCTS: Product[] = [
  {
    id: "lake-map-burntside",
    name: "Burntside Lake Map",
    category: "lake-map",
    blurb:
      "Hand-cut layered Baltic birch map of Burntside Lake — the flagship Northwoods piece. Family name engraving optional.",
    basePriceCents: 32500,
    sizes: MAP_SIZES,
    finishes: STD_FINISHES,
    imageUrl: `${SHOPIFY_CDN}/BurntsideLakeMap_Top3234_30db2ab9-8e5f-445f-b004-95f5c3166d03.jpg`,
    leadDays: 21,
    isFeatured: true,
    engravable: true,
    shopifyUrl: "https://laserlakes.com/products/burntside-lake-map",
  },
  {
    id: "lake-map-tenmile",
    name: "Ten Mile Lake Map",
    category: "lake-map",
    blurb:
      "Layered contour map of Ten Mile Lake. Hand-finished birch with optional walnut or ebony stain.",
    basePriceCents: 32500,
    sizes: MAP_SIZES,
    finishes: STD_FINISHES,
    imageUrl: `${SHOPIFY_CDN}/TenMileIMG_3042_0377410c-ac13-4b0e-b25c-c75d764e8a51.jpg`,
    leadDays: 21,
    isFeatured: true,
    engravable: true,
    shopifyUrl: "https://laserlakes.com/products/ten-mile-lake-map",
  },
  {
    id: "lake-map-minnetonka",
    name: "Minnetonka Lake Map",
    category: "lake-map",
    blurb:
      "All 14,000+ acres of Lake Minnetonka, hand-cut in three layers. The Twin Cities' centerpiece.",
    basePriceCents: 32500,
    sizes: MAP_SIZES,
    finishes: STD_FINISHES,
    imageUrl: `${SHOPIFY_CDN}/Minnetonka_Lake_Map_3383.jpg`,
    leadDays: 21,
    engravable: true,
    shopifyUrl: "https://laserlakes.com/products/minnetonka-lake-map",
  },
  {
    id: "lake-map-roy",
    name: "Roy Lake Map · South Dakota",
    category: "lake-map",
    blurb:
      "Roy Lake, SD — the lake everyone in the Dakotas knows by heart. Three-layer Baltic birch.",
    basePriceCents: 32500,
    sizes: MAP_SIZES,
    finishes: STD_FINISHES,
    imageUrl: `${SHOPIFY_CDN}/Roy_Lake_Map-South_Dakota_3475.jpg`,
    leadDays: 21,
    engravable: true,
    shopifyUrl: "https://laserlakes.com/products/roy-lake-map",
  },
  {
    id: "wildlife-wolfsong",
    name: "Wolf Song · Wall Art",
    category: "wildlife",
    blurb:
      "Howling wolf silhouette on layered Northwoods birch — light or dark stain. Cabin-mantle classic.",
    basePriceCents: 8900,
    sizes: [
      { id: "medium", label: '16" wide', addCents: 0 },
      { id: "large", label: '24" wide', addCents: 3000 },
    ],
    finishes: STD_FINISHES,
    imageUrl: `${SHOPIFY_CDN}/WolfSong-Light_3429.jpg`,
    leadDays: 14,
    engravable: false,
    shopifyUrl: "https://laserlakes.com/products/wolf-song-wall-art",
  },
  {
    id: "wildlife-sunfish",
    name: "Summer Sunfish · Wall Art",
    category: "wildlife",
    blurb:
      "Hand-cut sunfish in the layered birch style. The piece every kid who's caught one wants.",
    basePriceCents: 7800,
    sizes: [
      { id: "medium", label: '14" long', addCents: 0 },
      { id: "large", label: '20" long', addCents: 2500 },
    ],
    finishes: STD_FINISHES,
    imageUrl: `${SHOPIFY_CDN}/Summer_Sunfish_Wall_Art_3373.jpg`,
    leadDays: 14,
    engravable: false,
    shopifyUrl: "https://laserlakes.com/products/summer-sunfish-wall-art",
  },
  {
    id: "ornament-mn-strong",
    name: "Minnesota Strong Ornament",
    category: "ornament",
    blurb:
      "MN-shaped layered ornament, twine hanger. The lake-house family's annual Christmas gift.",
    basePriceCents: 2500,
    sizes: [{ id: "small", label: '4" tall', addCents: 0 }],
    finishes: STD_FINISHES.slice(0, 3),
    imageUrl: `${SHOPIFY_CDN}/Minnesota_Strong_Ornament_3498.jpg`,
    leadDays: 7,
    engravable: false,
    shopifyUrl: "https://laserlakes.com/products/minnesota-strong-ornament",
  },
  {
    id: "wildlife-baldeagle",
    name: "Bald Eagle in a Tree",
    category: "wildlife",
    blurb:
      "Bald eagle perched on a Northwoods pine — small accent piece, big symbolism.",
    basePriceCents: 2200,
    sizes: [{ id: "small", label: '6" tall', addCents: 0 }],
    finishes: STD_FINISHES.slice(0, 2),
    imageUrl: `${SHOPIFY_CDN}/BaldEagleInaTree.png`,
    leadDays: 7,
    engravable: false,
    shopifyUrl: "https://laserlakes.com/products/bald-eagle-in-a-tree",
  },
  {
    id: "lake-map-custom",
    name: "Your Lake · Custom Order",
    category: "lake-map",
    blurb:
      "Don't see your lake? Tell us the name. Nate cuts the contour file from scratch — same price, same Baltic birch, your shoreline.",
    basePriceCents: 32500,
    sizes: MAP_SIZES,
    finishes: STD_FINISHES,
    imageUrl: `${SHOPIFY_CDN}/BurntsideLakeMap_3240.jpg`,
    leadDays: 28,
    isFeatured: true,
    engravable: true,
    // No shopifyUrl — opens the configurator since Nate has to spec it.
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
