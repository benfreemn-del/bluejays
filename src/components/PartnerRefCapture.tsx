"use client";

/**
 * Partner referral cookie capture.
 *
 * Drops `bj_partner_ref` cookie (90 days) when ?ref=<code> is present
 * in the URL. The audit submit endpoint reads it via the request body
 * (the form forwards it explicitly) and stamps it into the prospect's
 * scraped_data so the Stripe webhook can credit the close later.
 *
 * Runs once per page load. No-op if the URL has no ?ref= (so existing
 * cookies aren't refreshed unnecessarily).
 */

import { useEffect } from "react";
import { PARTNER_COOKIE, PARTNER_COOKIE_DAYS } from "@/lib/partners";

export default function PartnerRefCapture() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = (params.get("ref") || "").toLowerCase().trim();
      if (!ref) return;
      // Strict shape — alphanumeric + dash, 2-40 chars. Anything else
      // is junk and shouldn't be persisted.
      if (!/^[a-z0-9-]{2,40}$/.test(ref)) return;
      const maxAge = PARTNER_COOKIE_DAYS * 86400;
      // SameSite=Lax so attribution survives the typical
      // social-link → audit submit flow on the same domain.
      document.cookie = `${PARTNER_COOKIE}=${encodeURIComponent(ref)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
    } catch {
      // ignore
    }
  }, []);

  return null;
}

/**
 * Read the partner ref cookie. Used by the AuditForm to forward the
 * value in the POST body (cookies aren't sent to the API route by
 * default in some Next.js fetch setups, so an explicit body field is
 * the simplest reliable path).
 */
export function readPartnerRefCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${PARTNER_COOKIE}=([^;]+)`));
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return null;
  }
}
