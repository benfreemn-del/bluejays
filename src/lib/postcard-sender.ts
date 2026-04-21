/**
 * Postcard sender — Lob API integration.
 *
 * Ships a physical postcard to a prospect's mailing address with their
 * preview-page screenshot on the front and a personal handwritten-style
 * note on the back. Direct-mail response rates for small-business B2B
 * typically run 4-9%, dwarfing the 1-2% cold email benchmark — and the
 * channel has no TCR/A2P/CAN-SPAM exposure whatsoever.
 *
 * Triggered from the funnel between email 1 and email 2 (typically Day 7)
 * and ONLY for prospects with strong social signals (4.5+ star rating,
 * 20+ reviews) to protect the ~$1.50 per-send cost.
 *
 * Ben provides:
 *   - LOB_API_KEY     Lob live key starting with `live_pub_...`
 *   - LOB_FROM_NAME   Return name — e.g. "Ben @ BlueJays"
 *   - LOB_FROM_LINE1  Return address line 1
 *   - LOB_FROM_CITY   Return city
 *   - LOB_FROM_STATE  Return state (WA)
 *   - LOB_FROM_ZIP    Return ZIP
 *
 * When LOB_API_KEY is absent the sender logs + no-ops so local dev and
 * pre-launch funnel runs never charge Lob or crash the funnel.
 *
 * Lob API docs: https://docs.lob.com/#tag/Postcards
 */

import type { Prospect } from "./types";
import { getShortPreviewUrl } from "./short-urls";
import { logCost } from "./cost-logger";
import { supabase, isSupabaseConfigured } from "./supabase";

const LOB_API_KEY = process.env.LOB_API_KEY;
const LOB_BASE_URL = "https://api.lob.com/v1";

// Postcard sending is gated to top-tier prospects only to protect cost.
// Override by passing { forceTier: true } at call time if you want to
// blast a batch regardless of rating.
const MIN_RATING_FOR_POSTCARD = 4.5;
const MIN_REVIEWS_FOR_POSTCARD = 20;

// Supabase Storage bucket created 2026-04-20 specifically for postcard
// front screenshots. Public read, 10MB max, PNG/JPEG only.
const POSTCARD_BUCKET = "postcard-screenshots";

// Cache version. Bump this whenever capture logic changes materially
// (e.g. new waitForFunction, new viewport size, new JPEG quality) OR
// when the preview content itself changes in a way that invalidates
// every cached capture (e.g. a V2 template's stock image pool changes).
// v1 → v2 (2026-04-20): poisoned caches from pre-waitForFunction era
// contained 28KB "Loading your website preview..." skeletons.
// v2 → v3 (2026-04-21): V2GeneralContractorPreview's stock pools were
// expanded (1 → 8 hero, 1 → 5 about) and a developer-at-monitor photo
// was removed. Any GC-prospect capture taken during the v2 era has the
// old wrong photo embedded — v3 forces a clean re-capture.
// v3 → v4 (2026-04-21): Diagnostic re-capture to chase an "outlet" image
// that appeared on the v3 postcard capture but doesn't appear in the
// debug-endpoint's DOM dump (which shows a DJI aerial drone photo at
// the hero-card slot). Bumping invalidates v3 cache so we see what
// Browserless currently captures live.
const CACHE_VERSION = "v4";

// Minimum JPEG size to TRUST a cached capture. A loading-skeleton
// screenshot at 1800x1250 compresses to ~28KB because it's mostly a
// flat dark-navy background with a few short text lines. Real preview
// screenshots (hero image, sections, gradients, glass cards) land at
// 100-300KB. 50KB splits the difference cleanly and rejects skeletons.
// Note: kept separate from the capture-success threshold (8KB) used
// to detect outright-blank captures from Browserless — we're stricter
// about trusting what we read back than about what we just captured.
const CACHE_MIN_VALID_BYTES = 50_000;

/**
 * Capture a rendered screenshot of the prospect's preview page and return
 * it as a base64 data URI for direct embedding in HTML.
 *
 * WHY base64 instead of a public URL: Lob's PDF renderer consistently 404'd
 * when asked to fetch Supabase Storage URLs (we verified the URLs return 200
 * for everyone else, but Lob kept reporting "file not found"). Embedding the
 * image as a data URI bypasses Lob's fetch pipeline entirely — the image
 * bytes arrive INLINE with the HTML, zero external dependencies.
 *
 * Pipeline:
 *   Browserless captures the page (waits for loading skeleton to clear) →
 *   Returns JPEG bytes → We also upload to Supabase for caching / audit →
 *   Return the data URI for inclusion in the <img src="...">.
 *
 * HTML body size with base64 lands around 220KB per postcard, well under
 * Lob's 10MB HTML template size cap.
 *
 * Falls back to a thum.io URL if Browserless is unavailable — postcards
 * never fully block on this capture step.
 */
