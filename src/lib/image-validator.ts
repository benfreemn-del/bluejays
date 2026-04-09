import type { Category } from "./types";

export type FallbackImageVariant = "hero" | "about" | "gallery";

export interface ImageValidationIssue {
  code:
    | "missing_url"
    | "trimmed_whitespace"
    | "invalid_protocol"
    | "malformed_url"
    | "data_uri"
    | "tiny_dimensions"
    | "blur_parameter"
    | "expired_token"
    | "logo_or_icon"
    | "screenshot_pattern";
  severity: "critical" | "warning" | "suggestion";
  message: string;
}

export interface ImageValidationResult {
  originalUrl: string;
  sanitizedUrl: string;
  isValid: boolean;
  qualityScore: number;
  issues: ImageValidationIssue[];
  shouldUseFallback: boolean;
  fallbackUrl: string;
}

export const GALLERY_HEAVY_CATEGORIES = new Set<Category>([
  "tattoo",
  "photography",
  "interior-design",
  "florist",
  "landscaping",
  "salon",
  "catering",
  "pet-services",
]);

const CATEGORY_FALLBACK_IDS: Record<Category, Record<FallbackImageVariant, string>> = {
  "real-estate": {
    hero: "1494526585095-c41746248156",
    about: "1560518883-ce09059eeffa",
    gallery: "1494526585095-c41746248156",
  },
  dental: {
    hero: "1588776814546-daab30f310ce",
    about: "1588776813677-77aaf5595b83",
    gallery: "1588776814546-daab30f310ce",
  },
  "law-firm": {
    hero: "1450101499163-c8848c66ca85",
    about: "1554224155-6726b3ff858f",
    gallery: "1450101499163-c8848c66ca85",
  },
  landscaping: {
    hero: "1416879595882-3373a0480b5b",
    about: "1466692476868-aef1dfb1e735",
    gallery: "1416879595882-3373a0480b5b",
  },
  salon: {
    hero: "1560066984-138dadb4c035",
    about: "1521590832167-7bcbfaa6381f",
    gallery: "1560066984-138dadb4c035",
  },
  electrician: {
    hero: "1621905252507-b35492cc74b4",
    about: "1517048676732-d65bc937f952",
    gallery: "1621905252507-b35492cc74b4",
  },
  plumber: {
    hero: "1585704032915-c3400ca199e7",
    about: "1621905251918-48416bd8575a",
    gallery: "1585704032915-c3400ca199e7",
  },
  hvac: {
    hero: "1581093458791-9f3c3900df4b",
    about: "1621905251918-48416bd8575a",
    gallery: "1581093458791-9f3c3900df4b",
  },
  roofing: {
    hero: "1504307651254-35680f356dfd",
    about: "1541888946425-d81bb19240f5",
    gallery: "1504307651254-35680f356dfd",
  },
  "general-contractor": {
    hero: "1504307651254-35680f356dfd",
    about: "1541888946425-d81bb19240f5",
    gallery: "1517581177682-a085bb7ffb15",
  },
  "auto-repair": {
    hero: "1487754180451-c456f719a1fc",
    about: "1613214149922-f1809c99b414",
    gallery: "1487754180451-c456f719a1fc",
  },
  chiropractic: {
    hero: "1576091160399-112ba8d25d1d",
    about: "1576091160550-2173dba999ef",
    gallery: "1576091160399-112ba8d25d1d",
  },
  accounting: {
    hero: "1554224155-6726b3ff858f",
    about: "1454165804606-c3d57bc86b40",
    gallery: "1554224155-6726b3ff858f",
  },
  insurance: {
    hero: "1450101499163-c8848c66ca85",
    about: "1554224155-6726b3ff858f",
    gallery: "1450101499163-c8848c66ca85",
  },
  photography: {
    hero: "1516035069371-29a1b244cc32",
    about: "1492691527719-9d1e07e534b4",
    gallery: "1516035069371-29a1b244cc32",
  },
  "interior-design": {
    hero: "1484154218962-a197022b5858",
    about: "1505693416388-ac5ce068fe85",
    gallery: "1484154218962-a197022b5858",
  },
  cleaning: {
    hero: "1581578731548-c64695cc6952",
    about: "1603712725038-e9334ae8f39f",
    gallery: "1581578731548-c64695cc6952",
  },
  "pest-control": {
    hero: "1581578731548-c64695cc6952",
    about: "1621905252507-b35492cc74b4",
    gallery: "1581578731548-c64695cc6952",
  },
  moving: {
    hero: "1600518464441-9154a4dea21b",
    about: "1600585154526-990dced4db0d",
    gallery: "1600518464441-9154a4dea21b",
  },
  veterinary: {
    hero: "1517849845537-4d257902454a",
    about: "1516734212186-65266f2c1d0f",
    gallery: "1517849845537-4d257902454a",
  },
  fitness: {
    hero: "1517836357463-d25dfeac3438",
    about: "1571019613454-1cb2f99b2d8b",
    gallery: "1517836357463-d25dfeac3438",
  },
  tattoo: {
    hero: "1542727365-19732a80dcfd",
    about: "1519014816548-bf5fe059798b",
    gallery: "1542727365-19732a80dcfd",
  },
  florist: {
    hero: "1487070183336-b863922373d4",
    about: "1468327768560-75b778cbb551",
    gallery: "1487070183336-b863922373d4",
  },
  catering: {
    hero: "1555244162-803834f70033",
    about: "1414235077428-338989a2e8c0",
    gallery: "1555244162-803834f70033",
  },
  daycare: {
    hero: "1509062522246-3755977927d7",
    about: "1516627145497-ae6968895b74",
    gallery: "1509062522246-3755977927d7",
  },
  "pet-services": {
    hero: "1517849845537-4d257902454a",
    about: "1516734212186-65266f2c1d0f",
    gallery: "1517849845537-4d257902454a",
  },
  "martial-arts": {
    hero: "1544717305-2782549b5136",
    about: "1517438476312-10d79c077509",
    gallery: "1544717305-2782549b5136",
  },
  "physical-therapy": {
    hero: "1576091160399-112ba8d25d1d",
    about: "1576091160550-2173dba999ef",
    gallery: "1576091160399-112ba8d25d1d",
  },
  tutoring: {
    hero: "1509062522246-3755977927d7",
    about: "1513258496099-48168024aec0",
    gallery: "1509062522246-3755977927d7",
  },
  "pool-spa": {
    hero: "1505693416388-ac5ce068fe85",
    about: "1519046904884-53103b34b206",
    gallery: "1505693416388-ac5ce068fe85",
  },
  church: {
    hero: "1504052434569-70ad5836ab65",
    about: "1438232992991-995b7058bbb3",
    gallery: "1504052434569-70ad5836ab65",
  },
  restaurant: {
    hero: "1517248135467-4c7edcad34c4",
    about: "1414235077428-338989a2e8c0",
    gallery: "1517248135467-4c7edcad34c4",
  },
  medical: {
    hero: "1584515933487-779824d29309",
    about: "1576091160399-112ba8d25d1d",
    gallery: "1584515933487-779824d29309",
  },
  painting: {
    hero: "1504307651254-35680f356dfd",
    about: "1517581177682-a085bb7ffb15",
    gallery: "1504307651254-35680f356dfd",
  },
  fencing: {
    hero: "1504307651254-35680f356dfd",
    about: "1517581177682-a085bb7ffb15",
    gallery: "1504307651254-35680f356dfd",
  },
  "tree-service": {
    hero: "1416879595882-3373a0480b5b",
    about: "1466692476868-aef1dfb1e735",
    gallery: "1416879595882-3373a0480b5b",
  },
  "pressure-washing": {
    hero: "1504307651254-35680f356dfd",
    about: "1581578731548-c64695cc6952",
    gallery: "1504307651254-35680f356dfd",
  },
  "garage-door": {
    hero: "1621905252507-b35492cc74b4",
    about: "1517048676732-d65bc937f952",
    gallery: "1621905252507-b35492cc74b4",
  },
  locksmith: {
    hero: "1517048676732-d65bc937f952",
    about: "1621905252507-b35492cc74b4",
    gallery: "1517048676732-d65bc937f952",
  },
  towing: {
    hero: "1487754180451-c456f719a1fc",
    about: "1613214149922-f1809c99b414",
    gallery: "1487754180451-c456f719a1fc",
  },
  construction: {
    hero: "1504307651254-35680f356dfd",
    about: "1541888946425-d81bb19240f5",
    gallery: "1517581177682-a085bb7ffb15",
  },
  "med-spa": {
    hero: "1570172619644-dfd03ed5d881",
    about: "1515377905703-c4788e51af15",
    gallery: "1570172619644-dfd03ed5d881",
  },
  "appliance-repair": {
    hero: "1621905251918-48416bd8575a",
    about: "1621905252507-b35492cc74b4",
    gallery: "1621905251918-48416bd8575a",
  },
  "junk-removal": {
    hero: "1600518464441-9154a4dea21b",
    about: "1600585154526-990dced4db0d",
    gallery: "1600518464441-9154a4dea21b",
  },
  "carpet-cleaning": {
    hero: "1581578731548-c64695cc6952",
    about: "1603712725038-e9334ae8f39f",
    gallery: "1581578731548-c64695cc6952",
  },
  "event-planning": {
    hero: "1519167758481-83f550bb49b3",
    about: "1469371670807-013ccf25f16a",
    gallery: "1519167758481-83f550bb49b3",
  },
};

