import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "").trim();

// Pre-compute session token using Web Crypto (Edge-compatible)
// This replaces Node.js crypto.createHash which doesn't work in Edge Runtime
let SESSION_TOKEN_CACHE: string | null = null;
async function getSessionToken(): Promise<string> {
  if (SESSION_TOKEN_CACHE) return SESSION_TOKEN_CACHE;
  if (!ADMIN_PASSWORD) return "";
  const encoder = new TextEncoder();
  const data = encoder.encode(ADMIN_PASSWORD + "bluejays-session-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  SESSION_TOKEN_CACHE = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return SESSION_TOKEN_CACHE;
}

// Protected routes that require login
const PROTECTED_PATHS = [
  "/dashboard",
  "/funnel-tracker",
  "/scripts",
  "/lead",
  "/preview-device",
  "/image-mapper",
  "/image-audit",
  "/spending",
  "/analytics",
  "/videos",
  "/api/scout",
  "/api/prospects",
  "/api/email",
  "/api/sms",
  "/api/instagram",
  "/api/generate",
  "/api/checkout",
  "/api/ai-respond",
  "/api/comms",
  "/api/call-lists",
  "/api/export",
  "/api/edit",
  "/api/image-mapper",
  "/api/image-audit",
  "/api/quality-review",
  "/api/leads/manual",
  "/api/test-funnel",
  // Sensitive API routes that must require auth
  // (/api/funnel/run is intentionally NOT listed here — it's Vercel-cron
  //  invoked and gated by CRON_SECRET inside the handler. Listed below in
  //  PUBLIC_API_PATHS.)
  "/api/funnel",
  "/api/funnel/enroll",
  "/api/outreach/bulk",
  "/api/costs",
  "/api/costs/analytics",
  "/api/spending",
  "/api/funnel-analytics",
  "/api/notes",
  "/api/voicemail/drop",
  "/api/winback",
  "/api/pipeline-velocity",
  "/api/pipeline/batch",
  "/api/qc",
  "/api/leaderboard",
  "/api/email-stats",
  "/api/referral",
  "/api/onboarding",
  "/api/vsl/generate",
  "/api/voicemail",
  "/api/videos",
  "/api/admin",
  "/api/retarget",
  "/api/followup-scheduler",
  "/api/scout-optimizer",
  // /api/replies covers the dashboard's pending-review GET + approve/reject
  //  POSTs. /api/replies/process stays in PUBLIC_API_PATHS (checked first)
  //  so the per-minute cron still reaches it.
  "/api/replies",
  // /api/replies/process moved to PUBLIC_API_PATHS — gated by CRON_SECRET
  //  inside the handler. Must be reachable by Vercel cron every minute.
  "/api/email-deliverability",
  // /api/email-tracking moved to PUBLIC_API_PATHS — it's the SendGrid event
  //  webhook (open/click/bounce events); SendGrid's POST has no auth cookie,
  //  so leaving it behind middleware auth returns 401 on every event and
  //  guts engagement analytics. Endpoint verifies SendGrid signature when
  //  SENDGRID_WEBHOOK_PUBLIC_KEY is set.
  "/api/auto-scout",
  "/api/warming",
  "/api/postcards",
  "/api/domains",
  "/funnel-tracker",
];

// Public API routes that must bypass auth (webhooks, inbound handlers)
//
// NOTE on the `/client/[id]` page route: it is PUBLIC by virtue of NOT being
// listed in PROTECTED_PATHS. Auth model is "URL-as-secret" — the prospect's
// UUID in the URL IS the credential, same pattern as a magic link. The page
// itself sets robots:noindex+nocache headers and only fetches whitelist-safe
// data. See CLAUDE.md "Customer Portal — /client/[id]" for the full rationale.
const PUBLIC_API_PATHS = [
  "/api/webhooks/stripe",
  "/api/email-tracking",      // SendGrid event webhook (open/click/bounce)
  "/api/inbound/email",
  "/api/inbound/sms",
  "/api/inbound/vonage-sms",
  "/api/checkout/create", // Prospects need to create checkout sessions
  "/api/checkout/upsell", // Paid customers buy upsell SKUs from /upsells/[id]
  "/api/claim/",          // Public claim-page data (sanitized — see /api/claim/[id])
  "/api/engagement/",     // Engagement score/triggers for claim + preview pages
  "/api/generated-sites/",// Preview-page site data (public — same data prospects see rendered)
  "/api/proposals/",
  "/api/calendar/available-slots",
  "/api/call-lists", // CSV downloads are linked directly from the dashboard
  "/api/unsubscribe", // Prospects click unsubscribe link from email — no auth needed
  "/api/auth/login",
  "/api/leads/submit",
  "/api/portfolio",
  "/api/social-proof",
  "/api/track/",
  "/api/image-proxy",
  "/api/voicemail/status", // Twilio status callback
  "/api/voicemail/twiml",  // Twilio TwiML endpoint
  "/api/onboarding-reminders/process", // Vercel cron — gated by CRON_SECRET in the handler
  "/api/funnel/run",                   // Vercel cron (daily 08:00 UTC) — gated by CRON_SECRET
  "/api/replies/process",              // Vercel cron (per minute) — gated by CRON_SECRET
  "/api/postcards/html/",              // Lob's renderer fetches these; public (just pre-rendered preview HTML)
  "/api/inquire/",                     // Public form submission from /inquire/[code]
  "/api/o/",                           // Self-hosted email open-tracking pixel (1×1 GIF) — public so recipients can load it
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public API paths (webhooks, inbound handlers)
  if (PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Check auth cookie (signed session token, not raw password)
  const authCookie = request.cookies.get("bluejays_auth")?.value;
  const expectedToken = await getSessionToken();
  if (authCookie === expectedToken) return NextResponse.next();

  // Check Authorization header (for API calls)
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    if (authHeader.startsWith("Bearer ") && authHeader.slice(7) === ADMIN_PASSWORD) {
      return NextResponse.next();
    }
  }

  // Not authenticated — redirect to login for pages, 401 for API
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
