import { NextRequest, NextResponse } from "next/server";
import {
  storeRefreshToken,
  verifyState,
  type AdPlatformOAuth,
} from "@/lib/ad-oauth";
import {
  storeCalendarRefreshToken,
  verifyCalendarState,
  type CalendarProvider,
} from "@/lib/calendar";

/**
 * GET /api/oauth/{platform}/callback?code=...&state=...
 *
 * OAuth provider redirects here after owner consents. Verifies the
 * signed state parameter, exchanges the auth code for a refresh
 * token, encrypts + stores it via the pgp_sym RPC.
 *
 * On success: redirect back to the owner's portal Ads tab with a
 * success flash. On failure: redirect with an error flash. Never
 * leak token or code in URL params back to the user.
 */

const AD_PLATFORMS = new Set<AdPlatformOAuth>(["google_ads", "meta_ads", "lob"]);
const CALENDAR_PROVIDERS = new Set<CalendarProvider>([
  "google_calendar",
  "calendly",
  "cal_com",
]);
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bluejayportfolio.com";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;
  const isAd = AD_PLATFORMS.has(platform as AdPlatformOAuth);
  const isCal = CALENDAR_PROVIDERS.has(platform as CalendarProvider);
  if (!isAd && !isCal) {
    return NextResponse.json(
      { ok: false, error: "unknown platform" },
      { status: 400 },
    );
  }
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  // Owner denied consent on the platform side → bounce back with an
  // error flash.
  if (error) {
    return NextResponse.redirect(
      `${SITE_URL}/dashboard?ads_oauth=denied&platform=${platform}`,
    );
  }
  if (!code || !state) {
    return NextResponse.json(
      { ok: false, error: "missing code or state" },
      { status: 400 },
    );
  }

  // Verify signed state — calendar uses a "cal." prefix to namespace
  // its state vs ads OAuth state. Pick the right verifier per family.
  const stateCheck = isCal ? verifyCalendarState(state) : verifyState(state);
  if (!stateCheck.ok) {
    return NextResponse.json(
      { ok: false, error: stateCheck.error },
      { status: 403 },
    );
  }
  const slug = stateCheck.slug;

  try {
    // Exchange code → refresh_token. Per-platform shape.
    let refreshToken = "";
    let externalAccountId = "";
    let externalAccountName: string | undefined;
    let scopes: string[] = [];

    if (platform === "google_ads") {
      const r = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_ADS_CLIENT_ID || "",
          client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || "",
          redirect_uri: `${SITE_URL}/api/oauth/google_ads/callback`,
          grant_type: "authorization_code",
        }),
      });
      const j = (await r.json()) as {
        refresh_token?: string;
        scope?: string;
        access_token?: string;
      };
      if (!j.refresh_token) {
        throw new Error("Google didn't return a refresh_token");
      }
      refreshToken = j.refresh_token;
      scopes = (j.scope || "").split(" ").filter(Boolean);

      // Fetch the customer-id (the Google Ads "external_account_id")
      // from the customer endpoint. Requires the access token.
      try {
        const custRes = await fetch(
          "https://googleads.googleapis.com/v17/customers:listAccessibleCustomers",
          {
            headers: {
              Authorization: `Bearer ${j.access_token}`,
              "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "",
            },
          },
        );
        const cust = (await custRes.json()) as { resourceNames?: string[] };
        const first = cust.resourceNames?.[0];
        if (first) {
          externalAccountId = first.replace("customers/", "");
          externalAccountName = `Google Ads ${externalAccountId}`;
        }
      } catch {
        externalAccountId = "pending";
        externalAccountName = "Google Ads (account fetch failed)";
      }
    } else if (platform === "meta_ads") {
      const r = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.META_ADS_APP_ID}&client_secret=${process.env.META_ADS_APP_SECRET}&redirect_uri=${encodeURIComponent(`${SITE_URL}/api/oauth/meta_ads/callback`)}&code=${code}`,
      );
      const j = (await r.json()) as {
        access_token?: string;
        // Meta returns long-lived access tokens, not refresh tokens.
        // We store the long-lived token in the same field for now;
        // refresh logic re-fetches via the same exchange.
      };
      if (!j.access_token) throw new Error("Meta didn't return an access_token");
      refreshToken = j.access_token;
      scopes = ["ads_read", "ads_management"];

      try {
        const acctRes = await fetch(
          `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name&access_token=${j.access_token}`,
        );
        const acct = (await acctRes.json()) as {
          data?: Array<{ id: string; name: string }>;
        };
        const first = acct.data?.[0];
        if (first) {
          externalAccountId = first.id;
          externalAccountName = first.name;
        }
      } catch {
        externalAccountId = "pending";
        externalAccountName = "Meta Ads (account fetch failed)";
      }
    } else if (platform === "lob") {
      return NextResponse.redirect(
        `${SITE_URL}/dashboard?ads_oauth=lob_no_oauth`,
      );
    } else if (platform === "google_calendar") {
      // Reuses GOOGLE_ADS_CLIENT_ID/SECRET (same Google Cloud project,
      // different scopes — calendar.events + calendar.readonly).
      const r = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_ADS_CLIENT_ID || "",
          client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || "",
          redirect_uri: `${SITE_URL}/api/oauth/google_calendar/callback`,
          grant_type: "authorization_code",
        }),
      });
      const j = (await r.json()) as {
        refresh_token?: string;
        scope?: string;
        access_token?: string;
      };
      if (!j.refresh_token)
        throw new Error("Google Calendar didn't return a refresh_token");
      refreshToken = j.refresh_token;
      scopes = (j.scope || "").split(" ").filter(Boolean);
      // Fetch the user's email + primary calendar id
      try {
        const profileRes = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          { headers: { Authorization: `Bearer ${j.access_token}` } },
        );
        const profile = (await profileRes.json()) as { email?: string };
        externalAccountId = profile.email || "primary";
        externalAccountName = profile.email || "Google Calendar";
      } catch {
        externalAccountId = "primary";
      }
    } else if (platform === "calendly") {
      const r = await fetch("https://auth.calendly.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.CALENDLY_CLIENT_ID || "",
          client_secret: process.env.CALENDLY_CLIENT_SECRET || "",
          redirect_uri: `${SITE_URL}/api/oauth/calendly/callback`,
          grant_type: "authorization_code",
        }),
      });
      const j = (await r.json()) as {
        refresh_token?: string;
        access_token?: string;
        scope?: string;
      };
      if (!j.refresh_token)
        throw new Error("Calendly didn't return a refresh_token");
      refreshToken = j.refresh_token;
      scopes = (j.scope || "default").split(" ").filter(Boolean);
      try {
        const meRes = await fetch("https://api.calendly.com/users/me", {
          headers: { Authorization: `Bearer ${j.access_token}` },
        });
        const me = (await meRes.json()) as {
          resource?: { uri?: string; email?: string };
        };
        externalAccountId = me.resource?.uri || "pending";
        externalAccountName = me.resource?.email || "Calendly";
      } catch {
        externalAccountId = "pending";
      }
    } else if (platform === "cal_com") {
      return NextResponse.redirect(
        `${SITE_URL}/dashboard?cal_oauth=cal_com_no_oauth`,
      );
    }

    if (!refreshToken) {
      throw new Error("no token returned from platform");
    }

    // Calendar callbacks land in the calendar-accounts table; ad
    // callbacks in ad-accounts. Different storage, same encryption.
    const stored = isCal
      ? await storeCalendarRefreshToken({
          clientSlug: slug,
          provider: platform as CalendarProvider,
          refreshToken,
          externalAccountId: externalAccountId || "pending",
          externalAccountEmail: externalAccountName,
          scopes,
        })
      : await storeRefreshToken({
          clientSlug: slug,
          platform: platform as AdPlatformOAuth,
          refreshToken,
          externalAccountId: externalAccountId || "pending",
          externalAccountName,
          scopes,
        });
    if (!stored.ok) {
      throw new Error(stored.error || "store failed");
    }

    // Bounce back to the appropriate UI — different tab for ads vs calendar.
    const successTab = isCal ? "calendar" : "ads";
    const successKey = isCal ? "cal_oauth" : "ads_oauth";
    const tenantPortal = `/clients/${slug}/portal?tab=${successTab}&${successKey}=success&platform=${platform}`;
    return NextResponse.redirect(`${SITE_URL}${tenantPortal}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[oauth/${platform}/callback] failed:`, msg);
    return NextResponse.redirect(
      `${SITE_URL}/dashboard?ads_oauth=error&platform=${platform}&msg=${encodeURIComponent(msg)}`,
    );
  }
}
