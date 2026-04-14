"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { GeneratedSiteData } from "@/lib/generator";
import type { Prospect } from "@/lib/types";
import PreviewContent from "@/components/preview/PreviewContent";

/* ── Device Toggle Bar (visible to prospects) ── */
function DeviceToggleBar({ id, device, onToggle }: { id: string; device: "desktop" | "mobile"; onToggle: (d: "desktop" | "mobile") => void }) {
  const [copied, setCopied] = useState<string | null>(null);
  const baseUrl = typeof window !== "undefined" ? `${window.location.origin}/preview/${id}` : `/preview/${id}`;

  const copyLink = (d: string) => {
    const url = `${baseUrl}?device=${d}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(d);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-3 py-2 rounded-full border border-white/15 bg-black/80 backdrop-blur-xl shadow-2xl">
      {/* Desktop button */}
      <button
        onClick={() => onToggle("desktop")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${device === "desktop" ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
        Desktop
      </button>

      {/* Mobile button */}
      <button
        onClick={() => onToggle("mobile")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${device === "mobile" ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18" /></svg>
        Mobile
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-white/15" />

      {/* Copy link buttons */}
      <button
        onClick={() => copyLink("desktop")}
        className="flex items-center gap-1 px-2 py-1.5 rounded-full text-[10px] font-medium text-white/40 hover:text-white/70 transition-colors"
        title="Copy desktop link"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
        {copied === "desktop" ? "Copied!" : "Desktop link"}
      </button>
      <button
        onClick={() => copyLink("mobile")}
        className="flex items-center gap-1 px-2 py-1.5 rounded-full text-[10px] font-medium text-white/40 hover:text-white/70 transition-colors"
        title="Copy mobile link"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
        {copied === "mobile" ? "Copied!" : "Mobile link"}
      </button>
    </div>
  );
}

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
  const [device, setDevice] = useState<"desktop" | "mobile">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("device") === "mobile" ? "mobile" : "desktop";
    }
    return "desktop";
  });

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

  return (
    <>
      {device === "mobile" ? (
        <div className="min-h-screen bg-[#111] flex items-start justify-center pt-4 pb-24">
          <div className="relative border border-white/10 bg-black overflow-hidden shadow-2xl" style={{ width: 390, maxHeight: "90vh" }}>
            <div className="overflow-y-auto" style={{ height: "90vh" }}>
              <div style={{ width: 390 }}>
                <PreviewContent id={id} siteData={siteData} selectedTheme={selectedTheme} version={resolvedVersion} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="pb-20">
          <PreviewContent id={id} siteData={siteData} selectedTheme={selectedTheme} version={resolvedVersion} />
        </div>
      )}
      <DeviceToggleBar id={id} device={device} onToggle={setDevice} />
    </>
  );
}