const VARIANT_DIMENSIONS: Record<FallbackImageVariant, { width: number; height: number }> = {
  hero: { width: 1600, height: 900 },
  about: { width: 1200, height: 900 },
  gallery: { width: 1200, height: 800 },
};

const TINY_DIMENSION_PATTERNS = [
  /[?&](?:w|width)=(\d{1,3})(?:[&#]|$)/i,
  /[?&](?:h|height)=(\d{1,3})(?:[&#]|$)/i,
  /(?:^|[,_/-])w_(\d{1,3})(?:[,_/-]|$)/i,
  /(?:^|[,_/-])h_(\d{1,3})(?:[,_/-]|$)/i,
  /(?:^|[,_/-])(\d{1,3})x(\d{1,3})(?:[,_/-]|$)/i,
  /=w(\d{1,3})-h(\d{1,3})/i,
];

const BLUR_PATTERNS = [
  /[?&]blur=\d+/i,
  /blur_\d+/i,
  /[?&]auto=compress/i,
  /[?&]q=(?:10|15|20|25|30)(?:[&#]|$)/i,
];

const EXPIRED_TOKEN_PATTERNS = [
  /x-amz-expires=/i,
  /x-amz-signature=/i,
  /(?:^|[?&])expires=/i,
  /(?:^|[?&])token=/i,
  /signature=/i,
  /policy=/i,
  /googleusercontent\.com\/proxy/i,
  /wix:image:\/\//i,
  /parastorage\.com/i,
];

const LOGO_PATTERNS = [
  /logo/i,
  /favicon/i,
  /icon/i,
  /\/core\//i,
  /\/brand\//i,
  /\/assets\/logo/i,
  /\/assets\/icon/i,
  /(?:^|[\/_-])(16x16|32x32|48x48|64x64|96x96|128x128|192x192)(?:[\/_.-]|$)/i,
  /(?:google|facebook|yelp|instagram|linkedin|x|twitter|youtube|tiktok|pinterest)\.(?:png|jpe?g|webp|svg)(?:$|[?#])/i,
];
const SCREENSHOT_PATTERNS = [/screen\s?shot/i, /screenshot/i, /thumbnail/i, /thumb/i];

function buildUnsplashUrl(photoId: string, variant: FallbackImageVariant): string {
  const { width, height } = VARIANT_DIMENSIONS[variant];
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}

function extractDimensionHints(url: string): number[] {
  const dimensions: number[] = [];

  for (const pattern of TINY_DIMENSION_PATTERNS) {
    const match = url.match(pattern);
    if (!match) continue;

    for (const value of match.slice(1)) {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) dimensions.push(parsed);
    }
  }

  return dimensions;
}

export function sanitizeImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url.replace(/[\u0000-\u001F\u007F]+/g, "").trim();
}

export function sanitizeImageUrls(urls: string[] | null | undefined): string[] {
  if (!urls) return [];

  const seen = new Set<string>();
  return urls
    .map((url) => sanitizeImageUrl(url))
    .filter((url) => {
      if (!url || seen.has(url)) return false;
      seen.add(url);
      return true;
    });
}

export function isHttpImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function getCategoryFallbackImage(
  category: Category,
  variant: FallbackImageVariant = "hero"
): string {
  return buildUnsplashUrl(CATEGORY_FALLBACK_IDS[category][variant], variant);
}

export function validateImageUrl(
  url: string | null | undefined,
  category: Category,
  variant: FallbackImageVariant = "hero"
): ImageValidationResult {
  const originalUrl = url || "";
  const sanitizedUrl = sanitizeImageUrl(url);
  const issues: ImageValidationIssue[] = [];

  if (!sanitizedUrl) {
    issues.push({
      code: "missing_url",
      severity: "critical",
      message: "Image URL is missing.",
    });
  }

  if (originalUrl && originalUrl !== sanitizedUrl) {
    issues.push({
      code: "trimmed_whitespace",
      severity: "warning",
      message: "Image URL contained leading, trailing, or control-character whitespace and was sanitized.",
    });
  }

  if (sanitizedUrl.startsWith("data:")) {
    issues.push({
      code: "data_uri",
      severity: "critical",
      message: "Data URI images must not be used for production hero or gallery images.",
    });
  } else if (sanitizedUrl) {
    let parsedUrl: URL | null = null;

    try {
      parsedUrl = new URL(sanitizedUrl);
    } catch {
      issues.push({
        code: "malformed_url",
        severity: "critical",
        message: "Image URL is malformed and cannot be parsed.",
      });
    }

    if (parsedUrl && parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      issues.push({
        code: "invalid_protocol",
        severity: "critical",
        message: "Image URL must use http or https.",
      });
    }
  }

  if (sanitizedUrl) {
    const dimensions = extractDimensionHints(sanitizedUrl);
    const hasIconSizedDimensions = dimensions.some((dimension) => dimension > 0 && dimension < 200);
    const hasTinyDimensions = dimensions.some((dimension) => dimension >= 200 && dimension < 400);

    if (hasIconSizedDimensions) {
      issues.push({
        code: "logo_or_icon",
        severity: "critical",
        message: "Image URL includes very small dimension metadata that strongly suggests a logo, icon, or other non-hero asset.",
      });
    }

    if (hasTinyDimensions) {
      issues.push({
        code: "tiny_dimensions",
        severity: "warning",
        message: "Image URL includes small width/height metadata that suggests thumbnail-scale output.",
      });
    }

    if (BLUR_PATTERNS.some((pattern) => pattern.test(sanitizedUrl))) {
      issues.push({
        code: "blur_parameter",
        severity: "warning",
        message: "Image URL contains blur or aggressive compression parameters that usually indicate low-quality imagery.",
      });
    }

    if (EXPIRED_TOKEN_PATTERNS.some((pattern) => pattern.test(sanitizedUrl))) {
      issues.push({
        code: "expired_token",
        severity: "warning",
        message: "Image URL looks like an expiring CDN or signed URL that may break later.",
      });
    }

    if (LOGO_PATTERNS.some((pattern) => pattern.test(sanitizedUrl))) {
      issues.push({
        code: "logo_or_icon",
        severity: "critical",
        message: "Image URL appears to reference a logo, icon, badge, or social-brand asset instead of a true photo.",
      });
    }

    if (SCREENSHOT_PATTERNS.some((pattern) => pattern.test(sanitizedUrl))) {
      issues.push({
        code: "screenshot_pattern",
        severity: "warning",
        message: "Image URL appears to reference a screenshot or thumbnail asset instead of a polished photo.",
      });
    }
  }

  let qualityScore = sanitizedUrl ? 70 : 0;

  if (sanitizedUrl.includes("maps.googleapis.com") || sanitizedUrl.includes("googleusercontent.com")) {
    qualityScore += 12;
  }
  if (sanitizedUrl.includes("images.unsplash.com")) {
    qualityScore += 16;
  }
  if (sanitizedUrl.includes("res.cloudinary.com")) {
    qualityScore += 8;
  }
  if (sanitizedUrl.includes("wixstatic.com") || sanitizedUrl.includes("parastorage.com")) {
    qualityScore -= 18;
  }
  if (issues.some((issue) => issue.code === "tiny_dimensions")) {
    qualityScore -= 30;
  }
  if (issues.some((issue) => issue.code === "blur_parameter")) {
    qualityScore -= 18;
  }
  if (issues.some((issue) => issue.code === "expired_token")) {
    qualityScore -= 18;
  }
  if (issues.some((issue) => issue.code === "logo_or_icon")) {
    qualityScore -= 20;
  }
  if (issues.some((issue) => issue.code === "screenshot_pattern")) {
    qualityScore -= 16;
  }
  if (issues.some((issue) => issue.severity === "critical")) {
    qualityScore -= 40;
  }

  qualityScore = Math.max(0, Math.min(100, qualityScore));

  const shouldUseFallback =
    !sanitizedUrl ||
    issues.some((issue) => issue.severity === "critical") ||
    qualityScore < (variant === "hero" ? 55 : 45);

  return {
    originalUrl,
    sanitizedUrl,
    isValid: issues.every((issue) => issue.severity !== "critical"),
    qualityScore,
    issues,
    shouldUseFallback,
    fallbackUrl: getCategoryFallbackImage(category, variant),
  };
}

export function pickBestImageUrl(
  urls: string[] | null | undefined,
  category: Category,
  variant: FallbackImageVariant = "hero"
): string {
  const sanitizedUrls = sanitizeImageUrls(urls);
  if (sanitizedUrls.length === 0) return getCategoryFallbackImage(category, variant);

  const ranked = sanitizedUrls
    .map((url) => validateImageUrl(url, category, variant))
    .sort((a, b) => b.qualityScore - a.qualityScore);

  return ranked[0]?.shouldUseFallback ? ranked[0].fallbackUrl : ranked[0].sanitizedUrl;
}

export function getDuplicateImageUrls(urls: string[] | null | undefined): string[] {
  const normalized = sanitizeImageUrls(urls);
  const counts = new Map<string, number>();

  for (const url of normalized) {
    const withoutQuery = url.split("?")[0].toLowerCase();
    counts.set(withoutQuery, (counts.get(withoutQuery) || 0) + 1);
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([url]) => url);
}
