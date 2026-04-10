const US_STATE_CODES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS",
  "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY",
  "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV",
  "WI", "WY", "DC",
]);

const US_STATE_NAMES = new Set([
  "alabama", "alaska", "arizona", "arkansas", "california", "colorado", "connecticut", "delaware", "florida",
  "georgia", "hawaii", "idaho", "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana", "maine",
  "maryland", "massachusetts", "michigan", "minnesota", "mississippi", "missouri", "montana", "nebraska",
  "nevada", "new hampshire", "new jersey", "new mexico", "new york", "north carolina", "north dakota", "ohio",
  "oklahoma", "oregon", "pennsylvania", "rhode island", "south carolina", "south dakota", "tennessee", "texas",
  "utah", "vermont", "virginia", "washington", "west virginia", "wisconsin", "wyoming", "district of columbia",
]);

function cleanSegment(segment: string): string {
  return segment
    .replace(/\s+/g, " ")
    .replace(/^[-–—\s]+|[-–—\s]+$/g, "")
    .replace(/,+$/g, "")
    .trim();
}

function normalizeKey(segment: string): string {
  return segment
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getStateCodeFromSegment(segment: string): string | null {
  const uppercase = segment.toUpperCase();
  const codeMatch = uppercase.match(/\b([A-Z]{2})\b/);
  if (codeMatch && US_STATE_CODES.has(codeMatch[1])) {
    return codeMatch[1];
  }

  const lowered = segment.toLowerCase();
  for (const stateName of US_STATE_NAMES) {
    if (lowered.includes(stateName)) {
      return stateName;
    }
  }

  return null;
}

function isUsCountrySegment(segment: string): boolean {
  return /^(usa|u\.s\.a\.?|us|u\.s\.?|united states|united states of america)$/i.test(segment.trim());
}

function isCountySegment(segment: string): boolean {
  return /\bcounty\b/i.test(segment);
}

function isStandaloneStateSegment(segment: string): boolean {
  const cleaned = cleanSegment(segment);
  return US_STATE_CODES.has(cleaned.toUpperCase()) || US_STATE_NAMES.has(cleaned.toLowerCase());
}

function segmentContainsStateCode(segment: string, stateCode: string): boolean {
  return new RegExp(`\\b${stateCode}\\b`, "i").test(segment);
}

export function normalizeAddress(address?: string | null): string | undefined {
  if (typeof address !== "string") return undefined;

  const raw = address
    .replace(/[\r\n]+/g, ", ")
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/,+/g, ",")
    .trim()
    .replace(/,+$/g, "")
    .trim();

  if (!raw) return undefined;

  const segments = raw
    .split(",")
    .map(cleanSegment)
    .filter(Boolean);

  if (segments.length === 0) return undefined;

  const hasState = segments.some((segment) => getStateCodeFromSegment(segment) !== null);
  const normalizedSegments: string[] = [];
  const seen = new Set<string>();

  for (const segment of segments) {
    if (isUsCountrySegment(segment) && hasState) {
      continue;
    }

    if (isCountySegment(segment) && hasState) {
      continue;
    }

    const key = normalizeKey(segment);
    if (!key || seen.has(key)) {
      continue;
    }

    if (isStandaloneStateSegment(segment)) {
      const stateCode = getStateCodeFromSegment(segment);
      if (
        stateCode &&
        normalizedSegments.some((existing) => segmentContainsStateCode(existing, stateCode))
      ) {
        continue;
      }
    }

    normalizedSegments.push(segment);
    seen.add(key);
  }

  return normalizedSegments.join(", ").replace(/,+$/g, "").trim() || undefined;
}
