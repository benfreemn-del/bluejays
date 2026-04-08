"use client";

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
      const res = await fetch("/api/prospects");
      const data = await res.json();
      setProspects(data.prospects);
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
      const res = await fetch(`/api/email/send/${prospect.id}`, {
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
      await fetch(`/api/prospects/${id}`, {
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
      await fetch(`/api/prospects/${id}`, {
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
      const res = await fetch("/api/funnel/enroll", {
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
      {/* Top Bar */}
      <header className="border-b border-border bg-surface sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-electric to-blue-deep" />
            <h1 className="text-xl font-bold">BlueJays Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-muted hover:text-foreground transition-colors">
              Portfolio
            </a>
            <a href="/scripts" className="text-sm text-muted hover:text-foreground transition-colors">
              AI Convos
            </a>
            <a href="/spending" className="text-sm text-muted hover:text-foreground transition-colors">
              Spending
            </a>
            <a href="/deliverability" className="text-sm text-muted hover:text-foreground transition-colors">
              Deliverability
            </a>
            <a href="/analytics" className="text-sm text-muted hover:text-foreground transition-colors">
              Analytics
            </a>
            <a
              href="/api/call-lists?type=all&format=csv"
              className="h-9 px-4 rounded-lg bg-surface border border-border text-muted text-sm font-medium flex items-center hover:text-foreground hover:border-blue-electric/40 transition-colors"
            >
              All Phones
            </a>
            <a
              href="/api/call-lists?type=priority&format=csv"
              className="h-9 px-4 rounded-lg bg-surface border border-orange-500/30 text-orange-400 text-sm font-medium flex items-center hover:border-orange-500/60 transition-colors"
            >
              Priority List
            </a>
            <button
              onClick={handleStartFunnelForSelected}
              className="h-9 px-4 rounded-lg bg-surface border border-sky-500/30 text-sky-400 text-sm font-medium hover:border-sky-500/60 transition-colors"
            >
              {selectedProspect ? `Start Funnel: ${selectedProspect.businessName}` : "Start Funnel (Select Prospect)"}
            </button>
            <button
              onClick={async () => {
                if (!confirm("Send test funnel to benfreemn@gmail.com? This will send 2 real emails.")) return;
                try {
                  const res = await fetch("/api/test-funnel", { method: "POST" });
                  const data = await res.json();
                  alert(data.message || data.error);
                } catch { alert("Error sending test funnel"); }
              }}
              className="h-9 px-4 rounded-lg bg-surface border border-purple-500/30 text-purple-400 text-sm font-medium hover:border-purple-500/60 transition-colors"
            >
              Send Ben Test Funnel
            </button>
            <button
              onClick={() => setAddLeadOpen(true)}
              className="h-9 px-4 rounded-lg bg-surface border border-green-500/30 text-green-400 text-sm font-medium hover:border-green-500/60 transition-colors"
            >
              + Add Lead
            </button>
            <button
              onClick={() => setPipelineOpen(true)}
              className="h-9 px-4 rounded-lg bg-surface border border-sky-500/30 text-sky-400 text-sm font-medium hover:border-sky-500/60 transition-colors"
            >
              Pipeline
            </button>
            <button
              onClick={() => setScoutOpen(true)}
              className="h-9 px-4 rounded-lg bg-blue-electric text-white text-sm font-medium hover:bg-blue-deep transition-colors"
            >
              + New Scout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {loading ? (
          <div className="text-center py-20 text-muted">
            Loading prospects...
          </div>
        ) : (
          <>
            <DashboardStats
              prospects={prospects}
              onFilterStatus={setStatusFilter}
              activeFilter={statusFilter}
            />

            {/* View toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => { setView("table"); fetchProspects(); }}
                className={`h-9 px-4 rounded-lg text-sm font-medium transition-colors ${
                  view === "table"
                    ? "bg-blue-electric text-white"
                    : "bg-surface border border-border text-muted hover:text-foreground"
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setView("map")}
                className={`h-9 px-4 rounded-lg text-sm font-medium transition-colors ${
                  view === "map"
                    ? "bg-blue-electric text-white"
                    : "bg-surface border border-border text-muted hover:text-foreground"
                }`}
              >
                Map View
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
                  // Open scout modal pre-filled for that state
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

      {/* Add Lead Modal */}
      {addLeadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddLeadOpen(false)} />
          <div className="relative bg-surface border border-border rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Manually Add Lead</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted mb-1">Business Name *</label>
                <input type="text" value={newLead.businessName} onChange={(e) => setNewLead({ ...newLead, businessName: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-light border border-border text-foreground text-sm" placeholder="e.g., Bright Smile Dental" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-muted mb-1">Phone</label>
                  <input type="tel" value={newLead.phone} onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-light border border-border text-foreground text-sm" placeholder="(206) 555-1234" />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1">Email</label>
                  <input type="email" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-light border border-border text-foreground text-sm" placeholder="owner@business.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">Current Website</label>
                <input type="url" value={newLead.website} onChange={(e) => setNewLead({ ...newLead, website: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-light border border-border text-foreground text-sm" placeholder="https://theirsite.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-muted mb-1">Category</label>
                  <select value={newLead.category} onChange={(e) => setNewLead({ ...newLead, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-light border border-border text-foreground text-sm">
                    {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
                      <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1">City</label>
                  <input type="text" value={newLead.city} onChange={(e) => setNewLead({ ...newLead, city: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface-light border border-border text-foreground text-sm" placeholder="Seattle, WA" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setAddLeadOpen(false)}
                className="flex-1 h-10 rounded-lg border border-border text-muted text-sm hover:bg-surface-light transition-colors">
                Cancel
              </button>
              <button
                disabled={addingLead || !newLead.businessName}
                onClick={async () => {
                  setAddingLead(true);
                  try {
                    const res = await fetch("/api/leads/manual", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newLead),
                    });
                    const data = await res.json();
                    if (data.success) {
                      setAddLeadOpen(false);
                      setNewLead({ businessName: "", phone: "", email: "", website: "", category: "dental", city: "Seattle, WA" });
                      fetchProspects();
                    } else {
                      alert(data.error || "Failed to add lead");
                    }
                  } catch { alert("Error adding lead"); }
                  finally { setAddingLead(false); }
                }}
                className="flex-1 h-10 rounded-lg bg-green-500 text-white text-sm font-medium disabled:opacity-50 hover:bg-green-600 transition-colors">
                {addingLead ? "Adding..." : "Add & Build Site"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
