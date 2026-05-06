"use client";

/**
 * CTAExperiment — drop-in A/B test wrapper for a single CTA on a
 * showcase page. Picks one of N variants per visitor (sticky for the
 * session via sessionStorage), POSTs an "impression" event on mount
 * and a "click" event on click.
 *
 * Usage:
 *   <CTAExperiment
 *     clientSlug="zenith-sports"
 *     experimentId="hero-cta"
 *     variants={[
 *       { id: "build-player", label: "Build your player", href: "/clients/zenith-sports/build-your-player" },
 *       { id: "talk-philip",  label: "Talk to Philip",    href: "#contact" },
 *     ]}
 *     className="bg-lime-400 px-6 py-3 rounded font-bold"
 *   />
 *
 * Read results at /api/client-cta-events?client=<slug>&experiment=<id>
 */

import { useEffect, useMemo, useRef } from "react";

type Variant = { id: string; label: string; href: string };

function getOrMintSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  const KEY = "bj_cta_session";
  let s = sessionStorage.getItem(KEY);
  if (!s) {
    s = crypto.randomUUID();
    sessionStorage.setItem(KEY, s);
  }
  return s;
}

function pickVariant<V extends { id: string }>(
  experimentId: string,
  sessionId: string,
  variants: V[],
): V {
  // Stable hash: sessionId + experimentId → mod variants.length so
  // the same visitor always lands on the same variant within an
  // experiment, but sees a different variant on a different one.
  const seed = `${sessionId}:${experimentId}`;
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h) ^ seed.charCodeAt(i);
  }
  return variants[Math.abs(h) % variants.length]!;
}

export function CTAExperiment({
  clientSlug,
  experimentId,
  variants,
  className,
  beforeNavigate,
}: {
  clientSlug: string;
  experimentId: string;
  variants: Variant[];
  className?: string;
  /** Called right before navigation. Useful for analytics / tracking
   *  shared with non-A/B CTAs. */
  beforeNavigate?: (variantId: string) => void;
}) {
  // Stable session id + variant pick. useMemo so re-renders don't
  // shuffle the variant mid-page.
  const sessionId = useMemo(getOrMintSessionId, []);
  const chosen = useMemo(
    () => pickVariant(experimentId, sessionId, variants),
    [experimentId, sessionId, variants],
  );
  const fired = useRef(false);

  // Fire-and-forget impression on mount. Guarded against StrictMode
  // double-mount in dev so we don't double-count.
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void fetch("/api/client-cta-events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_slug: clientSlug,
        experiment_id: experimentId,
        variant_id: chosen.id,
        event: "impression",
        session_id: sessionId,
        url: typeof window !== "undefined" ? window.location.href : null,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [clientSlug, experimentId, chosen.id, sessionId]);

  const onClick = () => {
    void fetch("/api/client-cta-events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_slug: clientSlug,
        experiment_id: experimentId,
        variant_id: chosen.id,
        event: "click",
        session_id: sessionId,
        url: typeof window !== "undefined" ? window.location.href : null,
      }),
      keepalive: true,
    }).catch(() => {});
    beforeNavigate?.(chosen.id);
  };

  return (
    <a href={chosen.href} className={className} onClick={onClick} data-cta-variant={chosen.id}>
      {chosen.label}
    </a>
  );
}

export default CTAExperiment;
