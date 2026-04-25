import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOwnerAlert } from "@/lib/alerts";

/**
 * Self-hosted open-tracking pixel — `GET /api/o/[code]`
 *
 * WHY this exists:
 *   SendGrid's built-in open tracking rewrites the email's HTML to embed
 *   a SendGrid-domain pixel + click-redirects. Both are well-known
 *   commercial-sender fingerprints that Gmail's Promotions/Spam
 *   classifiers pattern-match against. Per the project's deliverability
 *   rules, every outreach email leaves SendGrid open + click tracking
 *   OFF (`open_tracking: { enable: false }` in email-sender.ts).
 *
 *   The cost: we lose first-party open data, AND the hot-lead-on-first-
 *   open SMS alert in /api/email-tracking never fires (the SendGrid
 *   webhook never receives an `open` event because tracking is off).
 *
 *   This route restores that signal without the deliverability cost:
 *   a 43-byte transparent GIF served from our own domain. Gmail's
 *   classifier doesn't pattern-match on our pixel because it's a
 *   first-party first-load image from the sender's own brand domain
 *   (same domain pattern as the unsubscribe + book + preview shorturl
 *   routes). No third-party tracking-pixel signature.
 *
 * HOW it's wired:
 *   - The `[code]` is the prospect's deterministic 8-char short_code
 *     (same one used by /p/[code], /u/[code], /b/[code]). Resolved via
 *     `prospects.short_code` for the lookup.
 *   - Mounted into the HTML pitch body via `getTrackingPixel()` in
 *     `email-templates.ts` — only rendered when `htmlBody` is enabled
 *     (post-warmup, `ENABLE_HTML_PITCH_EMAIL=true`). Plain-text email
 *     can't track opens; we accept that.
 *   - On hit: log an `email_events` row with type=open + prospect_id +
 *     timestamp. If this is the FIRST open for this prospect (no
 *     prior open event), fire `sendOwnerAlert()` with the hot-lead
 *     SMS so Ben can call within 5 minutes of the open (5-min response
 *     window = 9× conversion lift per MIT/InsideSales).
 *   - Pixel returns regardless of DB status. Never block a 1×1 image
 *     load on an upstream Supabase write.
 *
 * Headers:
 *   Cache-Control: no-store — every render is a unique open event.
 *     If a CDN caches the pixel, future opens by the same prospect
 *     don't fire alerts (one false positive). Force fresh fetch
 *     on every load.
 *
 * Public route — added to PUBLIC_API_PATHS in middleware.ts so the
 * pixel is reachable without an admin auth cookie (recipients of the
 * email obviously don't have one).
 */

// 43-byte 1×1 transparent GIF. Smallest valid image format. Hex-decoded
// at module load so we don't pay the decode cost per request.
const TRANSPARENT_GIF = Buffer.from(
  "47494638396101000100800000ffffff00000021f90401000000002c00000000010001000002024401003b",
  "hex",
);

const BASE_URL = "https://bluejayportfolio.com";

/**
 * Resolve an 8-char short code to a prospect record. Returns null on
 * any failure (malformed code, missing DB, no match) so the pixel
 * still renders — never let a lookup failure break the image load.
 */
async function lookupByCode(code: string): Promise<{
  id: string;
  businessName: string;
  city: string | null;
  category: string | null;
  phone: string | null;
  status: string | null;
  generatedSiteUrl: string | null;
} | null> {
  if (!isSupabaseConfigured()) return null;
  if (!/^[a-f0-9]{8}$/i.test(code)) return null;

  try {
    const { data } = await supabase
      .from("prospects")
      .select("id, business_name, city, category, phone, status, generated_site_url")
      .eq("short_code", code.toLowerCase())
      .limit(1)
      .single();

    if (!data) return null;
    return {
      id: data.id as string,
      businessName: (data.business_name as string) || "Unknown",
      city: (data.city as string | null) || null,
      category: (data.category as string | null) || null,
      phone: (data.phone as string | null) || null,
      status: (data.status as string | null) || null,
      generatedSiteUrl: (data.generated_site_url as string | null) || null,
    };
  } catch {
    return null;
  }
}

/**
 * Check whether this prospect has a prior `open` event already logged.
 * Used to gate the hot-lead-on-first-open SMS alert.
 */
async function hasPriorOpen(prospectId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { data } = await supabase
      .from("email_events")
      .select("id")
      .eq("prospect_id", prospectId)
      .eq("event_type", "open")
      .limit(1);
    return !!(data && data.length > 0);
  } catch {
    // If we can't tell (DB hiccup), assume NOT first open — better to
    // miss a hot-lead alert than to spam Ben on every retry.
    return true;
  }
}

/**
 * Fire-and-forget DB write + first-open alert. Never blocks the GIF
 * response — wrapped in a Promise that we don't await on the response
 * path so the pixel returns in <50ms regardless of upstream latency.
 */
async function trackOpen(code: string, request: NextRequest): Promise<void> {
  const prospect = await lookupByCode(code);
  if (!prospect) return;

  const isFirstOpen = !(await hasPriorOpen(prospect.id));

  // Log the open event. Use prospect_id (FK column added 2026-04-24
  // for this pixel — SendGrid webhook events use email-only and
  // populate prospect_id only when getProspectByEmail() succeeds).
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("email_events").insert({
        prospect_id: prospect.id,
        event_type: "open",
        timestamp: new Date().toISOString(),
        user_agent: request.headers.get("user-agent") || null,
        ip:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          null,
        // No `email` column populated — the pixel doesn't know the
        // recipient address, only the prospect short code. SendGrid
        // webhook events still populate `email` for cross-reference.
      });
    } catch {
      // Non-fatal — keep going so the alert can still fire
    }
  }

  if (isFirstOpen) {
    const dashboardUrl = `${BASE_URL}/lead/${prospect.id}`;
    const previewUrl = prospect.generatedSiteUrl
      ? `${BASE_URL}${prospect.generatedSiteUrl}`
      : `${BASE_URL}/preview/${prospect.id}`;

    const lines = [
      `🔥 ${prospect.businessName} just opened your email — call within 5 min`,
      prospect.city || prospect.category
        ? `📍 ${prospect.city || ""}${prospect.city && prospect.category ? " · " : ""}${prospect.category || ""}`
        : "",
      prospect.phone ? `📞 ${prospect.phone}` : "",
      `🌐 ${previewUrl}`,
      `📋 ${dashboardUrl}`,
    ].filter(Boolean);

    await sendOwnerAlert(lines.join("\n")).catch(() => {
      // Never break the pixel on a Twilio/alert hiccup
    });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;

  // Fire-and-forget the DB write + alert. The pixel returns immediately;
  // tracking happens in the background. If it fails, we miss one open —
  // we never block image rendering on it.
  void trackOpen(code, request).catch(() => {
    // Swallow all errors — the pixel never fails the prospect's email open
  });

  return new NextResponse(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(TRANSPARENT_GIF.length),
      // Force every open to fetch fresh — CDN caching the pixel would
      // suppress subsequent opens (one alert per session at most). Also
      // tells Gmail's image proxy to fetch each time the email is opened.
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