async function capturePostcardShot(prospectId: string): Promise<string> {
  const base = "https://bluejayportfolio.com";
  const target = `${base}/preview/${prospectId}?embed=1`;
  const thumioFallback = `https://image.thum.io/get/width/1800/crop/1250/wait/12/refresh/300/png/${target}`;

  const browserlessKey = process.env.BROWSERLESS_API_KEY;
  if (!browserlessKey) {
    console.warn("[postcard-sender] BROWSERLESS_API_KEY missing — using thum.io fallback");
    return thumioFallback;
  }

  // Check Supabase cache first (by prospect). If we have a fresh JPEG on file,
  // skip the Browserless call and inline the cached bytes as base64.
  // Cache key includes CACHE_VERSION so a logic bump invalidates every cached
  // capture atomically instead of us having to hand-purge the bucket.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const storagePath = `${prospectId}.${CACHE_VERSION}.jpg`;
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${POSTCARD_BUCKET}/${storagePath}`;

  if (isSupabaseConfigured()) {
    try {
      const cached = await fetch(publicUrl);
      if (cached.ok) {
        const buf = Buffer.from(await cached.arrayBuffer());
        if (buf.length >= CACHE_MIN_VALID_BYTES) {
          console.log(`[postcard-sender] reusing cached screenshot for ${prospectId} (${buf.length} bytes)`);
          return `data:image/jpeg;base64,${buf.toString("base64")}`;
        }
        console.warn(`[postcard-sender] cached screenshot for ${prospectId} is ${buf.length} bytes (< ${CACHE_MIN_VALID_BYTES}) — likely a loading-skeleton capture. Forcing fresh capture.`);
      }
    } catch { /* fall through to fresh capture */ }
  }

  const browserlessUrl = `https://production-sfo.browserless.io/screenshot?token=${encodeURIComponent(browserlessKey)}&stealth=true`;
  // Wait until the loading skeleton has disappeared AND at least one hero
  // image has rendered — both signals the React preview has fully painted.
  const waitFn = `async () => {
    const hasLoadingText = Array.from(document.querySelectorAll('*'))
      .some(el => el.textContent && el.textContent.includes('Loading your website preview'));
    if (hasLoadingText) return false;
    const heroImg = document.querySelector('section img, [class*="hero"] img');
    if (!heroImg) return document.body.textContent.length > 200;
    return heroImg.complete && heroImg.naturalWidth > 0;
  }`;
  const payload = {
    url: target,
    options: {
      type: "jpeg",
      quality: 85,
      clip: { x: 0, y: 0, width: 1800, height: 1250 },
    },
    viewport: { width: 1800, height: 1250, deviceScaleFactor: 1 },
    gotoOptions: { waitUntil: "networkidle2", timeout: 30000 },
    waitForFunction: { fn: waitFn, timeout: 20000 },
  };

  try {
    const res = await fetch(browserlessUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Browserless ${res.status}: ${body.slice(0, 200)}`);
    }
    const jpegBuffer = Buffer.from(await res.arrayBuffer());
    if (jpegBuffer.length < 8000) {
      throw new Error(`Screenshot too small (${jpegBuffer.length} bytes) — likely blank render`);
    }

    // Also write to Supabase for caching — so the next postcard to the same
    // prospect skips Browserless entirely. Fire-and-forget; errors here are
    // non-fatal since we're returning the data URI directly anyway.
    if (isSupabaseConfigured()) {
      supabase.storage
        .from(POSTCARD_BUCKET)
        .upload(storagePath, jpegBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        })
        .then(({ error }) => {
          if (error) console.warn(`[postcard-sender] Supabase cache write failed:`, error.message);
        });
    }

    console.log(`[postcard-sender] captured fresh screenshot for ${prospectId} (${jpegBuffer.length} bytes → base64 embed)`);
    return `data:image/jpeg;base64,${jpegBuffer.toString("base64")}`;
  } catch (err) {
    console.error(`[postcard-sender] capture failed, falling back to thum.io URL:`, err);
    return thumioFallback;
  }
}

export interface PostcardSendResult {
  sent: boolean;
  skipped?: "no_api_key" | "below_tier" | "no_address" | "already_sent";
  lobId?: string;
  expectedDeliveryDate?: string;
  costUsd?: number;
  error?: string;
}

/**
 * Compose the HTML that renders on the FRONT of the postcard. Lob accepts
 * HTML and renders it at 6.125" x 4.25" (1837 x 1275 pixels at 300dpi).
 * Keep the HTML minimal — Lob's renderer runs headless Chrome and doesn't
 * load external fonts reliably. Use system fonts + inline styles only.
 *
 * IMPORTANT: Lob's PDF renderer does NOT respect `<meta charset="utf-8">`
 * reliably — so special characters like arrows (→) and em-dashes (—)
 * render as mojibake (â†' / â€"). Always use HTML numeric entities for
 * anything outside ASCII. Same for accented characters in business names.
 */
/**
 * Public entry-point used by `/api/postcards/html/[id]/[side]` to serve
 * a single side of the postcard as a remote-hosted HTML document. Lob's
 * inline HTML has a 10,000-char limit so we can't embed base64 images
 * directly — instead Lob fetches this URL and gets the full ~220KB HTML
 * including the inline JPEG.
 */
export async function buildPostcardHtml(
  prospect: Prospect,
  side: "front" | "back",
): Promise<string> {
  return side === "front" ? buildFrontHtml(prospect) : buildBackHtml(prospect);
}

async function buildFrontHtml(prospect: Prospect): Promise<string> {
  // Resolve the screenshot URL BEFORE building HTML. capturePostcardShot
  // renders via Browserless (waits for our loading skeleton to clear)
  // and uploads to Supabase Storage, or falls back to thum.io on failure.
  // Either way returns a public PNG URL Lob can embed.
  const screenshotUrl = await capturePostcardShot(prospect.id);
  const escapedName = esc(prospect.businessName);
  // Bleed safety: Lob trims 0.0625" (~19px at 300dpi) from each edge during
  // printing. Keep important text/layout ≥ 0.15" from any edge so nothing
  // gets chopped. Previous version had the tag at bottom: 26px which sat
  // dangerously close to the bleed line and the subtitle at bottom: 8px
  // which got eaten entirely.
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page { size: 6.125in 4.25in; margin: 0; }
    body { margin: 0; padding: 0; width: 6.125in; height: 4.25in; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; background: #0a0a0a; color: #fff; }
    .wrap { position: relative; width: 100%; height: 100%; overflow: hidden; }
    .shot { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top center; }
    .overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.95) 100%); }
    .textblock {
      position: absolute;
      left: 0.25in;
      right: 0.25in;
      bottom: 0.3in;          /* pulled inside the print-safe zone */
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .tag {
      font-size: 18pt;
      font-weight: 800;
      letter-spacing: -0.015em;
      line-height: 1.2;
      color: #ffffff;
      text-shadow: 0 2px 8px rgba(0,0,0,0.55);
    }
    .sub {
      font-size: 9.5pt;
      color: #e5e7eb;
      font-weight: 500;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }
  </style></head><body>
    <div class="wrap">
      <img class="shot" src="${screenshotUrl}" alt="${escapedName} website preview" />
      <div class="overlay"></div>
      <div class="textblock">
        <div class="tag">Made this for ${escapedName}</div>
        <div class="sub">Flip over &rarr; take a look.</div>
      </div>
    </div>
  </body></html>`;
}

/** Escape string for safe HTML interpolation. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * HTML for the BACK of the postcard. Lob auto-reserves the RIGHT half
 * (3.375" wide) for the mailing address + postage indicia + barcode, so
 * we write only in the LEFT half. Keep content strictly within a 3.25"
 * column or it'll collide with the auto-overlay.
 *
 * Same UTF-8 caveat as buildFrontHtml: use HTML entities for non-ASCII
 * or it renders as mojibake in Lob's PDF output.
 */
function buildBackHtml(prospect: Prospect): string {
  const previewUrl = getShortPreviewUrl(prospect);
  // Strip protocol + trailing slash for display — shorter, cleaner on card
  const displayUrl = previewUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  // Warmer greeting — "there" alone reads as clipped/impersonal. Use
  // "Hi there," when no name, or "Hi {firstname}," when we have one.
  const firstName = prospect.ownerName?.split(" ")[0];
  const greeting = firstName ? `Hi ${esc(firstName)},` : "Hi there,";
  const escapedName = esc(prospect.businessName);
  const qrData = encodeURIComponent(previewUrl);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page { size: 6.125in 4.25in; margin: 0; }
    body {
      margin: 0; padding: 0;
      width: 6.125in; height: 4.25in;
      /* Warmer/more personal font stack. Georgia + system serifs read as
         "handwritten letter" vs the clinical vibe of sans-serif Arial.
         Lob's renderer loads Georgia reliably (installed on headless
         Chrome baseline) so we don't need to chance Google Fonts. */
      font-family: Georgia, "Iowan Old Style", "Palatino Linotype", serif;
      background: #fffdf7;
      color: #1f2937;
    }
    /* Hard-cap to 3.0in so content never bleeds into Lob's right-half
       reserved address block (the indicia/barcode/recipient area).
       Width was 3.1in but tests showed URL text still brushing the edge. */
    .note { box-sizing: border-box; width: 3.0in; padding: 0.3in 0.28in; font-size: 12pt; line-height: 1.45; }
    .note p { margin: 0 0 9px; }
    .h { font-size: 15pt; font-weight: 700; margin: 0 0 10px; color: #111827; }
    .url {
      margin: 12px 0 8px;
      padding: 9px 6px;
      border: 1.5px dashed #2563eb;
      border-radius: 6px;
      /* ui-monospace stack + smaller size so bluejayportfolio.com/p/8chars
         (31 chars) fits COMFORTABLY inside the 2.44in-wide inner box.
         Previous 7.5pt with -0.02em tracking still brushed the edge. */
      font-family: ui-monospace, "Menlo", "Courier New", monospace;
      font-size: 7pt;
      color: #2563eb;
      text-align: center;
      letter-spacing: 0;
      white-space: nowrap;
      overflow: visible;
    }
    .qr { margin: 8px 0 12px; text-align: center; }
    .qr img { width: 0.9in; height: 0.9in; display: inline-block; border: 4px solid #fffdf7; /* clean edge against cream bg */ }
    .sig {
      margin: 10px 0 0;
      font-size: 16pt;
      font-weight: 700;
      color: #2563eb;
      font-style: italic;
      /* Slightly angled to feel hand-written without a full cursive font */
      letter-spacing: 0.01em;
    }
  </style></head><body>
    <div class="note">
      <p class="h">${greeting}</p>
      <p>Spent a few hours building a website concept for ${escapedName}.</p>
      <p>Scan or type it in &mdash; take a look when you have a sec:</p>
      <div class="url">${esc(displayUrl)}</div>
      <div class="qr"><img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}" alt="QR" /></div>
      <p class="sig">&mdash; Ben</p>
    </div>
  </body></html>`;
}

function isEligibleForPostcard(prospect: Prospect): boolean {
  if (!prospect.address) return false;
  // Require strong social signals to justify the $1.50 per-send cost.
  if ((prospect.googleRating ?? 0) < MIN_RATING_FOR_POSTCARD) return false;
  if ((prospect.reviewCount ?? 0) < MIN_REVIEWS_FOR_POSTCARD) return false;
  return true;
}

/**
 * Parse a stored `address` field like "35 Robbins Rd, Sequim, WA 98382"
 * into Lob's expected shape. Lob requires address_line1 + city + state + zip.
 */
function parseAddress(address: string): {
  line1: string;
  city: string;
  state: string;
  zip: string;
} | null {
  // Split by commas, trim each piece. Expected 3-part: "street, city, state zip"
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 3) return null;
  const line1 = parts[0];
  const city = parts[1];
  // Last chunk = "WA 98382" or "WA 98382 USA"
  const lastChunk = parts[parts.length - 1].replace(/\bUSA\b/i, "").trim();
  const match = lastChunk.match(/^([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/i);
  if (!match) return null;
  return { line1, city, state: match[1].toUpperCase(), zip: match[2] };
}

/**
 * Send a postcard to the prospect. Safe to call for any prospect — eligibility
 * checks run inside. Returns a result object rather than throwing so the funnel
 * runner can log + continue.
 */
export async function sendPostcard(
  prospect: Prospect,
  options: { forceTier?: boolean } = {},
): Promise<PostcardSendResult> {
  if (!LOB_API_KEY) {
    console.log("[postcard-sender] LOB_API_KEY not set — skipping send (safe dev no-op)");
    return { sent: false, skipped: "no_api_key" };
  }

  if (!options.forceTier && !isEligibleForPostcard(prospect)) {
    return { sent: false, skipped: "below_tier" };
  }

  if (!prospect.address) {
    return { sent: false, skipped: "no_address" };
  }
  const parsed = parseAddress(prospect.address);
  if (!parsed) {
    return {
      sent: false,
      skipped: "no_address",
      error: `Could not parse address: ${prospect.address}`,
    };
  }

  const toName = prospect.ownerName || prospect.businessName;

  // Normalize return-address env vars — strip whitespace on every field,
  // and validate the ZIP format before we even hit Lob. Lob's error
  // message just says "address_zip is not a valid ZIP code" without
  // specifying TO vs FROM, so catching a malformed LOB_FROM_ZIP early
  // turns a generic 422 into a clear actionable error.
  const fromName = (process.env.LOB_FROM_NAME || "Ben @ BlueJays").trim();
  const fromLine1 = (process.env.LOB_FROM_LINE1 || "").trim();
  const fromCity = (process.env.LOB_FROM_CITY || "").trim();
  const fromState = (process.env.LOB_FROM_STATE || "WA").trim().toUpperCase();
  const fromZip = (process.env.LOB_FROM_ZIP || "").trim();

  // Pre-flight: catch invalid return address before the API call so the
  // error points at the actual problem (usually a typoed env var).
  if (!fromLine1 || !fromCity) {
    return {
      sent: false,
      error: `Return-address env vars missing. Set LOB_FROM_LINE1 and LOB_FROM_CITY on Vercel.`,
    };
  }
  if (!/^\d{5}(-\d{4})?$/.test(fromZip)) {
    return {
      sent: false,
      error: `LOB_FROM_ZIP "${fromZip}" is not a valid US ZIP (need 5 digits, optionally ZIP+4). Fix the Vercel env var.`,
    };
  }
  if (!/^\d{5}(-\d{4})?$/.test(parsed.zip)) {
    return {
      sent: false,
      error: `Prospect ZIP "${parsed.zip}" (parsed from address "${prospect.address}") is not valid. Fix the prospect record.`,
    };
  }

  const payload = {
    description: `BlueJays pitch postcard — ${prospect.businessName}`,
    to: {
      name: toName,
      address_line1: parsed.line1,
      address_city: parsed.city,
      address_state: parsed.state,
      address_zip: parsed.zip,
      address_country: "US",
    },
    from: {
      name: fromName,
      address_line1: fromLine1,
      address_city: fromCity,
      address_state: fromState,
      address_zip: fromZip,
      address_country: "US",
    },
    // Point Lob at REMOTE HTML URLs (served by /api/postcards/html/[id]/[side])
    // rather than inlining the HTML in the API call. Inline HTML is capped
    // at 10,000 characters by Lob, which our base64-embedded JPEG blows past.
    // Remote HTML has no size limit — Lob's renderer just fetches the URL.
    // Pre-warm the cache by ALSO calling the capture function first, so the
    // Supabase cache is hot by the time Lob fetches the HTML endpoint.
    // (The endpoint itself will fall back to a fresh capture if needed.)
    front: `https://bluejayportfolio.com/api/postcards/html/${prospect.id}/front`,
    back: `https://bluejayportfolio.com/api/postcards/html/${prospect.id}/back`,
    size: "4x6",
    mail_type: "usps_first_class",
    // Lob requires every postcard to declare whether it's "marketing" or
    // "operational" content (compliance field added after account admins
    // can no longer set a global default). Our cold-outreach pitch cards
    // are unambiguously marketing under TCPA/CAN-SPAM frameworks.
    use_type: "marketing",
    metadata: {
      prospect_id: prospect.id,
      business_name: prospect.businessName.slice(0, 80),
    },
  };

  try {
    const authHeader = "Basic " + Buffer.from(`${LOB_API_KEY}:`).toString("base64");
    const res = await fetch(`${LOB_BASE_URL}/postcards`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[postcard-sender] Lob error ${res.status}:`, errText.slice(0, 400));
      return { sent: false, error: `Lob ${res.status}: ${errText.slice(0, 200)}` };
    }

    const body = (await res.json()) as {
      id: string;
      expected_delivery_date: string;
      tracking_events?: unknown;
    };

    // Lob first-class 4x6 postcard ≈ $0.79-$1.50 depending on volume.
    // Log as an approximation; exact charge lands in Lob invoice.
    await logCost({
      prospectId: prospect.id,
      service: "lob_postcard",
      action: "send",
      costUsd: 1.2,
      status: "success",
      metadata: { lobId: body.id, expectedDelivery: body.expected_delivery_date },
    });

    return {
      sent: true,
      lobId: body.id,
      expectedDeliveryDate: body.expected_delivery_date,
      costUsd: 1.2,
    };
  } catch (err) {
    console.error("[postcard-sender] send failed:", err);
    return {
      sent: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
