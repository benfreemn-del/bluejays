"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ProspectNotesDrawer, { ProspectNotesButton } from "@/components/dashboard/ProspectNotesDrawer";
import type { Prospect } from "@/lib/types";

interface NoteDraft {
  adminNotes: string;
  selectedTheme?: "light" | "dark";
  persistedAdminNotes: string;
  persistedSelectedTheme?: "light" | "dark";
  saveState: "idle" | "saving" | "saved" | "error";
}

function getInitialDraft(prospect: Prospect): NoteDraft {
  return {
    adminNotes: prospect.adminNotes || "",
    selectedTheme: prospect.selectedTheme,
    persistedAdminNotes: prospect.adminNotes || "",
    persistedSelectedTheme: prospect.selectedTheme,
    saveState: "idle",
  };
}

function getThemeFromSearchParam(theme: string | null): "light" | "dark" | undefined {
  return theme === "light" || theme === "dark" ? theme : undefined;
}

function buildPreviewUrl(id: string, version: "v1" | "v2", theme: "light" | "dark") {
  const params = new URLSearchParams({ theme });
  if (version === "v1") {
    params.set("version", "v1");
  }
  return `/preview/${id}?${params.toString()}`;
}

export default function PreviewDevicePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const searchTheme = getThemeFromSearchParam(searchParams.get("theme"));

  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [version, setVersion] = useState<"v2" | "v1">("v2");
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState<NoteDraft | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProspect() {
      try {
        const response = await fetch(`/api/prospects/${id}`, { cache: "no-store" });
        const data = await response.json();
        if (cancelled || data.error) return;

        const nextProspect = data as Prospect;
        setProspect(nextProspect);
        setNoteDraft((current) => current || getInitialDraft(nextProspect));
      } catch {
        // noop
      }
    }

    void loadProspect();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const mergedProspect = useMemo(() => {
    if (!prospect) return null;
    if (!noteDraft) return prospect;

    return {
      ...prospect,
      adminNotes: noteDraft.adminNotes,
      selectedTheme: noteDraft.selectedTheme,
    } satisfies Prospect;
  }, [prospect, noteDraft]);

  const effectiveTheme =
    noteDraft?.selectedTheme ||
    searchTheme ||
    prospect?.selectedTheme ||
    prospect?.aiThemeRecommendation ||
    "dark";

  const previewUrl = buildPreviewUrl(id, version, effectiveTheme);

  const persistDraft = useCallback(async (draftOverride?: NoteDraft) => {
    const currentDraft = draftOverride || noteDraft;
    if (!prospect || !currentDraft) return;

    if (
      currentDraft.adminNotes === currentDraft.persistedAdminNotes &&
      (currentDraft.selectedTheme || "") === (currentDraft.persistedSelectedTheme || "")
    ) {
      return;
    }

    setNoteDraft((prev) => (prev ? { ...prev, saveState: "saving" } : prev));

    try {
      const response = await fetch(`/api/prospects/${prospect.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminNotes: currentDraft.adminNotes,
          adminNotesUpdatedAt: new Date().toISOString(),
          selectedTheme: currentDraft.selectedTheme,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error("Failed to save notes");
      }

      const updatedProspect = data as Prospect;
      setProspect(updatedProspect);
      setNoteDraft((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          adminNotes: updatedProspect.adminNotes || prev.adminNotes,
          selectedTheme: updatedProspect.selectedTheme,
          persistedAdminNotes: updatedProspect.adminNotes || "",
          persistedSelectedTheme: updatedProspect.selectedTheme,
          saveState: "saved",
        };
      });

      window.setTimeout(() => {
        setNoteDraft((prev) => {
          if (!prev || prev.saveState !== "saved") return prev;
          return { ...prev, saveState: "idle" };
        });
      }, 1200);
    } catch {
      setNoteDraft((prev) => (prev ? { ...prev, saveState: "error" } : prev));
    }
  }, [noteDraft, prospect]);

  useEffect(() => {
    if (!notesOpen || !noteDraft) return;

    if (
      noteDraft.adminNotes === noteDraft.persistedAdminNotes &&
      (noteDraft.selectedTheme || "") === (noteDraft.persistedSelectedTheme || "")
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void persistDraft(noteDraft);
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [notesOpen, noteDraft, persistDraft]);

  const closeNotesDrawer = async () => {
    await persistDraft();
    setNotesOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#050a14] flex flex-col">
      <div className="border-b border-white/[0.06] bg-[#0a1628] px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <a href="/dashboard" className="text-sm text-white/40 hover:text-white">&larr; Dashboard</a>
          <span className="text-white/20">|</span>
          <h1 className="text-sm font-bold text-white truncate">{prospect?.businessName || "Preview"}</h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => setNotesOpen(true)}
            className={`h-9 px-3 rounded-lg border text-sm font-medium flex items-center gap-2 transition-all ${
              notesOpen
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-white/[0.04] text-white/50 border-white/[0.08] hover:text-white/70"
            }`}
            title="Open notes and theme settings"
          >
            <ProspectNotesButton hasPending={!!mergedProspect && !!noteDraft && (
              noteDraft.adminNotes !== noteDraft.persistedAdminNotes ||
              (noteDraft.selectedTheme || "") !== (noteDraft.persistedSelectedTheme || "")
            )} />
            Notes
          </button>
          <span className="w-px h-6 bg-white/10 mx-1" />
          <button
            onClick={() => setVersion("v2")}
            className={`h-9 px-3 rounded-lg text-sm font-medium transition-all ${
              version === "v2"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-white/[0.04] text-white/40 border border-white/[0.08] hover:text-white/60"
            }`}
          >
            V2
          </button>
          <button
            onClick={() => setVersion("v1")}
            className={`h-9 px-3 rounded-lg text-sm font-medium transition-all ${
              version === "v1"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                : "bg-white/[0.04] text-white/40 border border-white/[0.08] hover:text-white/60"
            }`}
          >
            V1
          </button>
          <span className="w-px h-6 bg-white/10 mx-1" />
          <button
            onClick={() => setDevice("desktop")}
            className={`h-9 px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
              device === "desktop"
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                : "bg-white/[0.04] text-white/40 border border-white/[0.08] hover:text-white/60"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
              <path d="M9 17H15M12 17V21M3 13H21M5 17H19C20.1046 17 21 16.1046 21 15V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V15C3 16.1046 3.89543 17 5 17Z" />
            </svg>
            Desktop
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`h-9 px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
              device === "mobile"
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                : "bg-white/[0.04] text-white/40 border border-white/[0.08] hover:text-white/60"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
              <path d="M12 18H12.01M8 21H16C17.1046 21 18 20.1046 18 19V5C18 3.89543 17.1046 3 16 3H8C6.89543 3 6 3.89543 6 5V19C6 20.1046 6.89543 21 8 21Z" />
            </svg>
            Mobile
          </button>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-4 rounded-lg bg-white/[0.04] text-white/40 border border-white/[0.08] text-sm font-medium flex items-center gap-2 hover:text-white/60 transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
            Full Tab
          </a>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center p-6 bg-[#0a0a0a]">
        <div
          className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-500 relative"
          style={{
            width: device === "desktop" ? "100%" : "375px",
            maxWidth: device === "desktop" ? "1280px" : "375px",
            height: device === "desktop" ? "calc(100vh - 80px)" : "812px",
          }}
        >
          {device === "mobile" && (
            <div className="h-6 bg-black flex items-center justify-center">
              <div className="w-20 h-1.5 rounded-full bg-white/20" />
            </div>
          )}
          <iframe
            key={previewUrl}
            src={previewUrl}
            className="w-full border-0"
            style={{ height: device === "mobile" ? "786px" : "100%" }}
            title={`${prospect?.businessName || "Preview"} preview - ${device}`}
          />
          {device === "mobile" && (
            <div className="h-5 bg-black flex items-center justify-center">
              <div className="w-32 h-1 rounded-full bg-white/20" />
            </div>
          )}
        </div>
      </div>

      <ProspectNotesDrawer
        prospect={mergedProspect || undefined}
        draft={noteDraft || undefined}
        isOpen={notesOpen}
        onClose={() => void closeNotesDrawer()}
        onNotesChange={(value) => {
          if (!mergedProspect) return;
          setNoteDraft((prev) => ({
            ...(prev || getInitialDraft(mergedProspect)),
            adminNotes: value,
            saveState: "idle",
          }));
        }}
        onThemeChange={(theme) => {
          if (!mergedProspect) return;
          const nextDraft: NoteDraft = {
            ...(noteDraft || getInitialDraft(mergedProspect)),
            selectedTheme: theme,
            saveState: "idle",
          };
          setNoteDraft(nextDraft);
          void persistDraft(nextDraft);
        }}
        previewHref={previewUrl}
      />
    </div>
  );
}
