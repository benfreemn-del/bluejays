"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Prospect, Category, ProspectStatus } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/types";
import { hasPendingAdminUpdates } from "@/lib/admin-notes";
import StatusBadge from "./StatusBadge";

interface ProspectTableProps {
  prospects: Prospect[];
  categoryFilter: string;
  statusFilter: string;
  onCategoryChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onSelectProspect: (p: Prospect) => void;
  onSendEmail: (p: Prospect) => void;
  onRefresh?: () => void;
}

interface NoteDraft {
  adminNotes: string;
  selectedTheme?: "light" | "dark";
  persistedAdminNotes: string;
  persistedSelectedTheme?: "light" | "dark";
  saveState: "idle" | "saving" | "saved" | "error";
}

const allStatuses: ProspectStatus[] = [
  "scouted",
  "scraped",
  "generated",
  "pending-review",
  "ready_to_review",
  "qc_failed",
  "approved",
  "changes_pending",
  "ready_to_finalize",
  "deployed",
  "contacted",
  "responded",
  "paid",
];

function getInitialDraft(prospect: Prospect): NoteDraft {
  return {
    adminNotes: prospect.adminNotes || "",
    selectedTheme: prospect.selectedTheme,
    persistedAdminNotes: prospect.adminNotes || "",
    persistedSelectedTheme: prospect.selectedTheme,
    saveState: "idle",
  };
}

