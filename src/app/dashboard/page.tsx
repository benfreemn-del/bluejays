"use client";

import Link from "next/link";

import { useState, useEffect, useCallback } from "react";
import type { Prospect, Category } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/types";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ProspectTable from "@/components/dashboard/ProspectTable";
import ScoutModal from "@/components/dashboard/ScoutModal";
import ProspectDetail from "@/components/dashboard/ProspectDetail";
import MapView from "@/components/dashboard/MapView";
import PipelineDashboard from "@/components/dashboard/PipelineDashboard";

export default function DashboardPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoutOpen, setScoutOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(
    null
  );
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [view, setView] = useState<"table" | "map">("table");
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [newLead, setNewLead] = useState({ businessName: "", phone: "", email: "", website: "", category: "dental", city: "Seattle, WA" });
  const [addingLead, setAddingLead] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);

  const fetchProspects = useCallback(async () => {
    try {
      const res = await fetch("/api/prospects", { credentials: "include" });
      if (!res.ok) {
        console.error("Failed to fetch prospects:", res.status, res.statusText);
        return;
      }
      const data = await res.json();
      setProspects(data.prospects || []);
    } catch (err) {
      console.error("Failed to fetch prospects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  const handleSendEmail = async (prospect: Prospect) => {
    try {
      const res = await fetch(`/api/email/send/${prospect.id}`, { credentials: "include",
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Email sent to ${prospect.email}!`);
        fetchProspects();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Failed to send email: ${(err as Error).message}`);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/prospects/${id}`, { credentials: "include",
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchProspects();
      if (selectedProspect?.id === id) {
        setSelectedProspect((prev) =>
          prev ? { ...prev, status: status as Prospect["status"] } : null
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleUpdateProspect = async (id: string, updates: Partial<Prospect>) => {
    try {
      await fetch(`/api/prospects/${id}`, { credentials: "include",
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      fetchProspects();
      if (selectedProspect?.id === id) {
        setSelectedProspect((prev) =>
          prev ? { ...prev, ...updates } : null
        );
      }
    } catch (err) {
      console.error("Failed to update prospect:", err);
    }
  };

  const handleStartFunnelForSelected = async () => {
    if (!selectedProspect) {
      alert("Select a prospect first, then start the funnel.");
      return;
    }

    try {
      const res = await fetch("/api/funnel/enroll", { credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectIds: [selectedProspect.id] }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || data.message || "Failed to start funnel");
        return;
      }

      alert(data.message || `Started funnel for ${selectedProspect.businessName}`);
      fetchProspects();
    } catch (err) {
      alert(`Failed to start funnel: ${(err as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-electric to-blue-deep" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">BlueJays</p>
              <h1 className="truncate text-lg font-semibold sm:text-xl">Dashboard</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Link href="/" className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-background hover:text-foreground">
              Home
            </Link>
            <Link href="/scripts" className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-background hover:text-foreground">
              AI
            </Link>
            <a href="/spending" className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-background hover:text-foreground">
              Spend
            </a>
            <a href="/deliverability" className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-background hover:text-foreground">
              Email
            </a>
            <a href="/analytics" className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-background hover:text-foreground">
              Stats
            </a>
            <Link href="/image-mapper" className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-background hover:text-foreground">
              Images
            </Link>
            <a
              href="/api/call-lists?type=all&format=csv"
              className="flex h-9 items-center rounded-lg border border-border px-3 text-sm font-medium text-muted transition-colors hover:border-blue-electric/40 hover:text-foreground"
            >
              Phones
            </a>
            <a
              href="/api/call-lists?type=priority&format=csv"
              className="flex h-9 items-center rounded-lg border border-orange-500/30 px-3 text-sm font-medium text-orange-400 transition-colors hover:border-orange-500/60"
            >
              Priority
            </a>
            <button
              onClick={handleStartFunnelForSelected}
              disabled={!selectedProspect}
              className="h-9 rounded-lg border border-sky-500/30 px-3 text-sm font-medium text-sky-400 transition-colors hover:border-sky-500/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Funnel
            </button>
            <button
              onClick={async () => {
                if (!confirm("Send test funnel to benfreemn@gmail.com? This will send 2 real emails.")) return;
                try {
                  const res = await fetch("/api/test-funnel", { method: "POST", credentials: "include" });
                  const data = await res.json();
                  alert(data.message || data.error);
                } catch { alert("Error sending test funnel"); }
              }}
              className="h-9 rounded-lg border border-purple-500/30 px-3 text-sm font-medium text-purple-400 transition-colors hover:border-purple-500/60"
            >
              Test
            </button>
            <button
              onClick={() => setAddLeadOpen(true)}
              className="h-9 rounded-lg border border-green-500/30 px-3 text-sm font-medium text-green-400 transition-colors hover:border-green-500/60"
            >
              Lead
            </button>
            <button
              onClick={() => setScoutOpen(true)}
              className="h-9 rounded-lg bg-blue-electric px-3 text-sm font-medium text-white transition-colors hover:bg-blue-deep"
            >
              Scout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {loading ? (
          <div className="py-20 text-center text-muted">
            Loading prospects...
          </div>
        ) : (
          <>
            <DashboardStats
              prospects={prospects}
              onFilterStatus={setStatusFilter}
              activeFilter={statusFilter}
            />

            <div className="flex gap-2">
              <button
                onClick={() => { setView("table"); fetchProspects(); }}
                className={`h-9 rounded-lg px-4 text-sm font-medium transition-colors ${
                  view === "table"
                    ? "bg-blue-electric text-white"
                    : "bg-surface border border-border text-muted hover:text-foreground"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setView("map")}
                className={`h-9 rounded-lg px-4 text-sm font-medium transition-colors ${
                  view === "map"
                    ? "bg-blue-electric text-white"
                    : "bg-surface border border-border text-muted hover:text-foreground"
                }`}
              >
                Map
              </button>
            </div>

            {view === "table" ? (
              <ProspectTable
                prospects={prospects}
                categoryFilter={categoryFilter}
                statusFilter={statusFilter}
                onCategoryChange={setCategoryFilter}
                onStatusChange={setStatusFilter}
                onSelectProspect={setSelectedProspect}
                onSendEmail={handleSendEmail}
                onRefresh={fetchProspects}
              />
            ) : (
              <MapView
                prospects={prospects}
                onStateClick={(state) => {
                  const stateName =
                    Object.entries({
                      TX: "Texas", CA: "California", NY: "New York",
                      FL: "Florida", IL: "Illinois", PA: "Pennsylvania",
                    })[0]?.[1] || state;
                  void stateName;
                  setScoutOpen(true);
                }}
              />
            )}
          </>
        )}
      </main>

      <ScoutModal
        isOpen={scoutOpen}
        onClose={() => setScoutOpen(false)}
        onComplete={() => {
          fetchProspects();
        }}
      />

      <PipelineDashboard
        isOpen={pipelineOpen}
        onClose={() => setPipelineOpen(false)}
        onComplete={() => {
          fetchProspects();
        }}
      />

      <ProspectDetail
        prospect={selectedProspect}
        onClose={() => setSelectedProspect(null)}
        onSendEmail={handleSendEmail}
        onStatusChange={handleStatusChange}
        onUpdateProspect={handleUpdateProspect}
      />

      {addLeadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Add Lead</h2>
                <p className="mt-1 text-sm text-muted">Create a lead manually.</p>
              </div>
              <button
                onClick={() => setAddLeadOpen(false)}
                className="text-muted transition-colors hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-muted">Business Name</label>
                <input
                  value={newLead.businessName}
                  onChange={(e) => setNewLead({ ...newLead, businessName: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-electric"
                  placeholder="Acme Dental"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-muted">Phone</label>
                  <input
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-electric"
                    placeholder="(555) 555-5555"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted">Email</label>
                  <input
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-electric"
                    placeholder="owner@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted">Website</label>
                <input
                  value={newLead.website}
                  onChange={(e) => setNewLead({ ...newLead, website: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-electric"
                  placeholder="https://example.com"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-muted">Category</label>
                  <select
                    value={newLead.category}
                    onChange={(e) => setNewLead({ ...newLead, category: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-electric"
                  >
                    {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
                      <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted">City</label>
                  <input
                    value={newLead.city}
                    onChange={(e) => setNewLead({ ...newLead, city: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-electric"
                    placeholder="Seattle, WA"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setAddLeadOpen(false)}
                className="h-10 rounded-lg border border-border px-4 text-sm text-muted transition-colors hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newLead.businessName.trim()) {
                    alert("Business name is required");
                    return;
                  }
                  setAddingLead(true);
                  try {
                    const res = await fetch("/api/prospects", {
                      method: "POST",
                      credentials: "include",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newLead),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      throw new Error(data.error || "Failed to add lead");
                    }
                    setAddLeadOpen(false);
                    setNewLead({ businessName: "", phone: "", email: "", website: "", category: "dental", city: "Seattle, WA" });
                    fetchProspects();
                  } catch (error) {
                    alert(error instanceof Error ? error.message : "Failed to add lead");
                  } finally {
                    setAddingLead(false);
                  }
                }}
                disabled={addingLead}
                className="h-10 rounded-lg bg-blue-electric px-4 text-sm font-medium text-white transition-colors hover:bg-blue-deep disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addingLead ? "Adding..." : "Add Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
