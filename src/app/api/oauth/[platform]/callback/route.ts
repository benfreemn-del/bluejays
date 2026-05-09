import { NextRequest, NextResponse } from "next/server";
import {
  storeRefreshToken,
  verifyState,
  type AdPlatformOAuth,
} from "@/lib/ad-oauth";

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

const VALID_PLATFORMS = new Set<AdPlatformOAuth>(["google_ads", "meta_ads", "lob"]);
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bluejayportfolio.com";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;
  if (!VALID_PLATFORMS.has(platform as AdPlatformOAuth)) {
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

  // Verify the signed state — prevents CSRF + carries the slug
  const stateCheck = verifyState(state);
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
    }

    if (!refreshToken) {
      throw new Error("no token returned from platform");
    }

    const stored = await storeRefreshToken({
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

    // Bounce back to the appropriate UI
    const tenantPortal = `/clients/${slug}/portal?tab=ads&ads_oauth=success&platform=${platform}`;
    return NextResponse.redirect(`${SITE_URL}${tenantPortal}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[oauth/${platform}/callback] failed:`, msg);
    return NextResponse.redirect(
      `${SITE_URL}/dashboard?ads_oauth=error&platform=${platform}&msg=${encodeURIComponent(msg)}`,
    );
  }
}
