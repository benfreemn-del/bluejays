"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { GeneratedSiteData } from "@/lib/generator";
import type { Prospect } from "@/lib/types";
import PreviewContent from "@/components/preview/PreviewContent";
import PreviewVideoButton from "@/components/preview/PreviewVideoButton";
import TextMeBackWidget from "@/components/preview/TextMeBackWidget";

interface PreviewClientPageProps {
  id: string;
  version?: "v1" | "v2";
  initialTheme?: "light" | "dark";
}

function resolveTheme(
  initialTheme: "light" | "dark" | undefined,
  prospect: Prospect | null
): "light" | "dark" {
  return initialTheme || prospect?.selectedTheme || prospect?.aiThemeRecommendation || "dark";
}

export default function PreviewClientPage({
  id,
  version = "v2",
  initialTheme,
}: PreviewClientPageProps) {
  const [siteData, setSiteData] = useState<GeneratedSiteData | null>(null);
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Per-device rendering. No manual toggle — the page just uses the device
  // it's opened on. `?device=mobile` query param still forces a side, for
  // internal previews (e.g. dashboard, screenshot service). Otherwise default
  // to desktop view on wide screens and render the page's own responsive CSS
  // at the actual viewport on narrow screens.
  const [device] = useState<"desktop" | "mobile">(() => {
    if (typeof window === "undefined") return "desktop";
    const params = new URLSearchParams(window.location.search);
    const forced = params.get("device");
    if (forced === "mobile" || forced === "desktop") return forced;
    return window.matchMedia("(max-width: 768px)").matches ? "mobile" : "desktop";
  });

  // Embedded mode (used by screenshot service + internal tools).
  const isEmbedded = typeof window !== "undefined"
    && new URLSearchParams(window.location.search).get("embed") === "1";

  const loadPreview = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [siteResponse, prospectResponse] = await Promise.all([
        fetch(`/api/generated-sites/${id}`, { cache: "no-store" }),
        // Use the PUBLIC claim endpoint so the preview page works for
        // unauthenticated visitors (real prospects arriving from outreach).
        fetch(`/api/claim/${id}`, { cache: "no-store" }),
      ]);

      const sitePayload = await siteResponse.json().catch(() => null);
      const prospectPayload = await prospectResponse.json().catch(() => null);

      if (siteResponse.ok && sitePayload && !sitePayload.error) {
        setSiteData(sitePayload as GeneratedSiteData);
      } else {
        const nextError =
          sitePayload?.error ||
          (siteResponse.status === 404
            ? "Preview data has not been generated for this prospect yet."
            : "Preview data could not be loaded right now.");

        throw new Error(nextError);
      }

      if (prospectResponse.ok && prospectPayload && !prospectPayload.error) {
        setProspect(prospectPayload as Prospect);
      } else {
        setProspect(null);
      }
    } catch (error) {
      console.error("[preview] Failed to load preview data", { id, error });
      setSiteData(null);
      setErrorMessage(error instanceof Error ? error.message : "Preview data could not be loaded right now.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  const selectedTheme = useMemo(() => resolveTheme(initialTheme, prospect), [initialTheme, prospect]);
  const resolvedVersion = useMemo(() => {
    // URL param takes priority, then prospect's saved version, then default v2
    if (version !== "v2") return version; // explicit URL param
    return prospect?.selectedVersion || version;
  }, [version, prospect]);

  if (isLoading && !siteData) {
    return (
      <div className="min-h-screen bg-[#050a14] text-white flex items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-white/40">BlueJays Preview</p>
          <h1 className="text-3xl font-semibold">Loading your website preview…</h1>
          <p className="text-base text-white/60">
            We are pulling the generated site and theme settings for this prospect now.
          </p>
        </div>
      </div>
    );
  }

  if (!siteData) {
    return (
      <div className="min-h-screen bg-[#050a14] text-white flex items-center justify-center px-6">
        <div className="max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">Preview unavailable</p>
          <h1 className="text-3xl font-semibold">We could not load this preview right now.</h1>
          <p className="text-base text-white/70">
            {errorMessage || "The generated site data could not be retrieved. Please retry in a moment."}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => void loadPreview()}
              className="rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors"
            >
              Retry preview
            </button>
            <a
              href={`/preview-device/${id}`}
              className="rounded-lg bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/70 border border-white/10 hover:text-white transition-colors"
            >
              Open preview workspace
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Embedded inside the claim page Before/After iframe — render the preview
  // directly at iframe width (no phone-frame wrapper, no top banner, no
  // floating toggles). The parent iframe controls sizing.
  //
  // Same bare-render path when a prospect opts out of the claim UI via
  // `site_data.suppressClaimUi = true`. Used for gifted / custom-built /
  // non-sales-funnel previews where the floating "Claim this site →" CTA
  // and "will be customized with your real business photos" banner don't
  // make sense (e.g. a church preview gifted to the client).
  const suppressClaimUi = Boolean((siteData as { suppressClaimUi?: boolean }).suppressClaimUi);
  if (isEmbedded || suppressClaimUi) {
    return (
      <div>
        <PreviewContent id={id} siteData={siteData} selectedTheme={selectedTheme} version={resolvedVersion} />
      </div>
    );
  }

  return (
    <>
      {/* Preview disclaimer banner */}
      <div className="bg-[#0a1520] border-b border-white/10 px-4 py-2 text-center text-xs text-white/50">
        Preview — images and content will be customized with your real business photos after purchase
      </div>

      {/* Render the preview directly at the viewport width the visitor
          actually has. On a phone → their phone width; on desktop → full
          width. The site's own responsive CSS handles the rest. No phone-
          frame simulator, no toggle — keeps the experience simple. */}
      <div className="pb-20" style={device === "mobile" ? { maxWidth: "100%" } : undefined}>
        <PreviewContent id={id} siteData={siteData} selectedTheme={selectedTheme} version={resolvedVersion} />
      </div>

      {/* Floating "Claim this site" CTA so prospects can move from the
          preview to payment in one tap. Anchored bottom-right, non-intrusive.
          Preserve any UTM params from the inbound URL onto the claim link
          so the source/medium/campaign that drove this visit threads through
          to the Stripe checkout metadata (and the `paid` webhook event). */}
      <a
        href={(() => {
          if (typeof window === "undefined") return `/claim/${id}`;
          const sp = new URLSearchParams(window.location.search);
          const out = new URLSearchParams();
          for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
            const v = sp.get(k);
            if (v) out.set(k, v);
          }
          const qs = out.toString();
          return qs ? `/claim/${id}?${qs}` : `/claim/${id}`;
        })()}
        className="fixed bottom-6 right-6 z-[9998] inline-flex items-center gap-2 rounded-full bg-sky-500 hover:bg-sky-400 px-5 py-3 text-sm font-semibold text-white shadow-2xl transition-colors"
      >
        Claim — $997 · money-back guarantee →
      </a>

      <PreviewVideoButton prospectId={id} />

      {/* "See how your current site stacks up" → /compare/[id]. Renders
          beneath the floating Claim CTA on the bottom-right but with a
          subdued style so it doesn't compete visually. Mobile users see
          it stacked under the floating CTA via fixed-position offset. */}
      {prospect?.currentWebsite && (
        <a
          href={`/compare/${id}`}
          className="fixed bottom-20 right-6 z-[9997] inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 px-4 py-2 text-xs font-semibold text-white border border-white/20 shadow-xl transition-colors"
        >
          See how your current site stacks up →
        </a>
      )}

      {/* Text-me-back widget — TCPA-compliant SMS opt-in for preview
          visitors. Anchored bottom-LEFT so it doesn't compete with the
          Claim CTA (bottom-right). Auto-hides in ?embed=1 mode. */}
      <TextMeBackWidget prospectId={id} />
    </>
  );
}
