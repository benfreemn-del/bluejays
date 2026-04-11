"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { GeneratedSiteData } from "@/lib/generator";
import type { Prospect } from "@/lib/types";
import PreviewContent from "@/components/preview/PreviewContent";

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

  const loadPreview = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [siteResponse, prospectResponse] = await Promise.all([
        fetch(`/api/generated-sites/${id}`, { cache: "no-store" }),
        fetch(`/api/prospects/${id}`, { cache: "no-store" }),
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

  return <PreviewContent id={id} siteData={siteData} selectedTheme={selectedTheme} version={resolvedVersion} />;
}
