"use client";

import { useEffect } from "react";

/**
 * <MeyerTrackBeacon /> — first-party page-view beacon for the Meyer
 * Electric showcase. Fires ONE POST per page load to
 * /api/clients/meyer-electric/track via navigator.sendBeacon (falls
 * back to fetch keepalive). text/plain body per the Zenith beacon
 * contract (a JSON Blob would trigger a CORS preflight sendBeacon
 * can't perform).
 *
 * Mounted in the meyer-electric layout so it covers every hostname the
 * showcase serves on (sequimelectrician.com / sequimelectric.com /
 * bluejayportfolio.com/clients/meyer-electric). Owner-facing surfaces
 * are excluded — Kyle checking his own stats shouldn't inflate them.
 */

const TRACK_URL = "/api/clients/meyer-electric/track";
const EXCLUDED = ["/stats", "/portal-demo"];

export default function MeyerTrackBeacon() {
  useEffect(() => {
    try {
      const { hostname, pathname } = window.location;
      if (EXCLUDED.some((seg) => pathname.includes(seg))) return;
      // Dev/preview visits must never land in production counts.
      if (/^(localhost|127\.|192\.168\.|10\.)/.test(hostname)) return;

      const body = JSON.stringify({
        host: hostname,
        path: pathname,
        referrer: document.referrer || "",
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(TRACK_URL, body);
      } else {
        void fetch(TRACK_URL, {
          method: "POST",
          body,
          keepalive: true,
          headers: { "Content-Type": "text/plain" },
        });
      }
    } catch {
      // Tracking must never break the page.
    }
  }, []);

  return null;
}
