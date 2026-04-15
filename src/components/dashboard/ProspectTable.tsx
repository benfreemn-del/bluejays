"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Prospect, Category, ProspectStatus } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/types";
import { hasPendingAdminUpdates } from "@/lib/admin-notes";
import StatusBadge from "./StatusBadge";
import ProspectNotesDrawer, { ProspectNotesButton } from "./ProspectNotesDrawer";

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
  "ready_to_send",
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

function getThemedPreviewHref(prospect: Prospect) {
  const theme = prospect.selectedTheme || prospect.aiThemeRecommendation || "dark";
  return `/preview-device/${prospect.id}?theme=${theme}`;
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
  const [sendToClaudeById, setSendToClaudeById] = useState<
    Record<string, { state: "idle" | "sending" | "success" | "error"; message: string }>
  >({});

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 100;

  const filtered = prospects.filter((p) => {
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    if (!statusFilter && p.status === "dismissed") return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedFiltered = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [categoryFilter, statusFilter]);

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

  const getProspectById = useCallback(
    (id: string | null) => prospects.find((prospect) => prospect.id === id),
    [prospects]
  );

  const getMergedProspect = useCallback(
    (prospect: Prospect): Prospect => {
      const draft = noteDrafts[prospect.id];
      if (!draft) return prospect;

      return {
        ...prospect,
        adminNotes: draft.adminNotes,
        selectedTheme: draft.selectedTheme,
      };
    },
    [noteDrafts]
  );

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

  const persistDraft = useCallback(async (prospectId: string, draftOverride?: NoteDraft) => {
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
      const res = await fetch(`/api/prospects/${prospectId}`, { credentials: "include",
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
  }, [getProspectById, noteDrafts]);

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
  }, [openNotesId, openNotesDraft, persistDraft]);

  const pendingProspectIds = useMemo(
    () =>
      prospects
        .filter((prospect) => hasPendingAdminUpdates(getMergedProspect(prospect)))
        .map((prospect) => prospect.id),
    [getMergedProspect, prospects]
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

  const handleSendToClaude = useCallback(async (prospectId: string) => {
    const prospect = getProspectById(prospectId);
    const draft = noteDrafts[prospectId];
    if (!prospect || !draft) return;

    await persistDraft(prospectId, draft);
    setSendToClaudeById((prev) => ({
      ...prev,
      [prospectId]: {
        state: "sending",
        message: "Sending the current site context and saved notes to Claude...",
      },
    }));

    try {
      const response = await fetch(`/api/admin/send-to-claude/${prospectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminNotes: draft.adminNotes,
          selectedTheme: draft.selectedTheme,
        }),
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to send this site to Claude.");
      }

      const updatedProspect = data.prospect as Prospect | undefined;
      if (updatedProspect) {
        setNoteDrafts((prev) => ({
          ...prev,
          [prospectId]: {
            ...(prev[prospectId] || getInitialDraft(updatedProspect)),
            adminNotes: updatedProspect.adminNotes || draft.adminNotes,
            selectedTheme: updatedProspect.selectedTheme,
            persistedAdminNotes: updatedProspect.adminNotes || "",
            persistedSelectedTheme: updatedProspect.selectedTheme,
            saveState: "saved",
          },
        }));
      }

      setSendToClaudeById((prev) => ({
        ...prev,
        [prospectId]: {
          state: "success",
          message: [
            data.message,
            data.handoff?.summary,
            data.limitations?.dashboardConversationCreated === false ? data.limitations.reason : null,
          ]
            .filter(Boolean)
            .join(" "),
        },
      }));
      onRefresh?.();
    } catch (error) {
      setSendToClaudeById((prev) => ({
        ...prev,
        [prospectId]: {
          state: "error",
          message:
            error instanceof Error ? error.message : "Failed to send this site to Claude.",
        },
      }));
    }
  }, [getProspectById, noteDrafts, onRefresh, persistDraft]);

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
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-blue-electric/20 bg-blue-electric/10 p-4 lg:flex-row lg:items-center lg:justify-between">
          <span className="text-sm font-medium text-blue-electric">
            {selectedIds.length} prospect{selectedIds.length !== 1 ? "s" : ""} selected
          </span>
          <div className="flex flex-wrap gap-2">
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
                  const emailOnly = confirm("Email-only mode? (OK = email only, Cancel = full funnel with SMS)");
                  const res = await fetch("/api/funnel/enroll", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prospectIds: selectedIds, emailOnly }),
                  });
                  const data = await res.json();
                  setBulkResult(data.message + (emailOnly ? " (email-only — SMS queued for later)" : ""));
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
                setBulkResult("");
                const failures: string[] = [];
                for (const pid of selectedIds) {
                  try {
                    const res = await fetch(`/api/prospects/${pid}`, { credentials: "include",
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: "approved" }),
                    });
                    if (!res.ok) {
                      const errData = await res.json().catch(() => ({}));
                      failures.push(`${pid}: ${(errData as Record<string, string>).error || res.statusText}`);
                    }
                  } catch (err) {
                    failures.push(`${pid}: ${err instanceof Error ? err.message : "Network error"}`);
                  }
                }
                const successCount = selectedIds.length - failures.length;
                if (failures.length > 0) {
                  setBulkResult(`${successCount} approved, ${failures.length} failed: ${failures.join("; ")}`);
                } else {
                  setBulkResult(`${selectedIds.length} leads approved`);
                }
                setSelectedIds([]);
                onRefresh?.();
                setBulkSending(false);
              }}
              disabled={bulkSending}
              className="h-9 px-4 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-bold hover:bg-emerald-500/30 transition-colors disabled:opacity-50 border border-emerald-500/30"
            >
              {bulkSending ? "Approving..." : "✅ Approve"}
            </button>
            <button
              onClick={async () => {
                setBulkSending(true);
                for (const pid of selectedIds) {
                  await fetch(`/api/prospects/${pid}`, { credentials: "include",
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
            {paginatedFiltered.map((prospect) => {
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
                      {(prospect.scrapedData as Record<string, unknown>)?.imageMapping && (prospect.scrapedData as Record<string, unknown> & { imageMapping?: { selectionStatus?: string } })?.imageMapping?.selectionStatus === "completed" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold" title="Images completed">📷</span>
                      )}
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
                          href={getThemedPreviewHref(mergedProspect)}
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
                              await fetch(`/api/generate/${prospect.id}`, { method: "POST", credentials: "include" });
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
                        <ProspectNotesButton hasPending={hasPendingNotes} />
                      </button>
                      {(prospect.status === "pending-review" || prospect.status === "ready_to_review" || prospect.status === "qc_failed" || prospect.status === "generated") && (
                        <button
                          onClick={async () => {
                            await fetch(`/api/prospects/${prospect.id}`, { credentials: "include",
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
                            // Immediately move to pending-review so it leaves qc_failed category
                            await fetch(`/api/prospects/${prospect.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: "pending-review", qualityNotes: "Re-QC in progress \u2014 Claude is reviewing..." }),
                            });
                            onRefresh?.();
                            // Fire Claude QC pipeline in background
                            fetch(`/api/qc/review/${prospect.id}`, { method: "POST", credentials: "include" })
                              .then(() => onRefresh?.())
                              .catch(() => {});
                          }}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Re-run QC check via Claude"
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
                              await fetch(`/api/sms/send/${prospect.id}`, { method: "POST", credentials: "include" });
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
                              const res = await fetch(`/api/voicemail/drop/${prospect.id}`, { method: "POST", credentials: "include" });
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


      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-muted">
            Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs rounded border border-border text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ««
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs rounded border border-border text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ‹ Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .map((page, idx, arr) => (
                <span key={page} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-1 text-muted">…</span>}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                      page === currentPage
                        ? "bg-blue-electric text-white border-blue-electric"
                        : "border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {page}
                  </button>
                </span>
              ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs rounded border border-border text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs rounded border border-border text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            >
              »»
            </button>
          </div>
        </div>
      )}

      <ProspectNotesDrawer
        prospect={openNotesMerged}
        draft={openNotesDraft}
        isOpen={!!openNotesMerged && !!openNotesDraft}
        onClose={() => void closeNotesDrawer()}
        onNotesChange={(value) => {
          if (!openNotesMerged) return;
          setSendToClaudeById((prev) => ({
            ...prev,
            [openNotesMerged.id]: {
              state: "idle",
              message: "",
            },
          }));
          setNoteDrafts((prev) => ({
            ...prev,
            [openNotesMerged.id]: {
              ...(prev[openNotesMerged.id] || getInitialDraft(openNotesMerged)),
              adminNotes: value,
              saveState: "idle",
            },
          }));
        }}
        onThemeChange={(theme) => {
          if (!openNotesMerged) return;
          const nextDraft: NoteDraft = {
            ...(noteDrafts[openNotesMerged.id] || getInitialDraft(openNotesMerged)),
            selectedTheme: theme,
            saveState: "idle",
          };
          setSendToClaudeById((prev) => ({
            ...prev,
            [openNotesMerged.id]: {
              state: "idle",
              message: "",
            },
          }));
          setNoteDrafts((prev) => ({
            ...prev,
            [openNotesMerged.id]: nextDraft,
          }));
          void persistDraft(openNotesMerged.id, nextDraft);
        }}
        onSendToClaude={openNotesMerged ? () => handleSendToClaude(openNotesMerged.id) : undefined}
        sendToClaudeState={openNotesId ? sendToClaudeById[openNotesId]?.state || "idle" : "idle"}
        sendToClaudeMessage={openNotesId ? sendToClaudeById[openNotesId]?.message || "" : ""}
        previewHref={openNotesMerged ? getThemedPreviewHref(openNotesMerged) : undefined}
      />
    </div>
  );
}
