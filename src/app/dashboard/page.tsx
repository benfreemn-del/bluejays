"use client";

import { useState, useEffect, useCallback } from "react";
import type { Prospect } from "@/lib/types";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ProspectTable from "@/components/dashboard/ProspectTable";
import ScoutModal from "@/components/dashboard/ScoutModal";
import ProspectDetail from "@/components/dashboard/ProspectDetail";
import MapView from "@/components/dashboard/MapView";

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
              Scripts
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
            <DashboardStats prospects={prospects} />

            {/* View toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setView("table")}
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

      <ProspectDetail
        prospect={selectedProspect}
        onClose={() => setSelectedProspect(null)}
        onSendEmail={handleSendEmail}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
