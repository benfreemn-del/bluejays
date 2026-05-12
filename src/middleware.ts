import { NextRequest, NextResponse } from "next/server";

/**
 * Two passwords supported per Q4=A locked 2026-05-08:
 *   - ADMIN_PASSWORD (or ADMIN_PASSWORD_BEN) → owner role
 *   - ADMIN_PASSWORD_MADIE → sales role
 * Both passwords produce valid session tokens; the middleware
 * accepts EITHER token in the bluejays_auth cookie. The bj_role
 * cookie set by /api/auth/login carries the role tag.
 *
 * If ADMIN_PASSWORD_MADIE is unset the second token isn't
 * computed — behavior is identical to the pre-Q4 flow.
 */
const OWNER_PASSWORD = (
  process.env.ADMIN_PASSWORD_BEN ||
  process.env.ADMIN_PASSWORD ||
  ""
).trim();
const SALES_PASSWORD = (process.env.ADMIN_PASSWORD_MADIE || "").trim();

// Pre-compute session tokens using Web Crypto (Edge-compatible)
// This replaces Node.js crypto.createHash which doesn't work in Edge Runtime
let TOKEN_CACHE: { owner: string; sales: string } | null = null;
async function getValidTokens(): Promise<{ owner: string; sales: string }> {
  if (TOKEN_CACHE) return TOKEN_CACHE;
  const encoder = new TextEncoder();

  async function hash(secret: string): Promise<string> {
    if (!secret) return "";
    const data = encoder.encode(secret + "bluejays-session-salt");
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  TOKEN_CACHE = {
    owner: await hash(OWNER_PASSWORD),
    sales: await hash(SALES_PASSWORD),
  };
  return TOKEN_CACHE;
}

async function getSessionToken(): Promise<string> {
  // Backwards-compat shim — used in places that still expect the
  // single-token API. Returns the owner token (Ben's). Multi-token
  // checks should use isValidSessionToken() below.
  const t = await getValidTokens();
  return t.owner;
}

async function isValidSessionToken(token: string): Promise<boolean> {
  if (!token) return false;
  const t = await getValidTokens();
  return token === t.owner || (t.sales !== "" && token === t.sales);
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
  "/api/cold-traffic",
  "/api/madie",
  "/api/pipeline/velocity",
  "/api/ai-activity",
  "/api/referral",
  "/api/onboarding",
  "/api/vsl/generate",
  "/api/voicemail",
  "/api/videos",
  "/api/admin",
  // Owner/sales-only dashboard APIs — team mgmt, onboarding monitoring,
  // hormozi diagnostic, prospect assign, blog generation.
  "/api/dashboard",
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
  "/api/leads/sms-opt-in/",            // Public SMS opt-in upsell from /opt-in-sms/[id] (Rule 35 update — TCPA-compliant)
  "/opt-in-sms/",                      // Public post-submit SMS opt-in page
  "/api/portfolio",
  "/api/social-proof",
  "/api/track/",
  "/api/image-proxy",
  "/api/voicemail/status", // Twilio status callback
  "/api/voicemail/twiml",  // Twilio TwiML endpoint
  "/api/onboarding-reminders/process", // Vercel cron — gated by CRON_SECRET in the handler
  "/api/funnel/run",                   // Vercel cron (daily 08:00 UTC) — gated by CRON_SECRET
  "/api/funnel/feedback",              // Owner-portal funnel-edit feedback (SMS+email Ben — read-only, no auth required, mock-safe)
  "/api/client-funnels/run",           // Vercel cron (hourly) — gated by CRON_SECRET. Per-client AI-package funnel runner.
  "/api/client-funnels/missed-call",   // Twilio voice webhook — per-client missed-call → text-back.
  "/api/client-reports",               // Vercel cron (weekly Mon 14:00 UTC) — gated by CRON_SECRET. Per-client weekly digest.
  "/api/client-hyperloop/run",         // Vercel cron (daily 14:00 UTC) — gated by CRON_SECRET. Per-client variant analysis (only fires for clients on Pro+ Hyperloop tier).
  "/api/replies/process",              // Vercel cron (per minute) — gated by CRON_SECRET
  "/api/postcards/html/",              // Lob's renderer fetches these; public (just pre-rendered preview HTML)
  "/api/inquire/",                     // Public form submission from /inquire/[code]
  "/api/o/",                           // Self-hosted email open-tracking pixel (1×1 GIF) — public so recipients can load it
  "/api/nps/",                         // NPS feedback POSTs from the public /nps/thanks page (Wave-5b retention)
  "/r/",                               // Public NPS click handler — /r/[code]/[score] (Wave-5b retention)
  "/nps/",                             // Public NPS thanks page — /nps/thanks/[code] (Wave-5b retention)
  "/api/review-blast/submit/",         // Public submission from /review-blast/[id] magic link (URL-as-secret)
  "/api/review-blast/dispatch",        // Vercel cron (daily 17:30 UTC) — gated by CRON_SECRET
  "/review-blast/",                    // Public submission page — /review-blast/[upsellId] (URL-as-secret)
  "/api/checkout/free-tier/",          // Free-tier checkout entry point — Ben sends this URL to vetted free-tier prospects (URL-as-secret)
  "/api/audit/submit",                 // Public audit-form submission (Hormozi salty-pretzel lead-magnet)
  "/api/audit/",                       // Audit status polling endpoints (URL-as-secret)
  "/api/schedule/audit-call",          // Public "book a call with Ben" form from /schedule (audit lead CTA)
  "/api/domain-suggestions/",          // Public auto-domain-suggest for the onboarding Step 1 (URL-as-secret pattern — prospect UUID in path)
  "/api/hyperloop/",                   // Vercel cron (weekly) — gated by CRON_SECRET in the handler. Karpathy auto-research loop, dormant until 100 audits + 5 sales
  "/api/watchdog/",                    // Vercel cron (daily 13:00 UTC) — gated by CRON_SECRET. Rule 66 heartbeat checker for all monitored crons + stuck-audit detector
  "/audit",                            // Audit landing page (public)
  "/audit/",                           // Audit display + processing pages (URL-as-secret)
  "/api/clients/kr-ranches/menu/public", // Public menu fetch for KR static site (no auth, 60s cache)
  "/api/clients/kr-ranches/waitlist",    // Public waitlist email capture from the freezer section
  "/api/clients/olympic-inspections/slots/public", // Public booking-slot list (OIT)
  "/api/clients/olympic-inspections/bookings",     // POST is public — customer creates booking; GET/PATCH check owner cookie internally
  "/api/clients/zenith-sports/camp-signup",        // Public camp-signup form (parent reserves a TEKKY camp spot)
  "/api/oauth/google_ads/callback",                // OAuth callback (Google Ads) — third-party redirects here, no cookie
  "/api/oauth/meta_ads/callback",                  // OAuth callback (Meta Ads) — third-party redirects here, no cookie
  "/api/oauth/lob/callback",                       // OAuth callback (Lob) — reserved (Lob uses API key, not OAuth)
  "/api/oauth/google_calendar/callback",           // OAuth callback (Google Calendar) — calendar-availability skill
  "/api/oauth/calendly/callback",                  // OAuth callback (Calendly) — calendar-availability skill
  "/api/oauth/cal_com/callback",                   // OAuth callback (Cal.com) — reserved (Cal.com uses API key, not OAuth)
  "/api/cut-my-agency/submit",                     // Public Hormozi calculator funnel submit (Action 2 of 2026-05-05 $10k validation play)
  "/api/sell-direct/submit",                       // Public Hormozi calculator funnel submit — manufacturer DTC angle (Action 3 of 2026-05-05 $10k validation play)
];

/**
 * Per-client custom-domain map. When a request comes in on one of these
 * hostnames, rewrite the URL so `/` serves that client's showcase page
 * instead of the BlueJays portfolio homepage. Add a row here every time
 * a client points their custom domain at the bluejays Vercel project.
 *
 * Strip www in the lookup (we accept both apex and www and treat them
 * the same — Vercel handles www→apex redirect at the edge).
 *
 * Path can point at either:
 *   - A static showcase folder under /clients/{slug}  (Zenith pattern)
 *   - A generated /preview/{prospect-id}              (Hector pattern,
 *     where the site is rendered from prospects DB row + theme)
 */
const CLIENT_DOMAIN_MAP: Record<string, string> = {
  // Hector Landscaping & Design — bespoke custom showcase at
  // /clients/hector-landscaping (cloned from Mt View landscaping
  // template + customized with Hector's photos, copy, and contact
  // info). Was previously pointed at /preview/{prospect-id}; now
  // upgraded to the bespoke build.
  "hectorlandscaping.com": "/clients/hector-landscaping",
  // "tekky.org": "/clients/zenith-sports",  // (when Philip activates)
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Custom-domain rewrite ──
  // hectorlandscaping.com/anything → /clients/hector-landscaping/anything
  // Strip Vercel's _next + api paths to avoid breaking framework + APIs.
  const host = (request.headers.get("host") || "").toLowerCase().split(":")[0];
  const apexHost = host.replace(/^www\./, "");
  const showcasePath = CLIENT_DOMAIN_MAP[apexHost];
  if (
    showcasePath &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith(showcasePath)
  ) {
    const rewriteUrl = new URL(
      showcasePath + (pathname === "/" ? "" : pathname),
      request.url,
    );
    rewriteUrl.search = request.nextUrl.search;
    return NextResponse.rewrite(rewriteUrl);
  }

  // Always allow public API paths (webhooks, inbound handlers)
  if (PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  // ─── /audit cold-traffic A/B variant assignment ───
  // Per the May 2026 cold-paid-traffic validation experiment locked
  // 2026-05-08: visitors to /audit get assigned to one of 3 hero
  // variants (A=control · B=Hormozi-diagnostic · C=5-clog) with
  // sticky cookie. The variant rides server-side via request.cookies
  // so the page renders the right hook on the FIRST paint (no flash).
  // URL override `/audit?v=A|B|C` always wins for manual testing.
  if (pathname === "/audit" || pathname.startsWith("/audit?")) {
    const urlOverride = request.nextUrl.searchParams.get("v");
    const cookieVariant = request.cookies.get("bj_audit_variant")?.value;
    let variant = (urlOverride || cookieVariant || "").toUpperCase();
    if (variant !== "A" && variant !== "B" && variant !== "C") {
      // Random assignment — 33/33/33. Math.random in middleware is
      // fine for an experiment of this scale; not a security boundary.
      const roll = Math.floor(Math.random() * 3);
      variant = ["A", "B", "C"][roll];
    }
    // Inject into request so page reads it on this render
    request.cookies.set("bj_audit_variant", variant);
    const response = NextResponse.next({ request });
    // Persist for the browser
    response.cookies.set("bj_audit_variant", variant, {
      httpOnly: false, // page reads via cookies(), AuditForm reads via document.cookie
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return response;
  }

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Check auth cookie (signed session token, not raw password)
  // Per Q4=A: cookie may match either OWNER_PASSWORD's token or
  // SALES_PASSWORD's token (Madie). isValidSessionToken returns
  // true for either. Role-based UI gating happens via the bj_role
  // cookie set at login (read in client components).
  const authCookie = request.cookies.get("bluejays_auth")?.value;
  if (authCookie && (await isValidSessionToken(authCookie))) {
    return NextResponse.next();
  }

  // Check Authorization header (for API calls)
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    if (
      authHeader.startsWith("Bearer ") &&
      (authHeader.slice(7) === OWNER_PASSWORD ||
        (SALES_PASSWORD && authHeader.slice(7) === SALES_PASSWORD))
    ) {
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
