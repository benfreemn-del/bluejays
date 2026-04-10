"use client";

import { hasPendingAdminUpdates } from "@/lib/admin-notes";
import type { Prospect } from "@/lib/types";

export interface ProspectNotesDraftView {
  adminNotes: string;
  selectedTheme?: "light" | "dark";
  saveState: "idle" | "saving" | "saved" | "error";
}

interface ProspectNotesButtonProps {
  hasPending: boolean;
}

interface ProspectNotesDrawerProps {
  prospect?: Prospect;
  draft?: ProspectNotesDraftView;
  isOpen: boolean;
  onClose: () => void;
  onNotesChange: (value: string) => void;
  onThemeChange: (theme: "light" | "dark") => void;
  onSendToClaude?: () => void | Promise<void>;
  sendToClaudeState?: "idle" | "sending" | "success" | "error";
  sendToClaudeMessage?: string;
  previewHref?: string;
}

export function ProspectNotesButton({ hasPending }: ProspectNotesButtonProps) {
  return (
    <span className="relative inline-flex items-center justify-center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <path d="M4 5.5A1.5 1.5 0 015.5 4h8.879a2 2 0 011.414.586l3.621 3.621A2 2 0 0120 9.621V18.5A1.5 1.5 0 0118.5 20h-13A1.5 1.5 0 014 18.5v-13z" />
        <path d="M14 4v4a1 1 0 001 1h4" />
        <path d="M8 12h8M8 16h5" />
      </svg>
      {hasPending && <span className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-950" />}
    </span>
  );
}

export default function ProspectNotesDrawer({
  prospect,
  draft,
  isOpen,
  onClose,
  onNotesChange,
  onThemeChange,
  onSendToClaude,
  sendToClaudeState = "idle",
  sendToClaudeMessage,
  previewHref,
}: ProspectNotesDrawerProps) {
  if (!isOpen || !prospect || !draft) return null;

  const currentTheme = draft.selectedTheme || prospect.selectedTheme || prospect.aiThemeRecommendation || "dark";
  const hasPending = hasPendingAdminUpdates({
    ...prospect,
    adminNotes: draft.adminNotes,
    selectedTheme: draft.selectedTheme,
  });
  const sendToClaudeDisabled =
    !onSendToClaude ||
    !draft.adminNotes.trim() ||
    draft.saveState === "saving" ||
    sendToClaudeState === "sending";

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        aria-label="Close notes panel"
      />
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border bg-slate-950 shadow-2xl flex flex-col">
        <div className="p-5 border-b border-border bg-surface-light/70">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Site change notes</p>
              <h3 className="mt-1 text-xl font-semibold text-foreground">{prospect.businessName}</h3>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {previewHref ? (
                  <a
                    href={previewHref}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-electric/10 px-3 py-1 text-blue-electric hover:bg-blue-electric/20"
                  >
                    Current preview
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                      <path d="M7 17L17 7M17 7H8M17 7v9" />
                    </svg>
                  </a>
                ) : (
                  <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-yellow-300">Preview not generated yet</span>
                )}
                {hasPending ? (
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-300">Pending submission</span>
                ) : (
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300">No unsubmitted changes</span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-surface border border-border text-muted hover:text-foreground"
              aria-label="Close notes drawer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mx-auto">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <section className="rounded-2xl border border-border bg-surface-light p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground">Theme</h4>
              <span className="text-xs text-muted">
                {draft.saveState === "saving"
                  ? "Saving…"
                  : draft.saveState === "saved"
                    ? "Saved"
                    : draft.saveState === "error"
                      ? "Save failed"
                      : "Autosaves"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["light", "dark"] as const).map((theme) => {
                const selected = currentTheme === theme;
                return (
                  <button
                    key={theme}
                    onClick={() => onThemeChange(theme)}
                    className={`h-11 rounded-xl border text-sm font-medium transition-colors ${
                      selected
                        ? theme === "light"
                          ? "border-blue-electric bg-white text-slate-900"
                          : "border-blue-electric bg-slate-900 text-white"
                        : "border-border bg-surface text-muted hover:text-foreground"
                    }`}
                  >
                    {theme === "light" ? "Light" : "Dark"}
                  </button>
                );
              })}
            </div>
            {prospect.aiThemeRecommendation && (
              <p className="mt-3 text-xs text-muted">
                AI recommendation: <span className="text-blue-electric">{prospect.aiThemeRecommendation}</span>
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-surface-light p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground">Notes for revisions</h4>
              <span className="text-xs text-muted">Saved to Supabase</span>
            </div>
            <textarea
              value={draft.adminNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Examples: change hero image, tighten the about section, swap to a darker palette, add a contact CTA above the fold..."
              className="min-h-[220px] w-full rounded-xl border border-border bg-slate-950/70 px-4 py-3 text-sm text-foreground outline-none focus:border-blue-electric resize-y"
            />
            <p className="mt-3 text-xs text-muted leading-5">
              Notes are stored immediately so you can close this panel and return later. Use “Submit All Notes” when you are ready to move every changed site into the revision queue.
            </p>

            <div className="mt-4 space-y-3 rounded-xl border border-border/80 bg-slate-950/60 p-3">
              <button
                type="button"
                onClick={() => void onSendToClaude?.()}
                disabled={sendToClaudeDisabled}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  sendToClaudeDisabled
                    ? "cursor-not-allowed border border-border bg-surface text-muted"
                    : "border border-violet-500/40 bg-violet-500/15 text-violet-100 hover:bg-violet-500/25"
                }`}
              >
                {sendToClaudeState === "sending" ? "Sending to Claude…" : "Send to Claude"}
              </button>
              <p className="text-xs leading-5 text-muted">
                Sends this site&apos;s saved notes, business context, current site data, and the visual QC guide to Claude Opus for an immediate revision pass.
              </p>
              {sendToClaudeMessage ? (
                <p
                  className={`text-xs leading-5 ${
                    sendToClaudeState === "error"
                      ? "text-rose-300"
                      : sendToClaudeState === "success"
                        ? "text-emerald-300"
                        : "text-muted"
                  }`}
                >
                  {sendToClaudeMessage}
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