function NoteButton({ hasPending }: { hasPending: boolean }) {
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

export default function ProspectTable({
  prospects,
  categoryFilter,
  statusFilter,
  onCategoryChange,
  onStatusChange,
  onSelectProspect,
  onSendEmail,
  onRefresh,
}: ProspectTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkResult, setBulkResult] = useState("");
  const [buildingIds, setBuildingIds] = useState<string[]>([]);
  const [openNotesId, setOpenNotesId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, NoteDraft>>({});
  const [submitAllLoading, setSubmitAllLoading] = useState(false);

  const filtered = prospects.filter((p) => {
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    if (!statusFilter && p.status === "dismissed") return false;
    return true;
  });

  const isSelected = (id: string) => selectedIds.includes(id);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((p) => p.id));
    }
  };

  const getProspectById = (id: string | null) => prospects.find((prospect) => prospect.id === id);

  const getMergedProspect = (prospect: Prospect): Prospect => {
    const draft = noteDrafts[prospect.id];
    if (!draft) return prospect;

    return {
      ...prospect,
      adminNotes: draft.adminNotes,
      selectedTheme: draft.selectedTheme,
    };
  };

  const openNotesProspect = openNotesId ? getProspectById(openNotesId) : undefined;
  const openNotesDraft = openNotesId ? noteDrafts[openNotesId] : undefined;
  const openNotesMerged = openNotesProspect ? getMergedProspect(openNotesProspect) : undefined;

  useEffect(() => {
    if (!openNotesProspect) return;
    setNoteDrafts((prev) => {
      if (prev[openNotesProspect.id]) return prev;
      return {
        ...prev,
        [openNotesProspect.id]: getInitialDraft(openNotesProspect),
      };
    });
  }, [openNotesProspect]);

  const persistDraft = async (prospectId: string, draftOverride?: NoteDraft) => {
    const prospect = getProspectById(prospectId);
    const draft = draftOverride || noteDrafts[prospectId];
    if (!prospect || !draft) return;

    if (
      draft.adminNotes === draft.persistedAdminNotes &&
      (draft.selectedTheme || "") === (draft.persistedSelectedTheme || "")
    ) {
      return;
    }

    setNoteDrafts((prev) => ({
      ...prev,
      [prospectId]: {
        ...prev[prospectId],
        saveState: "saving",
      },
    }));

    try {
      const res = await fetch(`/api/prospects/${prospectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminNotes: draft.adminNotes,
          adminNotesUpdatedAt: new Date().toISOString(),
          selectedTheme: draft.selectedTheme,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save notes");
      }

      setNoteDrafts((prev) => ({
        ...prev,
        [prospectId]: {
          ...prev[prospectId],
          persistedAdminNotes: draft.adminNotes,
          persistedSelectedTheme: draft.selectedTheme,
          saveState: "saved",
        },
      }));

      window.setTimeout(() => {
        setNoteDrafts((prev) => {
          const current = prev[prospectId];
          if (!current || current.saveState !== "saved") return prev;
          return {
            ...prev,
            [prospectId]: {
              ...current,
              saveState: "idle",
            },
          };
        });
      }, 1200);
    } catch {
      setNoteDrafts((prev) => ({
        ...prev,
        [prospectId]: {
          ...prev[prospectId],
          saveState: "error",
        },
      }));
    }
  };

  useEffect(() => {
    if (!openNotesId || !openNotesDraft) return;

    if (
      openNotesDraft.adminNotes === openNotesDraft.persistedAdminNotes &&
      (openNotesDraft.selectedTheme || "") === (openNotesDraft.persistedSelectedTheme || "")
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void persistDraft(openNotesId, openNotesDraft);
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [openNotesId, openNotesDraft?.adminNotes, openNotesDraft?.selectedTheme]);

  const pendingProspectIds = useMemo(
    () =>
      prospects
        .filter((prospect) => hasPendingAdminUpdates(getMergedProspect(prospect)))
        .map((prospect) => prospect.id),
    [prospects, noteDrafts]
  );

  const pendingCount = pendingProspectIds.length;

  const closeNotesDrawer = async () => {
    if (openNotesId && noteDrafts[openNotesId]) {
      await persistDraft(openNotesId, noteDrafts[openNotesId]);
    }
    setOpenNotesId(null);
  };

  const sendBulk = async (channels: ("email" | "sms")[]) => {
    if (selectedIds.length === 0) return;
    setBulkSending(true);
    setBulkResult("");
    try {
      const res = await fetch("/api/outreach/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectIds: selectedIds, channels }),
      });
      const data = await res.json();
      setBulkResult(`${data.message}`);
      setSelectedIds([]);
      onRefresh?.();
    } catch {
      setBulkResult("Error sending outreach");
    } finally {
      setBulkSending(false);
    }
  };

  const submitAllNotes = async () => {
    if (pendingProspectIds.length === 0) return;

    setSubmitAllLoading(true);
    setBulkResult("");

    try {
      await Promise.all(
        pendingProspectIds.map(async (id) => {
          const draft = noteDrafts[id];
          if (draft) {
            await persistDraft(id, draft);
          }
        })
      );

      const res = await fetch("/api/admin/submit-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectIds: pendingProspectIds }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit notes");
      }

      setBulkResult(data.message || `Submitted ${pendingProspectIds.length} change request${pendingProspectIds.length === 1 ? "" : "s"}.`);
      onRefresh?.();
    } catch (error) {
      setBulkResult(error instanceof Error ? error.message : "Error submitting notes");
    } finally {
      setSubmitAllLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-10 px-3 rounded-lg bg-surface border border-border text-sm text-foreground"
        >
          <option value="">All Categories</option>
          {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
            <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-10 px-3 rounded-lg bg-surface border border-border text-sm text-foreground"
        >
          <option value="">All Statuses</option>
          {allStatuses.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replaceAll("_", " ").replace("-", " ")}</option>
          ))}
        </select>
        <span className="h-10 flex items-center text-muted text-sm">
          {filtered.length} prospect{filtered.length !== 1 ? "s" : ""}
          {selectedIds.length > 0 && (
            <span className="text-blue-electric ml-2">({selectedIds.length} selected)</span>
          )}
        </span>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-4 p-4 rounded-xl bg-blue-electric/10 border border-blue-electric/20 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-electric">
            {selectedIds.length} prospect{selectedIds.length !== 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => sendBulk(["email"])}
              disabled={bulkSending}
              className="h-9 px-4 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
            >
              {bulkSending ? "Sending..." : "Send Emails"}
            </button>
            <button
              onClick={() => sendBulk(["sms"])}
              disabled={bulkSending}
              className="h-9 px-4 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-50"
            >
              {bulkSending ? "Sending..." : "Send Texts"}
            </button>
            <button
              onClick={() => sendBulk(["email", "sms"])}
              disabled={bulkSending}
              className="h-9 px-4 rounded-lg bg-orange-500/20 text-orange-400 text-sm font-medium hover:bg-orange-500/30 transition-colors disabled:opacity-50"
            >
              {bulkSending ? "Sending..." : "Send Both"}
            </button>
            <button
              onClick={async () => {
                setBulkSending(true);
                setBulkResult("");
                try {
                  const res = await fetch("/api/funnel/enroll", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prospectIds: selectedIds }),
                  });
                  const data = await res.json();
                  setBulkResult(data.message);
                  setSelectedIds([]);
                  onRefresh?.();
                } catch {
                  setBulkResult("Error starting funnel");
                } finally {
                  setBulkSending(false);
                }
              }}
              disabled={bulkSending}
              className="h-9 px-4 rounded-lg bg-gradient-to-r from-sky-500/20 to-blue-600/20 text-sky-400 text-sm font-bold hover:from-sky-500/30 hover:to-blue-600/30 transition-colors disabled:opacity-50 border border-sky-500/30"
            >
              {bulkSending ? "Starting..." : "🚀 Start Funnel"}
            </button>
            <button
              onClick={async () => {
                setBulkSending(true);
                for (const pid of selectedIds) {
                  await fetch(`/api/prospects/${pid}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "dismissed" }),
                  });
                }
                setBulkResult(`${selectedIds.length} leads dismissed`);
                setSelectedIds([]);
                onRefresh?.();
                setBulkSending(false);
              }}
              disabled={bulkSending}
              className="h-9 px-4 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              Dismiss
            </button>
            <button
              onClick={async () => {
                setBulkSending(true);
                for (const pid of selectedIds) {
                  await fetch(`/api/generate/${pid}`, { method: "POST" });
                }
                setBulkResult(`Building ${selectedIds.length} sites...`);
                setSelectedIds([]);
                onRefresh?.();
                setBulkSending(false);
              }}
              disabled={bulkSending}
              className="h-9 px-4 rounded-lg bg-yellow-500/20 text-yellow-400 text-sm font-medium hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
            >
              Build Sites
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="h-9 px-4 rounded-lg bg-surface border border-border text-muted text-sm hover:text-foreground transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {bulkResult && (
        <div className="mb-4 p-3 rounded-lg bg-blue-electric/10 text-blue-electric text-sm">
          {bulkResult}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-light border-b border-border">
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                  className="rounded"
                />
              </th>
              <th className="text-left p-3 font-medium text-muted">Business</th>
              <th className="text-left p-3 font-medium text-muted">Category</th>
              <th className="text-left p-3 font-medium text-muted">City</th>
              <th className="text-left p-3 font-medium text-muted">Rating</th>
              <th className="text-left p-3 font-medium text-muted">Status</th>
              <th className="text-left p-3 font-medium text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((prospect) => {
              const mergedProspect = getMergedProspect(prospect);
              const hasPendingNotes = hasPendingAdminUpdates(mergedProspect);

              return (
                <tr
                  key={prospect.id}
                  className={`border-b border-border hover:bg-surface-light/50 transition-colors ${
                    isSelected(prospect.id) ? "bg-blue-electric/5" : ""
                  } ${
                    prospect.pricingTier === "free"
                      ? "border-l-2 border-l-emerald-400 bg-emerald-500/[0.03]"
                      : prospect.source === "inbound"
                        ? "border-l-2 border-l-amber-400 bg-amber-500/[0.03]"
                        : ""
                  }`}
                >
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected(prospect.id)}
                      onChange={() => toggleSelect(prospect.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-3 cursor-pointer" onClick={() => router.push(`/lead/${prospect.id}`)}>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-blue-electric hover:underline">{prospect.businessName}</p>
                      {prospect.pricingTier === "free" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold tracking-wide border border-emerald-500/30">Free</span>
                      )}
                      {prospect.source === "inbound" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold tracking-wide border border-amber-500/30">Inbound</span>
                      )}
                      {prospect.createdAt !== prospect.updatedAt && prospect.status === "scouted" && prospect.source !== "inbound" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium">Re-scouted</span>
                      )}
                    </div>
                    {prospect.phone && <p className="text-muted text-xs">{prospect.phone}</p>}
                  </td>
                  <td className="p-3">
                    <span
                      className="text-xs font-medium px-2 py-1 rounded"
                      style={{
                        backgroundColor: CATEGORY_CONFIG[prospect.category]?.accentColor + "20",
                        color: CATEGORY_CONFIG[prospect.category]?.accentColor,
                      }}
                    >
                      {CATEGORY_CONFIG[prospect.category]?.label}
                    </span>
                  </td>
                  <td className="p-3 text-muted">{prospect.city}</td>
                  <td className="p-3">
                    {prospect.googleRating && (
                      <span className="text-yellow-400">
                        {prospect.googleRating} ({prospect.reviewCount})
                      </span>
                    )}
                  </td>
                  <td className="p-3"><StatusBadge status={prospect.status} /></td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {prospect.generatedSiteUrl ? (
                        <a
                          href={`/preview-device/${prospect.id}`}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-electric/10 text-blue-electric hover:bg-blue-electric/20 transition-colors"
                          title="Preview desktop & mobile"
                        >
                          Preview
                        </a>
                      ) : (
                        <button
                          disabled={buildingIds.includes(prospect.id)}
                          onClick={async () => {
                            setBuildingIds((prev) => [...prev, prospect.id]);
                            try {
                              await fetch(`/api/generate/${prospect.id}`, { method: "POST" });
                            } catch {
                              // noop
                            }
                            setBuildingIds((prev) => prev.filter((x) => x !== prospect.id));
                            onRefresh?.();
                          }}
                          className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                            buildingIds.includes(prospect.id)
                              ? "bg-yellow-500/30 text-yellow-300 animate-pulse"
                              : "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                          }`}
                          title="Scrape & generate preview site"
                        >
                          {buildingIds.includes(prospect.id) ? "Building..." : "Build Site"}
                        </button>
                      )}
                      <button
                        onClick={() => setOpenNotesId(prospect.id)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors border ${
                          hasPendingNotes
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
                            : "bg-surface border-border text-muted hover:text-foreground hover:border-border/80"
                        }`}
                        title="Open notes and theme settings"
                      >
                        <NoteButton hasPending={hasPendingNotes} />
                      </button>
                      {(prospect.status === "pending-review" || prospect.status === "ready_to_review") && (
                        <button
                          onClick={async () => {
                            await fetch(`/api/prospects/${prospect.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: "approved" }),
                            });
                            onRefresh?.();
                          }}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          title="Approve for outreach"
                        >
                          ✓ Approve
                        </button>
                      )}
                      {prospect.status === "qc_failed" && (
                        <button
                          onClick={async () => {
                            await fetch(`/api/qc/review/${prospect.id}`, { method: "POST" });
                            onRefresh?.();
                          }}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Re-run QC check"
                        >
                          Re-QC
                        </button>
                      )}
                      {prospect.email && prospect.generatedSiteUrl && (
                        <button
                          onClick={() => onSendEmail(prospect)}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                          title="Send email"
                        >
                          ✉
                        </button>
                      )}
                      {prospect.phone && (
                        <>
                          <button
                            onClick={async () => {
                              await fetch(`/api/sms/send/${prospect.id}`, { method: "POST" });
                              alert(`Text sent to ${prospect.phone}!`);
                              onRefresh?.();
                            }}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                            title="Send text"
                          >
                            💬
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`Drop voicemail to ${prospect.phone}?`)) return;
                              const res = await fetch(`/api/voicemail/drop/${prospect.id}`, { method: "POST" });
                              const data = await res.json();
                              alert(data.message || data.error);
                              onRefresh?.();
                            }}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                            title="Drop voicemail"
                          >
                            VM
                          </button>
                          <button
                            onClick={async () => {
                              await fetch("/api/call-lists", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ prospectId: prospect.id, action: "add" }),
                              });
                              alert("Added to call list!");
                            }}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors"
                            title="Add to call list"
                          >
                            📞
                          </button>
                        </>
                      )}
                      {prospect.generatedSiteUrl && (
                        <button
                          onClick={() => onSelectProspect(prospect)}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                          title="Instagram DM"
                        >
                          IG
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted">
                  No prospects found. Run a scout to find businesses!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={submitAllNotes}
        disabled={submitAllLoading || pendingCount === 0}
        className={`fixed bottom-6 right-6 z-30 inline-flex items-center gap-3 rounded-full px-5 py-3 shadow-2xl border transition-all ${
          pendingCount > 0
            ? "bg-blue-electric text-white border-blue-electric hover:scale-[1.02]"
            : "bg-surface-light text-muted border-border"
        } disabled:cursor-not-allowed disabled:hover:scale-100`}
      >
        <span className="text-sm font-semibold">
          {submitAllLoading ? "Submitting..." : "Submit All Notes"}
        </span>
        <span className={`inline-flex min-w-7 h-7 items-center justify-center rounded-full text-xs font-bold ${pendingCount > 0 ? "bg-white text-blue-electric" : "bg-border text-muted"}`}>
          {pendingCount}
        </span>
      </button>

      {openNotesMerged && openNotesDraft && (
        <>
          <button
            type="button"
            onClick={() => void closeNotesDrawer()}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            aria-label="Close notes panel"
          />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border bg-slate-950 shadow-2xl flex flex-col">
            <div className="p-5 border-b border-border bg-surface-light/70">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">Site change notes</p>
                  <h3 className="mt-1 text-xl font-semibold text-foreground">{openNotesMerged.businessName}</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    {openNotesMerged.generatedSiteUrl ? (
                      <a
                        href={`/preview-device/${openNotesMerged.id}`}
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
                    {hasPendingAdminUpdates(openNotesMerged) ? (
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-300">Pending submission</span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300">No unsubmitted changes</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => void closeNotesDrawer()}
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
                    {openNotesDraft.saveState === "saving"
                      ? "Saving…"
                      : openNotesDraft.saveState === "saved"
                        ? "Saved"
                        : openNotesDraft.saveState === "error"
                          ? "Save failed"
                          : "Autosaves"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(["light", "dark"] as const).map((theme) => {
                    const selected = (openNotesDraft.selectedTheme || openNotesMerged.aiThemeRecommendation || "dark") === theme;
                    return (
                      <button
                        key={theme}
                        onClick={() => {
                          setNoteDrafts((prev) => ({
                            ...prev,
                            [openNotesMerged.id]: {
                              ...(prev[openNotesMerged.id] || getInitialDraft(openNotesMerged)),
                              selectedTheme: theme,
                              saveState: "idle",
                            },
                          }));
                        }}
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
                {openNotesMerged.aiThemeRecommendation && (
                  <p className="mt-3 text-xs text-muted">
                    AI recommendation: <span className="text-blue-electric">{openNotesMerged.aiThemeRecommendation}</span>
                  </p>
                )}
              </section>

              <section className="rounded-2xl border border-border bg-surface-light p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground">Notes for revisions</h4>
                  <span className="text-xs text-muted">Saved to Supabase</span>
                </div>
                <textarea
                  value={openNotesDraft.adminNotes}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNoteDrafts((prev) => ({
                      ...prev,
                      [openNotesMerged.id]: {
                        ...(prev[openNotesMerged.id] || getInitialDraft(openNotesMerged)),
                        adminNotes: value,
                        saveState: "idle",
                      },
                    }));
                  }}
                  placeholder="Examples: change hero image, tighten the about section, swap to a darker palette, add a contact CTA above the fold..."
                  className="min-h-[220px] w-full rounded-xl border border-border bg-slate-950/70 px-4 py-3 text-sm text-foreground outline-none focus:border-blue-electric resize-y"
                />
                <p className="mt-3 text-xs text-muted leading-5">
                  Notes are stored immediately so you can close this panel and return later. Use “Submit All Notes” when you are ready to move every changed site into the revision queue.
                </p>
              </section>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
