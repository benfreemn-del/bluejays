"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Prospect, Category, ProspectStatus } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/types";
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

const allStatuses: ProspectStatus[] = [
  "scouted", "scraped", "generated", "pending-review", "approved",
  "deployed", "contacted", "responded", "paid",
];

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

  const filtered = prospects.filter((p) => {
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    // Hide dismissed unless specifically filtering for them
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

  return (
    <div>
      {/* Filters */}
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
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")}</option>
          ))}
        </select>
        <span className="h-10 flex items-center text-muted text-sm">
          {filtered.length} prospect{filtered.length !== 1 ? "s" : ""}
          {selectedIds.length > 0 && (
            <span className="text-blue-electric ml-2">({selectedIds.length} selected)</span>
          )}
        </span>
      </div>

      {/* Bulk Action Bar */}
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
                } catch { setBulkResult("Error starting funnel"); }
                finally { setBulkSending(false); }
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

      {/* Table */}
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
            {filtered.map((prospect) => (
              <tr
                key={prospect.id}
                className={`border-b border-border hover:bg-surface-light/50 transition-colors ${
                  isSelected(prospect.id) ? "bg-blue-electric/5" : ""
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
                  <p className="font-medium text-blue-electric hover:underline">{prospect.businessName}</p>
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
                  <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
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
                        onClick={async () => {
                          await fetch(`/api/generate/${prospect.id}`, { method: "POST" });
                          onRefresh?.();
                        }}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                        title="Generate preview site"
                      >
                        Build Site
                      </button>
                    )}
                    {prospect.status === "pending-review" && (
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
                            await fetch("/api/call-lists", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ prospectId: prospect.id, action: "add" }),
                            });
                            alert(`Added to call list!`);
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
            ))}
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
    </div>
  );
}
